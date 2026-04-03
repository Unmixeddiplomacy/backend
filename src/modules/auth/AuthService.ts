import { ConflictError, UnauthorizedError } from "../../common/errors/HttpErrors";
import { JwtUtil } from "../../common/utils/jwt";
import { PasswordUtil } from "../../common/utils/password";
import { TokenPair } from "../../types/auth";
import { UserRole, UserStatus } from "../../types/enums";
import { AuditService } from "../audit/AuditService";
import { IUser } from "../users/UserModel";
import { UserRepository } from "../users/UserRepository";
import { UserService } from "../users/UserService";

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
    private readonly auditService: AuditService
  ) {}

  private buildTokenPair(user: IUser): TokenPair {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status
    };

    return {
      accessToken: JwtUtil.signAccessToken(payload),
      refreshToken: JwtUtil.signRefreshToken(payload)
    };
  }

  async register(requester: { id: string; role: UserRole } | null, input: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    status?: UserStatus;
  }) {
    const existingCount = await this.userRepository.count();

    if (existingCount > 0) {
      if (!requester || requester.role !== UserRole.ADMIN) {
        throw new UnauthorizedError("Only admins can create users");
      }

      return this.userService.createUser({
        name: input.name,
        email: input.email,
        password: input.password,
        role: input.role ?? UserRole.VIEWER,
        status: input.status
      });
    }

    if (input.role && input.role !== UserRole.ADMIN) {
      throw new ConflictError("First registered user must be admin");
    }

    return this.userService.bootstrapAdmin({
      name: input.name,
      email: input.email,
      password: input.password
    });
  }

  async login(input: { email: string; password: string }, requestId?: string) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isMatch = await PasswordUtil.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError("User is inactive");
    }

    const tokens = this.buildTokenPair(user);
    const refreshTokenHash = await PasswordUtil.hash(tokens.refreshToken);
    await this.userRepository.updateRefreshTokenHash(user._id.toString(), refreshTokenHash);

    await this.auditService.log({
      action: "LOGIN",
      resource: "User",
      resourceId: user._id.toString(),
      actorId: user._id.toString(),
      requestId
    });

    return {
      tokens,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    };
  }

  async refresh(refreshToken: string) {
    const payload = JwtUtil.verifyRefreshToken(refreshToken);
    if (payload.type !== "refresh") {
      throw new UnauthorizedError("Invalid token type");
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const tokenMatches = await PasswordUtil.compare(refreshToken, user.refreshTokenHash);
    if (!tokenMatches) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const tokens = this.buildTokenPair(user);
    const refreshTokenHash = await PasswordUtil.hash(tokens.refreshToken);
    await this.userRepository.updateRefreshTokenHash(user._id.toString(), refreshTokenHash);

    return { tokens };
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.updateRefreshTokenHash(userId, undefined);
  }
}
