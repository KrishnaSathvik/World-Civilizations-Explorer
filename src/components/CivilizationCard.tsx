import { motion } from "framer-motion";
import { MapPin, Calendar, ExternalLink } from "lucide-react";
import type { Civilization } from "@/data/civilizations";
import type { WikiSummary } from "@/services/api";

interface Props {
  civilization: Civilization;
  wikiData?: WikiSummary;
  isLoading?: boolean;
}

export function CivilizationCard({ civilization, wikiData, isLoading }: Props) {
  const imageUrl = wikiData?.thumbnail?.source;
  const extract = wikiData?.extract;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-gold/40 transition-all duration-300"
    >
      {/* Color accent top bar */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: `hsl(var(--${civilization.colorKey}))` }}
      />

      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-muted">
        {isLoading ? (
          <div className="w-full h-full animate-pulse bg-muted" />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={civilization.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-secondary">
            <span className="font-display text-3xl text-muted-foreground/30">{civilization.name[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
          {civilization.name}
        </h3>

        <div className="flex items-center gap-3 mb-3 text-xs font-heading text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {civilization.dateRange}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {civilization.region}
          </span>
        </div>

        <p className="text-sm font-body text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
          {isLoading
            ? "Loading from Wikipedia..."
            : extract
              ? extract.slice(0, 150) + "..."
              : "Explore this civilization's rich cultural heritage and history."
          }
        </p>

        <div className="flex items-center justify-between">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-heading font-medium border"
            style={{
              borderColor: `hsl(var(--${civilization.colorKey}) / 0.3)`,
              color: `hsl(var(--${civilization.colorKey}))`,
              backgroundColor: `hsl(var(--${civilization.colorKey}) / 0.08)`,
            }}
          >
            {civilization.era}
          </span>

          {wikiData && (
            <a
              href={wikiData.content_urls?.desktop?.page}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-heading text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              Wikipedia <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
