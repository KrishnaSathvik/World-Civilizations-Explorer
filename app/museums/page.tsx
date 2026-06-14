import type { Metadata } from "next";
import MuseumSearchPage from "@/views/MuseumSearchPage";
import { buildMetadata } from "@/lib/seo/metadata";

// Searches live museum APIs at request time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Museum Artifact Search",
  description:
    "Search artifacts and artworks from world museums — the Metropolitan Museum of Art, Rijksmuseum, the Art Institute of Chicago, and more — by civilization, era, and theme.",
  path: "/museums",
});

export default function MuseumsRoute() {
  return <MuseumSearchPage />;
}
