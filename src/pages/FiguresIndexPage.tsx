import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { User, Search, Filter, X } from "lucide-react";
import { civilizations } from "@/data/civilizations";
import { fetchWikipediaSummary, WikiSummary } from "@/services/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface FigureEntry {
  wikiTitle: string;
  displayName: string;
  civilizations: Array<{ name: string; slug: string; era: string; colorKey: string }>;
}

const eras = ["Ancient", "Medieval", "Modern"] as const;

export default function FiguresIndexPage() {
  const [query, setQuery] = useState("");
  const [activeEra, setActiveEra] = useState<string | null>(null);
  const [activeCiv, setActiveCiv] = useState<string | null>(null);

  // Build deduplicated figure list
  const allFigures = useMemo<FigureEntry[]>(() => {
    const map = new Map<string, FigureEntry>();
    civilizations.forEach((civ) => {
      civ.keyFigures.forEach((f) => {
        if (!map.has(f)) {
          map.set(f, {
            wikiTitle: f,
            displayName: f.replace(/_/g, " "),
            civilizations: [],
          });
        }
        map.get(f)!.civilizations.push({
          name: civ.name,
          slug: civ.slug,
          era: civ.era,
          colorKey: civ.colorKey,
        });
      });
    });
    return Array.from(map.values()).sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    );
  }, []);

  // Fetch summaries for all figures
  const figureQueries = useQueries({
    queries: allFigures.map((f) => ({
      queryKey: ["wiki-summary", f.wikiTitle],
      queryFn: () => fetchWikipediaSummary(f.wikiTitle),
      staleTime: 1000 * 60 * 30,
    })),
  });

  // Filter
  const filtered = useMemo(() => {
    return allFigures.filter((f, i) => {
      const q = query.toLowerCase();
      if (q && !f.displayName.toLowerCase().includes(q)) return false;
      if (activeEra && !f.civilizations.some((c) => c.era === activeEra)) return false;
      if (activeCiv && !f.civilizations.some((c) => c.slug === activeCiv)) return false;
      return true;
    });
  }, [allFigures, query, activeEra, activeCiv]);

  const figureIndexMap = useMemo(() => {
    const m = new Map<string, number>();
    allFigures.forEach((f, i) => m.set(f.wikiTitle, i));
    return m;
  }, [allFigures]);

  // Unique civilizations for filter
  const civOptions = useMemo(() => {
    const seen = new Set<string>();
    return civilizations
      .filter((c) => {
        if (activeEra && c.era !== activeEra) return false;
        if (seen.has(c.slug)) return false;
        seen.add(c.slug);
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [activeEra]);

  const clearFilters = () => {
    setQuery("");
    setActiveEra(null);
    setActiveCiv(null);
  };

  const hasFilters = !!query || !!activeEra || !!activeCiv;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Header */}
        <section className="border-b border-border/60 bg-gradient-to-b from-primary/[0.03] to-background">
          <div className="container py-10 md:py-16">
            <ScrollReveal>
              <Breadcrumbs items={[{ label: "Historical Figures" }]} />
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground">
                    Historical Figures
                  </h1>
                </div>
              </div>
              <p className="font-body text-foreground/70 text-base md:text-lg max-w-2xl mt-2">
                Explore the leaders, thinkers, and rulers who shaped the world's greatest civilizations.
              </p>

              {/* Search */}
              <div className="relative mt-6 max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search figures..."
                  className="pl-10 font-heading"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <Filter className="h-4 w-4 text-muted-foreground" />
                {eras.map((era) => (
                  <button
                    key={era}
                    onClick={() => {
                      setActiveEra(activeEra === era ? null : era);
                      setActiveCiv(null);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-heading border transition-colors ${
                      activeEra === era
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    {era}
                  </button>
                ))}
                <span className="text-muted-foreground/40">|</span>
                {civOptions.slice(0, 8).map((civ) => (
                  <button
                    key={civ.slug}
                    onClick={() => setActiveCiv(activeCiv === civ.slug ? null : civ.slug)}
                    className={`px-3 py-1 rounded-full text-xs font-heading border transition-colors ${
                      activeCiv === civ.slug
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    {civ.name}
                  </button>
                ))}
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1 rounded-full text-xs font-heading border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors inline-flex items-center gap-1"
                  >
                    <X className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>

              <p className="text-sm font-heading text-muted-foreground mt-3">
                {filtered.length} figure{filtered.length !== 1 ? "s" : ""}
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Grid */}
        <section className="py-10 md:py-16">
          <div className="container">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((figure) => {
                const idx = figureIndexMap.get(figure.wikiTitle)!;
                const q = figureQueries[idx];
                const data = q?.data as WikiSummary | undefined;
                return (
                  <Link
                    key={figure.wikiTitle}
                    to={`/figures/${figure.wikiTitle}`}
                    className="group block rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-lg transition-all overflow-hidden"
                  >
                    {/* Portrait */}
                    <div className="h-40 bg-muted overflow-hidden">
                      {q?.isLoading ? (
                        <Skeleton className="w-full h-full" />
                      ) : data?.thumbnail?.source ? (
                        <img
                          src={data.thumbnail.source}
                          alt={figure.displayName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-secondary">
                          <User className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors mb-1.5">
                        {figure.displayName}
                      </h3>
                      {data?.extract && (
                        <p className="text-xs font-body text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                          {data.extract.slice(0, 120)}...
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {figure.civilizations.map((c) => (
                          <span
                            key={c.slug}
                            className="text-[10px] font-heading px-2 py-0.5 rounded-full border border-border bg-muted/50 text-muted-foreground"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <User className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="font-heading text-muted-foreground">No figures match your search.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
