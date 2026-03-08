import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GitCompareArrows, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { civilizations, type Civilization } from "@/data/civilizations";
import { fetchWikipediaSummary } from "@/services/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

function ComparisonColumn({ civ }: { civ: Civilization }) {
  const { data: wiki, isLoading } = useQuery({
    queryKey: ["wiki-summary", civ.wikipediaTitle],
    queryFn: () => fetchWikipediaSummary(civ.wikipediaTitle),
    staleTime: 1000 * 60 * 30,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div
          className="inline-flex h-14 w-14 rounded-xl items-center justify-center mb-3"
          style={{ backgroundColor: `hsl(var(--${civ.colorKey}) / 0.15)` }}
        >
          <span className="font-display text-xl font-bold" style={{ color: `hsl(var(--${civ.colorKey}))` }}>
            {civ.name.charAt(0)}
          </span>
        </div>
        <h3 className="font-display text-xl font-bold text-foreground">{civ.name}</h3>
        <p className="text-sm font-heading text-muted-foreground">{civ.dateRange}</p>
        <div className="flex gap-2 justify-center mt-2">
          <Badge variant="secondary" className="font-heading text-[10px]">{civ.region}</Badge>
          <Badge variant="outline" className="font-heading text-[10px]">{civ.era}</Badge>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h4 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-2">Overview</h4>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        ) : (
          <p className="text-sm font-body text-foreground/80 line-clamp-6">
            {wiki?.extract || "No summary available."}
          </p>
        )}
      </div>

      {/* Timeline */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h4 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-3">Key Events</h4>
        <div className="space-y-2">
          {civ.timeline.map((t, i) => (
            <div key={i} className="flex gap-2 text-xs">
              <span className="font-heading font-bold text-primary shrink-0 w-20">{t.year}</span>
              <span className="font-body text-muted-foreground">{t.event}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Figures */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h4 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-3">Key Figures</h4>
        <div className="flex flex-wrap gap-1.5">
          {civ.keyFigures.map((f) => (
            <Link key={f} to={`/figures/${f}`}>
              <Badge variant="outline" className="font-heading text-[10px] hover:bg-muted cursor-pointer">
                {f.replace(/_/g, " ")}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Topics */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h4 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-3">Topics & Culture</h4>
        <div className="flex flex-wrap gap-1.5">
          {civ.topics.map((t) => (
            <Link key={t} to={`/topics/${t}`}>
              <Badge variant="secondary" className="font-heading text-[10px] hover:bg-secondary/80 cursor-pointer">
                {t.replace(/_/g, " ")}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Link to={`/civilizations/${civ.slug}`} className="block">
        <Button variant="outline" className="w-full font-heading text-sm gap-2">
          Explore Full Hub <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

export default function ComparePage() {
  const [leftSlug, setLeftSlug] = useState(civilizations[0].slug);
  const [rightSlug, setRightSlug] = useState(civilizations[1].slug);

  const leftCiv = civilizations.find((c) => c.slug === leftSlug) || civilizations[0];
  const rightCiv = civilizations.find((c) => c.slug === rightSlug) || civilizations[1];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Header */}
        <section className="border-b border-border/60 bg-gradient-to-b from-primary/[0.03] to-background">
          <div className="container py-10 md:py-16">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-4">
                <GitCompareArrows className="h-4 w-4 text-primary" />
                <span className="text-xs font-heading font-medium text-primary">Comparison</span>
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
                Compare Civilizations
              </h1>
              <p className="font-body text-muted-foreground max-w-2xl text-lg">
                Place two civilizations side by side to explore their timelines, key figures, and cultural achievements.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Selectors */}
        <section className="border-b border-border/60 bg-card/50">
          <div className="container py-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Select value={leftSlug} onValueChange={setLeftSlug}>
                <SelectTrigger className="w-64 font-heading">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {civilizations.map((c) => (
                    <SelectItem key={c.slug} value={c.slug} className="font-heading">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <GitCompareArrows className="h-5 w-5 text-primary" />
              </div>

              <Select value={rightSlug} onValueChange={setRightSlug}>
                <SelectTrigger className="w-64 font-heading">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {civilizations.map((c) => (
                    <SelectItem key={c.slug} value={c.slug} className="font-heading">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Comparison grid */}
        <section className="py-10">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <ComparisonColumn civ={leftCiv} />
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border/60" style={{ position: "relative", width: 0 }} />
              <ComparisonColumn civ={rightCiv} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
