import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContentItem {
  content_type: "wikipedia" | "historical_event" | "museum_artifact" | "civilization";
  source_id: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items } = (await req.json()) as { items: ContentItem[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for insert operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const results: { source_id: string; success: boolean; error?: string }[] = [];

    for (const item of items) {
      try {
        // Truncate content to reasonable size for storage
        const truncatedContent = item.content.slice(0, 10000);

        const { error } = await supabase.from("content_embeddings").upsert(
          {
            content_type: item.content_type,
            source_id: item.source_id,
            title: item.title,
            content: truncatedContent,
            metadata: item.metadata || {},
          },
          { onConflict: "content_type,source_id" }
        );

        if (error) {
          results.push({ source_id: item.source_id, success: false, error: error.message });
        } else {
          results.push({ source_id: item.source_id, success: true });
        }
      } catch (err) {
        results.push({
          source_id: item.source_id,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return new Response(
      JSON.stringify({
        embedded: successCount,
        total: items.length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("embed-content error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
