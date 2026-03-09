import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SearchResult {
  id: string;
  content_type: string;
  source_id: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  rank: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, limit = 10, content_types = null } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Use the search_content function for full-text search
    const { data, error } = await supabase.rpc("search_content", {
      query_text: query,
      match_count: limit,
      content_types: content_types,
    });

    if (error) {
      console.error("Search error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = (data as SearchResult[]) || [];

    // Format context for RAG
    const context = results
      .map(
        (r, i) =>
          `[Source ${i + 1}: ${r.title} (${r.content_type})]\n${r.content.slice(0, 1500)}`
      )
      .join("\n\n---\n\n");

    return new Response(
      JSON.stringify({
        results,
        context,
        count: results.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("rag-search error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
