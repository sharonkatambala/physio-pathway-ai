-- Migration: add assessments, recommendations, progress_entries, physio_videos, exercise_programs

create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  patient_user_id text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  language text default 'en',
  region text,
  chronicity text,
  pain_level int,
  functional_score int,
  red_flag boolean default false,
  data jsonb
);

create index if not exists idx_assessments_patient_user_id on assessments(patient_user_id);

create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references assessments(id) on delete cascade,
  created_at timestamptz default now(),
  program jsonb,
  confidence numeric,
  source text default 'ai'
);

create table if not exists progress_entries (
  id uuid primary key default gen_random_uuid(),
  patient_user_id text not null,
  created_at timestamptz default now(),
  pain_level int,
  completed_exercises_count int,
  notes text,
  data jsonb
);

create index if not exists idx_progress_patient_user_id on progress_entries(patient_user_id);

create table if not exists physio_videos (
  id uuid primary key default gen_random_uuid(),
  physio_user_id text not null,
  patient_user_id text, -- nullable: if null it can be unassigned or general
  uploaded_at timestamptz default now(),
  caption text,
  storage_url text,
  visibility text default 'assigned' -- 'assigned'|'public'
);

create table if not exists exercise_programs (
  id uuid primary key default gen_random_uuid(),
  title text,
  created_by text,
  created_at timestamptz default now(),
  program jsonb
);

-- Ensure pgcrypto extension available for gen_random_uuid
create extension if not exists pgcrypto;
