import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";
import Link from "next/link";

export default async function UserDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [consultations, appointments, reminders, drugs, prescriptions] = await Promise.all([
    supabase.from("consultations").select("id").eq("user_id", user.id),
    supabase.from("appointments").select("id, scheduled_at, status").eq("patient_id", user.id),
    supabase.from("reminders").select("id, title, due_at, is_completed").eq("user_id", user.id),
    supabase.from("drug_recommendations").select("id, drug_name").eq("user_id", user.id),
    supabase.from("prescriptions").select("id").eq("patient_id", user.id),
  ]);
  const { data: rppgSessions } = await supabase.from("rppg_sessions").select("id").eq("user_id", user.id);
  const rppgCount = rppgSessions?.length ?? 0;

  const stats = [
    { label: "Consultations", value: consultations.data?.length ?? 0, href: "/dashboard/user/reports" },
    { label: "Upcoming Appointments", value: appointments.data?.filter((a) => a.status !== "cancelled").length ?? 0, href: "/dashboard/user/appointments" },
    { label: "Prescriptions", value: prescriptions.data?.length ?? 0, href: "/dashboard/user/prescriptions" },
    { label: "Reminders", value: reminders.data?.filter((r) => !r.is_completed).length ?? 0, href: "/dashboard/user/reminders" },
    { label: "Drug Recommendations", value: drugs.data?.length ?? 0, href: "/dashboard/user/drugs" },
    { label: "Heart rate", value: rppgCount, href: "/dashboard/user/heart-rate" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary">Welcome back</h1>
        {user.email && (
          <p className="mt-1 text-sm text-text-muted">{user.email}</p>
        )}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <GlassCard className="p-6 transition-colors hover:border-teal/30">
              <p className="text-sm text-text-muted">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold text-text-primary">{stat.value}</p>
            </GlassCard>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Quick actions</h2>
          <div className="space-y-2">
            <Link href="/dashboard/user/heart-rate" className="block text-text-secondary hover:text-teal">Measure heart rate</Link>
            <Link href="/dashboard/user/appointments" className="block text-text-secondary hover:text-teal">Consultancy & appointments</Link>
            <Link href="/dashboard/user/prescriptions" className="block text-text-secondary hover:text-teal">View prescriptions</Link>
            <Link href="/dashboard/user/reports" className="block text-text-secondary hover:text-teal">View reports</Link>
            <Link href="/dashboard/user/reminders" className="block text-text-secondary hover:text-teal">Manage reminders</Link>
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Recent activity</h2>
          <p className="text-sm text-text-muted">Your collected data, reports, and appointments appear here.</p>
        </GlassCard>
      </div>
    </div>
  );
}
