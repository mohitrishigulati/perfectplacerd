"use client";

import { useCallback, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { withdrawApplicationAction } from "@/app/dashboard/actions";
import type { ApplicationRow } from "@/lib/dashboard/queries";
import {
  canStartWithdrawRequest,
  canWithdrawApplication,
  shouldDisableWithdrawConfirm,
  type WithdrawInteractionPhase,
} from "@/lib/applications/withdraw-eligibility";
import type { ApplicationStatus } from "@/types/database";
import Link from "next/link";

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  rejected: "Rejected",
  accepted: "Accepted",
  withdrawn: "Withdrawn",
};

export type WithdrawApplicationHandler = (
  applicationId: string,
) => Promise<{ ok: true; message?: string } | { ok: false; message: string }>;

type Props = {
  applications: ApplicationRow[];
  /** E2E fixture only — production uses server action. */
  withdrawApplication?: WithdrawApplicationHandler;
};

export function ApplicationsList({
  applications: initialApplications,
  withdrawApplication = withdrawApplicationAction,
}: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const withdrawInFlightRef = useRef(false);
  const dialogTitleId = useId();
  const dialogDescId = useId();
  const liveId = useId();

  const [applications, setApplications] = useState(initialApplications);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [phase, setPhase] = useState<WithdrawInteractionPhase>("idle");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState("");

  const closeDialog = useCallback(() => {
    dialogRef.current?.close();
    setConfirmingId(null);
    if (phase !== "pending") {
      setPhase("idle");
    }
  }, [phase]);

  function openConfirm(applicationId: string) {
    if (
      !canStartWithdrawRequest({
        phase,
        applicationId,
        pendingApplicationId: pendingId,
      })
    ) {
      return;
    }
    setErrorMessage(null);
    setConfirmingId(applicationId);
    setPhase("confirming");
    setLiveMessage("Confirm withdrawal in the dialog.");
    dialogRef.current?.showModal();
  }

  async function confirmWithdraw() {
    if (
      !confirmingId ||
      shouldDisableWithdrawConfirm({ phase }) ||
      withdrawInFlightRef.current
    ) {
      return;
    }

    withdrawInFlightRef.current = true;
    const applicationId = confirmingId;
    setPhase("pending");
    setPendingId(applicationId);
    setErrorMessage(null);
    setLiveMessage("Withdrawing application…");

    const result = await withdrawApplication(applicationId);

    setPendingId(null);
    withdrawInFlightRef.current = false;

    if (!result.ok) {
      setPhase("error");
      setErrorMessage(result.message);
      setLiveMessage(result.message);
      return;
    }

    setApplications((current) =>
      current.map((row) =>
        row.id === applicationId ? { ...row, status: "withdrawn" } : row,
      ),
    );
    setPhase("success");
    setLiveMessage(result.message ?? "Application withdrawn.");
    closeDialog();
    setPhase("idle");
    router.refresh();
  }

  if (applications.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        You have not applied to any opportunities yet.{" "}
        <Link href="/opportunities" className="underline">
          Browse Opportunities
        </Link>
        .
      </p>
    );
  }

  return (
    <>
      <div id={liveId} className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>

      {errorMessage && (
        <p
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <table className="min-w-full text-left text-sm">
          <caption className="sr-only">Your job applications</caption>
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Job
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Applied
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => {
              const status = application.status;
              const showWithdraw = canWithdrawApplication(status);
              const isPending = pendingId === application.id;

              return (
                <tr
                  key={application.id}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {application.job?.title ?? "Job unavailable"}
                    </p>
                    {application.job?.location && (
                      <p className="text-zinc-500">{application.job.location}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium dark:bg-zinc-900">
                      {STATUS_LABELS[status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {new Date(application.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {showWithdraw ? (
                      <button
                        type="button"
                        className="text-sm font-medium text-red-700 underline disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400"
                        disabled={isPending || pendingId !== null}
                        aria-busy={isPending}
                        onClick={() => openConfirm(application.id)}
                      >
                        {isPending ? "Withdrawing…" : "Withdraw application"}
                      </button>
                    ) : (
                      <span className="text-sm text-zinc-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <dialog
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl border border-zinc-200 p-6 shadow-xl backdrop:bg-black/40 dark:border-zinc-700 dark:bg-zinc-950"
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescId}
        onCancel={(event) => {
          event.preventDefault();
          if (phase !== "pending") {
            closeDialog();
          }
        }}
      >
        <h2
          id={dialogTitleId}
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Withdraw this application?
        </h2>
        <p id={dialogDescId} className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Recruiters will no longer review this submission. You can apply again later if
          the role is still open.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-60 dark:border-zinc-600"
            disabled={shouldDisableWithdrawConfirm({ phase })}
            onClick={closeDialog}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            disabled={shouldDisableWithdrawConfirm({ phase })}
            aria-busy={phase === "pending"}
            onClick={() => void confirmWithdraw()}
          >
            {phase === "pending" ? "Withdrawing…" : "Yes, withdraw"}
          </button>
        </div>
      </dialog>
    </>
  );
}
