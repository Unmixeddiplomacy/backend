import { z } from "zod";
import { UserRole, UserStatus } from "../../types/enums";

export const registerBodySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional()
});

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(10)
});
