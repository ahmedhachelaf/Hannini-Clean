# Supabase Configuration Required for Hannini

## 1. Authentication → URL Configuration
Set:

- Site URL: `https://[your-vercel-url].vercel.app`
- Redirect URLs:
  - `https://[your-vercel-url].vercel.app/**`
  - `http://localhost:3000/**`

## 2. Authentication → Email Templates
The current Hannini provider signup now expects email verification by **6-digit code** by default.

Update the email template so it contains `{{ .Token }}` and not only `{{ .ConfirmationURL }}`.

Suggested subject:

`رمز التحقق من هَنّيني`

Suggested body:

```text
مرحباً،

رمز التحقق الخاص بك على منصة هَنّيني هو:

{{ .Token }}

هذا الرمز صالح لمدة 10 دقائق.
إذا لم تطلب هذا الرمز، تجاهل هذا البريد.
```

## 3. Authentication → Sign In / Providers
Email:

- Enable Email provider: ON
- If you want OTP-first behavior for this MVP, avoid relying on magic-link-only templates

Phone:

- Requires an SMS provider / Twilio-style setup in Supabase
- If phone OTP is not configured, Hannini should use email verification instead

## 4. Authentication → Rate Limits
If OTP sends fail intermittently:

- review rate limits for email / phone auth
- temporarily increase limits during testing

## 5. Vercel Environment Variables
These must exist in production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `ADMIN_ACCESS_PASSWORD`

Verify them quickly with:

- `/api/health`

## 6. Database Setup
Run this SQL in Supabase SQL Editor:

```sql
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
```

## 7. OTP Verification Notes
- If users still receive a **link** instead of a **6-digit code**, the Supabase email template is still link-oriented.
- If email verification redirects to the wrong domain, review Site URL and Redirect URLs.
- If phone OTP fails, verify the phone auth provider is actually configured in Supabase.
