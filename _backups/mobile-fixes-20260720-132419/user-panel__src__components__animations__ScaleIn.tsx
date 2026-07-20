"use client";
import { useEffect, useRef, useState } from "react";
import { useDevicePerformance } from "./useDevicePerformance";
import { cn } from "@/lib/utils";

interface ScaleInProps {
  children:   React.ReactNode;
  className?: string;
  from?:      number;    // start scale (0-1)
  delay?:     number;
  duration?:  number;
  threshold?: number;
}

export function ScaleIn({
  children,
  className,
  from      = 0.85,
  delay     = 0,
  duration  = 600,
  threshold = 0.2,
}: ScaleInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { shouldAnimate } = useDevicePerformance();

  useEffect(() => {
    if (!shouldAnimate) { setIsVisible(true); return; }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [shouldAnimate, threshold]);

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "scale(1)" : `scale(${from})`,
        transition: shouldAnimate
          ? `opacity ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1), transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`
          : "none",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}