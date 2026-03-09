import { useQuery } from "@tanstack/react-query";
import { searchUnsplashPhotos, type UnsplashPhoto } from "@/services/unsplash";
import { Camera, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal, StaggerContainer, staggerItem } from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface SitePhotosProps {
  query: string;
  title?: string;
  limit?: number;
}

export function SitePhotos({ query, title, limit = 6 }: SitePhotosProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["unsplash", query],
    queryFn: () => searchUnsplashPhotos(query, limit),
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

  if (error || (!isLoading && (!data || data.length === 0))) return null;

  return (
    <section className="py-16 md:py-20 bg-secondary/30">
      <div className="container">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-accent/40 flex items-center justify-center">
              <Camera className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {title || "Modern Photography"}
              </h2>
              <p className="text-xs font-heading text-muted-foreground">
                Contemporary photos via Unsplash
              </p>
            </div>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: limit }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/2] rounded-xl" />
            ))}
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.08}>
            {data!.map((photo) => (
              <motion.a
                key={photo.id}
                variants={staggerItem}
                href={photo.links.html}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-xl overflow-hidden bg-muted"
              >
                <div className="aspect-[3/2] overflow-hidden">
                  <img
                    src={photo.urls.regular}
                    alt={photo.description}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    style={{ backgroundColor: photo.color }}
                  />
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-xs font-body text-foreground line-clamp-2 mb-1">
                    {photo.description || "Untitled"}
                  </p>
                  <div className="flex items-center justify-between">
                    <a
                      href={photo.user.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-heading text-muted-foreground hover:text-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      📷 {photo.user.name}
                    </a>
                    <Badge variant="outline" className="text-[8px] font-heading gap-0.5 bg-card/80">
                      Unsplash
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
