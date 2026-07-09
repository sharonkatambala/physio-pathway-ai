-- ============================================================================
-- 1) Physiotherapist verification.
--
-- Previously the "Verified Physiotherapist" badge showed for ANY account
-- with the physiotherapist role, with no actual credential check. This adds
-- a real license number captured at signup and a verification flag that
-- only the platform operator sets (there is no in-app admin UI yet, so
-- verify by running, per physiotherapist, once their license is checked:
--   update public.profiles set verified_at = now(), verified_by = 'admin'
--   where user_id = '<their auth user id>';
-- ============================================================================
alter table public.profiles
  add column if not exists license_number text,
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by text;

-- ============================================================================
-- 2) One-time telehealth consent per patient, captured before their first
--    video/phone session, since Tanzania has no finalized telehealth-consent
--    regulation yet - this is a self-imposed safeguard.
-- ============================================================================
alter table public.profiles
  add column if not exists telehealth_consent_at timestamptz;
