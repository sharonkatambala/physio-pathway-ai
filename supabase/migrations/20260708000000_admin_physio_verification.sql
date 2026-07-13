-- ============================================================================
-- In-app admin who can verify physiotherapists.
--
-- Design note: the user_role enum has no 'admin' value, and adding enum
-- values interacts badly with same-transaction use in the SQL editor. So
-- admins live in their own tiny table, bootstrapped by email (no UUIDs to
-- copy). Verification runs through SECURITY DEFINER functions that check the
-- caller is an admin, so no broad "update any profile" RLS policy is needed.
-- ============================================================================

create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.app_admins enable row level security;

-- A user may check whether they themselves are an admin (drives the UI),
-- but cannot see or edit the admin list.
drop policy if exists "app_admins_select_self" on public.app_admins;
create policy "app_admins_select_self" on public.app_admins
  for select using (user_id = auth.uid());

-- Bootstrap the first admin by email. CHANGE THIS EMAIL if the platform
-- owner is a different account. Safe to re-run.
insert into public.app_admins (user_id)
select id from auth.users where lower(email) = lower('katambala55@gmail.com')
on conflict (user_id) do nothing;

create or replace function public.is_app_admin(_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.app_admins where user_id = _uid)
$$;

grant execute on function public.is_app_admin(uuid) to authenticated;

-- List physiotherapists with their verification status (admins only).
-- Runs as definer so license numbers are never exposed to non-admins.
create or replace function public.list_physiotherapists_admin()
returns table (
  user_id uuid,
  first_name text,
  last_name text,
  email text,
  occupation text,
  license_number text,
  verified_at timestamptz,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select p.user_id, p.first_name, p.last_name, p.email, p.occupation,
         p.license_number, p.verified_at, p.created_at
  from public.profiles p
  join public.user_roles r on r.user_id = p.user_id and r.role = 'physiotherapist'
  where public.is_app_admin(auth.uid())
  order by (p.verified_at is not null), p.first_name nulls last
$$;

grant execute on function public.list_physiotherapists_admin() to authenticated;

-- Verify or un-verify a physiotherapist (admins only).
create or replace function public.set_physio_verification(target_user_id uuid, verified boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_app_admin(auth.uid()) then
    raise exception 'Not authorized';
  end if;
  update public.profiles
     set verified_at = case when verified then now() else null end,
         verified_by = case when verified then auth.uid()::text else null end
   where user_id = target_user_id;
end;
$$;

grant execute on function public.set_physio_verification(uuid, boolean) to authenticated;
