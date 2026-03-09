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

export async function fetchOnThisDay(
  type: "events" | "births" | "deaths" = "events",
  limit = 6
): Promise<OnThisDayEvent[]> {
  const now = new Date();
  const month = String(now.getMonth() + 1);
  const day = String(now.getDate());
  const data = await callProxy("onthisday", { month, day, type });
  return (data as OnThisDayEvent[]).slice(0, limit);
}
