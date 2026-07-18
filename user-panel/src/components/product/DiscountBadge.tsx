"use client";
import { cn } from "@/lib/utils";

/**
 * Elegant discount ribbon for product images.
 * Refined and prominent, but tasteful — matches premium brand identity.
 */
interface Props {
  percent: number;
  className?: string;
  variant?: "corner" | "floating";
}

export function DiscountBadge({ percent, className, variant = "corner" }: Props) {
  if (!percent || percent <= 0) return null;

  if (variant === "floating") {
    return (
      <div
        className={cn(
          "absolute top-3 left-3 z-20 bg-[#1a1a1a] text-white shadow-lg",
          "text-[10px] font-bold tracking-[0.16em] uppercase px-3 py-1.5",
          className
        )}
      >
        {percent}% OFF
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute top-0 left-0 z-30 pointer-events-none",
        className
      )}
    >
      <div className="relative">
        {/* Main ribbon — refined gold on cream */}
        <div className="relative bg-[#1a1a1a] text-white pl-4 pr-5 py-2.5 shadow-xl overflow-hidden">
          <div className="relative flex items-center gap-2 leading-none">
            <span className="font-[family-name:var(--font-playfair)] text-2xl sm:text-[28px] font-bold tabular-nums text-[#c9a96e]">
              {percent}%
            </span>
            <span className="flex flex-col text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase">
              <span>Off</span>
              <span className="text-[#c9a96e]">Today</span>
            </span>
          </div>

          {/* Gold accent line at bottom */}
          <div className="absolute left-0 right-0 bottom-0 h-[3px] bg-[#c9a96e]" />
        </div>

        {/* Angled tail — matches ribbon color */}
        <svg
          className="absolute top-0 -right-4 h-full"
          viewBox="0 0 16 60"
          preserveAspectRatio="none"
          aria-hidden
        >
          <polygon points="0,0 16,30 0,60" fill="#1a1a1a" />
          <line x1="0" y1="57" x2="10" y2="41" stroke="#c9a96e" strokeWidth="3" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Inline pill — kept for other places but restyled to be subtle.
 * Not used on product detail (banner replaces it).
 */
export function DiscountInlinePill({ percent, className }: { percent: number; className?: string }) {
  if (!percent || percent <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1",
        "bg-[#1a1a1a] text-white",
        "text-[10px] font-bold tracking-[0.16em] uppercase",
        className
      )}
    >
      -{percent}%
    </span>
  );
}