import { supabase } from "@/integrations/supabase/client";
import { searchRijksmuseum, RijksmuseumArtwork } from "@/services/rijksmuseum";

export interface MuseumArtwork {
  id: string;
  title: string;
  artist: string;
  date: string;
  imageUrl: string;
  thumbUrl?: string;
  url: string;
  source: "smithsonian" | "harvard" | "rijksmuseum";
  medium?: string;
  culture?: string;
  classification?: string;
}

interface MuseumSearchResponse {
  success: boolean;
  data: {
    smithsonian?: any[];
    harvard?: any[];
  };
  error?: string;
}

/**
 * Search all museum APIs: Smithsonian & Harvard via edge function, Rijksmuseum client-side (no key needed).
 */
export async function searchMuseums(
  query: string,
  limit: number = 6
): Promise<MuseumArtwork[]> {
  // Fetch edge-function-proxied APIs and Rijksmuseum in parallel
  const [edgeResult, rijksResult] = await Promise.allSettled([
    supabase.functions.invoke<MuseumSearchResponse>("museum-search", {
      body: { query, limit },
    }),
    searchRijksmuseum(query, limit),
  ]);

  const results: MuseumArtwork[] = [];

  // Process edge function results (Smithsonian + Harvard)
  if (edgeResult.status === "fulfilled") {
    const { data, error } = edgeResult.value;
    if (!error && data?.success) {
      if (data.data.smithsonian) {
        for (const item of data.data.smithsonian) {
          results.push({
            id: item.id,
            title: item.title,
            artist: "",
            date: item.date || "",
            imageUrl: item.imageUrl,
            url: item.link,
            source: "smithsonian",
            culture: item.place,
            classification: item.type,
          });
        }
      }
      if (data.data.harvard) {
        for (const item of data.data.harvard) {
          results.push({
            id: String(item.id),
            title: item.title,
            artist: item.artist || "",
            date: item.date || "",
            imageUrl: item.imageUrl,
            url: item.url,
            source: "harvard",
            medium: item.medium,
            culture: item.culture,
            classification: item.classification,
          });
        }
      }
    }
  }

  // Process Rijksmuseum results (client-side, no key needed)
  if (rijksResult.status === "fulfilled") {
    results.push(...rijksResult.value);
  }

  return results;
}

/**
 * Search a specific museum source.
 */
export async function searchMuseumBySource(
  query: string,
  source: "smithsonian" | "harvard" | "rijksmuseum",
  limit: number = 8
): Promise<MuseumArtwork[]> {
  // Rijksmuseum uses client-side API (no key needed)
  if (source === "rijksmuseum") {
    return searchRijksmuseum(query, limit);
  }

  // Smithsonian & Harvard go through edge function
  const { data, error } = await supabase.functions.invoke<MuseumSearchResponse>(
    "museum-search",
    { body: { query, limit, source } }
  );

  if (error || !data?.success) return [];

  const items = data.data[source] || [];
  return items.map((item: any) => ({
    id: item.id || "",
    title: item.title || "Untitled",
    artist: item.artist || "",
    date: item.date || item.dated || "",
    imageUrl: item.imageUrl || item.primaryimageurl || "",
    thumbUrl: item.thumbUrl,
    url: item.url || item.link || "",
    source,
    medium: item.medium,
    culture: item.culture || item.place,
    classification: item.classification || item.type,
  }));
}
