import { useState, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Globe, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { civilizations } from "@/data/civilizations";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";

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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hovered = civilizations.find((c) => c.id === hoveredId);

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
              Click any marker to explore a civilization's history, key figures, and cultural achievements.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="relative max-w-5xl mx-auto">
            <div className="relative rounded-2xl border border-border/60 bg-card overflow-hidden shadow-lg">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 130, center: [20, 20] }}
                className="w-full"
                style={{ aspectRatio: "2 / 1" }}
              >
                <MemoizedGeographies />

                {civilizations.map((civ) => {
                  const isHovered = hoveredId === civ.id;
                  return (
                    <Marker
                      key={civ.id}
                      coordinates={[civ.coords[1], civ.coords[0]]}
                      onMouseEnter={() => setHoveredId(civ.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{ cursor: "pointer" }}
                    >
                      <Link to={`/civilizations/${civ.slug}`}>
                        <circle
                          r={isHovered ? 10 : 6}
                          fill="none"
                          stroke={`hsl(var(--${civ.colorKey}))`}
                          strokeWidth={1}
                          opacity={isHovered ? 0.6 : 0.3}
                          className="transition-all duration-300"
                        />
                        <circle
                          r={isHovered ? 5 : 3.5}
                          fill={`hsl(var(--${civ.colorKey}))`}
                          stroke="hsl(var(--background))"
                          strokeWidth={1}
                          className="transition-all duration-300"
                        />
                        {isHovered && (
                          <text
                            textAnchor="middle"
                            y={-14}
                            className="font-heading text-[10px] fill-foreground font-medium"
                            style={{ pointerEvents: "none" }}
                          >
                            {civ.name}
                          </text>
                        )}
                      </Link>
                    </Marker>
                  );
                })}
              </ComposableMap>

              {/* Hover tooltip */}
              <AnimatePresence>
                {hovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-72 p-4 rounded-xl border border-border bg-card/95 backdrop-blur-lg shadow-xl"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `hsl(var(--${hovered.colorKey}) / 0.15)` }}
                      >
                        <MapPin className="h-5 w-5" style={{ color: `hsl(var(--${hovered.colorKey}))` }} />
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-bold text-foreground">{hovered.name}</h3>
                        <p className="text-xs font-heading text-muted-foreground">{hovered.dateRange}</p>
                        <p className="text-xs font-heading text-muted-foreground mt-0.5">{hovered.region}</p>
                        <Link
                          to={`/civilizations/${hovered.slug}`}
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
