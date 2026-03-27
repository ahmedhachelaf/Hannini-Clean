-- Run this in Supabase SQL Editor
-- Safe to run multiple times (idempotent)
-- Date: 2025

ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending';

ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;

ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS verified_by_admin_id text;

ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS wilaya_code text;

ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS commune text;

ALTER TABLE public.business_requests
  ADD COLUMN IF NOT EXISTS wilaya_code text;

ALTER TABLE public.business_requests
  ADD COLUMN IF NOT EXISTS commune text;

ALTER TABLE public.support_cases
  ADD COLUMN IF NOT EXISTS reporter_name text;

ALTER TABLE public.support_cases
  ADD COLUMN IF NOT EXISTS reporter_phone text;

ALTER TABLE public.support_cases
  ADD COLUMN IF NOT EXISTS reported_provider_id uuid REFERENCES public.providers(id) ON DELETE SET NULL;

ALTER TABLE public.support_cases
  ADD COLUMN IF NOT EXISTS interaction_verified boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES public.providers(id) ON DELETE CASCADE,
  type text NOT NULL,
  title_ar text NOT NULL,
  body_ar text NOT NULL,
  title_fr text,
  body_fr text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_provider_idx ON public.notifications (provider_id);
