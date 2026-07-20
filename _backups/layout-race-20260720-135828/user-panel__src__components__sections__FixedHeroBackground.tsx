"use client";
import { useEffect, useRef, useState } from "react";

export function FixedHeroBackground({ children }: { children: React.ReactNode }) {
  const heroRef    = useRef<HTMLDivElement>(null);
  const spacerRef  = useRef<HTMLDivElement>(null);

  const [heroHeight, setHeroHeight] = useState<number>(0);

  const heroHeightRef  = useRef<number>(0);
  const lastBottomRef  = useRef<number>(-1);
  const lastVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    heroHeightRef.current = heroHeight;
  }, [heroHeight]);

  // Measure hero height for spacer
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const measure = () => {
      const h = el.offsetHeight;
      if (h > 0) {
        setHeroHeight((prev) => (prev !== h ? h : prev));
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // High-performance scroll tracking
  useEffect(() => {
    let rafId = 0;

    const update = () => {
      const hero = heroRef.current;
      if (!hero) { rafId = 0; return; }

      // Sync top with header
      const header = document.querySelector("header");
      if (header) {
        const bottom = Math.max(0, header.getBoundingClientRect().bottom);
        if (bottom !== lastBottomRef.current) {
          lastBottomRef.current = bottom;
          hero.style.top = `${bottom}px`;
        }
      }

      // Hide when scrolled past hero (prevents bleeding into footer)
      const h = heroHeightRef.current;
      if (h > 0) {
        const shouldShow = window.scrollY < h * 1.5;
        if (shouldShow !== lastVisibleRef.current) {
          lastVisibleRef.current = shouldShow;
          hero.style.visibility = shouldShow ? "visible" : "hidden";
          hero.style.opacity    = shouldShow ? "1" : "0";
        }
      }

      rafId = 0;
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div
        ref={heroRef}
        className="fixed left-0 w-full z-0 overflow-hidden"
        style={{
          top:        "0px",
          opacity:    1,
          visibility: "visible",
          transform:  "translateZ(0)",
          willChange: "transform",
        }}
      >
        {children}
      </div>

      <div
        ref={spacerRef}
        aria-hidden="true"
        className="w-full pointer-events-none"
        style={{ height: heroHeight > 0 ? `${heroHeight}px` : "100vh" }}
      />
    </>
  );
}