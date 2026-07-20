"use client";
import { useEffect, useRef, useState } from "react";

/**
 * FixedFooterReveal
 * ─────────────────────────────────────────────────────────────
 * DESKTOP (>= 1024px): Footer is fixed at viewport bottom.
 * MOBILE / TABLET (< 1024px): Footer is static (normal flow).
 *
 * FIX: The content div MUST come before the footer div in the
 * DOM. This ensures that on mobile (where both are static), the
 * footer correctly appears at the bottom of the page.
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

  const cssVars = {
    "--ffr-footer-height": footerHeight > 0 ? `${footerHeight}px` : "400px",
  } as React.CSSProperties;

  return (
    <div style={cssVars}>
      {/* 
        CONTENT FIRST: 
        On mobile (static), this appears at top. 
        On desktop (relative), it sits above the fixed footer via z-index.
      */}
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

      {/* 
        FOOTER SECOND: 
        On mobile (static), this follows the content (page bottom).
        On desktop (fixed), it stays at viewport bottom.
      */}
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
    </div>
  );
}