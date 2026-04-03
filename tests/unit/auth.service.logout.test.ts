import { AuthService } from "../../src/modules/auth/AuthService";
import { UserRepository } from "../../src/modules/users/UserRepository";
import { UserService } from "../../src/modules/users/UserService";
import { AuditService } from "../../src/modules/audit/AuditService";

describe("AuthService logout", () => {
  it("clears refresh token hash", async () => {
    const userRepository = {
      count: jest.fn(),
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      updateById: jest.fn(),
      updateRefreshTokenHash: jest.fn().mockResolvedValue(undefined)
    } as unknown as UserRepository;

    const userService = {
      createUser: jest.fn(),
      bootstrapAdmin: jest.fn(),
      listUsers: jest.fn(),
      updateUser: jest.fn()
    } as unknown as UserService;

    const auditService = {
      log: jest.fn().mockResolvedValue(undefined)
    } as unknown as AuditService;

    const authService = new AuthService(userRepository, userService, auditService);

    await authService.logout("69d013db6e5ef5ecb0955640");

    expect(userRepository.updateRefreshTokenHash).toHaveBeenCalledWith(
      "69d013db6e5ef5ecb0955640",
      undefined
    );
  });
});
