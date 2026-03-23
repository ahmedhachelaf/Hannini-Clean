do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'review_status'
  ) then
    create type public.review_status as enum ('pending_review', 'approved', 'rejected');
  end if;
end
$$;

alter table public.reviews
  add column if not exists status public.review_status not null default 'pending_review',
  add column if not exists admin_note text;

update public.reviews
set status = 'approved'
where status is null;

create index if not exists reviews_status_idx on public.reviews (status);
