import type { Metadata } from "next";
import { Suspense } from "react";
import HistoryEventPage from "@/views/HistoryEventPage";
import { buildMetadata } from "@/lib/seo/metadata";

// Depends on request-time query params (the selected event).
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "On This Day in History",
  description:
    "Discover what happened on this day throughout history — notable events, births, and deaths across world civilizations.",
  path: "/history-event",
});

export default function HistoryEventRoute() {
  return (
    <Suspense fallback={null}>
      <HistoryEventPage />
    </Suspense>
  );
}
