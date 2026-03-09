import { useParams, Link } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, User, BookOpen, Image, ExternalLink, FileText, Database, Globe, Clock, ChevronRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { LOCGallery } from "@/components/LOCGallery";
import { SitePhotos } from "@/components/SitePhotos";
import { Badge } from "@/components/ui/badge";
import { SourceBadge } from "@/components/SourceBadge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal, StaggerContainer, staggerItem } from "@/components/ScrollReveal";
import { MuseumGallery } from "@/components/MuseumGallery";
import { Skeleton } from "@/components/ui/skeleton";
import { civilizations } from "@/data/civilizations";
import { fetchWikipediaSummary, fetchWikipediaImages } from "@/services/api";
import { searchCommonsImages } from "@/services/wikimedia-commons";
import { useAutoEmbed } from "@/hooks/useAutoEmbed";
import type { WikiSummary } from "@/services/api";

export default function CivilizationHub() {
  const { slug } = useParams<{ slug: string }>();
  const civ = civilizations.find((c) => c.slug === slug);

  // Main summary
  const mainQuery = useQuery({
    queryKey: ["wiki", civ?.wikipediaTitle],
    queryFn: () => fetchWikipediaSummary(civ!.wikipediaTitle),
    enabled: !!civ,
    staleTime: 1000 * 60 * 30,
  });

  // Key figures
  const figureQueries = useQueries({
    queries: (civ?.keyFigures || []).map((title) => ({
      queryKey: ["wiki", title],
      queryFn: () => fetchWikipediaSummary(title),
      staleTime: 1000 * 60 * 30,
      retry: 1,
    })),
  });

  // Topics
  const topicQueries = useQueries({
    queries: (civ?.topics || []).map((title) => ({
      queryKey: ["wiki", title],
      queryFn: () => fetchWikipediaSummary(title),
      staleTime: 1000 * 60 * 30,
      retry: 1,
    })),
  });

  // Gallery images from Wikimedia Commons
  const galleryQuery = useQuery({
    queryKey: ["commons-gallery", civ?.name],
    queryFn: () => searchCommonsImages(civ!.name, 12),
    enabled: !!civ,
    staleTime: 1000 * 60 * 60,
  });

  useAutoEmbed(mainQuery.data);

  // Dynamic AI-generated timeline
  const timelineQuery = useQuery({
    queryKey: ["dynamic-timeline", civ?.slug],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-timeline", {
        body: { slug: civ!.slug, name: civ!.name, dateRange: civ!.dateRange },
      });
      if (error) throw error;
      return data.events as { year: string; event: string }[];
    },
    enabled: !!civ,
    staleTime: 1000 * 60 * 60 * 24, // 24h — cached in DB anyway
    retry: 1,
  });

  // Use dynamic events if available, fallback to hardcoded
  const timelineEvents = timelineQuery.data && timelineQuery.data.length > 0
    ? timelineQuery.data
    : civ?.timeline || [];
  const isTimelineDynamic = !!timelineQuery.data && timelineQuery.data.length > 0;

  if (!civ) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Civilization Not Found</h1>
          <Link to="/" className="text-primary font-heading hover:underline">← Back to Explorer</Link>
        </div>
      </div>
    );
  }

  const mainData = mainQuery.data;
  const heroImage = mainData?.originalimage?.source || mainData?.thumbnail?.source;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <Breadcrumbs
          items={[
            { label: civ.era, href: `/era/${civ.era.toLowerCase()}` },
            { label: civ.name },
          ]}
          className="container pt-6 relative z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-background" />
        {heroImage && (
          <div className="absolute inset-0">
            <img src={heroImage} alt={civ.name} className="w-full h-full object-cover opacity-15" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          </div>
        )}
        <div className="container relative py-16 md:py-24">
          <ScrollReveal>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-heading text-muted-foreground hover:text-foreground mb-8 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Explorer
            </Link>

            <div className="flex items-start gap-4 mb-4">
              <div
                className="h-14 w-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `hsl(var(--${civ.colorKey}) / 0.15)` }}
              >
                <span className="font-display text-2xl font-bold" style={{ color: `hsl(var(--${civ.colorKey}))` }}>
                  {civ.name[0]}
                </span>
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">{civ.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-mono text-xs">
                    <Calendar className="h-4 w-4" /> {civ.dateRange}
                  </span>
                  <span className="flex items-center gap-1.5 font-heading">
                    <MapPin className="h-4 w-4" /> {civ.region}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-semibold font-heading"
                    style={{
                      backgroundColor: `hsl(var(--${civ.colorKey}) / 0.1)`,
                      color: `hsl(var(--${civ.colorKey}))`,
                    }}
                  >
                    {civ.era}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {mainData?.extract && (
                    <Badge variant="outline" className="font-heading text-[10px] gap-1">
                      <FileText className="h-3 w-3" />
                      {Math.max(1, Math.ceil(mainData.extract.split(/\s+/).length / 200))} min read
                    </Badge>
                  )}
                  <SourceBadge source="wikipedia" size="sm" />
                  <SourceBadge source="wikimedia-commons" size="sm" />
                  <Badge variant="secondary" className="font-heading text-[10px] gap-1">
                    {civ.timeline.length} events
                  </Badge>
                  <Badge variant="secondary" className="font-heading text-[10px] gap-1">
                    {civ.keyFigures.length} figures
                  </Badge>
                </div>
              </div>
            </div>

            {mainQuery.isLoading ? (
              <Skeleton className="h-20 w-full mt-6" />
            ) : (
              <p className="font-body text-lg text-muted-foreground leading-relaxed max-w-3xl mt-6">
                {mainData?.extract}
              </p>
            )}

            {mainData?.content_urls?.desktop?.page && (
              <a
                href={mainData.content_urls.desktop.page}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-sm font-heading text-primary hover:underline"
              >
                Read full article on Wikipedia <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </ScrollReveal>
        </div>
      </section>

      {/* === Static Timeline (from curated data) === */}
      <section className="py-16 md:py-20 bg-secondary/30">
        <div className="container">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-10">
              <div className="h-10 w-10 rounded-lg bg-accent/40 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Key Events Timeline</h2>
                <p className="text-sm font-heading text-muted-foreground mt-1">
                  {civ.timeline.length} pivotal moments spanning {civ.dateRange}
                </p>
              </div>
            </div>
          </ScrollReveal>

          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px" style={{ backgroundColor: `hsl(var(--${civ.colorKey}) / 0.3)` }} />
            <StaggerContainer className="space-y-6" staggerDelay={0.06}>
              {civ.timeline.map((t, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className="relative pl-12 md:pl-20"
                >
                  <div
                    className="absolute left-2.5 md:left-6.5 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background z-10"
                    style={{ backgroundColor: `hsl(var(--${civ.colorKey}))` }}
                  />
                  <div className="p-4 rounded-xl border border-border/60 bg-card hover:shadow-md transition-shadow">
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-bold mb-2"
                      style={{
                        backgroundColor: `hsl(var(--${civ.colorKey}) / 0.1)`,
                        color: `hsl(var(--${civ.colorKey}))`,
                      }}
                    >
                      {t.year}
                    </span>
                    <p className="font-body text-foreground leading-relaxed">{t.event}</p>
                  </div>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>


      {/* Key Figures */}
      <section className="py-16 md:py-20 bg-secondary/30">
        <div className="container">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-10">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Key Figures</h2>
                <p className="text-sm font-heading text-muted-foreground mt-1">
                  The people who shaped {civ.name}
                </p>
              </div>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4" staggerDelay={0.08}>
            {figureQueries.map((query, i) => {
              const data = query.data as WikiSummary | undefined;
              return (
                <motion.div key={civ.keyFigures[i]} variants={staggerItem}>
                  <Link
                    to={`/figures/${civ.keyFigures[i]}`}
                    className="group block p-4 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    <div className="h-20 w-20 mx-auto rounded-full overflow-hidden bg-muted mb-3">
                      {query.isLoading ? (
                        <Skeleton className="w-full h-full" />
                      ) : data?.thumbnail?.source ? (
                        <img src={data.thumbnail.source} alt={data.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-secondary">
                          <User className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-heading text-sm font-semibold text-foreground text-center group-hover:text-primary transition-colors">
                      {data?.title || civ.keyFigures[i].replace(/_/g, " ")}
                    </h3>
                    {data?.extract && (
                      <p className="text-xs font-body text-muted-foreground text-center mt-1 line-clamp-3">
                        {data.extract.slice(0, 120)}...
                      </p>
                    )}
                    <div className="flex items-center justify-center gap-1 mt-2 text-[10px] font-heading text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      View profile <ChevronRight className="h-3 w-3" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Topics & Culture */}
      <section className="py-16 md:py-20">
        <div className="container">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-10">
              <div className="h-10 w-10 rounded-lg bg-cultural-red/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-cultural-red" />
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Topics & Culture</h2>
                <p className="text-sm font-heading text-muted-foreground mt-1">
                  Art, science, religion, and cultural achievements
                </p>
              </div>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4" staggerDelay={0.1}>
            {topicQueries.map((query, i) => {
              const data = query.data as WikiSummary | undefined;
              return (
                <motion.div key={civ.topics[i]} variants={staggerItem}>
                  <Link
                    to={`/topics/${civ.topics[i]}`}
                    className="group flex gap-4 p-5 rounded-xl border border-border/60 bg-card hover:border-gold/30 hover:shadow-md transition-all"
                  >
                    <div className="h-28 w-28 rounded-lg overflow-hidden bg-muted shrink-0">
                      {query.isLoading ? (
                        <Skeleton className="w-full h-full" />
                      ) : data?.thumbnail?.source ? (
                        <img src={data.thumbnail.source} alt={data.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-secondary">
                          <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                        {data?.title || civ.topics[i].replace(/_/g, " ")}
                      </h3>
                      {data?.extract && (
                        <p className="text-sm font-body text-muted-foreground line-clamp-4 leading-relaxed">
                          {data.extract.slice(0, 250)}...
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 mt-2 text-xs font-heading text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Learn more <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 md:py-20 bg-secondary/30">
        <div className="container">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-10">
              <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <Image className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Gallery</h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <SourceBadge source="wikimedia-commons" size="sm" />
                </div>
              </div>
            </div>
          </ScrollReveal>

          {galleryQuery.isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : galleryQuery.data && galleryQuery.data.length > 0 ? (
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" staggerDelay={0.06}>
              {galleryQuery.data.map((img, i) => (
                <motion.a
                  key={i}
                  variants={staggerItem}
                  href={img.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square rounded-lg overflow-hidden bg-muted"
                >
                  <img
                    src={img.source}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="absolute bottom-2 left-2 right-2 text-[10px] font-heading text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity truncate">
                    {img.title}
                  </span>
                </motion.a>
              ))}
            </StaggerContainer>
          ) : (
            <p className="text-sm font-body text-muted-foreground text-center py-8">
              No gallery images available for this civilization.
            </p>
          )}
        </div>
      </section>

      {/* Museum Artifacts */}
      <MuseumGallery query={`${civ.name} art history`} title={`${civ.name} — Museum Artifacts`} limit={4} />

      {/* Primary Sources from Library of Congress */}
      <LOCGallery query={civ.name} title={`${civ.name} — Primary Sources`} />

      {/* Modern Site Photography from Unsplash */}
      <SitePhotos query={`${civ.name} historical site`} title={`${civ.name} — Modern Photography`} limit={6} />

      <Footer />
    </div>
  );
}
