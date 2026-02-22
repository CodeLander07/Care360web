-- Clinic details and doctors for Consultancy services

-- Extend organizations with clinic details
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Doctors linked to organizations (visible in Consultancy)
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 0,
  bio TEXT,
  avatar_url TEXT,
  fee_per_min INTEGER, -- in smallest currency unit (paise) or cents; null = contact for pricing
  rating NUMERIC(3, 2) DEFAULT 0,
  sessions_count INTEGER NOT NULL DEFAULT 0,
  is_online BOOLEAN NOT NULL DEFAULT false,
  services TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doctors_organization_id ON public.doctors(organization_id);

-- Optional: link appointment to specific doctor
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL;

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Hospital admins manage their org's doctors
CREATE POLICY "doctors_org_insert"
  ON public.doctors FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );
CREATE POLICY "doctors_org_update"
  ON public.doctors FOR UPDATE
  USING (
    organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );
CREATE POLICY "doctors_org_delete"
  ON public.doctors FOR DELETE
  USING (
    organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- All authenticated users can read doctors (Consultancy listing)
CREATE POLICY "doctors_select_authenticated"
  ON public.doctors FOR SELECT
  TO authenticated
  USING (true);
