import type { Metadata } from "next";
import DataSourcesPage from "@/views/DataSourcesPage";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Data Sources & Provenance",
  description:
    "How World Civilizations Explorer sources its content: Wikipedia, Wikimedia Commons, the Metropolitan Museum, Rijksmuseum, Art Institute of Chicago, the Library of Congress, and more — with clear attribution.",
  path: "/sources",
});

export default function SourcesRoute() {
  return <DataSourcesPage />;
}
