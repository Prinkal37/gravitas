import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchCredits, fetchContentLibrary } from "@/services/api";
import { ArrowRight, Sparkles, Library, User } from "lucide-react";

export default function DashboardPage() {
  const { data: credits } = useQuery({ queryKey: ["credits"], queryFn: fetchCredits });
  const { data: library } = useQuery({ queryKey: ["library"], queryFn: fetchContentLibrary });

  const recent = library?.slice(0, 3) ?? [];

  return (
    <div className="p-8 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your LinkedIn authority at a glance.</p>
      </div>

      {/* Credits banner */}
      <div className="surface rounded-sm p-5 mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">Credits remaining</p>
          <p className="text-3xl font-bold text-foreground">
            {credits?.remaining ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Next reset:{" "}
            {credits
              ? new Date(credits.resetDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "—"}
          </p>
        </div>
        <div className="w-48">
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{
                width: credits
                  ? `${Math.round((credits.remaining / credits.total) * 100)}%`
                  : "0%",
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 text-right">
            {credits ? `${credits.remaining} / ${credits.total}` : ""}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Generate Post", desc: "Create authority content", to: "/generate", icon: Sparkles },
          { label: "Content Library", desc: "View saved posts", to: "/library", icon: Library },
          { label: "Brand Profile", desc: "Update your positioning", to: "/brand", icon: User },
        ].map(({ label, desc, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="surface rounded-sm p-4 hover:border-primary/40 transition-colors group"
          >
            <Icon size={16} className="text-muted-foreground group-hover:text-primary transition-colors mb-3" strokeWidth={1.75} />
            <p className="text-sm font-medium mb-0.5">{label}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent posts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Recent posts</h2>
          <Link to="/library" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="space-y-2">
          {recent.map((item) => (
            <div key={item.id} className="surface rounded-sm px-4 py-3 flex items-start justify-between gap-4">
              <p className="text-sm text-muted-foreground truncate flex-1">{item.content}</p>
              <span
                className={`status-badge shrink-0 ${
                  item.status === "completed"
                    ? "bg-success/10 text-success"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
