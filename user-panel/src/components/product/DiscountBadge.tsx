"use client";
import { cn } from "@/lib/utils";

/**
 * Corner ribbon that shows on the product image when a discount is active.
 * Compute percentage yourself, e.g.:
 *   const pct = Math.round((1 - price / compareAtPrice) * 100);
 *
 * Position it inside a `relative` parent (typically the product image wrapper).
 * Uses absolute positioning + z-index so it floats on the top-left corner.
 */
interface Props {
  percent: number;
  className?: string;
  /** "corner" (default) = top-left ribbon; "floating" = subtle top-left pill */
  variant?: "corner" | "floating";
}

export function DiscountBadge({ percent, className, variant = "corner" }: Props) {
  if (!percent || percent <= 0) return null;

  if (variant === "floating") {
    return (
      <div
        className={cn(
          "absolute top-3 left-3 z-20 bg-[#1a1a1a] text-white text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 shadow-md",
          className
        )}
      >
        -{percent}% Off
      </div>
    );
  }

  // Corner ribbon
  return (
    <div
      className={cn(
        "absolute top-0 left-0 z-20 pointer-events-none",
        className
      )}
    >
      <div className="relative">
        {/* Main ribbon body */}
        <div className="bg-[#c9a96e] text-white pl-3 pr-4 py-1.5 shadow-lg">
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase opacity-90">
              Save
            </span>
            <span className="font-[family-name:var(--font-playfair)] text-lg font-bold tracking-tight tabular-nums">
              {percent}%
            </span>
          </div>
        </div>

        {/* Angled tail on the right — SVG for crisp edges */}
        <svg
          className="absolute top-0 -right-3 h-full"
          viewBox="0 0 12 44"
          preserveAspectRatio="none"
          aria-hidden
        >
          <polygon points="0,0 12,22 0,44" fill="#c9a96e" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Inline pill version — small, sits next to the price.
 */
export function DiscountInlinePill({ percent, className }: { percent: number; className?: string }) {
  if (!percent || percent <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 bg-[#c9a96e] text-white text-[10px] font-bold tracking-[0.1em] uppercase",
        className
      )}
    >
      {percent}% Off
    </span>
  );
}