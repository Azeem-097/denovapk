"use client";
import { useEffect } from "react";
import { usePaymentConfigStore } from "@/store/paymentConfigStore";

/**
 * Silently loads payment method config on app mount.
 * DEFERRED: waits 2s so checkout page still gets fresh config but
 * doesn't slow down home / product page navigation.
 */
export function PaymentConfigLoader() {
  const loadConfig = usePaymentConfigStore((s) => s.loadConfig);

  useEffect(() => {
    const kickoff = setTimeout(() => {
      loadConfig();
    }, 2000);
    return () => clearTimeout(kickoff);
  }, [loadConfig]);

  return null;
}