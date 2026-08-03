import {
  PUBLIC_GENERIC_ERROR,
  PUBLIC_SIGN_IN_UNAVAILABLE,
} from "@/lib/errors/public-messages";

export type AuthErrorKind =
  | "invalid_email"
  | "rate_limit"
  | "provider"
  | "invalid_code"
  | "not_configured"
  | "generic";

export function mapAuthError(raw: string | undefined): {
  message: string;
  kind: AuthErrorKind;
} {
  const text = (raw ?? "").toLowerCase();

  if (!text) {
    return { message: PUBLIC_GENERIC_ERROR, kind: "generic" };
  }

  if (text.includes("rate limit")) {
    return {
      message:
        "Too many sign-in emails were sent. Wait about an hour, then try again—or configure custom SMTP in Supabase for production volume.",
      kind: "rate_limit",
    };
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
