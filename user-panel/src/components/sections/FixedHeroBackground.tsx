"use client";
import { useEffect, useRef, useState } from "react";

export function FixedHeroBackground({ children }: { children: React.ReactNode }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroHeight,    setHeroHeight]    = useState<number>(0);
  const [headerBottom,  setHeaderBottom]  = useState<number>(0);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [isReady,       setIsReady]       = useState(false); // NEW: prevents glitch on load

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
          if (bottom > 0) setIsReady(true); // Only reveal once header is measured
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
      <div
        ref={heroRef}
        className="fixed left-0 w-full z-0 overflow-hidden"
        style={{
          top:        `${headerBottom}px`,
          // ── Fade in only once header measurement is complete ──
          visibility: (isHeroVisible && isReady) ? "visible" : "hidden",
          opacity:    (isHeroVisible && isReady) ? 1 : 0,
          transition: "opacity 250ms ease",
          willChange: "top",
        }}
      >
        {children}
      </div>

      <div
        aria-hidden="true"
        className="w-full pointer-events-none"
        style={{ height: heroHeight > 0 ? `${heroHeight}px` : "100vh" }}
      />
    </>
  );
}