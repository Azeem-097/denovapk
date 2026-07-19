import { cn } from "@/lib/utils";

interface BadgeProps {
  children:  React.ReactNode;
  className?: string;
  variant?:  "default" | "success" | "warning" | "danger" | "info" | "gold";
  size?:     "sm" | "md";
}

const VARIANTS = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger:  "bg-red-100 text-red-700",
  info:    "bg-blue-100 text-blue-700",
  gold:    "bg-[#f5f0e8] text-[#3b5f8f]",
};

export function Badge({
  children, className, variant = "default", size = "sm",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold uppercase tracking-wide",
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}