import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../errors/AppError";
import { env } from "../../config/env";

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      requestId: req.requestId,
      message: error.message,
      details: error.details
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      requestId: req.requestId,
      message: "Validation failed",
      details: error.errors
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      requestId: req.requestId,
      message: "Invalid identifier"
    });
    return;
  }

  const duplicateKey = error as { code?: number; keyValue?: Record<string, unknown> };
  if (duplicateKey.code === 11000) {
    res.status(StatusCodes.CONFLICT).json({
      success: false,
      requestId: req.requestId,
      message: "Duplicate value",
      details: duplicateKey.keyValue
    });
    return;
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    requestId: req.requestId,
    message: "Internal server error",
    details: env.NODE_ENV === "development" ? String(error) : undefined
  });
};
