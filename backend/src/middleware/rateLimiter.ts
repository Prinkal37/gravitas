import { Request, Response, NextFunction } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
});

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const key = req.ip ?? "anonymous";
    await rateLimiter.consume(key);
    next();
  } catch {
    res.status(429).json({
      success: false,
      data: {},
      error: "Too many requests",
    });
  }
};

