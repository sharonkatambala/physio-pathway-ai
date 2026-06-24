import { supabase } from '@/integrations/supabase/client';
import type { PostureMode, PostureResult } from './ergonomics';

/**
 * Rich, rule-based coaching that works offline and for free. Combines the
 * score, the top issues and an encouraging close into a short paragraph.
 */
export function localCoaching(result: PostureResult, mode: PostureMode, lang: 'en' | 'sw'): string {
  const sw = lang === 'sw';
  const opener = result.zone === 'good'
    ? sw
      ? `Mkao mzuri - alama yako ni ${result.score}/100.`
      : `Great posture - you scored ${result.score}/100.`
    : result.zone === 'fair'
      ? sw
        ? `Si mbaya - alama yako ni ${result.score}/100, lakini kuna nafasi ya kuboresha.`
        : `Not bad - you scored ${result.score}/100, with room to improve.`
      : sw
        ? `Mkao wako unahitaji marekebisho - alama yako ni ${result.score}/100.`
        : `Your posture needs attention - you scored ${result.score}/100.`;

  const tips = result.issues.slice(0, 2).map((i) => (sw ? i.sw : i.en));
  const body = tips.length
    ? ' ' + tips.join(' ')
    : sw
      ? ' Endelea hivyo na kumbuka kupumzika mara kwa mara.'
      : ' Keep it up and remember to take regular movement breaks.';

  const close = result.zone === 'good'
    ? ''
    : sw
      ? ' Pima tena baada ya kurekebisha ili kuona maendeleo.'
      : ' Re-check after adjusting to see your improvement.';

  return `${opener}${body}${close}`;
}

/**
 * Returns coaching text. Tries the Gemini-backed `posture-coaching` edge
 * function for a richer note; if it isn't deployed / has no key / errors,
 * falls back to {@link localCoaching}. Never throws.
 */
export async function fetchCoaching(result: PostureResult, mode: PostureMode, lang: 'en' | 'sw'): Promise<string> {
  const local = localCoaching(result, mode, lang);
  try {
    const { data, error } = await supabase.functions.invoke('posture-coaching', {
      body: {
        score: result.score,
        zone: result.zone,
        mode,
        metrics: result.metrics,
        issues: result.issues.map((i) => ({ key: i.key, en: i.en, sw: i.sw })),
        language: lang,
      },
    });
    if (!error && data && (data as any).coaching) {
      return String((data as any).coaching);
    }
  } catch {
    /* edge function unavailable - use local coaching */
  }
  return local;
}
