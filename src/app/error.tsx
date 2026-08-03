"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center bg-[var(--pp-cream)] px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--pp-gold-dark)]">
          Something went wrong
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-[var(--pp-navy)]">
          We hit a snag
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--pp-ink)]/70">
          An unexpected error occurred. You can try again, or head back to the
          homepage.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/" className="btn-secondary">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
