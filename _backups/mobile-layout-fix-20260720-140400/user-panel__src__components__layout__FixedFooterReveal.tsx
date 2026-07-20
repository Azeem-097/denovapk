"use client";
import { useEffect, useRef, useState } from "react";

/**
 * FixedFooterReveal
 * ─────────────────────────────────────────────────────────────
 * DESKTOP (>= 1024px): Footer is fixed at viewport bottom.
 *   Content shell has margin-bottom = footerHeight, so scrolling
 *   the shell "reveals" the footer beneath (curtain effect).
 *
 * MOBILE / TABLET (< 1024px): CSS media query overrides both
 *   footer position and shell margin, letting them flow naturally.
 *
 * ─────────────────────────────────────────────────────────────
 * CRITICAL FIX (layout race condition on reload):
 *
 * Previously, marginBottom was `undefined` on first render, then
 * jumped to `footerHeight` after JS measurement. This caused the
 * content shell to shift down by 500-800px on reload — visible
 * as a giant white gap between the hero and the rest of the page.
 *
 * Now we use CSS custom properties (--ffr-footer-height) with a
 * sensible fallback of 400px. The moment JS measures the real
 * height, we update the CSS variable and the shell adjusts by
 * only a few pixels instead of hundreds.
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

  // Use CSS var so first render already has a value (400px fallback)
  const cssVars = {
    "--ffr-footer-height": footerHeight > 0 ? `${footerHeight}px` : "400px",
  } as React.CSSProperties;

  return (
    <div style={cssVars}>
      <div
        ref={footerRef}
        className="ffr-footer"
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
          position:        "relative",
          zIndex:          10,
          backgroundColor: "white",
          borderBottomLeftRadius:  "40px",
          borderBottomRightRadius: "40px",
          marginBottom:    "var(--ffr-footer-height)",
          boxShadow:       "0 8px 40px -10px rgba(0, 0, 0, 0.12), 0 -8px 40px -10px rgba(0, 0, 0, 0.12)",
        }}
      >
        {children}
      </div>
    </div>
  );
}