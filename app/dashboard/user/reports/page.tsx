import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";

export default async function UserReportsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: consultations } = await supabase
    .from("consultations")
    .select("id, summary, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Reports</h1>
      <div className="space-y-4">
        {consultations?.length ? (
          consultations.map((c) => (
            <GlassCard key={c.id} className="p-6">
              <p className="text-sm text-text-muted">{new Date(c.created_at).toLocaleDateString()}</p>
              <p className="mt-2 text-text-primary">{c.summary || "No summary"}</p>
            </GlassCard>
          ))
        ) : (
          <GlassCard className="p-8">
            <p className="text-text-secondary">No reports yet.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
