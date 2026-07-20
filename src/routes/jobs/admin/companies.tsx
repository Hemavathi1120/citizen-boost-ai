import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/jobs/admin/companies")({
  head: () => ({ meta: [{ title: "Manage Companies — SchemeSync Jobs Admin" }] }),
  component: AdminCompaniesPage,
});

function AdminCompaniesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="mt-1 text-muted-foreground">Manage employer companies and verification</p>
        </div>
        <Button className="bg-gradient-primary">Add Company</Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No companies registered yet</p>
        </div>
      </div>

      {/* TODO: Add company list/table here */}
    </div>
  );
}
