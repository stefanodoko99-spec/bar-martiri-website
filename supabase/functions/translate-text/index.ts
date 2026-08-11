// Deploy with: supabase functions deploy translate-text
// Secret required (set once): supabase secrets set DEEPL_API_KEY=your-key-here
//
// Called from admin.js whenever a product or the Our Story text is saved in
// Albanian only. Translates it to Italian and English via DeepL, so the API
// key never touches the browser. Free-tier DeepL keys end in ":fx" and use a
// different host than paid keys — detected automatically below.
//
// Requires the caller to be signed in as the admin (checked via the same
// is_menu_admin() used by every other admin-only table), so a stranger who
// finds this URL can't spend the site's DeepL quota.

import { createClient } from 'npm:@supabase/supabase-js@2';

const DEEPL_API_KEY = Deno.env.get('DEEPL_API_KEY') ?? '';
const DEEPL_HOST = DEEPL_API_KEY.endsWith(':fx') ? 'api-free.deepl.com' : 'api.deepl.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  }
  if (!DEEPL_API_KEY) {
    return new Response(JSON.stringify({ error: 'DEEPL_API_KEY secret is not set' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const callerClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: isAdmin, error: adminCheckError } = await callerClient.rpc('is_menu_admin');
  if (adminCheckError || !isAdmin) {
    return new Response(JSON.stringify({ error: 'Not authorized' }), {
      status: 403,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const { texts, targetLangs } = await req.json().catch(() => ({}));
  if (!Array.isArray(texts) || !texts.length || !Array.isArray(targetLangs) || !targetLangs.length) {
    return new Response(JSON.stringify({ error: 'Expected { texts: string[], targetLangs: string[] }' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Empty strings translate to empty strings without spending a DeepL call.
  const nonEmpty = texts.map((text: string) => String(text || ''));
  const hasContent = nonEmpty.some((text) => text.trim());
  if (!hasContent) {
    const empty: Record<string, string[]> = {};
    for (const lang of targetLangs) empty[lang] = nonEmpty.map(() => '');
    return new Response(JSON.stringify({ translations: empty }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const results: Record<string, string[]> = {};
    for (const targetLang of targetLangs) {
      const response = await fetch(`https://${DEEPL_HOST}/v2/translate`, {
        method: 'POST',
        headers: {
          Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: nonEmpty,
          source_lang: 'SQ',
          target_lang: targetLang,
        }),
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error(`DeepL ${targetLang} request failed (${response.status}): ${detail}`);
      }
      const data = await response.json();
      results[targetLang] = data.translations.map((item: { text: string }) => item.text);
    }

    return new Response(JSON.stringify({ translations: results }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 502,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
