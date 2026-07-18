"use client";
import { cn } from "@/lib/utils";
import { useDevicePerformance } from "./useDevicePerformance";

interface MarqueeProps {
  items:      string[];
  className?: string;
  duration?:  number;  // seconds
  pauseOnHover?: boolean;
}

/**
 * Infinite horizontal marquee. Duplicates items twice so the loop is seamless.
 */
export function Marquee({
  items,
  className,
  duration = 30,
  pauseOnHover = true,
}: MarqueeProps) {
  const { shouldAnimate } = useDevicePerformance();

  const doubled = [...items, ...items];

  return (
    <div className={cn("overflow-hidden", className)} aria-hidden="true">
      <div
        className={cn(
          "flex w-max",
          shouldAnimate && "animate-marquee",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
        style={{
          animationDuration: `${duration}s`,
        }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-6 px-6 text-[11px] font-semibold tracking-[0.25em] uppercase text-[#c9a96e]/70 whitespace-nowrap"
          >
            <span className="w-1 h-1 rounded-full bg-[#c9a96e]/60 flex-shrink-0" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}