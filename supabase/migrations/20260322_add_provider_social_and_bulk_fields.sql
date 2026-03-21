alter table public.providers
  add column if not exists facebook_url text,
  add column if not exists instagram_url text,
  add column if not exists tiktok_url text,
  add column if not exists whatsapp_business_url text,
  add column if not exists website_url text,
  add column if not exists available_for_bulk_orders boolean not null default false,
  add column if not exists minimum_order_quantity text,
  add column if not exists production_capacity text,
  add column if not exists lead_time text,
  add column if not exists delivery_area text;
