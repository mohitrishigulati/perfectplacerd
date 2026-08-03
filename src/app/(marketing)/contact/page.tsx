import { PageHero, ProseSection } from "@/components/marketing/page-hero";
import { BRAND, OFFICES } from "@/content/marketing";
import { createPublicMetadata } from "@/lib/site/metadata";

export const metadata = createPublicMetadata({
  title: "Contact Us",
  description:
    "Contact Perfect Placer — Noida, Mumbai and Chennai. Executive search and HR consulting.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Reach us"
        title={BRAND.offices}
        description={`Call our offices or write to ${BRAND.email} for candidate registration and client mandates.`}
      />
      <ProseSection>
        <h2>Our offices</h2>
        <p>Connect with the office nearest to you for recruitment and consulting support.</p>
        <div className="not-prose grid gap-6 sm:grid-cols-3">
          {OFFICES.map((office) => (
            <article
              key={office.city}
              className="rounded-xl border border-[var(--pp-border)] bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--pp-gold-dark)]">
                {office.region}
              </p>
              <h3 className="mt-1 font-serif text-xl text-[var(--pp-navy)]">
                {office.city}
              </h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-zinc-500">Contact</dt>
                  <dd>{office.contact}</dd>
                </div>
                {"phone" in office && office.phone && (
                  <div>
                    <dt className="text-zinc-500">Telephone</dt>
                    <dd>
                      <a href={`tel:${office.phone.replace(/\s/g, "")}`}>
                        {office.phone}
                      </a>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-zinc-500">Email</dt>
                  <dd>
                    <a href={`mailto:${office.email}`}>{office.email}</a>
                  </dd>
                </div>
                {"address" in office && office.address && (
                  <div>
                    <dt className="text-zinc-500">Address</dt>
                    <dd>{office.address}</dd>
                  </div>
                )}
              </dl>
            </article>
          ))}
        </div>
        <p className="mt-8">
          General enquiries:{" "}
          <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
        </p>
      </ProseSection>
    </>
  );
}
