import { PageHero, ProseSection } from "@/components/marketing/page-hero";
import { BRAND } from "@/content/marketing";
import { createPublicMetadata } from "@/lib/site/metadata";

export const metadata = createPublicMetadata({
  title: "Privacy Policy",
  description:
    "How Perfect Placer collects, uses, stores, and protects your personal information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description="How we collect, use, store, and protect your information."
      />
      <ProseSection>
        <p className="text-sm text-zinc-600">
          This policy is a practical summary for website users. It should be
          reviewed by counsel for compliance with the Digital Personal Data
          Protection Act, 2023 (DPDP Act) and other applicable Indian
          requirements before relying on it as a complete legal document.
        </p>
        <p>
          Perfect Placer (&quot;we&quot;, &quot;us&quot;) is a human resource
          consulting and executive search firm based in India. This policy
          explains how we handle personal data submitted through our website,
          including candidate registration, and how you can exercise your
          rights.
        </p>
        <h2>What we collect</h2>
        <p>
          When you register as a candidate, we may collect your name, email,
          phone number, city, skills, experience, role and location preferences,
          résumé/CV, and optional details you choose to provide. We also process
          technical data such as IP address and basic request logs when you use
          the site.
        </p>
        <h2>Purpose and lawful use</h2>
        <ul>
          <li>To evaluate your profile for suitable professional and leadership roles</li>
          <li>To contact you about opportunities, interviews, or clarifications</li>
          <li>To share relevant profiles with client organisations (with discretion)</li>
          <li>To maintain our talent network and improve our services</li>
          <li>To protect our systems against abuse (e.g. login rate limiting)</li>
        </ul>
        <h2>Your rights</h2>
        <p>
          Subject to applicable law, you may request access, correction, erasure,
          or withdrawal of consent. Send requests to{" "}
          <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>.
        </p>
        <h2>Resume upload and profile suggestions</h2>
        <p>
          When you upload a résumé and give consent on the resume page, we
          process the file to suggest profile fields (such as contact details,
          skills, or summary text). Suggestions are shown for your review; we do
          not update your profile automatically without your confirmation.
        </p>
        <ul>
          <li>
            Supported formats: PDF, Word (DOC/DOCX), and JPEG/PNG images up to
            10&nbsp;MB.
          </li>
          <li>
            Files are stored in a private bucket. Structured suggestions and
            confidence scores are stored separately; we do not store raw
            third-party AI responses in your account.
          </li>
          <li>
            Résumé files linked to submitted applications remain available for
            recruitment review according to our application retention practices,
            even if you upload a newer primary résumé later.
          </li>
          <li>
            When you delete your account, unreferenced résumé files and parsing
            metadata are removed; files still tied to applications may be
            retained as needed for recruitment records.
          </li>
        </ul>
        <h2>Retention</h2>
        <p>
          Candidate profiles and résumés are retained while relevant for
          placement consideration, or until you request deletion.
        </p>
        <h2>Sharing and processors</h2>
        <p>
          We do not sell personal data. Résumés you upload are stored securely
          and may be accessed by authorized Perfect Placer recruiters to
          evaluate applications. We may use service providers (hosting, email,
          infrastructure such as Vercel or Supabase) who process data on our
          behalf under appropriate terms.
        </p>
        <h2>Security</h2>
        <p>
          We apply reasonable technical and organisational measures, including
          access-controlled admin portals, encrypted session cookies, and HTTPS
          in production.
        </p>
        <h2>Contact</h2>
        <p>
          For privacy or grievance requests, contact {BRAND.email}. Head office:
          D-925A Urbtech Trade Centre, Sector 132, Noida 201304.
        </p>
        <p className="text-sm text-zinc-500">Last updated: August 2026</p>
      </ProseSection>
    </>
  );
}
