import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import {
  allTopicSlugs,
  civilizationsForTopic,
  slugToTitle,
} from "@/lib/seo/content";

export const metadata: Metadata = buildMetadata({
  title: "Topics in World History | Culture, Religion, Science & More",
  description:
    "Browse the topics that shaped world civilizations — religion, philosophy, architecture, science, mythology, and more — each cross-linked to related cultures, figures, and sources.",
  path: "/topics",
});

export default function TopicsIndexRoute() {
  const topics = allTopicSlugs()
    .map((slug) => ({
      slug,
      name: slugToTitle(slug),
      civs: civilizationsForTopic(slug),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Topics in World History",
    url: absoluteUrl("/topics"),
    hasPart: topics.map((t) => ({
      "@type": "Article",
      name: t.name,
      url: absoluteUrl(`/topics/${encodeURIComponent(t.slug)}`),
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <JsonLd
        data={[
          collectionJsonLd,
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Topics", path: "/topics" },
          ]),
        ]}
      />
      <Navbar />
      <main className="container py-12">
        <header className="mb-10 max-w-3xl">
          <h1 className="font-display text-4xl font-bold text-foreground">
            Topics in World History
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore {topics.length} topics that defined ancient and modern
            cultures — from religion and philosophy to architecture, science, and
            mythology. Each topic links to the civilizations, figures, artifacts,
            and primary sources connected to it.
          </p>
        </header>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/topics/${encodeURIComponent(t.slug)}`}
                className="block rounded-lg border border-border bg-card p-5 transition-colors hover:border-accent"
              >
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  {t.name}
                </h2>
                {t.civs.length > 0 && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t.civs.map((c) => c.name).join(", ")}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}
