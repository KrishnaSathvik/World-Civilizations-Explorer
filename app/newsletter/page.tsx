import type { Metadata } from "next";
import NewsletterPage from "@/views/NewsletterPage";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Newsletter",
  description:
    "Subscribe to the World Civilizations Explorer newsletter for weekly stories from history — civilizations, figures, artifacts, and 'this week in history'.",
  path: "/newsletter",
});

export default function NewsletterRoute() {
  return <NewsletterPage />;
}
