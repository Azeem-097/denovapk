"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/types";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

interface CartState {
  items:      CartItem[];
  isOpen:     boolean;
  isSyncing:  boolean;
  serverSync: boolean; // true = synced with server (logged in), false = local only

  // Actions
  addItem:    (item: Omit<CartItem, "id">) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQty:  (id: string, quantity: number) => Promise<void>;
  clearCart:  () => Promise<void>;
  openCart:   () => void;
  closeCart:  () => void;
  toggleCart: () => void;

  // Server sync
  syncFromServer:   () => Promise<void>;
  mergeToServer:    () => Promise<void>;
  setServerSync:    (enabled: boolean) => void;

  // Computed
  getSubtotal:  () => number;
  getShipping:  () => number;
  getTotal:     () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items:      [],
      isOpen:     false,
      isSyncing:  false,
      serverSync: false,

      addItem: async (newItem) => {
        const items = get().items;
        const existing = items.find(
          (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
        );

        // Update local state first (optimistic)
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === existing.id ? { ...i, quantity: i.quantity + newItem.quantity } : i
            ),
          });
        } else {
          const id = `${newItem.productId}-${newItem.variantId}-${Date.now()}`;
          set({ items: [...items, { ...newItem, id }] });
        }
        set({ isOpen: true });

        // Sync to server if logged in
        if (get().serverSync) {
          try {
            const res = await fetch("/api/cart", {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify({
                productId: newItem.productId,
                variantId: newItem.variantId,
                quantity:  newItem.quantity,
              }),
            });
            if (res.ok) {
              const { cart } = await res.json();
              set({ items: mapServerCart(cart) });
            }
          } catch {}
        }
      },

      removeItem: async (id) => {
        // Local first
        set({ items: get().items.filter((i) => i.id !== id) });

        // Server sync
        if (get().serverSync) {
          try {
            const res = await fetch(`/api/cart/${id}`, { method: "DELETE" });
            if (res.ok) {
              const { cart } = await res.json();
              set({ items: mapServerCart(cart) });
            }
          } catch {}
        }
      },

      updateQty: async (id, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(id);
          return;
        }
        // Local first
        set({
          items: get().items.map((i) => i.id === id ? { ...i, quantity } : i),
        });

        // Server sync
        if (get().serverSync) {
          try {
            const res = await fetch(`/api/cart/${id}`, {
              method:  "PATCH",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify({ quantity }),
            });
            if (res.ok) {
              const { cart } = await res.json();
              set({ items: mapServerCart(cart) });
            }
          } catch {}
        }
      },

      clearCart: async () => {
        set({ items: [] });
        if (get().serverSync) {
          try { await fetch("/api/cart", { method: "DELETE" }); } catch {}
        }
      },

      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      // ── Server sync methods ─────────────────────────
      syncFromServer: async () => {
        set({ isSyncing: true });
        try {
          const res = await fetch("/api/cart");
          if (res.ok) {
            const data = await res.json();
            if (data.cart) {
              set({ items: mapServerCart(data.cart) });
            }
          }
        } catch {}
        set({ isSyncing: false });
      },

      mergeToServer: async () => {
        const localItems = get().items;
        if (localItems.length === 0) {
          await get().syncFromServer();
          return;
        }

        set({ isSyncing: true });
        try {
          const merge = localItems.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity:  i.quantity,
          }));
          const res = await fetch("/api/cart", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ merge }),
          });
          if (res.ok) {
            const { cart } = await res.json();
            set({ items: mapServerCart(cart) });
          }
        } catch {}
        set({ isSyncing: false });
      },

      setServerSync: (enabled) => set({ serverSync: enabled }),

      getSubtotal:  () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getShipping:  () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 250;
      },
      getTotal:     () => get().getSubtotal() + get().getShipping(),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "denova-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// ─── Helper: convert server cart to local format ─────────
function mapServerCart(cart: { items: Array<{
  id: string; productId: string; variantId: string; quantity: number;
  product: { name: string; slug: string; images: Array<{ url: string }> };
  variant: { size: string; color: string; colorHex: string; price: number };
}>}): CartItem[] {
  return cart.items.map((item) => ({
    id:        item.id,
    productId: item.productId,
    variantId: item.variantId,
    name:      item.product.name,
    image:     item.product.images[0]?.url ?? "",
    size:      item.variant.size,
    color:     item.variant.color,
    colorHex:  item.variant.colorHex,
    price:     item.variant.price / 100, // paisa → rupees
    quantity:  item.quantity,
    slug:      item.product.slug,
  }));
}