import {
  PUBLIC_GENERIC_ERROR,
  PUBLIC_OTP_RATE_LIMIT,
  PUBLIC_SIGN_IN_UNAVAILABLE,
} from "@/lib/errors/public-messages";

export type AuthErrorKind =
  | "invalid_email"
  | "rate_limit"
  | "provider"
  | "invalid_code"
  | "not_configured"
  | "generic";

const PROVIDER_LEAK_PATTERN =
  /supabase|smtp|resend|gotrue|postgres|api key|service role/i;

export function isRateLimitedAuthError(
  raw: string | undefined,
  status?: number,
): boolean {
  const text = (raw ?? "").toLowerCase();
  if (status === 429) {
    return true;
  }
  return (
    text.includes("over_email_send_rate_limit") ||
    text.includes("email rate limit") ||
    text.includes("rate limit exceeded")
  );
}

export function mapAuthError(
  raw: string | undefined,
  status?: number,
): {
  message: string;
  kind: AuthErrorKind;
} {
  const text = (raw ?? "").toLowerCase();

  if (!text && status !== 429) {
    return { message: PUBLIC_GENERIC_ERROR, kind: "generic" };
  }

  if (isRateLimitedAuthError(raw, status)) {
    return { message: PUBLIC_OTP_RATE_LIMIT, kind: "rate_limit" };
  }

  if (text.includes("invalid") && text.includes("email")) {
    return {
      message: "Enter a valid email address.",
      kind: "invalid_email",
    };
  }

  if (text.includes("token") || text.includes("otp") || text.includes("expired")) {
    return {
      message: "That code is invalid or expired. Request a new sign-in email.",
      kind: "invalid_code",
    };
  }

  if (text.includes("not configured") || text.includes("missing")) {
    return {
      message: PUBLIC_SIGN_IN_UNAVAILABLE,
      kind: "not_configured",
    };
  }

  if (
    text.includes("smtp") ||
    text.includes("email") ||
    text.includes("provider") ||
    text.includes("hook")
  ) {
    return {
      message:
        "We could not send a sign-in email right now. Try again later or contact cv@perfectplacer.in.",
      kind: "provider",
    };
  }

  return { message: PUBLIC_GENERIC_ERROR, kind: "generic" };
}

/** Ensures mapped messages never expose infrastructure details to end users. */
export function assertPublicAuthMessage(message: string): void {
  if (PROVIDER_LEAK_PATTERN.test(message)) {
    throw new Error("Public auth message must not mention provider infrastructure.");
  }
}
