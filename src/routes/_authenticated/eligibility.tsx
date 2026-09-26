import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { runEligibility } from "@/lib/ai.functions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, ArrowRight, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/eligibility")({
  head: () => ({ meta: [{ title: "Eligibility Checker — SchemeSync AI" }] }),
  component: Eligibility,
});

type Match = { slug: string; score: number; reason: string; confidence: "low" | "medium" | "high"; scheme: { name: string; category: string; short_description: string | null } };

function Eligibility() {
  const run = useServerFn(runEligibility);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ matches: Match[]; score: number } | null>(null);

  const doRun = async () => {
    setLoading(true);
    try {
      const r = await run({ data: undefined as never });
      setResult(r as { matches: Match[]; score: number });
      toast.success(`Analyzed ${r.matches.length} matches`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Eligibility Checker</h1>
          <p className="text-muted-foreground text-sm">Gemini analyzes your profile against every scheme.</p>
        </div>
      </div>

      {!result && (
        <div className="mt-10 rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
          <Zap className="h-10 w-10 mx-auto text-saffron" />
          <h2 className="mt-4 text-xl font-semibold">Ready when you are</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            The more complete your profile, the sharper the match. Fill in income, category, and occupation for best results.
          </p>
          <Button onClick={doRun} disabled={loading} size="lg" className="mt-6 bg-gradient-primary shadow-elegant">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing your profile...</> : <>Run eligibility check <ArrowRight className="h-4 w-4 ml-1.5" /></>}
          </Button>
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl bg-gradient-primary text-primary-foreground p-6 shadow-elegant">
            <div className="text-sm text-primary-foreground/80">Overall eligibility score</div>
            <div className="mt-2 text-6xl font-bold">{result.score}</div>
            <div className="mt-1 text-sm text-primary-foreground/80">{result.matches.length} schemes matched</div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your top matches</h2>
            <Button onClick={doRun} disabled={loading} variant="outline" size="sm">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Re-run"}
            </Button>
          </div>

          <div className="grid gap-3">
            {result.matches.map((m) => (
              <Link
                key={m.slug}
                to="/schemes/$slug"
                params={{ slug: m.slug }}
                className="group rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-elegant hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider text-primary font-medium">{m.scheme.category}</span>
                      <ConfidenceBadge c={m.confidence} />
                    </div>
                    <h3 className="mt-1 font-semibold group-hover:text-primary transition-colors">{m.scheme.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{m.reason}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-3xl font-bold text-gradient">{m.score}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">match</div>
                  </div>
                </div>
                <Progress value={m.score} className="mt-3" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ConfidenceBadge({ c }: { c: "low" | "medium" | "high" }) {
  const map = { low: "bg-muted text-muted-foreground", medium: "bg-warning/20 text-warning-foreground", high: "bg-success/20 text-success-foreground" } as const;
  return <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${map[c]}`}>{c}</span>;
}
