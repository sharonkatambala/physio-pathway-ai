-- ============================================================================
-- Add the metric columns the Progress page tracks.
--
-- The original progress_entries table (20251021000000) only had
-- pain_level + completed_exercises_count + notes, but the Progress page UI
-- records pain_level, energy_level and adherence. The missing columns caused
-- both the load (SELECT) and the save (INSERT) to fail with HTTP 400:
--   "column progress_entries.energy_level does not exist"
--   "Could not find the 'adherence' column of 'progress_entries'"
--
-- These are nullable ints (0-10 scale) so existing rows are unaffected.
-- ============================================================================

alter table if exists public.progress_entries
  add column if not exists energy_level int;

alter table if exists public.progress_entries
  add column if not exists adherence int;
