create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  message text not null,
  user_id uuid null,
  status text not null default 'new'
);

alter table public.contact_messages enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'contact_messages'
      and policyname = 'contact_messages_insert_public'
  ) then
    create policy contact_messages_insert_public
      on public.contact_messages
      for insert
      to anon, authenticated
      with check (true);
  end if;
end $$;

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);
