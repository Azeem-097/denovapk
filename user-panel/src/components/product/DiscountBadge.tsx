"use client";
import { cn } from "@/lib/utils";

/**
 * Small ribbon badge hanging from the TOP-LEFT edge of the image.
 * Pointed tail at the bottom, subtle fold shadow at the top-right.
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
          "absolute top-3 left-3 z-20 bg-[#e32c52] text-white shadow-md",
          "text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-1",
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
        "absolute top-0 left-4 z-30 pointer-events-none",
        className
      )}
    >
      <div className="flex flex-col items-stretch w-[52px]">
        {/* Ribbon body — starts flush at the very top */}
        <div className="bg-[#e32c52] text-white flex flex-col items-center justify-center pt-2.5 pb-2 px-1 shadow-lg">
          <span className="text-[18px] font-extrabold leading-none tabular-nums">
            {percent}%
          </span>
          <span className="text-[7px] font-bold tracking-[0.2em] uppercase mt-0.5">
            OFF
          </span>
        </div>

        {/* Pointed tail at bottom */}
        <svg
          className="w-[52px] h-[14px]"
          viewBox="0 0 52 14"
          preserveAspectRatio="none"
          aria-hidden
        >
          <polygon points="0,0 52,0 26,14" fill="#e32c52" />
        </svg>
      </div>
    </div>
  );
}

export function DiscountInlinePill({ percent, className }: { percent: number; className?: string }) {
  if (!percent || percent <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1",
        "bg-[#e32c52] text-white",
        "text-[10px] font-bold tracking-[0.16em] uppercase",
        className
      )}
    >
      -{percent}%
    </span>
  );
}