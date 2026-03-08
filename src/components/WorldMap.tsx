import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { civilizations } from "@/data/civilizations";
import { ScrollReveal } from "@/components/ScrollReveal";

// Simple equirectangular projection: convert lat/lng to SVG percentage
function toSvg(lat: number, lng: number): { x: number; y: number } {
  return {
    x: ((lng + 180) / 360) * 100,
    y: ((90 - lat) / 180) * 100,
  };
}

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
            {/* Map container */}
            <div className="relative aspect-[2/1] rounded-2xl border border-border/60 bg-card overflow-hidden shadow-lg">
              {/* Simple world map background using SVG */}
              <svg
                viewBox="0 0 100 50"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Ocean */}
                <rect width="100" height="50" fill="hsl(var(--secondary))" opacity="0.5" />

                {/* Simplified continent shapes */}
                {/* North America */}
                <path d="M10,8 Q15,5 22,7 L25,10 Q27,14 25,18 L20,22 Q18,20 15,20 L12,18 Q8,14 10,8Z" fill="hsl(var(--muted))" opacity="0.6" />
                {/* South America */}
                <path d="M22,24 Q25,22 27,24 L28,28 Q29,32 27,36 L25,40 Q23,42 22,40 L20,35 Q19,30 22,24Z" fill="hsl(var(--muted))" opacity="0.6" />
                {/* Europe */}
                <path d="M45,6 Q50,5 54,7 L55,10 Q53,13 50,14 L47,13 Q44,11 45,6Z" fill="hsl(var(--muted))" opacity="0.6" />
                {/* Africa */}
                <path d="M45,16 Q50,14 55,16 L57,20 Q58,26 56,32 L53,36 Q50,38 48,36 L46,30 Q44,24 45,16Z" fill="hsl(var(--muted))" opacity="0.6" />
                {/* Asia */}
                <path d="M55,5 Q65,3 80,6 L85,10 Q87,15 85,20 L80,22 Q75,24 70,22 L65,20 Q60,16 55,12 L55,5Z" fill="hsl(var(--muted))" opacity="0.6" />
                {/* Australia */}
                <path d="M78,32 Q82,30 86,32 L87,35 Q86,38 83,38 L80,37 Q77,35 78,32Z" fill="hsl(var(--muted))" opacity="0.6" />

                {/* Grid lines */}
                {[0, 10, 20, 30, 40, 50].map((y) => (
                  <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="hsl(var(--border))" strokeWidth="0.1" opacity="0.3" />
                ))}
                {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((x) => (
                  <line key={`v${x}`} x1={x} y1="0" x2={x} y2="50" stroke="hsl(var(--border))" strokeWidth="0.1" opacity="0.3" />
                ))}

                {/* Civilization markers */}
                {civilizations.map((civ) => {
                  const pos = toSvg(civ.coords[0], civ.coords[1]);
                  const isHovered = hoveredId === civ.id;
                  return (
                    <Link key={civ.id} to={`/civilizations/${civ.slug}`}>
                      <g
                        onMouseEnter={() => setHoveredId(civ.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className="cursor-pointer"
                      >
                        {/* Pulse ring */}
                        <circle
                          cx={pos.x}
                          cy={pos.y / 2}
                          r={isHovered ? 2.5 : 1.5}
                          fill="none"
                          stroke={`hsl(var(--${civ.colorKey}))`}
                          strokeWidth="0.2"
                          opacity={isHovered ? 0.6 : 0.3}
                          className="transition-all duration-300"
                        />
                        {/* Main dot */}
                        <circle
                          cx={pos.x}
                          cy={pos.y / 2}
                          r={isHovered ? 1.2 : 0.8}
                          fill={`hsl(var(--${civ.colorKey}))`}
                          className="transition-all duration-300"
                        />
                        {/* Label (on hover) */}
                        {isHovered && (
                          <text
                            x={pos.x}
                            y={pos.y / 2 - 2.5}
                            textAnchor="middle"
                            className="text-[1.5px] font-heading fill-foreground"
                          >
                            {civ.name}
                          </text>
                        )}
                      </g>
                    </Link>
                  );
                })}
              </svg>

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
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
