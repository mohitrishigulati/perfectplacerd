import "server-only";

import { sendEmail } from "@/lib/email/send";
import { escapeHtml } from "@/lib/email/escape-html";

export function buildAdminMessageEmail(input: {
  subject: string;
  message: string;
}): { subject: string; html: string } {
  const bodyHtml = escapeHtml(input.message).replace(/\n/g, "<br>");

  return {
    subject: input.subject,
    html: `
      <p>${bodyHtml}</p>
      <p>&mdash; Perfect Placer</p>
    `.trim(),
  };
}

/** Sends a one-off message from an admin to a candidate. Returns false if unconfigured or delivery fails. */
export async function sendAdminMessageEmail(input: {
  to: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const { subject, html } = buildAdminMessageEmail(input);
  return sendEmail({ to: input.to, subject, html });
}
