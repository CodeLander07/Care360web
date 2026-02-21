"use client";

import { useState } from "react";
import { Sidebar, type NavItem, type NavRole } from "./sidebar";
import { cn } from "@/lib/utils";

export interface AppLayoutProps {
  children: React.ReactNode;
  navItems?: NavItem[];
  activePath?: string;
  currentRole?: NavRole;
  header?: React.ReactNode;
  className?: string;
}

const defaultNavItems: NavItem[] = [
  { label: "Dashboard", href: "/", roles: ["admin", "clinician", "nurse"] },
  { label: "Patients", href: "/patients", roles: ["admin", "clinician", "nurse"] },
  { label: "Care Plans", href: "/care-plans", roles: ["admin", "clinician"] },
  { label: "Analytics", href: "/analytics", roles: ["admin"] },
  { label: "Settings", href: "/settings" },
];

export function AppLayout({
  children,
  navItems = defaultNavItems,
  activePath = "/",
  currentRole = "clinician",
  header,
  className,
}: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={cn("flex min-h-screen bg-navy", className)}>
      <Sidebar
        items={navItems}
        activePath={activePath}
        currentRole={currentRole}
        collapsed={sidebarCollapsed}
      />
      <div className="flex flex-1 flex-col min-w-0">
        {header && (
          <header className="sticky top-0 z-10 border-b border-white/5 bg-navy/95 backdrop-blur-md">
            {header}
          </header>
        )}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
