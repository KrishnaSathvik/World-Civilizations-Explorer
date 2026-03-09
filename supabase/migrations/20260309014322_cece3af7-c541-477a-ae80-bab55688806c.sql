-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create content_embeddings table for RAG knowledge base
CREATE TABLE public.content_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding vector(768),
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(content_type, source_id)
);

-- Enable RLS
ALTER TABLE public.content_embeddings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Content embeddings are publicly readable"
ON public.content_embeddings FOR SELECT USING (true);

-- Service role can manage
CREATE POLICY "Service role can manage content embeddings"
ON public.content_embeddings FOR ALL
USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX idx_content_embeddings_search ON public.content_embeddings USING GIN(search_vector);
CREATE INDEX idx_content_embeddings_type ON public.content_embeddings(content_type);

-- Search function
CREATE OR REPLACE FUNCTION public.search_content(
  query_text TEXT,
  match_count INT DEFAULT 10,
  content_types TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content_type TEXT,
  source_id TEXT,
  title TEXT,
  content TEXT,
  metadata JSONB,
  rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ce.id,
    ce.content_type,
    ce.source_id,
    ce.title,
    ce.content,
    ce.metadata,
    ts_rank(ce.search_vector, websearch_to_tsquery('english', query_text)) AS rank
  FROM public.content_embeddings ce
  WHERE 
    ce.search_vector @@ websearch_to_tsquery('english', query_text)
    AND (content_types IS NULL OR ce.content_type = ANY(content_types))
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_content_embeddings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_content_embeddings_timestamp
BEFORE UPDATE ON public.content_embeddings
FOR EACH ROW EXECUTE FUNCTION public.update_content_embeddings_updated_at();