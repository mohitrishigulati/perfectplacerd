"use client";

import { AdminApplicationsPanel } from "@/components/admin/admin-applications-panel";
import type { AdminActionResult } from "@/app/admin/actions";
import type { AdminApplicationRow } from "@/lib/admin/queries";

declare global {
  interface Window {
    __E2E_APPLICATIONS_MODE?: "success" | "error";
    __E2E_APPLICATIONS_CALLS?: unknown[];
  }
}

const FIXTURE_APPLICATIONS: AdminApplicationRow[] = [
  {
    id: "app-1",
    status: "submitted",
    created_at: "2026-08-01T10:00:00.000Z",
    cover_letter: "I would love to be considered for this role.",
    candidate: {
      id: "candidate-1",
      email: "jane@example.com",
      full_name: "Jane Doe",
      headline: "VP Engineering",
      location: "Mumbai",
      phone: null,
      profile_visibility: "recruiters",
    },
    resume: {
      id: "resume-1",
      title: "Resume",
      file_name: "jane.pdf",
      updated_at: "2026-08-01T10:00:00.000Z",
    },
  },
];

function recordCall(payload: unknown) {
  if (typeof window === "undefined") return;
  window.__E2E_APPLICATIONS_CALLS = [...(window.__E2E_APPLICATIONS_CALLS ?? []), payload];
}

async function e2eUpdateStatus(input: {
  applicationId: string;
  jobId: string;
  status: unknown;
}): Promise<AdminActionResult> {
  recordCall({ action: "updateStatus", input });
  const mode = typeof window !== "undefined" ? window.__E2E_APPLICATIONS_MODE : "success";
  if (mode === "error") {
    return { ok: false, message: "Could not update application status." };
  }
  return { ok: true, message: "Application status updated." };
}

async function e2eDownloadResume(
  resumeId: string,
): Promise<AdminActionResult & { url?: string }> {
  recordCall({ action: "downloadResume", resumeId });
  return { ok: true, url: "about:blank", message: "Resume" };
}

export function AdminApplicationsE2EFixture() {
  return (
    <AdminApplicationsPanel
      jobId="job-1"
      applications={FIXTURE_APPLICATIONS}
      updateStatus={e2eUpdateStatus}
      downloadResume={e2eDownloadResume}
    />
  );
}
