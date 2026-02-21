"use client";

import { cn } from "@/lib/utils";

export interface TextGradientProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function TextGradient({ children, className, ...props }: TextGradientProps) {
  return (
    <span
      className={cn("text-gradient", className)}
      style={{
        background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
      {...props}
    >
      {children}
    </span>
  );
}
