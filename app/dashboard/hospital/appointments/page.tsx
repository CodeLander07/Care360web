import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";

export default async function HospitalAppointmentsPage() {
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
    .select("id, patient_id, scheduled_at, status, notes")
    .eq("organization_id", orgId)
    .order("scheduled_at", { ascending: true });

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Appointment Requests</h1>
      <div className="space-y-4">
        {appointments?.length ? (
          appointments.map((a) => (
            <GlassCard key={a.id} className="p-6">
              <p className="font-medium text-text-primary">{new Date(a.scheduled_at).toLocaleString()}</p>
              <p className="mt-1 text-sm text-text-muted">Status: {a.status}</p>
              {a.notes && <p className="mt-2 text-sm text-text-secondary">{a.notes}</p>}
            </GlassCard>
          ))
        ) : (
          <GlassCard className="p-8">
            <p className="text-text-secondary">No appointment requests.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
