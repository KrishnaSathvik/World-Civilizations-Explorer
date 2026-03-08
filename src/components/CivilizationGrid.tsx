import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { civilizations } from "@/data/civilizations";
import { fetchWikipediaSummary } from "@/services/api";
import { CivilizationCard } from "@/components/CivilizationCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const regionFilters = ["All", "Asia", "Europe", "Africa", "Americas", "Middle East"] as const;
const eraFilters = ["All", "Ancient", "Medieval", "Modern"] as const;

export function CivilizationGrid() {
  const [activeRegion, setActiveRegion] = useState<string>("All");
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
    if (activeRegion !== "All" && civ.regionGroup !== activeRegion) return false;
    if (activeEra !== "All" && civ.era !== activeEra) return false;
    return true;
  });

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            World Civilizations
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto">
            Explore the cultures that shaped our world — from ancient river valleys to modern metropolises.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <div className="flex flex-wrap justify-center gap-1.5">
            {regionFilters.map((r) => (
              <Button
                key={r}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 text-xs font-heading rounded-full",
                  activeRegion === r && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                onClick={() => setActiveRegion(r)}
              >
                {r}
              </Button>
            ))}
          </div>
          <div className="hidden sm:block w-px h-6 bg-border" />
          <div className="flex flex-wrap justify-center gap-1.5">
            {eraFilters.map((e) => (
              <Button
                key={e}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 text-xs font-heading rounded-full",
                  activeEra === e && "bg-gold text-gold-foreground hover:bg-gold/90"
                )}
                onClick={() => setActiveEra(e)}
              >
                {e}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filtered.map((civ) => {
            const idx = civilizations.findIndex((c) => c.id === civ.id);
            const query = wikiQueries[idx];
            return (
              <motion.div
                key={civ.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <CivilizationCard
                  civilization={civ}
                  wikiData={query?.data}
                  isLoading={query?.isLoading}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground font-heading">
            No civilizations match your filters. Try adjusting your selection.
          </div>
        )}
      </div>
    </section>
  );
}
