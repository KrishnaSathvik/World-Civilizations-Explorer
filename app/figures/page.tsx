import type { Metadata } from "next";
import FiguresIndexPage from "@/views/FiguresIndexPage";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Historical Figures | Leaders, Thinkers & Innovators",
  description:
    "Browse influential historical figures across world civilizations — pharaohs, philosophers, emperors, scientists, and artists — with biographies and timelines.",
  path: "/figures",
});

export default function FiguresRoute() {
  return <FiguresIndexPage />;
}
