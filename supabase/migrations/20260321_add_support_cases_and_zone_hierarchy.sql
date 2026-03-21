alter table public.zones
  add column if not exists province_slug text;

create type public.support_actor as enum ('customer', 'provider', 'admin');
create type public.support_status as enum ('open', 'in_review', 'waiting_for_user', 'resolved');

create table if not exists public.support_cases (
  id uuid primary key default gen_random_uuid(),
  actor_role public.support_actor not null,
  issue_category text not null,
  status public.support_status not null default 'open',
  subject text not null,
  message text not null,
  phone_number text,
  email text,
  booking_id uuid references public.bookings(id) on delete set null,
  provider_id uuid references public.providers(id) on delete set null,
  provider_slug text,
  attachment_names text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  support_case_id uuid not null references public.support_cases(id) on delete cascade,
  author_role public.support_actor not null,
  author_name text not null,
  message text not null,
  attachment_names text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists support_cases_status_idx on public.support_cases (status);
create index if not exists support_cases_provider_idx on public.support_cases (provider_id);
create index if not exists support_messages_case_idx on public.support_messages (support_case_id);

drop trigger if exists set_support_cases_updated_at on public.support_cases;
create trigger set_support_cases_updated_at
before update on public.support_cases
for each row execute function public.set_updated_at();
