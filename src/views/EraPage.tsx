"use client";
import { useMemo } from "react";
import { useParams, Link } from "@/lib/router";
import { useQueries } from "@tanstack/react-query";
import { Layers, Calendar, ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { civilizations } from "@/data/civilizations";
import { fetchWikipediaSummary } from "@/services/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal, StaggerContainer, staggerItem } from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const eraInfo: Record<string, { title: string; description: string; range: string }> = {
  ancient: {
    title: "Ancient Era",
    description: "From the earliest river valley civilizations to the fall of empires. This era saw the birth of writing, law, philosophy, and monumental architecture that still defines human culture.",
    range: "3500 BCE – 500 CE",
  },
  medieval: {
    title: "Medieval Era",
    description: "An age of feudalism, religious expansion, and cultural exchange along trade routes. Great empires rose in every continent, producing art, science, and governance systems that shaped the modern world.",
    range: "500 CE – 1500 CE",
  },
  modern: {
    title: "Modern Era",
    description: "The age of exploration, revolution, industrialization, and global interconnection. Scientific breakthroughs and political upheavals remade every society on Earth.",
    range: "1500 CE – Present",
  },
};

export default function EraPage() {
  const { slug } = useParams<{ slug: string }>();
  const era = eraInfo[slug || ""];

  const eraCivs = useMemo(
    () => civilizations.filter((c) => c.era.toLowerCase() === slug),
    [slug]
  );

  const summaryQueries = useQueries({
    queries: eraCivs.map((civ) => ({
      queryKey: ["wiki-summary", civ.wikipediaTitle],
      queryFn: () => fetchWikipediaSummary(civ.wikipediaTitle),
      staleTime: 1000 * 60 * 30,
    })),
  });

  if (!era) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Era Not Found</h1>
          <Link to="/">
            <Button variant="outline" className="font-heading">Back to Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Header */}
        <section className="border-b border-border/60 bg-gradient-to-b from-primary/[0.03] to-background">
          <div className="container py-10 md:py-16">
            <ScrollReveal>
              <Breadcrumbs items={[{ label: era.title }]} />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-4 ml-4">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-xs font-heading font-medium text-primary">Era Overview</span>
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
                {era.title}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="font-heading text-xs gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> {era.range}
                </Badge>
                <Badge variant="outline" className="font-heading text-xs">
                  {eraCivs.length} Civilization{eraCivs.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <p className="font-body text-muted-foreground max-w-3xl text-lg">
                {era.description}
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Civilization cards */}
        <section className="py-10 md:py-16">
          <div className="container">
            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {eraCivs.map((civ, i) => {
                const summary = summaryQueries[i];
                return (
                  <motion.div key={civ.id} variants={staggerItem}>
                    <Link to={`/civilizations/${civ.slug}`} className="block group">
                      <div className="rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                        {/* Color bar */}
                        <div className="h-1.5" style={{ backgroundColor: `hsl(var(--${civ.colorKey}))` }} />

                        {/* Thumbnail */}
                        {summary?.data?.thumbnail && (
                          <div className="h-40 overflow-hidden">
                            <img
                              src={summary.data.thumbnail.source}
                              alt={civ.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}

                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="font-heading text-[10px]">{civ.regionGroup}</Badge>
                            <span className="text-xs font-heading text-muted-foreground">{civ.dateRange}</span>
                          </div>
                          <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {civ.name}
                          </h3>
                          {summary?.isLoading ? (
                            <div className="space-y-1.5">
                              <Skeleton className="h-3 w-full" />
                              <Skeleton className="h-3 w-4/5" />
                            </div>
                          ) : (
                            <p className="text-sm font-body text-muted-foreground line-clamp-3">
                              {summary?.data?.extract || "Loading..."}
                            </p>
                          )}

                          {/* Key figures preview */}
                          <div className="mt-4 flex flex-wrap gap-1">
                            {civ.keyFigures.slice(0, 3).map((f) => (
                              <Badge key={f} variant="secondary" className="font-heading text-[10px]">
                                {f.replace(/_/g, " ")}
                              </Badge>
                            ))}
                            {civ.keyFigures.length > 3 && (
                              <Badge variant="secondary" className="font-heading text-[10px]">
                                +{civ.keyFigures.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </StaggerContainer>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}