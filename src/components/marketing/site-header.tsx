import Link from "next/link";
import { PerfectPlacerLogo } from "@/components/marketing/logo";
import { BRAND } from "@/content/marketing";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/clients", label: "Clients" },
  { href: "/contact", label: "Contact" },
] as const;

type SiteHeaderProps = {
  userSignedIn?: boolean;
};

export function SiteHeader({ userSignedIn }: SiteHeaderProps) {
  return (
    <header className="border-b border-[var(--pp-border)] bg-[var(--pp-navy)] text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <PerfectPlacerLogo />
        <nav aria-label="Main" className="flex flex-wrap items-center gap-1 sm:gap-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-[var(--pp-muted)] hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/auth?next=%2Fdashboard"
            className="rounded-lg border border-[var(--pp-gold)]/40 px-3 py-2 text-sm font-medium text-[var(--pp-gold)] hover:bg-[var(--pp-gold)]/10"
          >
            Candidate sign in
          </Link>
          <Link
            href="/contact"
            className="rounded-lg bg-[var(--pp-gold)] px-3 py-2 text-sm font-semibold text-[var(--pp-navy)] hover:bg-[var(--pp-gold-bright)]"
          >
            Employer inquiry
          </Link>
          {userSignedIn && (
            <Link
              href="/dashboard"
              className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/15"
            >
              Dashboard
            </Link>
          )}
        </div>
      </div>
      <p className="border-t border-white/5 py-1.5 text-center text-[11px] tracking-wide text-[var(--pp-muted)]">
        {BRAND.yearsLabel} · {BRAND.offices}
      </p>
    </header>
  );
}
