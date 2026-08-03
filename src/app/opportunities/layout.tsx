import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getSessionUser } from "@/lib/auth/session";

export default async function OpportunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <Link href="/" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Perfect Placer
            </Link>
            <p className="text-xs text-zinc-500">Opportunities</p>
          </div>
          <nav aria-label="Account" className="flex flex-wrap items-center gap-3">
            <Link href="/opportunities" className="text-sm font-medium underline-offset-2 hover:underline">
              Browse
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium underline-offset-2 hover:underline">
                  Dashboard
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link href="/auth" className="btn-primary">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
