"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enable pulse glow animation on key elements */
  pulseGlow?: boolean;
  /** Stagger animation delay in seconds */
  delay?: number;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, pulseGlow, delay = 0, children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[1.75rem] border backdrop-blur-[20px] animate-fade-in-up",
          "border-[rgba(232,242,248,0.12)]",
          "bg-[rgba(15,36,53,0.85)]",
          pulseGlow && "animate-pulse-glow",
          className
        )}
        style={{
          ...style,
          animationDelay: `${delay}s`,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
