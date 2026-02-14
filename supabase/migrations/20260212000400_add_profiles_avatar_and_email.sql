-- Add avatar_url and email to profiles (if not already present)
alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists email text;

-- Update handle_new_user to include avatar_url + email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, first_name, last_name, phone, age, sex, occupation, avatar_url, email)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    (new.raw_user_meta_data->>'age')::integer,
    new.raw_user_meta_data->>'sex',
    new.raw_user_meta_data->>'occupation',
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );

  insert into public.user_roles (user_id, role)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'patient')
  );

  return new;
end;
$$;
