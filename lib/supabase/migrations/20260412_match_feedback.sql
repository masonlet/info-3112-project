-- date 2026-04-12

CREATE TABLE IF NOT EXISTS public.match_feedback (
  rater_user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  target_user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (rater_user_id, target_user_id),
  CONSTRAINT match_feedback_not_self CHECK (rater_user_id <> target_user_id)
);

ALTER TABLE public.match_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "match_feedback_owner_only" ON public.match_feedback;

CREATE POLICY "match_feedback_owner_only"
ON public.match_feedback
FOR ALL
TO authenticated
USING (auth.uid() = rater_user_id)
WITH CHECK (auth.uid() = rater_user_id);