-- Migration: add drafts table for saving in-progress assessments

create table if not exists drafts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  step int default 0,
  data jsonb
);

create index if not exists idx_drafts_user_id on drafts(user_id);
