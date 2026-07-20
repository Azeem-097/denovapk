"use client";
import { useEffect, useRef, useState } from "react";

/**
 * FixedFooterReveal
 * ─────────────────────────────────────────────────────────────
 * On DESKTOP (>= 1024px): the footer is position:fixed at the
 * bottom of the viewport and revealed as you scroll past the
 * main content — a premium "curtain reveal" effect.
 *
 * On MOBILE / TABLET (< 1024px): the reveal effect is disabled
 * entirely, because on small screens the footer is typically
 * TALLER than the viewport. When it's pinned to bottom:0, the
 * top of the footer is pushed above the visible area and there's
 * no way to scroll it into view. So instead, the footer flows
 * naturally in document order and can be scrolled normally.
 *
 * Note: `isDesktop` is initialized with a lazy initializer that
 * reads window.matchMedia safely on the client and defaults to
 * true on the server. This prevents the "double footer flash"
 * that happens when the initial render shows the wrong branch.
 */
export function FixedFooterReveal({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer:   React.ReactNode;
}) {
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerHeight, setFooterHeight] = useState(0);

  // ─── Viewport detection ─────────────────────────────────
  // Lazy initializer runs once on mount. On the server, `window` is
  // undefined so we default to `true` (desktop) — this matches our
  // most common visitor profile and avoids a jarring layout swap
  // on desktop reload. Mobile users see one brief frame of desktop
  // layout before the effect corrects it, but no ghost footer.
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 1024px)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // ─── Measure footer height (desktop only) ──────────────
  useEffect(() => {
    if (!isDesktop) {
      setFooterHeight(0);
      return;
    }
    const el = footerRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.offsetHeight;
      if (h > 0) setFooterHeight(h);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isDesktop]);

  // ═══════════════════════════════════════════════════════
  //  MOBILE / TABLET — footer flows normally, no fixed layer
  // ═══════════════════════════════════════════════════════
  if (!isDesktop) {
    return (
      <>
        <div
          className="relative z-10 bg-white rounded-b-[40px] sm:rounded-b-[50px]"
          style={{
            boxShadow: "0 8px 40px -10px rgba(0, 0, 0, 0.12), 0 -8px 40px -10px rgba(0, 0, 0, 0.12)",
          }}
        >
          {children}
        </div>
        <div>
          {footer}
        </div>
      </>
    );
  }

  // ═══════════════════════════════════════════════════════
  //  DESKTOP — pinned footer with curtain reveal
  // ═══════════════════════════════════════════════════════
  return (
    <>
      <div ref={footerRef} className="fixed bottom-0 left-0 right-0 z-0 w-full">
        {footer}
      </div>
      <div
        className="relative z-10 bg-white rounded-b-[40px] sm:rounded-b-[50px] lg:rounded-b-[60px]"
        style={{
          marginBottom: footerHeight > 0 ? `${footerHeight}px` : undefined,
          boxShadow: "0 8px 40px -10px rgba(0, 0, 0, 0.12), 0 -8px 40px -10px rgba(0, 0, 0, 0.12)",
        }}
      >
        {children}
      </div>
    </>
  );
}