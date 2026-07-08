-- ============================================================================
-- 1) Prevent double-booking: one active appointment per physio per slot.
-- ============================================================================
create unique index if not exists uniq_active_appointment_slot
  on public.appointments (physiotherapist_id, appointment_date, appointment_time)
  where status <> 'cancelled';

-- Patients can only SELECT their own appointments under RLS, so the booking
-- page needs a definer function to learn which slots are already taken.
-- It intentionally returns times only - no patient data leaks.
create or replace function public.get_booked_slots(p_physio uuid, p_date date)
returns setof time
language sql
security definer
set search_path = public
as $$
  select appointment_time
  from appointments
  where physiotherapist_id = p_physio
    and appointment_date = p_date
    and status <> 'cancelled';
$$;

grant execute on function public.get_booked_slots(uuid, date) to authenticated;

-- ============================================================================
-- 2) In-app notifications.
-- ============================================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,            -- auth user id of the recipient
  type text not null,               -- booking_request | booking_confirmed | booking_cancelled | booking_completed | message
  data jsonb,
  link text,
  created_at timestamptz default now(),
  read_at timestamptz
);

create index if not exists idx_notifications_user_unread
  on public.notifications (user_id, read_at, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select using (user_id = auth.uid()::text);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid()::text);

-- New booking -> notify the physiotherapist.
create or replace function public.notify_new_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  physio_user text;
  patient_name text;
begin
  select p.user_id::text into physio_user from profiles p where p.id = new.physiotherapist_id;
  select nullif(trim(coalesce(pp.first_name, '') || ' ' || coalesce(pp.last_name, '')), '')
    into patient_name from profiles pp where pp.id = new.patient_id;
  if physio_user is not null then
    insert into notifications (user_id, type, data, link)
    values (
      physio_user,
      'booking_request',
      jsonb_build_object('date', new.appointment_date, 'time', new.appointment_time, 'patient', patient_name),
      '/physio-sessions'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_new_booking on public.appointments;
create trigger trg_notify_new_booking
  after insert on public.appointments
  for each row execute function public.notify_new_booking();

-- Status change -> notify the patient.
create or replace function public.notify_booking_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  patient_user text;
begin
  if new.status is distinct from old.status
     and new.status in ('confirmed', 'cancelled', 'completed') then
    select p.user_id::text into patient_user from profiles p where p.id = new.patient_id;
    if patient_user is not null then
      insert into notifications (user_id, type, data, link)
      values (
        patient_user,
        'booking_' || new.status,
        jsonb_build_object('date', new.appointment_date, 'time', new.appointment_time),
        '/booking'
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_booking_status on public.appointments;
create trigger trg_notify_booking_status
  after update on public.appointments
  for each row execute function public.notify_booking_status();

-- New message -> notify the other participant.
create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  conv record;
  recipient_profile uuid;
  recipient_user text;
begin
  select patient_id, physiotherapist_id into conv
  from conversations where id = new.conversation_id;
  if conv is null then return new; end if;
  if conv.patient_id = new.sender_id then
    recipient_profile := conv.physiotherapist_id;
  else
    recipient_profile := conv.patient_id;
  end if;
  select user_id::text into recipient_user from profiles where id = recipient_profile;
  if recipient_user is not null then
    insert into notifications (user_id, type, data, link)
    values (recipient_user, 'message', jsonb_build_object('preview', left(new.content, 80)), '/messages');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_new_message on public.messages;
create trigger trg_notify_new_message
  after insert on public.messages
  for each row execute function public.notify_new_message();

-- ============================================================================
-- 3) Realtime: push new messages and notifications to connected clients.
-- ============================================================================
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; end $$;
