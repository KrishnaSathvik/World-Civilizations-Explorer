
CREATE TABLE public.civilization_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  civilization_slug TEXT NOT NULL UNIQUE,
  events JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Allow public read access (no auth needed for viewing)
ALTER TABLE public.civilization_timelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read timelines"
  ON public.civilization_timelines
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Service role can insert/update (edge function uses service role)
CREATE POLICY "Service role can manage timelines"
  ON public.civilization_timelines
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
