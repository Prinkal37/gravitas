import { Request, Response, NextFunction } from "express";
import { brandProfileSchema } from "../validators/brand.validator";
import * as brandService from "../services/brand.service";
import { asyncHandler } from "../utils/asyncHandler";

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

