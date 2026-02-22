"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const userNavItems = [
  { href: "/dashboard/user", label: "Overview" },
  { href: "/dashboard/user/chat", label: "AI Assistant" },
  { href: "/dashboard/user/heart-rate", label: "Heart Rate" },
  { href: "/dashboard/user/data", label: "My Data" },
  { href: "/dashboard/user/reports", label: "Reports" },
  { href: "/dashboard/user/appointments", label: "Consultancy" },
  { href: "/dashboard/user/prescriptions", label: "Prescriptions" },
  { href: "/dashboard/user/reminders", label: "Reminders" },
  { href: "/dashboard/user/drugs", label: "Drug Recommendations" },
];

const hospitalNavItems = [
  { href: "/dashboard/hospital", label: "Overview" },
  { href: "/dashboard/hospital/hospitals", label: "Hospitals & Doctors" },
  { href: "/dashboard/hospital/register-organization", label: "Register organization" },
  { href: "/dashboard/hospital/patients", label: "Patients" },
  { href: "/dashboard/hospital/appointments", label: "Appointments" },
  { href: "/dashboard/hospital/prescriptions", label: "Prescriptions" },
  { href: "/dashboard/hospital/reports", label: "EMR Reports" },
];

export function DashboardNav({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const isHospitalAdmin = role === "hospital_admin" || role === "admin";
  const navItems = isHospitalAdmin ? hospitalNavItems : userNavItems;
  const basePath = isHospitalAdmin ? "/dashboard/hospital" : "/dashboard/user";

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="flex w-64 flex-col border-r border-white/5 bg-navy-light">
      <div className="flex h-16 items-center gap-2 border-b border-white/5 px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/weblogo.png"
            alt="Care360"
            width={256}
            height={72}
            priority
          />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-lg px-4 py-3 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-teal/20 text-teal"
                : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/5 p-4">
        <Link
          href="/"
          className="block rounded-lg px-4 py-3 text-sm text-text-muted hover:text-text-primary"
        >
          Back to home
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="block w-full rounded-lg px-4 py-3 text-left text-sm text-text-muted hover:bg-white/5 hover:text-text-primary"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
