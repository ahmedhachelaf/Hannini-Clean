do $$
begin
  alter type public.provider_status add value if not exists 'needs_more_info';
exception
  when duplicate_object then null;
end $$;
