import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";

export default async function Home() {
  const user = await getSessionUser();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Perfect Placer
          </Link>
          <nav aria-label="Main" className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/opportunities"
              className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Opportunities
            </Link>
            {user ? (
              <Link href="/dashboard" className="btn-primary">
                Dashboard
              </Link>
            ) : (
              <Link href="/auth" className="btn-primary">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <p className="text-sm font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Candidate platform
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              Your career hub — profile, applications, and opportunities in one place.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              Sign in with a one-time email code. Build your profile, upload a resume,
              apply to published roles, and track every application from your dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <Link href="/dashboard" className="btn-primary px-6 py-3">
                  Go to dashboard
                </Link>
              ) : (
                <Link href="/auth" className="btn-primary px-6 py-3">
                  Get started
                </Link>
              )}
              <Link href="/opportunities" className="btn-secondary px-6 py-3">
                Browse opportunities
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Everything in your dashboard
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {[
              {
                title: "Overview",
                body: "Stats, recent applications, saved roles, and profile completion at a glance.",
              },
              {
                title: "Profile & resume",
                body: "Headline, skills, preferences, visibility, and a primary resume on file.",
              },
              {
                title: "Applications",
                body: "Track submitted, in review, accepted, or withdrawn applications.",
              },
              {
                title: "Saved jobs",
                body: "Bookmark opportunities while you browse and return when you are ready.",
              },
              {
                title: "Opportunities",
                body: "Search and filter published roles, then apply without duplicate submissions.",
              },
              {
                title: "Privacy",
                body: "Export your data or delete your account when you need to.",
              },
            ].map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-zinc-200 bg-zinc-900 px-4 py-12 text-zinc-300 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-medium text-white">Ready to manage your search?</p>
              <p className="mt-1 text-sm text-zinc-400">
                Passwordless sign-in · Secure Supabase sessions
              </p>
            </div>
            <Link
              href={user ? "/dashboard" : "/auth"}
              className="inline-flex justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
            >
              {user ? "Open dashboard" : "Sign in with email"}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
