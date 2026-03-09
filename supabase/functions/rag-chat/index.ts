import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface SearchResult {
  title: string;
  content: string;
  content_type: string;
  source_id: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode = "chat" } = (await req.json()) as {
      messages: Message[];
      mode?: "chat" | "summarize" | "compare" | "narrative";
    };

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the last user message for RAG search
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    let ragContext = "";
    let sources: { title: string; type: string; id: string }[] = [];

    if (lastUserMessage) {
      // Search for relevant content
      const { data: searchResults, error: searchError } = await supabase.rpc("search_content", {
        query_text: lastUserMessage.content,
        match_count: 8,
        content_types: null,
      });

      if (!searchError && searchResults && searchResults.length > 0) {
        const results = searchResults as SearchResult[];
        sources = results.map((r) => ({
          title: r.title,
          type: r.content_type,
          id: r.source_id,
        }));

        ragContext = results
          .map(
            (r, i) =>
              `[Source ${i + 1}: ${r.title}]\n${r.content.slice(0, 1200)}`
          )
          .join("\n\n---\n\n");
      }
    }

    // Build system prompt based on mode
    let systemPrompt = "";
    switch (mode) {
      case "summarize":
        systemPrompt = `You are a scholarly historian specializing in ancient civilizations. Create a comprehensive article summary based on the provided sources. Structure your response with clear sections, cite sources when making claims, and maintain an academic yet accessible tone.

SOURCES:
${ragContext || "No sources available. Provide a general response."}

Instructions:
- Synthesize information from multiple sources
- Include key dates, figures, and events
- Note any conflicting information between sources
- End with suggestions for further reading`;
        break;

      case "compare":
        systemPrompt = `You are a comparative historian. Create a detailed comparison essay based on the provided sources. Analyze similarities, differences, and historical connections.

SOURCES:
${ragContext || "No sources available. Provide a general response."}

Instructions:
- Structure as a formal comparison essay
- Use evidence from sources to support claims
- Discuss cultural, political, economic, and social dimensions
- Include a balanced conclusion`;
        break;

      case "narrative":
        systemPrompt = `You are a historical storyteller. Transform the provided timeline and events into an engaging narrative. Make history come alive while maintaining accuracy.

SOURCES:
${ragContext || "No sources available. Provide a general response."}

Instructions:
- Write in flowing narrative prose
- Include vivid descriptions and context
- Connect events causally
- Maintain historical accuracy while being engaging`;
        break;

      default:
        systemPrompt = `You are a knowledgeable historian and expert on world civilizations. Answer questions accurately using the provided source material when available. Always cite your sources.

${ragContext ? `RELEVANT SOURCES:\n${ragContext}\n\nUse these sources to ground your response. Cite [Source N] when referencing specific information.` : "No specific sources found. Provide a helpful response based on your knowledge, but note that this is general knowledge."}

Guidelines:
- Be accurate and scholarly but accessible
- Cite sources when available
- Acknowledge uncertainty when appropriate
- Suggest related topics the user might explore`;
    }

    // Call Lovable AI with streaming
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return stream with sources metadata in a custom header
    const headers = new Headers(corsHeaders);
    headers.set("Content-Type", "text/event-stream");
    headers.set("X-RAG-Sources", JSON.stringify(sources));

    return new Response(response.body, { headers });
  } catch (err) {
    console.error("rag-chat error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
