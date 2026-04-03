import { ConflictError, NotFoundError } from "../../common/errors/HttpErrors";
import { PasswordUtil } from "../../common/utils/password";
import { UserRole, UserStatus } from "../../types/enums";
import { CreateUserInput, UserRepository } from "./UserRepository";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    status?: UserStatus;
  }) {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("Email already exists");
    }

    const passwordHash = await PasswordUtil.hash(input.password);
    const createInput: CreateUserInput = {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      status: input.status ?? UserStatus.ACTIVE
    };

    return this.userRepository.create(createInput);
  }

  async bootstrapAdmin(input: { name: string; email: string; password: string }) {
    const userCount = await this.userRepository.count();
    if (userCount > 0) {
      throw new ConflictError("Bootstrap registration disabled after first user is created");
    }
    return this.createUser({ ...input, role: UserRole.ADMIN, status: UserStatus.ACTIVE });
  }

  async listUsers() {
    return this.userRepository.list();
  }

  async updateUser(
    id: string,
    input: { name?: string; role?: UserRole; status?: UserStatus }
  ) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const updated = await this.userRepository.updateById(id, input);
    if (!updated) {
      throw new NotFoundError("User not found");
    }

    return updated;
  }
}
