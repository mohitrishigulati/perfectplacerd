import type { JobPreferences } from "@/lib/validations/profile";
import {
  calculateProfileCompletion,
  type ProfileCompletionResult,
} from "@/lib/profile/completion";
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
  notify_application_status: boolean;
};

export async function getDashboardProfile(): Promise<DashboardProfile> {
  const user = await requireUser("/dashboard");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, phone, headline, location, bio, skills, preferences, profile_visibility, notify_application_status",
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

export type DashboardOverview = {
  displayName: string;
  email: string;
  headline: string | null;
  profileVisibility: ProfileVisibility;
  completion: ProfileCompletionResult;
  hasPrimaryResume: boolean;
  stats: {
    applications: number;
    saved: number;
    inReview: number;
  };
  recentApplications: ApplicationRow[];
  recentSaved: SavedJobRow[];
};

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const user = await requireUser("/dashboard");
  const supabase = await createClient();

  const [
    { data: profile },
    { data: resume },
    { data: applications },
    { data: savedRows },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "full_name, phone, headline, location, bio, skills, preferences, profile_visibility",
      )
      .eq("id", user.id)
      .single(),
    supabase
      .from("resumes")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_primary", true)
      .maybeSingle(),
    supabase
      .from("applications")
      .select("id, status, created_at, cover_letter, job_id")
      .eq("candidate_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("saved_jobs")
      .select("id, created_at, job_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const completion = calculateProfileCompletion({
    ...profile,
    skills: profile?.skills ?? [],
    preferences: (profile?.preferences ?? {}) as JobPreferences,
    hasPrimaryResume: Boolean(resume),
  });

  const [{ count: applicationsCount }, { count: savedCount }, { count: inReviewCount }] =
    await Promise.all([
      supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("candidate_id", user.id),
      supabase
        .from("saved_jobs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("candidate_id", user.id)
        .in("status", ["submitted", "under_review"]),
    ]);

  const applicationRows = applications ?? [];

  const jobIds = [
    ...new Set([
      ...applicationRows.map((row) => row.job_id),
      ...(savedRows ?? []).map((row) => row.job_id),
    ]),
  ];

  const { data: jobs } = jobIds.length
    ? await supabase
        .from("jobs")
        .select(
          "id, title, slug, location, employment_type, status",
        )
        .in("id", jobIds)
    : { data: [] as const };

  const jobsById = new Map((jobs ?? []).map((job) => [job.id, job]));

  const recentApplications: ApplicationRow[] = applicationRows
    .slice(0, 3)
    .map((application) => ({
      id: application.id,
      status: application.status,
      created_at: application.created_at,
      cover_letter: application.cover_letter,
      job: jobsById.get(application.job_id) ?? null,
    }));

  const recentSaved: SavedJobRow[] = (savedRows ?? []).flatMap((row) => {
    const job = jobsById.get(row.job_id);
    if (!job || job.status !== "published") {
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
  }).slice(0, 3);

  const displayName =
    profile?.full_name?.trim() ||
    user.email?.split("@")[0] ||
    "Candidate";

  return {
    displayName,
    email: user.email ?? "",
    headline: profile?.headline ?? null,
    profileVisibility:
      (profile?.profile_visibility as ProfileVisibility) ?? "private",
    completion,
    hasPrimaryResume: Boolean(resume),
    stats: {
      applications: applicationsCount ?? applicationRows.length,
      saved: savedCount ?? (savedRows?.length ?? 0),
      inReview: inReviewCount ?? 0,
    },
    recentApplications,
    recentSaved,
  };
}

export type PrimaryResume = {
  id: string;
  title: string;
  file_name: string | null;
  mime_type: string | null;
  byte_size: number | null;
  updated_at: string;
  parsing_status: import("@/types/database").ResumeParsingStatus;
  parsing_error_category: string | null;
  extracted_data: Record<string, unknown>;
  extraction_confidence: Record<string, number>;
  parsed_at: string | null;
};

export async function getPrimaryResume(): Promise<PrimaryResume | null> {
  const user = await requireUser("/dashboard/resume");
  const supabase = await createClient();
  const { data } = await supabase
    .from("resumes")
    .select(
      "id, title, file_name, mime_type, byte_size, updated_at, parsing_status, parsing_error_category, extracted_data, extraction_confidence, parsed_at",
    )
    .eq("user_id", user.id)
    .eq("is_primary", true)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    ...data,
    extracted_data: (data.extracted_data ?? {}) as Record<string, unknown>,
    extraction_confidence: (data.extraction_confidence ?? {}) as Record<
      string,
      number
    >,
  };
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
