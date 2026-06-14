import { supabase } from "@/integrations/supabase/client";

export interface ContentItem {
  content_type: "wikipedia" | "historical_event" | "museum_artifact" | "civilization";
  source_id: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface SearchResult {
  id: string;
  content_type: string;
  source_id: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  rank: number;
}

export interface RAGSource {
  title: string;
  type: string;
  id: string;
}

export type ChatMode = "chat" | "summarize" | "compare" | "narrative";

export interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: RAGSource[];
}

// Embed content into the knowledge base
export async function embedContent(items: ContentItem[]): Promise<{ embedded: number; total: number }> {
  const { data, error } = await supabase.functions.invoke("embed-content", {
    body: { items },
  });
  if (error) throw new Error(error.message);
  return data;
}

// Search the knowledge base
export async function searchKnowledgeBase(
  query: string,
  limit = 10,
  contentTypes?: string[]
): Promise<{ results: SearchResult[]; context: string; count: number }> {
  const { data, error } = await supabase.functions.invoke("rag-search", {
    body: { query, limit, content_types: contentTypes || null },
  });
  if (error) throw new Error(error.message);
  return data;
}

// Stream RAG chat response
export async function streamRAGChat({
  messages,
  mode = "chat",
  onDelta,
  onSources,
  onDone,
  onError,
}: {
  messages: Message[];
  mode?: ChatMode;
  onDelta: (text: string) => void;
  onSources?: (sources: RAGSource[]) => void;
  onDone: () => void;
  onError?: (error: string) => void;
}): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/rag-chat`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        mode,
      }),
    });

    if (!response.ok || !response.body) {
      if (response.status === 429) {
        onError?.("Rate limit exceeded. Please wait a moment and try again.");
        return;
      }
      if (response.status === 402) {
        onError?.("Service unavailable. Please try again later.");
        return;
      }
      const text = await response.text();
      onError?.(text || "Failed to get response");
      return;
    }

    // Extract sources from header
    const sourcesHeader = response.headers.get("X-RAG-Sources");
    if (sourcesHeader && onSources) {
      try {
        const sources = JSON.parse(sourcesHeader) as RAGSource[];
        onSources(sources);
      } catch {
        // Ignore parse errors
      }
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    // Flush remaining
    if (buffer.trim()) {
      for (let raw of buffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          /* ignore */
        }
      }
    }

    onDone();
  } catch (err) {
    onError?.(err instanceof Error ? err.message : "Unknown error");
  }
}

// Helper to auto-embed Wikipedia content when fetched
export function createEmbeddableWikipedia(
  title: string,
  content: string,
  thumbnail?: string
): ContentItem {
  return {
    content_type: "wikipedia",
    source_id: title.replace(/\s+/g, "_"),
    title,
    content,
    metadata: { thumbnail },
  };
}

// Helper to auto-embed historical events
export function createEmbeddableEvent(
  year: string,
  event: string,
  source: string
): ContentItem {
  return {
    content_type: "historical_event",
    source_id: `${source}_${year}_${event.slice(0, 50)}`,
    title: `${year}: ${event.slice(0, 100)}`,
    content: event,
    metadata: { year, source },
  };
}

// Helper to auto-embed museum artifacts
export function createEmbeddableArtifact(
  objectId: string,
  title: string,
  description: string,
  museum: string,
  imageUrl?: string
): ContentItem {
  return {
    content_type: "museum_artifact",
    source_id: `${museum}_${objectId}`,
    title,
    content: description,
    metadata: { museum, imageUrl, objectId },
  };
}
