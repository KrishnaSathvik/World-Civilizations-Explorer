import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site";
import {
  allCivilizationSlugs,
  allFigureSlugs,
  allTopicSlugs,
  eraSlugs,
} from "@/lib/seo/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, freq: "weekly" },
    { path: "/civilizations", priority: 0.9, freq: "monthly" },
    { path: "/figures", priority: 0.8, freq: "monthly" },
    { path: "/topics", priority: 0.8, freq: "monthly" },
    { path: "/timeline", priority: 0.8, freq: "monthly" },
    { path: "/map", priority: 0.8, freq: "monthly" },
    { path: "/compare", priority: 0.7, freq: "monthly" },
    { path: "/museums", priority: 0.7, freq: "monthly" },
    { path: "/sources", priority: 0.6, freq: "monthly" },
    { path: "/about", priority: 0.5, freq: "yearly" },
    { path: "/contribute", priority: 0.4, freq: "yearly" },
    { path: "/contact", priority: 0.4, freq: "yearly" },
    { path: "/newsletter", priority: 0.4, freq: "yearly" },
    { path: "/ask", priority: 0.6, freq: "monthly" },
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: absoluteUrl(r.path),
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  for (const slug of eraSlugs) {
    entries.push({
      url: absoluteUrl(`/era/${slug}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const slug of allCivilizationSlugs()) {
    entries.push({
      url: absoluteUrl(`/civilizations/${slug}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    });
  }

  for (const slug of allFigureSlugs()) {
    entries.push({
      url: absoluteUrl(`/figures/${encodeURIComponent(slug)}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const slug of allTopicSlugs()) {
    entries.push({
      url: absoluteUrl(`/topics/${encodeURIComponent(slug)}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
