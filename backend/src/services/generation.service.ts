import { prisma } from "../lib/prisma";
import {
  ContentInputType,
  GenerationJobStatus,
  PostStructureType,
  CreditLedgerType,
  type Prisma,
  type ContentInput,
  type GenerationJob,
} from "@prisma/client";
import { enqueueGenerationJob } from "../lib/queue";

const QUICK_POST_CREDIT_COST = 1;
const REPURPOSE_CREDIT_COST = 5;

const MAX_PAGINATION_LIMIT = 50;

const getAvailableCreditsForClient = async (
  client: Prisma.TransactionClient,
  userId: string
): Promise<number> => {
  const aggregate = await client.creditLedger.aggregate({
    where: { userId },
    _sum: { amount: true },
  });

  return aggregate._sum.amount ?? 0;
};

const deductCreditsInTransaction = async (
  client: Prisma.TransactionClient,
  userId: string,
  amount: number,
  referenceId?: string
): Promise<void> => {
  if (amount <= 0) {
    throw new Error("Amount to deduct must be positive");
  }

  const available = await getAvailableCreditsForClient(client, userId);

  if (available < amount) {
    throw new Error("Insufficient credits");
  }

  await client.creditLedger.create({
    data: {
      userId,
      amount: -amount,
      type: CreditLedgerType.GENERATION_DEDUCTION,
      description: "Credit deduction for generation job",
      referenceId,
    },
  });
};

const refundCreditsInTransaction = async (
  client: Prisma.TransactionClient,
  userId: string,
  amount: number,
  referenceId?: string
): Promise<void> => {
  if (amount <= 0) {
    throw new Error("Amount to refund must be positive");
  }

  await client.creditLedger.create({
    data: {
      userId,
      amount,
      type: CreditLedgerType.GENERATION_REFUND,
      description: "Refund for failed generation job",
      referenceId,
    },
  });
};

export const createQuickPostJob = async (
  userId: string,
  topic: string,
  idea: string
): Promise<GenerationJob> => {
  const job = await prisma.$transaction(async (tx) => {
    const contentInput = await tx.contentInput.create({
      data: {
        userId,
        type: ContentInputType.QUICK,
        topic,
        idea,
      },
    });

    const createdJob = await tx.generationJob.create({
      data: {
        userId,
        contentInputId: contentInput.id,
        status: GenerationJobStatus.PENDING,
        creditsConsumed: QUICK_POST_CREDIT_COST,
      },
    });

    await deductCreditsInTransaction(tx, userId, QUICK_POST_CREDIT_COST, createdJob.id);

    return createdJob;
  });

  try {
    await enqueueGenerationJob(job.id);
  } catch (error) {
    await prisma.$transaction(async (tx) => {
      await refundCreditsInTransaction(tx, userId, QUICK_POST_CREDIT_COST, job.id);
      await tx.generationJob.update({
        where: { id: job.id },
        data: {
          status: GenerationJobStatus.FAILED,
          failedAt: new Date(),
          errorMessage: "Failed to enqueue job",
        },
      });
    });
    throw error;
  }

  return job;
};

export const createRepurposeJob = async (
  userId: string,
  transcript: string
): Promise<GenerationJob> => {
  const job = await prisma.$transaction(async (tx) => {
    const contentInput = await tx.contentInput.create({
      data: {
        userId,
        type: ContentInputType.REPURPOSE,
        transcript,
      },
    });

    const createdJob = await tx.generationJob.create({
      data: {
        userId,
        contentInputId: contentInput.id,
        status: GenerationJobStatus.PENDING,
        creditsConsumed: REPURPOSE_CREDIT_COST,
      },
    });

    await deductCreditsInTransaction(tx, userId, REPURPOSE_CREDIT_COST, createdJob.id);

    return createdJob;
  });

  try {
    await enqueueGenerationJob(job.id);
  } catch (error) {
    await prisma.$transaction(async (tx) => {
      await refundCreditsInTransaction(tx, userId, REPURPOSE_CREDIT_COST, job.id);
      await tx.generationJob.update({
        where: { id: job.id },
        data: {
          status: GenerationJobStatus.FAILED,
          failedAt: new Date(),
          errorMessage: "Failed to enqueue job",
        },
      });
    });
    throw error;
  }

  return job;
};

export const getUserGenerationJobs = async (
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<GenerationJob[]> => {
  const cappedLimit = Math.min(limit, MAX_PAGINATION_LIMIT);

  const jobs = await prisma.generationJob.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: cappedLimit,
    skip: offset,
  });

  return jobs;
};

export const getJobWithPosts = async (
  jobId: string,
  userId: string
): Promise<{ job: GenerationJob; posts: { id: string; content: string; structureType: string; orderIndex: number; createdAt: Date }[]; contentInput: ContentInput } | null> => {
  const job = await prisma.generationJob.findFirst({
    where: {
      id: jobId,
      userId,
    },
    include: {
      generatedPosts: {
        orderBy: {
          orderIndex: "asc",
        },
        select: {
          id: true,
          content: true,
          structureType: true,
          orderIndex: true,
          createdAt: true,
        },
      },
      contentInput: true,
    },
  });

  if (!job) {
    return null;
  }

  const { generatedPosts, contentInput, ...jobData } = job;

  return {
    job: jobData,
    posts: generatedPosts,
    contentInput,
  };
};

export const handleJobFailure = async (
  jobId: string,
  errorMessage: string
): Promise<void> => {
  const job = await prisma.generationJob.findUnique({
    where: {
      id: jobId,
    },
  });

  if (!job) {
    return;
  }

  if (job.status === GenerationJobStatus.FAILED) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const existingRefund = await tx.creditLedger.findFirst({
      where: {
        type: CreditLedgerType.GENERATION_REFUND,
        referenceId: jobId,
      },
    });

    if (existingRefund) {
      await tx.generationJob.update({
        where: { id: jobId },
        data: {
          status: GenerationJobStatus.FAILED,
          failedAt: new Date(),
          errorMessage,
        },
      });
      return;
    }

    await tx.generationJob.update({
      where: {
        id: jobId,
      },
      data: {
        status: GenerationJobStatus.FAILED,
        failedAt: new Date(),
        errorMessage,
      },
    });

    await refundCreditsInTransaction(tx, job.userId, job.creditsConsumed, jobId);
  });
};

export const handleJobCompletion = async (
  jobId: string,
  posts: { content: string; structureType: string; orderIndex: number }[]
): Promise<void> => {
  const job = await prisma.generationJob.findUnique({
    where: {
      id: jobId,
    },
  });

  if (!job) {
    throw new Error("Generation job not found");
  }

  if (job.status === GenerationJobStatus.COMPLETED) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.generationJob.update({
      where: {
        id: jobId,
      },
      data: {
        status: GenerationJobStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    await tx.generatedPost.createMany({
      data: posts.map((post) => ({
        jobId,
        content: post.content,
        structureType: post.structureType as PostStructureType,
        orderIndex: post.orderIndex,
      })),
    });
  });
};

export const handleJobProcessing = async (jobId: string): Promise<void> => {
  const job = await prisma.generationJob.findUnique({
    where: {
      id: jobId,
    },
  });

  if (!job) {
    throw new Error("Generation job not found");
  }

  if (job.status !== GenerationJobStatus.PENDING) {
    return;
  }

  await prisma.generationJob.update({
    where: {
      id: jobId,
    },
    data: {
      status: GenerationJobStatus.PROCESSING,
      startedAt: new Date(),
    },
  });
};
