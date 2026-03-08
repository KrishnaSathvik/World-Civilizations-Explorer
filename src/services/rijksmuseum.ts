/**
 * Rijksmuseum client-side service using the key-free data.rijksmuseum.nl API.
 * Search API: https://data.rijksmuseum.nl/docs/search
 * Persistent Identifier Resolver: https://data.rijksmuseum.nl/docs/http
 */

export interface RijksmuseumArtwork {
  id: string;
  title: string;
  artist: string;
  date: string;
  imageUrl: string;
  thumbUrl: string;
  url: string;
  source: "rijksmuseum";
  medium?: string;
}

interface LinkedArtSearchResult {
  orderedItems: Array<{ id: string; type: string }>;
  partOf?: { totalItems: number };
}

interface LinkedArtObject {
  id?: string;
  _label?: string;
  produced_by?: {
    carried_out_by?: Array<{ _label?: string }>;
    timespan?: { begin_of_the_begin?: string; end_of_the_end?: string };
  };
  representation?: Array<{
    id?: string;
    type?: string;
    _label?: string;
    digitally_shown_by?: Array<{ id?: string; access_point?: Array<{ id?: string }> }>;
  }>;
  subject_of?: Array<{ id?: string; _label?: string }>;
  identified_by?: Array<{ content?: string; type?: string; classified_as?: Array<{ _label?: string }> }>;
}

/**
 * Search the Rijksmuseum collection (no API key needed).
 */
export async function searchRijksmuseum(
  query: string,
  limit: number = 6
): Promise<RijksmuseumArtwork[]> {
  try {
    // Step 1: Search for object IDs
    const searchUrl = new URL("https://data.rijksmuseum.nl/search/collection");
    searchUrl.searchParams.set("title", query);
    searchUrl.searchParams.set("imageAvailable", "true");

    const searchRes = await fetch(searchUrl.toString(), {
      headers: { Accept: "application/ld+json" },
    });

    if (!searchRes.ok) return [];

    const searchData: LinkedArtSearchResult = await searchRes.json();
    const items = (searchData.orderedItems || []).slice(0, limit);

    if (items.length === 0) return [];

    // Step 2: Resolve each ID to get metadata + images (in parallel)
    const results = await Promise.allSettled(
      items.map((item) => resolveObject(item.id))
    );

    return results
      .filter((r): r is PromiseFulfilledResult<RijksmuseumArtwork | null> => r.status === "fulfilled")
      .map((r) => r.value)
      .filter((r): r is RijksmuseumArtwork => r !== null);
  } catch (e) {
    console.error("Rijksmuseum search error:", e);
    return [];
  }
}

async function resolveObject(rwoId: string): Promise<RijksmuseumArtwork | null> {
  try {
    // Request Linked Art JSON-LD from the resolver
    const res = await fetch(rwoId, {
      headers: {
        Accept: "application/ld+json;profile=\"https://linked.art/ns/v1/linked-art.json\"",
      },
      redirect: "follow",
    });

    if (!res.ok) return null;

    const data: LinkedArtObject = await res.json();

    // Extract title
    const titleEntry = data.identified_by?.find(
      (id) => id.type === "Name" || id.classified_as?.some((c) => c._label === "Primary Name")
    );
    const title = titleEntry?.content || data._label || "Untitled";

    // Extract artist
    const artist = data.produced_by?.carried_out_by?.[0]?._label || "";

    // Extract date
    const timespan = data.produced_by?.timespan;
    const date = timespan?.begin_of_the_begin?.slice(0, 4) || "";

    // Extract image URL from representation
    let imageUrl = "";
    if (data.representation && data.representation.length > 0) {
      const rep = data.representation[0];
      imageUrl =
        rep.digitally_shown_by?.[0]?.access_point?.[0]?.id ||
        rep.digitally_shown_by?.[0]?.id ||
        rep.id ||
        "";
    }

    if (!imageUrl) return null;

    // Extract web page URL
    const webPage = data.subject_of?.find((s) => s._label?.includes("Homepage"));
    const url = webPage?.id || rwoId.replace("id.rijksmuseum.nl", "www.rijksmuseum.nl/en/collection");

    // Extract object number from RWO ID for building the web URL
    const idMatch = rwoId.match(/\/(\d+)$/);
    const objectId = idMatch?.[1] || "";

    return {
      id: objectId,
      title,
      artist,
      date,
      imageUrl,
      thumbUrl: imageUrl,
      url: typeof url === "string" ? url : rwoId,
      source: "rijksmuseum",
    };
  } catch (e) {
    console.error("Rijksmuseum resolve error:", rwoId, e);
    return null;
  }
}
