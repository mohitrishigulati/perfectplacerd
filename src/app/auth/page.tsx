import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { isSupabasePublicEnvConfigured } from "@/lib/supabase/public-env";

export default function AuthPage() {
  const supabaseReady = isSupabasePublicEnvConfigured();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      {!supabaseReady && (
        <p
          className="mb-6 max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          Sign-in is not configured on this deployment. Add{" "}
          <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-xs">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>{" "}
          (or anon key) in
          Vercel (or <code className="text-xs">.env.local</code> locally), then
          redeploy. See <code className="text-xs">docs/supabase-setup.md</code>.
        </p>
      )}
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          Perfect Placer
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Sign in with email
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          We&apos;ll send a one-time code. No password required.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <AuthForm />
      </Suspense>
    </div>
  );
}
