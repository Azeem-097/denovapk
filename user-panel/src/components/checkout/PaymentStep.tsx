"use client";
import { useState, useCallback } from "react";
import { ArrowRight, CreditCard, Truck, Building2, Smartphone, Wallet } from "lucide-react";
import { useCheckoutStore, type PaymentMethod } from "@/store/checkoutStore";
import { useCartStore } from "@/store/cartStore";
import { Input } from "@/components/ui/Input";
import { PromotionBanner } from "./PromotionBanner";
import { cn } from "@/lib/utils";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const PAYMENT_OPTIONS = [
  { id: "cod",       label: "Cash on Delivery",     desc: "Pay when you receive your order",     icon: Truck },
  { id: "card",      label: "Credit / Debit Card",  desc: "Visa, Mastercard, and more",           icon: CreditCard },
  { id: "jazzcash",  label: "JazzCash",             desc: "Pay via JazzCash mobile wallet",       icon: Smartphone },
  { id: "easypaisa", label: "EasyPaisa",            desc: "Pay via EasyPaisa mobile wallet",      icon: Wallet },
  { id: "bank",      label: "Bank Transfer",        desc: "Direct bank transfer to our account",  icon: Building2 },
] as const;

export function PaymentStep({ onNext, onBack }: Props) {
  const {
    paymentMethod, setPaymentMethod, shippingMethod,
    setLoyaltyRedemption, setBirthdayDiscount,
  } = useCheckoutStore();
  const subtotal = useCartStore((s) => s.getSubtotal());
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [activePromoType, setActivePromoType] = useState<string | null>(null);

  // Single callback for ALL promotions
  const handlePromoApplied = useCallback((promo: {
    type: "birthday" | "first_order" | "loyalty" | null;
    discount: number;
    loyaltyPoints: number;
    canEarnLoyalty: boolean;
  }) => {
    setActivePromoType(promo.type);

    if (promo.type === "birthday" || promo.type === "first_order") {
      // Auto-applied discount (birthday or first order)
      setBirthdayDiscount(promo.discount, true);
      setLoyaltyRedemption(0, 0); // Block loyalty
    } else if (promo.type === "loyalty") {
      // Manual loyalty redemption
      setBirthdayDiscount(0, false);
      setLoyaltyRedemption(promo.loyaltyPoints, promo.discount);
    } else {
      // No promo
      setBirthdayDiscount(0, false);
      setLoyaltyRedemption(0, 0);
    }
  }, [setBirthdayDiscount, setLoyaltyRedemption]);

  return (
    <div className="space-y-6">

      {/* Shipping summary */}
      <div className="border border-[#e5e7eb] bg-[#fafaf9] px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs font-medium tracking-wide uppercase text-[#6b7280]">Delivery Method</p>
            <p className="text-sm text-[#1a1a1a] mt-0.5">
              {shippingMethod.name} — <span className="text-[#6b7280]">{shippingMethod.time}</span>
            </p>
          </div>
          <button type="button" onClick={onBack} className="text-xs text-[#c9a96e] hover:text-[#b8955a] underline flex-shrink-0">
            Change
          </button>
        </div>
      </div>

      {/* UNIFIED PROMOTION BANNER — handles birthday, first order, AND loyalty */}
      <PromotionBanner
        subtotal={subtotal}
        onPromoApplied={handlePromoApplied}
      />

      {/* Payment methods */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={16} className="text-[#c9a96e]" />
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">Payment Method</h2>
        </div>

        <div className="space-y-3">
          {PAYMENT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = paymentMethod === opt.id;
            return (
              <div key={opt.id}>
                <button type="button" onClick={() => setPaymentMethod(opt.id as PaymentMethod)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 border transition-all text-left",
                    isSelected ? "border-[#c9a96e] bg-[#f5f0e8]/40" : "border-[#e5e7eb] hover:border-[#c9a96e]"
                  )}>
                  <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    isSelected ? "border-[#c9a96e]" : "border-[#e5e7eb]")}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#c9a96e]" />}
                  </div>
                  <Icon size={20} className={isSelected ? "text-[#c9a96e]" : "text-[#6b7280]"} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1a1a1a]">{opt.label}</p>
                    <p className="text-xs text-[#6b7280] mt-0.5">{opt.desc}</p>
                  </div>
                </button>

                {isSelected && opt.id === "card" && (
                  <div className="mt-3 p-4 border border-[#e5e7eb] bg-[#fafaf9] space-y-3">
                    <Input label="Card Number" placeholder="1234 5678 9012 3456" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
                    <Input label="Cardholder Name" placeholder="John Doe" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Expiry (MM/YY)" placeholder="12/25" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
                      <Input label="CVV" placeholder="123" type="password" maxLength={4} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb]">
        <button type="button" onClick={onBack} className="text-sm text-[#6b7280] hover:text-[#1a1a1a] transition-colors inline-flex items-center gap-1.5">
          <ArrowRight size={14} className="rotate-180" />
          Back
        </button>
        <button type="button" onClick={onNext} className="group inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-7 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#c9a96e] transition-colors">
          Review Order
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}