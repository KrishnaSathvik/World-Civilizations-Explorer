"use client";
import { useState, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Globe, ArrowRight } from "lucide-react";
import { Link } from "@/lib/router";
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
              Tap any marker to explore a civilization's history, key figures, and cultural achievements.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="relative max-w-5xl mx-auto">
            <div
              className="relative rounded-2xl border border-border/60 bg-card overflow-x-auto overflow-y-hidden shadow-lg"
              onClick={() => setSelectedId(null)}
            >
              {isMobile && (
                <p className="text-[10px] font-heading text-muted-foreground text-center py-1.5 bg-muted/50 border-b border-border/40">
                  ← Swipe to explore the map →
                </p>
              )}
              <div style={{ minWidth: isMobile ? "700px" : undefined }}>
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{ scale: isMobile ? 200 : 160, center: [30, 15] }}
                  className="w-full"
                  style={{ aspectRatio: isMobile ? "5 / 4" : "2 / 1" }}
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
                            style={{
                              pointerEvents: "none",
                              fontSize: "11px",
                              paintOrder: "stroke",
                              stroke: "hsl(var(--card))",
                              strokeWidth: "3px",
                            }}
                          >
                            {civ.name}
                          </text>
                        </g>
                      </Marker>
                    );
                  })}
                </ComposableMap>
              </div>

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