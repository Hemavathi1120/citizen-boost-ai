import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Search, MapPin, Briefcase, DollarSign, BookmarkPlus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  PORTAL_STORAGE_KEYS,
  readPortalState,
  seedJobs,
  writePortalState,
  type PortalApplication,
  type PortalJob,
} from "@/lib/jobs/portal-data";

export const Route = createFileRoute("/jobs/_authenticated/search")({
  head: () => ({ meta: [{ title: "Job Search — SchemeSync Jobs" }] }),
  component: JobSearchPage,
});

function JobSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [jobs] = useState<PortalJob[]>(seedJobs);
  const [selectedJob, setSelectedJob] = useState<PortalJob | null>(null);
  const [uploadedResumeName, setUploadedResumeName] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applicationStep, setApplicationStep] = useState<"review" | "prepare">("review");
  const navigate = useNavigate();

  useEffect(() => {
    setSavedJobIds(readPortalState<string[]>(PORTAL_STORAGE_KEYS.savedJobs, []));
    setAppliedJobIds(readPortalState<string[]>(PORTAL_STORAGE_KEYS.applications, []).map((app: PortalApplication) => app.job_id));
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.category))).sort(),
    [jobs]
  );

  const filtered = jobs.filter((j) => {
    if (categoryFilter !== "all" && j.category !== categoryFilter) return false;
    if (locationFilter && j.location_type !== locationFilter) return false;
    if (!searchQuery.trim()) return true;
    const hay = `${j.title} ${j.company_name} ${j.description}`.toLowerCase();
    return hay.includes(searchQuery.toLowerCase());
  });

  const saveJob = (jobId: string) => {
    const next = savedJobIds.includes(jobId) ? savedJobIds.filter((id) => id !== jobId) : [...savedJobIds, jobId];
    setSavedJobIds(next);
    writePortalState(PORTAL_STORAGE_KEYS.savedJobs, next);
    toast.success(next.includes(jobId) ? "Job saved for later" : "Job removed from saved list");
  };

  const openApplyDialog = (job: PortalJob) => {
    if (appliedJobIds.includes(job.id)) {
      toast.message("You already applied to this role");
      return;
    }
    setSelectedJob(job);
    setUploadedResumeName(null);
    setCoverLetter("");
    setApplicationStep("review");
  };

  const applyDraft = (job: PortalJob) => {
    const existingApplications = readPortalState<PortalApplication[]>(PORTAL_STORAGE_KEYS.applications, []);
    const application: PortalApplication = {
      id: `${job.id}-${Date.now()}`,
      job_id: job.id,
      job_title: job.title,
      company_name: job.company_name,
      status: "draft",
      compatibility_score: 88,
      applied_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resume_source: uploadedResumeName ? "uploaded" : "generated",
      resume_file_name: uploadedResumeName,
      cover_letter: coverLetter || null,
      job_description: job.description,
      job_requirements: job.requirements.join(", "),
    };
    const nextApplications = [...existingApplications, application];
    setAppliedJobIds([...appliedJobIds, job.id]);
    writePortalState(PORTAL_STORAGE_KEYS.applications, nextApplications);
    toast.success(`Draft application created for ${job.title}`);
    setSelectedJob(null);
    navigate({ to: "/jobs/applications" });
  };

  const startResumeForJob = (job: PortalJob) => {
    writePortalState(PORTAL_STORAGE_KEYS.applicationContext, {
      jobId: job.id,
      targetRole: job.title,
      targetCompany: job.company_name,
      jobDescription: job.description,
      jobRequirements: job.requirements.join(", "),
    });
    navigate({ to: "/jobs/resume" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find Your Next Job</h1>
        <p className="mt-2 text-muted-foreground">
          Thousands of opportunities matched to your skills
        </p>
      </div>

      {/* Search and filters */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search job titles, companies..."
              className="pl-9 h-11"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterPill
              active={locationFilter === ""}
              onClick={() => setLocationFilter("")}
            >
              All Locations
            </FilterPill>
            {["remote", "hybrid", "on-site"].map((loc) => (
              <FilterPill
                key={loc}
                active={locationFilter === loc}
                onClick={() => setLocationFilter(loc)}
              >
                {loc.charAt(0).toUpperCase() + loc.slice(1)}
              </FilterPill>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterPill
              active={categoryFilter === "all"}
              onClick={() => setCategoryFilter("all")}
            >
              All Categories
            </FilterPill>
            {categories.map((cat) => (
              <FilterPill
                key={cat}
                active={categoryFilter === cat}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </FilterPill>
            ))}
          </div>
        </div>
      </div>

      {/* Job listings */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center"
          >
            <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No jobs match your search.</p>
          </motion.div>
        ) : (
          filtered.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-elegant hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-xs uppercase tracking-wider text-primary font-medium">
                      {job.category}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                      {job.experience_level}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{job.company_name}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                    {job.salary_max && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ₹{(job.salary_min ?? 0).toLocaleString()}-₹
                        {job.salary_max.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => saveJob(job.id)}
                  >
                    <BookmarkPlus className="mr-2 h-4 w-4" />
                    {savedJobIds.includes(job.id) ? "Saved" : "Save"}
                  </Button>
                  <Button size="sm" className="bg-gradient-primary" onClick={() => openApplyDialog(job)}>
                    {appliedJobIds.includes(job.id) ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
                    {appliedJobIds.includes(job.id) ? "Applied" : "Apply"}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {selectedJob ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Apply for {selectedJob.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Review the role and choose how you want to prepare your application.
                </p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="mt-1 text-lg font-semibold">{selectedJob.company_name}</p>
                </div>

                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Role overview</p>
                  <p className="mt-2 text-sm leading-6">{selectedJob.description}</p>
                </div>

                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Requirements</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    {selectedJob.requirements.map((requirement) => (
                      <li key={requirement}>{requirement}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <h3 className="text-base font-semibold">Application options</h3>
                  <div className="mt-4 space-y-3">
                    <Button className="w-full" onClick={() => startResumeForJob(selectedJob)}>
                      Build resume for this job
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setApplicationStep("prepare")}>Upload resume / add cover letter</Button>
                  </div>
                </div>

                {applicationStep === "prepare" ? (
                  <div className="rounded-2xl border border-border bg-background p-4 space-y-4">
                    <div>
                      <Label htmlFor="resumeUpload">Upload resume</Label>
                      <input
                        id="resumeUpload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            setUploadedResumeName(file.name);
                          }
                        }}
                        className="mt-2 w-full text-sm"
                      />
                      {uploadedResumeName ? (
                        <p className="mt-2 text-sm text-foreground">Selected: {uploadedResumeName}</p>
                      ) : null}
                    </div>

                    <div>
                      <Label htmlFor="coverLetter">Cover letter</Label>
                      <Textarea
                        id="coverLetter"
                        value={coverLetter}
                        placeholder="Write a short cover letter introduction for this role"
                        onChange={(event) => setCoverLetter(event.target.value)}
                        className="mt-2 min-h-[120px]"
                      />
                    </div>

                    <Button className="w-full bg-gradient-primary" onClick={() => applyDraft(selectedJob)}>
                      Save draft application
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        active
          ? "bg-gradient-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      {children}
    </button>
  );
}
