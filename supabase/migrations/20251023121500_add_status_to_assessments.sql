-- Migration: add status column to assessments for draft support

alter table if exists assessments
  add column if not exists status text default 'final';

-- Optionally create an index for status
create index if not exists idx_assessments_status on assessments(status);
