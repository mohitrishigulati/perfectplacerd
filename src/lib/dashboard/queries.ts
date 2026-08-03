import type { JobPreferences } from "@/lib/validations/profile";
import { calculateProfileCompletion } from "@/lib/profile/completion";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus, ProfileVisibility } from "@/types/database";

export type DashboardProfile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  headline: string | null;
  location: string | null;
  bio: string | null;
  skills: string[];
  preferences: JobPreferences;
  profile_visibility: ProfileVisibility;
};

export async function getDashboardProfile(): Promise<DashboardProfile> {
  const user = await requireUser("/dashboard");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, phone, headline, location, bio, skills, preferences, profile_visibility",
    )
    .eq("id", user.id)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Profile not found");
  }

  return {
    ...data,
    skills: data.skills ?? [],
    preferences: (data.preferences ?? {}) as JobPreferences,
  };
}

export async function getProfileCompletionForUser() {
  const user = await requireUser("/dashboard");
  const supabase = await createClient();

  const [{ data: profile }, { data: resume }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, phone, headline, location, bio, skills, preferences")
      .eq("id", user.id)
      .single(),
    supabase
      .from("resumes")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_primary", true)
      .maybeSingle(),
  ]);

  return calculateProfileCompletion({
    ...profile,
    skills: profile?.skills ?? [],
    preferences: (profile?.preferences ?? {}) as JobPreferences,
    hasPrimaryResume: Boolean(resume),
  });
}

export type PrimaryResume = {
  id: string;
  title: string;
  file_name: string | null;
  mime_type: string | null;
  byte_size: number | null;
  updated_at: string;
};

export async function getPrimaryResume(): Promise<PrimaryResume | null> {
  const user = await requireUser("/dashboard/resume");
  const supabase = await createClient();
  const { data } = await supabase
    .from("resumes")
    .select("id, title, file_name, mime_type, byte_size, updated_at")
    .eq("user_id", user.id)
    .eq("is_primary", true)
    .maybeSingle();

  return data;
}

export type ApplicationRow = {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  cover_letter: string | null;
  job: {
    id: string;
    title: string;
    slug: string;
    location: string | null;
    status: string;
  } | null;
};

export async function getCandidateApplications(): Promise<ApplicationRow[]> {
  const user = await requireUser("/dashboard/applications");
  const supabase = await createClient();

  const { data: applications, error } = await supabase
    .from("applications")
    .select("id, status, created_at, cover_letter, job_id")
    .eq("candidate_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!applications?.length) {
    return [];
  }

  const jobIds = [...new Set(applications.map((row) => row.job_id))];
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, slug, location, status")
    .in("id", jobIds);

  const jobsById = new Map((jobs ?? []).map((job) => [job.id, job]));

  return applications.map((application) => ({
    id: application.id,
    status: application.status,
    created_at: application.created_at,
    cover_letter: application.cover_letter,
    job: jobsById.get(application.job_id) ?? null,
  }));
}

export type SavedJobRow = {
  id: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    slug: string;
    location: string | null;
    employment_type: string | null;
  };
};

export async function getSavedJobs(): Promise<SavedJobRow[]> {
  const user = await requireUser("/dashboard/saved");
  const supabase = await createClient();

  const { data: saved, error } = await supabase
    .from("saved_jobs")
    .select("id, created_at, job_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!saved?.length) {
    return [];
  }

  const jobIds = saved.map((row) => row.job_id);
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, slug, location, employment_type, status")
    .in("id", jobIds)
    .eq("status", "published");

  const jobsById = new Map((jobs ?? []).map((job) => [job.id, job]));

  return saved.flatMap((row) => {
    const job = jobsById.get(row.job_id);
    if (!job) {
      return [];
    }
    return [
      {
        id: row.id,
        created_at: row.created_at,
        job: {
          id: job.id,
          title: job.title,
          slug: job.slug,
          location: job.location,
          employment_type: job.employment_type,
        },
      },
    ];
  });
}
