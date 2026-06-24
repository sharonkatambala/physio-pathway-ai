import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Turns computed posture metrics into a short, warm, plain-language coaching
 * note. The webcam video is NEVER sent here - only the derived numbers/issues.
 *
 * Provider order: Groq (OpenAI-compatible) if GROQ_API_KEY is set, else Gemini.
 * Any failure returns {coaching:null, fallback:true} and the client uses its
 * built-in rule-based coaching, so the feature works with or without a key.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (obj: unknown) =>
    new Response(JSON.stringify(obj), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    const { score, zone, mode, metrics, issues, language } = await req.json();
    const lang = language === 'sw' ? 'Swahili' : 'English';

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    const GROQ_MODEL = Deno.env.get('GROQ_MODEL') || 'llama-3.3-70b-versatile';
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-2.0-flash';

    if (!GROQ_API_KEY && !GEMINI_API_KEY) {
      return json({ coaching: null, fallback: true, reason: 'no-api-key' });
    }

    const issueText = Array.isArray(issues) ? issues.map((i: any) => `- ${i.en}`).join('\n') : '';
    const system = 'You are Ergocare AI, a warm, encouraging physiotherapy posture coach.';
    const user = `Write a SHORT coaching note (2-3 sentences, max ~60 words) in ${lang} for a ${mode} posture check.
Be supportive and specific; give one concrete action. Plain sentences only - no markdown, headings or lists. Use simple, plain English. Never use long dash or em dash characters; use commas, periods, or simple hyphens instead.

Posture score: ${score}/100 (${zone}).
Measured angles: neck/forward-head ${Math.round(metrics?.neckFlexion ?? 0)}°, trunk lean ${Math.round(metrics?.trunkFlexion ?? 0)}°${metrics?.kneeFlexion != null ? `, knee bend ${Math.round(metrics.kneeFlexion)}°` : ''}.
Detected issues:
${issueText || '- none'}`;

    const callGroq = async () => {
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
          temperature: 0.6,
          max_tokens: 160,
        }),
      });
      if (!resp.ok) throw new Error(`groq-${resp.status}: ${(await resp.text()).slice(0, 250)}`);
      const d = await resp.json();
      return d?.choices?.[0]?.message?.content?.trim() || null;
    };

    const callGemini = async () => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${system}\n\n${user}` }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 160 },
        }),
      });
      if (!resp.ok) throw new Error(`gemini-${resp.status}: ${(await resp.text()).slice(0, 250)}`);
      const d = await resp.json();
      return d?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join(' ').trim() || null;
    };

    let coaching: string | null = null;
    let provider = '';
    let reason = '';
    try {
      if (GROQ_API_KEY) { coaching = await callGroq(); provider = `groq:${GROQ_MODEL}`; }
      else { coaching = await callGemini(); provider = `gemini:${GEMINI_MODEL}`; }
    } catch (primaryErr) {
      reason = String((primaryErr as any)?.message || primaryErr);
      if (GROQ_API_KEY && GEMINI_API_KEY) {
        try { coaching = await callGemini(); provider = `gemini:${GEMINI_MODEL}`; reason = ''; }
        catch (backupErr) { reason += ' | ' + String((backupErr as any)?.message || backupErr); }
      }
    }

    return json({ coaching, provider, fallback: coaching === null, reason: coaching ? 'ok' : reason || 'empty-response' });
  } catch (e) {
    console.error('posture-coaching error', e);
    return json({ coaching: null, fallback: true, reason: `exception: ${String((e as any)?.message || e).slice(0, 200)}` });
  }
});
