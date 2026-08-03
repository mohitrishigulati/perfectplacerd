"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import type { Json } from "@/types/database";
import {
  deleteAccountSchema,
  profileFormSchema,
  resumeUploadSchema,
  type JobPreferences,
} from "@/lib/validations/profile";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const DASHBOARD_PATHS = [
  "/dashboard",
  "/dashboard/profile",
  "/dashboard/resume",
  "/dashboard/settings",
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
    return { ok: false, message: error.message };
  }

  revalidateDashboard();
  return { ok: true, message: "Profile saved." };
}

export async function registerResumeAction(input: {
  title: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
}): Promise<ActionResult & { resumeId?: string }> {
  const user = await requireUser("/dashboard/resume");
  const parsed = resumeUploadSchema.safeParse({ title: input.title });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid resume" };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("resumes")
    .select("id, storage_path")
    .eq("user_id", user.id)
    .eq("is_primary", true)
    .maybeSingle();

  if (existing) {
    await supabase.storage.from("resumes").remove([existing.storage_path]);
    await supabase.from("resumes").delete().eq("id", existing.id);
  }

  const { data: inserted, error } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      storage_path: input.storagePath,
      file_name: input.fileName,
      mime_type: input.mimeType,
      byte_size: input.byteSize,
      is_primary: true,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateDashboard();
  return { ok: true, message: "Resume updated.", resumeId: inserted.id };
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
    return { ok: false, message: error.message };
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
    return { ok: false, message: error.message };
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
    .select("storage_path")
    .eq("user_id", user.id);

  if (resumes?.length) {
    await supabase.storage
      .from("resumes")
      .remove(resumes.map((r) => r.storage_path));
  }

  const service = createServiceRoleClient();
  const { error: deleteError } = await service.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return { ok: false, message: deleteError.message };
  }

  await supabase.auth.signOut();
  return { ok: true, message: "Account deleted." };
}
