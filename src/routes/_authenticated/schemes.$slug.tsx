import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getScheme } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bookmark, BookmarkCheck, ExternalLink, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/schemes/$slug")({
  head: () => ({ meta: [{ title: "Scheme details — SchemeSync AI" }] }),
  component: SchemeDetail,
});

function SchemeDetail() {
  const { slug } = useParams({ from: "/_authenticated/schemes/$slug" });
  const get = useServerFn(getScheme);
  const qc = useQueryClient();

  const scheme = useQuery({
    queryKey: ["scheme", slug],
    queryFn: () => get({ data: { slug } }),
  });

  const saved = useQuery({
    queryKey: ["saved", slug],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("saved_schemes").select("id").eq("user_id", u.user!.id).eq("scheme_id", scheme.data!.id).maybeSingle();
      return !!data;
    },
    enabled: !!scheme.data,
  });

  const toggleSave = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user!.id;
      if (saved.data) {
        await supabase.from("saved_schemes").delete().eq("user_id", uid).eq("scheme_id", scheme.data!.id);
      } else {
        await supabase.from("saved_schemes").insert({ user_id: uid, scheme_id: scheme.data!.id });
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["saved", slug] }); qc.invalidateQueries({ queryKey: ["saved-list"] }); toast.success(saved.data ? "Removed" : "Saved"); },
  });

  const startApp = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("applications").insert({
        user_id: u.user!.id, scheme_id: scheme.data!.id, status: "draft", progress: 10,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { toast.success("Application started"); qc.invalidateQueries({ queryKey: ["apps"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (scheme.isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  const s = scheme.data;
  if (!s) return <div className="text-center py-20 text-muted-foreground">Scheme not found</div>;

  const portalUrl = s.application_url?.trim() ?? "";
  const normalizedPortalUrl = portalUrl && !/^https?:\/\//i.test(portalUrl) ? `https://${portalUrl}` : portalUrl;
  const hasPortalUrl = Boolean(normalizedPortalUrl);
  const criteria = (s.eligibility_criteria || {}) as Record<string, unknown>;

  return (
    <div>
      <Link to="/schemes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> All schemes
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-primary">{s.category}</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground uppercase">{s.level}</span>
            </div>
            <h1 className="mt-2 text-3xl lg:text-4xl font-bold tracking-tight">{s.name}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{s.short_description}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-semibold">About this scheme</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-primary/5 p-6 shadow-soft">
            <h2 className="font-semibold text-primary">Benefits</h2>
            <p className="mt-2 text-sm leading-relaxed">{s.benefits}</p>
          </div>

          {Object.keys(criteria).length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-semibold">Eligibility criteria</h2>
              <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {Object.entries(criteria).map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-border bg-muted/30 p-3">
                    <dt className="text-xs text-muted-foreground uppercase tracking-wider">{k.replace(/_/g, " ")}</dt>
                    <dd className="mt-1 font-medium">{Array.isArray(v) ? v.join(", ") : String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft sticky top-6">
            <Button onClick={() => startApp.mutate()} disabled={startApp.isPending} className="w-full bg-gradient-primary shadow-elegant">
              {startApp.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start application"}
            </Button>
            <Button onClick={() => toggleSave.mutate()} disabled={toggleSave.isPending} variant="outline" className="w-full mt-2">
              {saved.data ? <><BookmarkCheck className="h-4 w-4 mr-2" /> Saved</> : <><Bookmark className="h-4 w-4 mr-2" /> Save for later</>}
            </Button>
            {hasPortalUrl ? (
              <a href={normalizedPortalUrl} target="_blank" rel="noreferrer" className="mt-3 w-full inline-flex items-center justify-center gap-1.5 text-sm text-primary hover:underline">
                Official portal <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <div className="mt-3 text-sm text-muted-foreground">Official portal unavailable for this scheme.</div>
            )}

            {(s.required_documents?.length ?? 0) > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Required documents</div>
                <ul className="mt-3 space-y-2 text-sm">
                  {s.required_documents.map((d: string) => (
                    <li key={d} className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-muted-foreground" /> {d.replace(/_/g, " ")}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
