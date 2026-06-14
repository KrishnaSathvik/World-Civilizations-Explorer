import type { Metadata } from "next";
import { siteConfig, absoluteUrl } from "./site";

interface PageSeoInput {
  title: string;
  description: string;
  /** Path beginning with "/" used for the canonical + OG url. */
  path: string;
  image?: string;
  /** Set true to keep the page out of search indexes. */
  noindex?: boolean;
  type?: "website" | "article" | "profile";
}

/**
 * Build a complete, consistent Metadata object for a page: canonical URL,
 * Open Graph, and Twitter card. Titles are passed through the layout title
 * template so they read "<page> | World Civilizations Explorer".
 */
export function buildMetadata({
  title,
  description,
  path,
  image,
  noindex,
  type = "website",
}: PageSeoInput): Metadata {
  const url = absoluteUrl(path);
  // When no custom image is supplied, omit images so the generated default
  // When no custom image is supplied, fall back to the generated default OG
  // image route. Defining openGraph on a child segment otherwise drops the
  // root file-convention image, leaving an empty og:image.
  const ogImage = image || absoluteUrl("/opengraph-image");
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: type === "profile" ? "profile" : type,
      locale: siteConfig.locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitter,
      title,
      description,
      images: [ogImage],
    },
  };
}
