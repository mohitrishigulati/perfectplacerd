import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center bg-[var(--pp-cream)] px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--pp-gold-dark)]">
          404
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-[var(--pp-navy)]">
          Page not found
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--pp-ink)]/70">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-primary">
            Back to home
          </Link>
          <Link href="/opportunities" className="btn-secondary">
            Browse opportunities
          </Link>
        </div>
      </div>
    </div>
  );
}
