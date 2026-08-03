import "server-only";

import type { DetectedFileKind } from "@/lib/resumes/file-signatures";
import {
  isTextSufficientForStructuring,
  normalizeResumeText,
} from "@/lib/resumes/extraction/normalize-text";
import type { ResumeTextExtractionResult } from "@/lib/resumes/extraction/types";

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default as (
    buffer: Buffer,
  ) => Promise<{ text?: string }>;
  const result = await pdfParse(Buffer.from(bytes));
  return normalizeResumeText(result.text ?? "");
}

async function extractDocxText(bytes: Uint8Array): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
  return normalizeResumeText(result.value ?? "");
}

export async function extractResumeTextFromBytes(
  bytes: Uint8Array,
  kind: DetectedFileKind,
): Promise<ResumeTextExtractionResult> {
  try {
    if (kind === "pdf") {
      const text = await extractPdfText(bytes);
      if (!isTextSufficientForStructuring(text)) {
        return {
          ok: false,
          category: "insufficient_text",
          message:
            "Could not read enough embedded text from this PDF. Upload a text-based PDF, DOCX, or a clear resume image.",
          preserveUpload: true,
        };
      }
      return { ok: true, text, usedOcr: false };
    }

    if (kind === "docx") {
      const text = await extractDocxText(bytes);
      if (!isTextSufficientForStructuring(text)) {
        return {
          ok: false,
          category: "insufficient_text",
          message: "Could not read enough text from this document.",
          preserveUpload: true,
        };
      }
      return { ok: true, text, usedOcr: false };
    }

    if (kind === "doc") {
      return {
        ok: false,
        category: "unsupported_legacy_doc",
        message:
          "Legacy .doc files are stored but automatic reading is not supported yet. You can still edit your profile manually.",
        preserveUpload: true,
      };
    }

    if (kind === "jpeg" || kind === "png") {
      return {
        ok: false,
        category: "ocr_unavailable",
        message: "Image resumes are stored but automatic reading is not supported.",
        preserveUpload: true,
      };
    }

    return {
      ok: false,
      category: "validation_failed",
      message: "Unsupported resume format for reading.",
      preserveUpload: true,
    };
  } catch {
    return {
      ok: false,
      category: "provider_failed",
      message: "Resume reading failed. Try again later.",
      preserveUpload: true,
    };
  }
}
