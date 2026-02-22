import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";

export default async function UserPrescriptionsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select("id, drugs, notes, created_at")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-semibold text-text-primary">My prescriptions</h1>
      <p className="mb-6 text-sm text-text-muted">
        View prescriptions issued to you by your healthcare providers.
      </p>
      <div className="space-y-4">
        {prescriptions?.length ? (
          prescriptions.map((p) => (
            <GlassCard key={p.id} className="p-6">
              <p className="font-medium text-text-primary">
                {Array.isArray(p.drugs) ? p.drugs.join(", ") : "—"}
              </p>
              {p.notes && <p className="mt-2 text-sm text-text-secondary">{p.notes}</p>}
              <p className="mt-2 text-xs text-text-muted">
                {new Date(p.created_at).toLocaleDateString()}
              </p>
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
