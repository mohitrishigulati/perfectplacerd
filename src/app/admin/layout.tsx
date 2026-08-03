import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth/session";

import { createNoIndexMetadata } from "@/lib/site/metadata";

export const metadata = createNoIndexMetadata("Staff admin");

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin("/admin");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Staff admin
            </p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              {user.email ?? user.id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/opportunities" className="text-sm underline-offset-2 hover:underline">
              Public opportunities
            </Link>
            <Link href="/dashboard" className="text-sm underline-offset-2 hover:underline">
              Candidate dashboard
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <AdminNav />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
