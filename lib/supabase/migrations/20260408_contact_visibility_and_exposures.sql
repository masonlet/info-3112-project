-- date 2026-04-08

CREATE TABLE IF NOT EXISTS public.contact_info_exposures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_user_id uuid NOT NULL,
  owner_user_id uuid NOT NULL,
  contact_method text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS show_contact_info boolean NOT NULL DEFAULT false;
