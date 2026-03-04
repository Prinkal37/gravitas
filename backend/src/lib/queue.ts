import { Queue } from "bullmq";
import { getRedisClient } from "./redis";

const connection = () => {
  const client = getRedisClient();
  // BullMQ expects ioredis-style options; redis v4 client is compatible via connection options object.
  return {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  };
};

const generationQueue = new Queue("generation-jobs", {
  connection: connection(),
});

export const enqueueGenerationJob = async (jobId: string) => {
  await generationQueue.add("generate", { jobId });
};

