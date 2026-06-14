import type { Metadata } from "next";
import FigurePage from "@/views/FigurePage";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import {
  allFigureSlugs,
  civilizationsForFigure,
  slugToTitle,
} from "@/lib/seo/content";

interface Params {
  params: { slug: string };
}

export function generateStaticParams() {
  return allFigureSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const name = slugToTitle(params.slug);
  const civs = civilizationsForFigure(params.slug);
  const civClause = civs.length
    ? ` of ${civs.map((c) => c.name).join(" & ")}`
    : "";
  return buildMetadata({
    title: `${name} | Biography, Timeline & Legacy`,
    description: `${name}${civClause} — biography, timeline, related civilizations, topics, and artifacts. Source-grounded history from Wikipedia and museum collections.`,
    path: `/figures/${params.slug}`,
    type: "profile",
  });
}

export default function FigureRoute({ params }: Params) {
  const name = slugToTitle(params.slug);
  const civs = civilizationsForFigure(params.slug);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    description: `${name} — a notable historical figure${
      civs.length ? ` associated with ${civs.map((c) => c.name).join(", ")}` : ""
    }.`,
    mainEntityOfPage: absoluteUrl(`/figures/${params.slug}`),
  };

  return (
    <>
      <JsonLd
        data={[
          personJsonLd,
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Figures", path: "/figures" },
            { name, path: `/figures/${params.slug}` },
          ]),
        ]}
      />
      <FigurePage />
    </>
  );
}
