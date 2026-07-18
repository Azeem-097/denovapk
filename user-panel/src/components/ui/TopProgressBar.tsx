"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Top-of-page navigation progress bar (YouTube/GitHub style).
 *
 * Shows a thin gold bar that:
 *   1. Instantly appears when user clicks any Link
 *   2. Animates progress while the next page is loading
 *   3. Completes to 100% when new pathname/searchParams settle
 *   4. Fades out
 *
 * Works with Next.js App Router — hooks into pathname changes
 * AND intercepts click events on <a> tags before navigation starts,
 * so users see immediate feedback even during server thinking time.
 */
export function TopProgressBar() {
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [visible,  setVisible]  = useState(false);
  const timeoutRef              = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef                  = useRef<number | null>(null);

  // ── Start progress: fires when user clicks a link ────
  const startProgress = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    setVisible(true);
    setProgress(10);

    // Animate: quickly to 30%, slowly to 80%, then wait for page
    let current = 10;
    const tick = () => {
      current += (80 - current) * 0.05;
      if (current > 79) current = 79;
      setProgress(current);
      rafRef.current = requestAnimationFrame(tick);
    };
    setTimeout(() => { rafRef.current = requestAnimationFrame(tick); }, 100);
  };

  // ── Complete progress: fires when pathname changes (= page loaded) ─
  const completeProgress = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setProgress(100);
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setProgress(0), 200);
    }, 300);
  };

  // ── Listen for pathname/search changes = navigation completed ────
  useEffect(() => {
    if (visible) completeProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // ── Intercept all internal link clicks to start progress instantly ─
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // Only left click, no modifier keys
      if (e.button !== 0) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

      // Find nearest anchor
      let el: HTMLElement | null = e.target as HTMLElement;
      while (el && el.tagName !== "A") el = el.parentElement;
      if (!el) return;

      const anchor = el as HTMLAnchorElement;
      const href   = anchor.getAttribute("href");

      // Only internal, same-origin, non-hash links
      if (!href) return;
      if (href.startsWith("http://") || href.startsWith("https://")) {
        try {
          const url = new URL(href);
          if (url.origin !== window.location.origin) return;
        } catch { return; }
      }
      if (href.startsWith("#")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;
      if (anchor.target === "_blank") return;
      if (anchor.hasAttribute("download")) return;

      // Same-page? Don't fire
      const targetPath = href.split("?")[0].split("#")[0];
      if (targetPath === pathname) return;

      startProgress();
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [pathname]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] pointer-events-none"
      style={{ height: "2px" }}
      aria-hidden="true"
    >
      <div
        className="h-full bg-[#c9a96e]"
        style={{
          width:      `${progress}%`,
          opacity:    visible ? 1 : 0,
          transition: progress === 100
            ? "width 200ms ease-out, opacity 300ms ease-out 200ms"
            : "width 200ms ease-out, opacity 150ms ease-out",
          boxShadow:  "0 0 8px rgba(201, 169, 110, 0.6), 0 0 4px rgba(201, 169, 110, 0.4)",
        }}
      />
    </div>
  );
}