import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { JwtPayload } from "../../types/auth";

export class JwtUtil {
  static signAccessToken(payload: Omit<JwtPayload, "type">): string {
    return jwt.sign({ ...payload, type: "access" }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"]
    });
  }

  static signRefreshToken(payload: Omit<JwtPayload, "type">): string {
    return jwt.sign({ ...payload, type: "refresh" }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"]
    });
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  }

  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  }
}
