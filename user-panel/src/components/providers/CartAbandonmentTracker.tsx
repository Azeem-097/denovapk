"use client";
import { useEffect, useState } from "react";
import { useCartAbandonment } from "@/hooks/useCartAbandonment";

/**
 * Silent tracker mounted globally in the layout.
 * DEFERRED: waits 2s after mount before starting the settings fetch,
 * so it never blocks initial page render or user interaction.
 */
export function CartAbandonmentTracker() {
  const [timeoutMinutes, setTimeoutMinutes] = useState(15);
  const [ready,          setReady]          = useState(false);

  useEffect(() => {
    // Defer non-critical work by 2s so it doesn't compete with the
    // main navigation / paint cycle.
    const kickoff = setTimeout(() => {
      fetch("/api/settings/abandoned_cart_timeout_minutes")
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data?.value) {
            const num = Number(data.value);
            if (!isNaN(num) && num > 0) setTimeoutMinutes(num);
          }
        })
        .catch(() => {})
        .finally(() => setReady(true));
    }, 2000);

    return () => clearTimeout(kickoff);
  }, []);

  // Only start the hook once the config has been (attempted to be) loaded.
  return ready ? <TrackerInner timeoutMinutes={timeoutMinutes} /> : null;
}

function TrackerInner({ timeoutMinutes }: { timeoutMinutes: number }) {
  useCartAbandonment({ timeoutMinutes });
  return null;
}