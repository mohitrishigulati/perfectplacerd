import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { DetectedFileKind } from "@/lib/resumes/file-signatures";
import { extractResumeTextFromBytes } from "@/lib/resumes/extraction/text-extract";
import { getResumeExtractor } from "@/lib/resumes/extraction/provider";
import { logResumeParseEvent } from "@/lib/resumes/parse-log";
import type { Database, Json } from "@/types/database";
import type {
  ExtractedResumeProfile,
  FieldConfidenceMap,
} from "@/lib/resumes/extraction/types";
import { isResumeExtractionConfigured } from "@/lib/resumes/extraction/types";

type Client = SupabaseClient<Database>;

export async function runResumeParsingPipeline(input: {
  supabase: Client;
  resumeId: string;
  userId: string;
  bytes: Uint8Array;
  mimeType: string;
  kind: DetectedFileKind;
}): Promise<void> {
  const { supabase, resumeId, userId, bytes, mimeType, kind } = input;

  await supabase
    .from("resumes")
    .update({
      parsing_status: "processing",
      parsing_error_category: null,
    })
    .eq("id", resumeId)
    .eq("user_id", userId);

  logResumeParseEvent({ resumeId, userId, stage: "processing", status: "processing" });

  const textResult = await extractResumeTextFromBytes(bytes, kind);

  if (!textResult.ok) {
    await supabase
      .from("resumes")
      .update({
        parsing_status: "failed",
        parsing_error_category: textResult.category,
        extracted_data: {} as Json,
        extraction_confidence: {} as Json,
        parsed_at: new Date().toISOString(),
      })
      .eq("id", resumeId)
      .eq("user_id", userId);

    logResumeParseEvent({
      resumeId,
      userId,
      stage: "text_extract",
      category: textResult.category,
      status: "failed",
    });
    return;
  }

  if (!isResumeExtractionConfigured()) {
    await supabase
      .from("resumes")
      .update({
        parsing_status: "failed",
        parsing_error_category: "provider_unavailable",
        extracted_data: {} as Json,
        extraction_confidence: {} as Json,
        parsed_at: new Date().toISOString(),
      })
      .eq("id", resumeId)
      .eq("user_id", userId);

    logResumeParseEvent({
      resumeId,
      userId,
      stage: "structurer",
      category: "provider_unavailable",
      status: "failed",
    });
    return;
  }

  const extractor = getResumeExtractor();
  if (!extractor) {
    await supabase
      .from("resumes")
      .update({
        parsing_status: "failed",
        parsing_error_category: "provider_unavailable",
        extracted_data: {} as Json,
        extraction_confidence: {} as Json,
        parsed_at: new Date().toISOString(),
      })
      .eq("id", resumeId)
      .eq("user_id", userId);
    return;
  }

  const structured = await extractor.extractStructuredProfile({
    mimeType,
    fileKind: kind,
    normalizedText: textResult.text,
  });

  if (!structured.ok) {
    await supabase
      .from("resumes")
      .update({
        parsing_status: "failed",
        parsing_error_category: structured.category,
        extracted_data: {} as Json,
        extraction_confidence: {} as Json,
        parsed_at: new Date().toISOString(),
      })
      .eq("id", resumeId)
      .eq("user_id", userId);

    logResumeParseEvent({
      resumeId,
      userId,
      stage: "structurer",
      category: structured.category,
      status: "failed",
    });
    return;
  }

  const payload = {
    ...structured.data,
    _meta: {
      needsReview: structured.needsReview,
      usedOcr: textResult.usedOcr,
      extractorId: extractor.id,
    },
  } satisfies ExtractedResumeProfile & {
    _meta?: Record<string, unknown>;
  };

  await supabase
    .from("resumes")
    .update({
      parsing_status: "completed",
      parsing_error_category: null,
      extracted_data: payload as Json,
      extraction_confidence: structured.confidence as Json,
      parsed_at: new Date().toISOString(),
    })
    .eq("id", resumeId)
    .eq("user_id", userId);

  logResumeParseEvent({
    resumeId,
    userId,
    stage: "completed",
    status: "completed",
  });
}

export function isLowConfidenceField(
  confidence: FieldConfidenceMap,
  field: keyof ExtractedResumeProfile,
): boolean {
  const score = confidence[field];
  return score === undefined || score < 0.7;
}
