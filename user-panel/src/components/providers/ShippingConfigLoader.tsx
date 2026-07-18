"use client";
import { useEffect } from "react";
import { useShippingConfigStore } from "@/store/shippingConfigStore";

/**
 * Silently loads shipping config on app mount.
 * DEFERRED: waits 1.5s so it never blocks initial page paint.
 * Cart drawer / cart page will still work with defaults if user
 * navigates there in the first 1.5 seconds.
 */
export function ShippingConfigLoader() {
  const loadConfig = useShippingConfigStore((s) => s.loadConfig);

  useEffect(() => {
    const kickoff = setTimeout(() => {
      loadConfig();
    }, 1500);
    return () => clearTimeout(kickoff);
  }, [loadConfig]);

  return null;
}