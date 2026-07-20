import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Briefcase, Users, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/company/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Employer Dashboard — SchemeSync Jobs" }] }),
  component: CompanyDashboard,
});

function CompanyDashboard() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Employer Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Manage your job postings and candidates</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Active Jobs" value={0} icon={Briefcase} />
        <StatCard label="Total Applications" value={0} icon={Users} />
        <StatCard label="Candidates Hired" value={0} icon={TrendingUp} />
        <StatCard label="Jobs Expiring Soon" value={0} icon={Clock} />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard
            to="/company/_authenticated/jobs"
            icon={Briefcase}
            label="Create New Job"
            desc="Post a new job opening"
          />
          <ActionCard
            to="/company/_authenticated/applications"
            icon={Users}
            label="View Applications"
            desc="Review candidate applications"
          />
          <ActionCard
            to="/company/_authenticated/settings"
            icon={TrendingUp}
            label="Company Settings"
            desc="Update company profile"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold mb-4">Recent activity</h2>
        <div className="text-center py-12 text-muted-foreground">
          <p>No recent activity yet. Post your first job to get started!</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <Icon className="h-8 w-8 text-primary/50" />
      </div>
    </div>
  );
}

function ActionCard({
  to,
  icon: Icon,
  label,
  desc,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-elegant hover:border-primary/50 transition-all"
    >
      <Icon className="h-6 w-6 text-primary mb-3" />
      <h3 className="font-semibold mb-1">{label}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}
