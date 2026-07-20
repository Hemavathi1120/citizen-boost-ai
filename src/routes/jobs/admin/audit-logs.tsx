import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/jobs/admin/audit-logs")({
  head: () => ({ meta: [{ title: "Audit Logs — SchemeSync Jobs Admin" }] }),
  component: AdminAuditLogsPage,
});

function AdminAuditLogsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="mt-1 text-muted-foreground">System activity and platform monitoring</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No audit logs yet</p>
        </div>
      </div>

      {/* TODO: Add audit logs table here */}
    </div>
  );
}
