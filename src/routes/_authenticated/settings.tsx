import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — SchemeSync AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="mt-1 text-muted-foreground">Manage your account</p>

      <div className="mt-8 space-y-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-semibold">Account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sign out of SchemeSync AI on this device.</p>
          <Button variant="destructive" onClick={signOut} className="mt-4">Sign out</Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-semibold">Privacy</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your documents are encrypted and only accessible to you. We never share your data with third parties.
            All AI processing happens through Lovable AI Gateway with request-level isolation.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-semibold">About</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            SchemeSync AI v1.0 · Built with TanStack Start, Lovable Cloud, and Gemini.
          </p>
        </div>
      </div>
    </div>
  );
}
