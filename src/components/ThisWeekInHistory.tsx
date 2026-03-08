import { useQuery } from "@tanstack/react-query";
import { fetchTodayInHistory } from "@/services/api";
import { Calendar, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal, StaggerContainer, staggerItem } from "@/components/ScrollReveal";
import { motion } from "framer-motion";

export function ThisWeekInHistory() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["todayInHistory"],
    queryFn: fetchTodayInHistory,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-cultural-red/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-cultural-red" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                This Day in History
              </h2>
              {data && (
                <p className="text-sm font-heading text-muted-foreground">{data.date}</p>
              )}
            </div>
          </div>
        </ScrollReveal>

        {error && (
          <p className="text-sm font-body text-muted-foreground">
            Unable to load historical events right now. Please try again later.
          </p>
        )}

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.08}>
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 rounded-lg border border-border/60 bg-card">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}

          {data?.events.map((event, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="p-4 rounded-lg border border-border/60 bg-card hover:border-cultural-red/30 hover:shadow-sm transition-all group"
            >
              <span className="inline-block px-2 py-0.5 rounded-full bg-cultural-red/10 text-cultural-red text-xs font-mono font-semibold mb-2">
                {event.year}
              </span>
              <p className="text-sm font-body text-foreground leading-relaxed line-clamp-3">
                {event.text}
              </p>
              {event.links.length > 0 && (
                <a
                  href={event.links[0].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs font-heading text-muted-foreground hover:text-primary transition-colors"
                >
                  Learn more <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
