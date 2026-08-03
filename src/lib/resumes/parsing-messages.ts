import type { ResumeParsingErrorCategory } from "@/lib/resumes/extraction/types";

export function getParsingUserMessage(category: string | null | undefined): string {
  switch (category as ResumeParsingErrorCategory | null | undefined) {
    case "provider_unavailable":
      return "Resume uploaded. Automatic profile suggestions are temporarily unavailable.";
    case "unsupported_legacy_doc":
      return "Resume uploaded. Legacy .doc reading is not supported yet; edit your profile manually.";
    case "ocr_unavailable":
      return "Resume uploaded. Image reading is not configured; edit your profile manually.";
    case "ocr_failed":
    case "insufficient_text":
      return "Resume uploaded, but we could not extract enough information for suggestions.";
    case "rate_limited":
      return "Too many resume processing attempts. Please try again later.";
    default:
      return "Resume uploaded.";
  }
}
