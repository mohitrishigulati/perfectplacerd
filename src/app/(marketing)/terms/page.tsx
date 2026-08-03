import Link from "next/link";
import { PageHero, ProseSection } from "@/components/marketing/page-hero";
import { createPublicMetadata } from "@/lib/site/metadata";

export const metadata = createPublicMetadata({
  title: "Terms of Use",
  description: "Terms of use for the Perfect Placer website and candidate registration.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Use"
        description="Please read these terms before using our website or submitting your profile."
      />
      <ProseSection>
        <h2>Website use</h2>
        <p>
          Perfect Placer provides executive search, HR consulting, and candidate
          registration services. Content on this site is for general information
          and does not constitute a job offer or employment contract.
        </p>
        <h2>Candidate submissions</h2>
        <p>
          By registering, you confirm that the information and résumé you submit
          are accurate and that you are authorised to share them. We may contact
          you regarding relevant opportunities. Submission does not guarantee
          placement or an interview.
        </p>
        <h2>Client engagements</h2>
        <p>
          Employer search mandates are governed by separate engagement terms
          agreed with Perfect Placer. Website content does not replace those
          agreements.
        </p>
        <h2>Liability</h2>
        <p>
          We take reasonable care with profiles and client mandates, but we are
          not liable for decisions made by third-party employers or for indirect
          losses arising from use of this website.
        </p>
        <h2>Privacy</h2>
        <p>
          Personal data is handled as described in our{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
        <p className="text-sm text-zinc-500">Last updated: August 2026</p>
      </ProseSection>
    </>
  );
}
