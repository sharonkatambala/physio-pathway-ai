alter table public.contact_messages
  add column if not exists ip_address text,
  add column if not exists user_agent text;
