// Mock API service — replace with real apiClient calls in production
import type {
  Credits,
  BrandProfile,
  GenerationJob,
  ContentItem,
  Subscription,
  PricingTier,
  GenerationMode,
} from "@/types/gravitas";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Credits ────────────────────────────────────────────────────────────────
export async function fetchCredits(): Promise<Credits> {
  await delay(400);
  return {
    remaining: 148,
    total: 200,
    resetDate: "2025-04-01",
  };
}

// ── Brand Profile ──────────────────────────────────────────────────────────
export async function fetchBrandProfile(): Promise<BrandProfile> {
  await delay(500);
  return {
    id: "bp_1",
    niche: "B2B SaaS Growth",
    targetAudience: "CROs and VP of Sales at Series A–C startups",
    coreExpertise: "Revenue operations, pipeline strategy, outbound systems",
    offerDetails: "Fractional CRO advisory — 90-day pipeline acceleration",
    tone: "authoritative",
    updatedAt: new Date().toISOString(),
  };
}

export async function saveBrandProfile(data: Partial<BrandProfile>): Promise<BrandProfile> {
  await delay(800);
  return {
    id: "bp_1",
    niche: data.niche ?? "",
    targetAudience: data.targetAudience ?? "",
    coreExpertise: data.coreExpertise ?? "",
    offerDetails: data.offerDetails ?? "",
    tone: data.tone ?? "authoritative",
    updatedAt: new Date().toISOString(),
  };
}

// ── Content Generation ─────────────────────────────────────────────────────
export async function startGenerationJob(
  mode: GenerationMode,
  input: string
): Promise<GenerationJob> {
  await delay(600);
  return {
    id: `job_${Date.now()}`,
    status: "pending",
    mode,
    input,
    createdAt: new Date().toISOString(),
  };
}

export async function pollJobStatus(jobId: string): Promise<GenerationJob> {
  await delay(1200);
  return {
    id: jobId,
    status: "completed",
    mode: "quick_post",
    input: "",
    posts: [
      {
        id: "p1",
        content:
          "Most sales teams don't have a pipeline problem.\n\nThey have a prioritization problem.\n\nThe deals are there. The bandwidth isn't.\n\nWhen you install a proper revenue operating cadence, you stop working every deal equally — and start working the right deals intensively.\n\nResult: Same team. 40% more closed revenue.\n\nThe system matters more than the hustle.",
        characterCount: 380,
      },
      {
        id: "p2",
        content:
          "The fastest path to $10M ARR is not more leads.\n\nIt's shortening your sales cycle by 30%.\n\nHere's what that actually requires:\n→ Tighter ICP definition\n→ Champion mapping inside accounts\n→ Multi-thread from day one\n→ Clear economic buyer access\n\nMost teams skip all four. Then wonder why deals stall in late stage.",
        characterCount: 310,
      },
    ],
    createdAt: new Date().toISOString(),
  };
}

// ── Content Library ────────────────────────────────────────────────────────
export async function fetchContentLibrary(): Promise<ContentItem[]> {
  await delay(500);
  return [
    {
      id: "c1",
      content: "Most sales teams don't have a pipeline problem. They have a prioritization problem...",
      status: "completed",
      mode: "quick_post",
      createdAt: "2025-03-15T10:00:00Z",
    },
    {
      id: "c2",
      content: "The fastest path to $10M ARR is not more leads. It's shortening your sales cycle...",
      status: "completed",
      mode: "quick_post",
      createdAt: "2025-03-14T14:30:00Z",
    },
    {
      id: "c3",
      content: "Draft: Three things I learned from running outbound for 12 months straight...",
      status: "draft",
      mode: "repurpose_transcript",
      createdAt: "2025-03-13T09:15:00Z",
    },
    {
      id: "c4",
      content: "Revenue operations is not a department. It's a philosophy...",
      status: "completed",
      mode: "quick_post",
      createdAt: "2025-03-12T16:00:00Z",
    },
    {
      id: "c5",
      content: "Draft: The one hiring mistake that cost us 6 months of pipeline...",
      status: "draft",
      mode: "repurpose_transcript",
      createdAt: "2025-03-11T11:00:00Z",
    },
  ];
}

// ── Billing ────────────────────────────────────────────────────────────────
export async function fetchSubscription(): Promise<Subscription> {
  await delay(400);
  return {
    plan: "growth",
    status: "active",
    renewalDate: "2025-04-01",
    monthlyCredits: 200,
  };
}

export async function buyExtraCredits(amount: number): Promise<{ success: boolean }> {
  await delay(800);
  console.log("Buy credits:", amount);
  return { success: true };
}

// ── Pricing Tiers ──────────────────────────────────────────────────────────
export const PRICING_TIERS: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    credits: 60,
    features: ["60 posts/month", "Quick Authority Posts", "Content Library", "Email support"],
  },
  {
    id: "growth",
    name: "Growth",
    price: 99,
    credits: 200,
    features: [
      "200 posts/month",
      "Quick Authority Posts",
      "Repurpose Transcripts",
      "Content Library",
      "Brand Profile",
      "Priority support",
    ],
  },
  {
    id: "executive",
    name: "Executive",
    price: 249,
    credits: 600,
    features: [
      "600 posts/month",
      "All generation modes",
      "Content Library",
      "Brand Profile",
      "API access",
      "Dedicated support",
    ],
  },
];
