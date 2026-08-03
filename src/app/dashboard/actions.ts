"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import type { Json } from "@/types/database";
import {
  deleteAccountSchema,
  profileFormSchema,
  resumeRegisterSchema,
  type JobPreferences,
} from "@/lib/validations/profile";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logDbError, mapDbError } from "@/lib/errors/map-db-error";
import { PUBLIC_GENERIC_ERROR } from "@/lib/errors/public-messages";
import {
  isAllowedResumeFileName,
  isResumeStoragePathOwnedByUser,
  MAX_RESUME_BYTES,
  RESUME_UPLOAD_REJECT_MESSAGE,
  validateResumeFileContent,
} from "@/lib/resumes/storage-validation";
import {
  isResumeProcessingRateLimited,
  MAX_RESUME_UPLOADS_PER_HOUR,
  recordResumeProcessingEvent,
} from "@/lib/resumes/rate-limit";
import { parseResumeStoragePath } from "@/lib/resumes/safe-filename";

const DASHBOARD_PATHS = [
  "/dashboard",
  "/dashboard/profile",
  "/dashboard/resume",
  "/dashboard/settings",
  "/dashboard/applications",
] as const;

function revalidateDashboard() {
  for (const path of DASHBOARD_PATHS) {
    revalidatePath(path);
  }
}

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string };

export async function updateProfileAction(
  input: unknown,
): Promise<ActionResult> {
  const user = await requireUser("/dashboard/profile");
  const parsed = profileFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid profile" };
  }

  const values = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: values.full_name,
      phone: values.phone || null,
      headline: values.headline || null,
      location: values.location || null,
      bio: values.bio || null,
      skills: values.skills,
      preferences: values.preferences as JobPreferences as Json,
      profile_visibility: values.profile_visibility,
    })
    .eq("id", user.id);

  if (error) {
    logDbError("dashboard.updateProfile", error);
    return { ok: false, message: mapDbError(error).message };
  }

  revalidateDashboard();
  return { ok: true, message: "Profile saved." };
}

async function removeOrphanResumeObject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storagePath: string,
) {
  await supabase.storage.from("resumes").remove([storagePath]);
}

export async function registerResumeAction(input: {
  title: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
}): Promise<ActionResult & { resumeId?: string }> {
  const user = await requireUser("/dashboard/resume");
  const parsed = resumeRegisterSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid resume",
    };
  }

  const payload = parsed.data;

  if (!isResumeStoragePathOwnedByUser(payload.storagePath, user.id)) {
    return { ok: false, message: "Invalid resume file location." };
  }

  const parsedPath = parseResumeStoragePath(payload.storagePath);
  if (!parsedPath) {
    await removeOrphanResumeObject(
      await createClient(),
      payload.storagePath,
    );
    return { ok: false, message: "Invalid resume file location." };
  }

  if (
    !isAllowedResumeFileName(payload.fileName)
  ) {
    await removeOrphanResumeObject(
      await createClient(),
      payload.storagePath,
    );
    return { ok: false, message: RESUME_UPLOAD_REJECT_MESSAGE };
  }

  if (payload.byteSize > MAX_RESUME_BYTES) {
    await removeOrphanResumeObject(
      await createClient(),
      payload.storagePath,
    );
    return { ok: false, message: RESUME_UPLOAD_REJECT_MESSAGE };
  }

  const supabase = await createClient();

  if (
    await isResumeProcessingRateLimited(
      supabase,
      user.id,
      "upload",
      MAX_RESUME_UPLOADS_PER_HOUR,
    )
  ) {
    await removeOrphanResumeObject(supabase, payload.storagePath);
    return {
      ok: false,
      message: "Too many resume uploads. Please try again later.",
    };
  }

  const { data: blob, error: downloadError } = await supabase.storage
    .from("resumes")
    .download(payload.storagePath);

  if (downloadError || !blob) {
    logDbError("dashboard.registerResume.download", downloadError);
    return { ok: false, message: "Uploaded file could not be verified." };
  }

  if (blob.size > MAX_RESUME_BYTES) {
    await removeOrphanResumeObject(supabase, payload.storagePath);
    return { ok: false, message: RESUME_UPLOAD_REJECT_MESSAGE };
  }

  if (Math.abs(blob.size - payload.byteSize) > 1024) {
    await removeOrphanResumeObject(supabase, payload.storagePath);
    return { ok: false, message: "Uploaded file could not be verified." };
  }

  const bytes = new Uint8Array(await blob.arrayBuffer());
  const validation = validateResumeFileContent(
    bytes,
    payload.mimeType,
    payload.fileName,
  );

  if (!validation.ok) {
    await removeOrphanResumeObject(supabase, payload.storagePath);
    return { ok: false, message: validation.message };
  }

  const { data: inserted, error } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      title: payload.title,
      storage_path: payload.storagePath,
      file_name: payload.fileName,
      mime_type: payload.mimeType,
      byte_size: blob.size,
      is_primary: true,
      parsing_status: "pending",
    })
    .select("id")
    .single();

  if (error || !inserted) {
    logDbError("dashboard.registerResume.insert", error);
    await removeOrphanResumeObject(supabase, payload.storagePath);
    return { ok: false, message: mapDbError(error ?? {}).message };
  }

  await recordResumeProcessingEvent(supabase, user.id, "upload", inserted.id);

  revalidateDashboard();
  return {
    ok: true,
    message: "Resume uploaded.",
    resumeId: inserted.id,
  };
}

export async function withdrawApplicationAction(
  applicationId: string,
): Promise<ActionResult> {
  await requireUser("/dashboard/applications");
  const supabase = await createClient();

  const { error } = await supabase.rpc("withdraw_application", {
    p_application_id: applicationId,
  });

  if (error) {
    logDbError("dashboard.withdrawApplication", error);
    if (error.code === "P0001") {
      return { ok: false, message: "This application cannot be withdrawn." };
    }
    return { ok: false, message: mapDbError(error).message };
  }

  revalidatePath("/dashboard/applications");
  return { ok: true, message: "Application withdrawn." };
}

export async function unsaveJobAction(
  savedJobId: string,
): Promise<ActionResult> {
  const user = await requireUser("/dashboard/saved");
  const supabase = await createClient();
  const { error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("id", savedJobId)
    .eq("user_id", user.id);

  if (error) {
    logDbError("dashboard.unsaveJob", error);
    return { ok: false, message: mapDbError(error).message };
  }

  revalidatePath("/dashboard/saved");
  return { ok: true };
}

export async function requestDataExportAction(): Promise<ActionResult> {
  const user = await requireUser("/dashboard/settings");
  const supabase = await createClient();

  const { error } = await supabase.from("privacy_requests").insert({
    user_id: user.id,
    request_type: "export",
    details: "Self-service export from candidate dashboard",
  });

  if (error) {
    logDbError("dashboard.requestDataExport", error);
    return { ok: false, message: mapDbError(error).message };
  }

  return { ok: true, message: "Export request recorded. Download your data below." };
}

export async function deleteAccountAction(input: unknown): Promise<ActionResult> {
  const user = await requireUser("/dashboard/settings");
  const parsed = deleteAccountSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Confirmation required",
    };
  }

  const supabase = await createClient();
  await supabase.from("privacy_requests").insert({
    user_id: user.id,
    request_type: "delete",
    details: "Self-service account deletion from candidate dashboard",
  });

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, storage_path")
    .eq("user_id", user.id);

  const { data: referencedRows } = await supabase
    .from("applications")
    .select("resume_id")
    .eq("candidate_id", user.id)
    .not("resume_id", "is", null);

  const referencedIds = new Set(
    (referencedRows ?? [])
      .map((row) => row.resume_id)
      .filter((id): id is string => Boolean(id)),
  );

  const unreferencedPaths =
    resumes
      ?.filter((resume) => !referencedIds.has(resume.id))
      .map((resume) => resume.storage_path) ?? [];

  if (unreferencedPaths.length) {
    await supabase.storage.from("resumes").remove(unreferencedPaths);
  }

  const service = createServiceRoleClient();
  const { error: deleteError } = await service.auth.admin.deleteUser(user.id);
  if (deleteError) {
    logDbError("dashboard.deleteAccount", deleteError);
    return { ok: false, message: PUBLIC_GENERIC_ERROR };
  }

  await supabase.auth.signOut();
  return { ok: true, message: "Account deleted." };
}
