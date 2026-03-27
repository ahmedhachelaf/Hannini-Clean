-- Provider contact verification flags for OTP / email verification
-- Safe to run multiple times (idempotent)

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'providers'
  ) then
    alter table public.providers add column if not exists phone_verified boolean not null default false;
    alter table public.providers add column if not exists email_verified boolean not null default false;
    alter table public.providers add column if not exists verification_method text;
    alter table public.providers add column if not exists contact_verified_at timestamptz;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'providers_verification_method_check'
    ) then
      alter table public.providers
        add constraint providers_verification_method_check
        check (verification_method in ('phone', 'email') or verification_method is null);
    end if;
  end if;
end $$;

create index if not exists providers_contact_verified_idx
  on public.providers (phone_verified, email_verified, verification_method);
