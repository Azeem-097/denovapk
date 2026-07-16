"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Award, Cake } from "lucide-react";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import { formatPrice } from "@/lib/utils";

interface Props { onBack: () => void; }

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery", card: "Credit / Debit Card",
  jazzcash: "JazzCash", easypaisa: "EasyPaisa", bank: "Bank Transfer",
};

export function ReviewStep({ onBack }: Props) {
  const router = useRouter();
  const {
    shippingData, shippingMethod, paymentMethod,
    setOrderNumber, setStep,
    loyaltyPointsUsed, loyaltyDiscount,
    birthdayDiscount, isBirthdayEligible,
  } = useCheckoutStore();
  const items     = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const showToast = useToastStore((s) => s.addToast);
  const [placing, setPlacing] = useState(false);
  const [agreed,  setAgreed]  = useState(false);

  const handlePlaceOrder = async () => {
    if (!agreed) { showToast({ type: "error", message: "Please agree to the terms & conditions." }); return; }
    if (!shippingData) { showToast({ type: "error", message: "Shipping info missing" }); return; }

    setPlacing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping: shippingData, shippingMethod, paymentMethod,
          items: items.map((i) => ({
            productId: i.productId, variantId: i.variantId,
            name: i.name, image: i.image,
            size: i.size, color: i.color,
            price: i.price, quantity: i.quantity,
          })),
          saveAddress: shippingData.saveInfo ?? true,
          loyaltyPointsToUse: loyaltyPointsUsed,
        }),
      });
      const data = await res.json();
      if (!res.ok) { showToast({ type: "error", message: data.error || "Order failed" }); setPlacing(false); return; }

      setOrderNumber(data.orderNumber);
      await clearCart();
      setStep(1);

      let successMsg = "Order placed successfully!";
      if (data.isBirthdayOrder) successMsg = "🎂 Happy Birthday! Your special discount was applied. Order placed!";
      if (data.pointsEarned > 0) successMsg += ` You earned ${data.pointsEarned} loyalty points! 🎁`;
      showToast({ type: "success", message: successMsg, duration: 5000 });

      router.push("/checkout/confirmation");
    } catch (err) {
      console.error(err);
      showToast({ type: "error", message: "Network error. Please try again." });
      setPlacing(false);
    }
  };

  if (!shippingData) return null;

  return (
    <div className="space-y-6">
      <div className="border border-[#e5e7eb] divide-y divide-[#e5e7eb]">
        <ReviewSection title="Contact" onEdit={() => setStep(1)}>
          <p className="text-sm text-[#1a1a1a]">{shippingData.email}</p>
          <p className="text-sm text-[#6b7280]">{shippingData.phone}</p>
        </ReviewSection>

        <ReviewSection title="Ship to" onEdit={() => setStep(1)}>
          <p className="text-sm text-[#1a1a1a]">{shippingData.firstName} {shippingData.lastName}</p>
          <p className="text-sm text-[#6b7280] mt-0.5">
            {shippingData.address}{shippingData.apartment && `, ${shippingData.apartment}`}<br />
            {shippingData.city}, {shippingData.province.toUpperCase()} {shippingData.postalCode}
          </p>
        </ReviewSection>

        <ReviewSection title="Delivery" onEdit={() => setStep(2)}>
          <p className="text-sm text-[#1a1a1a]">{shippingMethod.name}</p>
          <p className="text-sm text-[#6b7280] mt-0.5">{shippingMethod.time}</p>
        </ReviewSection>

        <ReviewSection title="Payment" onEdit={() => setStep(3)}>
          <p className="text-sm text-[#1a1a1a]">{PAYMENT_LABELS[paymentMethod]}</p>
        </ReviewSection>

        {birthdayDiscount > 0 && (
          <ReviewSection title="Birthday" onEdit={() => setStep(3)}>
            <p className="text-sm text-[#c9a96e] font-semibold flex items-center gap-1.5">
              <Cake size={13} />
              🎉 Birthday discount: {formatPrice(birthdayDiscount)} OFF
            </p>
          </ReviewSection>
        )}

        {loyaltyPointsUsed > 0 && (
          <ReviewSection title="Rewards" onEdit={() => setStep(3)}>
            <p className="text-sm text-[#c9a96e] font-semibold flex items-center gap-1.5">
              <Award size={13} />
              Redeeming {loyaltyPointsUsed} points ({formatPrice(loyaltyDiscount)} discount)
            </p>
          </ReviewSection>
        )}
      </div>

      {isBirthdayEligible && birthdayDiscount === 0 && (
        <div className="border border-[#c9a96e]/40 bg-[#f5f0e8]/40 p-4 text-sm text-[#1a1a1a]">
          <p className="font-semibold flex items-center gap-1.5 mb-1">
            <Cake size={14} className="text-[#c9a96e]" />
            Birthday discount available!
          </p>
          <p className="text-xs text-[#6b7280]">
            Add more items to reach the minimum order for your birthday discount.
          </p>
        </div>
      )}

      <label className="flex items-start gap-2.5 cursor-pointer group">
        <div onClick={() => setAgreed(!agreed)}
          className={`mt-0.5 w-4 h-4 border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            agreed ? "border-[#c9a96e] bg-[#c9a96e]" : "border-[#e5e7eb] group-hover:border-[#c9a96e]"
          }`}>
          {agreed && (
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <span className="text-sm text-[#6b7280] leading-relaxed">
          I agree to the <a href="/terms" className="text-[#c9a96e] hover:underline">Terms of Service</a> and{" "}
          <a href="/privacy" className="text-[#c9a96e] hover:underline">Privacy Policy</a>.
        </span>
      </label>

      <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb] gap-3 flex-wrap">
        <button type="button" onClick={onBack} disabled={placing}
          className="text-sm text-[#6b7280] hover:text-[#1a1a1a] transition-colors inline-flex items-center gap-1.5 disabled:opacity-40">
          <ArrowRight size={14} className="rotate-180" />
          Back
        </button>

        <button type="button" onClick={handlePlaceOrder} disabled={placing || !agreed}
          className="group inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-7 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#c9a96e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {placing ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Placing Order...</>
          ) : (
            <><Lock size={16} />Place Order<ArrowRight size={16} /></>
          )}
        </button>
      </div>
    </div>
  );
}

function ReviewSection({ title, children, onEdit }: {
  title: string; children: React.ReactNode; onEdit: () => void;
}) {
  return (
    <div className="px-4 py-3.5 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:gap-4">
        <span className="text-xs font-semibold tracking-wide uppercase text-[#6b7280] sm:w-24 flex-shrink-0 mt-0.5">
          {title}
        </span>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
      <button type="button" onClick={onEdit} className="text-xs text-[#c9a96e] hover:text-[#b8955a] underline flex-shrink-0 mt-0.5">
        Edit
      </button>
    </div>
  );
}