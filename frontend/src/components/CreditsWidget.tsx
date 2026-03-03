import { useQuery } from "@tanstack/react-query";
import { fetchCredits } from "@/services/api";

export function CreditsWidget() {
  const { data: credits } = useQuery({
    queryKey: ["credits"],
    queryFn: fetchCredits,
  });

  const pct = credits ? Math.round((credits.remaining / credits.total) * 100) : 0;
  const resetDate = credits
    ? new Date(credits.resetDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "—";

  return (
    <div className="px-3 py-3 surface rounded-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Credits</span>
        <span className="text-sm font-semibold text-foreground">
          {credits?.remaining ?? "—"}
        </span>
      </div>
      <div className="h-1 bg-secondary rounded-full overflow-hidden mb-1.5">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Next reset: <span className="text-foreground/70">{resetDate}</span>
      </p>
    </div>
  );
}
