import { Request, Response, NextFunction } from "express";
import { brandProfileSchema } from "../validators/brand.validator";
import * as brandService from "../services/brand.service";

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

type AuthenticatedRequest = Request & { user: { id: string } };

export const createBrandProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    const body = brandProfileSchema.parse(req.body);
    const profile = await brandService.createBrandProfile(user.id, body);
    res.status(201).json(profile);
  }
);

export const updateBrandProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    const body = brandProfileSchema.parse(req.body);
    const profile = await brandService.updateBrandProfile(user.id, body);
    res.status(200).json(profile);
  }
);

export const getBrandProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    const profile = await brandService.getBrandProfile(user.id);
    res.status(200).json(profile);
  }
);

