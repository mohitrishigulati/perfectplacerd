import "server-only";

import { logServerError } from "@/lib/logging/server-error";

const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "Perfect Placer <no-reply@auth.perfectplacer.in>";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/** Sends a transactional email via Resend. No-ops (returns false) if unconfigured. */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return false;
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM?.trim() || DEFAULT_FROM,
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      logServerError("email.send", new Error(`resend_http_${response.status}`));
      return false;
    }

    return true;
  } catch (error) {
    logServerError("email.send", error);
    return false;
  }
}
