import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { slug, name, dateRange } = await req.json();
    if (!slug || !name) {
      return new Response(JSON.stringify({ error: "Missing slug or name" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check cache first
    const { data: cached } = await supabase
      .from("civilization_timelines")
      .select("events")
      .eq("civilization_slug", slug)
      .single();

    if (cached?.events && (cached.events as any[]).length > 0) {
      return new Response(JSON.stringify({ events: cached.events }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate with AI
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Generate a comprehensive historical timeline for "${name}" (${dateRange || "all periods"}).

Return EXACTLY a JSON array of objects with "year" and "event" fields. Include 25-35 events covering:
- Founding/origin events
- Major political changes (rulers, conquests, reforms)
- Cultural achievements (art, literature, architecture)
- Scientific/technological innovations
- Major battles and wars
- Religious/philosophical developments
- Economic milestones (trade routes, currency)
- Decline/fall events
- Key figures' births, deaths, or achievements

Rules:
- Events must be historically accurate and well-documented
- Use "BCE" suffix for dates before common era (e.g., "3100 BCE")
- Use "CE" suffix for dates in common era (e.g., "800 CE")
- Sort chronologically from earliest to latest
- Each event description should be 1-2 sentences, vivid and informative
- Do NOT include any markdown, code fences, or explanation — ONLY the JSON array

Example format:
[{"year":"3100 BCE","event":"Narmer unifies Upper and Lower Egypt, founding the First Dynasty and establishing Memphis as the capital."},{"year":"2560 BCE","event":"The Great Pyramid of Giza is completed for Pharaoh Khufu, standing 481 feet tall as the tallest structure in the world for over 3,800 years."}]`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a historian. Return ONLY valid JSON arrays, no markdown or explanation." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI error:", errText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    let content = aiData.choices?.[0]?.message?.content || "";

    // Strip markdown code fences if present
    content = content.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    let events: { year: string; event: string }[];
    try {
      events = JSON.parse(content);
      if (!Array.isArray(events)) throw new Error("Not an array");
    } catch (e) {
      console.error("Failed to parse AI response:", content.slice(0, 200));
      return new Response(JSON.stringify({ error: "Failed to parse timeline" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cache in database
    await supabase.from("civilization_timelines").upsert(
      { civilization_slug: slug, events, updated_at: new Date().toISOString() },
      { onConflict: "civilization_slug" }
    );

    return new Response(JSON.stringify({ events }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
