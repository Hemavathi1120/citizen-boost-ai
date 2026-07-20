import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles, Briefcase, BookmarkCheck, TrendingUp, User,
  ArrowRight, MessageSquare, Clock, Target, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEffect, useMemo, useState } from "react";
import {
  calculateProfileCompletion,
  createResumeDraft,
  getLiveOpportunityFeed,
  getRecommendedJobs,
  PORTAL_STORAGE_KEYS,
  readPortalState,
  seedJobs,
  type PortalApplication,
  type PortalJob,
} from "@/lib/jobs/portal-data";

export const Route = createFileRoute("/jobs/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Jobs Dashboard — SchemeSync AI" }] }),
  component: JobsDashboard,
});

function JobsDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ saved: 0, applications: 0, interviews: 0 });

  useEffect(() => {
    const storedProfile = readPortalState(PORTAL_STORAGE_KEYS.profile, null);
    setProfile(storedProfile);
    const savedIds = readPortalState<string[]>(PORTAL_STORAGE_KEYS.savedJobs, []);
    const applications = readPortalState<PortalApplication[]>(PORTAL_STORAGE_KEYS.applications, []);
    setStats({
      saved: savedIds.length,
      applications: applications.length,
      interviews: Math.max(0, Math.min(2, applications.length - 1)),
    });
  }, []);

  const completion = useMemo(() => calculateProfileCompletion(profile), [profile]);
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";
  const resumeDraft = useMemo(() => createResumeDraft(profile), [profile]);
  const recommendations = useMemo(() => {
    const savedIds = readPortalState<string[]>(PORTAL_STORAGE_KEYS.savedJobs, []);
    const applications = readPortalState<PortalApplication[]>(PORTAL_STORAGE_KEYS.applications, []);
    return getRecommendedJobs(profile, seedJobs, savedIds, applications.map((app) => app.job_id));
  }, [profile]);
  const liveFeed = useMemo(() => getLiveOpportunityFeed(profile), [profile]);
  const aiMatchScore = Math.max(60, Math.min(96, resumeDraft.atsScore));

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="mt-1 text-3xl lg:text-4xl font-bold tracking-tight">
          Hey, {firstName}! 👋
        </h1>
        <p className="mt-2 text-muted-foreground">Here's your job hunting dashboard.</p>
      </motion.div>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-gradient-primary text-primary-foreground p-6 shadow-elegant">
          <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
            <Sparkles className="h-4 w-4" /> AI Match Score
          </div>
          <div className="mt-3 text-5xl font-bold">{aiMatchScore}%</div>
          <p className="text-sm text-primary-foreground/80 mt-1">Based on your profile</p>
          <Button
            asChild
            size="sm"
            className="mt-4 bg-background/20 hover:bg-background/30 text-primary-foreground border border-white/20"
          >
            <Link to="/jobs/profile">Improve profile</Link>
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <TrendingUp className="h-4 w-4" /> Profile Completion
          </div>
          <div className="mt-3 text-5xl font-bold">{completion}%</div>
          <Progress value={completion} className="mt-3" />
          {completion < 100 && (
            <Link
              to="/jobs/profile"
              className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
            >
              Complete profile <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
            </Link>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="grid grid-cols-2 gap-4">
            <QuickStat icon={BookmarkCheck} label="Saved" value={stats.saved} />
            <QuickStat icon={Briefcase} label="Applied" value={stats.applications} />
            <QuickStat icon={Clock} label="Interviews" value={stats.interviews} />
            <QuickStat icon={Target} label="Goals" value={0} />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ActionCard to="/jobs/search" icon={Briefcase} label="Find jobs" />
          <ActionCard to="/jobs/resume" icon={MessageSquare} label="Build resume" />
          <ActionCard to="/jobs/profile" icon={User} label="Your profile" />
          <ActionCard to="/jobs/applications" icon={CheckCircle2} label="Applications" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recommended for you</h2>
          <Link to="/jobs/search" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {recommendations.slice(0, 3).map((job) => (
            <div key={job.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{job.title}</p>
                  <p className="text-sm text-muted-foreground">{job.company_name}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{Math.round(60 + Math.random() * 20)}% match</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{job.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Live opportunity feed</h2>
        <div className="space-y-3">
          {liveFeed.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function ActionCard({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-border bg-card p-4 shadow-soft hover:shadow-elegant hover:border-primary/50 transition-all text-center"
    >
      <Icon className="h-5 w-5 mx-auto text-primary mb-2" />
      <div className="text-sm font-medium">{label}</div>
    </Link>
  );
}
