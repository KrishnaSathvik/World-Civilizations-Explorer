"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchTodayInHistory } from "@/services/api";
import { Calendar, Baby, Skull } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal, StaggerContainer, staggerItem } from "@/components/ScrollReveal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Link } from "@/lib/router";

export function ThisWeekInHistory() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["todayInHistory"],
    queryFn: fetchTodayInHistory,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

  const EventCard = ({ year, text, type, wikiTitle }: { year: string; text: string; type: string; wikiTitle?: string }) => {
    const params = new URLSearchParams({ year, text, type });
    if (wikiTitle) params.set("wiki", wikiTitle);

    return (
      <Link to={`/history-event?${params.toString()}`}>
        <motion.div
          variants={staggerItem}
          className="p-4 rounded-lg border border-border/60 bg-card hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
        >
          <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono font-semibold mb-2">
            {year}
          </span>
          <p className="text-sm font-body text-foreground leading-relaxed line-clamp-3 group-hover:text-primary transition-colors">
            {text}
          </p>
          <span className="inline-block mt-2 text-xs font-heading text-muted-foreground group-hover:text-primary transition-colors">
            View details →
          </span>
        </motion.div>
      </Link>
    );
  };

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
    <section id="history" className="py-16 md:py-24 bg-secondary/30">
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
              {data && (
                <span className="text-xs font-heading text-muted-foreground mt-1">{data.date}</span>
              )}
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
                <EventCard key={i} year={event.year} text={event.text} type="event" wikiTitle={event.links[0]?.title} />
              ))}
            </StaggerContainer>
          </TabsContent>

          <TabsContent value="births">
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.08}>
              {isLoading ? <SkeletonCards /> : data?.births.map((e, i) => (
                <EventCard key={i} year={e.year} text={e.text} type="birth" wikiTitle={e.links[0]?.title} />
              ))}
            </StaggerContainer>
            {!isLoading && data?.births.length === 0 && (
              <p className="text-sm font-body text-muted-foreground">No birth data available.</p>
            )}
          </TabsContent>

          <TabsContent value="deaths">
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.08}>
              {isLoading ? <SkeletonCards /> : data?.deaths.map((e, i) => (
                <EventCard key={i} year={e.year} text={e.text} type="death" wikiTitle={e.links[0]?.title} />
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