import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";
import { ConsultancyListing } from "@/components/consultancy/consultancy-listing";

type OrganizationSummary = { name: string; type: string };

type DoctorItem = {
  id: string;
  name: string;
  specialization: string;
  experience_years: number;
  bio: string | null;
  avatar_url: string | null;
  fee_per_min: number | null;
  rating: number;
  sessions_count: number;
  is_online: boolean;
  services: string[] | null;
  organization_id: string;
  organizations: OrganizationSummary | null;
};

type AppointmentItem = {
  id: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  type: string;
  organizations: OrganizationSummary | null;
};

export default async function UserAppointmentsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [doctorsRes, apptsRes] = await Promise.all([
    supabase
      .from("doctors")
      .select(`
        id, name, specialization, experience_years, bio, avatar_url,
        fee_per_min, rating, sessions_count, is_online, services, organization_id,
        organizations (name, type)
      `)
      .order("sessions_count", { ascending: false }),
    supabase
      .from("appointments")
      .select(`
        id, scheduled_at, status, notes, type,
        organizations (name, type)
      `)
      .eq("patient_id", user.id)
      .order("scheduled_at", { ascending: false }),
  ]);

  const doctors: DoctorItem[] = (doctorsRes.data ?? []).map((doctor) => ({
    ...doctor,
    organizations: Array.isArray(doctor.organizations)
      ? (doctor.organizations[0] ?? null)
      : (doctor.organizations ?? null),
  }));

  const appointments: AppointmentItem[] = (apptsRes.data ?? []).map((appointment) => ({
    ...appointment,
    organizations: Array.isArray(appointment.organizations)
      ? (appointment.organizations[0] ?? null)
      : (appointment.organizations ?? null),
  }));

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-semibold text-text-primary">
        Consultancy
      </h1>
      <p className="mb-6 text-sm text-text-muted">
        Browse doctors and clinics, schedule appointments, and manage your bookings.
      </p>

      <ConsultancyListing doctors={doctors} appointments={appointments} />
    </div>
  );
}
