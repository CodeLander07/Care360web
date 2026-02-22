-- Extend appointments for in-person vs online consultation
-- Allow patients to read all organizations (for Consultancy browsing)

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'in_person'
  CHECK (type IN ('in_person', 'online'));

COMMENT ON COLUMN public.appointments.type IS 'in_person: visit at facility; online: remote consultation';

-- Patients need to see all organizations to browse and book
CREATE POLICY "organizations_select_authenticated"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (true);

-- Hospital admins can update appointments (confirm, cancel, etc.)
CREATE POLICY "appointments_org_update"
  ON public.appointments FOR UPDATE
  USING (
    organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );
