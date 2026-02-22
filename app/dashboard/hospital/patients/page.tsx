import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";

export const dynamic = "force-dynamic";

export default async function HospitalPatientsPage() {
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

  const { data: appointments } = await supabase
    .from("appointments")
    .select("patient_id")
    .eq("organization_id", orgId);

  const patientIds = [...new Set(appointments?.map((a) => a.patient_id) ?? [])];
  const { data: patients } = await supabase
    .from("profiles")
    .select("id, email")
    .in("id", patientIds);

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-semibold text-text-primary">Patients Connected</h1>
      <p className="mb-6 text-sm text-text-muted">
        Patients who have booked an appointment with your organization.
      </p>
      <div className="space-y-4">
        {patients?.length ? (
          patients.map((p) => (
            <GlassCard key={p.id} className="p-6">
              <p className="font-medium text-text-primary">{p.email || "No email"}</p>
            </GlassCard>
          ))
        ) : (
          <GlassCard className="p-8">
            <p className="text-text-secondary">No patients connected yet.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
