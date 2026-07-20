import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bookmark } from "lucide-react";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({ meta: [{ title: "Saved schemes — SchemeSync AI" }] }),
  component: SavedPage,
});

function SavedPage() {
  const list = useQuery({
    queryKey: ["saved-list"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("saved_schemes")
        .select("id, created_at, schemes(id, slug, name, short_description, category, level)")
        .eq("user_id", u.user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Saved schemes</h1>
      <p className="mt-1 text-muted-foreground">Your shortlist</p>

      <div className="mt-8">
        {(list.data ?? []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card/50">
            <Bookmark className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="mt-3 text-muted-foreground">Nothing saved yet.</p>
            <Link to="/schemes" className="mt-4 inline-flex text-sm text-primary hover:underline">Browse schemes</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(list.data ?? []).map((s) => {
              const sc = s.schemes as { slug: string; name: string; short_description: string | null; category: string; level: string } | null;
              if (!sc) return null;
              return (
                <Link key={s.id} to="/schemes/$slug" params={{ slug: sc.slug }} className="group rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-elegant transition-all">
                  <span className="text-xs uppercase tracking-wider text-primary font-medium">{sc.category}</span>
                  <h3 className="mt-1 font-semibold group-hover:text-primary">{sc.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{sc.short_description}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
