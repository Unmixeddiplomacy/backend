import { z } from "zod";
import { UserRole, UserStatus } from "../../types/enums";

export const createUserBodySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus).optional()
});

export const updateUserBodySchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    role: z.nativeEnum(UserRole).optional(),
    status: z.nativeEnum(UserStatus).optional()
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field is required"
  });

export const userIdParamSchema = z.object({
  id: z.string().min(24).max(24)
});
