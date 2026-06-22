-- ============================================================================
-- Correct RLS for assessments / recommendations / progress_entries.
--
-- The original 20251021001000 migration used `CREATE POLICY IF NOT EXISTS`
-- (invalid in Postgres) and compared profile ids to auth uids, so physios could
-- never see assigned patients' assessments.
--
-- These tables key the patient by their AUTH user id (column patient_user_id).
-- Depending on how the live schema was created that column may be `text` OR
-- `uuid`, so every comparison casts BOTH sides to ::text to stay type-safe
-- (avoids "operator does not exist: uuid = text").
--
-- Run this AFTER 20260620010000_fix_rls_recursion_and_wiring.sql.
-- ============================================================================

-- Helper: is the given patient (by auth uid) one of the caller's patients?
create or replace function public.is_my_patient_user(_patient_user_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.physio_patient_assignments ppa
    join public.profiles pat on pat.id = ppa.patient_id
    join public.profiles me  on me.id  = ppa.physio_id
    where pat.user_id::text = _patient_user_id
      and me.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.appointments a
    join public.profiles pat on pat.id = a.patient_id
    join public.profiles me  on me.id  = a.physiotherapist_id
    where pat.user_id::text = _patient_user_id
      and me.user_id = auth.uid()
  )
$$;

grant execute on function public.is_my_patient_user(text) to authenticated;

alter table if exists public.assessments      enable row level security;
alter table if exists public.recommendations  enable row level security;
alter table if exists public.progress_entries enable row level security;

-- assessments --------------------------------------------------------------
drop policy if exists "patients_insert_own_assessment"     on public.assessments;
create policy "patients_insert_own_assessment" on public.assessments
  for insert with check (patient_user_id::text = auth.uid()::text);

drop policy if exists "patients_select_own_assessment"     on public.assessments;
create policy "patients_select_own_assessment" on public.assessments
  for select using (patient_user_id::text = auth.uid()::text);

drop policy if exists "patients_update_own_assessment"     on public.assessments;
create policy "patients_update_own_assessment" on public.assessments
  for update using (patient_user_id::text = auth.uid()::text);

drop policy if exists "physio_select_assigned_assessments" on public.assessments;
create policy "physio_select_assigned_assessments" on public.assessments
  for select using (public.is_my_patient_user(patient_user_id::text));

-- recommendations (linked to an assessment) --------------------------------
drop policy if exists "recommendations_select_patient" on public.recommendations;
create policy "recommendations_select_patient" on public.recommendations
  for select using (
    exists (
      select 1 from public.assessments a
      where a.id = recommendations.assessment_id
        and a.patient_user_id::text = auth.uid()::text
    )
  );

drop policy if exists "recommendations_select_physio" on public.recommendations;
create policy "recommendations_select_physio" on public.recommendations
  for select using (
    exists (
      select 1 from public.assessments a
      where a.id = recommendations.assessment_id
        and public.is_my_patient_user(a.patient_user_id::text)
    )
  );

-- progress_entries ---------------------------------------------------------
drop policy if exists "progress_insert_own" on public.progress_entries;
create policy "progress_insert_own" on public.progress_entries
  for insert with check (patient_user_id::text = auth.uid()::text);

drop policy if exists "progress_select_own" on public.progress_entries;
create policy "progress_select_own" on public.progress_entries
  for select using (patient_user_id::text = auth.uid()::text);

drop policy if exists "progress_select_physio" on public.progress_entries;
create policy "progress_select_physio" on public.progress_entries
  for select using (public.is_my_patient_user(patient_user_id::text));
