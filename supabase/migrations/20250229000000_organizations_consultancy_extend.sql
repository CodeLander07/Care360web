-- Extend organizations for consultancy type and consultation modes

-- Allow consultancy as organization type
ALTER TABLE public.organizations DROP CONSTRAINT IF EXISTS organizations_type_check;
ALTER TABLE public.organizations ADD CONSTRAINT organizations_type_check
  CHECK (type IN ('hospital', 'clinic', 'consultancy'));

-- Supported consultation modes (e.g. online, in-person)
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS consultation_modes TEXT[] DEFAULT '{}';
