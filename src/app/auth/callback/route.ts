import { NextResponse } from "next/server";
import { sanitizeNextPath } from "@/lib/auth/paths";
import { isSupabasePublicEnvConfigured } from "@/lib/supabase/public-env";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNextPath(searchParams.get("next"));

  if (!isSupabasePublicEnvConfigured()) {
    return NextResponse.redirect(
      `${origin}/auth?error=not_configured&next=${encodeURIComponent(next)}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${origin}/auth?error=callback_failed&next=${encodeURIComponent(next)}`,
      );
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
