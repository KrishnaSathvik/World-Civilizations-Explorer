const AIC_API = "https://api.artic.edu/api/v1";
const AIC_IIIF = "https://www.artic.edu/iiif/2";

export interface AICArtwork {
  id: number;
  title: string;
  artist_display: string;
  date_display: string;
  medium_display: string;
  place_of_origin: string;
  dimensions: string;
  credit_line: string;
  image_id: string;
  imageUrl: string;
  thumbUrl: string;
  department_title: string;
  artwork_type_title: string;
  style_title: string;
  classification_title: string;
  is_public_domain: boolean;
}

/**
 * Search the Art Institute of Chicago collection.
 */
export async function searchAICCollection(
  query: string,
  limit: number = 10
): Promise<AICArtwork[]> {
  const fields = [
    "id", "title", "artist_display", "date_display", "medium_display",
    "place_of_origin", "dimensions", "credit_line", "image_id",
    "department_title", "artwork_type_title", "style_title",
    "classification_title", "is_public_domain",
  ].join(",");

  const res = await fetch(
    `${AIC_API}/artworks/search?q=${encodeURIComponent(query)}&limit=${limit}&fields=${fields}`
  );
  if (!res.ok) throw new Error(`AIC search error: ${res.status}`);
  const data = await res.json();

  return (data.data || [])
    .filter((d: any) => d.image_id)
    .map((d: any) => ({
      id: d.id,
      title: d.title || "Untitled",
      artist_display: d.artist_display || "",
      date_display: d.date_display || "",
      medium_display: d.medium_display || "",
      place_of_origin: d.place_of_origin || "",
      dimensions: d.dimensions || "",
      credit_line: d.credit_line || "",
      image_id: d.image_id,
      imageUrl: `${AIC_IIIF}/${d.image_id}/full/843,/0/default.jpg`,
      thumbUrl: `${AIC_IIIF}/${d.image_id}/full/400,/0/default.jpg`,
      department_title: d.department_title || "",
      artwork_type_title: d.artwork_type_title || "",
      style_title: d.style_title || "",
      classification_title: d.classification_title || "",
      is_public_domain: d.is_public_domain || false,
    }));
}
