import { NextFunction, Request, Response } from "express";
import { JwtUtil } from "../utils/jwt";
import { UnauthorizedError } from "../errors/HttpErrors";
import { UserStatus } from "../../types/enums";

export const optionalAuthenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next();
    return;
  }

  if (!authHeader.startsWith("Bearer ")) {
    next(new UnauthorizedError("Invalid authorization header"));
    return;
  }

  try {
    const token = authHeader.slice(7);
    const payload = JwtUtil.verifyAccessToken(token);
    if (payload.type !== "access" || payload.status !== UserStatus.ACTIVE) {
      next(new UnauthorizedError("Invalid token"));
      return;
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      status: payload.status
    };
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
};
