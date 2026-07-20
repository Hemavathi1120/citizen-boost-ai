import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Briefcase, Calendar, CheckCircle2, Clock, XCircle, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { PORTAL_STORAGE_KEYS, readPortalState, writePortalState, type PortalApplication } from "@/lib/jobs/portal-data";

export const Route = createFileRoute("/jobs/_authenticated/applications")({
  head: () => ({ meta: [{ title: "Applications — SchemeSync Jobs" }] }),
  component: ApplicationsPage,
});

type Application = {
  id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  status: "draft" | "submitted" | "reviewed" | "interview" | "offer" | "rejected";
  compatibility_score: number;
  applied_at: string;
  updated_at: string;
};

const STATUS_CONFIG = {
  draft: { icon: AlertCircle, color: "text-warning", bg: "bg-warning/10", label: "Draft" },
  submitted: { icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10", label: "Submitted" },
  reviewed: { icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10", label: "Under Review" },
  interview: { icon: Calendar, color: "text-primary", bg: "bg-primary/10", label: "Interview" },
  offer: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Offer" },
  rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Rejected" },
};

function ApplicationsPage() {
  const [applications, setApplications] = useState<PortalApplication[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setApplications(readPortalState<PortalApplication[]>(PORTAL_STORAGE_KEYS.applications, []));
  }, []);

  const continueDraft = (application: PortalApplication) => {
    writePortalState(PORTAL_STORAGE_KEYS.applicationContext, {
      jobId: application.job_id,
      targetRole: application.job_title,
      targetCompany: application.company_name,
      jobDescription: application.job_description ?? "",
      jobRequirements: application.job_requirements ?? "",
    });
    navigate({ to: "/jobs/resume" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Applications</h1>
        <p className="mt-2 text-muted-foreground">
          Track the status of all your job applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Applications" value={applications.length} />
        <StatCard
          label="In Progress"
          value={applications.filter((a) => ["submitted", "reviewed", "interview"].includes(a.status)).length}
        />
        <StatCard
          label="Interviews"
          value={applications.filter((a) => a.status === "interview").length}
        />
        <StatCard
          label="Offers"
          value={applications.filter((a) => a.status === "offer").length}
        />
      </div>

      {/* Applications list */}
      <div className="space-y-3">
        {applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center"
          >
            <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No applications yet.</p>
            <Button asChild size="sm" variant="outline" className="mt-4">
              <Link to="/jobs/search">Browse jobs</Link>
            </Button>
          </motion.div>
        ) : (
          applications.map((app) => {
            const config = STATUS_CONFIG[app.status];
            const Icon = config.icon;

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-elegant transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{app.job_title}</h3>
                      <div className={`${config.bg} p-1.5 rounded-full`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{app.company_name}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="font-semibold text-foreground">{app.compatibility_score}%</span>
                        match score
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Applied {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${config.bg}`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                      <span className={config.color}>{config.label}</span>
                    </div>
                  </div>
                </div>

                {app.status === "draft" && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button size="sm" className="bg-gradient-primary" onClick={() => continueDraft(app)}>
                      Continue Application
                    </Button>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
