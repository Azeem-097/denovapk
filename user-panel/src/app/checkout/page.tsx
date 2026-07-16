"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useAuthStore } from "@/store/authStore";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { ShippingForm } from "@/components/checkout/ShippingForm";
import { ShippingMethodStep } from "@/components/checkout/ShippingMethodStep";
import { PaymentStep } from "@/components/checkout/PaymentStep";
import { ReviewStep } from "@/components/checkout/ReviewStep";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { FadeIn } from "@/components/animations/FadeIn";

export default function CheckoutPage() {
  const router = useRouter();
  const items         = useCartStore((s) => s.items);
  const currentStep   = useCheckoutStore((s) => s.currentStep);
  const setStep       = useCheckoutStore((s) => s.setStep);
  const isLoggedIn    = useAuthStore((s) => s.isLoggedIn);
  const loadAddresses = useAuthStore((s) => s.loadAddresses);

  // Load addresses when checkout mounts (ensure fresh data)
  useEffect(() => {
    if (isLoggedIn) {
      loadAddresses();
    }
  }, [isLoggedIn, loadAddresses]);

  // Redirect if cart is empty (after hydration)
  useEffect(() => {
    if (typeof window !== "undefined" && items.length === 0) {
      const timer = setTimeout(() => router.push("/cart"), 100);
      return () => clearTimeout(timer);
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-sm text-[#6b7280] mb-3">Your cart is empty</p>
          <Link href="/shop" className="text-sm text-[#c9a96e] underline">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="pt-24 pb-6 sm:pt-28 sm:pb-8 bg-white border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Link href="/" className="flex flex-col items-start leading-none">
              <span className="font-[family-name:var(--font-playfair)] text-2xl font-bold tracking-[0.08em] text-[#1a1a1a]">
                DENOVA
              </span>
              <span className="text-[9px] font-medium tracking-[0.35em] text-[#c9a96e] uppercase">
                Checkout
              </span>
            </Link>
            <div className="flex items-center gap-2 text-xs text-[#6b7280]">
              <Lock size={13} className="text-[#c9a96e]" />
              Secure Checkout
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 bg-[#fafaf9] min-h-screen">
        <FadeIn>
          <CheckoutSteps currentStep={currentStep} />
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-10">

          {/* Left: form */}
          <FadeIn>
            <div className="bg-white border border-[#e5e7eb] p-5 sm:p-6 lg:p-8">
              {currentStep === 1 && (
                <ShippingForm onNext={() => setStep(2)} />
              )}
              {currentStep === 2 && (
                <ShippingMethodStep
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
                />
              )}
              {currentStep === 3 && (
                <PaymentStep
                  onNext={() => setStep(4)}
                  onBack={() => setStep(2)}
                />
              )}
              {currentStep === 4 && (
                <ReviewStep onBack={() => setStep(3)} />
              )}
            </div>
          </FadeIn>

          {/* Right: order summary */}
          <FadeIn delay={100}>
            <div className="lg:sticky lg:top-24 lg:self-start">
              <OrderSummary editable={currentStep === 1} />
            </div>
          </FadeIn>
        </div>
      </div>
    </>
  );
}