"use client";
import { useState } from "react";
import { ArrowRight, CreditCard, Truck, Building2, Smartphone, Wallet } from "lucide-react";
import { useCheckoutStore, type PaymentMethod } from "@/store/checkoutStore";
import { Input } from "@/components/ui/Input";
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
  const { paymentMethod, setPaymentMethod, shippingMethod } = useCheckoutStore();
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });

  return (
    <div className="space-y-6">

      {/* Shipping method summary */}
      <div className="border border-[#e5e7eb] bg-[#fafaf9] px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs font-medium tracking-wide uppercase text-[#6b7280]">
              Delivery Method
            </p>
            <p className="text-sm text-[#1a1a1a] mt-0.5">
              {shippingMethod.name} — <span className="text-[#6b7280]">{shippingMethod.time}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-[#c9a96e] hover:text-[#b8955a] underline flex-shrink-0"
          >
            Change
          </button>
        </div>
      </div>

      {/* Payment methods */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={16} className="text-[#c9a96e]" />
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
            Payment Method
          </h2>
        </div>

        <div className="space-y-3">
          {PAYMENT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = paymentMethod === opt.id;
            return (
              <div key={opt.id}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod(opt.id as PaymentMethod)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 border transition-all text-left",
                    isSelected
                      ? "border-[#c9a96e] bg-[#f5f0e8]/40"
                      : "border-[#e5e7eb] hover:border-[#c9a96e]"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      isSelected ? "border-[#c9a96e]" : "border-[#e5e7eb]"
                    )}
                  >
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#c9a96e]" />}
                  </div>
                  <Icon size={20} className={isSelected ? "text-[#c9a96e]" : "text-[#6b7280]"} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1a1a1a]">{opt.label}</p>
                    <p className="text-xs text-[#6b7280] mt-0.5">{opt.desc}</p>
                  </div>
                </button>

                {/* Expanded card form */}
                {isSelected && opt.id === "card" && (
                  <div className="mt-3 p-4 border border-[#e5e7eb] bg-[#fafaf9] space-y-3">
                    <Input
                      label="Card Number"
                      placeholder="1234 5678 9012 3456"
                      value={card.number}
                      onChange={(e) => setCard({ ...card, number: e.target.value })}
                    />
                    <Input
                      label="Cardholder Name"
                      placeholder="John Doe"
                      value={card.name}
                      onChange={(e) => setCard({ ...card, name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Expiry (MM/YY)"
                        placeholder="12/25"
                        value={card.expiry}
                        onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                      />
                      <Input
                        label="CVV"
                        placeholder="123"
                        type="password"
                        maxLength={4}
                        value={card.cvv}
                        onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* JazzCash / EasyPaisa expansion */}
                {isSelected && (opt.id === "jazzcash" || opt.id === "easypaisa") && (
                  <div className="mt-3 p-4 border border-[#e5e7eb] bg-[#fafaf9]">
                    <p className="text-xs text-[#6b7280] mb-3 leading-relaxed">
                      You will receive a payment request on your registered {opt.label} account after placing the order.
                    </p>
                    <Input
                      label={`${opt.label} Number`}
                      placeholder="03XX XXXXXXX"
                    />
                  </div>
                )}

                {/* Bank transfer expansion */}
                {isSelected && opt.id === "bank" && (
                  <div className="mt-3 p-4 border border-[#e5e7eb] bg-[#fafaf9] text-xs text-[#1a1a1a] space-y-2">
                    <p className="font-semibold uppercase tracking-wide text-[#c9a96e]">
                      Bank Details
                    </p>
                    <div className="space-y-1 text-[#6b7280]">
                      <p><span className="text-[#1a1a1a] font-medium">Bank:</span> Meezan Bank</p>
                      <p><span className="text-[#1a1a1a] font-medium">Account Title:</span> Denova PK (Pvt) Ltd</p>
                      <p><span className="text-[#1a1a1a] font-medium">Account #:</span> 0123-45678901-234</p>
                      <p><span className="text-[#1a1a1a] font-medium">IBAN:</span> PK00 MEZN 0001 2345 6789 0123</p>
                    </div>
                    <p className="text-[10px] mt-2 pt-2 border-t border-[#e5e7eb] text-[#6b7280]">
                      Please share payment receipt on WhatsApp: +92 300 123 4567 after transfer.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
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
          Review Order
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}