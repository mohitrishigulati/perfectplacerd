const DEFAULT_SITE_URL = "https://perfect-placer-v2.vercel.app";
const DEFAULT_LOCAL_AUTH_URL = "http://localhost:3000";

function normalizeSiteOrigin(raw: string): string {
  const withProtocol = raw.startsWith("http") ? raw : `https://${raw}`;
  return withProtocol.replace(/\/$/, "");
}

function isRunningOnVercel(): boolean {
  return Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_URL?.trim());
}

/** Canonical production origin (no trailing slash). */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (!raw) {
    return DEFAULT_SITE_URL;
  }

  return normalizeSiteOrigin(raw);
}

/**
 * Origin embedded in Supabase OTP / magic-link redirects.
 * Local `next dev` uses localhost so you can test auth without Vercel.
 */
export function getAuthCallbackOrigin(): string {
  const explicitDev = process.env.NEXT_PUBLIC_DEV_AUTH_URL?.trim();
  if (explicitDev) {
    return normalizeSiteOrigin(explicitDev);
  }

  if (process.env.NODE_ENV === "development" && !isRunningOnVercel()) {
    return DEFAULT_LOCAL_AUTH_URL;
  }

  return getSiteUrl();
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}
