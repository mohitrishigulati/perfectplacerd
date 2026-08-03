import Link from "next/link";
import { ClientTrustGrid, TrustStrip } from "@/components/marketing/trust-sections";
import { BRAND, SERVICES } from "@/content/marketing";
import { createPublicMetadata } from "@/lib/site/metadata";

export const metadata = createPublicMetadata({
  title: "Executive Search & HR Consultant in Noida, Mumbai, Chennai",
  description:
    "Perfect Placer — executive search, HR consulting and leadership placement across India since 1992. Noida, Mumbai and Chennai.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <section className="bg-[var(--pp-navy)] px-4 py-16 text-white sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[var(--pp-gold)]">
            {BRAND.established} · {BRAND.offices}
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            {BRAND.tagline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--pp-muted)]">
            For three decades, India&apos;s most demanding boardrooms have trusted us
            with a single, decisive question — who. We find the leader who changes
            the trajectory of the organisation.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/auth?next=%2Fdashboard" className="btn-gold">
              Register as candidate
            </Link>
            <Link href="/contact" className="btn-outline-light">
              Discuss a leadership search
            </Link>
            <Link href="/opportunities" className="btn-outline-light">
              View opportunities
            </Link>
          </div>
        </div>
      </section>

      <TrustStrip />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-serif text-2xl font-semibold text-[var(--pp-navy)]">
          What we do, we do for the few roles that matter most.
        </h2>
        <ul className="mt-10 grid gap-6 md:grid-cols-3" role="list">
          {SERVICES.map((service, index) => (
            <li
              key={service.title}
              className="rounded-2xl border border-[var(--pp-border)] bg-white p-6 shadow-sm"
            >
              <span className="text-sm font-semibold text-[var(--pp-gold)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-[var(--pp-navy)]">
                {service.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {service.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <ClientTrustGrid />

      <section className="border-t border-[var(--pp-border)] bg-white px-4 py-12 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/about", title: "About us", sub: "Three decades across India" },
            { href: "/services", title: "Services", sub: "Search & HR consulting" },
            { href: "/opportunities", title: "Opportunities", sub: "Published leadership roles" },
            { href: "/clients", title: "Clients", sub: "Trusted corporates" },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-xl border border-[var(--pp-border)] p-5 hover:border-[var(--pp-gold)]"
            >
              <span className="font-semibold text-[var(--pp-navy)]">{card.title}</span>
              <span className="mt-1 block text-sm text-zinc-600">{card.sub}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
