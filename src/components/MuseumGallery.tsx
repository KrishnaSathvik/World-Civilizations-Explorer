import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ExternalLink, Landmark } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal, StaggerContainer, staggerItem } from "@/components/ScrollReveal";
import { SourceBadge, getSourceLabel } from "@/components/SourceBadge";
import { searchMetMuseum, MetArtwork } from "@/services/met-museum";
import { searchAICCollection, AICArtwork } from "@/services/art-institute-chicago";
import { searchMuseums, MuseumArtwork } from "@/services/museum-apis";

interface MuseumGalleryProps {
  query: string;
  title?: string;
  limit?: number;
}

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

const SOURCE_LABELS: Record<string, string> = {
  met: "The Met",
  aic: "Art Institute of Chicago",
  smithsonian: "Smithsonian",
  harvard: "Harvard Art Museums",
  rijksmuseum: "Rijksmuseum",
};

const SOURCE_COLORS: Record<string, string> = {
  met: "bg-red-500/10 text-red-700 dark:text-red-400",
  aic: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  smithsonian: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  harvard: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  rijksmuseum: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

function normalizeMetArtwork(a: MetArtwork): UnifiedArtwork {
  return {
    id: `met-${a.objectID}`,
    title: a.title,
    artist: a.artistDisplayName,
    date: a.objectDate,
    imageUrl: a.primaryImageSmall || a.primaryImage,
    url: a.objectURL,
    source: "met",
    medium: a.medium,
    culture: a.culture,
  };
}

function normalizeAICArtwork(a: AICArtwork): UnifiedArtwork {
  return {
    id: `aic-${a.id}`,
    title: a.title,
    artist: a.artist_display,
    date: a.date_display,
    imageUrl: a.thumbUrl || a.imageUrl,
    url: `https://www.artic.edu/artworks/${a.id}`,
    source: "aic",
    medium: a.medium_display,
    culture: a.place_of_origin,
  };
}

function normalizeMuseumArtwork(a: MuseumArtwork): UnifiedArtwork {
  return {
    id: `${a.source}-${a.id}`,
    title: a.title,
    artist: a.artist,
    date: a.date,
    imageUrl: a.thumbUrl || a.imageUrl,
    url: a.url,
    source: a.source,
    medium: a.medium,
    culture: a.culture,
  };
}

export function MuseumGallery({ query, title = "Museum Artifacts", limit = 4 }: MuseumGalleryProps) {
  const { data: metData, isLoading: metLoading } = useQuery({
    queryKey: ["met-museum", query],
    queryFn: () => searchMetMuseum(query, limit),
    staleTime: 1000 * 60 * 30,
    enabled: !!query,
  });

  const { data: aicData, isLoading: aicLoading } = useQuery({
    queryKey: ["aic-museum", query],
    queryFn: () => searchAICCollection(query, limit),
    staleTime: 1000 * 60 * 30,
    enabled: !!query,
  });

  const { data: proxyData, isLoading: proxyLoading } = useQuery({
    queryKey: ["museum-proxy", query],
    queryFn: () => searchMuseums(query, limit),
    staleTime: 1000 * 60 * 30,
    enabled: !!query,
  });

  const isLoading = metLoading || aicLoading || proxyLoading;

  const allArtworks: UnifiedArtwork[] = [
    ...(metData || []).map(normalizeMetArtwork),
    ...(aicData || []).map(normalizeAICArtwork),
    ...(proxyData || []).map(normalizeMuseumArtwork),
  ];

  // Deduplicate by title similarity and shuffle sources
  const seen = new Set<string>();
  const unique = allArtworks.filter((a) => {
    const key = a.title.toLowerCase().slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (!isLoading && unique.length === 0) return null;

  return (
    <section className="py-10 md:py-16 bg-secondary/30">
      <div className="container">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Landmark className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
              <p className="text-xs font-heading text-muted-foreground mt-0.5">
                From {Object.keys(SOURCE_LABELS).filter((s) => unique.some((a) => a.source === s)).map((s) => SOURCE_LABELS[s]).join(", ")}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" staggerDelay={0.06}>
            {unique.slice(0, 16).map((artwork) => (
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
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
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
                    {artwork.date && (
                      <span className="text-[10px] font-mono text-muted-foreground">{artwork.date}</span>
                    )}
                    <Badge
                      variant="secondary"
                      className={`text-[9px] px-1.5 py-0 font-heading ${SOURCE_COLORS[artwork.source] || ""}`}
                    >
                      {SOURCE_LABELS[artwork.source] || artwork.source}
                    </Badge>
                  </div>
                </div>
              </motion.a>
            ))}
          </StaggerContainer>
        )}
      </div>
    </section>
  );
}
