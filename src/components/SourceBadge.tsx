import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type MuseumSource = "met" | "aic" | "smithsonian" | "harvard" | "rijksmuseum";

const SOURCE_CONFIG: Record<MuseumSource, { label: string; className: string }> = {
  met: { label: "The Met", className: "bg-destructive/10 text-destructive" },
  aic: { label: "Art Institute of Chicago", className: "bg-primary/10 text-primary" },
  smithsonian: { label: "Smithsonian", className: "bg-accent/20 text-accent-foreground" },
  harvard: { label: "Harvard Art Museums", className: "bg-secondary text-secondary-foreground" },
  rijksmuseum: { label: "Rijksmuseum", className: "bg-muted text-muted-foreground" },
};

interface SourceBadgeProps {
  source: string;
  className?: string;
  size?: "sm" | "md";
}

export function SourceBadge({ source, className, size = "sm" }: SourceBadgeProps) {
  const config = SOURCE_CONFIG[source as MuseumSource];
  if (!config) return null;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-heading border-0",
        size === "sm" ? "text-[9px] px-1.5 py-0" : "text-xs px-2 py-0.5",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}

export function getSourceLabel(source: string): string {
  return SOURCE_CONFIG[source as MuseumSource]?.label || source;
}

export const ALL_SOURCES: MuseumSource[] = ["met", "aic", "smithsonian", "harvard", "rijksmuseum"];
