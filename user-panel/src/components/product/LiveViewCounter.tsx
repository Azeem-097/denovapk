"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Simulated live-viewer counter (5-10 people).
 *
 * On first mount, picks a random number in the 5-10 range and stores it
 * in sessionStorage keyed by product ID so it stays consistent within
 * a browsing session (page navigation, tab switch, etc.).
 *
 * Every 30-45 seconds, the number drifts by +/- 1 to feel alive.
 * Stays within the [MIN, MAX] range so it never looks fake.
 *
 * Storage key: denova_live_viewers_{productId}
 */

interface Props {
  productId: string;
  className?: string;
}

const MIN = 5;
const MAX = 10;

function initialCount(productId: string): number {
  if (typeof window === "undefined") return MIN + 2;

  const key = `denova_live_viewers_${productId}`;
  const stored = window.sessionStorage.getItem(key);
  if (stored) {
    const n = Number(stored);
    if (!isNaN(n) && n >= MIN && n <= MAX) return n;
  }
  const fresh = MIN + Math.floor(Math.random() * (MAX - MIN + 1));
  window.sessionStorage.setItem(key, String(fresh));
  return fresh;
}

function driftDelayMs(): number {
  // Random between 30s and 45s
  return 30_000 + Math.floor(Math.random() * 15_000);
}

export function LiveViewCounter({ productId, className }: Props) {
  const [mounted, setMounted] = useState(false);
  const [count,   setCount]   = useState<number>(MIN + 2);

  useEffect(() => {
    setMounted(true);
    setCount(initialCount(productId));
  }, [productId]);

  useEffect(() => {
    if (!mounted) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const drift = () => {
      setCount((current) => {
        // Randomly go up or down by 1, but clamp to [MIN, MAX]
        const direction = Math.random() < 0.5 ? -1 : 1;
        let next = current + direction;
        if (next < MIN) next = MIN + 1;
        if (next > MAX) next = MAX - 1;

        // Occasionally stay flat to feel more organic
        if (Math.random() < 0.25) next = current;

        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(`denova_live_viewers_${productId}`, String(next));
        }
        return next;
      });

      timeoutId = setTimeout(drift, driftDelayMs());
    };

    timeoutId = setTimeout(drift, driftDelayMs());
    return () => clearTimeout(timeoutId);
  }, [mounted, productId]);

  if (!mounted) {
    return (
      <div className={cn("h-4", className)} aria-hidden />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs text-[#6b7280]",
        className
      )}
      aria-live="polite"
    >
      <span className="relative flex items-center justify-center">
        <span className="absolute inline-flex h-2 w-2 rounded-full bg-green-500 opacity-75 animate-live-ping" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
      </span>
      <span>
        <span className="font-bold text-[#1a1a1a] tabular-nums">{count}</span>{" "}
        <span>people are viewing this right now</span>
      </span>
    </div>
  );
}