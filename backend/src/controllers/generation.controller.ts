import { Request, Response, NextFunction } from "express";
import { quickPostSchema, repurposeSchema } from "../validators/generation.validator";
import * as generationService from "../services/generation.service";
import { asyncHandler } from "../utils/asyncHandler";

type AuthenticatedRequest = Request & { user: { id: string } };

export const createQuickPost = asyncHandler(
  async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    const body = quickPostSchema.parse(req.body);
    const job = await generationService.createQuickPostJob(
      user.id,
      body.topic,
      body.idea
    );
    res.status(201).json({ jobId: job.id, status: job.status });
  }
);

export const createRepurpose = asyncHandler(
  async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    const body = repurposeSchema.parse(req.body);
    const job = await generationService.createRepurposeJob(
      user.id,
      body.transcript
    );
    res.status(201).json({ jobId: job.id, status: job.status });
  }
);

export const getGenerationJobs = asyncHandler(
  async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    
    const DEFAULT_LIMIT = 20;
    const DEFAULT_OFFSET = 0;
    const MAX_PAGINATION_LIMIT = 50;
    
    const rawLimit = Number(req.query.limit);
    const rawOffset = Number(req.query.offset);
    
    const limit = !Number.isNaN(rawLimit) && rawLimit > 0 && rawLimit <= MAX_PAGINATION_LIMIT 
      ? rawLimit 
      : DEFAULT_LIMIT;
    
    const offset = !Number.isNaN(rawOffset) && rawOffset >= 0 
      ? rawOffset 
      : DEFAULT_OFFSET;
    
    const jobs = await generationService.getUserGenerationJobs(user.id, limit, offset);
    res.status(200).json(jobs);
  }
);

export const getGenerationJobDetail = asyncHandler(
  async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    const { jobId } = req.params;
    const result = await generationService.getJobWithPosts(jobId, user.id);
    if (!result) {
      res.status(404).json({ message: "Job not found" });
      return;
    }
    res.status(200).json(result);
  }
);
