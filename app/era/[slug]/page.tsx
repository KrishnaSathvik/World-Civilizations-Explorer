import type { Metadata } from "next";
import EraPage from "@/views/EraPage";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { eraSlugs } from "@/lib/seo/content";

interface Params {
  params: { slug: string };
}

const eraMeta: Record<string, { title: string; range: string; description: string }> = {
  ancient: {
    title: "Ancient Era",
    range: "3500 BCE – 500 CE",
    description:
      "The Ancient Era — from the first river-valley civilizations to the fall of classical empires. Explore the cultures, figures, and milestones that gave us writing, law, and philosophy.",
  },
  medieval: {
    title: "Medieval Era",
    range: "500 CE – 1500 CE",
    description:
      "The Medieval Era — feudalism, religious expansion, and cultural exchange along global trade routes. Explore the empires and ideas that shaped the world.",
  },
  modern: {
    title: "Modern Era",
    range: "1500 CE – Present",
    description:
      "The Modern Era — exploration, revolution, industrialization, and global interconnection. Explore the civilizations and breakthroughs that remade every society.",
  },
};

export function generateStaticParams() {
  return eraSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const meta = eraMeta[params.slug];
  if (!meta) {
    return buildMetadata({
      title: "Era Not Found",
      description: "This era could not be found.",
      path: `/era/${params.slug}`,
      noindex: true,
    });
  }
  return buildMetadata({
    title: `${meta.title} | ${meta.range}`,
    description: meta.description,
    path: `/era/${params.slug}`,
    type: "article",
  });
}

export default function EraRoute({ params }: Params) {
  const meta = eraMeta[params.slug];
  return (
    <>
      {meta && (
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Timeline", path: "/timeline" },
            { name: meta.title, path: `/era/${params.slug}` },
          ])}
        />
      )}
      <EraPage />
    </>
  );
}
