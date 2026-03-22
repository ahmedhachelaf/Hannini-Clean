create type public.business_request_status as enum ('new', 'under_review', 'matched', 'closed', 'rejected');

create table if not exists public.business_requests (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  phone text not null,
  email text,
  category_slug text not null references public.categories(slug) on delete restrict,
  description text not null,
  wilaya_slug text not null,
  frequency text not null,
  timeline text not null,
  budget text,
  preferred_provider_type text not null default 'either',
  attachment_names text[] not null default '{}',
  status public.business_request_status not null default 'new',
  matched_provider_ids uuid[] not null default '{}',
  admin_notes text,
  consent_accepted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_requests_status_idx on public.business_requests (status);
create index if not exists business_requests_category_idx on public.business_requests (category_slug);

drop trigger if exists set_business_requests_updated_at on public.business_requests;
create trigger set_business_requests_updated_at
before update on public.business_requests
for each row execute function public.set_updated_at();
