export type ResumeParsingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type ResumeParsingErrorCategory =
  | "unsupported_legacy_doc"
  | "insufficient_text"
  | "ocr_unavailable"
  | "ocr_failed"
  | "provider_unavailable"
  | "provider_failed"
  | "rate_limited"
  | "validation_failed";

export type EducationSuggestion = {
  institution?: string;
  degree?: string;
  field?: string;
  end_year?: number;
};

export type EmploymentSuggestion = {
  company?: string;
  title?: string;
  start_year?: number;
  end_year?: number;
  summary?: string;
};

export type ExtractedResumeProfile = {
  full_name?: string;
  phone?: string;
  email?: string;
  headline?: string;
  location?: string;
  professional_summary?: string;
  skills?: string[];
  total_experience_years?: number;
  current_company?: string;
  current_job_title?: string;
  education?: EducationSuggestion[];
  employment_history?: EmploymentSuggestion[];
  preferred_locations?: string[];
};

export type FieldConfidenceMap = Partial<
  Record<keyof ExtractedResumeProfile | "bio", number>
>;

export type ResumeTextExtractionResult =
  | { ok: true; text: string; usedOcr: boolean }
  | {
      ok: false;
      category: ResumeParsingErrorCategory;
      message: string;
      preserveUpload: boolean;
    };

export type ResumeExtractionResult =
  | {
      ok: true;
      data: ExtractedResumeProfile;
      confidence: FieldConfidenceMap;
      needsReview: (keyof ExtractedResumeProfile)[];
    }
  | {
      ok: false;
      category: ResumeParsingErrorCategory;
      message: string;
    };

export type ResumeExtractorContext = {
  mimeType: string;
  fileKind: string;
  normalizedText: string;
};

export interface ResumeExtractor {
  readonly id: string;
  extractStructuredProfile(
    context: ResumeExtractorContext,
  ): Promise<ResumeExtractionResult>;
}

function resolveExtractionProviderName(): string | null {
  const raw = process.env.RESUME_EXTRACTION_PROVIDER?.trim().toLowerCase();
  if (raw === "off" || raw === "none") {
    return null;
  }
  return raw || "heuristic";
}

export function isResumeExtractionConfigured(): boolean {
  const provider = resolveExtractionProviderName();
  if (!provider) {
    return false;
  }
  if (provider === "heuristic") {
    return true;
  }
  if (provider === "openai") {
    return Boolean(process.env.OPENAI_API_KEY?.trim());
  }
  return false;
}

export function getConfiguredResumeExtractorId(): string | null {
  if (!isResumeExtractionConfigured()) {
    return null;
  }
  return resolveExtractionProviderName();
}

