import type { Metadata } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/site/url";

const SITE_NAME = "Perfect Placer";

type PublicMetadataInput = {
  title: string;
  description: string;
  path: string;
};

export function createPublicMetadata({
  title,
  description,
  path,
}: PublicMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical },
    openGraph: {
      title: fullTitle,
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
    title: `${title} | ${SITE_NAME}`,
    robots: { index: false, follow: false },
    metadataBase: new URL(getSiteUrl()),
  };
}

export { SITE_NAME };
