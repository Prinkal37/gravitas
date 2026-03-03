import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchSubscription, fetchCredits, buyExtraCredits, PRICING_TIERS } from "@/services/api";
import { CheckCircle, Loader2 } from "lucide-react";

const CREDIT_PACKS = [
  { credits: 50, price: 19 },
  { credits: 150, price: 49 },
  { credits: 500, price: 149 },
];

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  executive: "Executive",
};

const STATUS_STYLE: Record<string, string> = {
  active: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
  past_due: "bg-yellow-500/10 text-yellow-400",
};

export default function BillingPage() {
  const [buying, setBuying] = useState<number | null>(null);

  const { data: sub, isLoading: subLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubscription,
  });
  const { data: credits } = useQuery({ queryKey: ["credits"], queryFn: fetchCredits });

  const { mutate } = useMutation({
    mutationFn: (amount: number) => buyExtraCredits(amount),
    onMutate: (amount) => setBuying(amount),
    onSettled: () => setBuying(null),
  });

  const currentTier = PRICING_TIERS.find((t) => t.id === sub?.plan);

  return (
    <div className="p-8 max-w-2xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your plan and credits.</p>
      </div>

      {/* Current plan */}
      <div className="surface rounded-sm p-6 mb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-4">
          Current plan
        </p>
        {subLoading ? (
          <div className="space-y-2">
            <div className="h-5 w-24 bg-secondary rounded animate-pulse" />
            <div className="h-4 w-40 bg-secondary rounded animate-pulse" />
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h2 className="text-lg font-semibold">
                  {sub ? PLAN_LABELS[sub.plan] : "—"}
                </h2>
                {sub && (
                  <span className={`status-badge ${STATUS_STYLE[sub.status] ?? ""}`}>
                    {sub.status}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {currentTier ? `$${currentTier.price}/month` : ""} ·{" "}
                {sub ? `${sub.monthlyCredits} credits/month` : ""}
              </p>
              {sub && (
                <p className="text-xs text-muted-foreground mt-1">
                  Renews{" "}
                  {new Date(sub.renewalDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
            <button className="btn-outline text-xs">Manage plan</button>
          </div>
        )}

        {currentTier && (
          <ul className="mt-5 pt-5 border-t border-border grid grid-cols-2 gap-2">
            {currentTier.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle size={12} className="text-success shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Credits */}
      <div className="surface rounded-sm p-6 mb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-4">
          Credits
        </p>
        <div className="flex items-center gap-4 mb-3">
          <span className="text-3xl font-bold">{credits?.remaining ?? "—"}</span>
          <span className="text-sm text-muted-foreground">remaining this month</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{
              width: credits
                ? `${Math.round((credits.remaining / credits.total) * 100)}%`
                : "0%",
            }}
          />
        </div>
      </div>

      {/* Buy extra credits */}
      <div className="surface rounded-sm p-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
          Buy extra credits
        </p>
        <p className="text-xs text-muted-foreground mb-5">
          One-time purchase. Credits added immediately.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {CREDIT_PACKS.map(({ credits: c, price }) => (
            <button
              key={c}
              onClick={() => mutate(c)}
              disabled={buying !== null}
              className="surface-elevated rounded-sm p-4 text-left hover:border-primary/40 transition-colors"
            >
              <p className="text-base font-semibold mb-0.5">{c} credits</p>
              <p className="text-sm text-muted-foreground">${price}</p>
              {buying === c && (
                <Loader2 size={12} className="animate-spin text-primary mt-2" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
