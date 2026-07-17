"use client";
import { useEffect } from "react";
import { useShippingConfigStore } from "@/store/shippingConfigStore";

/**
 * Silently loads shipping config on app mount so all price displays
 * (cart, drawer, checkout) show the correct shipping immediately.
 * Renders nothing.
 */
export function ShippingConfigLoader() {
  const loadConfig = useShippingConfigStore((s) => s.loadConfig);
  useEffect(() => { loadConfig(); }, [loadConfig]);
  return null;
}