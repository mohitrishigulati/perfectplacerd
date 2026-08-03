import Link from "next/link";
import { getAdminOverviewStats } from "@/lib/admin/queries";

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  accepted: "Accepted",
  rejected: "Not selected",
  withdrawn: "Withdrawn",
};

function trendLabel(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? "New this week" : "No change";
  }
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return "No change vs. last week";
  return change > 0 ? `+${change}% vs. last week` : `${change}% vs. last week`;
}

export default async function AdminHomePage() {
  const stats = await getAdminOverviewStats();
  const maxFunnelCount = Math.max(1, ...Object.values(stats.statusFunnel));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Staff admin dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Manage opportunities, review applicants, and view candidate profiles.
          Every action is authorized on the server via the{" "}
          <code className="rounded bg-zinc-100 px-1 text-sm dark:bg-zinc-900">admin_users</code>{" "}
          table.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-3" role="list">
        {[
          { label: "Opportunities", value: stats.jobs, href: "/admin/jobs" },
          { label: "Applications", value: stats.applications, href: "/admin/jobs" },
          { label: "Candidates", value: stats.candidates, href: "/admin/candidates" },
        ].map((card) => (
          <li key={card.label}>
            <Link
              href={card.href}
              className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <p className="text-sm text-zinc-500">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{card.value}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/jobs/new" className="btn-primary">
          New opportunity
        </Link>
        <Link href="/admin/candidates" className="btn-secondary">
          Browse candidates
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Application funnel
          </h2>
          <ul className="mt-4 space-y-3" role="list">
            {Object.entries(stats.statusFunnel).map(([status, count]) => (
              <li key={status}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {STATUS_LABELS[status] ?? status}
                  </span>
                  <span className="tabular-nums font-medium">{count}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-900">
                  <div
                    className="h-2 rounded-full bg-zinc-900 dark:bg-zinc-100"
                    style={{ width: `${(count / maxFunnelCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-zinc-500">
            {stats.applicationsLast7Days} application
            {stats.applicationsLast7Days === 1 ? "" : "s"} in the last 7 days ·{" "}
            {trendLabel(stats.applicationsLast7Days, stats.applicationsPrevious7Days)}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Top opportunities by applications
          </h2>
          {stats.topJobs.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">No applications yet.</p>
          ) : (
            <ul className="mt-4 space-y-3" role="list">
              {stats.topJobs.map((job) => (
                <li key={job.id} className="flex items-center justify-between text-sm">
                  <Link
                    href={`/admin/jobs/${job.id}/applications`}
                    className="truncate pr-2 text-zinc-700 hover:underline dark:text-zinc-300"
                  >
                    {job.title}
                  </Link>
                  <span className="tabular-nums font-medium">{job.applicationCount}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
