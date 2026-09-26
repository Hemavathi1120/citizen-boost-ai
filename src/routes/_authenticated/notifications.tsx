import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — SchemeSync AI" }] }),
  component: NotifPage,
});

function NotifPage() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["notifs"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("notifications").select("*").eq("user_id", u.user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const markAll = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      await supabase.from("notifications").update({ read: true }).eq("user_id", u.user!.id).eq("read", false);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifs"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <Button size="sm" variant="outline" onClick={() => markAll.mutate()}><Check className="h-4 w-4 mr-1.5" /> Mark all read</Button>
      </div>

      <div className="mt-8 space-y-2">
        {(list.data ?? []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card/50">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="mt-3 text-muted-foreground">No notifications yet.</p>
          </div>
        ) : (
          list.data!.map((n) => (
            <div key={n.id} className={`rounded-xl border border-border p-4 shadow-soft ${n.read ? "bg-card" : "bg-primary/5 border-primary/30"}`}>
              <div className="flex items-start gap-3">
                <div className={`h-2 w-2 mt-2 rounded-full ${n.read ? "bg-muted-foreground/40" : "bg-primary"}`} />
                <div className="flex-1">
                  <div className="font-medium">{n.title}</div>
                  {n.message && <div className="text-sm text-muted-foreground mt-0.5">{n.message}</div>}
                  <div className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
