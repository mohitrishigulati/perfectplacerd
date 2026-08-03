import Link from "next/link";
import type { ApplicationRow, SavedJobRow } from "@/lib/dashboard/queries";

const STATUS_LABELS: Record<ApplicationRow["status"], string> = {
  submitted: "Submitted",
  under_review: "Under review",
  rejected: "Rejected",
  accepted: "Accepted",
  withdrawn: "Withdrawn",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(iso));
}

export function DashboardRecentApplications({
  applications,
}: {
  applications: ApplicationRow[];
}) {
  return (
    <section
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-labelledby="recent-applications-heading"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="recent-applications-heading"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Recent applications
        </h2>
        <Link
          href="/dashboard/applications"
          className="text-sm font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
        >
          View all
        </Link>
      </div>
      {applications.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          No applications yet.{" "}
          <Link href="/opportunities" className="underline">
            Find opportunities
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-900" role="list">
          {applications.map((application) => (
            <li key={application.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  {application.job?.title ?? "Job unavailable"}
                </p>
                <p className="text-xs text-zinc-500">
                  Applied {formatDate(application.created_at)}
                </p>
              </div>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                {STATUS_LABELS[application.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function DashboardRecentSaved({
  jobs,
}: {
  jobs: SavedJobRow[];
}) {
  return (
    <section
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-labelledby="recent-saved-heading"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="recent-saved-heading"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Saved opportunities
        </h2>
        <Link
          href="/dashboard/saved"
          className="text-sm font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
        >
          View all
        </Link>
      </div>
      {jobs.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Save roles while browsing to compare them here.
        </p>
      ) : (
        <ul className="mt-4 space-y-3" role="list">
          {jobs.map((row) => (
            <li key={row.id}>
              <Link
                href={`/opportunities/${row.job.slug}`}
                className="block rounded-lg border border-zinc-100 px-3 py-2 hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900"
              >
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  {row.job.title}
                </p>
                <p className="text-xs text-zinc-500">
                  {[row.job.location, row.job.employment_type]
                    .filter(Boolean)
                    .join(" · ") || "View details"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
