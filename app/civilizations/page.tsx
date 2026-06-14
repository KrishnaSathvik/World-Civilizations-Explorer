import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { civilizations } from "@/data/civilizations";

export const metadata: Metadata = buildMetadata({
  title: "World Civilizations | Browse Every Culture & Era",
  description:
    "Browse every world civilization in the Explorer — ancient, medieval, and modern cultures across Africa, the Americas, Asia, Europe, and the Middle East, with date ranges, regions, and timelines.",
  path: "/civilizations",
});

const eras = ["Ancient", "Medieval", "Modern"] as const;

export default function CivilizationsIndexRoute() {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "World Civilizations",
    url: absoluteUrl("/civilizations"),
    hasPart: civilizations.map((c) => ({
      "@type": "Article",
      name: c.name,
      url: absoluteUrl(`/civilizations/${c.slug}`),
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <JsonLd
        data={[
          collectionJsonLd,
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Civilizations", path: "/civilizations" },
          ]),
        ]}
      />
      <Navbar />
      <main className="container py-12">
        <header className="mb-10 max-w-3xl">
          <h1 className="font-display text-4xl font-bold text-foreground">
            World Civilizations
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore {civilizations.length} civilizations spanning 10,000 years of
            human history. Each guide covers the culture&apos;s timeline, key
            figures, topics, artifacts, and lasting legacy — grounded in sources
            such as Wikipedia, museum collections, and the Library of Congress.
          </p>
        </header>

        {eras.map((era) => {
          const items = civilizations.filter((c) => c.era === era);
          if (items.length === 0) return null;
          return (
            <section key={era} className="mb-12">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-5">
                {era} Era
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/civilizations/${c.slug}`}
                      className="block rounded-lg border border-border bg-card p-5 transition-colors hover:border-accent"
                    >
                      <h3 className="font-heading text-xl font-semibold text-foreground">
                        {c.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {c.dateRange} · {c.region}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
      <Footer />
    </div>
  );
}
