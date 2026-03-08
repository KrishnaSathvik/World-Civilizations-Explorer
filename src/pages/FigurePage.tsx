import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { User, ArrowLeft, ExternalLink, MapPin, BookOpen } from "lucide-react";
import { civilizations } from "@/data/civilizations";
import { fetchWikipediaSummary } from "@/services/api";
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

  // Find which civilizations this figure belongs to
  const relatedCivs = civilizations.filter((c) =>
    c.keyFigures.includes(wikiTitle)
  );

  const displayName = wikiTitle.replace(/_/g, " ");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Header */}
        <section className="border-b border-border/60 bg-gradient-to-b from-primary/[0.03] to-background">
          <div className="container py-10 md:py-16">
            <ScrollReveal>
              <Link
                to={relatedCivs.length ? `/civilizations/${relatedCivs[0].slug}` : "/"}
                className="inline-flex items-center gap-1.5 text-sm font-heading text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {relatedCivs.length ? relatedCivs[0].name : "Back"}
              </Link>

              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Portrait */}
                <div className="shrink-0">
                  {isLoading ? (
                    <Skeleton className="h-48 w-40 rounded-xl" />
                  ) : wiki?.thumbnail ? (
                    <img
                      src={wiki.thumbnail.source}
                      alt={displayName}
                      className="h-48 w-40 object-cover rounded-xl border border-border shadow-lg"
                    />
                  ) : (
                    <div className="h-48 w-40 rounded-xl border border-border bg-muted flex items-center justify-center">
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-4">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-xs font-heading font-medium text-primary">Historical Figure</span>
                  </div>
                  <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
                    {displayName}
                  </h1>

                  {/* Related civilizations */}
                  {relatedCivs.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {relatedCivs.map((c) => (
                        <Link key={c.id} to={`/civilizations/${c.slug}`}>
                          <Badge
                            variant="secondary"
                            className="font-heading text-xs cursor-pointer hover:bg-secondary/80"
                          >
                            {c.name}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Summary */}
                  {isLoading ? (
                    <div className="space-y-2 max-w-3xl">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                      <Skeleton className="h-4 w-3/6" />
                    </div>
                  ) : (
                    <p className="font-body text-foreground/80 text-base leading-relaxed max-w-3xl">
                      {wiki?.extract || "No information available for this figure."}
                    </p>
                  )}

                  {/* Wikipedia link */}
                  {wiki?.content_urls?.desktop?.page && (
                    <a
                      href={wiki.content_urls.desktop.page}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block"
                    >
                      <Button variant="outline" size="sm" className="font-heading text-xs gap-1.5">
                        <ExternalLink className="h-3.5 w-3.5" /> Read on Wikipedia
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Related content */}
        {relatedCivs.length > 0 && (
          <section className="py-10 md:py-16">
            <div className="container">
              <ScrollReveal>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  Related Civilizations
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedCivs.map((civ) => (
                    <Link key={civ.id} to={`/civilizations/${civ.slug}`} className="block group">
                      <div className="rounded-xl border border-border bg-card hover:shadow-lg transition-all p-5">
                        <div className="h-1.5 rounded-full mb-4" style={{ backgroundColor: `hsl(var(--${civ.colorKey}))` }} />
                        <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {civ.name}
                        </h3>
                        <p className="text-sm font-heading text-muted-foreground">{civ.dateRange}</p>
                        <p className="text-sm font-heading text-muted-foreground mt-0.5">{civ.region}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollReveal>

              {/* Other figures from same civs */}
              <ScrollReveal delay={0.15}>
                <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-6">
                  Other Key Figures
                </h2>
                <div className="flex flex-wrap gap-2">
                  {Array.from(
                    new Set(relatedCivs.flatMap((c) => c.keyFigures))
                  )
                    .filter((f) => f !== wikiTitle)
                    .map((f) => (
                      <Link key={f} to={`/figures/${f}`}>
                        <Badge variant="outline" className="font-heading text-sm py-1.5 px-3 hover:bg-muted cursor-pointer">
                          <BookOpen className="h-3.5 w-3.5 mr-1.5" />
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
