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
