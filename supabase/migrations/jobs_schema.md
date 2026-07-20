# SchemeSync Jobs - Database Schema

This document describes the new database tables for the SchemeSync Jobs module.

## Collections

### job_users
Stores job seeker user accounts.

```
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- email (string)
- user_type (enum: 'job_seeker')
- created_at (timestamp)
- updated_at (timestamp)
```

### job_profiles
Extended professional profiles for job seekers.

```
- id (UUID, PK)
- user_id (UUID, FK to job_users)
- full_name (string)
- headline (string)
- summary (text)
- experience_level (string)
- employment_type (string)
- location_preference (string)
- current_company (string)
- current_title (string)
- linkedin_url (string)
- github_url (string)
- portfolio_url (string)
- skills (array of strings)
- education (array of objects)
- experience (array of objects)
- profile_completion (integer, 0-100)
- created_at (timestamp)
- updated_at (timestamp)
```

### companies
Employer companies posting jobs.

```
- id (UUID, PK)
- name (string)
- logo_url (string)
- website (string)
- description (text)
- industry (string)
- company_size (string)
- founded_year (integer)
- is_verified (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

### jobs
Job postings by companies.

```
- id (UUID, PK)
- company_id (UUID, FK to companies)
- title (string)
- slug (string)
- description (text)
- requirements (array of strings)
- benefits (array of strings)
- location (string)
- location_type (enum: 'remote', 'on-site', 'hybrid')
- salary_min (integer)
- salary_max (integer)
- currency (string)
- category (string)
- experience_level (string)
- employment_type (string)
- application_url (string, optional)
- ai_embedding (vector, optional)
- posted_at (timestamp)
- expires_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

### saved_jobs
Jobs saved by job seekers for later.

```
- id (UUID, PK)
- user_id (UUID, FK to job_users)
- job_id (UUID, FK to jobs)
- job_title (string, denormalized)
- company_name (string, denormalized)
- created_at (timestamp)
```

### job_applications
Job applications submitted by job seekers.

```
- id (UUID, PK)
- user_id (UUID, FK to job_users)
- job_id (UUID, FK to jobs)
- status (enum: 'draft', 'submitted', 'reviewed', 'interview', 'offer', 'rejected')
- compatibility_score (integer, 0-100)
- resume_id (UUID, FK to resumes, optional)
- cover_letter (text, optional)
- applied_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

### job_notifications
Notifications for job seekers.

```
- id (UUID, PK)
- user_id (UUID, FK to job_users)
- type (enum: 'job_match', 'application_update', 'interview_scheduled', 'offer_received')
- title (string)
- message (text)
- related_job_id (UUID, optional)
- related_application_id (UUID, optional)
- read (boolean)
- created_at (timestamp)
```

### interviews
Interview scheduling for job applications.

```
- id (UUID, PK)
- application_id (UUID, FK to job_applications)
- user_id (UUID, FK to job_users)
- company_id (UUID, FK to companies)
- interview_type (enum: 'phone', 'video', 'in-person')
- scheduled_at (timestamp)
- status (enum: 'scheduled', 'completed', 'cancelled')
- feedback (text, optional)
- created_at (timestamp)
- updated_at (timestamp)
```

### career_goals
Career goals set by job seekers.

```
- id (UUID, PK)
- user_id (UUID, FK to job_users)
- title (string)
- description (text)
- target_role (string)
- target_salary (integer)
- target_company (string, optional)
- timeline_months (integer)
- completed (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

### resumes
Uploaded resumes for job seekers.

```
- id (UUID, PK)
- user_id (UUID, FK to job_users)
- file_path (string)
- file_name (string)
- file_type (string)
- file_size (integer)
- is_primary (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

### resume_analysis
AI analysis results for resumes.

```
- id (UUID, PK)
- resume_id (UUID, FK to resumes)
- ats_score (integer, 0-100)
- key_skills (array of strings)
- experience_summary (text)
- improvements (array of strings)
- analyzed_at (timestamp)
```

### job_ai_recommendations
AI-generated job recommendations for users.

```
- id (UUID, PK)
- user_id (UUID, FK to job_users)
- job_id (UUID, FK to jobs)
- match_score (integer, 0-100)
- match_reason (text)
- missing_skills (array of strings)
- generated_at (timestamp)
```

### job_audit_logs
Audit log for admin monitoring.

```
- id (UUID, PK)
- user_id (UUID, optional)
- action (string)
- entity_type (string)
- entity_id (UUID)
- changes (jsonb)
- ip_address (string)
- created_at (timestamp)
```

## Row-Level Security (RLS)

All tables have RLS enabled:
- Users can only access their own records
- Companies can only manage their own jobs
- Admins have full access (via role-based checks)

## Indexes

Key indexes for performance:
- `jobs.company_id` - For fetching company jobs
- `job_applications.user_id` - For fetching user applications
- `job_profiles.user_id` - For fetching user profiles
- `saved_jobs.user_id` - For fetching saved jobs
- `job_ai_recommendations.user_id` - For recommendations
- `jobs.ai_embedding` - For vector similarity search (pgvector)

## Relationships

```
auth.users (1) ---< (many) job_users
job_users (1) ---< (many) job_profiles
job_users (1) ---< (many) job_applications
job_users (1) ---< (many) saved_jobs
job_users (1) ---< (many) job_notifications
job_users (1) ---< (many) interviews
job_users (1) ---< (many) career_goals
job_users (1) ---< (many) resumes
job_users (1) ---< (many) job_ai_recommendations

companies (1) ---< (many) jobs
companies (1) ---< (many) interviews

jobs (1) ---< (many) job_applications
jobs (1) ---< (many) saved_jobs
jobs (1) ---< (many) job_ai_recommendations

job_applications (1) ---< (many) interviews
job_applications (1) ---< (0..1) resumes

resumes (1) ---< (many) resume_analysis
```

## API Endpoints

The Jobs module provides these API routes:

- `GET /api/jobs/search` - Search and list jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/:id/apply` - Submit application
- `GET /api/jobs/recommendations` - Get AI recommendations
- `POST /api/profiles` - Create/update profile
- `GET /api/profiles` - Get user profile
- `POST /api/resumes` - Upload resume
- `POST /api/resumes/:id/analyze` - Analyze resume with AI
- `GET /api/applications` - List user applications
- `GET /api/applications/:id` - Get application details
- `POST /api/saved-jobs` - Save a job
- `DELETE /api/saved-jobs/:id` - Unsave a job
- `GET /api/interviews` - List scheduled interviews
- `POST /api/career-goals` - Set career goals
