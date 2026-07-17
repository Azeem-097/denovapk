"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";

export default function CheckoutPage() {
  const router = useRouter();
  const items         = useCartStore((s) => s.items);
  const isLoggedIn    = useAuthStore((s) => s.isLoggedIn);
  const loadAddresses = useAuthStore((s) => s.loadAddresses);

  useEffect(() => {
    if (isLoggedIn) loadAddresses();
  }, [isLoggedIn, loadAddresses]);

  useEffect(() => {
    if (typeof window !== "undefined" && items.length === 0) {
      const timer = setTimeout(() => router.push("/cart"), 100);
      return () => clearTimeout(timer);
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-sm text-[#6b7280] mb-3">Your cart is empty</p>
          <Link href="/shop" className="text-sm text-[#1a1a1a] underline">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">

      {/* Page header — matches your other page-header pattern */}
      <div className="pt-28 pb-6 sm:pt-32 sm:pb-8 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Cart", href: "/cart" },
                { label: "Checkout" },
              ]}
              className="mb-3"
            />
          </FadeIn>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1a1a1a]">
            Checkout
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 lg:gap-14">

          <div>
            <CheckoutForm />
          </div>

          <div className="lg:sticky lg:top-8 lg:self-start">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}