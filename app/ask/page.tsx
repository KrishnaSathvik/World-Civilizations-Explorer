import type { Metadata } from "next";
import AskPage from "@/views/AskPage";
import { buildMetadata } from "@/lib/seo/metadata";

// Interactive, source-grounded RAG chat — rendered dynamically.
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Ask History | Source-Grounded AI",
  description:
    "Ask questions about world history and get source-grounded answers drawn from Wikipedia, museum, and Library of Congress data. AI-assisted answers are clearly labeled.",
  path: "/ask",
});

export default function AskRoute() {
  return <AskPage />;
}
