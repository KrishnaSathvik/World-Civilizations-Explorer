import type { Metadata } from "next";
import ContributePage from "@/views/ContributePage";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Contribute",
  description:
    "Help improve World Civilizations Explorer. Suggest corrections, add sources, and contribute to a source-grounded, openly attributed history resource.",
  path: "/contribute",
});

export default function ContributeRoute() {
  return <ContributePage />;
}
