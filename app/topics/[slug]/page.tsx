import type { Metadata } from "next";
import TopicPage from "@/views/TopicPage";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import {
  allTopicSlugs,
  civilizationsForTopic,
  slugToTitle,
} from "@/lib/seo/content";

interface Params {
  params: { slug: string };
}

export function generateStaticParams() {
  return allTopicSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const name = slugToTitle(params.slug);
  const civs = civilizationsForTopic(params.slug);
  const civClause = civs.length
    ? ` in ${civs.map((c) => c.name).join(" & ")}`
    : "";
  return buildMetadata({
    title: `${name} | History, Culture & Significance`,
    description: `${name}${civClause} — overview, related civilizations, figures, artifacts, and primary sources. Source-grounded history from Wikipedia and museum collections.`,
    path: `/topics/${params.slug}`,
    type: "article",
  });
}

export default function TopicRoute({ params }: Params) {
  const name = slugToTitle(params.slug);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: name,
    about: name,
    mainEntityOfPage: absoluteUrl(`/topics/${params.slug}`),
  };

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd,
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: name, path: `/topics/${params.slug}` },
          ]),
        ]}
      />
      <TopicPage />
    </>
  );
}
