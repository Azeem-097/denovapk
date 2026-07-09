"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WishlistItem } from "@/types";

interface WishlistState {
  items:      WishlistItem[];
  addItem:    (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: WishlistItem) => void;
  isInWishlist: (productId: string) => boolean;
  clearAll:   () => void;
  getCount:   () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (get().isInWishlist(item.productId)) return;
        set({ items: [...get().items, item] });
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      toggleItem: (item) => {
        if (get().isInWishlist(item.productId)) {
          get().removeItem(item.productId);
        } else {
          get().addItem(item);
        }
      },

      isInWishlist: (productId) =>
        get().items.some((i) => i.productId === productId),

      clearAll: () => set({ items: [] }),

      getCount: () => get().items.length,
    }),
    {
      name: "denova-wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);