import type { OpportunityDetail } from "@/lib/opportunities/queries";
import { absoluteUrl } from "@/lib/site/url";

type JobPostingJsonLdProps = {
  opportunity: OpportunityDetail;
};

export function JobPostingJsonLd({ opportunity }: JobPostingJsonLdProps) {
  const payload = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: opportunity.title,
    description: opportunity.description,
    datePosted: opportunity.published_at ?? undefined,
    employmentType: opportunity.employment_type ?? "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: "Perfect Placer",
      sameAs: absoluteUrl("/"),
    },
    jobLocation: opportunity.location
      ? {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: opportunity.location,
            addressCountry: "IN",
          },
        }
      : undefined,
    baseSalary:
      opportunity.salary_min && opportunity.salary_max
        ? {
            "@type": "MonetaryAmount",
            currency: opportunity.salary_currency,
            value: {
              "@type": "QuantitativeValue",
              minValue: opportunity.salary_min,
              maxValue: opportunity.salary_max,
              unitText: "YEAR",
            },
          }
        : undefined,
    identifier: {
      "@type": "PropertyValue",
      name: "Perfect Placer",
      value: opportunity.slug,
    },
    url: absoluteUrl(`/opportunities/${opportunity.slug}`),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
