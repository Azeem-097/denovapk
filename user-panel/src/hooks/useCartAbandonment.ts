"use client";
import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

interface Options {
  timeoutMinutes?: number;
  checkoutData?: {
    email:    string;
    phone:    string;
    fullName: string;
    city:     string;
  } | null;
}

/**
 * Tracks cart abandonment. Triggers when:
 *   1. User closes the tab (beforeunload event)
 *   2. User is inactive for the configured timeout period
 *
 * Only tracks if:
 *   - Cart has items
 *   - User is logged in OR checkoutData has phone/email
 */
export function useCartAbandonment(options: Options = {}) {
  const { timeoutMinutes = 15, checkoutData } = options;

  const items      = useCartStore((s) => s.items);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user       = useAuthStore((s) => s.user);

  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Function to send abandoned cart data
  const trackAbandonment = () => {
    if (items.length === 0) return;
    if (!isLoggedIn && !checkoutData?.phone && !checkoutData?.email) return;

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const body = JSON.stringify({
      items,
      subtotal,
      checkoutData: checkoutData ?? null,
    });

    // Use sendBeacon for reliable delivery on tab close
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/abandoned-cart", blob);
    } else {
      // Fallback: regular fetch (may not complete on tab close)
      fetch("/api/abandoned-cart", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  };

  // Reset inactivity timer on user activity
  const resetInactivityTimer = () => {
    lastActivityRef.current = Date.now();
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);

    if (items.length > 0) {
      inactivityTimer.current = setTimeout(() => {
        trackAbandonment();
      }, timeoutMinutes * 60 * 1000);
    }
  };

  useEffect(() => {
    // Only track if cart has items
    if (items.length === 0) return;

    // Reset timer whenever items change
    resetInactivityTimer();

    // Track user activity events
    const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    // Track before unload (tab close)
    const handleBeforeUnload = () => {
      trackAbandonment();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Also track on page visibility change (mobile-friendly)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        trackAbandonment();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, timeoutMinutes, checkoutData?.phone, checkoutData?.email, isLoggedIn, user?.id]);

  return { trackAbandonment };
}