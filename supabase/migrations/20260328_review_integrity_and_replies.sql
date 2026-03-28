-- Run this in Supabase SQL Editor
-- Safe to run multiple times (idempotent)
-- Date: 2026

alter table public.reviews
  add column if not exists reviewer_phone text,
  add column if not exists interaction_verified boolean not null default false,
  add column if not exists moderation_reason text,
  add column if not exists provider_reply text,
  add column if not exists provider_reply_status text not null default 'none',
  add column if not exists provider_reply_created_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reviews_provider_reply_status_check'
  ) then
    alter table public.reviews
      add constraint reviews_provider_reply_status_check
      check (provider_reply_status in ('none', 'pending', 'approved', 'rejected'));
  end if;
end
$$;

update public.reviews
set interaction_verified = true
where booking_id is not null
  and interaction_verified is distinct from true;

create index if not exists reviews_interaction_verified_idx on public.reviews (interaction_verified);
create index if not exists reviews_provider_reply_status_idx on public.reviews (provider_reply_status);
