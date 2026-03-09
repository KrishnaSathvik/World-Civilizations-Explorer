import { useState, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Globe, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { civilizations } from "@/data/civilizations";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const MemoizedGeographies = memo(function MemoGeo() {
  return (
    <Geographies geography={GEO_URL}>
      {({ geographies }) =>
        geographies.map((geo) => (
          <Geography
            key={geo.rsmKey}
            geography={geo}
            fill="hsl(var(--border))"
            stroke="hsl(var(--ring))"
            strokeWidth={0.5}
            style={{
              default: { outline: "none", opacity: 1 },
              hover: { outline: "none", opacity: 1, fill: "hsl(var(--accent))" },
              pressed: { outline: "none" },
            }}
          />
        ))
      }
    </Geographies>
  );
});

// On mobile, show a list of clickable civilization cards instead of the tiny map
function MobileCivList() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {civilizations.map((civ) => (
        <Link
          key={civ.id}
          to={`/civilizations/${civ.slug}`}
          className="flex items-center gap-2.5 p-3 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-sm transition-all"
        >
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `hsl(var(--${civ.colorKey}) / 0.15)` }}
          >
            <MapPin className="h-4 w-4" style={{ color: `hsl(var(--${civ.colorKey}))` }} />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading text-xs font-bold text-foreground truncate">{civ.name}</h3>
            <p className="text-[10px] font-heading text-muted-foreground truncate">{civ.dateRange}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function WorldMap() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = civilizations.find((c) => c.id === selectedId);
  const isMobile = useIsMobile();

  const handleMarkerClick = (civId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId((prev) => (prev === civId ? null : civId));
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-primary/[0.02] to-background">
      <div className="container">
        <ScrollReveal>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-4">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-xs font-heading font-medium text-primary">Interactive Map</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Civilizations Across the Globe
            </h2>
            <p className="font-body text-muted-foreground max-w-xl mx-auto">
              {isMobile
                ? "Tap any civilization to explore its history and cultural achievements."
                : "Tap any marker to explore a civilization's history, key figures, and cultural achievements."}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="relative max-w-5xl mx-auto">
            {isMobile ? (
              /* Mobile: show a grid of civilization cards instead of a tiny map */
              <MobileCivList />
            ) : (
              /* Desktop: full interactive map */
              <div
                className="relative rounded-2xl border border-border/60 bg-card overflow-hidden shadow-lg"
                onClick={() => setSelectedId(null)}
              >
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{ scale: 160, center: [30, 15] }}
                  className="w-full"
                  style={{ aspectRatio: "2 / 1" }}
                >
                  <MemoizedGeographies />

                  {civilizations.map((civ) => {
                    const isActive = selectedId === civ.id;
                    return (
                      <Marker
                        key={civ.id}
                        coordinates={[civ.coords[1], civ.coords[0]]}
                        style={{ cursor: "pointer" }}
                      >
                        <g onClick={(e) => handleMarkerClick(civ.id, e)}>
                          <circle r={22} fill="transparent" />
                          <circle
                            r={isActive ? 16 : 12}
                            fill={`hsl(var(--${civ.colorKey}) / 0.15)`}
                            stroke={`hsl(var(--${civ.colorKey}))`}
                            strokeWidth={2}
                            opacity={isActive ? 0.9 : 0.5}
                            className="transition-all duration-300"
                          />
                          <circle
                            r={isActive ? 8 : 7}
                            fill={`hsl(var(--${civ.colorKey}))`}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                            className="transition-all duration-300"
                          />
                          <text
                            textAnchor="middle"
                            y={-20}
                            className="font-heading fill-foreground font-bold"
                            style={{ pointerEvents: "none", fontSize: "11px", paintOrder: "stroke", stroke: "hsl(var(--card))", strokeWidth: "3px" }}
                          >
                            {civ.name}
                          </text>
                        </g>
                      </Marker>
                    );
                  })}
                </ComposableMap>

                <AnimatePresence>
                  {selected && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-72 p-4 rounded-xl border border-border bg-card/95 backdrop-blur-lg shadow-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `hsl(var(--${selected.colorKey}) / 0.15)` }}
                        >
                          <MapPin className="h-5 w-5" style={{ color: `hsl(var(--${selected.colorKey}))` }} />
                        </div>
                        <div>
                          <h3 className="font-display text-sm font-bold text-foreground">{selected.name}</h3>
                          <p className="text-xs font-heading text-muted-foreground">{selected.dateRange}</p>
                          <p className="text-xs font-heading text-muted-foreground mt-0.5">{selected.region}</p>
                          <Link
                            to={`/civilizations/${selected.slug}`}
                            className="inline-block mt-2 text-xs font-heading font-medium text-primary hover:underline"
                          >
                            Explore →
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* CTA to full map page */}
            <div className="mt-6 text-center">
              <Link to="/map">
                <Button variant="outline" className="font-heading text-sm gap-2">
                  <Globe className="h-4 w-4" />
                  Open Full Interactive Map
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
