import Link from "next/link";
import { PageHero, ProseSection } from "@/components/marketing/page-hero";
import { SERVICES } from "@/content/marketing";
import { createPublicMetadata } from "@/lib/site/metadata";

export const metadata = createPublicMetadata({
  title: "Executive Search & HR Services",
  description:
    "Executive search, HR consulting, training and mentoring for leadership roles across India.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Executive search & talent solutions"
        description="Retained search, sensitive HR mandates, and leader onboarding — delivered by advisors who have handled these situations before."
      />
      <ProseSection>
        <ul className="not-prose grid gap-6">
          {SERVICES.map((service) => (
            <li
              key={service.title}
              className="rounded-xl border border-[var(--pp-border)] bg-white p-6 shadow-sm"
            >
              <h2 className="font-serif text-xl font-semibold text-[var(--pp-navy)]">
                {service.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-600">{service.description}</p>
            </li>
          ))}
        </ul>
        <p className="mt-10">
          <Link href="/contact" className="btn-gold inline-flex">
            Discuss a mandate
          </Link>
        </p>
      </ProseSection>
    </>
  );
}
