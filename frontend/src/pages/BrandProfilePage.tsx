import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { fetchBrandProfile, saveBrandProfile } from "@/services/api";
import type { BrandProfile } from "@/types/gravitas";
import { CheckCircle } from "lucide-react";

const schema = z.object({
  niche: z.string().min(3, "Required").max(120),
  targetAudience: z.string().min(3, "Required").max(200),
  coreExpertise: z.string().min(3, "Required").max(200),
  offerDetails: z.string().min(3, "Required").max(300),
  tone: z.enum(["authoritative", "conversational", "analytical"]),
});

type FormValues = z.infer<typeof schema>;

const TONES: { value: FormValues["tone"]; label: string; desc: string }[] = [
  { value: "authoritative", label: "Authoritative", desc: "Direct, confident, expert-led" },
  { value: "conversational", label: "Conversational", desc: "Approachable, clear, relatable" },
  { value: "analytical", label: "Analytical", desc: "Data-driven, structured, precise" },
];

export default function BrandProfilePage() {
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["brand-profile"],
    queryFn: fetchBrandProfile,
  });

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: saveBrandProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brand-profile"] }),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: profile
      ? {
          niche: profile.niche,
          targetAudience: profile.targetAudience,
          coreExpertise: profile.coreExpertise,
          offerDetails: profile.offerDetails,
          tone: profile.tone,
        }
      : undefined,
  });

  const onSubmit = (data: FormValues) => mutate(data as Partial<BrandProfile>);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-5 w-32 bg-secondary rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-secondary rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1">Brand Profile</h1>
        <p className="text-sm text-muted-foreground">
          Define your positioning. Every generated post is aligned to this profile.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="surface rounded-sm p-6 space-y-5">
          {/* Niche */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Niche</label>
            <input {...register("niche")} className="executive-input" placeholder="e.g. B2B SaaS Growth" />
            {errors.niche && <p className="text-xs text-destructive mt-1">{errors.niche.message}</p>}
          </div>

          {/* Target audience */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Target audience</label>
            <input
              {...register("targetAudience")}
              className="executive-input"
              placeholder="e.g. CROs and VP of Sales at Series A–C startups"
            />
            {errors.targetAudience && (
              <p className="text-xs text-destructive mt-1">{errors.targetAudience.message}</p>
            )}
          </div>

          {/* Core expertise */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Core expertise</label>
            <input
              {...register("coreExpertise")}
              className="executive-input"
              placeholder="e.g. Revenue operations, pipeline strategy"
            />
            {errors.coreExpertise && (
              <p className="text-xs text-destructive mt-1">{errors.coreExpertise.message}</p>
            )}
          </div>

          {/* Offer details */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Offer details</label>
            <textarea
              {...register("offerDetails")}
              rows={2}
              className="executive-input resize-none"
              placeholder="e.g. Fractional CRO advisory — 90-day pipeline acceleration"
            />
            {errors.offerDetails && (
              <p className="text-xs text-destructive mt-1">{errors.offerDetails.message}</p>
            )}
          </div>
        </div>

        {/* Tone */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-3">Content tone</p>
          <Controller
            name="tone"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-3 gap-3">
                {TONES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => field.onChange(t.value)}
                    className={`surface rounded-sm p-3.5 text-left transition-colors ${
                      field.value === t.value ? "border-primary/60 bg-primary/5" : "hover:border-border/80"
                    }`}
                  >
                    <p className="text-sm font-medium mb-0.5">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={isPending} className="btn-primary">
            {isPending ? "Saving..." : "Save profile"}
          </button>
          {isSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-success">
              <CheckCircle size={13} /> Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
