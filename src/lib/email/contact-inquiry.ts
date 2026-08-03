import "server-only";

import { sendEmail } from "@/lib/email/send";
import { escapeHtml } from "@/lib/email/escape-html";
import { BRAND } from "@/content/marketing";
import type { ContactInquiryInput } from "@/lib/validations/contact";

const INQUIRY_TYPE_LABELS: Record<ContactInquiryInput["inquiryType"], string> = {
  candidate: "Candidate registration",
  employer: "Employer / client mandate",
  general: "General enquiry",
};

export function buildContactInquiryEmail(input: ContactInquiryInput): {
  subject: string;
  html: string;
} {
  const label = INQUIRY_TYPE_LABELS[input.inquiryType];
  const messageHtml = escapeHtml(input.message).replace(/\n/g, "<br>");

  return {
    subject: `New website enquiry: ${label} — ${input.name}`,
    html: `
      <p><strong>Type:</strong> ${label}</p>
      <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      ${input.phone ? `<p><strong>Phone:</strong> ${escapeHtml(input.phone)}</p>` : ""}
      ${input.company ? `<p><strong>Company:</strong> ${escapeHtml(input.company)}</p>` : ""}
      <p><strong>Message:</strong></p>
      <p>${messageHtml}</p>
    `.trim(),
  };
}

/** Notifies the Perfect Placer inbox of a new website enquiry. Returns false if unconfigured or delivery fails. */
export async function sendContactInquiryEmail(input: ContactInquiryInput): Promise<boolean> {
  const { subject, html } = buildContactInquiryEmail(input);
  return sendEmail({ to: BRAND.email, subject, html });
}
