import { Types } from "mongoose";
import { IUser, UserModel } from "./UserModel";
import { UserRole, UserStatus } from "../../types/enums";

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status?: UserStatus;
}

export class UserRepository {
  async count(): Promise<number> {
    return UserModel.countDocuments();
  }

  async create(input: CreateUserInput): Promise<IUser> {
    return UserModel.create(input);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id);
  }

  async list(filter: Record<string, unknown> = {}): Promise<IUser[]> {
    return UserModel.find(filter).sort({ createdAt: -1 });
  }

  async updateById(id: string, update: Partial<IUser>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, update, { new: true });
  }

  async updateRefreshTokenHash(userId: string, refreshTokenHash?: string): Promise<void> {
    if (refreshTokenHash === undefined) {
      await UserModel.updateOne(
        { _id: new Types.ObjectId(userId) },
        { $unset: { refreshTokenHash: 1 } }
      );
      return;
    }

    await UserModel.updateOne({ _id: new Types.ObjectId(userId) }, { $set: { refreshTokenHash } });
  }
}
