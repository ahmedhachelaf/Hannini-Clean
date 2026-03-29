# Supabase Configuration Required for Hannini

Hannini now uses **email-only authentication** for provider verification and login preparation.

There is **no SMS or WhatsApp OTP setup required** in the final free configuration.

## 1. Authentication → URL Configuration
Set:

- Site URL: `https://[your-vercel-url].vercel.app`
- Redirect URLs:
  - `https://[your-vercel-url].vercel.app/**`
  - `http://localhost:3000/**`

## 2. Authentication → Email Templates
Hannini expects email verification by **6-digit code**.

Update the relevant template so it contains `{{ .Token }}` and does not rely on `{{ .ConfirmationURL }}` for the verification flow.

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

Apply the same token-based approach to:

- `Magic link`
- `Confirm sign up`

## 3. Authentication → Sign In / Providers
Email:

- Enable Email provider: ON

Phone:

- Leave phone auth disabled unless you intentionally choose a paid SMS provider later.

WhatsApp:

- Do not configure WhatsApp for auth in the free Hannini setup.
- WhatsApp stays a profile/contact channel only.

## 4. Authentication → Rate Limits
If email OTP sends fail intermittently:

- review rate limits for email auth
- temporarily increase limits during testing

## 5. Vercel Environment Variables
These must exist in production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `ADMIN_ACCESS_PASSWORD`
- `PROVIDER_SESSION_SECRET`

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

## 7. Email Verification Notes
- If users still receive a **link** instead of a **6-digit code**, the Supabase email template is still link-oriented and must be changed to `{{ .Token }}`.
- If email verification redirects to the wrong domain, review Site URL and Redirect URLs.
- If email sends fail entirely, verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.
