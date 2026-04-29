-- 001-profiles.sql
-- profiles table: extends auth.users with application user data.
-- RLS: users can only access their own row. All cross-user reads
-- (matches, dashboard, contact info) will go through the server.

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,

  -- identity
  first_name    text not null,
  last_name     text not null,
  gender        text not null,
  date_of_birth date not null,
  nickname      text,
  photo_url     text,
  salutation    text,

  -- matching inputs
  skills         text[] not null default '{}',
  desired_skills text[] not null default '{}',
  desired_gender text,

  -- contact
  preferred_contact_method text not null,
  email                    text,
  phone                    text,
  discord                  text,
  linkedin                 text,
  show_contact_info        boolean not null default false,

  -- membership & role
  member_type text not null default 'Free'
    check (member_type in ('Free', 'Paid')),
  role text not null default 'member'
    check (role in ('member', 'demo_product_manager', 'product_manager', 'owner')),

  -- timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
