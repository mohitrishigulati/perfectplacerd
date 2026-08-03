export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export const ALLOWED_RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_EXTENSIONS = new Set([".pdf", ".doc", ".docx"]);

export function isResumeStoragePathOwnedByUser(
  storagePath: string,
  userId: string,
): boolean {
  if (!storagePath || storagePath.includes("..")) {
    return false;
  }
  const normalized = storagePath.replace(/^\/+/, "");
  const prefix = `${userId}/`;
  return normalized.startsWith(prefix) && normalized.length > prefix.length;
}

export function isAllowedResumeMimeType(mimeType: string): boolean {
  return ALLOWED_RESUME_MIME_TYPES.has(mimeType.trim().toLowerCase());
}

export function isAllowedResumeFileName(fileName: string): boolean {
  const lower = fileName.trim().toLowerCase();
  for (const ext of ALLOWED_EXTENSIONS) {
    if (lower.endsWith(ext)) {
      return true;
    }
  }
  return false;
}
