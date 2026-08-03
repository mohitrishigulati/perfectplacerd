import Link from "next/link";
import { ClientTrustGrid } from "@/components/marketing/trust-sections";
import { PageHero, ProseSection } from "@/components/marketing/page-hero";
import { createPublicMetadata } from "@/lib/site/metadata";

export const metadata = createPublicMetadata({
  title: "Our Clients",
  description:
    "Organisations that trust Perfect Placer for executive search and leadership hiring across India.",
  path: "/clients",
});

export default function ClientsPage() {
  return (
    <>
      <PageHero
        eyebrow="Our clients"
        title="The company we keep"
        description="Conglomerates, MNCs and high-growth challengers who have trusted us with leadership over the past few years."
      />
      <ProseSection>
        <h2>Relationships, not transactions</h2>
        <p>
          Most of our clients have been with us for over a decade. The proof of
          good hiring is how long it lasts — we prioritise fit so placements
          endure beyond typical probation windows.
        </p>
        <p>
          <Link href="/contact" className="font-medium text-[var(--pp-gold-dark)]">
            Have a role you cannot afford to get wrong?
          </Link>
        </p>
      </ProseSection>
      <ClientTrustGrid compact />
    </>
  );
}
