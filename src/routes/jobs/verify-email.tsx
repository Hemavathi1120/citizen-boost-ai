import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";

export const Route = createFileRoute("/jobs/verify-email")({
  head: () => ({ meta: [{ title: "Verify Your Email — SchemeSync Jobs" }] }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const email = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("email") : null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-elegant"
      >
        <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-success/10 text-success">
          <Mail className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Check your inbox</h1>
        <p className="mt-3 text-muted-foreground">
          We’ve sent a verification link to {email ?? "your email address"}. Once you confirm it, you’ll be able to continue into your new Jobs workspace.
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Secure sign-in and onboarding stay separate from Benefits.
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild className="bg-gradient-primary">
            <Link to="/jobs/login">
              Continue to sign in <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/jobs/signup">Back to signup</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
