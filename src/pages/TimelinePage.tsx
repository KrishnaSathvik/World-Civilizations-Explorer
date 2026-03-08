import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Clock, ZoomIn, ZoomOut, RotateCcw, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { civilizations } from "@/data/civilizations";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function parseYear(s: string): number {
  const match = s.match(/^(\d+)\s*(BCE|CE)?/i);
  if (!match) return 0;
  const num = parseInt(match[1], 10);
  const era = (match[2] || "CE").toUpperCase();
  return era === "BCE" ? -num : num;
}

function getYearLabel(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`;
  if (year === 0) return "1 CE";
  return `${year} CE`;
}

const GLOBAL_START = -3500;
const GLOBAL_END = 2100;

const regionColors: Record<string, string> = {
  Africa: "civ-african",
  Americas: "civ-mesoamerican",
  Asia: "civ-china",
  Europe: "civ-greece",
  "Middle East": "civ-islamic",
};

export default function TimelinePage() {
  const [zoom, setZoom] = useState(1);
  const [selectedCivId, setSelectedCivId] = useState<string | null>(null);
  const [filterRegion, setFilterRegion] = useState<string>("All");
  const scrollRef = useRef<HTMLDivElement>(null);

  const regions = ["All", ...Array.from(new Set(civilizations.map((c) => c.regionGroup)))];

  const filteredCivs = useMemo(() => {
    const list = filterRegion === "All"
      ? civilizations
      : civilizations.filter((c) => c.regionGroup === filterRegion);
    return [...list].sort((a, b) => {
      const aStart = parseYear(a.dateRange.split("–")[0].trim());
      const bStart = parseYear(b.dateRange.split("–")[0].trim());
      return aStart - bStart;
    });
  }, [filterRegion]);

  const totalYears = GLOBAL_END - GLOBAL_START;
  const baseWidth = 2000;
  const timelineWidth = baseWidth * zoom;

  function yearToPercent(year: number): number {
    return ((year - GLOBAL_START) / totalYears) * 100;
  }

  // Tick marks
  const ticks = useMemo(() => {
    const step = zoom > 2 ? 200 : zoom > 1.5 ? 500 : 1000;
    const result: number[] = [];
    let y = Math.ceil(GLOBAL_START / step) * step;
    while (y <= GLOBAL_END) {
      result.push(y);
      y += step;
    }
    return result;
  }, [zoom]);

  const selectedCiv = civilizations.find((c) => c.id === selectedCivId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Header */}
        <section className="border-b border-border/60 bg-gradient-to-b from-primary/[0.03] to-background">
          <div className="container py-10 md:py-16">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-4">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs font-heading font-medium text-primary">Interactive Timeline</span>
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
                Timeline of Civilizations
              </h1>
              <p className="font-body text-muted-foreground max-w-2xl text-lg">
                Visualize the rise and fall of civilizations across millennia. Zoom, scroll, and click to explore key events.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Controls */}
        <section className="border-b border-border/60 bg-card/50 sticky top-16 z-30">
          <div className="container py-4">
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div className="flex flex-wrap gap-2">
                {regions.map((r) => (
                  <Button
                    key={r}
                    variant={filterRegion === r ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterRegion(r)}
                    className="font-heading text-xs"
                  >
                    {r}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs font-heading text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom((z) => Math.min(4, z + 0.25))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setZoom(1); setSelectedCivId(null); }}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-8">
          <div className="container">
            <div
              ref={scrollRef}
              className="overflow-x-auto rounded-xl border border-border/60 bg-card"
              style={{ scrollBehavior: "smooth" }}
            >
              <div style={{ width: `${timelineWidth}px`, minHeight: `${filteredCivs.length * 56 + 80}px` }} className="relative py-10">
                {/* Tick marks */}
                {ticks.map((year) => {
                  const left = yearToPercent(year);
                  return (
                    <div
                      key={year}
                      className="absolute top-0 bottom-0"
                      style={{ left: `${left}%` }}
                    >
                      <div className="h-full border-l border-border/30" />
                      <span className="absolute top-2 -translate-x-1/2 text-[10px] font-heading text-muted-foreground whitespace-nowrap">
                        {getYearLabel(year)}
                      </span>
                    </div>
                  );
                })}

                {/* Civilization bars */}
                {filteredCivs.map((civ, i) => {
                  const startYear = parseYear(civ.dateRange.split("–")[0].trim());
                  const endStr = civ.dateRange.split("–")[1]?.trim() || "2100 CE";
                  const endYear = endStr.toLowerCase().includes("present") ? 2025 : parseYear(endStr);
                  const left = yearToPercent(startYear);
                  const right = yearToPercent(endYear);
                  const width = right - left;
                  const isSelected = selectedCivId === civ.id;

                  return (
                    <Tooltip key={civ.id}>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                          style={{
                            position: "absolute",
                            left: `${left}%`,
                            width: `${width}%`,
                            top: `${i * 56 + 50}px`,
                            transformOrigin: "left center",
                          }}
                          className={`h-10 rounded-lg cursor-pointer transition-all duration-200 flex items-center px-3 overflow-hidden group ${
                            isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
                          }`}
                          onClick={() => setSelectedCivId(isSelected ? null : civ.id)}
                        >
                          <div
                            className="absolute inset-0 rounded-lg"
                            style={{
                              backgroundColor: `hsl(var(--${civ.colorKey}) / ${isSelected ? 0.3 : 0.15})`,
                              borderLeft: `4px solid hsl(var(--${civ.colorKey}))`,
                            }}
                          />
                          <span className="relative z-10 text-xs font-heading font-semibold text-foreground truncate">
                            {civ.name}
                          </span>
                          <span className="relative z-10 ml-auto text-[10px] font-heading text-muted-foreground hidden sm:block shrink-0 pl-2">
                            {civ.dateRange}
                          </span>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="font-heading text-xs font-semibold">{civ.name}</p>
                        <p className="font-heading text-xs text-muted-foreground">{civ.dateRange} · {civ.region}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}

                {/* Event markers for selected civ */}
                {selectedCiv && selectedCiv.timeline.map((evt, i) => {
                  const evtYear = parseYear(evt.year);
                  const left = yearToPercent(evtYear);
                  const civIndex = filteredCivs.findIndex((c) => c.id === selectedCiv.id);
                  if (civIndex === -1) return null;

                  return (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div
                          className="absolute w-3 h-3 rounded-full bg-primary border-2 border-background shadow-md cursor-pointer z-20"
                          style={{
                            left: `${left}%`,
                            top: `${civIndex * 56 + 50 + 14}px`,
                            transform: "translate(-50%, 0)",
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-sm">
                        <p className="font-heading text-xs font-bold">{evt.year}</p>
                        <p className="font-body text-xs">{evt.event}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* Selected detail */}
            {selectedCiv && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-xl border border-border bg-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">{selectedCiv.name}</h3>
                    <p className="text-sm font-heading text-muted-foreground">{selectedCiv.dateRange} · {selectedCiv.region}</p>
                  </div>
                  <Link to={`/civilizations/${selectedCiv.slug}`}>
                    <Button size="sm" className="font-heading text-xs gap-1">
                      Full Hub <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedCiv.timeline.map((evt, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                      <span className="font-heading font-bold text-primary text-sm shrink-0">{evt.year}</span>
                      <span className="font-body text-sm text-muted-foreground">{evt.event}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              {Object.entries(regionColors).map(([region, colorKey]) => (
                <div key={region} className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `hsl(var(--${colorKey}))` }} />
                  <span className="text-xs font-heading text-muted-foreground">{region}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
