import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthService } from "./AuthService";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const user = await this.authService.register(
      req.user ? { id: req.user.id, role: req.user.role } : null,
      req.body
    );

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body, req.requestId);
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.refresh(req.body.refreshToken);
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  };

  me = async (req: Request, res: Response): Promise<void> => {
    res.status(StatusCodes.OK).json({
      success: true,
      data: req.user
    });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    await this.authService.logout(req.user!.id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Logged out successfully"
    });
  };
}
