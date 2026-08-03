"use client";

import { useSearchParams } from "next/navigation";
import { AdminJobForm } from "@/components/admin/admin-job-form";
import type { AdminActionResult } from "@/app/admin/actions";
import type { Tables } from "@/types/database";

declare global {
  interface Window {
    __E2E_JOB_FORM_MODE?: "success" | "error";
    __E2E_JOB_FORM_CALLS?: unknown[];
  }
}

function recordCall(payload: unknown) {
  if (typeof window === "undefined") return;
  window.__E2E_JOB_FORM_CALLS = [...(window.__E2E_JOB_FORM_CALLS ?? []), payload];
}

async function e2eCreateJob(input: unknown): Promise<AdminActionResult> {
  recordCall({ action: "create", input });
  const mode = typeof window !== "undefined" ? window.__E2E_JOB_FORM_MODE : "success";
  if (mode === "error") {
    return { ok: false, message: "That slug is already in use." };
  }
  return { ok: true, id: "job-e2e-1", message: "Opportunity draft created." };
}

async function e2eUpdateJob(jobId: string, input: unknown): Promise<AdminActionResult> {
  recordCall({ action: "update", jobId, input });
  const mode = typeof window !== "undefined" ? window.__E2E_JOB_FORM_MODE : "success";
  if (mode === "error") {
    return { ok: false, message: "That slug is already in use." };
  }
  return { ok: true, message: "Opportunity saved." };
}

const FIXTURE_JOB = {
  id: "job-e2e-1",
  title: "VP Engineering",
  slug: "vp-engineering",
  description: "An existing opportunity description of sufficient length.",
  location: "Remote",
  employment_type: "",
  department: "",
  industry: "",
  work_mode: null,
  experience_level: null,
  salary_min: null,
  salary_max: null,
  salary_currency: "USD",
} as unknown as Tables<"jobs">;

export function AdminJobFormE2EFixture() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "edit" ? "edit" : "create";

  return (
    <AdminJobForm
      mode={mode}
      job={mode === "edit" ? FIXTURE_JOB : undefined}
      createJob={e2eCreateJob}
      updateJob={e2eUpdateJob}
    />
  );
}
