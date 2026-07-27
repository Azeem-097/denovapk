"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useShippingConfigStore } from "@/store/shippingConfigStore";
import { CartItem } from "./CartItem";
import { trackMetaEvent } from "@/lib/metaPixel";
import { formatPrice, cn } from "@/lib/utils";

export function CartDrawer() {
  // ── Cart store: subscribe to items array directly for reactivity ──
  const items    = useCartStore((s) => s.items);
  const isOpen   = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);

  // ── Shipping config: subscribe to PRIMITIVE fields, not the object ──
  // This forces React to re-render whenever any of these change.
  const freeDeliveryAll = useShippingConfigStore((s) => s.config.freeDeliveryAll);
  const baseCost        = useShippingConfigStore((s) => s.config.baseCost);
  const threshold       = useShippingConfigStore((s) => s.config.threshold);
  const configLoaded    = useShippingConfigStore((s) => s.loaded);
  const loadConfig      = useShippingConfigStore((s) => s.loadConfig);

  // Fix hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Ensure config is loaded (safety net)
  useEffect(() => {
    if (!configLoaded) loadConfig();
  }, [configLoaded, loadConfig]);

  // ── Compute values ──
  const itemCount = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0;
  const subtotal  = mounted ? items.reduce((sum, i) => sum + i.price * i.quantity, 0) : 0;

  // Shipping — computed inline from PRIMITIVE subscriptions
  let shipping = 0;
  if (mounted && subtotal > 0) {
    if (freeDeliveryAll) {
      shipping = 0;
    } else if (threshold > 0 && subtotal >= threshold) {
      shipping = 0;
    } else {
      shipping = baseCost;
    }
  }

  const total = subtotal + shipping;

  // ── Progress bar logic ──
  const showProgress =
    mounted &&
    items.length > 0 &&
    !freeDeliveryAll &&
    threshold > 0 &&
    subtotal < threshold;

  const alreadyQualifies =
    mounted &&
    items.length > 0 &&
    (freeDeliveryAll || (threshold > 0 && subtotal >= threshold));

  const remaining       = Math.max(0, threshold - subtotal);
  const progressPercent = threshold > 0 ? Math.min(100, (subtotal / threshold) * 100) : 0;

  const displayItems = mounted ? items : [];

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeCart]);

  return (
    <>
      <div
        onClick={closeCart}
        className={cn(
          "fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed top-0 right-0 bottom-0 z-[70] w-full sm:w-[420px] bg-white flex flex-col shadow-2xl",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-[#1a1a1a]" />
            <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
              Cart
            </h2>
            {mounted && itemCount > 0 && (
              <span className="text-xs text-[#6b7280]">
                ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-1 text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {showProgress && (
          <div className="px-5 py-3 bg-[#fafaf9] border-b border-[#e5e7eb]">
            <p className="text-xs text-[#6b7280]">
              Add <span className="font-semibold text-[#1a1a1a]">{formatPrice(remaining)}</span> more for FREE shipping
            </p>
            <div className="mt-2 h-1 bg-[#e5e7eb] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E10600] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {alreadyQualifies && (
          <div className="px-5 py-3 bg-[#f5f0e8] border-b border-[#e5e7eb]">
            <p className="text-xs text-[#E10600] font-semibold">
              🎉 {freeDeliveryAll ? "FREE shipping on every order" : "You qualify for FREE shipping!"}
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5">
          {!mounted ? (
            <div className="py-16 text-center">
              <div className="w-6 h-6 border-2 border-[#E10600] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : displayItems.length === 0 ? (
            <EmptyCart onClose={closeCart} />
          ) : (
            <div>
              {displayItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onLinkClick={closeCart}
                />
              ))}
            </div>
          )}
        </div>

        {mounted && displayItems.length > 0 && (
          <div className="border-t border-[#e5e7eb] px-5 py-4 space-y-3 bg-white">

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6b7280]">Subtotal</span>
                <span className="text-[#1a1a1a] font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6b7280]">Shipping</span>
                <span className={cn(
                  "font-medium",
                  shipping === 0 ? "text-[#E10600]" : "text-[#1a1a1a]"
                )}>
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </div>
            </div>

            <div className="h-px bg-[#e5e7eb]" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold tracking-wide text-[#1a1a1a] uppercase">
                Total
              </span>
              <span className="text-lg font-bold text-[#1a1a1a]">
                {formatPrice(total)}
              </span>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/checkout"
                onClick={() => {
                  trackMetaEvent("InitiateCheckout", {
                    value: total,
                    currency: "PKR",
                    num_items: itemCount,
                  });
                  closeCart();
                }}
                className="group inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white py-3.5 text-sm font-semibold tracking-wide hover:bg-[#E10600] transition-colors duration-300"
              >
                Proceed to Checkout
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="inline-flex items-center justify-center text-sm text-[#6b7280] hover:text-[#1a1a1a] transition-colors py-1"
              >
                View Cart Details
              </Link>
            </div>

            <p className="text-[10px] text-center text-[#6b7280] pt-1">
              Taxes calculated at checkout
            </p>
          </div>
        )}
      </aside>
    </>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-[#f5f0e8] rounded-full flex items-center justify-center mb-4">
        <ShoppingBag size={28} className="text-[#E10600]" />
      </div>
      <h3 className="text-base font-semibold text-[#1a1a1a] mb-1">
        Your cart is empty
      </h3>
      <p className="text-sm text-[#6b7280] mb-6 max-w-xs">
        Discover our latest collections and add your favorites.
      </p>
      <Link
        href="/shop"
        onClick={onClose}
        className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 text-sm font-semibold tracking-wide hover:bg-[#E10600] transition-colors duration-300"
      >
        Start Shopping
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}