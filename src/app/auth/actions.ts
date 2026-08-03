"use server";

import { sanitizeNextPath } from "@/lib/auth/paths";
import { isSupabasePublicEnvConfigured } from "@/lib/supabase/public-env";
import { createClient } from "@/lib/supabase/server";
import { authEmailSchema, authOtpSchema } from "@/lib/validations/auth";

export type AuthActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function sendSignInOtpAction(input: {
  email: string;
  origin: string;
  nextPath: string;
}): Promise<AuthActionResult> {
  const parsed = authEmailSchema.safeParse({ email: input.email });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid email",
    };
  }

  if (!isSupabasePublicEnvConfigured()) {
    return {
      ok: false,
      error:
        "Sign-in is not configured. Add Supabase env vars and redeploy.",
    };
  }

  const next = sanitizeNextPath(input.nextPath);
  const emailRedirectTo = `${input.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function verifySignInOtpAction(input: {
  email: string;
  token: string;
}): Promise<AuthActionResult> {
  const parsed = authOtpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid code",
    };
  }

  if (!isSupabasePublicEnvConfigured()) {
    return {
      ok: false,
      error:
        "Sign-in is not configured. Add Supabase env vars and redeploy.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "email",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
