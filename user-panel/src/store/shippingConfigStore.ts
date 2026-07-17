"use client";
import { create } from "zustand";

export interface ShippingConfig {
  freeDeliveryAll: boolean;
  baseCost:        number;  // rupees
  threshold:       number;  // rupees (0 = disabled)
  codEnabled:      boolean;
  codFee:          number;  // rupees
}

const DEFAULT_CONFIG: ShippingConfig = {
  freeDeliveryAll: false,
  baseCost:        250,
  threshold:       5000,
  codEnabled:      true,
  codFee:          0,
};

interface ShippingConfigState {
  config:    ShippingConfig;
  loaded:    boolean;
  loading:   boolean;

  loadConfig: () => Promise<void>;

  // Calculators
  calcShipping: (subtotal: number, paymentMethod?: string) => number;
}

export const useShippingConfigStore = create<ShippingConfigState>((set, get) => ({
  config:  DEFAULT_CONFIG,
  loaded:  false,
  loading: false,

  loadConfig: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });

    try {
      const res = await fetch("/api/shipping-config");
      if (res.ok) {
        const config = await res.json();
        set({ config, loaded: true, loading: false });
      } else {
        set({ loaded: true, loading: false });
      }
    } catch {
      set({ loaded: true, loading: false });
    }
  },

  /**
   * Calculate shipping cost (in rupees) for a given order.
   * - Master free delivery overrides everything
   * - Threshold of 0 means "no free shipping"
   * - COD adds an extra fee if configured
   */
  calcShipping: (subtotal, paymentMethod) => {
    const { config } = get();

    if (subtotal <= 0) return 0;

    let shipping = 0;
    if (config.freeDeliveryAll) {
      shipping = 0;
    } else if (config.threshold > 0 && subtotal >= config.threshold) {
      shipping = 0;
    } else {
      shipping = config.baseCost;
    }

    if (paymentMethod === "cod" && config.codEnabled && config.codFee > 0) {
      shipping += config.codFee;
    }

    return shipping;
  },
}));