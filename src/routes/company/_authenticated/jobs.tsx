import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";

export const Route = createFileRoute("/company/_authenticated/jobs")({
  head: () => ({ meta: [{ title: "Manage Jobs — SchemeSync Jobs" }] }),
  component: CompanyJobsPage,
});

function CompanyJobsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Job Postings</h1>
          <p className="mt-1 text-muted-foreground">Create, edit, and manage job listings</p>
        </div>
        <Button className="bg-gradient-primary">Post New Job</Button>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
        <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No job postings yet. Post your first job to get started!</p>
        <Button size="sm" variant="outline" className="mt-4">
          Post a Job
        </Button>
      </div>
    </div>
  );
}
