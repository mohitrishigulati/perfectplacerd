import Link from "next/link";

export function PerfectPlacerLogo({ compact }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex flex-col leading-none">
      <span className="font-serif text-lg font-semibold tracking-tight text-[var(--pp-gold)] transition group-hover:text-white">
        Perfect Placer
      </span>
      {!compact && (
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--pp-muted)]">
          Human Resource Consultant
        </span>
      )}
    </Link>
  );
}
