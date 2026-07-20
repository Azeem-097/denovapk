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

/**
 * TextReveal — fades + slides text upward on scroll into view.
 *
 * NOTE on descenders:
 *   We use `overflow-hidden` so the initial 24px offset doesn't
 *   flash before animation. But `overflow-hidden` will clip
 *   letter descenders (p, y, g, j, q).
 *
 *   Fix: add pb-[0.15em] so the container has room for descenders
 *   without visibly increasing spacing (0.15em ≈ typical descender).
 *   Also use leading-[1.15] to give a tiny bit of breathing room.
 */
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
      className={cn("overflow-hidden pb-[0.15em]", className)}
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