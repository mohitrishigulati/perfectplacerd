import type { DashboardProfile } from "@/lib/dashboard/queries";
import type { ExtractedResumeProfile } from "@/lib/resumes/extraction/types";
import type { ProfileFormValues } from "@/lib/validations/profile";
import type { SuggestionFieldKey } from "@/lib/validations/resume-suggestions";

export type FieldComparisonRow = {
  key: SuggestionFieldKey;
  label: string;
  current: string;
  suggested: string;
  lowConfidence: boolean;
  canApply: boolean;
  defaultSelected: boolean;
};

function formatCurrent(value: string | string[] | null | undefined): string {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return value?.trim() ?? "";
}

export function buildSuggestionComparisonRows(input: {
  profile: Pick<
    DashboardProfile,
    | "full_name"
    | "phone"
    | "headline"
    | "location"
    | "bio"
    | "skills"
    | "preferences"
  >;
  extracted: ExtractedResumeProfile;
  confidence: Record<string, number>;
}): FieldComparisonRow[] {
  const { profile, extracted, confidence } = input;

  const rows: FieldComparisonRow[] = [];

  const push = (
    key: SuggestionFieldKey,
    label: string,
    current: string,
    suggested: string | undefined,
  ) => {
    const value = suggested?.trim();
    if (!value) {
      return;
    }
    const currentTrimmed = current.trim();
    const lowConfidence = (confidence[key] ?? confidence.bio ?? 0) < 0.7;
    rows.push({
      key,
      label,
      current: currentTrimmed || "—",
      suggested: value,
      lowConfidence,
      canApply: true,
      defaultSelected: !currentTrimmed,
    });
  };

  push("full_name", "Full name", profile.full_name ?? "", extracted.full_name);
  push("phone", "Phone", profile.phone ?? "", extracted.phone);
  push("headline", "Headline", profile.headline ?? "", extracted.headline);
  push("location", "Location", profile.location ?? "", extracted.location);
  push(
    "bio",
    "Professional summary",
    profile.bio ?? "",
    extracted.professional_summary,
  );

  if (extracted.skills?.length) {
    push(
      "skills",
      "Skills",
      formatCurrent(profile.skills),
      extracted.skills.join(", "),
    );
  }

  if (extracted.preferred_locations?.length) {
    push(
      "preferred_locations",
      "Preferred locations",
      formatCurrent(profile.preferences?.preferredLocations),
      extracted.preferred_locations.join(", "),
    );
  }

  return rows;
}

export function mergeAcceptedSuggestions(input: {
  profile: ProfileFormValues;
  extracted: ExtractedResumeProfile;
  acceptedFields: SuggestionFieldKey[];
  overwriteExisting: boolean;
}): ProfileFormValues {
  const next = structuredClone(input.profile);
  const { overwriteExisting } = input;

  for (const field of input.acceptedFields) {
    if (field === "full_name" && input.extracted.full_name) {
      if (overwriteExisting || !next.full_name.trim()) {
        next.full_name = input.extracted.full_name;
      }
    }
    if (field === "phone" && input.extracted.phone) {
      if (overwriteExisting || !next.phone?.trim()) {
        next.phone = input.extracted.phone;
      }
    }
    if (field === "headline" && input.extracted.headline) {
      if (overwriteExisting || !next.headline?.trim()) {
        next.headline = input.extracted.headline;
      }
    }
    if (field === "location" && input.extracted.location) {
      if (overwriteExisting || !next.location?.trim()) {
        next.location = input.extracted.location;
      }
    }
    if (field === "bio" && input.extracted.professional_summary) {
      if (overwriteExisting || !next.bio?.trim()) {
        next.bio = input.extracted.professional_summary;
      }
    }
    if (field === "skills" && input.extracted.skills?.length) {
      if (overwriteExisting || next.skills.length === 0) {
        next.skills = input.extracted.skills.slice(0, 30);
      }
    }
    if (field === "preferred_locations" && input.extracted.preferred_locations) {
      const current = next.preferences.preferredLocations ?? [];
      if (overwriteExisting || current.length === 0) {
        next.preferences = {
          ...next.preferences,
          preferredLocations: input.extracted.preferred_locations.slice(0, 10),
        };
      }
    }
  }

  return next;
}
