import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";

export default async function UserDrugsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: drugs } = await supabase
    .from("drug_recommendations")
    .select("id, drug_name, dosage, reason, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Drug Recommendations</h1>
      <div className="space-y-4">
        {drugs?.length ? (
          drugs.map((d) => (
            <GlassCard key={d.id} className="p-6">
              <p className="font-medium text-text-primary">{d.drug_name}</p>
              {d.dosage && <p className="mt-1 text-sm text-text-secondary">Dosage: {d.dosage}</p>}
              {d.reason && <p className="mt-1 text-sm text-text-muted">{d.reason}</p>}
              <p className="mt-2 text-xs text-text-muted">{new Date(d.created_at).toLocaleDateString()}</p>
            </GlassCard>
          ))
        ) : (
          <GlassCard className="p-8">
            <p className="text-text-secondary">No drug recommendations yet.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
