"use client";
import { useEffect, useRef, useState } from "react";
import { useDevicePerformance } from "./useDevicePerformance";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
}

export function TextReveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
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
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [shouldAnimate]);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={cn("overflow-hidden", className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
        transition: shouldAnimate
          ? `opacity 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
             transform 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
          : "none",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}