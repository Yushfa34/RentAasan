alter table public.notifications drop constraint if exists notifications_status_check;
alter table public.notifications add constraint notifications_status_check check (status = any (array['sent','failed','pending','demo']));
update public.notifications set status = 'demo', channel = 'demo' where status = 'pending' and dedupe_key is not null;