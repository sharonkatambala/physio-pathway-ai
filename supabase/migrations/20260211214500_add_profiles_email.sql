alter table public.profiles
  add column if not exists email text;

-- Optional: backfill from auth.users if you run this in SQL editor with service role:
-- update public.profiles p
-- set email = u.email
-- from auth.users u
-- where p.user_id = u.id and p.email is null;
