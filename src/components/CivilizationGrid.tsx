import { useRef } from "react";
import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { motion, useInView } from "framer-motion";
import { civilizations } from "@/data/civilizations";
import { fetchWikipediaSummary } from "@/services/api";
import { CivilizationCard } from "@/components/CivilizationCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollReveal, StaggerContainer, staggerItem } from "@/components/ScrollReveal";

const eraFilters = ["All", "Ancient", "Medieval", "Modern"] as const;

export function CivilizationGrid() {
  const [activeEra, setActiveEra] = useState<string>("All");

  const wikiQueries = useQueries({
    queries: civilizations.map((civ) => ({
      queryKey: ["wiki", civ.wikipediaTitle],
      queryFn: () => fetchWikipediaSummary(civ.wikipediaTitle),
      staleTime: 1000 * 60 * 30,
      retry: 1,
    })),
  });

  const filtered = civilizations.filter((civ) => {
    if (activeEra !== "All" && civ.era !== activeEra) return false;
    return true;
  });

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              World Civilizations
            </h2>
            <p className="font-body text-muted-foreground max-w-xl mx-auto">
              Explore the cultures that shaped our world — from ancient river valleys to modern metropolises.
            </p>
          </div>
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-1.5 mb-10">
            {eraFilters.map((e) => (
              <Button
                key={e}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 text-xs font-heading rounded-full",
                  activeEra === e && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                onClick={() => setActiveEra(e)}
              >
                {e}
              </Button>
            ))}
          </div>
        </ScrollReveal>

        {/* Grid */}
        <StaggerContainer
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          staggerDelay={0.06}
        >
          {filtered.map((civ) => {
            const idx = civilizations.findIndex((c) => c.id === civ.id);
            const query = wikiQueries[idx];
            return (
              <motion.div key={civ.id} variants={staggerItem}>
                <CivilizationCard
                  civilization={civ}
                  wikiData={query?.data}
                  isLoading={query?.isLoading}
                />
              </motion.div>
            );
          })}
        </StaggerContainer>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground font-heading">
            No civilizations match your filters. Try adjusting your selection.
          </div>
        )}
      </div>
    </section>
  );
}
