"use client";
import { create } from "zustand";

export interface PaymentConfig {
  cod:       boolean;
  card:      boolean;
  jazzcash:  boolean;
  easypaisa: boolean;
  bank:      boolean;
}

const DEFAULT_CONFIG: PaymentConfig = {
  cod: true, card: true, jazzcash: true, easypaisa: true, bank: true,
};

interface PaymentConfigState {
  config:   PaymentConfig;
  loaded:   boolean;
  loading:  boolean;

  loadConfig: () => Promise<void>;

  isEnabled: (methodId: keyof PaymentConfig) => boolean;
}

export const usePaymentConfigStore = create<PaymentConfigState>((set, get) => ({
  config:  DEFAULT_CONFIG,
  loaded:  false,
  loading: false,

  loadConfig: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });

    try {
      const res = await fetch("/api/payment-methods");
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

  isEnabled: (methodId) => get().config[methodId] === true,
}));