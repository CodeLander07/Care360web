import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";
import Link from "next/link";

export default async function HospitalOrganizationsPage() {
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
          <p className="text-text-secondary">No organization linked. Register an organization to get started.</p>
          <Link
            href="/dashboard/hospital/register-organization"
            className="mt-4 inline-block rounded-full bg-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-teal/90"
          >
            Register organization
          </Link>
        </GlassCard>
      </div>
    );
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, type, address, phone, description")
    .eq("id", orgId)
    .single();

  const { data: doctors } = await supabase
    .from("doctors")
    .select("id, name, specialization, experience_years, bio, fee_per_min, services, is_online")
    .eq("organization_id", orgId)
    .order("name");

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-semibold text-text-primary">
        Hospitals & Doctors
      </h1>
      <p className="mb-6 text-sm text-text-muted">
        View your listed hospitals and their doctor details.
      </p>

      <GlassCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                  Hospital / Clinic
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                  Address
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                  Doctors
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="px-6 py-4">
                  <p className="font-medium text-text-primary">{org?.name ?? "—"}</p>
                  {org?.description && (
                    <p className="mt-1 text-xs text-text-muted line-clamp-2">{org.description}</p>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary capitalize">
                  {org?.type ?? "—"}
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary max-w-[180px]">
                  {org?.address ?? "—"}
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {org?.phone ?? "—"}
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-3">
                    {doctors && doctors.length > 0 ? (
                      doctors.map((d) => (
                        <div
                          key={d.id}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                        >
                          <p className="font-medium text-text-primary">{d.name}</p>
                          <p className="text-xs text-text-muted">
                            {d.specialization}
                            {d.experience_years > 0 && ` • ${d.experience_years} yrs`}
                          </p>
                          {d.bio && (
                            <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                              {d.bio}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {d.fee_per_min != null && (
                              <span className="rounded bg-teal/20 px-1.5 py-0.5 text-[10px] text-teal">
                                ₹{d.fee_per_min}/min
                              </span>
                            )}
                            {d.is_online && (
                              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-400">
                                Online
                              </span>
                            )}
                            {Array.isArray(d.services) && d.services.length > 0 && (
                              <span className="text-[10px] text-text-muted">
                                {d.services.slice(0, 2).join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-text-muted">No doctors yet</p>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>

      <div className="mt-6 flex gap-4">
        <Link
          href="/dashboard/hospital/complete-profile"
          className="text-sm text-teal hover:underline"
        >
          Edit organization & doctors
        </Link>
        <Link
          href="/dashboard/hospital/register-organization"
          className="text-sm text-text-muted hover:text-text-primary"
        >
          Register another organization
        </Link>
      </div>
    </div>
  );
}
