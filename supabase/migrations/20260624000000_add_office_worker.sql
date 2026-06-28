-- ============================================================================
-- Office worker (Model A): individual self-serve account type.
--
-- Each office worker has their own login and their own private data, exactly
-- like a patient. This adds the role plus two small tables: an office profile
-- (onboarding answers + reminder prefs) and ROSA/OSHA-style workstation
-- self-assessments. Camera posture data continues to use posture_sessions.
--
-- Run the ALTER TYPE statement first on its own, then the rest.
-- ============================================================================

-- 1. New role value on the existing enum.
alter type public.user_role add value if not exists 'office_worker';

-- 2. Office worker profile (onboarding + reminder preferences).
create table if not exists public.office_profiles (
  user_id text primary key,
  desk_hours_per_day int,
  sitting_streak_minutes int,        -- typical minutes sitting before a break
  pain_areas text[],                 -- e.g. {neck, back, shoulder, wrist}
  uses_standing_desk boolean default false,
  reminder_interval_min int default 45,
  reminders_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.office_profiles enable row level security;
drop policy if exists "office_profiles_rw_own" on public.office_profiles;
create policy "office_profiles_rw_own" on public.office_profiles
  for all
  using (user_id::text = auth.uid()::text)
  with check (user_id::text = auth.uid()::text);

-- 3. Workstation (ROSA/OSHA-style) self-assessments.
create table if not exists public.ergonomic_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  created_at timestamptz default now(),
  risk_score numeric,        -- 0-10 (higher = more strain)
  zone text,                 -- good | fair | poor
  chair_score numeric,
  monitor_score numeric,
  peripherals_score numeric,
  habits_score numeric,
  answers jsonb,
  tips jsonb
);

create index if not exists idx_ergo_user on public.ergonomic_assessments(user_id);

alter table public.ergonomic_assessments enable row level security;
drop policy if exists "ergo_rw_own" on public.ergonomic_assessments;
create policy "ergo_rw_own" on public.ergonomic_assessments
  for all
  using (user_id::text = auth.uid()::text)
  with check (user_id::text = auth.uid()::text);
