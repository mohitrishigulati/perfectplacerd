import Link from "next/link";
import { BRAND, OFFICES } from "@/content/marketing";
import { PerfectPlacerLogo } from "@/components/marketing/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--pp-border)] bg-[var(--pp-navy-deep)] text-[var(--pp-muted)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <PerfectPlacerLogo />
          <p className="mt-4 text-sm leading-relaxed">
            Three decades of HR consulting, executive search and talent placement
            across India.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
            Quick links
          </h2>
          <ul className="mt-3 space-y-2 text-sm" role="list">
            {[
              ["/about", "About"],
              ["/services", "Services"],
              ["/opportunities", "Opportunities"],
              ["/auth", "Candidate sign in"],
              ["/clients", "Clients"],
              ["/contact", "Contact"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-[var(--pp-gold)]">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
            Reach us
          </h2>
          <p className="mt-3 text-sm">{BRAND.offices}</p>
          <p className="mt-2">
            <a
              href={`mailto:${BRAND.email}`}
              className="font-medium text-[var(--pp-gold)] hover:underline"
            >
              {BRAND.email}
            </a>
          </p>
          <ul className="mt-4 space-y-1 text-xs" role="list">
            {OFFICES.map((office) => (
              <li key={office.city}>
                {office.city}: {office.phone}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 px-4 py-4 text-center text-xs sm:px-6">
        <Link href="/privacy" className="hover:text-white">
          Privacy
        </Link>
        {" · "}
        <Link href="/terms" className="hover:text-white">
          Terms
        </Link>
        <p className="mt-2">
          © {new Date().getFullYear()} Perfect Placer · {BRAND.domain} · All
          rights reserved.
        </p>
      </div>
    </footer>
  );
}
