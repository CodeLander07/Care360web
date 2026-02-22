import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as string) || "patient";
  const isHospitalAdmin = role === "hospital_admin" || role === "admin";

  return (
    <div className="flex min-h-screen">
      <DashboardNav role={role} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
