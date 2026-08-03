import Link from "next/link";
import type { DashboardOverview } from "@/lib/dashboard/queries";

const VISIBILITY_LABELS: Record<
  DashboardOverview["profileVisibility"],
  string
> = {
  private: "Private",
  recruiters: "Recruiters only",
  public: "Public",
};

export function DashboardWelcomeBanner({
  overview,
}: {
  overview: DashboardOverview;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 text-white shadow-sm dark:border-zinc-700">
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-300">Welcome back</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {overview.displayName}
          </h2>
          {overview.headline ? (
            <p className="mt-2 max-w-xl text-sm text-zinc-300">
              {overview.headline}
            </p>
          ) : (
            <p className="mt-2 text-sm text-zinc-400">
              Add a headline on your{" "}
              <Link
                href="/dashboard/profile"
                className="underline underline-offset-2 hover:text-white"
              >
                profile
              </Link>{" "}
              so recruiters know your focus.
            </p>
          )}
        </div>
        <dl className="flex flex-wrap gap-3 text-sm">
          <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
            <dt className="text-zinc-400">Visibility</dt>
            <dd className="font-medium">
              {VISIBILITY_LABELS[overview.profileVisibility]}
            </dd>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
            <dt className="text-zinc-400">Profile</dt>
            <dd className="font-medium tabular-nums">
              {overview.completion.percent}% complete
            </dd>
          </div>
        </dl>
      </div>
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-emerald-500/20 blur-2xl"
        aria-hidden
      />
    </section>
  );
}

export function DashboardStatCards({
  stats,
}: {
  stats: DashboardOverview["stats"];
}) {
  const items = [
    {
      label: "Applications",
      value: stats.applications,
      href: "/dashboard/applications",
    },
    {
      label: "In review",
      value: stats.inReview,
      href: "/dashboard/applications",
    },
    {
      label: "Saved roles",
      value: stats.saved,
      href: "/dashboard/saved",
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
        >
          <p className="text-sm font-medium text-zinc-500">{item.label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {item.value}
          </p>
        </Link>
      ))}
    </div>
  );
}

export function DashboardQuickActions() {
  const actions = [
    {
      href: "/opportunities",
      title: "Browse opportunities",
      description: "Search published roles and apply in one click.",
    },
    {
      href: "/dashboard/profile",
      title: "Update profile",
      description: "Skills, location, preferences, and visibility.",
    },
    {
      href: "/dashboard/resume",
      title: "Upload resume",
      description: "Keep your primary resume ready for applications.",
    },
    {
      href: "/dashboard/settings",
      title: "Privacy & data",
      description: "Export your data or manage account settings.",
    },
  ] as const;

  return (
    <section aria-labelledby="dashboard-actions-heading">
      <h2
        id="dashboard-actions-heading"
        className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
      >
        Quick actions
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2" role="list">
        {actions.map((action) => (
          <li key={action.href}>
            <Link
              href={action.href}
              className="block h-full rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {action.title}
              </span>
              <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-400">
                {action.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
