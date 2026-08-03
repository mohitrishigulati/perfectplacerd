import type { ApplicationStatus } from "@/types/database";

export type ApplyEligibility =
  | { canApply: true }
  | {
      canApply: false;
      reason:
        | "auth_required"
        | "missing_resume"
        | "already_applied"
        | "not_published";
    };

export function getApplyEligibility(input: {
  isAuthenticated: boolean;
  hasPrimaryResume: boolean;
  existingApplicationStatus: ApplicationStatus | null;
  isPublished: boolean;
}): ApplyEligibility {
  if (!input.isPublished) {
    return { canApply: false, reason: "not_published" };
  }
  if (!input.isAuthenticated) {
    return { canApply: false, reason: "auth_required" };
  }
  if (input.existingApplicationStatus) {
    return { canApply: false, reason: "already_applied" };
  }
  if (!input.hasPrimaryResume) {
    return { canApply: false, reason: "missing_resume" };
  }
  return { canApply: true };
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  rejected: "Not selected",
  accepted: "Accepted",
  withdrawn: "Withdrawn",
};

export const WORK_MODE_LABELS = {
  onsite: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
} as const;

export const EXPERIENCE_LABELS = {
  entry: "Entry level",
  mid: "Mid level",
  senior: "Senior",
  lead: "Lead",
  executive: "Executive",
} as const;
