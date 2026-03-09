import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { User, ExternalLink, MapPin, BookOpen, Clock, Globe, Calendar, ChevronRight, Database, Briefcase, Baby, Skull, Award, Scroll } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { civilizations } from "@/data/civilizations";
import { fetchWikipediaSummary, fetchWikipediaImages } from "@/services/api";
import { fetchFigureFromWikidata } from "@/services/wikidata";
import { searchCommonsImages } from "@/services/wikimedia-commons";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal, StaggerContainer, staggerItem } from "@/components/ScrollReveal";
import { MuseumGallery } from "@/components/MuseumGallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

function formatWikiDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (d.getFullYear() < 0) return `${Math.abs(d.getFullYear())} BCE`;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function FigurePage() {
  const { slug } = useParams<{ slug: string }>();
  const wikiTitle = slug || "";

  const { data: wiki, isLoading } = useQuery({
    queryKey: ["wiki-summary", wikiTitle],
    queryFn: () => fetchWikipediaSummary(wikiTitle),
    staleTime: 1000 * 60 * 30,
    enabled: !!wikiTitle,
  });

  const { data: images } = useQuery({
    queryKey: ["commons-images", wikiTitle],
    queryFn: () => searchCommonsImages(wikiTitle.replace(/_/g, " "), 8),
    staleTime: 1000 * 60 * 30,
    enabled: !!wikiTitle,
  });

  const { data: wikidataInfo } = useQuery({
    queryKey: ["wikidata-figure", wikiTitle],
    queryFn: () => fetchFigureFromWikidata(wikiTitle),
    staleTime: 1000 * 60 * 60,
    enabled: !!wikiTitle,
  });

  // Related Wikipedia links for "See Also"
  const { data: relatedLinks } = useQuery({
    queryKey: ["wiki-links", wikiTitle],
    queryFn: async () => {
      const res = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=links&pllimit=15&plnamespace=0&format=json&origin=*`
      );
      if (!res.ok) return [];
      const data = await res.json();
      const pages = data.query?.pages || {};
      const page = Object.values(pages)[0] as any;
      return (page?.links || [])
        .map((l: any) => l.title as string)
        .filter((t: string) => t.length > 3 && !t.includes(":"))
        .slice(0, 10);
    },
    enabled: !!wikiTitle,
    staleTime: 1000 * 60 * 30,
  });

  const relatedCivs = civilizations.filter((c) =>
    c.keyFigures.includes(wikiTitle)
  );

  const relatedTopics = Array.from(
    new Set(relatedCivs.flatMap((c) => c.topics))
  ).slice(0, 8);

  // ALL timeline events from related civilizations (not just matching name)
  const fullTimeline = relatedCivs.flatMap((c) =>
    c.timeline.map((t) => ({ ...t, civName: c.name, civSlug: c.slug }))
  );

  // Events specifically mentioning this figure
  const figureTimeline = relatedCivs.flatMap((c) =>
    c.timeline
      .filter((t) =>
        t.event.toLowerCase().includes(wikiTitle.replace(/_/g, " ").toLowerCase()) ||
        t.event.toLowerCase().includes(wikiTitle.split("_")[0].toLowerCase())
      )
      .map((t) => ({ ...t, civName: c.name, civSlug: c.slug }))
  );

  const displayName = wikiTitle.replace(/_/g, " ");
  const readTime = wiki?.extract
    ? Math.max(1, Math.ceil(wiki.extract.split(/\s+/).length / 200))
    : null;

  const extractParagraphs = wiki?.extract
    ? wiki.extract.split(/(?<=[.!?])\s+(?=[A-Z])/).reduce<string[]>((acc, sentence, i) => {
        const pIdx = Math.floor(i / 3);
        if (!acc[pIdx]) acc[pIdx] = "";
        acc[pIdx] += (acc[pIdx] ? " " : "") + sentence;
        return acc;
      }, [])
    : [];

  const heroImage = wiki?.originalimage?.source || wiki?.thumbnail?.source || wikidataInfo?.image;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Header */}
        <section className="border-b border-border/60 bg-gradient-to-b from-primary/[0.03] to-background">
          <div className="container py-10 md:py-16">
            <ScrollReveal>
              <Breadcrumbs
                items={[
                  { label: "Figures", href: "/figures" },
                  ...(relatedCivs.length
                    ? [{ label: relatedCivs[0].name, href: `/civilizations/${relatedCivs[0].slug}` }]
                    : []),
                  { label: displayName },
                ]}
              />

              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Portrait */}
                <div className="shrink-0">
                  {isLoading ? (
                    <Skeleton className="h-64 w-48 rounded-xl" />
                  ) : heroImage ? (
                    <img
                      src={heroImage}
                      alt={displayName}
                      className="h-64 w-48 object-cover rounded-xl border border-border shadow-lg"
                    />
                  ) : (
                    <div className="h-64 w-48 rounded-xl border border-border bg-muted flex items-center justify-center">
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-xs font-heading font-medium text-primary">Historical Figure</span>
                    </div>
                    {readTime && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-mono text-muted-foreground">{readTime} min read</span>
                      </div>
                    )}
                  </div>

                  <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
                    {displayName}
                  </h1>

                  {/* Structured biographical facts */}
                  {wikidataInfo && (
                    <div className="flex flex-wrap gap-4 mb-4">
                      {wikidataInfo.occupation && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Briefcase className="h-3.5 w-3.5" />
                          <span className="font-heading">{wikidataInfo.occupation}</span>
                        </div>
                      )}
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
                    </div>
                  )}

                  {wikidataInfo?.description && (
                    <p className="text-sm font-body text-muted-foreground italic mb-4">{wikidataInfo.description}</p>
                  )}

                  {relatedCivs.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {relatedCivs.map((c) => (
                        <Link key={c.id} to={`/civilizations/${c.slug}`}>
                          <Badge variant="secondary" className="font-heading text-xs cursor-pointer hover:bg-secondary/80">
                            {c.name}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* First paragraph as intro */}
                  {isLoading ? (
                    <div className="space-y-2 max-w-3xl">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                  ) : extractParagraphs.length > 0 ? (
                    <p className="font-body text-foreground/80 text-base leading-relaxed max-w-3xl">
                      {extractParagraphs[0]}
                    </p>
                  ) : (
                    <p className="font-body text-foreground/80 text-base">No information available for this figure.</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-5">
                    {wiki?.content_urls?.desktop?.page && (
                      <a href={wiki.content_urls.desktop.page} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="font-heading text-xs gap-1.5">
                          <ExternalLink className="h-3.5 w-3.5" /> Read on Wikipedia
                        </Button>
                      </a>
                    )}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border/60">
                      <Globe className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] font-heading text-muted-foreground">Wikipedia</span>
                    </div>
                    {wikidataInfo && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border/60">
                        <Database className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-heading text-muted-foreground">Wikidata</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Full Overview */}
        {extractParagraphs.length > 1 && (
          <section className="py-10 md:py-16">
            <div className="container">
              <ScrollReveal>
                <div className="max-w-3xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Full Overview</h2>
                  </div>
                  <div className="space-y-4">
                    {extractParagraphs.slice(1).map((p, i) => (
                      <p key={i} className="font-body text-foreground/80 text-base leading-relaxed">{p}</p>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* Life Timeline — events that mention this figure */}
        {figureTimeline.length > 0 && (
          <section className="py-10 md:py-16 bg-secondary/30">
            <div className="container">
              <ScrollReveal>
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Life & Legacy</h2>
                </div>
                <div className="relative max-w-2xl">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-6">
                    {figureTimeline.map((t, i) => (
                      <div key={i} className="relative pl-10">
                        <div className="absolute left-2.5 top-1.5 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                        <span className="font-mono text-xs text-primary font-semibold">{t.year}</span>
                        <p className="font-body text-sm text-foreground/80 mt-0.5">{t.event}</p>
                        <Link to={`/civilizations/${t.civSlug}`} className="text-[10px] font-heading text-muted-foreground hover:text-primary transition-colors">
                          {t.civName} <ChevronRight className="inline h-3 w-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* Historical Context — full civilization timeline */}
        {fullTimeline.length > 0 && (
          <section className="py-10 md:py-16">
            <div className="container">
              <ScrollReveal>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-accent/40 flex items-center justify-center">
                    <Scroll className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Historical Context</h2>
                    <p className="text-sm font-heading text-muted-foreground mt-0.5">
                      Key events during the era of {displayName}
                    </p>
                  </div>
                </div>
                <div className="relative max-w-2xl">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-4">
                    {fullTimeline.map((t, i) => (
                      <div key={i} className="relative pl-10">
                        <div className="absolute left-2.5 top-1.5 h-2.5 w-2.5 rounded-full bg-muted-foreground/30 border-2 border-background" />
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-[11px] text-muted-foreground font-semibold shrink-0">{t.year}</span>
                          <p className="font-body text-sm text-muted-foreground">{t.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* Gallery */}
        {images && images.length > 0 && (
          <section className="py-10 md:py-16 bg-secondary/30">
            <div className="container">
              <ScrollReveal>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((img, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl overflow-hidden border border-border bg-card group"
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={img.source}
                          alt={img.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-[10px] font-heading text-muted-foreground truncate">{img.title}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* Museum Artifacts */}
        <MuseumGallery query={displayName} title={`${displayName} — Museum Artifacts`} limit={4} />

        {/* Related Topics */}
        {relatedTopics.length > 0 && (
          <section className="py-10 md:py-16">
            <div className="container">
              <ScrollReveal>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-accent/50 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Related Topics</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {relatedTopics.map((t) => (
                    <Link key={t} to={`/topics/${t}`}>
                      <Badge variant="outline" className="font-heading text-sm py-1.5 px-3 hover:bg-muted cursor-pointer">
                        {t.replace(/_/g, " ")}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* Related Wikipedia Links */}
        {relatedLinks && relatedLinks.length > 0 && (
          <section className="py-10 md:py-16 bg-card border-t border-border/60">
            <div className="container">
              <ScrollReveal>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">See Also</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {relatedLinks.map((title) => (
                    <a
                      key={title}
                      href={`https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 bg-card hover:bg-accent text-sm font-heading text-foreground transition-colors"
                    >
                      {title}
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* Related Civs & Other Figures */}
        {relatedCivs.length > 0 && (
          <section className="py-10 md:py-16 bg-secondary/30">
            <div className="container">
              <ScrollReveal>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">Related Civilizations</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedCivs.map((civ) => (
                    <Link key={civ.id} to={`/civilizations/${civ.slug}`} className="block group">
                      <div className="rounded-xl border border-border bg-card hover:shadow-lg transition-all p-5">
                        <div className="h-1.5 rounded-full mb-4" style={{ backgroundColor: `hsl(var(--${civ.colorKey}))` }} />
                        <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">{civ.name}</h3>
                        <p className="text-sm font-mono text-muted-foreground">{civ.dateRange}</p>
                        <p className="text-sm font-heading text-muted-foreground mt-0.5">{civ.region}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-6">Other Key Figures</h2>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(relatedCivs.flatMap((c) => c.keyFigures)))
                    .filter((f) => f !== wikiTitle)
                    .map((f) => (
                      <Link key={f} to={`/figures/${f}`}>
                        <Badge variant="outline" className="font-heading text-sm py-1.5 px-3 hover:bg-muted cursor-pointer">
                          <User className="h-3.5 w-3.5 mr-1.5" />
                          {f.replace(/_/g, " ")}
                        </Badge>
                      </Link>
                    ))}
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
