import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Landmark, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SourceBadge, MUSEUM_SOURCES, getSourceLabel, type MuseumSource } from "@/components/SourceBadge";
import { StaggerContainer, staggerItem } from "@/components/ScrollReveal";
import { searchMetMuseum, type MetArtwork } from "@/services/met-museum";
import { searchAICCollection, type AICArtwork } from "@/services/art-institute-chicago";
import { searchMuseums, type MuseumArtwork } from "@/services/museum-apis";

interface UnifiedArtwork {
  id: string;
  title: string;
  artist: string;
  date: string;
  imageUrl: string;
  url: string;
  source: string;
  medium?: string;
  culture?: string;
}

function normalize(items: any[], source: string, mapper: (a: any) => UnifiedArtwork): UnifiedArtwork[] {
  return (items || []).map(mapper);
}

export default function MuseumSearchPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [activeSources, setActiveSources] = useState<Set<MuseumSource>>(new Set(MUSEUM_SOURCES));

  const enabled = !!submitted;

  const { data: metData, isLoading: metLoading } = useQuery({
    queryKey: ["museum-search-met", submitted],
    queryFn: () => searchMetMuseum(submitted, 8),
    staleTime: 1000 * 60 * 30,
    enabled,
  });

  const { data: aicData, isLoading: aicLoading } = useQuery({
    queryKey: ["museum-search-aic", submitted],
    queryFn: () => searchAICCollection(submitted, 8),
    staleTime: 1000 * 60 * 30,
    enabled,
  });

  const { data: proxyData, isLoading: proxyLoading } = useQuery({
    queryKey: ["museum-search-proxy", submitted],
    queryFn: () => searchMuseums(submitted, 8),
    staleTime: 1000 * 60 * 30,
    enabled,
  });

  const isLoading = metLoading || aicLoading || proxyLoading;

  const allArtworks: UnifiedArtwork[] = [
    ...normalize(metData || [], "met", (a: MetArtwork) => ({
      id: `met-${a.objectID}`, title: a.title, artist: a.artistDisplayName,
      date: a.objectDate, imageUrl: a.primaryImageSmall || a.primaryImage,
      url: a.objectURL, source: "met", medium: a.medium, culture: a.culture,
    })),
    ...normalize(aicData || [], "aic", (a: AICArtwork) => ({
      id: `aic-${a.id}`, title: a.title, artist: a.artist_display,
      date: a.date_display, imageUrl: a.thumbUrl || a.imageUrl,
      url: `https://www.artic.edu/artworks/${a.id}`, source: "aic",
      medium: a.medium_display, culture: a.place_of_origin,
    })),
    ...normalize(proxyData || [], "", (a: MuseumArtwork) => ({
      id: `${a.source}-${a.id}`, title: a.title, artist: a.artist,
      date: a.date, imageUrl: a.thumbUrl || a.imageUrl,
      url: a.url, source: a.source, medium: a.medium, culture: a.culture,
    })),
  ];

  const seen = new Set<string>();
  const filtered = allArtworks.filter((a) => {
    if (!activeSources.has(a.source as MuseumSource)) return false;
    const key = a.title.toLowerCase().slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const toggleSource = (s: MuseumSource) => {
    setActiveSources((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) setSubmitted(query.trim());
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
          <div className="container max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5">
              <Landmark className="h-4 w-4 text-primary" />
              <span className="text-sm font-heading font-medium text-primary">5 Museum Collections</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Museum Search
            </h1>
            <p className="text-muted-foreground font-body text-lg">
              Search across The Met, Art Institute of Chicago, Smithsonian, Harvard Art Museums & Rijksmuseum simultaneously.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search artifacts, artworks, sculptures..."
                  className="pl-10 h-12 font-heading bg-card border-border"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6 font-heading">Search</Button>
            </form>
          </div>
        </section>

        {/* Filters + Results */}
        {submitted && (
          <section className="container py-8 space-y-6">
            {/* Source filters */}
            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-heading text-muted-foreground mr-1">Sources:</span>
              {ALL_SOURCES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSource(s)}
                  className={`text-xs font-heading px-3 py-1.5 rounded-full border transition-all ${
                    activeSources.has(s)
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-muted/50 text-muted-foreground border-border/50 opacity-50"
                  }`}
                >
                  {getSourceLabel(s)}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground font-heading">No results found for "{submitted}"</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground font-heading">
                  {filtered.length} results for "<span className="text-foreground">{submitted}</span>"
                </p>
                <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" staggerDelay={0.04}>
                  {filtered.map((artwork) => (
                    <motion.a
                      key={artwork.id}
                      variants={staggerItem}
                      href={artwork.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-xl overflow-hidden border border-border/60 bg-card hover:border-primary/30 hover:shadow-md transition-all"
                    >
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img
                          src={artwork.imageUrl}
                          alt={artwork.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>
                      <div className="p-3 space-y-1">
                        <h3 className="text-xs font-heading font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {artwork.title}
                        </h3>
                        {artwork.artist && (
                          <p className="text-[10px] font-body text-muted-foreground truncate">{artwork.artist}</p>
                        )}
                        <div className="flex items-center justify-between gap-1">
                          {artwork.date && <span className="text-[10px] font-mono text-muted-foreground">{artwork.date}</span>}
                          <SourceBadge source={artwork.source} />
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </StaggerContainer>
              </>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
