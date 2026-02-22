-- Allow hospital admins to insert prescriptions for their organization
CREATE POLICY "prescriptions_org_insert"
  ON public.prescriptions FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );
