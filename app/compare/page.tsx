import type { Metadata } from "next";
import ComparePage from "@/views/ComparePage";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Compare Civilizations Side by Side",
  description:
    "Compare any two world civilizations side by side — date ranges, regions, key figures, topics, and timelines — to see how cultures overlapped and differed.",
  path: "/compare",
});

export default function CompareRoute() {
  return <ComparePage />;
}
