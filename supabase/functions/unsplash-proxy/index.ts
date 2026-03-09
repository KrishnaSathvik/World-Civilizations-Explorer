const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessKey = Deno.env.get("UNSPLASH_ACCESS_KEY");
    if (!accessKey) {
      return new Response(JSON.stringify({ error: "UNSPLASH_ACCESS_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { query, per_page = 8, orientation = "landscape" } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const params = new URLSearchParams({
      query,
      per_page: String(per_page),
      orientation,
      content_filter: "high",
    });

    const response = await fetch(
      `https://api.unsplash.com/search/photos?${params.toString()}`,
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Unsplash API error:", response.status, text);
      return new Response(JSON.stringify({ error: `Unsplash error: ${response.status}` }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();

    // Return simplified results
    const photos = (data.results || []).map((photo: any) => ({
      id: photo.id,
      description: photo.description || photo.alt_description || "",
      urls: {
        raw: photo.urls?.raw,
        full: photo.urls?.full,
        regular: photo.urls?.regular,
        small: photo.urls?.small,
        thumb: photo.urls?.thumb,
      },
      user: {
        name: photo.user?.name || "",
        username: photo.user?.username || "",
        link: photo.user?.links?.html || "",
      },
      links: {
        html: photo.links?.html || "",
        download: photo.links?.download_location || "",
      },
      color: photo.color,
      width: photo.width,
      height: photo.height,
    }));

    return new Response(JSON.stringify({ photos, total: data.total || 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("unsplash-proxy error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
