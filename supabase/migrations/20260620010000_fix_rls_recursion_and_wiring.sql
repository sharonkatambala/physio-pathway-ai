-- ============================================================================
-- CRITICAL FIX: infinite recursion on profiles RLS + patient <-> physiotherapist
-- visibility and conversation wiring.
--
-- ROOT CAUSE
--   SELECT policies on public.profiles referenced public.profiles (and
--   public.appointments, which itself references profiles) inside their USING
--   clause, e.g.  id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()).
--   Postgres re-applies the table's RLS policies to those nested reads, which
--   re-triggers the same policy -> "infinite recursion detected in policy for
--   relation profiles". As a result EVERY read of profiles failed: the booking
--   physiotherapist list, the physio patient panel, message participant names,
--   and every embedded patient/physio lookup on the dashboards.
--
-- FIX
--   Route all "who am I" / "is this my patient" checks through SECURITY DEFINER
--   helper functions. SECURITY DEFINER runs as the function owner and bypasses
--   RLS, so the nested reads no longer evaluate profiles' policies -> the cycle
--   is broken.
--
-- This file uses only uuid = uuid comparisons on core tables (profiles,
-- appointments, physio_patient_assignments, conversations) so it runs cleanly
-- regardless of how the assessment tables were defined. Assessment/progress
-- policies live in the companion file 20260620020000_fix_assessment_policies.sql.
-- ============================================================================

-- 1) Helper functions --------------------------------------------------------

-- Caller's own profile id (RLS-safe).
create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where user_id = auth.uid() limit 1
$$;

-- Is the given profile id one of the calling physiotherapist's patients?
-- True when linked via an appointment OR a physio_patient_assignment.
create or replace function public.is_my_patient(_patient_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.appointments a
    join public.profiles me on me.id = a.physiotherapist_id
    where a.patient_id = _patient_profile_id
      and me.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.physio_patient_assignments ppa
    join public.profiles me on me.id = ppa.physio_id
    where ppa.patient_id = _patient_profile_id
      and me.user_id = auth.uid()
  )
$$;

grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.is_my_patient(uuid)  to authenticated;

-- 2) profiles SELECT policy (recursion-free) ---------------------------------
--    - Everyone sees their own profile.
--    - Any signed-in user can see physiotherapist profiles (booking directory).
--    - A physiotherapist can see the profiles of their own patients.

drop policy if exists "Users can view their own profile"                       on public.profiles;
drop policy if exists "Physios can view their patients' profiles"              on public.profiles;
drop policy if exists "Profiles are viewable by owner, physios, and patients"  on public.profiles;

create policy "Profiles are viewable by owner, physios, and patients"
  on public.profiles
  for select
  using (
    auth.uid() = user_id
    or public.has_role(user_id, 'physiotherapist')
    or public.is_my_patient(id)
  );

-- 3) Conversations: let physiotherapists start a chat with their patients -----
--    (Patients could already start chats; physios could not, so the "Message"
--    button on the patient panel had no conversation to open.)

drop policy if exists "Physiotherapists can create conversations" on public.conversations;
create policy "Physiotherapists can create conversations"
  on public.conversations
  for insert
  with check (
    physiotherapist_id = public.current_profile_id()
    and public.is_my_patient(patient_id)
  );
