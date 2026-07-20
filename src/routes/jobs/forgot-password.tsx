import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/jobs/forgot-password")({
  head: () => ({ meta: [{ title: "Reset Password — SchemeSync Jobs" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/jobs/login",
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password reset link sent!");
      setSent(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link
          to="/jobs/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h1 className="text-2xl font-bold mb-2">Reset password</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your email and we'll send you a link to reset your password.
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-primary"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="rounded-lg bg-success/10 border border-success/30 p-4">
                <p className="text-sm text-success">
                  Password reset link sent to <strong>{email}</strong>
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Check your email for the reset link. It will expire in 1 hour.
              </p>
              <Button
                onClick={() => navigate({ to: "/jobs/login" })}
                className="w-full"
              >
                Back to login
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
