const WIKI_API = "https://en.wikipedia.org/api/rest_v1";

export interface WikiSummary {
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  originalimage?: {
    source: string;
    width: number;
    height: number;
  };
  content_urls: {
    desktop: { page: string };
  };
}

export async function fetchWikipediaSummary(title: string): Promise<WikiSummary> {
  const res = await fetch(`${WIKI_API}/page/summary/${encodeURIComponent(title)}`);
  if (!res.ok) throw new Error(`Wikipedia API error: ${res.status}`);
  return res.json();
}

export interface WikiImage {
  title: string;
  source: string;
  width: number;
  height: number;
}

export async function fetchWikipediaImages(title: string): Promise<WikiImage[]> {
  const res = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=images&imlimit=20&format=json&origin=*`
  );
  if (!res.ok) throw new Error(`Wikipedia images API error: ${res.status}`);
  const data = await res.json();
  const pages = data.query?.pages || {};
  const page = Object.values(pages)[0] as any;
  const imageNames: string[] = (page?.images || [])
    .map((img: any) => img.title)
    .filter((t: string) => /\.(jpg|jpeg|png|gif|svg)$/i.test(t))
    .filter((t: string) => !t.includes("Commons-logo") && !t.includes("Icon") && !t.includes("Flag"))
    .slice(0, 8);

  // Fetch actual image URLs
  if (imageNames.length === 0) return [];
  const infoRes = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&titles=${imageNames.map(encodeURIComponent).join("|")}&prop=imageinfo&iiprop=url|size&format=json&origin=*`
  );
  if (!infoRes.ok) return [];
  const infoData = await infoRes.json();
  const infoPages = infoData.query?.pages || {};
  return Object.values(infoPages)
    .map((p: any) => ({
      title: p.title?.replace("File:", "") || "",
      source: p.imageinfo?.[0]?.url || "",
      width: p.imageinfo?.[0]?.width || 0,
      height: p.imageinfo?.[0]?.height || 0,
    }))
    .filter((img: WikiImage) => img.source && img.width > 100);
}

export interface HistoryEvent {
  year: string;
  text: string;
  links: Array<{ title: string; link: string }>;
}

export interface TodayInHistory {
  date: string;
  events: HistoryEvent[];
}

export async function fetchTodayInHistory(): Promise<TodayInHistory> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const res = await fetch(`https://history.muffinlabs.com/date/${month}/${day}`);
  if (!res.ok) throw new Error(`History API error: ${res.status}`);
  const data = await res.json();

  return {
    date: data.date,
    events: (data.data?.Events || []).slice(0, 6).map((e: any) => ({
      year: e.year,
      text: e.text,
      links: e.links || [],
    })),
  };
}
