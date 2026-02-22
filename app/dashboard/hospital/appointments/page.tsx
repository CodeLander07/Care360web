import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";
import { AppointmentStatusActions } from "@/components/consultancy/appointment-status-actions";

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
    .select(`
      id, patient_id, scheduled_at, status, notes, type,
      profiles (email)
    `)
    .eq("organization_id", orgId)
    .order("scheduled_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-semibold text-text-primary">
        Appointments
      </h1>
      <p className="mb-6 text-sm text-text-muted">
        View and manage appointment requests from patients.
      </p>

      <div className="space-y-4">
        {appointments?.length ? (
          appointments.map((a: {
            id: string;
            patient_id: string;
            scheduled_at: string;
            status: string;
            notes: string;
            type: string;
            profiles: { email: string }[];
          }) => (
            <GlassCard key={a.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-text-primary">
                    {a.profiles?.[0]?.email ?? "—"}
                  </p>
                  <p className="mt-1 text-sm text-text-muted">
                    {new Date(a.scheduled_at).toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {a.type === "online" ? "Online consultation" : "In-person visit"}
                  </p>
                  {a.notes && (
                    <p className="mt-2 text-sm text-text-secondary">{a.notes}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      a.status === "confirmed"
                        ? "bg-teal/20 text-teal"
                        : a.status === "cancelled"
                          ? "bg-white/10 text-text-muted"
                          : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {a.status}
                  </span>
                  <AppointmentStatusActions id={a.id} status={a.status} />
                </div>
              </div>
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
