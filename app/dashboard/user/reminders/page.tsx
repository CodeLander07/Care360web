import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";

export default async function UserRemindersPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: reminders } = await supabase
    .from("reminders")
    .select("id, title, due_at, is_completed")
    .eq("user_id", user.id)
    .order("due_at", { ascending: true });

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Reminders</h1>
      <div className="space-y-4">
        {reminders?.length ? (
          reminders.map((r) => (
            <GlassCard key={r.id} className="p-6">
              <div className="flex items-center justify-between">
                <p className={`font-medium ${r.is_completed ? "text-text-muted line-through" : "text-text-primary"}`}>{r.title}</p>
                <span className="text-sm text-text-muted">{new Date(r.due_at).toLocaleDateString()}</span>
              </div>
            </GlassCard>
          ))
        ) : (
          <GlassCard className="p-8">
            <p className="text-text-secondary">No reminders.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
