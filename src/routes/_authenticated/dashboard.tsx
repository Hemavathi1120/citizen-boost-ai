import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Sparkles, ClipboardList, FileText, Bookmark, Bell, ArrowRight,
  TrendingUp, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { runEligibility } from "@/lib/ai.functions";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SchemeSync AI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const runElig = useServerFn(runEligibility);
  const [running, setRunning] = useState(false);

  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user!.id).maybeSingle();
      return data;
    },
  });

  const stats = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user!.id;
      const [saved, apps, docs, notifs] = await Promise.all([
        supabase.from("saved_schemes").select("id", { count: "exact", head: true }).eq("user_id", uid),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("user_id", uid),
        supabase.from("documents").select("id", { count: "exact", head: true }).eq("user_id", uid),
        supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("read", false),
      ]);
      return {
        saved: saved.count ?? 0,
        applications: apps.count ?? 0,
        documents: docs.count ?? 0,
        unread: notifs.count ?? 0,
      };
    },
  });

  const recentApps = useQuery({
    queryKey: ["recent-apps"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("applications")
        .select("id, status, progress, updated_at, schemes(name, slug, category)")
        .eq("user_id", u.user!.id)
        .order("updated_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const runNow = async () => {
    setRunning(true);
    try {
      const r = await runElig({ data: undefined as never });
      toast.success(`Found ${r.matches.length} matched schemes`);
      profile.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setRunning(false);
    }
  };

  const completion = profile.data ? computeCompletion(profile.data) : 0;
  const hello = getGreeting();
  const first = profile.data?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-muted-foreground">{hello}</p>
        <h1 className="mt-1 text-3xl lg:text-4xl font-bold tracking-tight">Welcome, {first}</h1>
        <p className="mt-2 text-muted-foreground">Here's a snapshot of your benefits journey.</p>
      </motion.div>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-gradient-primary text-primary-foreground p-6 shadow-elegant">
          <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
            <Sparkles className="h-4 w-4" /> Eligibility score
          </div>
          <div className="mt-3 text-5xl font-bold">{profile.data?.eligibility_score ?? 0}</div>
          <p className="text-sm text-primary-foreground/80 mt-1">Based on your current profile</p>
          <Button onClick={runNow} disabled={running} size="sm" className="mt-4 bg-background/20 hover:bg-background/30 text-primary-foreground border border-white/20">
            {running ? "Analyzing..." : "Re-run AI check"}
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <TrendingUp className="h-4 w-4" /> Profile completion
          </div>
          <div className="mt-3 text-5xl font-bold">{completion}%</div>
          <Progress value={completion} className="mt-3" />
          {completion < 100 && (
            <Link to="/profile" className="mt-3 inline-flex text-sm font-medium text-primary hover:underline">
              Complete profile <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
            </Link>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="grid grid-cols-2 gap-4">
            <QuickStat icon={Bookmark} label="Saved" value={stats.data?.saved ?? 0} />
            <QuickStat icon={ClipboardList} label="Applications" value={stats.data?.applications ?? 0} />
            <QuickStat icon={FileText} label="Documents" value={stats.data?.documents ?? 0} />
            <QuickStat icon={Bell} label="Unread" value={stats.data?.unread ?? 0} />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ActionCard to="/eligibility" icon={Sparkles} label="Check eligibility" />
          <ActionCard to="/schemes" icon={ClipboardList} label="Browse schemes" />
          <ActionCard to="/documents" icon={FileText} label="Upload documents" />
          <ActionCard to="/assistant" icon={Users} label="Ask AI assistant" />
        </div>
      </div>

      {/* Recent applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent applications</h2>
          <Link to="/applications" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {(recentApps.data ?? []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <ClipboardList className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="mt-3 text-sm text-muted-foreground">No applications yet.</p>
            <Button asChild size="sm" variant="outline" className="mt-4">
              <Link to="/schemes">Find schemes to apply</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {(recentApps.data ?? []).map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-soft">
                <div>
                  <div className="font-medium">{(a.schemes as { name: string } | null)?.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{a.status.replace("_", " ")}</div>
                </div>
                <div className="w-32"><Progress value={a.progress} /></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickStat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div>
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="mt-1 text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function ActionCard({ to, icon: Icon, label }: { to: "/eligibility" | "/schemes" | "/documents" | "/assistant"; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link to={to} className="group rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-elegant hover:-translate-y-0.5 transition-all">
      <div className="h-10 w-10 rounded-xl bg-gradient-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-gradient-primary group-hover:border-transparent transition-all">
        <Icon className="h-4 w-4 text-primary group-hover:text-primary-foreground" />
      </div>
      <div className="mt-3 font-medium text-sm">{label}</div>
    </Link>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function computeCompletion(p: Record<string, unknown>) {
  const fields = ["full_name", "date_of_birth", "gender", "state", "city", "pincode", "category", "annual_income", "occupation", "education", "marital_status"];
  const filled = fields.filter((f) => p[f] != null && p[f] !== "").length;
  return Math.round((filled / fields.length) * 100);
}
