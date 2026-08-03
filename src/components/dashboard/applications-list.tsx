import type { ApplicationRow } from "@/lib/dashboard/queries";
import Link from "next/link";

const STATUS_LABELS: Record<ApplicationRow["status"], string> = {
  submitted: "Submitted",
  under_review: "Under review",
  rejected: "Rejected",
  accepted: "Accepted",
  withdrawn: "Withdrawn",
};

export function ApplicationsList({
  applications,
}: {
  applications: ApplicationRow[];
}) {
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
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
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
                  {STATUS_LABELS[application.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                {new Date(application.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
