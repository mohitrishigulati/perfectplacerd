import Link from "next/link";
import { getAdminOverviewStats } from "@/lib/admin/queries";

export default async function AdminHomePage() {
  const stats = await getAdminOverviewStats();

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
    </div>
  );
}
