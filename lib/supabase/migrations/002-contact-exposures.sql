-- 002-contact-exposures.sql
-- Append-only audit log of contact info disclosures:
-- when a paid user requests another user's contact details,
-- (via /api/contact-info/request) a row is inserted here.
-- RLS: users can read/insert their own viewer rows only.
-- Owner-side reads and the dashboard exposure count go through the server.

create table public.contact_info_exposures (
  id uuid primary key default gen_random_uuid(),
  viewer_user_id uuid not null
    references public.profiles(user_id) on delete cascade,
  owner_user_id uuid not null
    references public.profiles(user_id) on delete cascade,
  contact_method text not null,
  created_at timestamptz not null default now(),
  constraint contact_info_exposures_not_self
    check (viewer_user_id <> owner_user_id)
);

alter table public.contact_info_exposures enable row level security;

create policy "contact_info_exposures_select_own_viewer"
  on public.contact_info_exposures for select
  to authenticated
  using (auth.uid() = viewer_user_id);

create policy "contact_info_exposures_insert_own_viewer"
  on public.contact_info_exposures for insert
  to authenticated
  with check (auth.uid() = viewer_user_id);

grant select, insert on public.contact_info_exposures to authenticated;

