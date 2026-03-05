import { Request, Response, NextFunction } from "express";
import * as subscriptionService from "../services/subscription.service";
import { createSubscriptionSchema } from "../validators/subscription.validator";

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

export const createSubscription = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        data: {},
        error: "Unauthorized",
      });
      return;
    }

    const parsed = createSubscriptionSchema.parse(req.body);

    const periodEnd = new Date(parsed.currentPeriodEnd);

    const subscription = await subscriptionService.createSubscriptionRecord(
      userId,
      parsed.plan,
      parsed.interval,
      parsed.razorpaySubscriptionId,
      periodEnd
    );

    res.status(201).json(subscription);
  }
);

export const cancelSubscription = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        data: {},
        error: "Unauthorized",
      });
      return;
    }

    await subscriptionService.cancelSubscription(userId);

    res.status(200).json({
      success: true,
    });
  }
);

export const getSubscriptionStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        data: {},
        error: "Unauthorized",
      });
      return;
    }

    const subscription = await subscriptionService.getActiveSubscription(
      userId
    );

    res.status(200).json(subscription);
  }
);

