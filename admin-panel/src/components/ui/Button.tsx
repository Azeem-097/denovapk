import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?:      "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium tracking-wide transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed gap-2";

    const variants = {
      primary:   "bg-[#1a1a1a] text-white hover:bg-[#333]",
      secondary: "bg-[#f5f0e8] text-[#1a1a1a] hover:bg-[#ede8df]",
      outline:   "border border-[#e5e7eb] text-[#1a1a1a] hover:bg-[#f8f9fa]",
      ghost:     "text-[#6b7280] hover:bg-[#f8f9fa] hover:text-[#1a1a1a]",
      danger:    "bg-red-500 text-white hover:bg-red-600",
    };

    const sizes = {
      sm:   "text-xs px-3 py-1.5",
      md:   "text-sm px-4 py-2",
      lg:   "text-sm px-6 py-3",
      icon: "text-sm p-2",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </>
        ) : children}
      </button>
    );
  }
);
Button.displayName = "Button";
export { Button };