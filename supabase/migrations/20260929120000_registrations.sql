create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  full_name text not null,
  cpf text not null,
  birth_date date not null,
  whatsapp text not null,
  email text not null,
  company text not null,
  city text not null,
  member_number text,
  is_member boolean not null default true,
  membership_status text not null check (membership_status in ('sim', 'nao', 'nao_sei')),
  registration_status text not null check (
    registration_status in (
      'PENDING',
      'PENDING_MEMBERSHIP_VALIDATION',
      'APPROVED',
      'REJECTED',
      'CANCELLED',
      'WAITLIST',
      'ATTENDED'
    )
  ),
  rules_acknowledged boolean not null default false,
  rules_acknowledged_at timestamptz,
  privacy_consent boolean not null default false,
  marketing_consent boolean not null default false,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  landing_page text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, cpf)
);

create table public.membership_leads (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  full_name text,
  whatsapp text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  landing_page text,
  created_at timestamptz not null default now()
);

create index event_registrations_created_at_idx on public.event_registrations (created_at desc);
create index event_registrations_status_idx on public.event_registrations (registration_status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger event_registrations_updated
before update on public.event_registrations
for each row execute function public.set_updated_at();

alter table public.event_registrations enable row level security;
alter table public.membership_leads enable row level security;

revoke all on public.event_registrations from anon, authenticated;
revoke all on public.membership_leads from anon, authenticated;

grant insert on public.event_registrations to anon, authenticated;
grant select, update on public.event_registrations to authenticated;
grant insert on public.membership_leads to anon, authenticated;
grant select on public.membership_leads to authenticated;

create policy "public insert registrations"
on public.event_registrations
for insert
to anon, authenticated
with check (
  rules_acknowledged = true
  and privacy_consent = true
  and registration_status in ('PENDING', 'PENDING_MEMBERSHIP_VALIDATION')
  and char_length(cpf) = 11
);

create policy "admin read registrations"
on public.event_registrations
for select
to authenticated
using (true);

create policy "admin update registrations"
on public.event_registrations
for update
to authenticated
using (true)
with check (true);

create policy "public insert leads"
on public.membership_leads
for insert
to anon, authenticated
with check (char_length(whatsapp) >= 12);

create policy "admin read leads"
on public.membership_leads
for select
to authenticated
using (true);
