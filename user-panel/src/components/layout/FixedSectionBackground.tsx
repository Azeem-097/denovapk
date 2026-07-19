"use client";
import { useEffect, useRef, useState } from "react";

/**
 * FixedSectionBackground
 * ────────────────────────────────────────────────────────────
 * Mirror of FixedHeroBackground for stacking a SECOND fixed
 * layer further down the page (e.g. BrandTicker on the homepage).
 *
 * How it works:
 *   1. Section becomes position: fixed, pinned below the header
 *   2. A spacer div of equal height sits in normal document flow
 *      so the page still scrolls the correct total distance
 *   3. Section is only visible while its own scroll range is active;
 *      before scrolling to it, and after scrolling past it, it hides
 *
 * `startAfter` — how far down the page the section should "appear"
 *   (pixel offset from top of document). Usually = hero height +
 *   any sections above it (SaleCountdown, etc.). The observer
 *   auto-calculates this by watching the spacer's position.
 */
export function FixedSectionBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const spacerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const [sectionHeight, setSectionHeight] = useState(0);
  const [headerBottom,  setHeaderBottom]  = useState(0);
  const [isVisible,     setIsVisible]     = useState(false);
  const [isReady,       setIsReady]       = useState(false);

  // Measure header bottom (same as FixedHeroBackground)
  useEffect(() => {
    let rafId = 0;

    const updateHeaderBottom = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const header = document.querySelector("header");
        if (header) {
          const rect = header.getBoundingClientRect();
          const bottom = Math.max(0, rect.bottom);
          setHeaderBottom(bottom);
          if (bottom > 0) setIsReady(true);
        }
        rafId = 0;
      });
    };

    updateHeaderBottom();
    window.addEventListener("scroll", updateHeaderBottom, { passive: true });
    window.addEventListener("resize", updateHeaderBottom, { passive: true });

    const header = document.querySelector("header");
    const ro = new ResizeObserver(updateHeaderBottom);
    if (header) ro.observe(header);
    ro.observe(document.body);

    return () => {
      window.removeEventListener("scroll", updateHeaderBottom);
      window.removeEventListener("resize", updateHeaderBottom);
      ro.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Measure the section's actual rendered height
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const updateHeight = () => {
      const h = el.offsetHeight;
      if (h > 0) setSectionHeight(h);
    };

    updateHeight();

    const ro = new ResizeObserver(updateHeight);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  // Visibility logic — show only when scroll is within the spacer's range
  useEffect(() => {
    if (sectionHeight === 0) return;
    let rafId = 0;

    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const spacer = spacerRef.current;
        if (!spacer) { rafId = 0; return; }

        const rect = spacer.getBoundingClientRect();
        // Show once the spacer's TOP has scrolled to (or past) the header,
        // hide once the NEXT section has fully scrolled over it.
        // Buffer of 100px allows the fade to feel gradual.
        const shouldShow = rect.top <= headerBottom + 100
                        && rect.bottom > headerBottom - 100;

        setIsVisible((prev) => prev !== shouldShow ? shouldShow : prev);
        rafId = 0;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [sectionHeight, headerBottom]);

  return (
    <>
      {/* Fixed layer (z-0) — behind the sliding shell */}
      <div
        ref={sectionRef}
        className="fixed left-0 w-full z-0 overflow-hidden"
        style={{
          top:        `${headerBottom}px`,
          visibility: (isVisible && isReady) ? "visible" : "hidden",
          opacity:    (isVisible && isReady) ? 1 : 0,
          transition: "opacity 300ms ease",
          willChange: "opacity",
          pointerEvents: isVisible ? "auto" : "none",
        }}
      >
        {children}
      </div>

      {/* Spacer — occupies real document space so scroll behaves right */}
      <div
        ref={spacerRef}
        aria-hidden="true"
        className="w-full pointer-events-none"
        style={{ height: sectionHeight > 0 ? `${sectionHeight}px` : undefined }}
      />
    </>
  );
}