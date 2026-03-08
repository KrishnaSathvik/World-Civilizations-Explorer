import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { User, ExternalLink, MapPin, BookOpen, Clock, Globe, Calendar, ChevronRight } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { civilizations } from "@/data/civilizations";
import { fetchWikipediaSummary, fetchWikipediaImages } from "@/services/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
    queryKey: ["wiki-images", wikiTitle],
    queryFn: () => fetchWikipediaImages(wikiTitle),
    staleTime: 1000 * 60 * 30,
    enabled: !!wikiTitle,
  });

  const relatedCivs = civilizations.filter((c) =>
    c.keyFigures.includes(wikiTitle)
  );

  const relatedTopics = Array.from(
    new Set(relatedCivs.flatMap((c) => c.topics))
  ).slice(0, 8);

  // Timeline events that mention this figure
  const relatedTimeline = relatedCivs.flatMap((c) =>
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

  // Split extract into paragraphs for structured display
  const extractParagraphs = wiki?.extract
    ? wiki.extract.split(/(?<=[.!?])\s+(?=[A-Z])/).reduce<string[]>((acc, sentence, i) => {
        const pIdx = Math.floor(i / 3);
        if (!acc[pIdx]) acc[pIdx] = "";
        acc[pIdx] += (acc[pIdx] ? " " : "") + sentence;
        return acc;
      }, [])
    : [];

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
                    <Skeleton className="h-56 w-44 rounded-xl" />
                  ) : wiki?.thumbnail ? (
                    <img
                      src={wiki.thumbnail.source}
                      alt={displayName}
                      className="h-56 w-44 object-cover rounded-xl border border-border shadow-lg"
                    />
                  ) : (
                    <div className="h-56 w-44 rounded-xl border border-border bg-muted flex items-center justify-center">
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
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
                      <span className="text-[10px] font-heading text-muted-foreground">Source: Wikipedia</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Full content section */}
        {extractParagraphs.length > 1 && (
          <section className="py-10 md:py-16">
            <div className="container">
              <ScrollReveal>
                <div className="max-w-3xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Overview</h2>
                  </div>
                  <div className="space-y-4">
                    {extractParagraphs.slice(1).map((p, i) => (
                      <p key={i} className="font-body text-foreground/80 text-base leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* Life Timeline */}
        {relatedTimeline.length > 0 && (
          <section className="py-10 md:py-16 bg-secondary/30">
            <div className="container">
              <ScrollReveal>
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Timeline</h2>
                </div>
                <div className="relative max-w-2xl">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-6">
                    {relatedTimeline.map((t, i) => (
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

        {/* Gallery */}
        {images && images.length > 0 && (
          <section className="py-10 md:py-16 bg-gradient-to-b from-background to-primary/[0.02]">
            <div className="container">
              <ScrollReveal>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((img, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-border bg-card group">
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
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

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
