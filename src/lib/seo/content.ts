import { civilizations, type Civilization } from "@/data/civilizations";

/** All civilization slugs (used by generateStaticParams + sitemap). */
export function allCivilizationSlugs(): string[] {
  return civilizations.map((c) => c.slug);
}

export function getCivilization(slug: string): Civilization | undefined {
  return civilizations.find((c) => c.slug === slug);
}

/** Unique historical-figure slugs (Wikipedia-title style, e.g. "Ramesses_II"). */
export function allFigureSlugs(): string[] {
  return Array.from(new Set(civilizations.flatMap((c) => c.keyFigures)));
}

/** Unique topic slugs (Wikipedia-title style, e.g. "Egyptian_pyramids"). */
export function allTopicSlugs(): string[] {
  return Array.from(new Set(civilizations.flatMap((c) => c.topics)));
}

export const eraSlugs = ["ancient", "medieval", "modern"] as const;

/** Turn a Wikipedia-title slug into a human-readable display name. */
export function slugToTitle(slug: string): string {
  return decodeURIComponent(slug).replace(/_/g, " ");
}

/** Civilizations that reference a given figure slug. */
export function civilizationsForFigure(slug: string): Civilization[] {
  return civilizations.filter((c) => c.keyFigures.includes(slug));
}

/** Civilizations that reference a given topic slug. */
export function civilizationsForTopic(slug: string): Civilization[] {
  return civilizations.filter((c) => c.topics.includes(slug));
}
