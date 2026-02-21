import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";

export default async function UserAppointmentsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, scheduled_at, status, notes")
    .eq("patient_id", user.id)
    .order("scheduled_at", { ascending: true });

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Appointments</h1>
      <div className="space-y-4">
        {appointments?.length ? (
          appointments.map((a) => (
            <GlassCard key={a.id} className="p-6">
              <p className="font-medium text-text-primary">
                {new Date(a.scheduled_at).toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-text-muted">Status: {a.status}</p>
              {a.notes && <p className="mt-2 text-sm text-text-secondary">{a.notes}</p>}
            </GlassCard>
          ))
        ) : (
          <GlassCard className="p-8">
            <p className="text-text-secondary">No appointments scheduled.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
