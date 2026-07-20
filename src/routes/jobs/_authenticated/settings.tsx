import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/jobs/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — SchemeSync Jobs" }] }),
  component: JobsSettingsPage,
});

function JobsSettingsPage() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="mt-1 text-muted-foreground">Manage your job portal account</p>

      <div className="mt-8 space-y-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-semibold">Preferences</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Customize your job search and notification settings.
          </p>
          <Button variant="outline" className="mt-4">
            Edit Preferences
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-semibold">Privacy & Security</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your profile data is private and only visible to employers you apply to.
            We never share your information with third parties.
          </p>
          <Button variant="outline" className="mt-4">
            View Privacy Policy
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-semibold">Account</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign out of SchemeSync Jobs on this device.
          </p>
          <Button variant="destructive" onClick={handleSignOut} className="mt-4">
            Sign Out
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-semibold">About</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            SchemeSync Jobs v1.0 · AI-powered job matching platform · Built with TanStack Start and Gemini
          </p>
        </div>
      </div>
    </div>
  );
}
