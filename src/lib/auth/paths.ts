export const AUTH_PATH = "/auth";
export const AUTH_CALLBACK_PATH = "/auth/callback";
export const SIGN_OUT_PATH = "/auth/sign-out";

export const DEFAULT_CANDIDATE_PATH = "/dashboard";
export const DEFAULT_ADMIN_PATH = "/admin";

const DASHBOARD_PREFIX = "/dashboard";
const LEGACY_CANDIDATE_PREFIX = "/candidate";
const ADMIN_PREFIX = "/admin";

export function isDashboardRoute(pathname: string): boolean {
  return (
    pathname === DASHBOARD_PREFIX ||
    pathname.startsWith(`${DASHBOARD_PREFIX}/`)
  );
}

export function isLegacyCandidateRoute(pathname: string): boolean {
  return (
    pathname === LEGACY_CANDIDATE_PREFIX ||
    pathname.startsWith(`${LEGACY_CANDIDATE_PREFIX}/`)
  );
}

export function isCandidateRoute(pathname: string): boolean {
  return isDashboardRoute(pathname) || isLegacyCandidateRoute(pathname);
}

export function isAuthPath(pathname: string): boolean {
  return pathname === AUTH_PATH || pathname.startsWith(`${AUTH_PATH}/`);
}

export function legacyCandidateRedirect(pathname: string): string | null {
  if (!isLegacyCandidateRoute(pathname)) {
    return null;
  }
  if (pathname === LEGACY_CANDIDATE_PREFIX) {
    return DASHBOARD_PREFIX;
  }
  return `${DASHBOARD_PREFIX}${pathname.slice(LEGACY_CANDIDATE_PREFIX.length)}`;
}

export function isAdminRoute(pathname: string): boolean {
  return pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
}

export function isProtectedRoute(pathname: string): boolean {
  return isCandidateRoute(pathname) || isAdminRoute(pathname);
}

export function authRedirectUrl(nextPath: string, origin: string): string {
  const url = new URL(AUTH_PATH, origin);
  url.searchParams.set("next", nextPath);
  return url.toString();
}

export function sanitizeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return DEFAULT_CANDIDATE_PATH;
  }
  if (isAuthPath(next)) {
    return DEFAULT_CANDIDATE_PATH;
  }
  return next;
}
