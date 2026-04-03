import { Schema, model, Document } from "mongoose";
import { UserRole, UserStatus } from "../../types/enums";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  refreshTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.VIEWER,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
      index: true
    },
    refreshTokenHash: { type: String }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

userSchema.index({ role: 1, status: 1 });

export const UserModel = model<IUser>("User", userSchema);
