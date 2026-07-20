"use client";
import { useEffect, useRef, useState } from "react";

/**
 * FixedFooterReveal
 * ─────────────────────────────────────────────────────────────
 * DESKTOP (>= 1024px):
 *   Footer is position:fixed at the bottom of the viewport.
 *   Content shell has margin-bottom equal to footer height so
 *   scrolling the shell reveals the footer beneath ("curtain").
 *
 * MOBILE / TABLET (< 1024px):
 *   Same DOM structure, but CSS media queries flip the footer
 *   back to position:static and remove the margin-bottom so
 *   the footer flows naturally in document order. This is
 *   critical because on small screens the footer is often
 *   TALLER than the viewport, making the top of a fixed footer
 *   unreachable.
 *
 * ─────────────────────────────────────────────────────────────
 * WHY CSS AND NOT JS?
 * ─────────────────────────────────────────────────────────────
 * A JS-based mobile/desktop branch causes hydration mismatches
 * (server renders one tree, client renders another). Pure CSS
 * media queries render the same DOM on both sides — no
 * mismatch possible.
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

  // Measure footer height (used only on desktop via CSS)
  useEffect(() => {
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
  }, []);

  return (
    <>
      <div
        ref={footerRef}
        className="ffr-footer"
        // Inline styles are DESKTOP defaults (fixed bottom).
        // Mobile media query in globals.css overrides them.
        style={{
          position: "fixed",
          bottom:   0,
          left:     0,
          right:    0,
          zIndex:   0,
          width:    "100%",
        }}
      >
        {footer}
      </div>

      <div
        className="ffr-content"
        style={{
          position:     "relative",
          zIndex:       10,
          backgroundColor: "white",
          borderBottomLeftRadius:  "40px",
          borderBottomRightRadius: "40px",
          // Desktop-only margin. Mobile CSS zeroes this out.
          marginBottom: footerHeight > 0 ? `${footerHeight}px` : undefined,
          boxShadow:    "0 8px 40px -10px rgba(0, 0, 0, 0.12), 0 -8px 40px -10px rgba(0, 0, 0, 0.12)",
        }}
      >
        {children}
      </div>
    </>
  );
}