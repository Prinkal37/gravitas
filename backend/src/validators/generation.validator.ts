import { z } from "zod";

export const quickPostSchema = z.object({
  topic: z.string().trim().min(3).max(120),
  idea: z.string().trim().min(10).max(500),
});

export const repurposeSchema = z.object({
  transcript: z.string().trim().min(50).max(50000),
});
