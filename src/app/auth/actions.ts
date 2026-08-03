"use server";

import { sanitizeNextPath } from "@/lib/auth/paths";
import { mapAuthError } from "@/lib/errors/map-auth-error";
import { PUBLIC_SIGN_IN_UNAVAILABLE } from "@/lib/errors/public-messages";
import { logServerError } from "@/lib/logging/server-error";
import { isSupabasePublicEnvConfigured } from "@/lib/supabase/public-env";
import { createClient } from "@/lib/supabase/server";
import { authEmailSchema, authOtpSchema } from "@/lib/validations/auth";

export type AuthActionResult =
  | { ok: true }
  | { ok: false; error: string; kind: string };

export async function sendSignInOtpAction(input: {
  email: string;
  origin: string;
  nextPath: string;
}): Promise<AuthActionResult> {
  const parsed = authEmailSchema.safeParse({ email: input.email });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Enter a valid email address.",
      kind: "invalid_email",
    };
  }

  if (!isSupabasePublicEnvConfigured()) {
    logServerError("auth.sendOtp", new Error("Supabase not configured"));
    return {
      ok: false,
      error: PUBLIC_SIGN_IN_UNAVAILABLE,
      kind: "not_configured",
    };
  }

  const next = sanitizeNextPath(input.nextPath);
  const emailRedirectTo = `${input.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo,
      },
    });

    if (error) {
      logServerError("auth.sendOtp", error);
      const mapped = mapAuthError(error.message);
      return { ok: false, error: mapped.message, kind: mapped.kind };
    }

    return { ok: true };
  } catch (error) {
    logServerError("auth.sendOtp", error);
    return {
      ok: false,
      error: PUBLIC_SIGN_IN_UNAVAILABLE,
      kind: "provider",
    };
  }
}

export async function verifySignInOtpAction(input: {
  email: string;
  token: string;
}): Promise<AuthActionResult> {
  const parsed = authOtpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Enter the code from your email.",
      kind: "invalid_code",
    };
  }

  if (!isSupabasePublicEnvConfigured()) {
    logServerError("auth.verifyOtp", new Error("Supabase not configured"));
    return {
      ok: false,
      error: PUBLIC_SIGN_IN_UNAVAILABLE,
      kind: "not_configured",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: parsed.data.email,
      token: parsed.data.token,
      type: "email",
    });

    if (error) {
      logServerError("auth.verifyOtp", error);
      const mapped = mapAuthError(error.message);
      return { ok: false, error: mapped.message, kind: mapped.kind };
    }

    return { ok: true };
  } catch (error) {
    logServerError("auth.verifyOtp", error);
    return {
      ok: false,
      error: PUBLIC_SIGN_IN_UNAVAILABLE,
      kind: "provider",
    };
  }
}
