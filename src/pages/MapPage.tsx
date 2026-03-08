import { useState, useMemo, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Globe, Compass, Clock, X, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { civilizations, type Civilization } from "@/data/civilizations";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Parse a year string like "3100 BCE" or "1500" into a number
function parseYear(s: string): number {
  const match = s.match(/^(\d+)\s*(BCE|CE)?/i);
  if (!match) return 0;
  const num = parseInt(match[1], 10);
  const era = (match[2] || "CE").toUpperCase();
  return era === "BCE" ? -num : num;
}

function getYearLabel(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`;
  return `${year} CE`;
}

const eraRanges = [
  { label: "All Eras", range: [-4000, 2100] as [number, number] },
  { label: "Ancient", range: [-4000, 500] as [number, number] },
  { label: "Medieval", range: [500, 1500] as [number, number] },
  { label: "Modern", range: [1500, 2100] as [number, number] },
];

const MemoizedGeographies = memo(function MemoGeo() {
  return (
    <Geographies geography={GEO_URL}>
      {({ geographies }) =>
        geographies.map((geo) => (
          <Geography
            key={geo.rsmKey}
            geography={geo}
            fill="hsl(var(--muted))"
            stroke="hsl(var(--border))"
            strokeWidth={0.5}
            style={{
              default: { outline: "none", opacity: 0.7 },
              hover: { outline: "none", opacity: 0.85, fill: "hsl(var(--secondary))" },
              pressed: { outline: "none" },
            }}
          />
        ))
      }
    </Geographies>
  );
});

export default function MapPage() {
  const [selectedCiv, setSelectedCiv] = useState<Civilization | null>(null);
  const [timeRange, setTimeRange] = useState<[number, number]>([-4000, 2100]);
  const [activeEra, setActiveEra] = useState("All Eras");

  const filteredCivs = useMemo(() => {
    return civilizations.filter((civ) => {
      const start = parseYear(civ.dateRange.split("–")[0].trim());
      const end = parseYear(civ.dateRange.split("–")[1]?.trim() || "2100 CE");
      // Overlap check
      return start <= timeRange[1] && end >= timeRange[0];
    });
  }, [timeRange]);

  const handleEraClick = (label: string, range: [number, number]) => {
    setActiveEra(label);
    setTimeRange(range);
    setSelectedCiv(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Header */}
        <section className="border-b border-border/60 bg-gradient-to-b from-primary/[0.03] to-background">
          <div className="container py-10 md:py-16">
            <ScrollReveal>
              <Breadcrumbs items={[{ label: "Map" }]} />
              <div className="flex items-center gap-2 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="text-xs font-heading font-medium text-primary">Interactive Map</span>
                </div>
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
                World Civilizations Map
              </h1>
              <p className="font-body text-muted-foreground max-w-2xl text-lg">
                Explore the geographic footprint of history's greatest civilizations. 
                Use the time slider to travel through eras and click markers for details.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Controls */}
        <section className="border-b border-border/60 bg-card/50">
          <div className="container py-6">
            <div className="flex flex-col lg:flex-row gap-6 lg:items-end">
              {/* Era quick filters */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-medium text-muted-foreground uppercase tracking-wider">
                  Quick Filter
                </label>
                <div className="flex flex-wrap gap-2">
                  {eraRanges.map((era) => (
                    <Button
                      key={era.label}
                      variant={activeEra === era.label ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleEraClick(era.label, era.range)}
                      className="font-heading text-xs"
                    >
                      {era.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Time slider */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-heading font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Time Period
                  </label>
                  <span className="text-sm font-heading font-semibold text-foreground">
                    {getYearLabel(timeRange[0])} — {getYearLabel(timeRange[1])}
                  </span>
                </div>
                <Slider
                  min={-4000}
                  max={2100}
                  step={50}
                  value={timeRange}
                  onValueChange={(v) => {
                    setTimeRange(v as [number, number]);
                    setActiveEra("");
                  }}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] font-heading text-muted-foreground">
                  <span>4000 BCE</span>
                  <span>2000 BCE</span>
                  <span>0</span>
                  <span>1000 CE</span>
                  <span>2100 CE</span>
                </div>
              </div>

              {/* Count */}
              <div className="shrink-0">
                <Badge variant="secondary" className="font-heading text-xs px-3 py-1.5">
                  <Compass className="h-3.5 w-3.5 mr-1.5" />
                  {filteredCivs.length} civilization{filteredCivs.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Map */}
        <section className="relative">
          <div className="container py-8">
            <div className="relative rounded-2xl border border-border/60 bg-card overflow-hidden shadow-lg">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 130, center: [20, 20] }}
                className="w-full"
                style={{ aspectRatio: "2 / 1" }}
              >
                <ZoomableGroup>
                  <MemoizedGeographies />

                  {filteredCivs.map((civ) => {
                    const isSelected = selectedCiv?.id === civ.id;
                    return (
                      <Marker
                        key={civ.id}
                        coordinates={[civ.coords[1], civ.coords[0]]}
                        onClick={() => setSelectedCiv(isSelected ? null : civ)}
                        style={{ cursor: "pointer" }}
                      >
                        {/* Pulse ring */}
                        <circle
                          r={isSelected ? 12 : 7}
                          fill="none"
                          stroke={`hsl(var(--${civ.colorKey}))`}
                          strokeWidth={1.5}
                          opacity={isSelected ? 0.6 : 0.3}
                          className="transition-all duration-300"
                        />
                        {/* Outer glow */}
                        {isSelected && (
                          <circle
                            r={18}
                            fill={`hsl(var(--${civ.colorKey}) / 0.1)`}
                            className="animate-pulse"
                          />
                        )}
                        {/* Main dot */}
                        <circle
                          r={isSelected ? 6 : 4}
                          fill={`hsl(var(--${civ.colorKey}))`}
                          stroke="hsl(var(--background))"
                          strokeWidth={1.5}
                          className="transition-all duration-300"
                        />
                        {/* Label */}
                        <text
                          textAnchor="middle"
                          y={isSelected ? -18 : -12}
                          className="font-heading text-[10px] fill-foreground font-medium"
                          style={{ pointerEvents: "none" }}
                        >
                          {civ.name}
                        </text>
                      </Marker>
                    );
                  })}
                </ZoomableGroup>
              </ComposableMap>

              {/* Selected civilization panel */}
              <AnimatePresence>
                {selectedCiv && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute top-4 right-4 w-80 max-h-[calc(100%-2rem)] overflow-y-auto rounded-xl border border-border bg-card/95 backdrop-blur-lg shadow-xl"
                  >
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `hsl(var(--${selectedCiv.colorKey}) / 0.15)` }}
                          >
                            <MapPin className="h-5 w-5" style={{ color: `hsl(var(--${selectedCiv.colorKey}))` }} />
                          </div>
                          <div>
                            <h3 className="font-display text-base font-bold text-foreground">{selectedCiv.name}</h3>
                            <p className="text-xs font-heading text-muted-foreground">{selectedCiv.dateRange}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => setSelectedCiv(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Region & Era */}
                      <div className="flex gap-2 mb-4">
                        <Badge variant="secondary" className="font-heading text-[10px]">
                          {selectedCiv.region}
                        </Badge>
                        <Badge variant="outline" className="font-heading text-[10px]">
                          {selectedCiv.era}
                        </Badge>
                      </div>

                      {/* Mini timeline */}
                      <div className="space-y-2 mb-5">
                        <h4 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
                          Key Events
                        </h4>
                        <div className="space-y-1.5">
                          {selectedCiv.timeline.slice(0, 3).map((t, i) => (
                            <div key={i} className="flex gap-2 text-xs">
                              <span className="font-heading font-semibold text-primary shrink-0 w-16">
                                {t.year}
                              </span>
                              <span className="font-body text-muted-foreground">{t.event}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Key figures */}
                      <div className="mb-5">
                        <h4 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Key Figures
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCiv.keyFigures.slice(0, 4).map((f) => (
                            <Badge key={f} variant="outline" className="font-heading text-[10px]">
                              {f.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* CTA */}
                      <Link to={`/civilizations/${selectedCiv.slug}`}>
                        <Button className="w-full font-heading text-sm" size="sm">
                          Explore Full Hub
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              {filteredCivs.map((civ) => (
                <button
                  key={civ.id}
                  onClick={() => setSelectedCiv(civ)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/60 bg-card hover:bg-muted transition-colors cursor-pointer"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: `hsl(var(--${civ.colorKey}))` }}
                  />
                  <span className="text-xs font-heading font-medium text-foreground">{civ.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
