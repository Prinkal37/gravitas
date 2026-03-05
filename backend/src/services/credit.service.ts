import { prisma } from "../lib/prisma";
import type { Prisma } from "@prisma/client";
import { CreditLedgerType } from "@prisma/client";

type TransactionClient = Prisma.TransactionClient;

const getAvailableCreditsForClient = async (
  client: TransactionClient,
  userId: string
): Promise<number> => {
  const aggregate = await client.creditLedger.aggregate({
    where: { userId },
    _sum: { amount: true },
  });

  return aggregate._sum.amount ?? 0;
};

const maybeGrantActivationBonusInternal = async (
  client: TransactionClient,
  userId: string
): Promise<void> => {
  const existingActivation = await client.creditLedger.findFirst({
    where: {
      userId,
      type: CreditLedgerType.ACTIVATION_BONUS,
    },
  });

  if (existingActivation) {
    return;
  }

  const signupAggregate = await client.creditLedger.aggregate({
    where: {
      userId,
      type: CreditLedgerType.SIGNUP_BONUS,
    },
    _sum: { amount: true },
  });

  const deductionAggregate = await client.creditLedger.aggregate({
    where: {
      userId,
      type: CreditLedgerType.GENERATION_DEDUCTION,
    },
    _sum: { amount: true },
  });

  const signupTotal = signupAggregate._sum.amount ?? 0;
  const deductionTotal = deductionAggregate._sum.amount ?? 0;

  const consumedSignupCredits =
    signupTotal > 0 && deductionTotal < 0
      ? -deductionTotal >= signupTotal
      : false;

  if (!consumedSignupCredits) {
    return;
  }

  await client.creditLedger.create({
    data: {
      userId,
      amount: 5,
      type: CreditLedgerType.ACTIVATION_BONUS,
      description: "Activation bonus credits",
    },
  });
};

export const getAvailableCredits = async (userId: string): Promise<number> => {
  const aggregate = await prisma.creditLedger.aggregate({
    where: { userId },
    _sum: { amount: true },
  });

  return aggregate._sum.amount ?? 0;
};

export const deductCredits = async (
  userId: string,
  amount: number,
  referenceId?: string
): Promise<void> => {
  if (amount <= 0) {
    throw new Error("Amount to deduct must be positive");
  }

  await prisma.$transaction(async (tx) => {
    const available = await getAvailableCreditsForClient(tx, userId);

    if (available < amount) {
      throw new Error("Insufficient credits");
    }

    await tx.creditLedger.create({
      data: {
        userId,
        amount: -amount,
        type: CreditLedgerType.GENERATION_DEDUCTION,
        description: "Credit deduction for generation job",
        referenceId,
      },
    });

    await maybeGrantActivationBonusInternal(tx, userId);
  });
};

export const refundCredits = async (
  userId: string,
  amount: number,
  referenceId?: string
): Promise<void> => {
  if (amount <= 0) {
    throw new Error("Amount to refund must be positive");
  }

  await prisma.creditLedger.create({
    data: {
      userId,
      amount,
      type: CreditLedgerType.GENERATION_REFUND,
      description: "Refund for failed generation job",
      referenceId,
    },
  });
};

export const grantSignupCredits = async (userId: string): Promise<void> => {
  await prisma.creditLedger.create({
    data: {
      userId,
      amount: 15,
      type: CreditLedgerType.SIGNUP_BONUS,
      description: "Signup bonus credits",
    },
  });
};

export const grantActivationBonus = async (userId: string): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    await maybeGrantActivationBonusInternal(tx, userId);
  });
};

export const grantSubscriptionCredits = async (
  userId: string,
  credits: number
): Promise<void> => {
  if (credits <= 0) {
    throw new Error("Subscription credits must be positive");
  }

  await prisma.creditLedger.create({
    data: {
      userId,
      amount: credits,
      type: CreditLedgerType.SUBSCRIPTION_CREDIT,
      description: "Monthly subscription credits",
    },
  });
};

export const grantExtraCredits = async (
  userId: string,
  credits: number,
  referenceId?: string
): Promise<void> => {
  if (credits <= 0) {
    throw new Error("Extra credits must be positive");
  }

  await prisma.creditLedger.create({
    data: {
      userId,
      amount: credits,
      type: CreditLedgerType.EXTRA_CREDIT_PURCHASE,
      description: "Purchased extra credits",
      referenceId,
    },
  });
};