-- Migration: add photo storage columns + Supabase Storage bucket for provider-photos
-- Date: 2026-03-26

-- 1. Extend the provider_photos table
alter table public.provider_photos
  add column if not exists storage_path text,
  add column if not exists is_cover     boolean not null default false,
  add column if not exists is_approved  boolean not null default true,
  add column if not exists caption      text;

-- Ensure only one cover photo per provider
create unique index if not exists provider_photos_one_cover_per_provider
  on public.provider_photos (provider_id)
  where is_cover = true;

-- 2. Create the Supabase Storage bucket (public read, private write)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'provider-photos',
  'provider-photos',
  true,
  5242880,  -- 5 MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- 3. Storage RLS policies
-- Public read: anyone can read files from the provider-photos bucket
create policy "provider_photos_storage_public_read"
  on storage.objects for select to anon
  using (bucket_id = 'provider-photos');

-- Authenticated insert: providers upload to their own folder (path starts with their provider id)
create policy "provider_photos_storage_authenticated_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'provider-photos');

-- Authenticated delete: only the uploader (owner) may delete
create policy "provider_photos_storage_authenticated_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'provider-photos' and owner = auth.uid());
