"use client";
import { useState, useEffect } from "react";
import type { DevicePerformance } from "@/types";

export function useDevicePerformance(): DevicePerformance {
  const [performance, setPerformance] = useState<DevicePerformance>({
    tier: "high",
    prefersReducedMotion: false,
    shouldAnimate: true,
  });

  useEffect(() => {
    // Check prefers-reduced-motion
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 4;

    // Check device memory (GB) - not available in all browsers
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;

    // Determine tier
    let tier: "low" | "medium" | "high" = "high";
    if (cores <= 2 || memory <= 2) {
      tier = "low";
    } else if (cores <= 4 || memory <= 4) {
      tier = "medium";
    }

    setPerformance({
      tier,
      prefersReducedMotion: reducedMotion,
      shouldAnimate: !reducedMotion && tier !== "low",
    });
  }, []);

  return performance;
}