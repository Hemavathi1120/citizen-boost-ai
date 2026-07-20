export type JobUser = {
  id: string;
  email: string;
  full_name?: string | null;
  user_type?: "job_seeker" | "employer" | "admin" | null;
};

export type JobProfile = {
  id?: string;
  user_id: string;
  full_name?: string | null;
  headline?: string | null;
  summary?: string | null;
  experience_level?: string | null;
  employment_type?: string | null;
  location_preference?: string | null;
  current_company?: string | null;
  current_title?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  skills?: string[] | null;
  education?: string[] | null;
  experience?: string[] | null;
  profile_completion?: number | null;
};

export type Company = {
  id?: string;
  name: string;
  slug?: string;
  industry?: string | null;
  verified?: boolean;
  website?: string | null;
  description?: string | null;
};

export type JobOpportunity = {
  id?: string;
  company_id?: string;
  title: string;
  location?: string | null;
  employment_type?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  description?: string | null;
  match_score?: number | null;
};

export type SavedJob = {
  id?: string;
  user_id: string;
  job_id: string;
  created_at?: string;
};

export type JobApplication = {
  id?: string;
  user_id: string;
  job_id: string;
  status?: "draft" | "submitted" | "reviewing" | "interview" | "rejected" | "offered";
  cover_letter?: string | null;
  created_at?: string;
};

export type JobNotification = {
  id?: string;
  user_id: string;
  title: string;
  body?: string | null;
  read?: boolean;
};

export type Interview = {
  id?: string;
  user_id: string;
  job_id?: string;
  scheduled_for?: string | null;
  status?: "scheduled" | "completed" | "cancelled";
};

export type Resume = {
  id?: string;
  user_id: string;
  file_name?: string | null;
  storage_path?: string | null;
  summary?: string | null;
};

export type ResumeAnalysis = {
  id?: string;
  user_id: string;
  ats_score?: number | null;
  summary?: string | null;
  suggestions?: string[] | null;
};

export type AiRecommendation = {
  id?: string;
  user_id: string;
  job_id?: string;
  score?: number | null;
  reason?: string | null;
};

export type AuditLog = {
  id?: string;
  actor_id?: string | null;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  created_at?: string;
};
