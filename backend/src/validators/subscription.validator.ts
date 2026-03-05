import { z } from "zod";
import { SubscriptionPlan, SubscriptionInterval } from "@prisma/client";

export const createSubscriptionSchema = z.object({
  plan: z.nativeEnum(SubscriptionPlan),
  interval: z.nativeEnum(SubscriptionInterval),
  razorpaySubscriptionId: z.string().trim().min(1),
  currentPeriodEnd: z
    .string()
    .trim()
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Invalid date format for currentPeriodEnd",
    }),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;

