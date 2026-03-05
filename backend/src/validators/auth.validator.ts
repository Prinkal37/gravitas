import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email()
  .transform((value) => value.toLowerCase());

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string(),
});