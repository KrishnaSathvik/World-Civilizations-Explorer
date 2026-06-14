import type { Metadata } from "next";
import TimelinePage from "@/views/TimelinePage";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Interactive History Timeline | 10,000 Years",
  description:
    "Explore an interactive timeline of world history spanning 10,000 years — from the first river-valley civilizations to the modern era, with key events for every civilization.",
  path: "/timeline",
});

export default function TimelineRoute() {
  return <TimelinePage />;
}
