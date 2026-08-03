import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  DashboardMobileNav,
  DashboardNav,
} from "@/components/dashboard/dashboard-nav";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/dashboard");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <Link href="/dashboard" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Perfect Placer
            </Link>
            <p className="text-xs text-zinc-500">Candidate dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden text-sm text-zinc-600 sm:block dark:text-zinc-400">
              {user.email}
            </p>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 pb-24 sm:px-6 lg:flex-row lg:pb-6">
        <aside className="lg:w-56 lg:shrink-0">
          <DashboardNav />
        </aside>
        <main className="min-w-0 flex-1" id="main-content">
          {children}
        </main>
      </div>

      <DashboardMobileNav />
    </div>
  );
}
