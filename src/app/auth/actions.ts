"use server";

import { buildSignInEmailRedirectTo } from "@/lib/auth/sign-in-redirect";
import { mapAuthError } from "@/lib/errors/map-auth-error";
import { PUBLIC_SIGN_IN_UNAVAILABLE } from "@/lib/errors/public-messages";
import { logAuthErrorCategory } from "@/lib/logging/server-error";
import { isSupabasePublicEnvConfigured } from "@/lib/supabase/public-env";
import { createClient } from "@/lib/supabase/server";
import { authEmailSchema, authOtpSchema } from "@/lib/validations/auth";

export type AuthActionResult =
  | { ok: true }
  | { ok: false; error: string; kind: string };

export async function sendSignInOtpAction(input: {
  email: string;
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
    logAuthErrorCategory("auth.sendOtp", "not_configured");
    return {
      ok: false,
      error: PUBLIC_SIGN_IN_UNAVAILABLE,
      kind: "not_configured",
    };
  }

  const emailRedirectTo = buildSignInEmailRedirectTo(input.nextPath);

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
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof (error as { status: unknown }).status === "number"
          ? (error as { status: number }).status
          : undefined;
      const mapped = mapAuthError(error.message, status);
      logAuthErrorCategory("auth.sendOtp", mapped.kind);
      return { ok: false, error: mapped.message, kind: mapped.kind };
    }

    return { ok: true };
  } catch {
    logAuthErrorCategory("auth.sendOtp", "provider");
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
    logAuthErrorCategory("auth.verifyOtp", "not_configured");
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
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof (error as { status: unknown }).status === "number"
          ? (error as { status: number }).status
          : undefined;
      const mapped = mapAuthError(error.message, status);
      logAuthErrorCategory("auth.verifyOtp", mapped.kind);
      return { ok: false, error: mapped.message, kind: mapped.kind };
    }

    return { ok: true };
  } catch {
    logAuthErrorCategory("auth.verifyOtp", "provider");
    return {
      ok: false,
      error: PUBLIC_SIGN_IN_UNAVAILABLE,
      kind: "provider",
    };
  }
}
