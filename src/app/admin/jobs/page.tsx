import Link from "next/link";
import { JOB_STATUS_LABELS } from "@/lib/admin/jobs";
import { getAdminJobs } from "@/lib/admin/queries";

export default async function AdminJobsPage() {
  const jobs = await getAdminJobs();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Opportunities</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Create, publish, pause, close, or archive staff-managed opportunities.
          </p>
        </div>
        <Link href="/admin/jobs/new" className="btn-primary">
          New opportunity
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="min-w-full text-left text-sm">
          <caption className="sr-only">All opportunities</caption>
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Title</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Applicants</th>
              <th scope="col" className="px-4 py-3 font-medium">Updated</th>
              <th scope="col" className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="px-4 py-3">
                  <p className="font-medium">{job.title}</p>
                  <p className="text-xs text-zinc-500">{job.location ?? "—"}</p>
                </td>
                <td className="px-4 py-3">{JOB_STATUS_LABELS[job.status]}</td>
                <td className="px-4 py-3 tabular-nums">{job.applicationCount}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {new Date(job.updated_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/jobs/${job.id}/edit`} className="btn-secondary">
                      Edit
                    </Link>
                    <Link
                      href={`/admin/jobs/${job.id}/applications`}
                      className="btn-secondary"
                    >
                      Applicants
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
