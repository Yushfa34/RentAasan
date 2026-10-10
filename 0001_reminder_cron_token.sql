create extension if not exists pg_cron;
create extension if not exists pg_net;
create table if not exists public.app_cron_tokens (name text primary key, token text not null default encode(gen_random_bytes(32), 'hex'));
grant all on public.app_cron_tokens to service_role;
alter table public.app_cron_tokens enable row level security;
insert into public.app_cron_tokens(name) values ('reminders') on conflict do nothing;