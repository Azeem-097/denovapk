"use client";
import { useEffect, useRef, useState } from "react";
import { useDevicePerformance } from "./useDevicePerformance";
import { cn } from "@/lib/utils";

interface SlideInProps {
  children:   React.ReactNode;
  className?: string;
  from?:      "left" | "right" | "top" | "bottom";
  distance?:  number;
  delay?:     number;
  duration?:  number;
  threshold?: number;
}

export function SlideIn({
  children,
  className,
  from      = "left",
  distance  = 40,
  delay     = 0,
  duration  = 700,
  threshold = 0.15,
}: SlideInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { shouldAnimate } = useDevicePerformance();

  useEffect(() => {
    if (!shouldAnimate) { setIsVisible(true); return; }

    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const inViewport =
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0;

    if (inViewport) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);

    const failsafe = setTimeout(() => setIsVisible(true), 1500);

    return () => {
      observer.disconnect();
      clearTimeout(failsafe);
    };
  }, [shouldAnimate, threshold]);

  const getTransform = () => {
    if (isVisible) return "translate(0, 0)";
    switch (from) {
      case "left":   return `translate(-${distance}px, 0)`;
      case "right":  return `translate(${distance}px, 0)`;
      case "top":    return `translate(0, -${distance}px)`;
      case "bottom": return `translate(0, ${distance}px)`;
    }
  };

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: shouldAnimate
          ? `opacity ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
          : "none",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}