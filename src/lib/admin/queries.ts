import "server-only";

import { assertAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus, JobStatus, ProfileVisibility } from "@/types/database";

export async function getAdminOverviewStats() {
  await assertAdmin("/admin");
  const supabase = await createClient();

  const [jobs, applications, profiles] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  return {
    jobs: jobs.count ?? 0,
    applications: applications.count ?? 0,
    candidates: profiles.count ?? 0,
  };
}

export type AdminJobRow = {
  id: string;
  title: string;
  slug: string;
  status: JobStatus;
  location: string | null;
  published_at: string | null;
  updated_at: string;
  applicationCount: number;
};

export async function getAdminJobs(): Promise<AdminJobRow[]> {
  await assertAdmin("/admin/jobs");
  const supabase = await createClient();

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, slug, status, location, published_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const { data: applicationCounts } = await supabase
    .from("applications")
    .select("job_id");

  const countByJob = new Map<string, number>();
  for (const row of applicationCounts ?? []) {
    countByJob.set(row.job_id, (countByJob.get(row.job_id) ?? 0) + 1);
  }

  return (jobs ?? []).map((job) => ({
    ...job,
    applicationCount: countByJob.get(job.id) ?? 0,
  }));
}

export async function getAdminJobById(jobId: string) {
  await assertAdmin(`/admin/jobs/${jobId}/edit`);
  const supabase = await createClient();
  const { data, error } = await supabase.from("jobs").select("*").eq("id", jobId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export type AdminApplicationRow = {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  cover_letter: string | null;
  candidate: {
    id: string;
    email: string;
    full_name: string | null;
    headline: string | null;
    location: string | null;
    phone: string | null;
    profile_visibility: ProfileVisibility;
  } | null;
  resume: {
    id: string;
    title: string;
    file_name: string | null;
    updated_at: string;
  } | null;
};

export async function getAdminJobApplications(jobId: string): Promise<{
  job: { id: string; title: string; slug: string; status: JobStatus };
  applications: AdminApplicationRow[];
}> {
  await assertAdmin(`/admin/jobs/${jobId}/applications`);
  const supabase = await createClient();

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, title, slug, status")
    .eq("id", jobId)
    .maybeSingle();

  if (jobError || !job) {
    throw new Error(jobError?.message ?? "Job not found");
  }

  const { data: applications, error } = await supabase
    .from("applications")
    .select("id, status, created_at, cover_letter, candidate_id, resume_id")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!applications?.length) {
    return { job, applications: [] };
  }

  const candidateIds = [...new Set(applications.map((a) => a.candidate_id))];
  const resumeIds = [
    ...new Set(applications.map((a) => a.resume_id).filter(Boolean) as string[]),
  ];

  const [{ data: profiles }, { data: resumes }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, headline, location, phone, profile_visibility")
      .in("id", candidateIds),
    resumeIds.length
      ? supabase
          .from("resumes")
          .select("id, title, file_name, updated_at, user_id")
          .in("id", resumeIds)
      : Promise.resolve({ data: [] as { id: string; title: string; file_name: string | null; updated_at: string; user_id: string }[] }),
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const resumeById = new Map((resumes ?? []).map((r) => [r.id, r]));

  return {
    job,
    applications: applications.map((application) => ({
      id: application.id,
      status: application.status,
      created_at: application.created_at,
      cover_letter: application.cover_letter,
      candidate: profileById.get(application.candidate_id) ?? null,
      resume: application.resume_id
        ? resumeById.get(application.resume_id) ?? null
        : null,
    })),
  };
}

export type AdminCandidateRow = {
  id: string;
  email: string;
  full_name: string | null;
  headline: string | null;
  location: string | null;
  profile_visibility: ProfileVisibility;
  skills: string[];
  updated_at: string;
  primaryResume: {
    id: string;
    file_name: string | null;
    updated_at: string;
  } | null;
};

export async function getAdminCandidates(): Promise<AdminCandidateRow[]> {
  await assertAdmin("/admin/candidates");
  const supabase = await createClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, headline, location, profile_visibility, skills, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, user_id, file_name, updated_at")
    .eq("is_primary", true);

  const resumeByUser = new Map((resumes ?? []).map((r) => [r.user_id, r]));

  return (profiles ?? []).map((profile) => {
    const resume = resumeByUser.get(profile.id);
    return {
      ...profile,
      skills: profile.skills ?? [],
      primaryResume: resume
        ? {
            id: resume.id,
            file_name: resume.file_name,
            updated_at: resume.updated_at,
          }
        : null,
    };
  });
}
