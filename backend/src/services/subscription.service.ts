import { prisma } from "../lib/prisma";
import {
  SubscriptionPlan,
  SubscriptionInterval,
  SubscriptionStatus,
  type Subscription,
} from "@prisma/client";
import { grantSubscriptionCredits } from "./credit.service";

const getMonthlyCreditLimitForPlan = (plan: SubscriptionPlan): number => {
  switch (plan) {
    case SubscriptionPlan.BASIC:
      return 30;
    case SubscriptionPlan.PROFESSIONAL:
      return 160;
    case SubscriptionPlan.AUTHORITY:
      return 500;
    default:
      throw new Error("Unknown subscription plan");
  }
};

export const getActiveSubscription = async (
  userId: string
): Promise<Subscription | null> => {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return subscription;
};

export const createSubscriptionRecord = async (
  userId: string,
  plan: SubscriptionPlan,
  interval: SubscriptionInterval,
  razorpaySubscriptionId: string,
  currentPeriodEnd: Date
): Promise<Subscription> => {
  const existing = await getActiveSubscription(userId);
  if (existing) {
    throw new Error("User already has an active subscription");
  }

  const monthlyCreditLimit = getMonthlyCreditLimitForPlan(plan);

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      razorpaySubscriptionId,
      plan,
      interval,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd,
      monthlyCreditLimit,
    },
  });

  return subscription;
};

export const cancelSubscription = async (userId: string): Promise<void> => {
  await prisma.subscription.updateMany({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
    },
    data: {
      status: SubscriptionStatus.CANCELLED,
    },
  });
};

export const grantMonthlySubscriptionCredits = async (
  userId: string
): Promise<void> => {
  const subscription = await getActiveSubscription(userId);

  if (!subscription) {
    return;
  }

  if (subscription.monthlyCreditLimit <= 0) {
    return;
  }

  await grantSubscriptionCredits(userId, subscription.monthlyCreditLimit);
};

export const updateSubscriptionStatus = async (
  razorpaySubscriptionId: string,
  status: SubscriptionStatus,
  currentPeriodEnd?: Date
): Promise<Subscription | null> => {
  const existing = await prisma.subscription.findUnique({
    where: {
      razorpaySubscriptionId,
    },
  });

  if (!existing) {
    return null;
  }

  const updated = await prisma.subscription.update({
    where: {
      razorpaySubscriptionId,
    },
    data: currentPeriodEnd ? { status, currentPeriodEnd } : { status },
  });

  return updated;
};

