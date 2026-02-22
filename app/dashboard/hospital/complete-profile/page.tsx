import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";
import { ClinicCompleteProfileForm } from "@/components/consultancy/clinic-complete-profile-form";

export default async function ClinicCompleteProfilePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single();

  const role = profile?.role as string;
  if (role !== "hospital_admin" && role !== "admin") {
    redirect("/dashboard");
  }

  const orgId = profile?.organization_id;
  if (!orgId) {
    redirect("/dashboard/hospital");
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, type, address, description, phone")
    .eq("id", orgId)
    .single();

  const { data: doctors } = await supabase
    .from("doctors")
    .select("id")
    .eq("organization_id", orgId);

  if (doctors?.length && doctors.length > 0) {
    redirect("/dashboard/hospital");
  }

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-semibold text-text-primary">
        Complete clinic profile
      </h1>
      <p className="mb-6 text-sm text-text-muted">
        Add clinic details and doctor information to appear in the Consultancy service for patients.
      </p>
      <GlassCard className="p-6">
        <ClinicCompleteProfileForm organization={org} />
      </GlassCard>
    </div>
  );
}
