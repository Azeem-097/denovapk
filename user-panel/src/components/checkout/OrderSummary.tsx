"use client";
import { useCallback, useState } from "react";
import Image from "next/image";
import { HelpCircle } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import { PromotionBanner } from "./PromotionBanner";
import { formatPrice, cn } from "@/lib/utils";

export function OrderSummary() {
  const items    = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());

  const shippingMethod       = useCheckoutStore((s) => s.shippingMethod);
  const loyaltyDiscount      = useCheckoutStore((s) => s.loyaltyDiscount);
  const loyaltyPointsUsed    = useCheckoutStore((s) => s.loyaltyPointsUsed);
  const birthdayDiscount     = useCheckoutStore((s) => s.birthdayDiscount);
  const discountCode         = useCheckoutStore((s) => s.discountCode);
  const discountAmount       = useCheckoutStore((s) => s.discountAmount);
  const setLoyaltyRedemption = useCheckoutStore((s) => s.setLoyaltyRedemption);
  const setBirthdayDiscount  = useCheckoutStore((s) => s.setBirthdayDiscount);
  const setDiscountCode      = useCheckoutStore((s) => s.setDiscountCode);
  const clearDiscountCode    = useCheckoutStore((s) => s.clearDiscountCode);

  const shipping = shippingMethod.price;
  const tax      = 0;

  const [promoCode, setPromoCode]         = useState("");
  const [promoLoading, setPromoLoading]   = useState(false);
  const [promoError, setPromoError]       = useState("");

  const promoApplied = !!discountCode && discountAmount > 0;
  const total = subtotal + shipping + tax - loyaltyDiscount - birthdayDiscount - discountAmount;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");

    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, subtotal }),
      });
      const data = await res.json();

      if (data.valid) {
        setDiscountCode(data.code || promoCode.trim().toUpperCase(), data.amount);
        setPromoCode(data.code || promoCode.trim().toUpperCase());
        setPromoError("");
      } else {
        setPromoError(data.error || "Invalid discount code");
        clearDiscountCode();
      }
    } catch {
      setPromoError("Network error. Please try again.");
      clearDiscountCode();
    }
    setPromoLoading(false);
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    clearDiscountCode();
    setPromoError("");
  };

  const handlePromoApplied = useCallback((promo: {
    type: "birthday" | "first_order" | "loyalty" | null;
    discount: number;
    loyaltyPoints: number;
    canEarnLoyalty: boolean;
  }) => {
    if (promo.type === "birthday" || promo.type === "first_order") {
      setBirthdayDiscount(promo.discount, true);
      setLoyaltyRedemption(0, 0);
    } else if (promo.type === "loyalty") {
      setBirthdayDiscount(0, false);
      setLoyaltyRedemption(promo.loyaltyPoints, promo.discount);
    } else {
      setBirthdayDiscount(0, false);
      setLoyaltyRedemption(0, 0);
    }
  }, [setBirthdayDiscount, setLoyaltyRedemption]);

  return (
    <div className="space-y-6">

      {/* ─── Items — extra top padding so first item's qty badge doesn't clip ─── */}
      <div className="space-y-5 max-h-[480px] overflow-y-auto overflow-x-visible pt-3 pr-1">
        {items.map((item) => {
          const hasWaist = item.size && item.size !== "ONE-SIZE";
          const variantText = [
            item.color,
            hasWaist ? `${item.size}"` : null,
          ].filter(Boolean).join(" / ");

          return (
            <div key={item.id} className="flex gap-4 items-start">
              {/* Product image + qty badge */}
              <div className="relative flex-shrink-0">
                <div className="relative w-[76px] h-[92px] bg-[#f4f2ee] rounded-md overflow-hidden border border-[#e5e7eb]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                    sizes="76px"
                  />
                </div>
                {/* Round qty badge — Outfitters style */}
                <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 flex items-center justify-center bg-[#1a1a1a] text-white text-[11px] font-semibold rounded-full ring-2 ring-white z-10">
                  {item.quantity}
                </span>
              </div>

              {/* Name + variant */}
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm font-medium text-[#1a1a1a] line-clamp-2 leading-snug">
                  {item.name}
                </p>
                {variantText && (
                  <p className="text-xs text-[#6b7280] mt-1">{variantText}</p>
                )}
              </div>

              {/* Price */}
              <p className="text-sm font-medium text-[#1a1a1a] whitespace-nowrap pt-1">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Promotions banner — above discount code */}
      <PromotionBanner subtotal={subtotal} onPromoApplied={handlePromoApplied} />

      {/* Discount code */}
      <div>
        {promoApplied ? (
          <div className="flex items-center justify-between rounded-md bg-[#f0fdf4] border border-green-200 px-3 py-2.5">
            <span className="text-xs font-medium text-green-800">
              {discountCode} applied — {formatPrice(discountAmount)} off
            </span>
            <button onClick={handleRemovePromo} className="text-[10px] text-red-500 hover:text-red-700 underline">
              Remove
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(""); clearDiscountCode(); }}
                placeholder="Discount code or gift card"
                className="flex-1 rounded-md px-3.5 py-2.5 text-sm border border-[#d1d5db] focus:border-[#1a1a1a] focus:outline-none placeholder:text-[#9ca3af]"
              />
              <button
                onClick={handleApplyPromo}
                disabled={!promoCode.trim() || promoLoading}
                className={cn(
                  "rounded-md px-5 text-sm font-medium transition-colors disabled:opacity-40",
                  promoCode.trim()
                    ? "bg-[#1a1a1a] text-white hover:bg-[#E10600]"
                    : "bg-[#f4f2ee] text-[#6b7280]"
                )}
              >
                {promoLoading ? "..." : "Apply"}
              </button>
            </div>
            {promoError && (
              <p className="text-[11px] text-red-500 mt-1.5">{promoError}</p>
            )}
          </>
        )}
      </div>

      {/* Totals */}
      <div className="space-y-2 text-sm">
        <Row label="Subtotal" value={formatPrice(subtotal)} />

        {discountAmount > 0 && (
          <Row label={discountCode} value={`− ${formatPrice(discountAmount)}`} accent="green" />
        )}

        {birthdayDiscount > 0 && (
          <Row label="Birthday reward" value={`− ${formatPrice(birthdayDiscount)}`} accent="brand" />
        )}

        {loyaltyDiscount > 0 && (
          <Row label={`Loyalty (${loyaltyPointsUsed} pts)`} value={`− ${formatPrice(loyaltyDiscount)}`} accent="brand" />
        )}

        <Row
          label={
            <span className="inline-flex items-center gap-1">
              Shipping
              <HelpCircle size={13} className="text-[#9ca3af]" />
            </span>
          }
          value={shipping === 0 ? "FREE" : formatPrice(shipping)}
        />

        {tax > 0 && <Row label="Tax" value={formatPrice(tax)} />}
      </div>

      {/* Grand total */}
      <div className="pt-2 border-t border-[#e5e7eb]">
        <div className="pt-4 flex items-baseline justify-between">
          <span className="text-base font-semibold text-[#1a1a1a]">Total</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-[#6b7280] font-medium">PKR</span>
            <span className="text-xl font-bold text-[#1a1a1a]">{formatPrice(total).replace(/^Rs\.?\s*/, "Rs ")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label, value, accent,
}: {
  label: React.ReactNode;
  value: string;
  accent?: "brand" | "green";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#6b7280]">{label}</span>
      <span className={cn(
        "font-medium",
        accent === "brand" ? "text-[#E10600]" :
        accent === "green" ? "text-green-600" :
        "text-[#1a1a1a]"
      )}>
        {value}
      </span>
    </div>
  );
}
