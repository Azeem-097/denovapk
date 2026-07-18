"use client";
import { useEffect, useRef, useState } from "react";

/**
 * FixedHeroBackground — dynamically tracks header bottom edge
 * ─────────────────────────────────────────────────────────────
 * The header stack changes height as user scrolls:
 *   • At scroll=0: announcement bar (36px) + navbar (72px) = 108px
 *   • After scroll: announcement bar scrolls off, only navbar
 *     stays sticky → header bottom is now just 72px from top
 *
 * If we set the hero's `top` to a static value (measured at
 * scroll=0), a white gap appears once the announcement bar
 * scrolls away because the hero stays at 108px but the sticky
 * navbar is at 72px.
 *
 * Solution: continuously measure the sticky navbar's actual
 * `getBoundingClientRect().bottom` on every scroll frame and
 * update the hero's `top` to match. Zero gap, no matter the
 * scroll speed or which parts of the header are sticky.
 */
export function FixedHeroBackground({ children }: { children: React.ReactNode }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroHeight, setHeroHeight] = useState<number>(0);
  const [headerBottom, setHeaderBottom] = useState<number>(0);
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  // ─── Track the sticky header's actual bottom edge in viewport
  useEffect(() => {
    let rafId = 0;

    const updateHeaderBottom = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const header = document.querySelector("header");
        if (header) {
          // Use viewport-relative bottom (accounts for any sticky offset shift)
          const rect = header.getBoundingClientRect();
          // Clamp to >= 0 so we never position above viewport top
          const bottom = Math.max(0, rect.bottom);
          setHeaderBottom(bottom);
        }
        rafId = 0;
      });
    };

    updateHeaderBottom();

    // Listen to everything that can change the header's position
    window.addEventListener("scroll",  updateHeaderBottom, { passive: true });
    window.addEventListener("resize",  updateHeaderBottom, { passive: true });

    // Also watch header size changes (announcement dismissal, mobile toggle)
    const header = document.querySelector("header");
    const ro = new ResizeObserver(updateHeaderBottom);
    if (header) ro.observe(header);
    ro.observe(document.body);

    return () => {
      window.removeEventListener("scroll",  updateHeaderBottom);
      window.removeEventListener("resize",  updateHeaderBottom);
      ro.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // ─── Measure hero's natural rendered height ──────────────
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const updateHeight = () => {
      const h = el.offsetHeight;
      if (h > 0) setHeroHeight(h);
    };

    updateHeight();

    const ro = new ResizeObserver(updateHeight);
    ro.observe(el);

    const images = el.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.complete) img.addEventListener("load", updateHeight);
    });

    return () => {
      ro.disconnect();
      images.forEach((img) => img.removeEventListener("load", updateHeight));
    };
  }, []);

  // ─── Fade out hero once scrolled well past it ────────────
  useEffect(() => {
    if (heroHeight === 0) return;
    let rafId = 0;

    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const shouldShow = window.scrollY < heroHeight * 1.2;
        setIsHeroVisible((prev) => prev !== shouldShow ? shouldShow : prev);
        rafId = 0;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [heroHeight]);

  return (
    <>
      {/* FIXED LAYER — hero aligned to sticky header's bottom edge */}
      <div
        ref={heroRef}
        className="fixed left-0 w-full z-0 overflow-hidden"
        style={{
          top:        `${headerBottom}px`,
          visibility: isHeroVisible ? "visible" : "hidden",
          opacity:    isHeroVisible ? 1 : 0,
          transition: "opacity 300ms ease, visibility 300ms",
          willChange: "top",
        }}
      >
        {children}
      </div>

      {/* SPACER — matches hero's measured height in document flow */}
      <div
        aria-hidden="true"
        className="w-full pointer-events-none"
        style={{ height: heroHeight > 0 ? `${heroHeight}px` : "100vh" }}
      />
    </>
  );
}