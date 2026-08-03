import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { userIsAdmin } from "@/lib/auth/admin";
import { evaluateAuthGuard } from "@/lib/auth/guard";
import { legacyCandidateRedirect } from "@/lib/auth/paths";
import type { Database } from "@/types/database";

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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publicKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(url, publicKey, {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdmin = user ? await userIsAdmin(supabase, user.id) : false;

  const guard = evaluateAuthGuard({
    pathname,
    origin: request.nextUrl.origin,
    userId: user?.id ?? null,
    isAdmin,
    searchParams: request.nextUrl.searchParams,
  });

  if (guard.action === "redirect") {
    return NextResponse.redirect(guard.url);
  }

  return supabaseResponse;
}
