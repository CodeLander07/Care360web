import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";

export default async function HospitalReportsPage() {
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

  const { data: reports } = await supabase
    .from("medical_reports")
    .select(`
      id, report_type, summary, report_url, created_at, patient_id,
      profiles (email)
    `)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-semibold text-text-primary">Electronic Medical Reports</h1>
      <p className="mb-6 text-sm text-text-muted">
        View health data reports for patients who have appointments with your organization.
      </p>
      <div className="space-y-4">
        {reports?.length ? (
          reports.map((r: {
            id: string;
            report_type: string;
            summary: string | null;
            report_url: string | null;
            created_at: string;
            patient_id: string;
            profiles: { email: string | null }[] | { email: string | null };
          }) => {
            const patientProfile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
            const patientEmail = patientProfile?.email ?? "—";
            return (
              <GlassCard key={r.id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-teal/20 px-2.5 py-0.5 text-xs font-medium text-teal">
                        Patient
                      </span>
                      <span className="font-medium text-text-primary">{patientEmail}</span>
                    </div>
                    <p className="font-medium text-text-primary">{r.report_type}</p>
                    {r.summary && <p className="mt-2 text-sm text-text-secondary">{r.summary}</p>}
                    {r.report_url && (
                      <a
                        href={r.report_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm text-teal hover:underline"
                      >
                        View report
                      </a>
                    )}
                    <p className="mt-2 text-xs text-text-muted">
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </GlassCard>
            );
          })
        ) : (
          <GlassCard className="p-8">
            <p className="text-text-secondary">No medical reports yet.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
