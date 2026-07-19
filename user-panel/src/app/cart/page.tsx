"use client";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Trash, Package, RotateCcw, Shield } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useShippingConfigStore } from "@/store/shippingConfigStore";
import { CartItem } from "@/components/cart/CartItem";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const {
    items, clearCart,
    getSubtotal, getShipping, getTotal, getItemCount,
  } = useCartStore();

  const config     = useShippingConfigStore((s) => s.config);
  const loadConfig = useShippingConfigStore((s) => s.loadConfig);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  const itemCount = getItemCount();
  const subtotal  = getSubtotal();
  const shipping  = getShipping();
  const total     = getTotal();

  // Threshold-related calculations
  const showProgressBar =
    !config.freeDeliveryAll && config.threshold > 0 && subtotal < config.threshold;
  const remaining = Math.max(0, config.threshold - subtotal);
  const alreadyQualifies =
    config.freeDeliveryAll || (config.threshold > 0 && subtotal >= config.threshold);

  const trustBadges = [
    {
      icon: Package,
      text: config.freeDeliveryAll
        ? "Free shipping on every order"
        : config.threshold > 0
          ? `Free shipping over ${formatPrice(config.threshold)}`
          : "Standard shipping applies",
    },
    { icon: RotateCcw, text: "7-day easy returns" },
    { icon: Shield,    text: "Secure checkout" },
  ];

  if (items.length === 0) {
    return <EmptyCartPage />;
  }

  return (
    <>
      <div className="pt-28 pb-8 sm:pt-32 sm:pb-10 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Shopping Cart" }]}
              className="mb-4"
            />
          </FadeIn>
          <TextReveal as="h1">
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a]">
              Shopping Cart
            </span>
          </TextReveal>
          <FadeIn delay={100}>
            <p className="text-[#6b7280] text-sm mt-2">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">

          <div className="lg:col-span-2">
            <div className="border border-[#e5e7eb] bg-white">

              {showProgressBar ? (
                <div className="px-5 py-3 bg-[#fafaf9] border-b border-[#e5e7eb]">
                  <p className="text-xs text-[#6b7280]">
                    Add <span className="font-semibold text-[#1a1a1a]">{formatPrice(remaining)}</span> more for FREE shipping
                  </p>
                  <div className="mt-2 h-1 bg-[#e5e7eb] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3b5f8f] transition-all duration-500 rounded-full"
                      style={{ width: `${(subtotal / config.threshold) * 100}%` }}
                    />
                  </div>
                </div>
              ) : alreadyQualifies ? (
                <div className="px-5 py-3 bg-[#f5f0e8] border-b border-[#e5e7eb]">
                  <p className="text-xs text-[#3b5f8f] font-semibold">
                    🎉 {config.freeDeliveryAll ? "FREE shipping on every order" : "You qualify for FREE shipping!"}
                  </p>
                </div>
              ) : null}

              <div className="px-5">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              <div className="px-5 py-4 border-t border-[#e5e7eb] flex items-center justify-between">
                <Link href="/shop" className="text-sm text-[#6b7280] hover:text-[#1a1a1a] transition-colors inline-flex items-center gap-1.5">
                  <ArrowRight size={14} className="rotate-180" />
                  Continue Shopping
                </Link>
                <button
                  onClick={() => { if (confirm("Clear all items from cart?")) clearCart(); }}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <Trash size={13} />
                  Clear Cart
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 border border-[#e5e7eb] bg-white p-5 lg:p-6">

              <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-4 pb-4 border-b border-[#e5e7eb]">
                Order Summary
              </h2>

              <div className="space-y-2.5">
                <SummaryRow label={`Subtotal (${itemCount} items)`} value={formatPrice(subtotal)} />
                <SummaryRow
                  label="Shipping"
                  value={shipping === 0 ? "FREE" : formatPrice(shipping)}
                  highlight={shipping === 0}
                />
                <SummaryRow label="Estimated Tax" value="Calculated at checkout" muted />
              </div>

              <div className="mt-5 pt-5 border-t border-[#e5e7eb]">
                <label className="block text-xs font-medium tracking-wide uppercase text-[#6b7280] mb-2">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#3b5f8f] focus:outline-none placeholder:text-[#6b7280]/60"
                  />
                  <button className="px-4 py-2.5 text-xs font-semibold tracking-wide uppercase border border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors">
                    Apply
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-[#e5e7eb]">
                <div className="flex items-baseline justify-between mb-5">
                  <span className="text-sm font-semibold tracking-wide uppercase text-[#1a1a1a]">Total</span>
                  <span className="text-2xl font-bold text-[#1a1a1a]">{formatPrice(total)}</span>
                </div>

                <Link href="/checkout" className="group inline-flex items-center justify-center gap-2 w-full bg-[#1a1a1a] text-white py-3.5 text-sm font-semibold tracking-wide hover:bg-[#3b5f8f] transition-colors duration-300">
                  Proceed to Checkout
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="mt-6 pt-5 border-t border-[#e5e7eb] space-y-2.5">
                {trustBadges.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-xs text-[#6b7280]">
                    <Icon size={14} className="text-[#3b5f8f] flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

function SummaryRow({
  label, value, muted, highlight,
}: { label: string; value: string; muted?: boolean; highlight?: boolean; }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#6b7280]">{label}</span>
      <span className={`font-medium ${muted ? "text-[#6b7280] text-xs" : highlight ? "text-[#3b5f8f]" : "text-[#1a1a1a]"}`}>
        {value}
      </span>
    </div>
  );
}

function EmptyCartPage() {
  return (
    <div className="pt-32 pb-20 min-h-screen bg-[#fafaf9]">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="w-24 h-24 mx-auto bg-white border border-[#e5e7eb] rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={36} className="text-[#3b5f8f]" />
        </div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-3">
          Your cart is empty
        </h1>
        <p className="text-sm text-[#6b7280] mb-8 leading-relaxed">
          Looks like you have not added anything to your cart yet. Explore our collections and find your next favorite piece.
        </p>
        <Link href="/shop" className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-8 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#3b5f8f] transition-colors duration-300">
          Start Shopping
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}