/**
 * Central site configuration used for SEO metadata, sitemap, robots, and
 * structured data. Keeping this in one place avoids duplicate / drifting
 * titles and descriptions across pages.
 */

export const siteConfig = {
  name: "World Civilizations Explorer",
  shortName: "Civilizations Explorer",
  description:
    "Explore 10,000 years of world history — civilizations, historical figures, topics, eras, maps, and timelines — with source-grounded data from Wikipedia, Wikimedia, museums, and the Library of Congress.",
  // Public canonical origin. Override per-environment with NEXT_PUBLIC_SITE_URL.
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://worldcivilizations.app").replace(
    /\/$/,
    "",
  ),
  ogImage: "/og-default.png",
  twitter: "@CulturalExplorer",
  locale: "en_US",
} as const;

/** Build an absolute URL for a given path against the canonical origin. */
export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
