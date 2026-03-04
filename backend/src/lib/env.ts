import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  RAZORPAY_KEY_ID: z.string(),
  RAZORPAY_KEY_SECRET: z.string(),
  RAZORPAY_WEBHOOK_SECRET: z.string(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export const validateEnv = (): Env => {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // Do not leak full details in production logs
    // eslint-disable-next-line no-console
    console.error("Invalid environment configuration");
    // For debugging locally, you may temporarily log parsed.error.format()
    throw new Error("Invalid environment configuration");
  }

  cachedEnv = parsed.data;
  return cachedEnv;
};

export const env = validateEnv();

