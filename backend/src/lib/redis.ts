import { createClient } from "redis";
import { env } from "./env";

let redisClient: ReturnType<typeof createClient> | null = null;

export const getRedisClient = () => {
  if (redisClient) {
    return redisClient;
  }

  redisClient = createClient({
    socket: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    },
  });

  redisClient.on("error", (err) => {
    // eslint-disable-next-line no-console
    console.error("Redis Client Error", err);
  });

  void redisClient.connect();

  return redisClient;
};

