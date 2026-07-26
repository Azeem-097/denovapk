import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-[#1a1a1a] text-white hover:bg-[#333333] focus:ring-[#1a1a1a] active:scale-[0.98]",
      secondary:
        "bg-[#f5f0e8] text-[#1a1a1a] hover:bg-[#ede8df] focus:ring-[#E10600] active:scale-[0.98]",
      outline:
        "border border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white focus:ring-[#1a1a1a] active:scale-[0.98]",
      ghost:
        "text-[#1a1a1a] hover:bg-[#f5f0e8] focus:ring-[#E10600] active:scale-[0.98]",
      gold:
        "bg-[#E10600] text-white hover:bg-[#B80000] focus:ring-[#E10600] active:scale-[0.98]",
    };

    const sizes = {
      sm: "text-xs px-4 py-2 rounded",
      md: "text-sm px-6 py-3 rounded",
      lg: "text-base px-8 py-4 rounded",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };