import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/jobs/admin/jobs")({
  head: () => ({ meta: [{ title: "Manage Jobs — SchemeSync Jobs Admin" }] }),
  component: AdminJobsPage,
});

function AdminJobsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Postings</h1>
          <p className="mt-1 text-muted-foreground">Review and manage all job postings on the platform</p>
        </div>
        <Button variant="outline">Export Data</Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col items-center justify-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No job postings yet</p>
        </div>
      </div>

      {/* TODO: Add jobs list/table here */}
    </div>
  );
}
