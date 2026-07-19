"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Top-of-page navigation progress bar (YouTube/GitHub style).
 *
 * Uses PURE CSS transitions for smoothness — no requestAnimationFrame,
 * no per-frame React re-renders. State only changes 3 times per navigation:
 *   1. START:    width jumps to 5%   (instant)
 *   2. LOADING:  width transitions to 85%  (2.5s smooth ease-out)
 *   3. COMPLETE: width jumps to 100% (300ms) then fades out
 */

type Phase = "idle" | "loading" | "complete";

export function TopProgressBar() {
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [phase,     setPhase]     = useState<Phase>("idle");
  const completeTimer              = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer                  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Start progress: fires when user clicks a link ────
  const startProgress = () => {
    // Clear any pending completion timers from a previous nav
    if (completeTimer.current) clearTimeout(completeTimer.current);
    if (hideTimer.current)     clearTimeout(hideTimer.current);

    // Step 1: reset to idle briefly so CSS restarts the transition cleanly
    setPhase("idle");

    // Force a reflow so the browser sees the reset before the loading state
    // (this is what makes the transition actually restart from 0)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPhase("loading");
      });
    });
  };

  // ── Complete progress ──────────────────────────────────
  const completeProgress = () => {
    setPhase("complete");
    // After the "100%" transition finishes, hide the bar
    hideTimer.current = setTimeout(() => {
      setPhase("idle");
    }, 400);
  };

  // ── Listen for pathname/search changes = navigation completed ────
  useEffect(() => {
    if (phase === "loading") completeProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // ── Intercept internal link clicks ─────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

      let el: HTMLElement | null = e.target as HTMLElement;
      while (el && el.tagName !== "A") el = el.parentElement;
      if (!el) return;

      const anchor = el as HTMLAnchorElement;
      const href   = anchor.getAttribute("href");

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
      if (completeTimer.current) clearTimeout(completeTimer.current);
      if (hideTimer.current)     clearTimeout(hideTimer.current);
    };
  }, []);

  // ── Compute width + transition per phase ───────────────
  //   idle     -> 0%   instant (invisible)
  //   loading  -> 85%  slow smooth ease-out (2.5s) — creates natural progress feel
  //   complete -> 100% fast (250ms) then fade
  let width      = "0%";
  let transition = "none";
  let opacity    = 0;

  if (phase === "loading") {
    width      = "85%";
    transition = "width 2500ms cubic-bezier(0.1, 0.7, 0.1, 1)";
    opacity    = 1;
  } else if (phase === "complete") {
    width      = "100%";
    transition = "width 250ms ease-out, opacity 350ms ease-out 150ms";
    opacity    = 0;
  }

  // Don't render at all when idle — saves a DOM node
  if (phase === "idle") return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] pointer-events-none"
      style={{ height: "2px" }}
      aria-hidden="true"
    >
      <div
        style={{
          width,
          height:     "100%",
          opacity,
          transition,
          background: "linear-gradient(90deg, #3b5f8f 0%, #5580b8 100%)",
          boxShadow:  "0 0 8px rgba(59, 95, 143, 0.6), 0 0 4px rgba(59, 95, 143, 0.4)",
          transformOrigin: "left center",
          willChange: "width, opacity",
        }}
      />
    </div>
  );
}