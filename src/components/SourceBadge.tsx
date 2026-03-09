import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Landmark,
  Camera,
  FileText,
  Globe,
  Clock,
  Database,
  Image,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type DataSource =
  | "wikipedia"
  | "wikidata"
  | "wikimedia-commons"
  | "met"
  | "aic"
  | "smithsonian"
  | "harvard"
  | "rijksmuseum"
  | "loc"
  | "unsplash"
  | "api-ninjas"
  | "muffinlabs"
  | "europeana";

interface SourceConfig {
  label: string;
  className: string;
  icon: LucideIcon;
  url: string;
}

const SOURCE_CONFIG: Record<DataSource, SourceConfig> = {
  wikipedia: {
    label: "Wikipedia",
    className: "bg-[hsl(210_15%_90%)] text-[hsl(210_15%_30%)] dark:bg-[hsl(210_15%_20%)] dark:text-[hsl(210_15%_75%)]",
    icon: BookOpen,
    url: "https://en.wikipedia.org",
  },
  wikidata: {
    label: "Wikidata",
    className: "bg-[hsl(200_40%_90%)] text-[hsl(200_40%_30%)] dark:bg-[hsl(200_40%_20%)] dark:text-[hsl(200_40%_75%)]",
    icon: Database,
    url: "https://www.wikidata.org",
  },
  "wikimedia-commons": {
    label: "Wikimedia Commons",
    className: "bg-[hsl(220_30%_90%)] text-[hsl(220_30%_30%)] dark:bg-[hsl(220_30%_20%)] dark:text-[hsl(220_30%_75%)]",
    icon: Image,
    url: "https://commons.wikimedia.org",
  },
  met: {
    label: "The Met",
    className: "bg-destructive/10 text-destructive",
    icon: Landmark,
    url: "https://www.metmuseum.org",
  },
  aic: {
    label: "Art Institute of Chicago",
    className: "bg-primary/10 text-primary",
    icon: Landmark,
    url: "https://www.artic.edu",
  },
  smithsonian: {
    label: "Smithsonian",
    className: "bg-accent/20 text-accent-foreground",
    icon: Landmark,
    url: "https://www.si.edu",
  },
  harvard: {
    label: "Harvard Art Museums",
    className: "bg-secondary text-secondary-foreground",
    icon: Landmark,
    url: "https://harvardartmuseums.org",
  },
  rijksmuseum: {
    label: "Rijksmuseum",
    className: "bg-muted text-muted-foreground",
    icon: Landmark,
    url: "https://www.rijksmuseum.nl",
  },
  loc: {
    label: "Library of Congress",
    className: "bg-[hsl(35_50%_90%)] text-[hsl(35_50%_30%)] dark:bg-[hsl(35_50%_20%)] dark:text-[hsl(35_50%_75%)]",
    icon: FileText,
    url: "https://www.loc.gov",
  },
  unsplash: {
    label: "Unsplash",
    className: "bg-[hsl(0_0%_92%)] text-[hsl(0_0%_25%)] dark:bg-[hsl(0_0%_18%)] dark:text-[hsl(0_0%_75%)]",
    icon: Camera,
    url: "https://unsplash.com",
  },
  "api-ninjas": {
    label: "API Ninjas",
    className: "bg-[hsl(145_40%_90%)] text-[hsl(145_40%_30%)] dark:bg-[hsl(145_40%_20%)] dark:text-[hsl(145_40%_75%)]",
    icon: Clock,
    url: "https://api-ninjas.com",
  },
  muffinlabs: {
    label: "Muffinlabs",
    className: "bg-[hsl(280_30%_90%)] text-[hsl(280_30%_35%)] dark:bg-[hsl(280_30%_20%)] dark:text-[hsl(280_30%_75%)]",
    icon: Globe,
    url: "https://history.muffinlabs.com",
  },
  europeana: {
    label: "Europeana",
    className: "bg-[hsl(50_60%_90%)] text-[hsl(50_60%_30%)] dark:bg-[hsl(50_60%_20%)] dark:text-[hsl(50_60%_75%)]",
    icon: Globe,
    url: "https://www.europeana.eu",
  },
};

interface SourceBadgeProps {
  source: string;
  className?: string;
  size?: "sm" | "md";
  showIcon?: boolean;
}

export function SourceBadge({ source, className, size = "sm", showIcon = true }: SourceBadgeProps) {
  const config = SOURCE_CONFIG[source as DataSource];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-heading border-0 gap-0.5 shrink-0",
        size === "sm" ? "text-[9px] px-1.5 py-0" : "text-xs px-2 py-0.5",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />}
      {config.label}
    </Badge>
  );
}

export function getSourceLabel(source: string): string {
  return SOURCE_CONFIG[source as DataSource]?.label || source;
}

export function getSourceUrl(source: string): string {
  return SOURCE_CONFIG[source as DataSource]?.url || "#";
}

export function getSourceConfig(source: string) {
  return SOURCE_CONFIG[source as DataSource];
}

export const ALL_SOURCES: DataSource[] = Object.keys(SOURCE_CONFIG) as DataSource[];
