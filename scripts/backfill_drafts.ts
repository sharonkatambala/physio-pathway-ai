/**
 * Simple backfill script to insert draft JSON into the drafts table or assessments as draft
 * Usage: SUPABASE_URL=... SUPABASE_KEY=... ts-node scripts/backfill_drafts.ts <path-to-json>
 */
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_KEY');
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const file = process.argv[2];
  if (!file) throw new Error('Provide path to JSON file');
  const raw = fs.readFileSync(file, 'utf8');
  const json = JSON.parse(raw);
  const userId = json.user_id || json.patient_user_id;
  if (!userId) throw new Error('JSON must contain user_id or patient_user_id');
  try {
    const { error } = await supabase.from('drafts').upsert({ user_id: userId, data: json, updated_at: new Date().toISOString() });
    if (error) {
      console.error('Drafts upsert failed, trying assessments fallback', error.message || error);
      const { error: e2 } = await supabase.from('assessments').upsert({ patient_user_id: userId, data: json, status: 'draft', updated_at: new Date().toISOString() });
      if (e2) throw e2;
    }
    console.log('Backfill complete');
  } catch (e) {
    console.error('Backfill failed', e);
    process.exit(1);
  }
}

main();
