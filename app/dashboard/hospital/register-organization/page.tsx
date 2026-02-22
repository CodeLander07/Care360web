import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";
import { RegisterOrganizationForm } from "@/components/consultancy/register-organization-form";

export default async function RegisterOrganizationPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role as string;
  if (role !== "hospital_admin" && role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-semibold text-text-primary">
        Register organization
      </h1>
      <p className="mb-6 text-sm text-text-muted">
        Add a hospital, clinic, or consultancy to make it available for patients in the Consultancy service.
      </p>
      <GlassCard className="p-6">
        <RegisterOrganizationForm />
      </GlassCard>
    </div>
  );
}
