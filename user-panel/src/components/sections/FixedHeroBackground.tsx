"use client";
import { useEffect, useRef, useState } from "react";

/**
 * FixedHeroBackground
 * ─────────────────────────────────────────────────────────────
 * Pins the hero as position:fixed BEHIND the main content shell.
 * The content shell slides up over the hero as the page scrolls.
 *
 * STACKING ORDER:
 *   AnnouncementBar (z-50)
 *   Navbar          (z-40)
 *   Content shell   (z-10)
 *   Hero (this)     (z-1)   ← visible in the viewport gap
 *   body (default)
 *
 * TOP OFFSET:
 *   Uses CSS variable --header-offset with a realistic fallback
 *   so the hero starts BELOW the header on first paint, without
 *   waiting for JS measurement. JS updates the exact value after
 *   mount.
 */
export function FixedHeroBackground({ children }: { children: React.ReactNode }) {
  const heroRef    = useRef<HTMLDivElement>(null);
  const spacerRef  = useRef<HTMLDivElement>(null);
  const [heroHeight, setHeroHeight] = useState<number>(0);

  const heroHeightRef  = useRef<number>(0);
  const lastBottomRef  = useRef<number>(-1);
  const lastVisibleRef = useRef<boolean>(true);

  useEffect(() => { heroHeightRef.current = heroHeight; }, [heroHeight]);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.offsetHeight;
      if (h > 0) setHeroHeight(h);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
          hero.style.setProperty("--hero-header-offset", `${bottom}px`);
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
    const onScroll = () => { if (!rafId) rafId = requestAnimationFrame(update); };
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
        className="fixed left-0 w-full overflow-hidden hero-fixed-bg"
        style={{
          opacity:    1,
          visibility: "visible",
          transform:  "translateZ(0)",
          willChange: "transform",
          zIndex:     1,
        }}
      >
        {children}
      </div>

      <div
        ref={spacerRef}
        aria-hidden="true"
        className="w-full pointer-events-none hero-spacer"
        style={heroHeight > 0 ? { height: `${heroHeight}px` } : undefined}
      />
    </>
  );
}
