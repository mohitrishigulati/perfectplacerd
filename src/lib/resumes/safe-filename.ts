const MAX_STORED_NAME_LENGTH = 120;

const UNSAFE_NAME_PATTERN = /[^a-zA-Z0-9._-]+/g;

export function sanitizeStoredFileName(originalName: string): string {
  const trimmed = originalName.trim().replace(/[/\\]/g, "");
  if (!trimmed || trimmed === "." || trimmed === "..") {
    return "resume.bin";
  }

  const dot = trimmed.lastIndexOf(".");
  const base = dot > 0 ? trimmed.slice(0, dot) : trimmed;
  const ext = dot > 0 ? trimmed.slice(dot).toLowerCase() : "";

  const safeBase =
    base
      .replace(UNSAFE_NAME_PATTERN, "-")
      .replace(/^\.+/, "")
      .replace(/^-+|-+$/g, "") || "resume";

  const safeExt = ext.replace(/[^a-z0-9.]/gi, "").slice(0, 10);
  const combined = `${safeBase}${safeExt}`.slice(0, MAX_STORED_NAME_LENGTH);

  return combined || "resume.bin";
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function buildResumeStorageObjectPath(
  userId: string,
  objectId: string,
  originalFileName: string,
): string {
  const storedName = sanitizeStoredFileName(originalFileName);
  return `${userId}/${objectId}/${storedName}`;
}

export function parseResumeStoragePath(storagePath: string): {
  userId: string;
  objectId: string;
  storedFileName: string;
} | null {
  const normalized = storagePath.replace(/^\/+/, "");
  if (normalized.includes("..")) {
    return null;
  }
  const parts = normalized.split("/");
  if (parts.length !== 3) {
    return null;
  }
  const [userId, objectId, storedFileName] = parts;
  if (!userId || !objectId || !storedFileName || !UUID_RE.test(objectId)) {
    return null;
  }
  return { userId, objectId, storedFileName };
}
