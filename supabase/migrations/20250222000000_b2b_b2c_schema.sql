-- Care360 B2B/B2C Enterprise Schema
-- Extends initial schema for hospitals, appointments, prescriptions, etc.
-- Idempotent. Run after initial_schema.

-- =============================================================================
-- ROLES: patient (B2C) | hospital_admin (B2B)
-- =============================================================================

-- Add hospital_admin to profiles.role enum (ALTER CHECK)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('patient', 'doctor', 'admin', 'hospital_admin'));

-- =============================================================================
-- ORGANIZATIONS (Hospitals, Clinics - B2B)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'clinic' CHECK (type IN ('hospital', 'clinic')),
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.organizations IS 'Hospitals and clinics (B2B).';

-- Add organization_id to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);

-- =============================================================================
-- APPOINTMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_organization_id ON public.appointments(organization_id);

COMMENT ON TABLE public.appointments IS 'Patient appointments with organizations.';

-- =============================================================================
-- PRESCRIPTIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  drugs TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_organization_id ON public.prescriptions(organization_id);

COMMENT ON TABLE public.prescriptions IS 'Drug prescriptions per visit.';

-- =============================================================================
-- DRUG_RECOMMENDATIONS (AI-generated for patients)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.drug_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  drug_name TEXT NOT NULL,
  dosage TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_drug_recommendations_user_id ON public.drug_recommendations(user_id);

-- =============================================================================
-- MEDICAL_REPORTS (EMR - Electronic Medical Reports)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  report_url TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_reports_patient_id ON public.medical_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_reports_organization_id ON public.medical_reports(organization_id);

-- =============================================================================
-- REMINDERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);

-- =============================================================================
-- HELPER: Is hospital admin
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_hospital_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'hospital_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Organizations: hospital admins read their org; authenticated users can create (self-registration)
CREATE POLICY "organizations_select_own"
  ON public.organizations FOR SELECT
  USING (
    id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "organizations_insert_authenticated"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Appointments: patients see own; hospital admins see org appointments
CREATE POLICY "appointments_patient_select"
  ON public.appointments FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "appointments_org_select"
  ON public.appointments FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "appointments_insert"
  ON public.appointments FOR INSERT
  WITH CHECK (
    auth.uid() = patient_id
    OR organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Prescriptions: similar
CREATE POLICY "prescriptions_patient_select" ON public.prescriptions FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "prescriptions_org_select" ON public.prescriptions FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Drug recommendations: user only
CREATE POLICY "drug_recommendations_select_own" ON public.drug_recommendations FOR SELECT USING (auth.uid() = user_id);

-- Medical reports: patient and org
CREATE POLICY "medical_reports_patient_select" ON public.medical_reports FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "medical_reports_org_select" ON public.medical_reports FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Reminders: user only
CREATE POLICY "reminders_select_own" ON public.reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reminders_insert_own" ON public.reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reminders_update_own" ON public.reminders FOR UPDATE USING (auth.uid() = user_id);
