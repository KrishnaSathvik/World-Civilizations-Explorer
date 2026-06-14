import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CivilizationHub from "@/views/CivilizationHub";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { allCivilizationSlugs, getCivilization } from "@/lib/seo/content";

interface Params {
  params: { slug: string };
}

// Pre-render every civilization page at build time (SSG).
export function generateStaticParams() {
  return allCivilizationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const civ = getCivilization(params.slug);
  if (!civ) {
    return buildMetadata({
      title: "Civilization Not Found",
      description: "This civilization could not be found.",
      path: `/civilizations/${params.slug}`,
      noindex: true,
    });
  }
  const description =
    civ.description ??
    `${civ.name} (${civ.dateRange}) of ${civ.region}. Explore its timeline, key figures, topics, artifacts, and lasting legacy — with source-grounded data.`;
  return buildMetadata({
    title: `${civ.name} | Timeline, Figures, Artifacts & History`,
    description,
    path: `/civilizations/${civ.slug}`,
    image: civ.imageUrl,
    type: "article",
  });
}

export default function CivilizationRoute({ params }: Params) {
  const civ = getCivilization(params.slug);
  if (!civ) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${civ.name}: History, Timeline & Legacy`,
    about: civ.name,
    description:
      civ.description ??
      `${civ.name} (${civ.dateRange}) of ${civ.region}.`,
    image: civ.imageUrl ? [civ.imageUrl] : undefined,
    mainEntityOfPage: absoluteUrl(`/civilizations/${civ.slug}`),
    keywords: [...civ.keyFigures, ...civ.topics].map((t) => t.replace(/_/g, " ")),
  };

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd,
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Civilizations", path: "/civilizations" },
            { name: civ.name, path: `/civilizations/${civ.slug}` },
          ]),
        ]}
      />
      <CivilizationHub />
    </>
  );
}
