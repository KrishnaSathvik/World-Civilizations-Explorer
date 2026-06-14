"use client";
import { Link } from "@/lib/router";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ScrollReveal, StaggerContainer, staggerItem } from "@/components/ScrollReveal";
import { SourceBadge, ALL_SOURCES, getSourceLabel, getSourceUrl, getSourceConfig } from "@/components/SourceBadge";
import { motion } from "framer-motion";

interface SourceDetail {
  id: string;
  description: string;
  dataProvided: string[];
  apiType: "Free, no key" | "Free, key required" | "Free, proxied";
  docsUrl: string;
  usedIn: string[];
}

const SOURCE_DETAILS: SourceDetail[] = [
  {
    id: "wikipedia",
    description:
      "The world's largest open encyclopedia. We query the Wikipedia REST API for article summaries, extracts, and thumbnail images for every civilization, historical figure, and topic page.",
    dataProvided: ["Article summaries & extracts", "Thumbnail & hero images", "Content URLs", "Read-time estimates"],
    apiType: "Free, no key",
    docsUrl: "https://en.wikipedia.org/api/rest_v1/",
    usedIn: ["Civilization pages", "Figure pages", "Topic pages", "RAG knowledge base"],
  },
  {
    id: "wikidata",
    description:
      "A free, structured knowledge base that provides machine-readable data. Used for SPARQL queries to retrieve structured facts like coordinates, dates, and relationships between entities.",
    dataProvided: ["Structured entity data", "Geographic coordinates", "Birth/death dates", "Entity relationships"],
    apiType: "Free, no key",
    docsUrl: "https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service",
    usedIn: ["World map", "Civilization metadata"],
  },
  {
    id: "wikimedia-commons",
    description:
      "A repository of freely usable media files. We query Commons for high-quality, categorized historical images including artwork reproductions, archaeological photos, and historical maps.",
    dataProvided: ["High-resolution images", "Historical artwork", "Archaeological photographs", "Categorized media"],
    apiType: "Free, no key",
    docsUrl: "https://commons.wikimedia.org/w/api.php",
    usedIn: ["Civilization gallery sections", "Topic illustrations"],
  },
  {
    id: "met",
    description:
      "The Metropolitan Museum of Art's Open Access initiative provides data on over 470,000 artworks. We search by culture, era, and keyword to surface relevant artifacts.",
    dataProvided: ["Artwork images", "Artist attribution", "Medium & materials", "Cultural origin & dating"],
    apiType: "Free, no key",
    docsUrl: "https://metmuseum.github.io/",
    usedIn: ["Museum artifacts section", "Museum search page"],
  },
  {
    id: "aic",
    description:
      "The Art Institute of Chicago houses a world-class collection spanning 5,000 years. Their IIIF-compatible API provides excellent image quality and detailed metadata.",
    dataProvided: ["IIIF artwork images", "Artist & provenance data", "Place of origin", "Exhibition history"],
    apiType: "Free, no key",
    docsUrl: "https://api.artic.edu/docs/",
    usedIn: ["Museum artifacts section", "Museum search page"],
  },
  {
    id: "smithsonian",
    description:
      "The Smithsonian Open Access program provides data from 21 museums and galleries. We proxy requests through a backend function to access their diverse collection of American and world cultural artifacts.",
    dataProvided: ["Artifact images", "Cultural context", "Historical objects", "Natural history specimens"],
    apiType: "Free, proxied",
    docsUrl: "https://edan.si.edu/openaccess/apidocs/",
    usedIn: ["Museum artifacts section", "Museum search page"],
  },
  {
    id: "harvard",
    description:
      "Harvard Art Museums maintain one of the most comprehensive academic art collections in the world, with detailed scholarly metadata and high-quality imaging.",
    dataProvided: ["Scholarly artwork data", "Conservation records", "High-res imaging", "Academic classification"],
    apiType: "Free, key required",
    docsUrl: "https://github.com/harvardartmuseums/api-docs",
    usedIn: ["Museum artifacts section", "Museum search page"],
  },
  {
    id: "rijksmuseum",
    description:
      "The Dutch national museum's API provides access to their collection of masterworks by Rembrandt, Vermeer, and other Dutch Golden Age artists, with excellent image quality.",
    dataProvided: ["Dutch masterworks", "Detailed provenance", "High-quality tiles", "Historical Dutch art"],
    apiType: "Free, key required",
    docsUrl: "https://data.rijksmuseum.nl/object-metadata/api/",
    usedIn: ["Museum artifacts section", "Museum search page"],
  },
  {
    id: "loc",
    description:
      "The Library of Congress is the largest library in the world. We query their digital collections for historical photographs, prints, maps, and primary source documents.",
    dataProvided: ["Historical photographs", "Antique maps", "Primary source documents", "Prints & drawings"],
    apiType: "Free, no key",
    docsUrl: "https://www.loc.gov/apis/",
    usedIn: ["Primary sources section on civilization pages"],
  },
  {
    id: "unsplash",
    description:
      "Unsplash provides high-quality, royalty-free contemporary photography. We use it for modern photos of historical sites like the Pyramids, Colosseum, and Great Wall.",
    dataProvided: ["Modern site photography", "Photographer attribution", "Multiple resolutions", "Color metadata"],
    apiType: "Free, key required",
    docsUrl: "https://unsplash.com/documentation",
    usedIn: ["Modern photography section on civilization pages"],
  },
  {
    id: "api-ninjas",
    description:
      "API Ninjas provides a historical events API that we use to build dynamic, searchable timelines and enrich 'This Day in History' with births and deaths data.",
    dataProvided: ["Historical events by keyword", "Birth records", "Death records", "Date-based queries"],
    apiType: "Free, key required",
    docsUrl: "https://api-ninjas.com/api/historicalevents",
    usedIn: ["Dynamic timeline", "This Day in History (births & deaths)"],
  },
  {
    id: "muffinlabs",
    description:
      "A lightweight 'Today in History' API that returns notable events, births, and deaths for the current date, sourced from Wikipedia's historical records.",
    dataProvided: ["Daily historical events", "Notable births", "Notable deaths", "Wikipedia links"],
    apiType: "Free, no key",
    docsUrl: "https://history.muffinlabs.com/",
    usedIn: ["This Day in History (events tab)"],
  },
];

export default function DataSourcesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container relative">
            <Breadcrumbs items={[{ label: "Data Sources" }]} className="mb-8" />
            <ScrollReveal>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Data Sources
              </h1>
              <p className="font-body text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Cultural Explorer is built entirely on open data. Every piece of content is sourced
                from public APIs, and we display attribution badges so you always know where information
                comes from.
              </p>
              <div className="flex flex-wrap gap-2 mt-6">
                {ALL_SOURCES.filter((s) => s !== "europeana").map((source) => (
                  <SourceBadge key={source} source={source} size="md" />
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Source Cards */}
        <section className="container pb-20">
          <StaggerContainer className="space-y-6" staggerDelay={0.06}>
            {SOURCE_DETAILS.map((detail) => {
              const config = getSourceConfig(detail.id);
              if (!config) return null;
              const Icon = config.icon;

              return (
                <motion.div
                  key={detail.id}
                  variants={staggerItem}
                  className="rounded-xl border border-border/60 bg-card p-6 md:p-8 hover:border-primary/20 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Left: icon + badge */}
                    <div className="flex items-center gap-3 md:flex-col md:items-center md:w-32 shrink-0">
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: "hsl(var(--muted))",
                        }}
                      >
                        <Icon className="h-6 w-6 text-foreground" />
                      </div>
                      <SourceBadge source={detail.id} size="md" />
                    </div>

                    {/* Right: content */}
                    <div className="flex-1 min-w-0 space-y-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="font-display text-xl font-bold text-foreground">
                            {getSourceLabel(detail.id)}
                          </h2>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                            {detail.apiType}
                          </span>
                        </div>
                        <p className="font-body text-sm text-muted-foreground leading-relaxed">
                          {detail.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Data provided */}
                        <div>
                          <h3 className="font-heading text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">
                            Data Provided
                          </h3>
                          <ul className="space-y-1">
                            {detail.dataProvided.map((item) => (
                              <li key={item} className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
                                <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Used in */}
                        <div>
                          <h3 className="font-heading text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">
                            Used In
                          </h3>
                          <ul className="space-y-1">
                            {detail.usedIn.map((item) => (
                              <li key={item} className="text-xs font-body text-muted-foreground">
                                • {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Links */}
                      <div className="flex items-center gap-4 pt-2">
                        <a
                          href={detail.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-heading text-primary hover:underline"
                        >
                          API Documentation <ExternalLink className="h-3 w-3" />
                        </a>
                        <a
                          href={getSourceUrl(detail.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-heading text-muted-foreground hover:text-foreground"
                        >
                          Visit Website <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </StaggerContainer>
        </section>
      </main>

      <Footer />
    </div>
  );
}