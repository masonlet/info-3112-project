-- date 2025-03-29

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS show_contact_info boolean NOT NULL DEFAULT false;
