import { sanitizeNextPath } from "@/lib/auth/paths";

/** Client-safe post-sign-in destination (never trusts absolute URLs). */
export function resolvePostAuthRedirectPath(
  next: string | null | undefined,
): string {
  return sanitizeNextPath(next);
}
