"use client";
import { useEffect, useRef, useState } from "react";
import { useDevicePerformance } from "./useDevicePerformance";

interface CountUpProps {
  end:        number;
  start?:     number;
  duration?:  number;   // ms
  suffix?:    string;
  prefix?:    string;
  className?: string;
  threshold?: number;
}

export function CountUp({
  end,
  start     = 0,
  duration  = 1800,
  suffix    = "",
  prefix    = "",
  className,
  threshold = 0.4,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(start);
  const [triggered, setTriggered] = useState(false);
  const { shouldAnimate } = useDevicePerformance();

  useEffect(() => {
    if (!shouldAnimate) { setCount(end); return; }
    if (triggered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [shouldAnimate, triggered, threshold, end]);

  useEffect(() => {
    if (!triggered) return;

    const startTime = performance.now();
    const range     = end - start;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = Math.round(start + range * eased);
      setCount(value);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [triggered, start, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}