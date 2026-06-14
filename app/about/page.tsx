import type { Metadata } from "next";
import AboutPage from "@/views/AboutPage";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Learn about World Civilizations Explorer — a source-grounded, AI-assisted guide to 10,000 years of human history built on Wikipedia, Wikimedia, museum, and Library of Congress data.",
  path: "/about",
});

export default function AboutRoute() {
  return <AboutPage />;
}
