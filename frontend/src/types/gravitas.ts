// Core domain types for Gravitas

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type Credits = {
  remaining: number;
  total: number;
  resetDate: string;
};

export type BrandProfile = {
  id: string;
  niche: string;
  targetAudience: string;
  coreExpertise: string;
  offerDetails: string;
  tone: "authoritative" | "conversational" | "analytical";
  updatedAt: string;
};

export type GenerationMode = "quick_post" | "repurpose_transcript";

export type GenerationJob = {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  mode: GenerationMode;
  input: string;
  posts?: GeneratedPost[];
  createdAt: string;
};

export type GeneratedPost = {
  id: string;
  content: string;
  characterCount: number;
};

export type ContentItem = {
  id: string;
  content: string;
  status: "draft" | "completed";
  mode: GenerationMode;
  createdAt: string;
};

export type SubscriptionPlan = "starter" | "growth" | "executive";

export type Subscription = {
  plan: SubscriptionPlan;
  status: "active" | "cancelled" | "past_due";
  renewalDate: string;
  monthlyCredits: number;
};

export type PricingTier = {
  id: SubscriptionPlan;
  name: string;
  price: number;
  credits: number;
  features: string[];
};
