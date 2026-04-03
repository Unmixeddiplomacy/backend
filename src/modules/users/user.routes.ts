import { Router } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { authenticate } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import { validate } from "../../common/middleware/validate";
import { UserRole } from "../../types/enums";
import { UserRepository } from "./UserRepository";
import { UserService } from "./UserService";
import { UserController } from "./UserController";
import { createUserBodySchema, updateUserBodySchema, userIdParamSchema } from "./user.validation";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

export const userRouter = Router();

userRouter.use(authenticate, authorize(UserRole.ADMIN));

userRouter.get("/", asyncHandler(userController.listUsers));
userRouter.post("/", validate({ body: createUserBodySchema }), asyncHandler(userController.createUser));
userRouter.patch(
  "/:id",
  validate({ params: userIdParamSchema, body: updateUserBodySchema }),
  asyncHandler(userController.updateUser)
);
