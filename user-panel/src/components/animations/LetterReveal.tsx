"use client";
import { useEffect, useRef, useState } from "react";
import { useDevicePerformance } from "./useDevicePerformance";
import { cn } from "@/lib/utils";

interface LetterRevealProps {
  text:       string;
  className?: string;
  delay?:     number;     // start delay
  stagger?:   number;     // ms between letters
  threshold?: number;
  as?:        "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
}

export function LetterReveal({
  text,
  className,
  delay     = 0,
  stagger   = 40,
  threshold = 0.3,
  as: Tag   = "span",
}: LetterRevealProps) {
  const ref = useRef<HTMLElement>(null);
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

  // Split into words to preserve line breaks
  const words = text.split(" ");

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={cn("inline-block", className)}
      aria-label={text}
    >
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap" aria-hidden="true">
          {word.split("").map((char, ci) => {
            const index = words.slice(0, wi).reduce((sum, w) => sum + w.length, 0) + ci;
            return (
              <span
                key={ci}
                className="inline-block"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(0.5em)",
                  transition: shouldAnimate
                    ? `opacity 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
                    : "none",
                  transitionDelay: `${delay + index * stagger}ms`,
                }}
              >
                {char}
              </span>
            );
          })}
          {wi < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}