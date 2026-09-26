import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ClipboardList, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({ meta: [{ title: "Applications — SchemeSync AI" }] }),
  component: AppsPage,
});

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  prepared: "bg-primary/15 text-primary",
  submitted: "bg-warning/20 text-warning-foreground",
  under_review: "bg-warning/20 text-warning-foreground",
  approved: "bg-success/20 text-success-foreground",
  rejected: "bg-destructive/15 text-destructive",
};

function AppsPage() {
  const qc = useQueryClient();
  const apps = useQuery({
    queryKey: ["apps"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("applications")
        .select("id, status, progress, updated_at, schemes(name, slug, category)")
        .eq("user_id", u.user!.id).order("updated_at", { ascending: false });
      return data ?? [];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from("applications").delete().eq("id", id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["apps"] }); toast.success("Deleted"); },
  });

  const advance = useMutation({
    mutationFn: async ({ id, status, progress }: { id: string; status: "draft" | "prepared" | "submitted" | "under_review" | "approved" | "rejected"; progress: number }) => {
      await supabase.from("applications").update({ status, progress, submitted_at: status === "submitted" ? new Date().toISOString() : null }).eq("id", id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["apps"] }); toast.success("Updated"); },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">My applications</h1>
      <p className="mt-1 text-muted-foreground">Track drafts, submissions, and approvals</p>

      <div className="mt-8">
        {(apps.data ?? []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card/50">
            <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="mt-3 text-muted-foreground">No applications yet.</p>
            <Link to="/schemes" className="mt-4 inline-flex text-sm text-primary hover:underline">Browse schemes to apply</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(apps.data ?? []).map((a) => {
              const sc = a.schemes as { name: string; slug: string; category: string } | null;
              return (
                <div key={a.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <span className="text-xs uppercase tracking-wider text-primary font-medium">{sc?.category}</span>
                      <h3 className="mt-1 font-semibold">{sc?.name}</h3>
                      <span className={`mt-2 inline-block text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[a.status] ?? ""}`}>
                        {a.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.status === "draft" && (
                        <Button size="sm" variant="outline" onClick={() => advance.mutate({ id: a.id, status: "prepared", progress: 60 })}>Prepare with AI</Button>
                      )}
                      {a.status === "prepared" && (
                        <Button size="sm" className="bg-gradient-primary" onClick={() => advance.mutate({ id: a.id, status: "submitted", progress: 90 })}>Mark submitted</Button>
                      )}
                      {sc && <Button size="sm" variant="ghost" asChild><Link to="/schemes/$slug" params={{ slug: sc.slug }}>View</Link></Button>}
                      <Button size="sm" variant="ghost" onClick={() => del.mutate(a.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <Progress value={a.progress} className="mt-4" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
