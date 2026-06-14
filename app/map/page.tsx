import type { Metadata } from "next";
import MapPage from "@/views/MapPage";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Interactive World History Map",
  description:
    "An interactive map of world civilizations across history. Explore where ancient and modern cultures rose, their regions, date ranges, and key sites.",
  path: "/map",
});

export default function MapRoute() {
  return <MapPage />;
}
