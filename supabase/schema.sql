create extension if not exists pgcrypto;

create type public.user_role as enum ('customer', 'provider', 'admin');
create type public.provider_status as enum ('pending', 'approved', 'rejected', 'needs_more_info');
create type public.booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type public.verification_status as enum ('pending', 'verified', 'rejected');
create type public.contact_method as enum ('whatsapp', 'phone');
create type public.support_actor as enum ('customer', 'provider', 'admin');
create type public.support_status as enum ('open', 'in_review', 'waiting_for_user', 'resolved');
create type public.business_request_status as enum ('new', 'under_review', 'matched', 'closed', 'rejected');
create type public.review_status as enum ('pending_review', 'approved', 'rejected');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.categories (
  slug text primary key,
  icon text,
  name_ar text not null,
  name_fr text not null,
  description_ar text,
  description_fr text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.zones (
  slug text primary key,
  province_slug text,
  wilaya text not null,
  name_ar text not null,
  name_fr text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_number text not null unique,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  workshop_name text,
  phone_number text not null,
  whatsapp_number text not null,
  hourly_rate integer not null default 0,
  travel_fee integer not null default 0,
  years_experience integer not null default 0,
  facebook_url text,
  instagram_url text,
  tiktok_url text,
  whatsapp_business_url text,
  website_url text,
  available_for_bulk_orders boolean not null default false,
  minimum_order_quantity text,
  production_capacity text,
  lead_time text,
  delivery_area text,
  bio_ar text not null,
  bio_fr text not null,
  tagline_ar text not null,
  tagline_fr text not null,
  google_maps_url text not null,
  response_time_minutes integer not null default 60,
  completed_jobs_count integer not null default 0,
  rating_average numeric(3, 2) not null default 0,
  review_count integer not null default 0,
  auth_user_id uuid references auth.users(id) on delete set null,
  approval_status public.provider_status not null default 'pending',
  is_verified boolean not null default false,
  phone_verified boolean not null default false,
  email_verified boolean not null default false,
  verification_method text check (verification_method in ('phone', 'email') or verification_method is null),
  contact_verified_at timestamptz,
  featured boolean not null default false,
  profile_photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.provider_services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  category_slug text not null references public.categories(slug) on delete restrict,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (provider_id, category_slug)
);

create table if not exists public.service_areas (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  zone_slug text not null references public.zones(slug) on delete restrict,
  created_at timestamptz not null default now(),
  unique (provider_id, zone_slug)
);

create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  day_key text not null,
  label_ar text not null,
  label_fr text not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  customer_name text not null,
  phone_number text not null,
  service_slug text not null references public.categories(slug) on delete restrict,
  booking_date date not null,
  booking_time time not null,
  zone_slug text not null references public.zones(slug) on delete restrict,
  address text not null,
  google_maps_url text not null,
  issue_description text not null,
  preferred_contact_method public.contact_method not null default 'whatsapp',
  status public.booking_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  review_text text not null,
  status public.review_status not null default 'pending_review',
  admin_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.provider_verifications (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null unique references public.providers(id) on delete cascade,
  status public.verification_status not null default 'pending',
  document_name text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.provider_photos (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.support_cases (
  id uuid primary key default gen_random_uuid(),
  actor_role public.support_actor not null,
  issue_category text not null,
  status public.support_status not null default 'open',
  request_safety_block boolean not null default false,
  privacy_sensitive boolean not null default false,
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

create index if not exists providers_status_idx on public.providers (approval_status);
create index if not exists providers_verified_idx on public.providers (is_verified);
create index if not exists provider_services_category_idx on public.provider_services (category_slug);
create index if not exists service_areas_zone_idx on public.service_areas (zone_slug);
create index if not exists bookings_provider_idx on public.bookings (provider_id);
create index if not exists reviews_provider_idx on public.reviews (provider_id);
create index if not exists reviews_status_idx on public.reviews (status);
create index if not exists support_cases_status_idx on public.support_cases (status);
create index if not exists support_cases_provider_idx on public.support_cases (provider_id);
create index if not exists support_messages_case_idx on public.support_messages (support_case_id);
create index if not exists business_requests_status_idx on public.business_requests (status);
create index if not exists business_requests_category_idx on public.business_requests (category_slug);

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();

drop trigger if exists set_zones_updated_at on public.zones;
create trigger set_zones_updated_at before update on public.zones for each row execute function public.set_updated_at();

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at before update on public.users for each row execute function public.set_updated_at();

drop trigger if exists set_providers_updated_at on public.providers;
create trigger set_providers_updated_at before update on public.providers for each row execute function public.set_updated_at();

drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at before update on public.bookings for each row execute function public.set_updated_at();

drop trigger if exists set_provider_verifications_updated_at on public.provider_verifications;
create trigger set_provider_verifications_updated_at before update on public.provider_verifications for each row execute function public.set_updated_at();

drop trigger if exists set_support_cases_updated_at on public.support_cases;
create trigger set_support_cases_updated_at before update on public.support_cases for each row execute function public.set_updated_at();

drop trigger if exists set_business_requests_updated_at on public.business_requests;
create trigger set_business_requests_updated_at before update on public.business_requests for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- Every table must be explicitly secured before going live.
-- The service_role key (server-only) bypasses RLS automatically.
-- The anon key (browser) is subject to these policies.
-- ─────────────────────────────────────────────────────────────

alter table public.categories enable row level security;
alter table public.zones enable row level security;
alter table public.users enable row level security;
alter table public.providers enable row level security;
alter table public.provider_services enable row level security;
alter table public.service_areas enable row level security;
alter table public.availability enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.provider_verifications enable row level security;
alter table public.provider_photos enable row level security;
alter table public.support_cases enable row level security;
alter table public.support_messages enable row level security;
alter table public.business_requests enable row level security;

-- Categories: publicly readable (no sensitive data)
create policy "categories_public_read"
  on public.categories for select to anon, authenticated using (true);

-- Zones: publicly readable (no sensitive data)
create policy "zones_public_read"
  on public.zones for select to anon, authenticated using (true);

-- Users: anon may insert (booking creates a user record); no public read
create policy "users_anon_insert"
  on public.users for insert to anon with check (true);

-- Providers: anon may only read approved providers (hides pending/rejected)
create policy "providers_public_read_approved"
  on public.providers for select to anon
  using (approval_status = 'approved');

-- Provider services: readable only for approved providers
create policy "provider_services_public_read"
  on public.provider_services for select to anon
  using (
    exists (
      select 1 from public.providers p
      where p.id = provider_id and p.approval_status = 'approved'
    )
  );

-- Service areas: readable only for approved providers
create policy "service_areas_public_read"
  on public.service_areas for select to anon
  using (
    exists (
      select 1 from public.providers p
      where p.id = provider_id and p.approval_status = 'approved'
    )
  );

-- Availability: readable only for approved providers
create policy "availability_public_read"
  on public.availability for select to anon
  using (
    exists (
      select 1 from public.providers p
      where p.id = provider_id and p.approval_status = 'approved'
    )
  );

-- Provider photos: readable only for approved providers
create policy "provider_photos_public_read"
  on public.provider_photos for select to anon
  using (
    exists (
      select 1 from public.providers p
      where p.id = provider_id and p.approval_status = 'approved'
    )
  );

-- Provider verifications: no public access (admin / service_role only)
-- (service_role bypasses RLS automatically — no explicit policy needed)

-- Bookings: anon may insert only; no public read (PII protected)
create policy "bookings_anon_insert"
  on public.bookings for insert to anon with check (true);

-- Reviews: anon may read approved reviews and insert new ones
create policy "reviews_public_read_approved"
  on public.reviews for select to anon
  using (status = 'approved');

create policy "reviews_anon_insert"
  on public.reviews for insert to anon with check (true);

-- Support cases: anon may insert only; no public read
create policy "support_cases_anon_insert"
  on public.support_cases for insert to anon with check (true);

-- Support messages: anon may insert only; no public read
create policy "support_messages_anon_insert"
  on public.support_messages for insert to anon with check (true);

-- Business requests: anon may insert only; no public read
create policy "business_requests_anon_insert"
  on public.business_requests for insert to anon with check (true);
