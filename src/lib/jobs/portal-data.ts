import type { JobProfile } from "@/lib/jobs/types";

export type PortalJob = {
  id: string;
  slug: string;
  title: string;
  company_name: string;
  location: string;
  location_type: "remote" | "on-site" | "hybrid";
  salary_min: number | null;
  salary_max: number | null;
  description: string;
  requirements: string[];
  category: string;
  experience_level: string;
  posted_at: string;
  skills: string[];
};

export type PortalApplication = {
  id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  status: "draft" | "submitted" | "reviewed" | "interview" | "offer" | "rejected";
  compatibility_score: number;
  applied_at: string;
  updated_at: string;
  resume_source?: "generated" | "uploaded" | "existing";
  resume_file_name?: string | null;
  cover_letter?: string | null;
  job_description?: string | null;
  job_requirements?: string | null;
};

export const PORTAL_STORAGE_KEYS = {
  profile: "jobs-portal-profile",
  savedJobs: "jobs-portal-saved-jobs",
  applications: "jobs-portal-applications",
  resume: "jobs-portal-resume",
  applicationContext: "jobs-portal-application-context",
};

export type JobApplicationContext = {
  jobId: string;
  targetRole: string;
  targetCompany: string;
  jobDescription: string;
  jobRequirements: string;
};

export type ResumeDraft = {
  fullName: string;
  headline: string;
  summary: string;
  skills: string[];
  atsScore: number;
  suggestions: string[];
  experienceBullets: string[];
  coverLetterHook?: string;
};

export const seedJobs: PortalJob[] = [
  {
    id: "job-software-engineer",
    slug: "senior-software-engineer",
    title: "Senior Software Engineer",
    company_name: "Northstar Labs",
    location: "Remote · Global",
    location_type: "remote",
    salary_min: 220000,
    salary_max: 300000,
    description: "Build resilient product experiences and improve developer tooling for a fast-growing AI platform.",
    requirements: ["React", "TypeScript", "System design", "Problem solving"],
    category: "Engineering",
    experience_level: "Senior",
    posted_at: "2h ago",
    skills: ["React", "TypeScript", "AI", "System design"],
  },
  {
    id: "job-product-designer",
    slug: "product-designer",
    title: "Product Designer",
    company_name: "Lumen Forge",
    location: "Hybrid · Singapore",
    location_type: "hybrid",
    salary_min: 150000,
    salary_max: 220000,
    description: "Design intuitive workflows for users solving real-world operational challenges.",
    requirements: ["Figma", "UX research", "Accessibility", "Design systems"],
    category: "Design",
    experience_level: "Mid",
    posted_at: "5h ago",
    skills: ["Figma", "UX research", "Accessibility", "Design systems"],
  },
  {
    id: "job-data-analyst",
    slug: "data-analyst",
    title: "Data Analyst",
    company_name: "Atlas Health",
    location: "On-site · Bengaluru",
    location_type: "on-site",
    salary_min: 120000,
    salary_max: 180000,
    description: "Turn operational data into decisions that improve service delivery and patient outcomes.",
    requirements: ["SQL", "Excel", "Dashboarding", "Stakeholder communication"],
    category: "Analytics",
    experience_level: "Mid",
    posted_at: "1d ago",
    skills: ["SQL", "Dashboarding", "Stakeholder communication", "Data storytelling"],
  },
  {
    id: "job-operations-manager",
    slug: "operations-manager",
    title: "Operations Manager",
    company_name: "BridgeWorks",
    location: "Hybrid · Mumbai",
    location_type: "hybrid",
    salary_min: 140000,
    salary_max: 200000,
    description: "Coordinate delivery teams, optimize workflows, and solve recurring operational bottlenecks.",
    requirements: ["Process design", "Operations", "Cross-functional work", "Problem solving"],
    category: "Operations",
    experience_level: "Senior",
    posted_at: "3h ago",
    skills: ["Operations", "Process design", "Cross-functional collaboration", "Problem solving"],
  },
  {
    id: "job-customer-success",
    slug: "customer-success-lead",
    title: "Customer Success Lead",
    company_name: "CivicLoop",
    location: "Remote · Europe",
    location_type: "remote",
    salary_min: 130000,
    salary_max: 180000,
    description: "Help customers achieve measurable outcomes with onboarding, adoption, and support programs.",
    requirements: ["Customer success", "Communication", "Strategy", "Relationship building"],
    category: "Customer Success",
    experience_level: "Mid",
    posted_at: "6h ago",
    skills: ["Customer success", "Communication", "Strategy", "Relationship building"],
  },
  {
    id: "job-marketing-strategist",
    slug: "marketing-strategist",
    title: "Marketing Strategist",
    company_name: "BrightPeak",
    location: "Remote · India",
    location_type: "remote",
    salary_min: 110000,
    salary_max: 160000,
    description: "Create growth campaigns that connect product stories to real-world customer needs.",
    requirements: ["Growth", "Content strategy", "Analytics", "Storytelling"],
    category: "Marketing",
    experience_level: "Mid",
    posted_at: "1d ago",
    skills: ["Growth", "Content strategy", "Analytics", "Storytelling"],
  },
  {
    id: "job-healthcare-coordinator",
    slug: "healthcare-program-coordinator",
    title: "Healthcare Program Coordinator",
    company_name: "WellPath",
    location: "On-site · Hyderabad",
    location_type: "on-site",
    salary_min: 100000,
    salary_max: 140000,
    description: "Coordinate community service programs and keep delivery teams aligned around outcomes.",
    requirements: ["Healthcare", "Coordination", "Stakeholder management", "Problem solving"],
    category: "Healthcare",
    experience_level: "Entry",
    posted_at: "2d ago",
    skills: ["Healthcare", "Coordination", "Stakeholder management", "Problem solving"],
  },
  {
    id: "job-technical-writer",
    slug: "technical-writer",
    title: "Technical Writer",
    company_name: "DocsNova",
    location: "Remote · Worldwide",
    location_type: "remote",
    salary_min: 90000,
    salary_max: 130000,
    description: "Translate complex product and engineering work into clear documentation for users and teams.",
    requirements: ["Documentation", "Writing", "Research", "Communication"],
    category: "Documentation",
    experience_level: "Mid",
    posted_at: "4h ago",
    skills: ["Documentation", "Writing", "Research", "Communication"],
  },
];

function normalizeSkills(profile: Partial<JobProfile> | null | undefined): string[] {
  if (!profile) return [];
  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const extras = [profile.headline, profile.current_title, profile.summary]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  return [...new Set([...skills, ...extras])].slice(0, 10);
}

export function calculateProfileCompletion(profile: Partial<JobProfile> | null | undefined): number {
  if (!profile) return 0;
  const checks = [
    Boolean(profile.full_name?.trim()),
    Boolean(profile.headline?.trim()),
    Boolean(profile.summary?.trim()),
    Boolean(profile.experience_level?.trim()),
    Boolean(profile.location_preference?.trim()),
    Boolean(profile.current_company?.trim()),
    Boolean(profile.current_title?.trim()),
    Boolean(profile.linkedin_url?.trim() || profile.github_url?.trim() || profile.portfolio_url?.trim()),
    (Array.isArray(profile.skills) ? profile.skills.length : 0) > 0,
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

export function calculateMatchScore(profile: Partial<JobProfile> | null | undefined, job: PortalJob): number {
  const profileTokens = new Set(normalizeSkills(profile));
  const jobTokens = new Set(job.skills.map((skill) => skill.toLowerCase()));
  let score = 40;
  let overlap = 0;
  profileTokens.forEach((token) => {
    if (jobTokens.has(token.toLowerCase())) overlap += 1;
  });
  score += Math.min(overlap * 12, 40);
  if (job.category.toLowerCase().includes("engineering") && profileTokens.has("software")) score += 6;
  if (job.category.toLowerCase().includes("design") && profileTokens.has("design")) score += 6;
  if (profile?.location_preference && job.location.toLowerCase().includes(profile.location_preference.toLowerCase())) score += 6;
  if (profile?.experience_level && job.experience_level.toLowerCase() === profile.experience_level.toLowerCase()) score += 8;
  return Math.min(96, Math.max(55, score));
}

export function getRecommendedJobs(
  profile: Partial<JobProfile> | null | undefined,
  jobs: PortalJob[],
  savedJobIds: string[],
  appliedJobIds: string[],
): PortalJob[] {
  return jobs
    .filter((job) => !savedJobIds.includes(job.id) || !appliedJobIds.includes(job.id))
    .map((job) => ({ job, score: calculateMatchScore(profile, job) }))
    .sort((a, b) => b.score - a.score)
    .map(({ job }) => job);
}

export function createResumeDraft(profile: Partial<JobProfile> | null | undefined): ResumeDraft {
  const fullName = profile?.full_name?.trim() || "Your Name";
  const headline = profile?.headline?.trim() || "Problem-solving professional";
  const summary = profile?.summary?.trim() || "Focused on turning complex work into clear outcomes with strong collaboration and execution.";
  const skills = (Array.isArray(profile?.skills) ? profile.skills : []).slice(0, 6);
  const atsScore = Math.min(98, 70 + skills.length * 4 + (summary.length > 80 ? 8 : 0));
  const suggestions = [
    skills.length < 4 ? "Add 3 more skills that match your ideal role." : "Your skill set is strong. Add a recent achievement.",
    profile?.linkedin_url ? "Your LinkedIn profile is ready to support your resume." : "Add a LinkedIn profile to strengthen trust and visibility.",
    "Use one measurable achievement in each bullet point for better recruiter impact.",
  ];
  const experienceBullets = [
    "Highlight a measurable achievement from your most recent role.",
    "Demonstrate how you solved a key problem or improved a process.",
    "Include a clear impact statement that shows your contribution to the team.",
  ];
  return {
    fullName,
    headline,
    summary,
    skills,
    atsScore,
    suggestions,
    experienceBullets,
    coverLetterHook: "Share a strong opening line for a cover letter tailored to your next role.",
  };
}

export function getLiveOpportunityFeed(profile: Partial<JobProfile> | null | undefined) {
  const role = profile?.current_title?.trim() || "ambitious professional";
  return [
    {
      title: "Fresh match found",
      detail: `New roles for ${role} are trending in your saved categories.`,
      tone: "positive" as const,
    },
    {
      title: "Response window open",
      detail: "Applications with tailored summaries are getting faster recruiter attention.",
      tone: "info" as const,
    },
    {
      title: "Skill signal rising",
      detail: "Your profile strength is improving, which lifts your match quality in real time.",
      tone: "positive" as const,
    },
  ];
}

export function readPortalState<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writePortalState<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}
