import { sanitizeNextPath } from "@/lib/auth/paths";
import { getSiteUrl } from "@/lib/site/url";

/** OTP / magic-link callback URL; host comes only from server env, never the client. */
export function buildSignInEmailRedirectTo(nextPath: string): string {
  const next = sanitizeNextPath(nextPath);
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}
