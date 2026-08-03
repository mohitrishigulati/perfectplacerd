import { isAuthPath } from "@/lib/auth/paths";

/** Server-side safe relative path for post-action redirects (never open redirects). */
export function sanitizeReturnPath(
  path: string | null | undefined,
  fallback: string,
): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }
  if (isAuthPath(path)) {
    return fallback;
  }
  return path;
}
