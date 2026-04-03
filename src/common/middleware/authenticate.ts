import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/HttpErrors";
import { JwtUtil } from "../utils/jwt";
import { UserStatus } from "../../types/enums";

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new UnauthorizedError("Missing bearer token"));
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = JwtUtil.verifyAccessToken(token);
    if (payload.type !== "access") {
      next(new UnauthorizedError("Invalid token type"));
      return;
    }
    if (payload.status !== UserStatus.ACTIVE) {
      next(new UnauthorizedError("User is inactive"));
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
