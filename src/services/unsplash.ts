import { supabase } from "@/integrations/supabase/client";

export interface UnsplashPhoto {
  id: string;
  description: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
    link: string;
  };
  links: {
    html: string;
    download: string;
  };
  color: string;
  width: number;
  height: number;
}

export async function searchUnsplashPhotos(
  query: string,
  perPage = 8,
  orientation: "landscape" | "portrait" | "squarish" = "landscape"
): Promise<UnsplashPhoto[]> {
  const { data, error } = await supabase.functions.invoke("unsplash-proxy", {
    body: { query, per_page: perPage, orientation },
  });

  if (error) throw new Error(error.message);
  return data?.photos || [];
}
