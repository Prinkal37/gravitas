import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import * as authService from "../services/auth.service";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

const asyncHandler =
  (fn: AsyncHandler) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = registerSchema.parse(req.body);
  const result = await authService.register(body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse(req.body);
  const result = await authService.login(body);
  res.status(200).json(result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req as Request & { sessionId: string };

  await authService.logout(sessionId);

  res.status(204).send();
});

export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req as Request & { userId: string };

    const user = await authService.getCurrentUser(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        data: {},
        error: "User not found",
      });
      return;
    }

    res.status(200).json(user);
  }
);