"use server";

import { assertAdmin } from "@/lib/admin/auth";
import {
  canPerformJobStatusAction,
  resolveJobStatusAction,
  slugifyTitle,
  type JobStatusAction,
} from "@/lib/admin/jobs";
import {
  adminJobFormSchema,
  applicationStatusSchema,
} from "@/lib/validations/admin-job";
import { logDbError, mapDbError } from "@/lib/errors/map-db-error";
import { PUBLIC_GENERIC_ERROR } from "@/lib/errors/public-messages";
import { logServerError } from "@/lib/logging/server-error";
import { sendApplicationStatusChangedEmail } from "@/lib/email/application-status";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { JobStatus } from "@/types/database";

export type AdminActionResult =
  | { ok: true; message?: string; id?: string }
  | { ok: false; message: string };

function emptyToNull(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  return value.trim();
}

function revalidateAdminJobs(jobId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/jobs");
  revalidatePath("/opportunities");
  if (jobId) {
    revalidatePath(`/admin/jobs/${jobId}/edit`);
    revalidatePath(`/admin/jobs/${jobId}/applications`);
  }
}

export async function createJobAction(input: unknown): Promise<AdminActionResult> {
  const admin = await assertAdmin("/admin/jobs/new");
  const parsed = adminJobFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid job" };
  }

  const values = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      title: values.title,
      slug: values.slug || slugifyTitle(values.title),
      description: values.description,
      location: emptyToNull(values.location),
      employment_type: emptyToNull(values.employment_type),
      department: emptyToNull(values.department),
      industry: emptyToNull(values.industry),
      work_mode: values.work_mode || null,
      experience_level: values.experience_level || null,
      salary_min: values.salary_min === "" ? null : values.salary_min,
      salary_max: values.salary_max === "" ? null : values.salary_max,
      salary_currency: values.salary_currency,
      status: "draft",
      created_by: admin.id,
    })
    .select("id")
    .single();

  if (error) {
    logDbError("admin.createJob", error);
    return { ok: false, message: mapDbError(error).message };
  }

  revalidateAdminJobs(data.id);
  return { ok: true, id: data.id, message: "Opportunity draft created." };
}

export async function updateJobAction(
  jobId: string,
  input: unknown,
): Promise<AdminActionResult> {
  await assertAdmin(`/admin/jobs/${jobId}/edit`);
  const parsed = adminJobFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid job" };
  }

  const values = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("jobs")
    .update({
      title: values.title,
      slug: values.slug,
      description: values.description,
      location: emptyToNull(values.location),
      employment_type: emptyToNull(values.employment_type),
      department: emptyToNull(values.department),
      industry: emptyToNull(values.industry),
      work_mode: values.work_mode || null,
      experience_level: values.experience_level || null,
      salary_min: values.salary_min === "" ? null : values.salary_min,
      salary_max: values.salary_max === "" ? null : values.salary_max,
      salary_currency: values.salary_currency,
    })
    .eq("id", jobId);

  if (error) {
    logDbError("admin.updateJob", error);
    return { ok: false, message: mapDbError(error).message };
  }

  revalidateAdminJobs(jobId);
  return { ok: true, message: "Opportunity saved." };
}

export async function setJobStatusAction(
  jobId: string,
  action: JobStatusAction,
): Promise<AdminActionResult> {
  await assertAdmin(`/admin/jobs/${jobId}/edit`);

  if (!["publish", "pause", "close", "archive"].includes(action)) {
    return { ok: false, message: "Unknown status action." };
  }

  const supabase = await createClient();
  const { data: job, error: readError } = await supabase
    .from("jobs")
    .select("status")
    .eq("id", jobId)
    .maybeSingle();

  if (readError || !job) {
    logDbError("admin.setJobStatus.read", readError);
    return { ok: false, message: "Opportunity not found." };
  }

  if (!canPerformJobStatusAction(job.status as JobStatus, action)) {
    return { ok: false, message: `Cannot ${action} from status ${job.status}.` };
  }

  const nextStatus = resolveJobStatusAction(action);
  const { error } = await supabase
    .from("jobs")
    .update({ status: nextStatus })
    .eq("id", jobId);

  if (error) {
    logDbError("admin.setJobStatus", error);
    return { ok: false, message: mapDbError(error).message };
  }

  revalidateAdminJobs(jobId);
  return { ok: true, message: `Opportunity is now ${nextStatus}.` };
}

export async function updateApplicationStatusAction(input: {
  applicationId: string;
  jobId: string;
  status: unknown;
}): Promise<AdminActionResult> {
  await assertAdmin(`/admin/jobs/${input.jobId}/applications`);
  const parsed = applicationStatusSchema.safeParse(input.status);
  if (!parsed.success) {
    return { ok: false, message: "Invalid application status." };
  }

  const supabase = await createClient();

  const { data: application, error: readError } = await supabase
    .from("applications")
    .select("candidate_id")
    .eq("id", input.applicationId)
    .eq("job_id", input.jobId)
    .maybeSingle();

  if (readError || !application) {
    logDbError("admin.updateApplicationStatus.read", readError);
    return { ok: false, message: "Application not found." };
  }

  const { error } = await supabase
    .from("applications")
    .update({ status: parsed.data })
    .eq("id", input.applicationId)
    .eq("job_id", input.jobId);

  if (error) {
    logDbError("admin.updateApplicationStatus", error);
    return { ok: false, message: mapDbError(error).message };
  }

  revalidatePath(`/admin/jobs/${input.jobId}/applications`);
  revalidatePath("/dashboard/applications");

  const [{ data: candidate }, { data: job }] = await Promise.all([
    supabase
      .from("profiles")
      .select("email")
      .eq("id", application.candidate_id)
      .maybeSingle(),
    supabase.from("jobs").select("title").eq("id", input.jobId).maybeSingle(),
  ]);

  if (candidate?.email && job?.title) {
    try {
      await sendApplicationStatusChangedEmail({
        to: candidate.email,
        jobTitle: job.title,
        status: parsed.data,
      });
    } catch (emailError) {
      logServerError("admin.updateApplicationStatus.email", emailError);
    }
  }

  return { ok: true, message: "Application status updated." };
}

export async function createResumeDownloadUrlAction(
  resumeId: string,
): Promise<AdminActionResult & { url?: string }> {
  await assertAdmin("/admin/candidates");

  const supabase = await createClient();
  const { data: resume, error } = await supabase
    .from("resumes")
    .select("storage_path, file_name")
    .eq("id", resumeId)
    .maybeSingle();

  if (error || !resume) {
    logDbError("admin.createResumeDownloadUrl.read", error);
    return { ok: false, message: "Resume not found." };
  }

  const { data: signed, error: signError } = await supabase.storage
    .from("resumes")
    .createSignedUrl(resume.storage_path, 120);

  if (signError || !signed?.signedUrl) {
    logDbError("admin.createResumeDownloadUrl.sign", signError);
    return { ok: false, message: PUBLIC_GENERIC_ERROR };
  }

  return { ok: true, url: signed.signedUrl, message: resume.file_name ?? "Resume" };
}
