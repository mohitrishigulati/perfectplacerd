import "server-only";

import { sendEmail } from "@/lib/email/send";
import { escapeHtml } from "@/lib/email/escape-html";
import { absoluteUrl } from "@/lib/site/url";
import type { ApplicationStatus } from "@/types/database";

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  accepted: "Accepted",
  rejected: "Not selected",
  withdrawn: "Withdrawn",
};

export function buildApplicationStatusChangedEmail(input: {
  jobTitle: string;
  status: ApplicationStatus;
}): { subject: string; html: string } {
  const label = STATUS_LABELS[input.status];
  const jobTitle = escapeHtml(input.jobTitle);
  const applicationsUrl = absoluteUrl("/dashboard/applications");

  return {
    subject: `Your application for ${input.jobTitle} is now ${label}`,
    html: `
      <p>Hi,</p>
      <p>The status of your application for <strong>${jobTitle}</strong> has changed to <strong>${label}</strong>.</p>
      <p><a href="${applicationsUrl}">View your applications</a></p>
      <p>&mdash; Perfect Placer</p>
    `.trim(),
  };
}

/** Notifies a candidate their application status changed. Never throws; returns false on failure. */
export async function sendApplicationStatusChangedEmail(input: {
  to: string;
  jobTitle: string;
  status: ApplicationStatus;
}): Promise<boolean> {
  const { subject, html } = buildApplicationStatusChangedEmail(input);
  return sendEmail({ to: input.to, subject, html });
}
