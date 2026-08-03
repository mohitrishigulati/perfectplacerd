import { PageHero, ProseSection } from "@/components/marketing/page-hero";
import { BRAND, OFFICES } from "@/content/marketing";
import { createPublicMetadata } from "@/lib/site/metadata";

export const metadata = createPublicMetadata({
  title: "About",
  description:
    "Human resource consulting and executive search across India since 1992. Offices in Noida, Mumbai and Chennai.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow={BRAND.established}
        title="Three decades of HR excellence across India"
        description="Perfect Placer is a human resource consulting and executive search firm helping boardrooms and leadership teams make decisive hiring choices."
      />
      <ProseSection>
        <p>
          Since 1992, we have partnered with conglomerates, multinational
          corporations and high-growth challengers to fill the roles that matter
          most — CEO, CFO, business heads, and specialist leadership mandates
          that cannot afford a miss.
        </p>
        <h2>Our footprint</h2>
        <p>
          We are headquartered in {BRAND.offices}, with collaborators across
          major cities for pan-India searches. Long-term retained relationships
          are the norm: many clients have worked with us for more than a decade.
        </p>
        <h2>What we believe</h2>
        <ul>
          <li>Executive search is about judgement, discretion and fit — not volume.</li>
          <li>Candidates deserve clarity, respect and confidentiality.</li>
          <li>Employers deserve honest counsel when the stakes are highest.</li>
        </ul>
        <h2>Offices</h2>
        <ul>
          {OFFICES.map((office) => (
            <li key={office.city}>
              <strong>{office.city}</strong> — {office.contact}
              {"address" in office && office.address
                ? ` · ${office.address}`
                : ""}
            </li>
          ))}
        </ul>
      </ProseSection>
    </>
  );
}
