import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UserService } from "./UserService";

export class UserController {
  constructor(private readonly userService: UserService) {}

  createUser = async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.createUser(req.body);

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }
    });
  };

  listUsers = async (_req: Request, res: Response): Promise<void> => {
    const users = await this.userService.listUsers();

    res.status(StatusCodes.OK).json({
      success: true,
      data: users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    });
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.updateUser(String(req.params.id), req.body);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        updatedAt: user.updatedAt
      }
    });
  };
}
