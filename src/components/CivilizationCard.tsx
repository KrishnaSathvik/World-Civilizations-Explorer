import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import type { Civilization } from "@/data/civilizations";
import type { WikiSummary } from "@/services/api";

interface Props {
  civilization: Civilization;
  wikiData?: WikiSummary;
  isLoading?: boolean;
}

export function CivilizationCard({ civilization, wikiData, isLoading }: Props) {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = !hasImageError ? wikiData?.thumbnail?.source || civilization.imageUrl : undefined;
  const extract = wikiData?.extract;

  return (
    <Link to={`/civilizations/${civilization.slug}`}>
      <motion.div
        whileHover={{ y: -6, boxShadow: "0 20px 40px -12px hsl(var(--primary) / 0.1)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm hover:border-gold/40 transition-colors duration-300 h-full"
      >
        {/* Color accent top bar */}
        <div
          className="h-1 w-full transition-all duration-300 group-hover:h-1.5"
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
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-secondary">
              <span className="font-display text-3xl text-muted-foreground/30">{civilization.name[0]}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent opacity-80" />

          {/* Era badge overlay */}
          <span
            className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-heading font-semibold backdrop-blur-md"
            style={{
              borderColor: `hsl(var(--${civilization.colorKey}) / 0.4)`,
              color: `hsl(var(--${civilization.colorKey}))`,
              backgroundColor: `hsl(var(--${civilization.colorKey}) / 0.15)`,
              border: `1px solid hsl(var(--${civilization.colorKey}) / 0.3)`,
            }}
          >
            {civilization.era}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
            {civilization.name}
          </h3>

          <div className="flex items-center gap-3 mb-3 text-xs font-heading text-muted-foreground">
            <span className="flex items-center gap-1 font-mono">
              <Calendar className="h-3 w-3" />
              {civilization.dateRange}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {civilization.region}
            </span>
          </div>

          <p className="text-sm font-body text-muted-foreground line-clamp-3 leading-relaxed">
            {isLoading
              ? "Loading from Wikipedia..."
              : extract
                ? extract.slice(0, 150) + "..."
                : "Explore this civilization's rich cultural heritage and history."
            }
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
