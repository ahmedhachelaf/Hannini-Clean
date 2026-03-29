alter table if exists public.support_cases
  add column if not exists reporter_name text,
  add column if not exists reporter_phone text,
  add column if not exists reported_provider_id uuid references public.providers(id) on delete set null,
  add column if not exists interaction_verified boolean not null default false;

create index if not exists support_cases_reported_provider_idx on public.support_cases (reported_provider_id);

alter table public.support_cases enable row level security;

drop policy if exists "support_cases_anon_insert" on public.support_cases;
create policy "support_cases_anon_insert"
  on public.support_cases for insert to anon with check (true);
