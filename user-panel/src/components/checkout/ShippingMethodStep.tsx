"use client";
import { ArrowRight, Truck } from "lucide-react";
import { useCheckoutStore, SHIPPING_METHODS } from "@/store/checkoutStore";
import { formatPrice, cn } from "@/lib/utils";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function ShippingMethodStep({ onNext, onBack }: Props) {
  const { shippingMethod, setShippingMethod, shippingData } = useCheckoutStore();

  return (
    <div className="space-y-6">

      {/* Contact summary */}
      {shippingData && (
        <div className="border border-[#e5e7eb] bg-[#fafaf9]">
          <div className="px-4 py-3 space-y-1.5">
            <SummaryRow label="Contact" value={shippingData.email} onEdit={onBack} />
            <SummaryRow
              label="Ship to"
              value={`${shippingData.address}, ${shippingData.city}, ${shippingData.postalCode}`}
              onEdit={onBack}
            />
          </div>
        </div>
      )}

      {/* Shipping methods */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Truck size={16} className="text-[#c9a96e]" />
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
            Shipping Method
          </h2>
        </div>

        <div className="space-y-3">
          {SHIPPING_METHODS.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => setShippingMethod(method)}
              className={cn(
                "w-full flex items-center gap-4 p-4 border transition-all text-left",
                shippingMethod.id === method.id
                  ? "border-[#c9a96e] bg-[#f5f0e8]/40"
                  : "border-[#e5e7eb] hover:border-[#c9a96e]"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                  shippingMethod.id === method.id
                    ? "border-[#c9a96e]"
                    : "border-[#e5e7eb]"
                )}
              >
                {shippingMethod.id === method.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#c9a96e]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1a1a1a]">{method.name}</p>
                <p className="text-xs text-[#6b7280] mt-0.5">{method.time}</p>
              </div>
              <p className="text-sm font-bold text-[#1a1a1a]">
                {formatPrice(method.price)}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb]">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-[#6b7280] hover:text-[#1a1a1a] transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowRight size={14} className="rotate-180" />
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          className="group inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-7 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#c9a96e] transition-colors"
        >
          Continue to Payment
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

function SummaryRow({
  label, value, onEdit,
}: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
        <span className="text-xs font-medium tracking-wide uppercase text-[#6b7280] sm:w-16 flex-shrink-0">
          {label}
        </span>
        <span className="text-sm text-[#1a1a1a] break-words">{value}</span>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-xs text-[#c9a96e] hover:text-[#b8955a] underline flex-shrink-0"
      >
        Change
      </button>
    </div>
  );
}