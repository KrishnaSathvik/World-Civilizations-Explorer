import { supabase } from "@/integrations/supabase/client";

export interface HistoricalEvent {
  year: string;
  month: string;
  day: string;
  event: string;
}

export interface OnThisDayEvent {
  year: string;
  month: string;
  day: string;
  event: string;
}

async function callProxy(endpoint: string, params: Record<string, string>) {
  const { data, error } = await supabase.functions.invoke("api-ninjas-history", {
    body: { endpoint, params },
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchHistoricalEvents(text: string, limit = 10): Promise<HistoricalEvent[]> {
  const data = await callProxy("historicalevents", { text, offset: "0" });
  return (data as HistoricalEvent[]).slice(0, limit);
}

export interface DayInHistoryResponse {
  date: string;
  events: OnThisDayEvent[];
  births: OnThisDayEvent[];
  deaths: OnThisDayEvent[];
}

export async function fetchDayInHistory(): Promise<DayInHistoryResponse> {
  // Call without month/day params - free tier returns today's date automatically
  const data = await callProxy("dayinhistory", {});
  
  const parseItems = (items: { year: string; event: string }[] | undefined): OnThisDayEvent[] => {
    if (!items || !Array.isArray(items)) return [];
    return items.slice(0, 6).map((e) => ({
      year: e.year,
      month,
      day,
      event: e.event,
    }));
  };

  return {
    date: `${month}/${day}`,
    events: parseItems(data?.events),
    births: parseItems(data?.births),
    deaths: parseItems(data?.deaths),
  };
}
