import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/jobs/onboarding")({
  head: () => ({ meta: [{ title: "Complete Your Profile — SchemeSync Jobs" }] }),
  component: JobsOnboarding,
});

const EXPERIENCE_LEVELS = ["Fresher", "0-2 years", "2-5 years", "5-10 years", "10+ years"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];
const LOCATIONS = ["Remote", "On-site", "Hybrid"];

function JobsOnboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    full_name: "",
    headline: "",
    summary: "",
    experience_level: "",
    employment_type: "",
    location_preference: "",
    current_company: "",
    current_title: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
  });

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.user_metadata?.full_name) {
        setProfile((p) => ({ ...p, full_name: data.user.user_metadata.full_name }));
      }
    };
    getUser();
  }, []);

  const handleNext = () => {
    if (step === 1 && !profile.full_name) {
      return toast.error("Please enter your full name");
    }
    if (step === 2 && !profile.experience_level) {
      return toast.error("Please select your experience level");
    }
    if (step < 3) setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error } = await supabase.from("job_profiles").insert({
        user_id: user.user.id,
        full_name: profile.full_name,
        headline: profile.headline,
        summary: profile.summary,
        experience_level: profile.experience_level,
        employment_type: profile.employment_type,
        location_preference: profile.location_preference,
        current_company: profile.current_company,
        current_title: profile.current_title,
        linkedin_url: profile.linkedin_url,
        github_url: profile.github_url,
        portfolio_url: profile.portfolio_url,
        profile_completion: 30,
      });

      if (error) throw error;

      toast.success("Profile created! Let's get you matched with jobs.");
      navigate({ to: "/jobs/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Let's build your profile</h1>
          <p className="text-muted-foreground mt-2">
            The more details you provide, the better our AI can match you with opportunities.
          </p>
          <div className="mt-6 flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${
                  s <= step ? "bg-gradient-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-6">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.full_name}
                      onChange={(e) =>
                        setProfile({ ...profile, full_name: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="headline">Professional Headline</Label>
                    <Input
                      id="headline"
                      placeholder="e.g., Senior Software Engineer | Full Stack Developer"
                      value={profile.headline}
                      onChange={(e) =>
                        setProfile({ ...profile, headline: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Textarea
                      id="summary"
                      placeholder="Tell us about yourself, your background, and what you're looking for..."
                      value={profile.summary}
                      onChange={(e) =>
                        setProfile({ ...profile, summary: e.target.value })
                      }
                      className="mt-1.5 min-h-24"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-6">Experience & Preferences</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Select
                      value={profile.experience_level}
                      onValueChange={(v) =>
                        setProfile({ ...profile, experience_level: v })
                      }
                    >
                      <SelectTrigger id="experience" className="mt-1.5">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="employment">Employment Type</Label>
                    <Select
                      value={profile.employment_type}
                      onValueChange={(v) =>
                        setProfile({ ...profile, employment_type: v })
                      }
                    >
                      <SelectTrigger id="employment" className="mt-1.5">
                        <SelectValue placeholder="What are you looking for?" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPLOYMENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location">Location Preference</Label>
                    <Select
                      value={profile.location_preference}
                      onValueChange={(v) =>
                        setProfile({ ...profile, location_preference: v })
                      }
                    >
                      <SelectTrigger id="location" className="mt-1.5">
                        <SelectValue placeholder="Remote, On-site, or Hybrid?" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="company">Current Company (optional)</Label>
                    <Input
                      id="company"
                      placeholder="Your current employer"
                      value={profile.current_company}
                      onChange={(e) =>
                        setProfile({ ...profile, current_company: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="title">Current Job Title (optional)</Label>
                    <Input
                      id="title"
                      placeholder="Your current position"
                      value={profile.current_title}
                      onChange={(e) =>
                        setProfile({ ...profile, current_title: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-6">Links & Portfolio</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="linkedin">LinkedIn URL (optional)</Label>
                    <Input
                      id="linkedin"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={profile.linkedin_url}
                      onChange={(e) =>
                        setProfile({ ...profile, linkedin_url: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="github">GitHub URL (optional)</Label>
                    <Input
                      id="github"
                      placeholder="https://github.com/yourprofile"
                      value={profile.github_url}
                      onChange={(e) =>
                        setProfile({ ...profile, github_url: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="portfolio">Portfolio URL (optional)</Label>
                    <Input
                      id="portfolio"
                      placeholder="https://yourportfolio.com"
                      value={profile.portfolio_url}
                      onChange={(e) =>
                        setProfile({ ...profile, portfolio_url: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>

                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Profile 30% complete</p>
                        <p className="text-sm text-muted-foreground">
                          You can add more details like skills, education, and experience anytime from your dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={handleNext}
                className="flex-1 bg-gradient-primary"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating profile...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
