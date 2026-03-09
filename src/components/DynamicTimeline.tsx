import { useQuery } from "@tanstack/react-query";
import { fetchHistoricalEvents, type HistoricalEvent } from "@/services/apiNinjasService";
import { Clock, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal, StaggerContainer, staggerItem } from "@/components/ScrollReveal";
import { SourceBadge } from "@/components/SourceBadge";
import { motion } from "framer-motion";
import { useState } from "react";

interface DynamicTimelineProps {
  query: string;
  colorKey: string;
}

export function DynamicTimeline({ query, colorKey }: DynamicTimelineProps) {
  const [searchOverride, setSearchOverride] = useState("");
  const activeQuery = searchOverride || query;

  const { data, isLoading, error } = useQuery({
    queryKey: ["api-ninjas-events", activeQuery],
    queryFn: () => fetchHistoricalEvents(activeQuery, 12),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-accent/40 flex items-center justify-center">
              <Clock className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Timeline</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <SourceBadge source="api-ninjas" size="sm" />
              </div>
            </div>
          </div>
          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search events about "${query}"…`}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={searchOverride}
              onChange={(e) => setSearchOverride(e.target.value)}
            />
          </div>
        </ScrollReveal>

        {error && (
          <p className="text-sm font-body text-muted-foreground">
            Unable to load events right now.
          </p>
        )}

        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-start">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border" />
            <StaggerContainer className="space-y-8" staggerDelay={0.1}>
              {data.map((event, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className={`relative flex items-start gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"} pl-14 md:pl-0`}>
                    <span
                      className="inline-block px-2.5 py-1 rounded-full text-xs font-mono font-bold mb-2"
                      style={{
                        backgroundColor: `hsl(var(--${colorKey}) / 0.1)`,
                        color: `hsl(var(--${colorKey}))`,
                      }}
                    >
                      {event.year}
                    </span>
                    <p className="font-body text-foreground leading-relaxed">{event.event}</p>
                  </div>
                  <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-5 h-5 rounded-full border-2 border-card bg-accent flex items-center justify-center z-10">
                    <div className="w-2 h-2 rounded-full bg-card" />
                  </div>
                  <div className="hidden md:block flex-1" />
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        ) : (
          <p className="text-sm font-body text-muted-foreground text-center py-8">
            No events found for "{activeQuery}".
          </p>
        )}
      </div>
    </section>
  );
}
