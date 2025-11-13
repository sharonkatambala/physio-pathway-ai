import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const requiredTables = ['assessments','recommendations','progress_entries','physio_videos','exercise_programs'];

const AdminStatus = () => {
  const [status, setStatus] = useState<Record<string, { ok: boolean; error?: string }>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const check = async () => {
      setLoading(true);
      const results: any = {};
      for (const t of requiredTables) {
        try {
          // cast to the union of table names so TypeScript accepts the call
          const { error } = await supabase.from(t as any).select('id').limit(0);
          if (error) results[t] = { ok: false, error: String(error.message || error) };
          else results[t] = { ok: true };
        } catch (e: any) {
          results[t] = { ok: false, error: String(e?.message || e) };
        }
      }
      setStatus(results);
      setLoading(false);
    };

    check();
  }, []);

  const combinedSQL = `-- Combined migration (assessments + recommendations + progress_entries + physio_videos + exercise_programs)\n` +
`create extension if not exists pgcrypto;\n\n` +
`create table if not exists assessments (\n  id uuid primary key default gen_random_uuid(),\n  patient_user_id text not null,\n  created_at timestamptz default now(),\n  updated_at timestamptz default now(),\n  language text default 'en',\n  region text,\n  chronicity text,\n  pain_level int,\n  functional_score int,\n  red_flag boolean default false,\n  data jsonb\n);\ncreate index if not exists idx_assessments_patient_user_id on assessments(patient_user_id);\n\n` +
`create table if not exists recommendations (\n  id uuid primary key default gen_random_uuid(),\n  assessment_id uuid references assessments(id) on delete cascade,\n  created_at timestamptz default now(),\n  program jsonb,\n  confidence numeric,\n  source text default 'ai'\n);\n\n` +
`create table if not exists progress_entries (\n  id uuid primary key default gen_random_uuid(),\n  patient_user_id text not null,\n  created_at timestamptz default now(),\n  pain_level int,\n  completed_exercises_count int,\n  notes text,\n  data jsonb\n);\ncreate index if not exists idx_progress_patient_user_id on progress_entries(patient_user_id);\n\n` +
`create table if not exists physio_videos (\n  id uuid primary key default gen_random_uuid(),\n  physio_user_id text not null,\n  patient_user_id text,\n  uploaded_at timestamptz default now(),\n  caption text,\n  storage_url text,\n  visibility text default 'assigned'\n);\n\n` +
`create table if not exists exercise_programs (\n  id uuid primary key default gen_random_uuid(),\n  title text,\n  created_by text,\n  created_at timestamptz default now(),\n  program jsonb\n);\n`;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Supabase status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <div>Checking database...</div>}
            {!loading && (
              <div className="space-y-3">
                {requiredTables.map(t => (
                  <div key={t} className="flex items-center justify-between border p-3 rounded">
                    <div className="font-medium">{t}</div>
                    <div>{status[t]?.ok ? <span className="text-green-600">OK</span> : <span className="text-red-600">Missing: {status[t]?.error}</span>}</div>
                  </div>
                ))}

                <div className="mt-4">
                  <div className="text-sm text-muted-foreground">Copy & paste this SQL into your Supabase SQL editor to create missing tables.</div>
                  <pre className="mt-2 p-3 bg-muted rounded text-sm whitespace-pre-wrap">{combinedSQL}</pre>
                  <div className="mt-2 flex gap-2">
                    <Button onClick={() => navigator.clipboard?.writeText(combinedSQL)}>Copy SQL</Button>
                    <Button variant="outline" onClick={() => location.reload()}>Re-check</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStatus;
