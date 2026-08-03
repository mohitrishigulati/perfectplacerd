"use client";

import { ApplicationsList } from "@/components/dashboard/applications-list";
import type { ApplicationRow } from "@/lib/dashboard/queries";

declare global {
  interface Window {
    __E2E_WITHDRAW_MODE?: "success" | "error" | "slow";
    __E2E_WITHDRAW_CALLS?: number;
  }
}

const FIXTURE_APPLICATIONS: ApplicationRow[] = [
  {
    id: "app-submitted",
    status: "submitted",
    created_at: "2026-08-01T10:00:00.000Z",
    cover_letter: null,
    job: {
      id: "job-1",
      title: "Chief Financial Officer",
      slug: "cfo",
      location: "Mumbai",
      status: "published",
    },
  },
  {
    id: "app-under-review",
    status: "under_review",
    created_at: "2026-08-02T10:00:00.000Z",
    cover_letter: null,
    job: {
      id: "job-2",
      title: "VP Engineering",
      slug: "vp-eng",
      location: "Noida",
      status: "published",
    },
  },
  {
    id: "app-accepted",
    status: "accepted",
    created_at: "2026-07-01T10:00:00.000Z",
    cover_letter: null,
    job: {
      id: "job-3",
      title: "Closed Role",
      slug: "closed",
      location: "Chennai",
      status: "published",
    },
  },
];

async function e2eWithdrawHandler(applicationId: string) {
  void applicationId;
  if (typeof window !== "undefined") {
    window.__E2E_WITHDRAW_CALLS = (window.__E2E_WITHDRAW_CALLS ?? 0) + 1;
  }

  const mode = typeof window !== "undefined" ? window.__E2E_WITHDRAW_MODE : "success";

  if (mode === "slow") {
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  if (mode === "error") {
    return {
      ok: false as const,
      message: "This application cannot be withdrawn.",
    };
  }

  return {
    ok: true as const,
    message: "Application withdrawn.",
  };
}

export function ApplicationWithdrawE2EFixture() {
  return (
    <ApplicationsList
      applications={FIXTURE_APPLICATIONS}
      withdrawApplication={e2eWithdrawHandler}
    />
  );
}
