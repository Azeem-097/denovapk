"use client";
import { useEffect, useRef, useState } from "react";
import { useDevicePerformance } from "./useDevicePerformance";
import { cn } from "@/lib/utils";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;      // ms
  duration?: number;   // ms
  threshold?: number;  // 0-1
  once?: boolean;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 600,
  threshold = 0.15,
  once = true,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { shouldAnimate } = useDevicePerformance();

  useEffect(() => {
    if (!shouldAnimate) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [shouldAnimate, threshold, once]);

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(16px)",
        transition: shouldAnimate
          ? `opacity ${duration}ms ease, transform ${duration}ms ease`
          : "none",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}