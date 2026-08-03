import {
  detectFileKindFromBytes,
  isPasswordProtectedPdf,
  isZipDocx,
  type DetectedFileKind,
} from "@/lib/resumes/file-signatures";
import { parseResumeStoragePath } from "@/lib/resumes/safe-filename";

export const MAX_RESUME_BYTES = 10 * 1024 * 1024;

export const ALLOWED_RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png",
]);

const EXTENSION_TO_KIND: Record<string, DetectedFileKind> = {
  ".pdf": "pdf",
  ".doc": "doc",
  ".docx": "docx",
  ".jpg": "jpeg",
  ".jpeg": "jpeg",
  ".png": "png",
};

const MIME_TO_KIND: Record<string, DetectedFileKind> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "image/jpeg": "jpeg",
  "image/png": "png",
};

export type ResumeValidationFailure =
  | "path"
  | "extension"
  | "mime"
  | "size"
  | "signature"
  | "blocked"
  | "mismatch";

export type ResumeValidationResult =
  | { ok: true; kind: DetectedFileKind }
  | { ok: false; reason: ResumeValidationFailure; message: string };

export function getExtensionFromFileName(fileName: string): string | null {
  const lower = fileName.trim().toLowerCase();
  for (const ext of ALLOWED_EXTENSIONS) {
    if (lower.endsWith(ext)) {
      return ext;
    }
  }
  return null;
}

export function isResumeStoragePathOwnedByUser(
  storagePath: string,
  userId: string,
): boolean {
  const parsed = parseResumeStoragePath(storagePath);
  if (!parsed) {
    return false;
  }
  return parsed.userId === userId;
}

export function isAllowedResumeMimeType(mimeType: string): boolean {
  return ALLOWED_RESUME_MIME_TYPES.has(mimeType.trim().toLowerCase());
}

export function isAllowedResumeFileName(fileName: string): boolean {
  return getExtensionFromFileName(fileName) !== null;
}

export function validateResumeFileContent(
  bytes: Uint8Array,
  declaredMimeType: string,
  originalFileName: string,
): ResumeValidationResult {
  if (bytes.length > MAX_RESUME_BYTES) {
    return {
      ok: false,
      reason: "size",
      message: "Resumes must be 10 MB or smaller.",
    };
  }

  const ext = getExtensionFromFileName(originalFileName);
  if (!ext) {
    return {
      ok: false,
      reason: "extension",
      message: "Unsupported file type. Use PDF, Word, or JPEG/PNG images.",
    };
  }

  const mime = declaredMimeType.trim().toLowerCase();
  if (!isAllowedResumeMimeType(mime)) {
    return {
      ok: false,
      reason: "mime",
      message: "Unsupported file type. Use PDF, Word, or JPEG/PNG images.",
    };
  }

  const expectedFromExt = EXTENSION_TO_KIND[ext];
  const expectedFromMime = MIME_TO_KIND[mime];
  if (!expectedFromExt || expectedFromMime !== expectedFromExt) {
    return {
      ok: false,
      reason: "mismatch",
      message: "File type does not match the file extension.",
    };
  }

  const detected = detectFileKindFromBytes(bytes);

  if (detected === "zip") {
    if (ext === ".docx" && isZipDocx(bytes)) {
      return { ok: true, kind: "docx" };
    }
    return {
      ok: false,
      reason: "blocked",
      message: "Archive files are not accepted as resumes.",
    };
  }

  if (detected === "svg" || mime.includes("svg")) {
    return {
      ok: false,
      reason: "blocked",
      message: "SVG files are not accepted as resumes.",
    };
  }

  if (detected === "executable") {
    return {
      ok: false,
      reason: "blocked",
      message: "Executable files are not accepted as resumes.",
    };
  }

  if (expectedFromExt === "pdf") {
    if (detected !== "pdf") {
      return {
        ok: false,
        reason: "signature",
        message: "File content does not match a valid PDF.",
      };
    }
    if (isPasswordProtectedPdf(bytes)) {
      return {
        ok: false,
        reason: "blocked",
        message: "Password-protected PDFs cannot be processed.",
      };
    }
    return { ok: true, kind: "pdf" };
  }

  if (expectedFromExt === "doc") {
    if (detected !== "doc") {
      return {
        ok: false,
        reason: "signature",
        message: "File content does not match a valid Word document.",
      };
    }
    return { ok: true, kind: "doc" };
  }

  if (expectedFromExt === "docx") {
    if (isZipDocx(bytes)) {
      return { ok: true, kind: "docx" };
    }
    return {
      ok: false,
      reason: "signature",
      message: "File content does not match a valid DOCX document.",
    };
  }

  if (expectedFromExt === "jpeg") {
    if (detected !== "jpeg") {
      return {
        ok: false,
        reason: "signature",
        message: "File content does not match a valid JPEG image.",
      };
    }
    return { ok: true, kind: "jpeg" };
  }

  if (expectedFromExt === "png") {
    if (detected !== "png") {
      return {
        ok: false,
        reason: "signature",
        message: "File content does not match a valid PNG image.",
      };
    }
    return { ok: true, kind: "png" };
  }

  return {
    ok: false,
    reason: "signature",
    message: "Unsupported file type.",
  };
}

export const RESUME_UPLOAD_REJECT_MESSAGE =
  "Only PDF, Word (DOC/DOCX), or JPEG/PNG images up to 10 MB are allowed.";
