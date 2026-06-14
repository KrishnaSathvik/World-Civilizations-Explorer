import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Public, client-safe values. The publishable (anon) key is designed to be
// shipped to the browser; never put the service-role key here.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = process.env
  .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

const isBrowser = typeof window !== "undefined";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    // localStorage is only available in the browser; avoid touching it during SSR.
    storage: isBrowser ? window.localStorage : undefined,
    persistSession: isBrowser,
    autoRefreshToken: isBrowser,
  },
});
