"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 hover:shadow-blue-500/30",
        secondary:
          "border-2 border-white/30 bg-transparent text-text-primary hover:bg-white/5 hover:border-white/50",
        teal: "bg-teal text-white shadow-lg shadow-teal/25 hover:bg-teal/90 hover:shadow-teal/30",
        ghost:
          "text-text-secondary hover:bg-white/5 hover:text-text-primary",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-12 px-8 text-lg",
        icon: "h-10 w-10",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
