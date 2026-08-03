"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { unsaveJobAction } from "@/app/dashboard/actions";
import type { SavedJobRow } from "@/lib/dashboard/queries";

export function SavedJobsList({ jobs }: { jobs: SavedJobRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (jobs.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        No saved opportunities yet. Browse{" "}
        <Link href="/opportunities" className="underline">
          Opportunities
        </Link>{" "}
        to save roles for later.
      </p>
    );
  }

  async function onRemove(savedJobId: string) {
    setPendingId(savedJobId);
    setError(null);
    const result = await unsaveJobAction(savedJobId);
    if (!result.ok) {
      setError(result.message);
      setPendingId(null);
      return;
    }
    router.refresh();
    setPendingId(null);
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <ul className="space-y-3" role="list">
        {jobs.map((saved) => (
          <li
            key={saved.id}
            className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div>
              <p className="font-medium">{saved.job?.title}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {saved.job?.location ?? "Location flexible"}
                {saved.job?.employment_type
                  ? ` · ${saved.job.employment_type}`
                  : null}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Saved {new Date(saved.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              disabled={pendingId === saved.id}
              onClick={() => onRemove(saved.id)}
            >
              {pendingId === saved.id ? "Removing…" : "Remove"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
