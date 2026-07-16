"use client";
import { useEffect, useState } from "react";
import { useCartAbandonment } from "@/hooks/useCartAbandonment";

/**
 * Silent tracker mounted globally in the layout.
 * Fetches timeout from settings API and passes to the hook.
 */
export function CartAbandonmentTracker() {
  const [timeoutMinutes, setTimeoutMinutes] = useState(15);

  // Fetch abandonment timeout from settings on mount
  useEffect(() => {
    fetch("/api/settings/abandoned_cart_timeout_minutes")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.value) {
          const num = Number(data.value);
          if (!isNaN(num) && num > 0) setTimeoutMinutes(num);
        }
      })
      .catch(() => {});
  }, []);

  // Use the hook (no checkoutData - this is the global tracker)
  useCartAbandonment({ timeoutMinutes });

  return null;
}