import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { startGenerationJob, pollJobStatus } from "@/services/api";
import type { GenerationMode, GeneratedPost, GenerationJob } from "@/types/gravitas";
import { Copy, CheckCircle, Loader2 } from "lucide-react";

const schema = z.object({
  mode: z.enum(["quick_post", "repurpose_transcript"]),
  input: z.string().min(20, "Please provide at least 20 characters of content"),
});

type FormValues = z.infer<typeof schema>;

const MODES: { value: GenerationMode; label: string; desc: string }[] = [
  { value: "quick_post", label: "Quick Authority Post", desc: "Generate a standalone LinkedIn post from a topic or insight" },
  { value: "repurpose_transcript", label: "Repurpose Transcript", desc: "Transform a transcript or long-form content into posts" },
];

function PostCard({ post }: { post: GeneratedPost }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(post.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="surface rounded-sm p-5">
      <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed mb-4">
        {post.content}
      </pre>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">{post.characterCount} characters</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle size={13} className="text-success" /> Copied
            </>
          ) : (
            <>
              <Copy size={13} /> Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  const [jobResult, setJobResult] = useState<GenerationJob | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "polling" | "done" | "error">("idle");

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { mode: "quick_post", input: "" },
  });

  const generate = useCallback(async (data: FormValues) => {
    setStatus("submitting");
    setJobResult(null);
    try {
      const job = await startGenerationJob(data.mode, data.input);
      setStatus("polling");
      const result = await pollJobStatus(job.id);
      setJobResult(result);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }, []);

  const isLoading = status === "submitting" || status === "polling";

  return (
    <div className="p-8 max-w-3xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1">Generate</h1>
        <p className="text-sm text-muted-foreground">
          Create authority-grade LinkedIn posts aligned to your brand profile.
        </p>
      </div>

      <form onSubmit={handleSubmit(generate)} className="space-y-5 mb-8">
        {/* Mode selector */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-3">Generation mode</p>
          <Controller
            name="mode"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-3">
                {MODES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => field.onChange(m.value)}
                    className={`surface rounded-sm p-4 text-left transition-colors ${
                      field.value === m.value ? "border-primary/60 bg-primary/5" : "hover:border-border/80"
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">{m.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        {/* Input */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Content input</label>
          <Controller
            name="input"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={6}
                className="executive-input resize-none"
                placeholder="Enter your topic, insight, or transcript here..."
              />
            )}
          />
          {errors.input && <p className="text-xs text-destructive mt-1">{errors.input.message}</p>}
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              {status === "submitting" ? "Submitting..." : "Generating posts..."}
            </>
          ) : (
            "Generate posts"
          )}
        </button>
      </form>

      {/* Status loader */}
      {isLoading && (
        <div className="surface rounded-sm p-6 flex items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin shrink-0" />
          <div>
            <p className="text-sm font-medium">
              {status === "submitting" ? "Queuing your job..." : "Generating authority posts..."}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">This usually takes 10–20 seconds</p>
          </div>
        </div>
      )}

      {/* Results */}
      {status === "done" && jobResult?.posts && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Generated posts</h2>
            <span className="text-xs text-muted-foreground">{jobResult.posts.length} posts</span>
          </div>
          <div className="space-y-4">
            {jobResult.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="surface rounded-sm p-5 border-destructive/40">
          <p className="text-sm text-destructive">Generation failed. Please try again.</p>
        </div>
      )}
    </div>
  );
}
