import type { Metadata } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/site/url";

const SITE_NAME = "Perfect Placer";

type PublicMetadataInput = {
  title: string;
  description: string;
  path: string;
};

/** Document title with brand — for Open Graph / social, not the Next `title` field. */
export function formatBrandedTitle(pageTitle: string): string {
  const trimmed = pageTitle.trim();
  if (!trimmed) {
    return SITE_NAME;
  }
  if (trimmed.includes(SITE_NAME)) {
    return trimmed;
  }
  return `${trimmed} | ${SITE_NAME}`;
}

export function createPublicMetadata({
  title,
  description,
  path,
}: PublicMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const brandedTitle = formatBrandedTitle(title);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: brandedTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
    },
  };
}

export function createNoIndexMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
    metadataBase: new URL(getSiteUrl()),
  };
}

export { SITE_NAME };
