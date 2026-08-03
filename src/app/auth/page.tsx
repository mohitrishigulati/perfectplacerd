import { Suspense } from "react";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { AuthForm } from "@/components/auth/auth-form";
import { createNoIndexMetadata } from "@/lib/site/metadata";

export const metadata = createNoIndexMetadata("Sign in");

export default function AuthPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--pp-cream)]">
      <SiteHeader />
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--pp-gold-dark)]">
            Candidate access
          </p>
          <h1 className="mt-2 font-serif text-2xl font-semibold text-[var(--pp-navy)]">
            Sign in with email
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            We&apos;ll send a one-time code. No password required.
          </p>
        </div>
        <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
          <AuthForm />
        </Suspense>
      </div>
      <SiteFooter />
    </div>
  );
}
