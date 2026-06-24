-- ============================================================================
-- Video ergonomic assessment — stores DERIVED posture data only.
--
-- Privacy by design: raw webcam video and frames never leave the device and
-- are never stored. We persist only numeric scores/angles + an optional jsonb
-- breakdown, so this table holds no biometric imagery.
-- ============================================================================

create table if not exists public.posture_sessions (
  id uuid primary key default gen_random_uuid(),
  patient_user_id text not null,
  created_at timestamptz default now(),
  mode text,                 -- 'assessment' | 'live'
  posture_mode text,         -- 'seated' | 'standing'
  duration_seconds int,
  overall_score numeric,     -- 0-100 (higher = better)
  pct_good_posture numeric,  -- live mode: % of time in the "good" zone
  avg_neck_flexion numeric,
  avg_trunk_flexion numeric,
  avg_shoulder_tilt numeric,
  metrics jsonb
);

create index if not exists idx_posture_sessions_patient_user_id
  on public.posture_sessions(patient_user_id);

alter table if exists public.posture_sessions enable row level security;

-- Patients manage their own sessions.
drop policy if exists "posture_insert_own" on public.posture_sessions;
create policy "posture_insert_own" on public.posture_sessions
  for insert with check (patient_user_id::text = auth.uid()::text);

drop policy if exists "posture_select_own" on public.posture_sessions;
create policy "posture_select_own" on public.posture_sessions
  for select using (patient_user_id::text = auth.uid()::text);

-- Assigned physiotherapists can read their patients' sessions
-- (same helper used by progress_entries / assessments).
drop policy if exists "posture_select_physio" on public.posture_sessions;
create policy "posture_select_physio" on public.posture_sessions
  for select using (public.is_my_patient_user(patient_user_id::text));
