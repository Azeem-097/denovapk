"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronUp, ChevronDown, Tag, Lock } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import { formatPrice, cn } from "@/lib/utils";

interface OrderSummaryProps {
  showItems?: boolean;
  editable?:  boolean;
}

export function OrderSummary({ showItems = true, editable = false }: OrderSummaryProps) {
  const items    = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());

  const shippingMethod = useCheckoutStore((s) => s.shippingMethod);
  const shipping       = shippingMethod.price;
  const tax            = 0;
  const total          = subtotal + shipping + tax;

  const [expanded, setExpanded] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      setPromoApplied(true);
    }
  };

  return (
    <div className="border border-[#e5e7eb] bg-white">
      {/* Header (mobile toggle) */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="lg:hidden w-full px-5 py-4 flex items-center justify-between border-b border-[#e5e7eb] bg-[#fafaf9]"
      >
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-[#c9a96e]" />
          <span className="text-sm font-medium text-[#1a1a1a]">
            {expanded ? "Hide" : "Show"} order summary
          </span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
        <span className="text-base font-bold text-[#1a1a1a]">
          {formatPrice(total)}
        </span>
      </button>

      <div className={cn("lg:block", !expanded && "hidden")}>

        {/* Items */}
        {showItems && (
          <div className="px-5 py-4 border-b border-[#e5e7eb] max-h-[300px] overflow-y-auto">
            <h3 className="hidden lg:block text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-3">
              Your Order ({items.length})
            </h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-14 h-16 flex-shrink-0 bg-[#fafaf9]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="60px"
                    />
                    <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-[#c9a96e] text-white text-[10px] font-bold rounded-full">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#1a1a1a] line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-[#6b7280] mt-0.5">
                      {item.size} · {item.color}
                    </p>
                    <p className="text-xs font-semibold text-[#1a1a1a] mt-1">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Promo code */}
        {editable && (
          <div className="px-5 py-4 border-b border-[#e5e7eb]">
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Promo code"
                disabled={promoApplied}
                className="flex-1 px-3 py-2.5 text-sm border border-[#e5e7eb] focus:border-[#c9a96e] focus:outline-none placeholder:text-[#6b7280]/60 disabled:bg-[#fafaf9]"
              />
              <button
                onClick={handleApplyPromo}
                disabled={promoApplied || !promoCode.trim()}
                className="px-4 py-2.5 text-xs font-semibold tracking-wide uppercase border border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {promoApplied ? "Applied" : "Apply"}
              </button>
            </div>
          </div>
        )}

        {/* Summary rows */}
        <div className="px-5 py-4 space-y-2 border-b border-[#e5e7eb]">
          <SumRow label="Subtotal" value={formatPrice(subtotal)} />
          <SumRow
            label="Shipping"
            value={shipping === 0 ? "FREE" : formatPrice(shipping)}
            highlight={shipping === 0}
          />
          <SumRow label="Tax" value={formatPrice(tax)} />
        </div>

        {/* Total */}
        <div className="px-5 py-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold tracking-wide uppercase text-[#1a1a1a]">
              Total
            </span>
            <span className="text-xl font-bold text-[#1a1a1a]">
              {formatPrice(total)}
            </span>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[10px] text-[#6b7280]">
            <Lock size={11} className="text-[#c9a96e]" />
            Secure encrypted checkout
          </p>
        </div>
      </div>
    </div>
  );
}

function SumRow({
  label, value, highlight,
}: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#6b7280]">{label}</span>
      <span className={cn(
        "font-medium",
        highlight ? "text-[#c9a96e]" : "text-[#1a1a1a]"
      )}>
        {value}
      </span>
    </div>
  );
}