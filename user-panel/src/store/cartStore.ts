"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/types";
import { useShippingConfigStore } from "./shippingConfigStore";
import { useToastStore } from "./toastStore";

interface CartState {
  items:      CartItem[];
  isOpen:     boolean;
  isSyncing:  boolean;
  serverSync: boolean;

  addItem:    (item: Omit<CartItem, "id">) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQty:  (id: string, quantity: number) => Promise<void>;
  clearCart:  () => Promise<void>;
  openCart:   () => void;
  closeCart:  () => void;
  toggleCart: () => void;

  syncFromServer:   () => Promise<void>;
  mergeToServer:    () => Promise<void>;
  setServerSync:    (enabled: boolean) => void;

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
        const availableStock = getAvailableStock(newItem.stock, existing?.stock);
        const requestedQty = Math.max(1, Math.floor(Number(newItem.quantity) || 1));
        const nextQty = existing ? existing.quantity + requestedQty : requestedQty;
        const allowedQty = clampToStock(nextQty, availableStock);

        if (allowedQty <= 0) {
          showStockToast(0);
          return;
        }

        if (availableStock !== undefined && nextQty > availableStock) {
          showStockToast(availableStock);
        }

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === existing.id ? { ...i, ...newItem, id: i.id, quantity: allowedQty } : i
            ),
          });
        } else {
          const id = `${newItem.productId}-${newItem.variantId}-${Date.now()}`;
          set({ items: [...items, { ...newItem, quantity: allowedQty, id }] });
        }
        set({ isOpen: true });

        if (get().serverSync) {
          try {
            const res = await fetch("/api/cart", {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify({
                productId: newItem.productId,
                variantId: newItem.variantId,
                quantity:  requestedQty,
              }),
            });
            if (res.ok) {
              const { cart } = await res.json();
              set({ items: mapServerCart(cart) });
            } else {
              const data = await res.json().catch(() => null);
              if (data?.error) showCartError(data.error, data.stock);
              await get().syncFromServer();
            }
          } catch {}
        }
      },

      removeItem: async (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
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
        if (quantity <= 0) { await get().removeItem(id); return; }
        const item = get().items.find((i) => i.id === id);
        const requestedQty = Math.max(1, Math.floor(Number(quantity) || 1));
        const allowedQty = clampToStock(requestedQty, item?.stock);

        if (allowedQty <= 0) {
          showStockToast(0);
          return;
        }

        if (item?.stock !== undefined && requestedQty > item.stock) {
          showStockToast(item.stock);
        }

        set({ items: get().items.map((i) => i.id === id ? { ...i, quantity: allowedQty } : i) });

        if (get().serverSync) {
          try {
            const res = await fetch(`/api/cart/${id}`, {
              method:  "PATCH",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify({ quantity: allowedQty }),
            });
            if (res.ok) {
              const { cart } = await res.json();
              set({ items: mapServerCart(cart) });
            } else {
              const data = await res.json().catch(() => null);
              if (data?.error) showCartError(data.error, data.stock);
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

      syncFromServer: async () => {
        set({ isSyncing: true });
        try {
          const res = await fetch("/api/cart");
          if (res.ok) {
            const data = await res.json();
            if (data.cart) set({ items: mapServerCart(data.cart) });
          }
        } catch {}
        set({ isSyncing: false });
      },

      mergeToServer: async () => {
        const localItems = get().items;
        if (localItems.length === 0) { await get().syncFromServer(); return; }

        set({ isSyncing: true });
        try {
          const merge = localItems.map((i) => ({
            productId: i.productId, variantId: i.variantId, quantity: i.quantity,
          }));
          const res = await fetch("/api/cart", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ merge }),
          });
          if (res.ok) {
            const { cart } = await res.json();
            set({ items: mapServerCart(cart) });
          } else {
            const data = await res.json().catch(() => null);
            if (data?.error) showCartError(data.error);
            await get().syncFromServer();
          }
        } catch {}
        set({ isSyncing: false });
      },

      setServerSync: (enabled) => set({ serverSync: enabled }),

      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getShipping: () => {
        const subtotal = get().getSubtotal();
        // Read dynamic shipping config
        return useShippingConfigStore.getState().calcShipping(subtotal);
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

function mapServerCart(cart: { items: Array<{
  id: string; productId: string; variantId: string; quantity: number;
  product: { name: string; slug: string; isSoldOut?: number; images: Array<{ url: string }> };
  variant: { size: string; color: string; colorHex: string; price: number; stock?: number };
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
    price:     item.variant.price / 100,
    quantity:  item.quantity,
    stock:     item.variant.stock,
    isSoldOut: Number(item.product.isSoldOut ?? 0) === 1,
    slug:      item.product.slug,
  }));
}

function getAvailableStock(...values: Array<number | undefined>): number | undefined {
  const stock = values.find((value) => Number.isFinite(value));
  return stock === undefined ? undefined : Math.max(0, Math.floor(Number(stock)));
}

function clampToStock(quantity: number, stock?: number): number {
  if (stock === undefined) return quantity;
  return Math.min(quantity, stock);
}

function showStockToast(stock?: number) {
  const message = stock && stock > 0
    ? `Only ${stock} items are available in stock.`
    : "This item is out of stock.";
  useToastStore.getState().addToast({ type: "error", message });
}

function showCartError(error: string, stock?: number) {
  if (error) {
    useToastStore.getState().addToast({ type: "error", message: error });
    return;
  }
  showStockToast(stock);
}
