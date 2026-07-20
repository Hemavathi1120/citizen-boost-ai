import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/company/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — SchemeSync Jobs" }] }),
  component: CompanySettingsPage,
});

function CompanySettingsPage() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="mt-1 text-muted-foreground">Manage your employer account and company profile</p>

      <div className="mt-8 space-y-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-semibold">Company Profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your company information, logo, and branding.
          </p>
          <Button variant="outline" className="mt-4">
            Edit Profile
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-semibold">Billing & Subscription</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your subscription plan and billing information.
          </p>
          <Button variant="outline" className="mt-4">
            Manage Subscription
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-semibold">Team Members</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add and manage team members with access to your account.
          </p>
          <Button variant="outline" className="mt-4">
            Manage Team
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
      </div>
    </div>
  );
}
