import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BarChart3, Building2, Briefcase, Users } from "lucide-react";

export const Route = createFileRoute("/jobs/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — SchemeSync Jobs" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const stats = [
    { label: "Total Users", value: 0, icon: Users },
    { label: "Active Companies", value: 0, icon: Building2 },
    { label: "Job Postings", value: 0, icon: Briefcase },
    { label: "Total Applications", value: 0, icon: BarChart3 },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Platform overview and management tools</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <Icon className="h-8 w-8 text-primary/50" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Platform Health */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold mb-4">Platform Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HealthCard label="System Status" status="Operational" />
          <HealthCard label="Database" status="Healthy" />
          <HealthCard label="API Response" status="< 100ms" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-muted-foreground">
          <p>No recent activity to display</p>
        </div>
      </div>
    </div>
  );
}

function HealthCard({ label, status }: { label: string; status: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/50 p-4">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <p className="font-semibold text-green-600">{status}</p>
    </div>
  );
}
