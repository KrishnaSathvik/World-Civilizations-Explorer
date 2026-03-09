import { useEffect, useRef } from "react";
import { embedContent, type ContentItem } from "@/services/ragService";

// Queue to batch embed requests
let embedQueue: ContentItem[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function flushQueue() {
  if (embedQueue.length === 0) return;
  const items = [...embedQueue];
  embedQueue = [];
  
  // Fire and forget - don't block the UI
  embedContent(items).catch((err) => {
    console.warn("Auto-embed failed:", err);
  });
}

function scheduleFlush() {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flushQueue, 2000); // Batch every 2s
}

export function queueForEmbedding(item: ContentItem) {
  // Deduplicate by source_id
  if (embedQueue.some((q) => q.source_id === item.source_id && q.content_type === item.content_type)) {
    return;
  }
  embedQueue.push(item);
  scheduleFlush();
}

// Hook to auto-embed Wikipedia content when it loads
export function useAutoEmbed(data: { title?: string; extract?: string; thumbnail?: { source?: string } } | undefined) {
  const embeddedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!data?.title || !data?.extract) return;
    if (embeddedRef.current === data.title) return; // Already queued
    
    embeddedRef.current = data.title;
    queueForEmbedding({
      content_type: "wikipedia",
      source_id: data.title.replace(/\s+/g, "_"),
      title: data.title,
      content: data.extract,
      metadata: { thumbnail: data.thumbnail?.source },
    });
  }, [data?.title, data?.extract, data?.thumbnail?.source]);
}
