import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "new" | "sale" | "bestseller" | "soldout" | "default";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    new:        "bg-[#1a1a1a] text-white",
    sale:       "bg-[#c9a96e] text-white",
    bestseller: "bg-[#f5f0e8] text-[#1a1a1a]",
    soldout:    "bg-[#6b7280] text-white",
    default:    "bg-[#e5e7eb] text-[#1a1a1a]",
  };

  return (
    <span
      className={cn(
        "inline-block text-[10px] font-semibold tracking-widest uppercase px-2 py-1",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}