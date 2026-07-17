"use client";
import { useEffect } from "react";
import { usePaymentConfigStore } from "@/store/paymentConfigStore";

/**
 * Silently loads payment method config on app mount so checkout
 * shows the correct payment options immediately.
 * Renders nothing.
 */
export function PaymentConfigLoader() {
  const loadConfig = usePaymentConfigStore((s) => s.loadConfig);
  useEffect(() => { loadConfig(); }, [loadConfig]);
  return null;
}