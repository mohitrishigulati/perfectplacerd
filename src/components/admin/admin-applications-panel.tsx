"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createResumeDownloadUrlAction,
  updateApplicationStatusAction,
} from "@/app/admin/actions";
import { APPLICATION_STATUS_LABELS } from "@/lib/opportunities/apply";
import type { AdminApplicationRow } from "@/lib/admin/queries";
import type { ApplicationStatus } from "@/types/database";

const STATUSES: ApplicationStatus[] = [
  "submitted",
  "under_review",
  "rejected",
  "accepted",
  "withdrawn",
];

export function AdminApplicationsPanel({
  jobId,
  applications,
  updateStatus = updateApplicationStatusAction,
  downloadResume = createResumeDownloadUrlAction,
}: {
  jobId: string;
  applications: AdminApplicationRow[];
  updateStatus?: typeof updateApplicationStatusAction;
  downloadResume?: typeof createResumeDownloadUrlAction;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onStatusChange(applicationId: string, status: ApplicationStatus) {
    setError(null);
    const result = await updateStatus({
      applicationId,
      jobId,
      status,
    });
    if (!result.ok) {
      setError(result.message ?? "Something went wrong");
      return;
    }
    router.refresh();
  }

  async function onDownloadResume(resumeId: string) {
    setError(null);
    const result = await downloadResume(resumeId);
    if (!result.ok || !result.url) {
      setError(result.message ?? "Something went wrong");
      return;
    }
    window.open(result.url, "_blank", "noopener,noreferrer");
  }

  if (applications.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700">
        No applicants yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="min-w-full text-left text-sm">
          <caption className="sr-only">Applicants for this opportunity</caption>
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 font-medium" scope="col">Candidate</th>
              <th className="px-4 py-3 font-medium" scope="col">Applied</th>
              <th className="px-4 py-3 font-medium" scope="col">Status</th>
              <th className="px-4 py-3 font-medium" scope="col">Resume</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="px-4 py-3 align-top">
                  <p className="font-medium">
                    {application.candidate?.full_name ?? "Unnamed candidate"}
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {application.candidate?.email}
                  </p>
                  {application.candidate?.headline && (
                    <p className="mt-1 text-xs text-zinc-500">{application.candidate.headline}</p>
                  )}
                  {application.cover_letter && (
                    <p className="mt-2 text-xs text-zinc-600 line-clamp-3 dark:text-zinc-400">
                      {application.cover_letter}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 align-top text-zinc-600 dark:text-zinc-400">
                  {new Date(application.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 align-top">
                  <label className="sr-only" htmlFor={`status-${application.id}`}>
                    Application status
                  </label>
                  <select
                    id={`status-${application.id}`}
                    className="field-input"
                    value={application.status}
                    onChange={(e) =>
                      onStatusChange(application.id, e.target.value as ApplicationStatus)
                    }
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {APPLICATION_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 align-top">
                  {application.resume ? (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => onDownloadResume(application.resume!.id)}
                    >
                      Download
                    </button>
                  ) : (
                    <span className="text-zinc-500">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
