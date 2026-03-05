import { prisma } from "../lib/prisma";
import type { BrandProfile } from "@prisma/client";
import type { BrandProfileInput } from "../validators/brand.validator";

export const createBrandProfile = async (
  userId: string,
  data: BrandProfileInput
): Promise<BrandProfile> => {
  const existing = await prisma.brandProfile.findUnique({
    where: { userId },
  });

  if (existing) {
    throw new Error("Brand profile already exists");
  }

  const profile = await prisma.brandProfile.create({
    data: {
      userId,
      niche: data.niche,
      targetAudience: data.audience,
      coreExpertise: data.expertise,
      tone: data.tone,
      offerDetails: "",
    },
  });

  return profile;
};

export const updateBrandProfile = async (
  userId: string,
  data: BrandProfileInput
): Promise<BrandProfile> => {
  const existing = await prisma.brandProfile.findUnique({
    where: { userId },
  });

  if (!existing) {
    throw new Error("Brand profile not found");
  }

  const profile = await prisma.brandProfile.update({
    where: { userId },
    data: {
      niche: data.niche,
      targetAudience: data.audience,
      coreExpertise: data.expertise,
      tone: data.tone,
    },
  });

  return profile;
};

export const getBrandProfile = async (userId: string): Promise<BrandProfile> => {
  const profile = await prisma.brandProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error("Brand profile not found");
  }

  return profile;
};

