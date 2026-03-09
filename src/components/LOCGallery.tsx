import { useQuery } from "@tanstack/react-query";
import { searchLOCPhotos, searchLOCMaps, type LOCItem } from "@/services/loc";
import { MapPin, Camera, ExternalLink, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal, StaggerContainer, staggerItem } from "@/components/ScrollReveal";
import { SourceBadge } from "@/components/SourceBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

interface LOCGalleryProps {
  query: string;
  title?: string;
}

function LOCItemCard({ item }: { item: LOCItem }) {
  // LOC image URLs: use the first one, try to get a decent size
  const imgSrc = item.image_url?.[0] || "";
  
  return (
    <motion.a
      variants={staggerItem}
      href={typeof item.url === "string" ? item.url : item.id}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative rounded-lg overflow-hidden bg-muted border border-border/60 hover:border-primary/30 hover:shadow-md transition-all"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={imgSrc}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <h4 className="font-heading text-xs font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h4>
        {item.date && (
          <p className="text-[10px] font-mono text-muted-foreground mt-1">{item.date}</p>
        )}
        <div className="flex items-center gap-1 mt-2">
          <SourceBadge source="loc" />
          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
        </div>
      </div>
    </motion.a>
  );
}

export function LOCGallery({ query, title }: LOCGalleryProps) {
  const photosQuery = useQuery({
    queryKey: ["loc-photos", query],
    queryFn: () => searchLOCPhotos(query, 8),
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

  const mapsQuery = useQuery({
    queryKey: ["loc-maps", query],
    queryFn: () => searchLOCMaps(query, 6),
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

  const hasPhotos = photosQuery.data && photosQuery.data.results.length > 0;
  const hasMaps = mapsQuery.data && mapsQuery.data.results.length > 0;
  const isLoading = photosQuery.isLoading && mapsQuery.isLoading;

  if (!isLoading && !hasPhotos && !hasMaps) return null;

  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {title || "Primary Sources"}
              </h2>
              <p className="text-xs font-heading text-muted-foreground">
                Historical photographs, maps & documents from the Library of Congress
              </p>
            </div>
          </div>
        </ScrollReveal>

        <Tabs defaultValue="photos" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="photos" className="gap-1.5 font-heading text-xs">
              <Camera className="h-3.5 w-3.5" /> Photos & Prints
            </TabsTrigger>
            <TabsTrigger value="maps" className="gap-1.5 font-heading text-xs">
              <MapPin className="h-3.5 w-3.5" /> Historical Maps
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos">
            {photosQuery.isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
                ))}
              </div>
            ) : hasPhotos ? (
              <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" staggerDelay={0.06}>
                {photosQuery.data!.results.map((item) => (
                  <LOCItemCard key={item.id} item={item} />
                ))}
              </StaggerContainer>
            ) : (
              <p className="text-sm font-body text-muted-foreground text-center py-8">
                No historical photos found for this topic.
              </p>
            )}
          </TabsContent>

          <TabsContent value="maps">
            {mapsQuery.isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
                ))}
              </div>
            ) : hasMaps ? (
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" staggerDelay={0.06}>
                {mapsQuery.data!.results.map((item) => (
                  <LOCItemCard key={item.id} item={item} />
                ))}
              </StaggerContainer>
            ) : (
              <p className="text-sm font-body text-muted-foreground text-center py-8">
                No historical maps found for this topic.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
