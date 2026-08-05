import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-colors border",
        variant === "default" && "border-[#00f2fe]/30 bg-[#00f2fe]/10 text-[#00f2fe]",
        variant === "secondary" && "border-slate-700 bg-slate-800 text-slate-300",
        variant === "outline" && "border-white/20 text-white",
        className
      )}
      {...props}
    />
  );
}
