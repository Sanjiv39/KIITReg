import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2fe] disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black shadow-[0_4px_15px_rgba(0,242,254,0.3)] hover:shadow-[0_6px_20px_rgba(0,242,254,0.5)] hover:-translate-y-0.5",
        secondary:
          "bg-transparent text-white border border-white/10 backdrop-blur-sm hover:border-[#00f2fe] hover:text-[#00f2fe]",
        whatsapp:
          "bg-[#25D366] text-white shadow-[0_4px_15px_rgba(37,211,102,0.3)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.5)] hover:-translate-y-0.5",
        email:
          "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.5)] hover:-translate-y-0.5",
        outline:
          "border border-white/10 bg-white/5 hover:bg-white/10 text-white",
        ghost: "hover:bg-white/10 text-white",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
