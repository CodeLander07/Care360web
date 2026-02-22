import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";
import { AddPrescriptionForm } from "@/components/prescriptions/add-prescription-form";

export default async function HospitalPrescriptionsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  const orgId = profile?.organization_id;
  if (!orgId) {
    return (
      <div className="p-8">
        <GlassCard className="p-8">
          <p className="text-text-secondary">No organization linked.</p>
        </GlassCard>
      </div>
    );
  }

  const [prescriptionsRes, appointmentsRes] = await Promise.all([
    supabase
      .from("prescriptions")
      .select("id, drugs, notes, created_at, patient_id")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("appointments")
      .select("patient_id")
      .eq("organization_id", orgId),
  ]);

  const prescriptions = prescriptionsRes.data ?? [];
  const patientIds = [...new Set((appointmentsRes.data ?? []).map((a) => a.patient_id))];

  const { data: patients } =
    patientIds.length > 0
      ? await supabase.from("profiles").select("id, email").in("id", patientIds)
      : { data: [] };

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-semibold text-text-primary">Prescriptions & Drugs Allotted</h1>
      <p className="mb-6 text-sm text-text-muted">
        Suggest prescriptions for patients who have booked an appointment with your organization. Patients can view their prescriptions in their dashboard.
      </p>
      <div className="mb-8">
        <AddPrescriptionForm patients={patients ?? []} organizationId={orgId} />
      </div>
      <h2 className="mb-4 text-lg font-medium text-text-primary">Recent prescriptions</h2>
      <div className="space-y-4">
        {prescriptions.length ? (
          prescriptions.map((p) => (
            <GlassCard key={p.id} className="p-6">
              <p className="font-medium text-text-primary">
                {Array.isArray(p.drugs) ? p.drugs.join(", ") : "—"}
              </p>
              {p.notes && <p className="mt-2 text-sm text-text-secondary">{p.notes}</p>}
              <p className="mt-2 text-xs text-text-muted">{new Date(p.created_at).toLocaleDateString()}</p>
            </GlassCard>
          ))
        ) : (
          <GlassCard className="p-8">
            <p className="text-text-secondary">No prescriptions yet.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
