"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { logDbError, mapDbError } from "@/lib/errors/map-db-error";
import { runResumeParsingPipeline } from "@/lib/resumes/extraction/pipeline";
import {
  isResumeProcessingRateLimited,
  MAX_RESUME_PARSES_PER_HOUR,
  recordResumeProcessingEvent,
} from "@/lib/resumes/rate-limit";
import {
  isResumeStoragePathOwnedByUser,
  validateResumeFileContent,
} from "@/lib/resumes/storage-validation";
import type { ActionResult } from "@/app/dashboard/actions";
import { applyResumeSuggestionsSchema } from "@/lib/validations/resume-suggestions";
import { profileFormSchema } from "@/lib/validations/profile";
import { mergeAcceptedSuggestions } from "@/lib/resumes/apply-suggestions";
import type { Json } from "@/types/database";
import type { ExtractedResumeProfile } from "@/lib/resumes/extraction/types";

const RESUME_PATH = "/dashboard/resume";

function revalidateResumeFlow() {
  revalidatePath(RESUME_PATH);
  revalidatePath("/dashboard/profile");
}

export async function parseResumeAction(resumeId: string): Promise<ActionResult> {
  const user = await requireUser(RESUME_PATH);
  const supabase = await createClient();

  if (
    await isResumeProcessingRateLimited(
      supabase,
      user.id,
      "parse",
      MAX_RESUME_PARSES_PER_HOUR,
    )
  ) {
    return {
      ok: false,
      message: "Too many resume processing attempts. Please try again later.",
    };
  }

  const { data: resume, error } = await supabase
    .from("resumes")
    .select("id, user_id, storage_path, mime_type, file_name")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !resume) {
    return { ok: false, message: "Resume not found." };
  }

  if (!isResumeStoragePathOwnedByUser(resume.storage_path, user.id)) {
    return { ok: false, message: "Invalid resume file location." };
  }

  const { data: blob, error: downloadError } = await supabase.storage
    .from("resumes")
    .download(resume.storage_path);

  if (downloadError || !blob) {
    logDbError("dashboard.parseResume.download", downloadError);
    return { ok: false, message: "Resume file could not be read." };
  }

  const bytes = new Uint8Array(await blob.arrayBuffer());
  const validation = validateResumeFileContent(
    bytes,
    resume.mime_type ?? "application/octet-stream",
    resume.file_name ?? "resume.bin",
  );

  if (!validation.ok) {
    return { ok: false, message: validation.message };
  }

  await recordResumeProcessingEvent(supabase, user.id, "parse", resume.id);

  await runResumeParsingPipeline({
    supabase,
    resumeId: resume.id,
    userId: user.id,
    bytes,
    mimeType: resume.mime_type ?? "application/octet-stream",
    kind: validation.kind,
  });

  revalidateResumeFlow();
  return { ok: true, message: "Resume processing finished." };
}

export async function retryParseResumeAction(
  resumeId: string,
): Promise<ActionResult> {
  return parseResumeAction(resumeId);
}

export async function applyResumeSuggestionsAction(
  input: unknown,
): Promise<ActionResult> {
  const user = await requireUser(RESUME_PATH);
  const parsed = applyResumeSuggestionsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid selection",
    };
  }

  const supabase = await createClient();

  const [{ data: resume }, { data: profile }] = await Promise.all([
    supabase
      .from("resumes")
      .select("id, parsing_status, extracted_data")
      .eq("id", parsed.data.resumeId)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select(
        "full_name, phone, headline, location, bio, skills, preferences, profile_visibility",
      )
      .eq("id", user.id)
      .single(),
  ]);

  if (!resume || resume.parsing_status !== "completed") {
    return { ok: false, message: "No completed resume suggestions to apply." };
  }

  if (!profile) {
    return { ok: false, message: "Profile not found." };
  }

  const extracted = resume.extracted_data as ExtractedResumeProfile & {
    _meta?: unknown;
  };

  const currentProfile = profileFormSchema.parse({
    full_name: profile.full_name ?? "",
    phone: profile.phone ?? "",
    headline: profile.headline ?? "",
    location: profile.location ?? "",
    bio: profile.bio ?? "",
    skills: profile.skills ?? [],
    preferences: profile.preferences ?? {},
    profile_visibility: profile.profile_visibility ?? "private",
  });

  const merged = mergeAcceptedSuggestions({
    profile: currentProfile,
    extracted,
    acceptedFields: parsed.data.acceptedFields,
    overwriteExisting: parsed.data.overwriteExisting ?? false,
  });

  const validated = profileFormSchema.safeParse(merged);
  if (!validated.success) {
    return {
      ok: false,
      message: validated.error.issues[0]?.message ?? "Invalid profile values",
    };
  }

  const values = validated.data;
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: values.full_name,
      phone: values.phone || null,
      headline: values.headline || null,
      location: values.location || null,
      bio: values.bio || null,
      skills: values.skills,
      preferences: values.preferences as Json,
      profile_visibility: values.profile_visibility,
    })
    .eq("id", user.id);

  if (error) {
    logDbError("dashboard.applyResumeSuggestions", error);
    return { ok: false, message: mapDbError(error).message };
  }

  revalidateResumeFlow();
  return { ok: true, message: "Selected profile suggestions applied." };
}
