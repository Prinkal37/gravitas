import { Request, Response, NextFunction } from "express";
import { handleRazorpayEvent } from "../services/webhook.service";

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

export const handleRazorpayWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const signatureHeader = req.headers["x-razorpay-signature"];
    const signature = Array.isArray(signatureHeader)
      ? signatureHeader[0]
      : signatureHeader;

    await handleRazorpayEvent(
      req.body,
      signature as string | undefined,
      JSON.stringify(req.body)
    );

    res.status(200).json({
      success: true,
    });
  }
);

