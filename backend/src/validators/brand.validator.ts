import { z } from "zod";

export const brandProfileSchema = z.object({
  niche: z.string().trim().min(3).max(120),
  audience: z.string().trim().min(3).max(120),
  expertise: z.string().trim().min(3).max(200),
  tone: z.string().trim().min(3).max(80),
});

export type BrandProfileInput = z.infer<typeof brandProfileSchema>;