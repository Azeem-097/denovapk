"use client";
import { cn } from "@/lib/utils";

/**
 * Simple square SALE badge — sits at the top-left of the primary product image.
 *
 * Design: bold red square, white "SALE" text, high contrast, no ornament.
 * Renders NOTHING when percent <= 0 (so it's safe to always mount).
 */
interface Props {
  percent: number;
  className?: string;
  /** kept for backwards compatibility — both variants render the same SALE square now */
  variant?: "corner" | "floating";
}

export function DiscountBadge({ percent, className }: Props) {
  if (!percent || percent <= 0) return null;

  return (
    <div
      className={cn(
        "absolute top-3 left-3 z-20 pointer-events-none",
        "bg-[#e32c52] text-white",
        "px-3 py-1.5 shadow-md rounded-lg",
        "text-[11px] font-bold tracking-[0.2em] uppercase",
        className
      )}
      aria-label={`On sale - ${percent}% off`}
    >
      SALE
    </div>
  );
}

/**
 * Legacy inline pill kept for anywhere it was already used (e.g. product cards).
 */
export function DiscountInlinePill({ percent, className }: { percent: number; className?: string }) {
  if (!percent || percent <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-md",
        "bg-[#e32c52] text-white",
        "text-[10px] font-bold tracking-[0.16em] uppercase",
        className
      )}
    >
      -{percent}%
    </span>
  );
}