import { supabase } from "@/integrations/supabase/client";
import type {
  AiRecommendation,
  JobApplication,
  JobNotification,
  JobOpportunity,
  JobProfile,
  ResumeAnalysis,
  SavedJob,
} from "@/lib/jobs/types";

export const jobsService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase.from("job_profiles").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return data as JobProfile | null;
  },

  async updateProfile(userId: string, profile: Partial<JobProfile>) {
    const { data, error } = await supabase.from("job_profiles").upsert({ user_id: userId, ...profile }).select().single();
    if (error) throw error;
    return data as JobProfile;
  },

  async getRecommendedJobs(userId: string) {
    const { data, error } = await supabase.from("job_ai_recommendations").select("*").eq("user_id", userId).limit(6);
    if (error) throw error;
    return data as AiRecommendation[];
  },

  async saveJob(userId: string, jobId: string) {
    const { data, error } = await supabase.from("saved_jobs").insert({ user_id: userId, job_id: jobId }).select().single();
    if (error) throw error;
    return data as SavedJob;
  },

  async getSavedJobs(userId: string) {
    const { data, error } = await supabase.from("saved_jobs").select("*").eq("user_id", userId);
    if (error) throw error;
    return data as SavedJob[];
  },

  async createApplication(userId: string, payload: Partial<JobApplication>) {
    const { data, error } = await supabase.from("job_applications").insert({ user_id: userId, ...payload }).select().single();
    if (error) throw error;
    return data as JobApplication;
  },

  async getApplications(userId: string) {
    const { data, error } = await supabase.from("job_applications").select("*").eq("user_id", userId);
    if (error) throw error;
    return data as JobApplication[];
  },

  async getNotifications(userId: string) {
    const { data, error } = await supabase.from("job_notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data as JobNotification[];
  },

  async analyzeResume(userId: string, content: string) {
    const { data, error } = await supabase.from("resume_analysis").insert({ user_id: userId, summary: content.slice(0, 240), ats_score: 80, suggestions: ["Add measurable impact", "Tailor keywords to the target role"] }).select().single();
    if (error) throw error;
    return data as ResumeAnalysis;
  },

  async searchJobs(query?: string) {
    const { data, error } = await supabase.from("jobs").select("*").ilike("title", `%${query ?? ""}%`).limit(8);
    if (error) throw error;
    return data as JobOpportunity[];
  },
};
