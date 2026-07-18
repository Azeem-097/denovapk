"use client";
import { useEffect, useState } from "react";
import { useDevicePerformance } from "./useDevicePerformance";

/**
 * Thin gold progress bar at the top of the page.
 * Reflects how far the user has scrolled through the current page.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const { shouldAnimate } = useDevicePerformance();

  useEffect(() => {
    if (!shouldAnimate) return;

    let ticking = false;

    const updateProgress = () => {
      const scrollTop    = window.scrollY;
      const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled     = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(scrolled);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", onScroll);
  }, [shouldAnimate]);

  if (!shouldAnimate) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-[2px] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#c9a96e] via-[#d4b47a] to-[#c9a96e] shadow-[0_0_8px_rgba(201,169,110,0.6)]"
        style={{
          width: `${progress}%`,
          transition: "width 100ms ease-out",
        }}
      />
    </div>
  );
}