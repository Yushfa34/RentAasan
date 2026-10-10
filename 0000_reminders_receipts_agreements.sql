alter table public.tenants add column if not exists agreement_start date, add column if not exists agreement_end date;
alter table public.rent_records add column if not exists receipt_no text unique;
alter table public.notifications add column if not exists kind text not null default 'rent_manual', add column if not exists dedupe_key text, add column if not exists recipient text not null default 'tenant', add column if not exists error text;
create unique index if not exists notifications_dedupe_key on public.notifications(dedupe_key);
create sequence if not exists public.receipt_seq;
grant usage on sequence public.receipt_seq to authenticated, service_role;
create or replace function public.rr_receipt() returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if new.status = 'paid' and new.receipt_no is null then
    new.receipt_no := 'RA-' || to_char(coalesce(new.paid_at, now()), 'YYYYMM') || '-' || lpad(nextval('public.receipt_seq')::text, 5, '0');
  end if;
  return new;
end $$;
drop trigger if exists rr_receipt on public.rent_records;
create trigger rr_receipt before insert or update on public.rent_records for each row execute function public.rr_receipt();
update public.rent_records set status = status where status = 'paid' and receipt_no is null;
revoke execute on function public.rr_receipt() from public, anon, authenticated;