import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";

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

  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select("id, drugs, notes, created_at")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Prescriptions & Drugs Allotted</h1>
      <div className="space-y-4">
        {prescriptions?.length ? (
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
