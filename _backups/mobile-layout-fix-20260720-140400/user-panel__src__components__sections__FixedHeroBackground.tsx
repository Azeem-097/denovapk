"use client";
import { useEffect, useRef, useState } from "react";

/**
 * FixedHeroBackground
 * ─────────────────────────────────────────────────────────────
 * Pins the hero as position:fixed BEHIND the main content shell,
 * so the shell "curtains up" over the hero as you scroll.
 *
 * CRITICAL: The spacer that reserves scroll space must render at
 * a REALISTIC height from the very first paint. Using "100vh" as
 * a fallback caused a huge void on first load because:
 *   - Actual hero height (16:9 image at 100% width) ~= 56.25vw
 *   - On a 1280px viewport that's ~720px, NOT 900px (100vh)
 *   - Fallback made content shell render 180px too low
 *   - When JS measured the real hero, content jumped up
 *   - On slow first render, users saw the void permanently
 *
 * SOLUTION: The spacer uses CSS aspect-ratio to compute its
 * height from viewport width without needing JS measurement.
 * Once ResizeObserver measures the actual hero height, we
 * override with the exact pixel value (for pixel-perfect scroll
 * math), but the initial paint is already correct.
 */
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

  // Measure hero height for spacer (once image loads)
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

  // Sync fixed hero's top with header, hide when scrolled past
  useEffect(() => {
    let rafId = 0;

    const update = () => {
      const hero = heroRef.current;
      if (!hero) { rafId = 0; return; }

      const header = document.querySelector("header");
      if (header) {
        const bottom = Math.max(0, header.getBoundingClientRect().bottom);
        if (bottom !== lastBottomRef.current) {
          lastBottomRef.current = bottom;
          hero.style.top = `${bottom}px`;
        }
      }

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

      {/*
        Spacer — reserves scroll space equal to the hero's height.
        BEFORE hero is measured: use CSS aspect-ratio so the spacer's
        height is calculated from viewport width. Works on first paint,
        no JS needed. AFTER hero is measured: override with exact px.

        Aspect ratios chosen to match the hero image ratios:
          Desktop banner: 16:9  → aspect-ratio: 16/9
          Mobile banner:  1:1   → aspect-ratio: 1/1  (via media query)
      */}
      <div
        ref={spacerRef}
        aria-hidden="true"
        className="w-full pointer-events-none hero-spacer"
        style={heroHeight > 0 ? { height: `${heroHeight}px` } : undefined}
      />
    </>
  );
}