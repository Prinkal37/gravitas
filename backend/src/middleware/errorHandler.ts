import { Request, Response, NextFunction } from "express";

interface ApiError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode && err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500;
  const message =
    statusCode === 500 ? "Internal server error" : err.message || "Unexpected error";

  res.status(statusCode).json({
    success: false,
    data: {},
    error: message,
  });
};

