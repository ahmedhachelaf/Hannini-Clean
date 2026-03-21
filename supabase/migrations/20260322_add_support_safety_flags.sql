alter table public.support_cases
  add column if not exists request_safety_block boolean not null default false,
  add column if not exists privacy_sensitive boolean not null default false;
