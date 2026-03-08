const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

export interface CommonsImage {
  title: string;
  source: string;
  thumbUrl: string;
  width: number;
  height: number;
  description?: string;
  license?: string;
}

/**
 * Search Wikimedia Commons for images by keyword/category.
 * Returns higher-quality, better-categorized results than Wikipedia's image list.
 */
export async function searchCommonsImages(
  query: string,
  limit: number = 12
): Promise<CommonsImage[]> {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrnamespace: "6", // File namespace
    gsrsearch: `${query} filetype:bitmap`,
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: "400",
    format: "json",
    origin: "*",
  });

  const res = await fetch(`${COMMONS_API}?${params}`);
  if (!res.ok) throw new Error(`Commons API error: ${res.status}`);
  const data = await res.json();

  const pages = data.query?.pages || {};
  return Object.values(pages)
    .map((p: any) => {
      const info = p.imageinfo?.[0];
      if (!info) return null;
      const ext = info.extmetadata || {};
      return {
        title: (p.title || "").replace("File:", "") as string,
        source: (info.url || "") as string,
        thumbUrl: (info.thumburl || info.url || "") as string,
        width: (info.width || 0) as number,
        height: (info.height || 0) as number,
        description: ext.ImageDescription?.value?.replace(/<[^>]*>/g, "") as string | undefined,
        license: ext.LicenseShortName?.value as string | undefined,
      } as CommonsImage | null;
    })
    .filter(
      (img): img is CommonsImage =>
        !!img && !!img.source && img.width > 200 && img.height > 200
    );
}

/**
 * Fetch images from a specific Wikimedia Commons category.
 */
export async function fetchCommonsCategoryImages(
  category: string,
  limit: number = 12
): Promise<CommonsImage[]> {
  const params = new URLSearchParams({
    action: "query",
    generator: "categorymembers",
    gcmtitle: `Category:${category}`,
    gcmtype: "file",
    gcmlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: "400",
    format: "json",
    origin: "*",
  });

  const res = await fetch(`${COMMONS_API}?${params}`);
  if (!res.ok) throw new Error(`Commons category API error: ${res.status}`);
  const data = await res.json();

  const pages = data.query?.pages || {};
  return Object.values(pages)
    .map((p: any) => {
      const info = p.imageinfo?.[0];
      if (!info) return null;
      const ext = info.extmetadata || {};
      return {
        title: (p.title || "").replace("File:", ""),
        source: info.url || "",
        thumbUrl: info.thumburl || info.url || "",
        width: info.width || 0,
        height: info.height || 0,
        description: ext.ImageDescription?.value?.replace(/<[^>]*>/g, ""),
        license: ext.LicenseShortName?.value,
      };
    })
    .filter(
      (img): img is CommonsImage =>
        !!img && !!img.source && img.width > 200 && img.height > 200
    );
}
