import type { Metadata } from "next";
import { Suspense } from "react";
import SearchPage from "@/views/SearchPage";
import { buildMetadata } from "@/lib/seo/metadata";

// Request-time, query-driven page. Not indexed (avoids thin/duplicate
// query-string URLs in the index per the crawl strategy).
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Search",
  description:
    "Search across civilizations, historical figures, topics, and events in World Civilizations Explorer.",
  path: "/search",
  noindex: true,
});

export default function SearchRoute() {
  return (
    <Suspense fallback={null}>
      <SearchPage />
    </Suspense>
  );
}
