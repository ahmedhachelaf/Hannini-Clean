ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS auth_user_id uuid
  REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_providers_auth_user_id
  ON public.providers (auth_user_id);
