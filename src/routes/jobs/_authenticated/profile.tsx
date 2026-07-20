import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { isMissingTableError } from "@/lib/jobs/supabase-safe";
import { PORTAL_STORAGE_KEYS, readPortalState, writePortalState } from "@/lib/jobs/portal-data";

export const Route = createFileRoute("/jobs/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — SchemeSync Jobs" }] }),
  component: JobsProfilePage,
});

type JobProfile = {
  id: string;
  user_id: string;
  full_name: string | null;
  headline: string | null;
  summary: string | null;
  experience_level: string | null;
  employment_type: string | null;
  location_preference: string | null;
  current_company: string | null;
  current_title: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  skills: string[] | null;
  education: any[] | null;
  experience: any[] | null;
  profile_completion: number | null;
};

function JobsProfilePage() {
  const [form, setForm] = useState<Partial<JobProfile> | null>(() => readPortalState(PORTAL_STORAGE_KEYS.profile, null));
  const [activeTab, setActiveTab] = useState("about");
  const [saving, setSaving] = useState(false);

  const profile = useQuery({
    queryKey: ["jobs-profile"],
    queryFn: async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        const { data, error } = await supabase
          .from("job_profiles")
          .select("*")
          .eq("user_id", u.user!.id)
          .maybeSingle();
        if (error && isMissingTableError(error)) {
          return null;
        }
        if (error) throw error;
        return data as JobProfile;
      } catch {
        return null;
      }
    },
  });

  useEffect(() => {
    if (profile.data && !form) {
      setForm(profile.data);
    }
  }, [profile.data, form]);

  useEffect(() => {
    if (form) {
      writePortalState(PORTAL_STORAGE_KEYS.profile, form);
    }
  }, [form]);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      writePortalState(PORTAL_STORAGE_KEYS.profile, { ...form, profile_completion: 100 });
      const { error } = await supabase
        .from("job_profiles")
        .upsert({
          user_id: u.user!.id,
          full_name: form.full_name,
          headline: form.headline,
          summary: form.summary,
          experience_level: form.experience_level,
          employment_type: form.employment_type,
          location_preference: form.location_preference,
          current_company: form.current_company,
          current_title: form.current_title,
          linkedin_url: form.linkedin_url,
          github_url: form.github_url,
          portfolio_url: form.portfolio_url,
        });

      if (error && !isMissingTableError(error)) {
        throw error;
      }
      if (error && isMissingTableError(error)) {
        toast.message("Jobs schema is not available yet in Supabase. Your profile form is ready, and the data will sync once the tables are created.");
        return;
      }
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const set = <K extends keyof typeof form>(k: K, v: any) =>
    setForm({ ...form, [k]: v });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Complete your professional profile to get better job matches.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex gap-4 mb-8 border-b border-border">
          {["about", "links", "resume"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "about" && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={form.full_name || ""}
                onChange={(e) => set("full_name", e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="headline">Professional Headline</Label>
              <Input
                id="headline"
                placeholder="e.g., Senior Software Engineer"
                value={form.headline || ""}
                onChange={(e) => set("headline", e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                value={form.summary || ""}
                onChange={(e) => set("summary", e.target.value)}
                className="mt-1.5 min-h-32"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Current Company</Label>
                <Input
                  id="company"
                  value={form.current_company || ""}
                  onChange={(e) => set("current_company", e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="title">Current Job Title</Label>
                <Input
                  id="title"
                  value={form.current_title || ""}
                  onChange={(e) => set("current_title", e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                placeholder="e.g., React, TypeScript, Product strategy"
                value={(form.skills || []).join(", ")}
                onChange={(e) =>
                  set(
                    "skills",
                    e.target.value
                      .split(",")
                      .map((skill) => skill.trim())
                      .filter(Boolean),
                  )
                }
                className="mt-1.5"
              />
            </div>
          </div>
        )}

        {activeTab === "links" && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="linkedin">LinkedIn Profile</Label>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/in/yourprofile"
                value={form.linkedin_url || ""}
                onChange={(e) => set("linkedin_url", e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="github">GitHub Profile</Label>
              <Input
                id="github"
                placeholder="https://github.com/yourprofile"
                value={form.github_url || ""}
                onChange={(e) => set("github_url", e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="portfolio">Portfolio Website</Label>
              <Input
                id="portfolio"
                placeholder="https://yourportfolio.com"
                value={form.portfolio_url || ""}
                onChange={(e) => set("portfolio_url", e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
        )}

        {activeTab === "resume" && (
          <div className="space-y-6">
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Resume upload coming soon! You'll be able to:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-xs mx-auto">
                <li>• Upload PDF or Word resume</li>
                <li>• Auto-parse skills and experience</li>
                <li>• AI-generated ATS score</li>
                <li>• Resume improvement suggestions</li>
              </ul>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-border flex gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-primary"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
