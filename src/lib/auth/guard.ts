import {
  AUTH_PATH,
  authRedirectUrl,
  isAdminRoute,
  isCandidateRoute,
  sanitizeNextPath,
} from "@/lib/auth/paths";

export type AuthGuardContext = {
  pathname: string;
  origin: string;
  userId: string | null;
  isAdmin: boolean;
  searchParams?: URLSearchParams;
};

export type AuthGuardResult =
  | { action: "allow" }
  | { action: "redirect"; url: string };

/**
 * Pure route-guard logic used by middleware and unit tests.
 */
export function evaluateAuthGuard(context: AuthGuardContext): AuthGuardResult {
  const { pathname, origin, userId, isAdmin, searchParams } = context;

  if (pathname === AUTH_PATH && userId) {
    const next = sanitizeNextPath(searchParams?.get("next") ?? undefined);
    return { action: "redirect", url: new URL(next, origin).toString() };
  }

  if (isCandidateRoute(pathname) && !userId) {
    return {
      action: "redirect",
      url: authRedirectUrl(pathname, origin),
    };
  }

  if (isAdminRoute(pathname)) {
    if (!userId) {
      return {
        action: "redirect",
        url: authRedirectUrl(pathname, origin),
      };
    }
    if (!isAdmin) {
      return {
        action: "redirect",
        url: new URL(`${AUTH_PATH}?error=admin_required`, origin).toString(),
      };
    }
  }

  return { action: "allow" };
}
