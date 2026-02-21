-- Add last_login to profiles for 7-day session behavior
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.last_login IS 'Last authentication time. Session considered active within 7 days.';
