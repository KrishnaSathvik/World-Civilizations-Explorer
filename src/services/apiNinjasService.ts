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

export async function fetchOnThisDay(limit = 6): Promise<OnThisDayEvent[]> {
  const now = new Date();
  const month = String(now.getMonth() + 1);
  const day = String(now.getDate());
  // dayinhistory returns a single object with events, births, deaths arrays
  const data = await callProxy("dayinhistory", { month, day });
  
  // Handle the response format from API Ninjas
  if (Array.isArray(data)) {
    return data.slice(0, limit);
  }
  // If it's the object format with events array
  if (data?.events && Array.isArray(data.events)) {
    return data.events.slice(0, limit).map((e: { year: string; event: string }) => ({
      year: e.year,
      month,
      day,
      event: e.event,
    }));
  }
  return [];
}
