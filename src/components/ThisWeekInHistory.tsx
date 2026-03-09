import { useQuery } from "@tanstack/react-query";
import { fetchTodayInHistory } from "@/services/api";
import { Calendar, ExternalLink, Baby, Skull } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal, StaggerContainer, staggerItem } from "@/components/ScrollReveal";
import { SourceBadge } from "@/components/SourceBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export function ThisWeekInHistory() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["todayInHistory"],
    queryFn: fetchTodayInHistory,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

  const EventCard = ({ year, text, link }: { year: string; text: string; link?: string }) => (
    <motion.div
      variants={staggerItem}
      className="p-4 rounded-lg border border-border/60 bg-card hover:border-primary/30 hover:shadow-sm transition-all"
    >
      <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono font-semibold mb-2">
        {year}
      </span>
      <p className="text-sm font-body text-foreground leading-relaxed line-clamp-3">{text}</p>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2 text-xs font-heading text-muted-foreground hover:text-primary transition-colors"
        >
          Learn more <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </motion.div>
  );

  const SkeletonCards = () => (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-4 rounded-lg border border-border/60 bg-card">
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </>
  );

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                This Day in History
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <SourceBadge source="muffinlabs" size="sm" />
                {data && (
                  <span className="text-xs font-heading text-muted-foreground ml-1">{data.date}</span>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="events" className="gap-1.5 font-heading text-xs">
              <Calendar className="h-3.5 w-3.5" /> Events
            </TabsTrigger>
            <TabsTrigger value="births" className="gap-1.5 font-heading text-xs">
              <Baby className="h-3.5 w-3.5" /> Births
            </TabsTrigger>
            <TabsTrigger value="deaths" className="gap-1.5 font-heading text-xs">
              <Skull className="h-3.5 w-3.5" /> Deaths
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            {error && <p className="text-sm font-body text-muted-foreground">Unable to load events right now.</p>}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.08}>
              {isLoading ? <SkeletonCards /> : data?.events.map((event, i) => (
                <EventCard key={i} year={event.year} text={event.text} link={event.links[0]?.link} />
              ))}
            </StaggerContainer>
          </TabsContent>

          <TabsContent value="births">
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.08}>
              {isLoading ? <SkeletonCards /> : data?.births.map((e, i) => (
                <EventCard key={i} year={e.year} text={e.text} link={e.links[0]?.link} />
              ))}
            </StaggerContainer>
            {!isLoading && data?.births.length === 0 && (
              <p className="text-sm font-body text-muted-foreground">No birth data available.</p>
            )}
          </TabsContent>

          <TabsContent value="deaths">
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.08}>
              {isLoading ? <SkeletonCards /> : data?.deaths.map((e, i) => (
                <EventCard key={i} year={e.year} text={e.text} link={e.links[0]?.link} />
              ))}
            </StaggerContainer>
            {!isLoading && data?.deaths.length === 0 && (
              <p className="text-sm font-body text-muted-foreground">No death data available.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
