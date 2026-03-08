import { supabase } from "@/integrations/supabase/client";

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
    rijksmuseum?: any[];
  };
  error?: string;
}

/**
 * Search all key-required museum APIs via edge function proxy.
 */
export async function searchMuseums(
  query: string,
  limit: number = 6
): Promise<MuseumArtwork[]> {
  const { data, error } = await supabase.functions.invoke<MuseumSearchResponse>(
    "museum-search",
    { body: { query, limit } }
  );

  if (error || !data?.success) {
    console.warn("Museum search error:", error || data?.error);
    return [];
  }

  const results: MuseumArtwork[] = [];

  // Smithsonian
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

  // Harvard
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

  // Rijksmuseum
  if (data.data.rijksmuseum) {
    for (const item of data.data.rijksmuseum) {
      results.push({
        id: item.id,
        title: item.title,
        artist: item.artist || "",
        date: "",
        imageUrl: item.imageUrl,
        thumbUrl: item.thumbUrl,
        url: item.url,
        source: "rijksmuseum",
      });
    }
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
  const { data, error } = await supabase.functions.invoke<MuseumSearchResponse>(
    "museum-search",
    { body: { query, limit, source } }
  );

  if (error || !data?.success) return [];

  const items = data.data[source] || [];
  return items.map((item: any) => ({
    id: item.id || item.objectNumber || "",
    title: item.title || "Untitled",
    artist: item.artist || item.principalOrFirstMaker || "",
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
