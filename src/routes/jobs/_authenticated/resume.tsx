import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { analyzeResume, buildResume } from "@/lib/ai.functions";
import {
  createResumeDraft,
  PORTAL_STORAGE_KEYS,
  readPortalState,
  writePortalState,
  ResumeDraft,
  type JobApplicationContext,
} from "@/lib/jobs/portal-data";

function ProfileOnboardingForm({ onSave, loading }: { onSave: (profile: any) => void; loading: boolean }) {
  const [profile, setProfile] = useState({
    full_name: "",
    headline: "",
    summary: "",
    current_company: "",
    current_title: "",
    location_preference: "",
    experience_level: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    skills: "",
  });

  const handleChange = (key: string, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="full_name">Full Name</Label>
          <Input id="full_name" value={profile.full_name} onChange={(event) => handleChange("full_name", event.target.value)} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="headline">Professional Headline</Label>
          <Input id="headline" value={profile.headline} onChange={(event) => handleChange("headline", event.target.value)} className="mt-2" />
        </div>
      </div>
      <div>
        <Label htmlFor="summary">Professional Summary</Label>
        <Textarea id="summary" value={profile.summary} onChange={(event) => handleChange("summary", event.target.value)} className="mt-2 min-h-[120px]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="current_company">Current Company</Label>
          <Input id="current_company" value={profile.current_company} onChange={(event) => handleChange("current_company", event.target.value)} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="current_title">Current Job Title</Label>
          <Input id="current_title" value={profile.current_title} onChange={(event) => handleChange("current_title", event.target.value)} className="mt-2" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="experience_level">Experience Level</Label>
          <Input id="experience_level" value={profile.experience_level} onChange={(event) => handleChange("experience_level", event.target.value)} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="location_preference">Location Preference</Label>
          <Input id="location_preference" value={profile.location_preference} onChange={(event) => handleChange("location_preference", event.target.value)} className="mt-2" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="linkedin_url">LinkedIn</Label>
          <Input id="linkedin_url" value={profile.linkedin_url} onChange={(event) => handleChange("linkedin_url", event.target.value)} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="github_url">GitHub</Label>
          <Input id="github_url" value={profile.github_url} onChange={(event) => handleChange("github_url", event.target.value)} className="mt-2" />
        </div>
      </div>
      <div>
        <Label htmlFor="portfolio_url">Portfolio URL</Label>
        <Input id="portfolio_url" value={profile.portfolio_url} onChange={(event) => handleChange("portfolio_url", event.target.value)} className="mt-2" />
      </div>
      <div>
        <Label htmlFor="skills">Skills</Label>
        <Input
          id="skills"
          value={profile.skills}
          placeholder="e.g., React, TypeScript, Product Strategy"
          onChange={(event) => handleChange("skills", event.target.value)}
          className="mt-2"
        />
      </div>
      <div className="flex justify-end">
        <Button className="bg-gradient-primary" onClick={() => onSave({
          ...profile,
          skills: profile.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
        })} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {loading ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/jobs/_authenticated/resume")({
  head: () => ({ meta: [{ title: "Resume Builder — SchemeSync Jobs" }] }),
  component: ResumeBuilderPage,
});

function ResumeBuilderPage() {
  const [resume, setResume] = useState<ResumeDraft>(() => createResumeDraft(null));
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobRequirements, setJobRequirements] = useState("");
  const [currentProfile, setCurrentProfile] = useState(() => readPortalState(PORTAL_STORAGE_KEYS.profile, null) as any);
  const [loading, setLoading] = useState(false);
  const analyze = useServerFn(analyzeResume);
  const build = useServerFn(buildResume);

  const profileComplete = Boolean(
    currentProfile?.full_name &&
      currentProfile?.headline &&
      currentProfile?.summary &&
      currentProfile?.current_title &&
      currentProfile?.current_company &&
      Array.isArray(currentProfile?.skills) &&
      currentProfile.skills.length > 0,
  );

  useEffect(() => {
    const saved = readPortalState(PORTAL_STORAGE_KEYS.resume, null) as ResumeDraft | null;
    if (saved) {
      setResume(saved);
    }
  }, []);

  useEffect(() => {
    const savedContext = readPortalState<JobApplicationContext | null>(PORTAL_STORAGE_KEYS.applicationContext, null);
    if (savedContext) {
      setTargetRole(savedContext.targetRole);
      setTargetCompany(savedContext.targetCompany);
      setJobDescription(savedContext.jobDescription);
      setJobRequirements(savedContext.jobRequirements);
    }
  }, []);

  useEffect(() => {
    const runInitialAnalysis = async () => {
      const profile = readPortalState(PORTAL_STORAGE_KEYS.profile, null);
      setCurrentProfile(profile);
      const draft = createResumeDraft(profile);
      setResume((current) => ({ ...draft, ...current, ...draft }));
      setLoading(true);
      try {
        const result = await analyze({
          profileSummary: JSON.stringify(profile ?? {}),
          resumeDraft: draft,
        });
        const nextResume = {
          ...draft,
          ...result,
          fullName: draft.fullName,
          skills: result.keywords?.length ? result.keywords : draft.skills,
          atsScore: result.atsScore ?? draft.atsScore,
          suggestions: result.suggestions ?? draft.suggestions,
          experienceBullets: draft.experienceBullets,
        };
        setResume(nextResume);
        writePortalState(PORTAL_STORAGE_KEYS.resume, nextResume);
      } catch {
        // fallback keeps the draft visible
      } finally {
        setLoading(false);
      }
    };

    void runInitialAnalysis();
  }, [analyze]);

  const summary = useMemo(() => {
    return [
      `Headline: ${resume.headline}`,
      `Summary: ${resume.summary}`,
      `Skills: ${resume.skills.join(", ") || "Add key skills"}`,
      `ATS score: ${resume.atsScore}`,
    ];
  }, [resume]);

  const saveProfile = (profile: any) => {
    writePortalState(PORTAL_STORAGE_KEYS.profile, profile);
    setCurrentProfile(profile);
  };

  const isOnboarding = !profileComplete;

  const saveResume = () => {
    writePortalState(PORTAL_STORAGE_KEYS.resume, resume);
    window.dispatchEvent(new CustomEvent("jobs:resume-saved"));
  };

  const saveOnboardingProfile = async (profile: any) => {
    saveProfile(profile);
    const draft = createResumeDraft(profile);
    setResume((current) => ({ ...draft, ...current, ...draft }));
    writePortalState(PORTAL_STORAGE_KEYS.resume, draft);
  };

  const generateResume = async () => {
    setLoading(true);
    try {
      const profile = readPortalState(PORTAL_STORAGE_KEYS.profile, null);
      const result = await build({
        profileSummary: JSON.stringify(profile ?? {}),
        targetRole,
        targetCompany,
        jobDescription,
        jobRequirements,
        resumeDraft: resume,
      });
      const nextResume = {
        ...resume,
        ...result,
        skills: result.skills.length ? result.skills : resume.skills,
      };
      setResume(nextResume);
      writePortalState(PORTAL_STORAGE_KEYS.resume, nextResume);
    } finally {
      setLoading(false);
    }
  };

  const checkScore = async () => {
    setLoading(true);
    try {
      const profile = readPortalState(PORTAL_STORAGE_KEYS.profile, null);
      const result = await analyze({
        profileSummary: JSON.stringify(profile ?? {}),
        resumeDraft: resume,
      });
      const nextResume = {
        ...resume,
        ...result,
        skills: result.keywords?.length ? result.keywords : resume.skills,
        atsScore: result.atsScore ?? resume.atsScore,
        suggestions: result.suggestions ?? resume.suggestions,
      };
      setResume(nextResume);
      writePortalState(PORTAL_STORAGE_KEYS.resume, nextResume);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resume Builder</h1>
        <p className="mt-2 text-muted-foreground">
          Build a complete AI-powered resume from your profile and job-specific details.
        </p>
      </div>

      {isOnboarding ? (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Tell us about yourself</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete your professional profile once, then only share role/company details later.
            </p>
          </div>
          <ProfileOnboardingForm onSave={saveOnboardingProfile} loading={loading} />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Sparkles className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Live resume draft</h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-background/70 p-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">{resume.fullName}</p>
                    <p className="text-sm text-muted-foreground">{resume.headline}</p>
                  </div>
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">ATS {resume.atsScore}</div>
                </div>
                <p className="text-sm text-muted-foreground">{resume.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill) => (
                    <span key={skill} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-border p-4">
                  <h3 className="font-semibold mb-2">Experience bullets</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {resume.experienceBullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <h3 className="font-semibold mb-2">Recommended improvements</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {resume.suggestions.map((suggestion) => (
                      <li key={suggestion} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {resume.coverLetterHook ? (
                <div className="rounded-xl border border-border p-4">
                  <h3 className="font-semibold mb-2">Cover letter hook</h3>
                  <p className="text-sm text-muted-foreground">{resume.coverLetterHook}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="space-y-6">
              <div>
                <Label htmlFor="targetRole">Target role or job title</Label>
                <Input
                  id="targetRole"
                  value={targetRole}
                  placeholder="e.g., Product Manager, Data Analyst, Customer Success"
                  onChange={(event) => setTargetRole(event.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="targetCompany">Target company</Label>
                <Input
                  id="targetCompany"
                  value={targetCompany}
                  placeholder="e.g., Acme Corp, Infosys, Google"
                  onChange={(event) => setTargetCompany(event.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="jobDescription">Job description</Label>
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  placeholder="Paste the role description or highlight key responsibilities here"
                  onChange={(event) => setJobDescription(event.target.value)}
                  className="mt-2 min-h-[120px]"
                />
              </div>
              <div>
                <Label htmlFor="jobRequirements">Job requirements</Label>
                <Textarea
                  id="jobRequirements"
                  value={jobRequirements}
                  placeholder="e.g., 5+ years in product, strong communication, Agile experience"
                  onChange={(event) => setJobRequirements(event.target.value)}
                  className="mt-2 min-h-[120px]"
                />
              </div>

              <div className="space-y-3">
                <Button onClick={generateResume} className="w-full bg-gradient-primary" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                  {loading ? "Building resume..." : "Build complete resume"}
                </Button>
                <Button onClick={checkScore} variant="outline" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {loading ? "Analyzing..." : "Optimize resume score"}
                </Button>
                <Button onClick={saveResume} variant="ghost" className="w-full">
                  Save draft
                </Button>
              </div>

              <div className="rounded-xl border border-border p-4 bg-background/80">
                <h3 className="font-semibold mb-2">Advanced AI features</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• First-time full profile onboarding, then job-only prompts.</li>
                  <li>• Generate a tailored resume based on role, company, and requirements.</li>
                  <li>• Improve headlines, summary, and skills for ATS.</li>
                  <li>• Create experience bullets and cover letter hooks automatically.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
