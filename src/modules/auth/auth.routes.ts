import { Router } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { authenticate } from "../../common/middleware/authenticate";
import { optionalAuthenticate } from "../../common/middleware/optionalAuthenticate";
import { validate } from "../../common/middleware/validate";
import { AuthController } from "./AuthController";
import { AuthService } from "./AuthService";
import { loginBodySchema, refreshBodySchema, registerBodySchema } from "./auth.validation";
import { UserRepository } from "../users/UserRepository";
import { UserService } from "../users/UserService";
import { AuditService } from "../audit/AuditService";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const auditService = new AuditService();
const authService = new AuthService(userRepository, userService, auditService);
const authController = new AuthController(authService);

export const authRouter = Router();

authRouter.post(
	"/register",
	optionalAuthenticate,
	validate({ body: registerBodySchema }),
	asyncHandler(authController.register)
);
authRouter.post("/login", validate({ body: loginBodySchema }), asyncHandler(authController.login));
authRouter.post("/refresh", validate({ body: refreshBodySchema }), asyncHandler(authController.refresh));
authRouter.get("/me", authenticate, asyncHandler(authController.me));
authRouter.post("/logout", authenticate, asyncHandler(authController.logout));
