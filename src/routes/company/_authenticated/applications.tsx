import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

export const Route = createFileRoute("/company/_authenticated/applications")({
  head: () => ({ meta: [{ title: "Applications — SchemeSync Jobs" }] }),
  component: CompanyApplicationsPage,
});

function CompanyApplicationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
        <p className="mt-1 text-muted-foreground">Review and manage candidate applications</p>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
        <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No applications yet. Post a job to receive applications.</p>
      </div>
    </div>
  );
}
