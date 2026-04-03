import bcrypt from "bcryptjs";
import { env } from "../../config/env";

export class PasswordUtil {
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, env.BCRYPT_ROUNDS);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
