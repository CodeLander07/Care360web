import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HospitalDashboardPage() {
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
        <h1 className="mb-4 text-2xl font-semibold text-text-primary">Hospital Dashboard</h1>
        <GlassCard className="p-6">
          <p className="mb-4 text-text-secondary">No organization linked. Register an organization to get started.</p>
          <Link
            href="/dashboard/hospital/register-organization"
            className="inline-block rounded-full bg-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-teal/90"
          >
            Register organization
          </Link>
        </GlassCard>
      </div>
    );
  }

  const { data: doctors } = await supabase.from("doctors").select("id").eq("organization_id", orgId);
  if (!doctors?.length) {
    redirect("/dashboard/hospital/complete-profile");
  }

  const [patientsRes, appointmentsRes, prescriptionsRes, reportsRes] = await Promise.all([
    supabase.from("appointments").select("patient_id").eq("organization_id", orgId),
    supabase.from("appointments").select("id, status, scheduled_at").eq("organization_id", orgId),
    supabase.from("prescriptions").select("id").eq("organization_id", orgId),
    supabase.from("medical_reports").select("id").eq("organization_id", orgId),
  ]);

  const uniquePatients = new Set(patientsRes.data?.map((a) => a.patient_id) ?? []);
  const pendingAppointments = appointmentsRes.data?.filter((a) => a.status === "pending").length ?? 0;

  const stats = [
    { label: "Patients Connected", value: uniquePatients.size, href: "/dashboard/hospital/patients" },
    { label: "Appointment Requests", value: pendingAppointments, href: "/dashboard/hospital/appointments" },
    { label: "Prescriptions", value: prescriptionsRes.data?.length ?? 0, href: "/dashboard/hospital/prescriptions" },
    { label: "EMR Reports", value: reportsRes.data?.length ?? 0, href: "/dashboard/hospital/reports" },
  ];

  return (
    <div className="p-8">
      <h1 className="mb-8 text-2xl font-semibold text-text-primary">
        Hospital Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <GlassCard className="p-6 hover:border-teal/30 transition-colors">
              <p className="text-sm text-text-muted">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold text-text-primary">{stat.value}</p>
            </GlassCard>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Overview</h2>
          <p className="text-sm text-text-secondary">
            Manage patients, appointment requests, prescriptions, and electronic medical reports from this dashboard.
          </p>
        </GlassCard>
        <GlassCard className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Quick links</h2>
          <div className="space-y-2">
            <Link href="/dashboard/hospital/hospitals" className="block text-text-secondary hover:text-teal">Hospitals & doctors</Link>
            <Link href="/dashboard/hospital/register-organization" className="block text-text-secondary hover:text-teal">Register organization</Link>
            <Link href="/dashboard/hospital/patients" className="block text-text-secondary hover:text-teal">View patients</Link>
            <Link href="/dashboard/hospital/appointments" className="block text-text-secondary hover:text-teal">Appointment requests</Link>
            <Link href="/dashboard/hospital/prescriptions" className="block text-text-secondary hover:text-teal">Prescriptions</Link>
            <Link href="/dashboard/hospital/reports" className="block text-text-secondary hover:text-teal">EMR Reports</Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
