"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useSearchParams } from "@/lib/router";
import { Search, User, BookOpen, MapPin, Clock, Layers, X, SlidersHorizontal } from "lucide-react";
import { civilizations } from "@/data/civilizations";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";

type ResultType = "civilization" | "figure" | "topic" | "event";

interface SearchResult {
  type: ResultType;
  title: string;
  subtitle: string;
  href: string;
  colorKey?: string;
}

function buildSearchIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  for (const civ of civilizations) {
    results.push({
      type: "civilization",
      title: civ.name,
      subtitle: `${civ.dateRange} · ${civ.region}`,
      href: `/civilizations/${civ.slug}`,
      colorKey: civ.colorKey,
    });

    for (const fig of civ.keyFigures) {
      results.push({
        type: "figure",
        title: fig.replace(/_/g, " "),
        subtitle: civ.name,
        href: `/figures/${fig}`,
        colorKey: civ.colorKey,
      });
    }

    for (const topic of civ.topics) {
      results.push({
        type: "topic",
        title: topic.replace(/_/g, " "),
        subtitle: civ.name,
        href: `/topics/${topic}`,
        colorKey: civ.colorKey,
      });
    }

    for (const evt of civ.timeline) {
      results.push({
        type: "event",
        title: evt.event,
        subtitle: `${evt.year} · ${civ.name}`,
        href: `/civilizations/${civ.slug}`,
        colorKey: civ.colorKey,
      });
    }
  }

  // Deduplicate by href + title
  const seen = new Set<string>();
  return results.filter((r) => {
    const key = `${r.href}|${r.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const typeIcons: Record<ResultType, typeof Search> = {
  civilization: MapPin,
  figure: User,
  topic: BookOpen,
  event: Clock,
};

const typeLabels: Record<ResultType, string> = {
  civilization: "Civilization",
  figure: "Key Figure",
  topic: "Topic",
  event: "Event",
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [activeTypes, setActiveTypes] = useState<Set<ResultType>>(new Set(["civilization", "figure", "topic", "event"]));
  const inputRef = useRef<HTMLInputElement>(null);

  const allResults = useMemo(() => buildSearchIndex(), []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return allResults.filter((r) => {
      if (!activeTypes.has(r.type)) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q)
      );
    });
  }, [query, activeTypes, allResults]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query) {
      setSearchParams({ q: query }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [query, setSearchParams]);

  const toggleType = (type: ResultType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const counts = useMemo(() => {
    const q = query.toLowerCase().trim();
    const c: Record<ResultType, number> = { civilization: 0, figure: 0, topic: 0, event: 0 };
    for (const r of allResults) {
      if (!q || r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q)) {
        c[r.type]++;
      }
    }
    return c;
  }, [query, allResults]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Header */}
        <section className="border-b border-border/60 bg-gradient-to-b from-primary/[0.03] to-background">
          <div className="container py-10 md:py-14">
            <Breadcrumbs items={[{ label: "Search" }]} />
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-4">
                <Search className="h-4 w-4 text-primary" />
                <span className="text-xs font-heading font-medium text-primary">Search</span>
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
                Search Everything
              </h1>

              {/* Search input */}
              <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search civilizations, figures, topics, events..."
                  className="pl-12 pr-10 h-14 text-base font-heading bg-card border-border/60 shadow-sm"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Filters + Results */}
        <section className="py-8">
          <div className="container">
            {/* Type filters */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground mr-1" />
              {(Object.keys(typeLabels) as ResultType[]).map((type) => {
                const Icon = typeIcons[type];
                return (
                  <Button
                    key={type}
                    variant={activeTypes.has(type) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleType(type)}
                    className="font-heading text-xs gap-1.5"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {typeLabels[type]}
                    <span className="ml-1 opacity-60">{counts[type]}</span>
                  </Button>
                );
              })}
            </div>

            {/* Count */}
            <p className="text-sm font-heading text-muted-foreground mb-4">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              {query && <> for "<span className="text-foreground font-medium">{query}</span>"</>}
            </p>

            {/* Results list */}
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="font-heading text-muted-foreground">No results found. Try a different search term.</p>
              </div>
            ) : (
              <div className="space-y-2 max-w-3xl">
                {filtered.slice(0, 50).map((result, i) => {
                  const Icon = typeIcons[result.type];
                  return (
                    <Link key={`${result.href}-${i}`} to={result.href} className="block group">
                      <div className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 hover:shadow-sm transition-all">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: result.colorKey
                              ? `hsl(var(--${result.colorKey}) / 0.12)`
                              : "hsl(var(--muted))",
                          }}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={{
                              color: result.colorKey
                                ? `hsl(var(--${result.colorKey}))`
                                : "hsl(var(--muted-foreground))",
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-heading text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {result.title}
                          </p>
                          <p className="text-xs font-heading text-muted-foreground truncate">{result.subtitle}</p>
                        </div>
                        <Badge variant="outline" className="font-heading text-[10px] shrink-0">
                          {typeLabels[result.type]}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
                {filtered.length > 50 && (
                  <p className="text-center text-sm font-heading text-muted-foreground py-4">
                    Showing 50 of {filtered.length} results. Refine your search to see more.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}