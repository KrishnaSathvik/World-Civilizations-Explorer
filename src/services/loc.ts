export interface LOCItem {
  id: string;
  title: string;
  date: string;
  url: string;
  image_url: string[];
  description: string[];
  subject: string[];
  original_format: string[];
}

export interface LOCSearchResult {
  results: LOCItem[];
  count: number;
}

export async function searchLOC(
  query: string,
  options: { format?: string; limit?: number } = {}
): Promise<LOCSearchResult> {
  const { format, limit = 8 } = options;
  
  // Build LOC search URL
  const params = new URLSearchParams({
    q: query,
    fo: "json",
    c: String(limit),
    fa: format ? `original_format:${format}` : "",
  });
  
  // Remove empty params
  if (!format) params.delete("fa");

  const url = `https://www.loc.gov/search/?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`LOC API error: ${response.status}`);

  const data = await response.json();

  const results: LOCItem[] = (data.results || [])
    .filter((item: any) => item.image_url && item.image_url.length > 0)
    .map((item: any) => ({
      id: item.id || "",
      title: item.title || "Untitled",
      date: item.date || "",
      url: item.url || item.id || "",
      image_url: item.image_url || [],
      description: item.description || [],
      subject: item.subject || [],
      original_format: item.original_format || [],
    }));

  return { results, count: data.pagination?.total || 0 };
}

// Search specifically for maps
export async function searchLOCMaps(query: string, limit = 6) {
  return searchLOC(query, { format: "map", limit });
}

// Search specifically for photos
export async function searchLOCPhotos(query: string, limit = 8) {
  return searchLOC(query, { format: "photo,+print,+drawing", limit });
}

// Search specifically for manuscripts/documents
export async function searchLOCDocuments(query: string, limit = 6) {
  return searchLOC(query, { format: "manuscript/mixed+material", limit });
}
