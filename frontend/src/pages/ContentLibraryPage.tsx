import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchContentLibrary } from "@/services/api";
import type { ContentItem } from "@/types/gravitas";
import { Copy, CheckCircle } from "lucide-react";

type Filter = "all" | "completed" | "draft";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <CheckCircle size={13} className="text-success" /> : <Copy size={13} />}
    </button>
  );
}

export default function ContentLibraryPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["library"],
    queryFn: fetchContentLibrary,
  });

  const filtered = items.filter((i) => filter === "all" || i.status === filter);

  const modeLabel: Record<ContentItem["mode"], string> = {
    quick_post: "Quick Post",
    repurpose_transcript: "Transcript",
  };

  return (
    <div className="p-8 max-w-5xl animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Content Library</h1>
          <p className="text-sm text-muted-foreground">All generated posts in one place.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 mb-6">
        {(["all", "completed", "draft"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm capitalize transition-colors ${
              filter === f
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} posts</span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-secondary rounded-sm animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="surface rounded-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Content
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                  Date
                </th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr
                  key={item.id}
                  className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${
                    i === filtered.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="px-4 py-3.5 text-sm text-muted-foreground truncate max-w-xs">
                    {item.content}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">
                    {modeLabel[item.mode]}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`status-badge ${
                        item.status === "completed"
                          ? "bg-success/10 text-success"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3.5">
                    <CopyButton text={item.content} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              No posts found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
