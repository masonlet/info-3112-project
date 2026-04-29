-- 003-match-feedback.sql
-- Star ratings (1-5) given by paid users to specific matches
-- after exchanging contact information. Used by the dashboard
-- to survey match algorithm quality.
-- RLS: users can read/insert/update/delete only their own ratings.
-- Cross-user reads go through the server.

create table public.match_feedback (
  rater_user_id uuid not null
    references public.profiles(user_id) on delete cascade,
  target_user_id uuid not null
    references public.profiles(user_id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  primary key (rater_user_id, target_user_id),
  constraint match_feedback_not_self
    check (rater_user_id <> target_user_id)
);

alter table public.match_feedback enable row level security;

create policy "match_feedback_owner_only"
  on public.match_feedback for all
  to authenticated
  using (auth.uid() = rater_user_id)
  with check (auth.uid() = rater_user_id);

grant select, insert, update, delete on public.match_feedback to authenticated;

