"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  applyToOpportunityAction,
  saveOpportunityAction,
  unsaveOpportunityAction,
} from "@/app/opportunities/actions";
import {
  APPLICATION_STATUS_LABELS,
  getApplyEligibility,
} from "@/lib/opportunities/apply";
import type { ViewerOpportunityState } from "@/lib/opportunities/queries";

type Props = {
  jobId: string;
  slug: string;
  isAuthenticated: boolean;
  viewerState: ViewerOpportunityState;
};

export function OpportunityActions({
  jobId,
  slug,
  isAuthenticated,
  viewerState,
}: Props) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [pending, setPending] = useState<"save" | "apply" | null>(null);

  const returnPath = `/opportunities/${slug}`;
  const eligibility = getApplyEligibility({
    isAuthenticated,
    hasPrimaryResume: viewerState.hasPrimaryResume,
    existingApplicationStatus: viewerState.application?.status ?? null,
    isPublished: true,
  });

  async function onSaveToggle() {
    setPending("save");
    setError(null);
    setMessage(null);
    const result = viewerState.savedJobId
      ? await unsaveOpportunityAction(jobId, returnPath)
      : await saveOpportunityAction(jobId, returnPath);
    setPending(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setMessage(result.message ?? "Updated");
    router.refresh();
  }

  async function onApply() {
    setPending("apply");
    setError(null);
    setMessage(null);
    const result = await applyToOpportunityAction({
      jobId,
      slug,
      coverLetter,
    });
    setPending(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setMessage(result.message ?? "Applied");
    router.refresh();
  }

  return (
    <section
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-labelledby="opportunity-actions-heading"
    >
      <h2 id="opportunity-actions-heading" className="text-lg font-semibold">
        Take action
      </h2>

      {viewerState.application && (
        <div
          className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
          role="status"
        >
          Application status:{" "}
          <strong>
            {APPLICATION_STATUS_LABELS[viewerState.application.status]}
          </strong>
          <span className="block text-emerald-800/80 dark:text-emerald-300/80">
            Submitted{" "}
            {new Date(viewerState.application.created_at).toLocaleDateString()}
          </span>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        {isAuthenticated ? (
          <button
            type="button"
            className="btn-secondary"
            disabled={pending != null}
            onClick={onSaveToggle}
          >
            {pending === "save"
              ? "Saving…"
              : viewerState.savedJobId
                ? "Unsave opportunity"
                : "Save opportunity"}
          </button>
        ) : (
          <Link
            href={`/auth?next=${encodeURIComponent(returnPath)}`}
            className="btn-secondary text-center"
          >
            Sign in to save
          </Link>
        )}
      </div>

      {!viewerState.application && (
        <div className="mt-4 space-y-3">
          {!isAuthenticated && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <Link href={`/auth?next=${encodeURIComponent(returnPath)}`} className="underline">
                Sign in
              </Link>{" "}
              to apply with your current resume.
            </p>
          )}

          {isAuthenticated && eligibility.canApply && (
            <>
              <div>
                <label htmlFor="cover-letter" className="text-sm font-medium">
                  Cover letter (optional)
                </label>
                <textarea
                  id="cover-letter"
                  rows={4}
                  className="field-input mt-1"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn-primary"
                disabled={pending != null}
                onClick={onApply}
              >
                {pending === "apply" ? "Applying…" : "Apply with current resume"}
              </button>
            </>
          )}

          {isAuthenticated && !eligibility.canApply && eligibility.reason === "missing_resume" && (
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Upload a primary resume in{" "}
              <Link href="/dashboard/resume" className="underline">
                your dashboard
              </Link>{" "}
              before applying.
            </p>
          )}
        </div>
      )}

      {message && (
        <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
