"use client";

import { cn } from "@/lib/utils";

export interface ScanLineProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enable scan line animation for monitoring-style UI */
  active?: boolean;
}

export function ScanLine({ active = true, className, ...props }: ScanLineProps) {
  if (!active) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden
      {...props}
    >
      <div
        className="h-px w-full bg-gradient-to-r from-transparent via-teal/30 to-transparent animate-scan-line"
        style={{ position: "absolute", top: 0, left: 0 }}
      />
    </div>
  );
}
