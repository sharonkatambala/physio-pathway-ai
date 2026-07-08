-- International-standard patient-reported outcome measures for progress_entries.
--
-- pain_level stays as the NPRS (0-10). New columns:
--   function_score  : PSFS-style main-activity ability, 0-10 (higher = better)
--   sessions_done   : exercise sessions completed this week (count)
--   sessions_target : prescribed weekly session target at time of entry
--   groc            : Global Rating of Change, -7..+7 (Jaeschke 15-point)
--   ears_score      : Exercise Adherence Rating Scale total, 0-24 (higher = better)
--   ears_answers    : raw per-item EARS responses for clinician review
--
-- energy_level / adherence remain for old entries (legacy display only).

alter table public.progress_entries
  add column if not exists function_score integer,
  add column if not exists sessions_done integer,
  add column if not exists sessions_target integer,
  add column if not exists groc integer,
  add column if not exists ears_score integer,
  add column if not exists ears_answers jsonb;
