"use client";
import { useEffect, useRef, useState } from "react";
import { useDevicePerformance } from "./useDevicePerformance";
import { cn } from "@/lib/utils";

interface ParallaxImageProps {
  children:   React.ReactNode;
  className?: string;
  speed?:     number;    // 0 = no move, 0.5 = half scroll speed, negative = reverse
}

export function ParallaxImage({
  children,
  className,
  speed = 0.15,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const { shouldAnimate } = useDevicePerformance();

  useEffect(() => {
    if (!shouldAnimate) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking && ref.current) {
        window.requestAnimationFrame(() => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            const dist    = centerY - window.innerHeight / 2;
            setOffset(dist * speed * -1);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [shouldAnimate, speed]);

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <div
        style={{
          transform: shouldAnimate ? `translate3d(0, ${offset}px, 0)` : "none",
          willChange: shouldAnimate ? "transform" : "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}