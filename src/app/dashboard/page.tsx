import Link from "next/link";
import { ProfileCompletionCard } from "@/components/dashboard/profile-completion-card";
import { getProfileCompletionForUser } from "@/lib/dashboard/queries";

export default async function DashboardHomePage() {
  const completion = await getProfileCompletionForUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Manage your profile, resume, applications, and privacy settings in one
          place.
        </p>
      </div>

      <ProfileCompletionCard completion={completion} />

      <section aria-labelledby="quick-links-heading">
        <h2 id="quick-links-heading" className="text-lg font-semibold">
          Quick links
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2" role="list">
          {[
            { href: "/opportunities", label: "Browse opportunities" },
            { href: "/dashboard/profile", label: "Edit profile & visibility" },
            { href: "/dashboard/resume", label: "Upload resume" },
            { href: "/dashboard/applications", label: "View applications" },
            { href: "/dashboard/settings", label: "Export or delete account" },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
