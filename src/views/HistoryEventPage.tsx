"use client";
import { useSearchParams, Link } from "@/lib/router";
import { useQuery } from "@tanstack/react-query";
import { fetchWikipediaSummary, fetchWikipediaImages } from "@/services/api";
import { fetchFigureFromWikidata } from "@/services/wikidata";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  Calendar, Baby, Skull, ArrowLeft, ExternalLink,
  MapPin, Briefcase, Clock, BookOpen, Users, Globe, ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function formatWikiDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function splitIntoParagraphs(text: string): string[] {
  return text.split(/\n+/).filter((p) => p.trim().length > 0);
}

export default function HistoryEventPage() {
  const [params] = useSearchParams();
  const year = params.get("year") || "";
  const text = params.get("text") || "";
  const type = params.get("type") || "event";
  const wikiTitle = params.get("wiki") || "";

  const isPerson = type === "birth" || type === "death";

  // Wikipedia summary
  const { data: wikiData, isLoading: wikiLoading } = useQuery({
    queryKey: ["wiki-event", wikiTitle],
    queryFn: () => fetchWikipediaSummary(wikiTitle),
    enabled: !!wikiTitle,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  // Wikipedia images
  const { data: wikiImages } = useQuery({
    queryKey: ["wiki-event-images", wikiTitle],
    queryFn: () => fetchWikipediaImages(wikiTitle),
    enabled: !!wikiTitle,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  // Wikidata structured info (for people)
  const { data: wikidataInfo } = useQuery({
    queryKey: ["wikidata-event", wikiTitle],
    queryFn: () => fetchFigureFromWikidata(wikiTitle),
    enabled: !!wikiTitle && isPerson,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  // Related Wikipedia articles from the "See also" / linked pages
  const { data: relatedArticles } = useQuery({
    queryKey: ["wiki-related", wikiTitle],
    queryFn: async () => {
      const res = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=links&pllimit=20&plnamespace=0&format=json&origin=*`
      );
      if (!res.ok) return [];
      const data = await res.json();
      const pages = data.query?.pages || {};
      const page = Object.values(pages)[0] as any;
      const links: string[] = (page?.links || [])
        .map((l: any) => l.title)
        .filter((t: string) => t.length > 3 && !t.includes(":"))
        .slice(0, 8);
      return links;
    },
    enabled: !!wikiTitle,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  // On this day context — other events from same year via Wikipedia
  const { data: yearArticle } = useQuery({
    queryKey: ["wiki-year", year],
    queryFn: () => fetchWikipediaSummary(year.replace(/\s/g, "_")),
    enabled: !!year && year.length <= 10,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

  const typeIcon = type === "birth" ? <Baby className="h-5 w-5" /> : type === "death" ? <Skull className="h-5 w-5" /> : <Calendar className="h-5 w-5" />;
  const typeLabel = type === "birth" ? "Birth" : type === "death" ? "Death" : "Historical Event";
  const typeColor = type === "birth" ? "text-green-600" : type === "death" ? "text-destructive" : "text-primary";

  const paragraphs = wikiData?.extract ? splitIntoParagraphs(wikiData.extract) : [];
  const heroImage = wikiData?.originalimage?.source || wikiData?.thumbnail?.source || wikidataInfo?.image;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="border-b border-border/60 bg-gradient-to-b from-primary/[0.04] to-background">
          <div className="container py-8 md:py-14">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "This Day in History", href: "/#history" },
                { label: `${year}` },
              ]}
            />
            <Link to="/#history">
              <Button variant="ghost" size="sm" className="mb-6 font-heading text-xs gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to This Day in History
              </Button>
            </Link>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Hero image */}
              {heroImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full md:w-72 lg:w-80 shrink-0"
                >
                  <img
                    src={heroImage}
                    alt={wikiData?.title || text}
                    className="w-full h-56 md:h-72 object-cover rounded-2xl border border-border/60 shadow-lg"
                  />
                </motion.div>
              )}

              {/* Hero text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 ${typeColor}`}>
                    {typeIcon}
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs font-bold">
                    {year}
                  </Badge>
                  <Badge variant="outline" className="font-heading text-xs">
                    {typeLabel}
                  </Badge>
                </div>

                <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground leading-tight mb-4">
                  {wikiData?.title || text}
                </h1>

                {/* Quick facts for people */}
                {isPerson && wikidataInfo && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {wikidataInfo.birthDate && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Baby className="h-3.5 w-3.5 text-green-600" />
                        <span className="font-heading">Born: {formatWikiDate(wikidataInfo.birthDate)}</span>
                      </div>
                    )}
                    {wikidataInfo.deathDate && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Skull className="h-3.5 w-3.5 text-destructive" />
                        <span className="font-heading">Died: {formatWikiDate(wikidataInfo.deathDate)}</span>
                      </div>
                    )}
                    {wikidataInfo.birthPlace && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="font-heading">{wikidataInfo.birthPlace}</span>
                      </div>
                    )}
                    {wikidataInfo.occupation && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span className="font-heading">{wikidataInfo.occupation}</span>
                      </div>
                    )}
                  </div>
                )}

                {wikidataInfo?.description && (
                  <p className="text-sm font-body text-muted-foreground italic mb-4">
                    {wikidataInfo.description}
                  </p>
                )}

                {/* First paragraph */}
                {wikiLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : paragraphs.length > 0 ? (
                  <p className="font-body text-foreground/90 leading-relaxed text-base">
                    {paragraphs[0]}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <div className="container py-8 md:py-12">
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Full Overview */}
            {paragraphs.length > 1 && (
              <ScrollReveal>
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-xl font-bold text-foreground">Full Overview</h2>
                  </div>
                  <div className="space-y-4 font-body text-foreground/85 leading-relaxed">
                    {paragraphs.slice(1).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </section>
              </ScrollReveal>
            )}

            {/* Historical Context — what else happened in this year */}
            {yearArticle && (
              <ScrollReveal>
                <section className="p-6 rounded-2xl border border-border/60 bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-accent" />
                    <h2 className="font-display text-lg font-bold text-foreground">
                      Historical Context — Year {year}
                    </h2>
                  </div>
                  <p className="font-body text-muted-foreground leading-relaxed text-sm">
                    {yearArticle.extract?.slice(0, 600)}
                    {(yearArticle.extract?.length || 0) > 600 ? "…" : ""}
                  </p>
                  <a
                    href={`https://en.wikipedia.org/wiki/${year.replace(/\s/g, "_")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-heading font-medium text-primary hover:underline"
                  >
                    More about {year} on Wikipedia <ExternalLink className="h-3 w-3" />
                  </a>
                </section>
              </ScrollReveal>
            )}

            {/* Gallery */}
            {wikiImages && wikiImages.length > 0 && (
              <ScrollReveal>
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-xl font-bold text-foreground">Gallery</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {wikiImages.slice(0, 9).map((img, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <img
                          src={img.source}
                          alt={img.title}
                          className="w-full h-36 md:h-44 object-cover rounded-xl border border-border/60 hover:shadow-md transition-shadow"
                          loading="lazy"
                        />
                      </motion.div>
                    ))}
                  </div>
                </section>
              </ScrollReveal>
            )}

            {/* Related Topics */}
            {relatedArticles && relatedArticles.length > 0 && (
              <ScrollReveal>
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-xl font-bold text-foreground">Related Topics</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {relatedArticles.map((title) => (
                      <a
                        key={title}
                        href={`https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 bg-card hover:bg-accent text-sm font-heading font-medium text-foreground transition-colors"
                      >
                        {title}
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </section>
              </ScrollReveal>
            )}

            {/* External Links */}
            <ScrollReveal>
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-xl font-bold text-foreground">Learn More</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {wikiTitle && (
                    <a
                      href={`https://en.wikipedia.org/wiki/${wikiTitle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-accent text-sm font-heading font-medium text-foreground transition-colors"
                    >
                      <BookOpen className="h-4 w-4" />
                      Wikipedia Article
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(`${text} ${year} history`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-accent text-sm font-heading font-medium text-foreground transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Search Google
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                  {isPerson && wikiTitle && (
                    <a
                      href={`https://www.wikidata.org/wiki/Special:Search?search=${encodeURIComponent(wikiTitle.replace(/_/g, " "))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-accent text-sm font-heading font-medium text-foreground transition-colors"
                    >
                      <Users className="h-4 w-4" />
                      Wikidata
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  )}
                </div>
              </section>
            </ScrollReveal>

            {/* Fallback when no wiki data */}
            {!wikiTitle && (
              <div className="p-6 rounded-2xl border border-border/60 bg-card">
                <p className="font-body text-muted-foreground">
                  This historical {typeLabel.toLowerCase()} occurred in {year}.
                </p>
                <a
                  href={`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(`${year} ${text}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent text-sm font-heading font-medium text-foreground transition-colors"
                >
                  Search on Wikipedia <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}