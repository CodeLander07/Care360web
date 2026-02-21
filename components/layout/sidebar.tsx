"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type NavRole = "admin" | "clinician" | "nurse" | "patient";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  roles?: NavRole[];
}

export interface SidebarProps {
  items: NavItem[];
  activePath?: string;
  currentRole?: NavRole;
  collapsed?: boolean;
  className?: string;
}

export function Sidebar({
  items,
  activePath = "",
  currentRole = "clinician",
  collapsed = false,
  className,
}: SidebarProps) {
  const visibleItems = items.filter(
    (item) => !item.roles || item.roles.includes(currentRole)
  );

  return (
    <aside
      className={cn(
        "flex flex-col bg-navy-light border-r border-white/5 min-h-screen transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main navigation">
        {visibleItems.map((item, index) => {
          const isActive = activePath === item.href || activePath.startsWith(item.href + "/");
          return (
            <motion.a
              key={item.href}
              href={item.href}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                "hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-navy-light",
                isActive
                  ? "bg-teal/20 text-teal border border-teal/30"
                  : "text-text-secondary hover:text-text-primary border border-transparent",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              {item.icon && (
                <span className="flex-shrink-0 text-lg" aria-hidden>
                  {item.icon}
                </span>
              )}
              {!collapsed && <span>{item.label}</span>}
            </motion.a>
          );
        })}
      </nav>
    </aside>
  );
}
