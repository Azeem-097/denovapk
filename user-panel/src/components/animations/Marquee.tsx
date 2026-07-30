"use client";
import { cn } from "@/lib/utils";
import { useDevicePerformance } from "./useDevicePerformance";

interface MarqueeProps {
  items:      string[];
  className?: string;
  duration?:  number;
  pauseOnHover?: boolean;
  itemColor?: string;
}

const ACCENT = "#F97316";

export function Marquee({
  items,
  className,
  duration = 30,
  pauseOnHover = true,
  itemColor = ACCENT,
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
        style={{ animationDuration: `${duration}s` }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-6 px-6 text-[11px] font-semibold tracking-[0.25em] uppercase whitespace-nowrap"
            style={{ color: itemColor }}
          >
            <span
              className="w-1 h-1 rounded-full flex-shrink-0"
              style={{ backgroundColor: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }}
            />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
