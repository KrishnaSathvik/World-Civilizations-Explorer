const MET_API = "https://collectionapi.metmuseum.org/public/collection/v1";

export interface MetArtwork {
  objectID: number;
  title: string;
  artistDisplayName: string;
  objectDate: string;
  medium: string;
  department: string;
  culture: string;
  period: string;
  primaryImage: string;
  primaryImageSmall: string;
  objectURL: string;
  dimensions: string;
  creditLine: string;
  isPublicDomain: boolean;
}

/**
 * Search the Met Museum collection by keyword.
 */
export async function searchMetMuseum(
  query: string,
  limit: number = 10
): Promise<MetArtwork[]> {
  const searchRes = await fetch(
    `${MET_API}/search?hasImages=true&q=${encodeURIComponent(query)}`
  );
  if (!searchRes.ok) throw new Error(`Met search error: ${searchRes.status}`);
  const searchData = await searchRes.json();

  const objectIDs: number[] = (searchData.objectIDs || []).slice(0, limit);
  if (objectIDs.length === 0) return [];

  // Fetch object details in parallel (batched)
  const results = await Promise.allSettled(
    objectIDs.map(async (id) => {
      const res = await fetch(`${MET_API}/objects/${id}`);
      if (!res.ok) return null;
      return res.json();
    })
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<any> =>
        r.status === "fulfilled" && r.value && r.value.primaryImageSmall
    )
    .map((r) => {
      const d = r.value;
      return {
        objectID: d.objectID,
        title: d.title || "Untitled",
        artistDisplayName: d.artistDisplayName || "",
        objectDate: d.objectDate || "",
        medium: d.medium || "",
        department: d.department || "",
        culture: d.culture || "",
        period: d.period || "",
        primaryImage: d.primaryImage || "",
        primaryImageSmall: d.primaryImageSmall || "",
        objectURL: d.objectURL || "",
        dimensions: d.dimensions || "",
        creditLine: d.creditLine || "",
        isPublicDomain: d.isPublicDomain || false,
      };
    });
}

/**
 * Get artworks by department ID.
 * Departments: 1=American Decorative Arts, 3=Ancient Near Eastern Art,
 * 4=Arms and Armor, 5=Arts of Africa/Oceania/Americas, 6=Asian Art,
 * 10=Egyptian Art, 11=European Paintings, 13=Greek and Roman Art, etc.
 */
export async function searchMetByDepartment(
  departmentId: number,
  query: string,
  limit: number = 8
): Promise<MetArtwork[]> {
  const searchRes = await fetch(
    `${MET_API}/search?hasImages=true&departmentId=${departmentId}&q=${encodeURIComponent(query)}`
  );
  if (!searchRes.ok) throw new Error(`Met dept search error: ${searchRes.status}`);
  const searchData = await searchRes.json();

  const objectIDs: number[] = (searchData.objectIDs || []).slice(0, limit);
  if (objectIDs.length === 0) return [];

  const results = await Promise.allSettled(
    objectIDs.map(async (id) => {
      const res = await fetch(`${MET_API}/objects/${id}`);
      if (!res.ok) return null;
      return res.json();
    })
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<any> =>
        r.status === "fulfilled" && r.value && r.value.primaryImageSmall
    )
    .map((r) => {
      const d = r.value;
      return {
        objectID: d.objectID,
        title: d.title || "Untitled",
        artistDisplayName: d.artistDisplayName || "",
        objectDate: d.objectDate || "",
        medium: d.medium || "",
        department: d.department || "",
        culture: d.culture || "",
        period: d.period || "",
        primaryImage: d.primaryImage || "",
        primaryImageSmall: d.primaryImageSmall || "",
        objectURL: d.objectURL || "",
        dimensions: d.dimensions || "",
        creditLine: d.creditLine || "",
        isPublicDomain: d.isPublicDomain || false,
      };
    });
}
