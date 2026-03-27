-- Run this in Supabase SQL Editor
-- Safe to run multiple times (idempotent)
-- Date: 2025

create extension if not exists pgcrypto;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'providers'
  ) then
    alter table public.providers add column if not exists verification_status text default 'pending';
    alter table public.providers add column if not exists verified_at timestamptz;
    alter table public.providers add column if not exists verified_by_admin_id text;
    alter table public.providers add column if not exists wilaya_code text;
    alter table public.providers add column if not exists commune text;

    update public.providers
    set verification_status = coalesce(verification_status, 'pending')
    where verification_status is null;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'providers_verification_status_check'
    ) then
      alter table public.providers
        add constraint providers_verification_status_check
        check (verification_status in ('pending', 'verified', 'rejected'));
    end if;
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'business_requests'
  ) then
    alter table public.business_requests add column if not exists wilaya_code text;
    alter table public.business_requests add column if not exists commune text;
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'support_cases'
  ) then
    alter table public.support_cases add column if not exists booking_id uuid references public.bookings(id) on delete set null;
    alter table public.support_cases add column if not exists reporter_name text;
    alter table public.support_cases add column if not exists reporter_phone text;
    alter table public.support_cases add column if not exists reported_provider_id uuid references public.providers(id) on delete set null;
    alter table public.support_cases add column if not exists interaction_verified boolean default false;

    update public.support_cases
    set interaction_verified = false
    where interaction_verified is null;
  end if;
end $$;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.providers(id) on delete cascade,
  type text not null,
  title_ar text not null,
  body_ar text not null,
  title_fr text,
  body_fr text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_provider_idx on public.notifications (provider_id);
create index if not exists notifications_unread_provider_idx on public.notifications (provider_id, is_read, created_at desc);
