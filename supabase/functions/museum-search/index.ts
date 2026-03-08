const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, limit = 10, source } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: any = { success: true, data: {} };

    // Smithsonian
    if (!source || source === 'smithsonian') {
      const siKey = Deno.env.get('SMITHSONIAN_API_KEY');
      if (siKey) {
        try {
          const siRes = await fetch(
            `https://api.si.edu/openaccess/api/v1.0/search?q=${encodeURIComponent(query)}&rows=${limit}&api_key=${siKey}`
          );
          if (siRes.ok) {
            const siData = await siRes.json();
            results.data.smithsonian = (siData.response?.rows || []).map((row: any) => {
              const content = row.content || {};
              const desc = content.descriptiveNonRepeating || {};
              const freetext = content.freetext || {};
              const indexedStructured = content.indexedStructured || {};
              const media = desc.online_media?.media || [];
              const thumb = media.find((m: any) => m.thumbnail)?.thumbnail || media[0]?.content || '';
              return {
                id: row.id || '',
                title: desc.title?.content || row.title || '',
                unitCode: desc.unit_code || '',
                type: indexedStructured?.object_type?.[0] || '',
                date: indexedStructured?.date?.[0] || '',
                place: indexedStructured?.place?.[0] || '',
                topic: indexedStructured?.topic?.[0] || '',
                imageUrl: thumb,
                notes: (freetext.notes || []).map((n: any) => n.content).join('; ').slice(0, 300),
                link: desc.record_link || desc.guid || '',
              };
            }).filter((item: any) => item.imageUrl);
          }
        } catch (e) {
          console.error('Smithsonian error:', e);
          results.data.smithsonian = [];
        }
      }
    }

    // Harvard Art Museums
    if (!source || source === 'harvard') {
      const harvardKey = Deno.env.get('HARVARD_ART_API_KEY');
      if (harvardKey) {
        try {
          const harvRes = await fetch(
            `https://api.harvardartmuseums.org/object?apikey=${harvardKey}&q=${encodeURIComponent(query)}&hasimage=1&size=${limit}&fields=objectid,title,dated,classification,culture,period,primaryimageurl,url,people,medium,dimensions`
          );
          if (harvRes.ok) {
            const harvData = await harvRes.json();
            results.data.harvard = (harvData.records || []).map((r: any) => ({
              id: r.objectid,
              title: r.title || 'Untitled',
              date: r.dated || '',
              classification: r.classification || '',
              culture: r.culture || '',
              period: r.period || '',
              medium: r.medium || '',
              imageUrl: r.primaryimageurl || '',
              url: r.url || '',
              artist: r.people?.[0]?.name || '',
            })).filter((item: any) => item.imageUrl);
          }
        } catch (e) {
          console.error('Harvard error:', e);
          results.data.harvard = [];
        }
      }
    }

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Museum search error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
