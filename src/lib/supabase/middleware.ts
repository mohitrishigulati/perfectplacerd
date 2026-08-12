import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { userIsAdmin } from "@/lib/auth/admin";
import { evaluateAuthGuard } from "@/lib/auth/guard";
import {
  isAdminRoute,
  isAuthPath,
  isProtectedRoute,
  legacyCandidateRedirect,
} from "@/lib/auth/paths";
import type { Database } from "@/types/database";

/** Keep edge middleware under Vercel’s invocation limit even if Auth is slow. */
const MIDDLEWARE_AUTH_TIMEOUT_MS = 8_000;

function middlewareFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return fetch(input, {
    ...init,
    signal: AbortSignal.timeout(MIDDLEWARE_AUTH_TIMEOUT_MS),
  });
}

/**
 * Public marketing/SEO routes do not need session refresh in middleware.
 * Layouts that show signed-in chrome call getSessionUser() in the RSC instead.
 */
export function middlewareNeedsAuthSession(pathname: string): boolean {
  return isProtectedRoute(pathname) || isAuthPath(pathname);
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const legacyTarget = legacyCandidateRedirect(request.nextUrl.pathname);
  if (legacyTarget) {
    const url = request.nextUrl.clone();
    url.pathname = legacyTarget;
    return NextResponse.redirect(url);
  }

  const pathname = request.nextUrl.pathname;

  if (!middlewareNeedsAuthSession(pathname)) {
    return supabaseResponse;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publicKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(url, publicKey, {
    global: {
      fetch: middlewareFetch,
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  let userId: string | null = null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // Auth timed out or failed — fail open for /auth, fail closed for protected routes.
    userId = null;
  }

  const isAdmin =
    userId && isAdminRoute(pathname)
      ? await userIsAdmin(supabase, userId).catch(() => false)
      : false;

  const guard = evaluateAuthGuard({
    pathname,
    origin: request.nextUrl.origin,
    userId,
    isAdmin,
    searchParams: request.nextUrl.searchParams,
  });

  if (guard.action === "redirect") {
    return NextResponse.redirect(guard.url);
  }

  return supabaseResponse;
}
