"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setJobStatusAction } from "@/app/admin/actions";
import {
  canPerformJobStatusAction,
  JOB_STATUS_LABELS,
  type JobStatusAction,
} from "@/lib/admin/jobs";
import type { JobStatus } from "@/types/database";

const ACTIONS: Array<{ action: JobStatusAction; label: string }> = [
  { action: "publish", label: "Publish" },
  { action: "pause", label: "Pause" },
  { action: "close", label: "Close" },
  { action: "archive", label: "Archive" },
];

export function AdminJobStatusActions({
  jobId,
  status,
}: {
  jobId: string;
  status: JobStatus;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<JobStatusAction | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: JobStatusAction) {
    setPending(action);
    setError(null);
    setMessage(null);
    const result = await setJobStatusAction(jobId, action);
    setPending(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setMessage(result.message ?? "Updated");
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-sm font-semibold">Lifecycle</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Current status:{" "}
        <strong>{JOB_STATUS_LABELS[status]}</strong>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {ACTIONS.map(({ action, label }) => {
          const enabled = canPerformJobStatusAction(status, action);
          return (
            <button
              key={action}
              type="button"
              className="btn-secondary disabled:opacity-40"
              disabled={!enabled || pending != null}
              onClick={() => run(action)}
            >
              {pending === action ? "Updating…" : label}
            </button>
          );
        })}
      </div>
      {message && <p className="mt-2 text-sm text-emerald-700" role="status">{message}</p>}
      {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
    </section>
  );
}
