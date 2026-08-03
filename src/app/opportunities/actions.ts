"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getApplyEligibility } from "@/lib/opportunities/apply";
import { getSessionUser } from "@/lib/auth/session";
import { authRedirectUrl } from "@/lib/auth/paths";
import { sanitizeReturnPath } from "@/lib/auth/return-path";
import { createClient } from "@/lib/supabase/server";
import { getAuthCallbackOrigin } from "@/lib/site/url";
import { logDbError, mapDbError } from "@/lib/errors/map-db-error";

export type OpportunityActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string };

function trustedAuthRedirect(nextPath: string): never {
  const safePath = sanitizeReturnPath(nextPath, "/opportunities");
  redirect(authRedirectUrl(safePath, getAuthCallbackOrigin()));
}

export async function saveOpportunityAction(
  jobId: string,
  returnPath: string,
): Promise<OpportunityActionResult> {
  const safePath = sanitizeReturnPath(returnPath, "/opportunities");
  const user = await getSessionUser();
  if (!user) {
    trustedAuthRedirect(safePath);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("saved_jobs").insert({
    user_id: user!.id,
    job_id: jobId,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: true, message: "Already saved." };
    }
    logDbError("opportunities.save", error);
    return { ok: false, message: mapDbError(error).message };
  }

  revalidatePath(safePath);
  revalidatePath("/dashboard/saved");
  revalidatePath("/opportunities");
  return { ok: true, message: "Opportunity saved." };
}

export async function unsaveOpportunityAction(
  jobId: string,
  returnPath: string,
): Promise<OpportunityActionResult> {
  const safePath = sanitizeReturnPath(returnPath, "/opportunities");
  const user = await getSessionUser();
  if (!user) {
    trustedAuthRedirect(safePath);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("user_id", user!.id)
    .eq("job_id", jobId);

  if (error) {
    logDbError("opportunities.unsave", error);
    return { ok: false, message: mapDbError(error).message };
  }

  revalidatePath(safePath);
  revalidatePath("/dashboard/saved");
  return { ok: true, message: "Removed from saved opportunities." };
}

export async function applyToOpportunityAction(input: {
  jobId: string;
  slug: string;
  coverLetter?: string;
}): Promise<OpportunityActionResult> {
  const returnPath = sanitizeReturnPath(
    `/opportunities/${input.slug}`,
    "/opportunities",
  );
  const user = await getSessionUser();
  if (!user) {
    trustedAuthRedirect(returnPath);
  }

  const supabase = await createClient();

  const [{ data: job }, { data: resume }, { data: existing }] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, status")
      .eq("id", input.jobId)
      .eq("status", "published")
      .maybeSingle(),
    supabase
      .from("resumes")
      .select("id")
      .eq("user_id", user!.id)
      .eq("is_primary", true)
      .maybeSingle(),
    supabase
      .from("applications")
      .select("status")
      .eq("candidate_id", user!.id)
      .eq("job_id", input.jobId)
      .maybeSingle(),
  ]);

  const eligibility = getApplyEligibility({
    isAuthenticated: true,
    hasPrimaryResume: Boolean(resume),
    existingApplicationStatus: existing?.status ?? null,
    isPublished: Boolean(job),
  });

  if (!eligibility.canApply) {
    switch (eligibility.reason) {
      case "already_applied":
        return {
          ok: false,
          message: "You have already applied to this opportunity.",
        };
      case "missing_resume":
        return {
          ok: false,
          message: "Upload a primary resume in your dashboard before applying.",
        };
      default:
        return { ok: false, message: "This opportunity is not open for applications." };
    }
  }

  const { error } = await supabase.from("applications").insert({
    job_id: input.jobId,
    candidate_id: user!.id,
    resume_id: resume!.id,
    cover_letter: input.coverLetter?.trim() || null,
    status: "submitted",
  });

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        message: "You have already applied to this opportunity.",
      };
    }
    logDbError("opportunities.apply", error);
    return { ok: false, message: mapDbError(error).message };
  }

  revalidatePath(returnPath);
  revalidatePath("/dashboard/applications");
  revalidatePath("/opportunities");
  return { ok: true, message: "Application submitted with your current resume." };
}
