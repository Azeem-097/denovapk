"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Package, Truck, MessageCircle, ArrowRight, ShoppingBag } from "lucide-react";
import { useCheckoutStore } from "@/store/checkoutStore";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";

export default function ConfirmationPage() {
  const router = useRouter();
  const { orderNumber, shippingData, shippingMethod, paymentMethod, reset } = useCheckoutStore();

  // Redirect if no order number
  useEffect(() => {
    if (!orderNumber) {
      const timer = setTimeout(() => router.push("/"), 100);
      return () => clearTimeout(timer);
    }
  }, [orderNumber, router]);

  if (!orderNumber || !shippingData) {
    return null;
  }

  return (
    <div className="pt-24 pb-16 sm:pt-28 sm:pb-20 min-h-screen bg-[#fafaf9]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Success card */}
        <FadeIn>
          <div className="bg-white border border-[#e5e7eb] p-8 sm:p-10 text-center">

            {/* Icon */}
            <div className="w-20 h-20 mx-auto bg-[#f5f0e8] rounded-full flex items-center justify-center mb-6 relative">
              <CheckCircle size={40} className="text-[#E10600]" strokeWidth={1.5} />
              <div className="absolute inset-0 rounded-full border-4 border-[#E10600]/20 animate-ping" />
            </div>

            {/* Message */}
            <FadeIn delay={200}>
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#E10600]">
                Order Confirmed
              </span>
            </FadeIn>

            <TextReveal as="h1" delay={300}>
              <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-[#1a1a1a] mt-2 block">
                Thank you for your order
              </span>
            </TextReveal>

            <FadeIn delay={400}>
              <p className="text-sm text-[#6b7280] mt-3 leading-relaxed max-w-md mx-auto">
                Your order has been received successfully. It will be delivered within 3 to 4 days, and our team will contact you shortly on WhatsApp to confirm the details.
              </p>
            </FadeIn>

            {/* Order number */}
            <FadeIn delay={500}>
              <div className="mt-6 pt-6 border-t border-[#e5e7eb]">
                <p className="text-xs uppercase tracking-wide text-[#6b7280] mb-1">
                  Order Tracking Number
                </p>
                <p className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1a1a1a] tracking-wider">
                  #{orderNumber}
                </p>
              </div>
            </FadeIn>
          </div>
        </FadeIn>

        {/* Order details */}
        <FadeIn delay={600}>
          <div className="mt-6 bg-white border border-[#e5e7eb] p-6 sm:p-8">
            <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-5">
              Order Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Shipping Address */}
              <div>
                <p className="text-xs font-medium tracking-wide uppercase text-[#E10600] mb-2">
                  Shipping Address
                </p>
                <p className="text-sm text-[#1a1a1a] font-medium">
                  {shippingData.fullName}
                </p>
                <p className="text-sm text-[#6b7280] mt-0.5 leading-relaxed">
                  {shippingData.address}
                </p>
                <p className="text-sm text-[#6b7280] mt-0.5 leading-relaxed">
                  {shippingData.city}, {shippingData.province.toUpperCase()} {shippingData.postalCode}
                </p>
                <p className="text-sm text-[#6b7280] mt-2">{shippingData.phone}</p>
              </div>

              {/* Delivery + Payment */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium tracking-wide uppercase text-[#E10600] mb-2">
                    Delivery Method
                  </p>
                  <p className="text-sm text-[#1a1a1a] font-medium">{shippingMethod.name}</p>
                  <p className="text-xs text-[#6b7280]">{shippingMethod.time}</p>
                </div>
                <div>
                  <p className="text-xs font-medium tracking-wide uppercase text-[#E10600] mb-2">
                    Payment Method
                  </p>
                  <p className="text-sm text-[#1a1a1a] font-medium capitalize">
                    {paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* What's next */}
        <FadeIn delay={700}>
          <div className="mt-6 bg-white border border-[#e5e7eb] p-6 sm:p-8">
            <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-5">
              What Happens Next
            </h2>

            <div className="space-y-4">
              <NextStep
                icon={MessageCircle}
                title="WhatsApp Confirmation"
                desc="Our team will contact you shortly on WhatsApp to confirm your order."
              />
              <NextStep
                icon={Package}
                title="Processing"
                desc="Our team will carefully pack your items with care."
              />
              <NextStep
                icon={Truck}
                title="Delivery"
                desc="Your order is expected to arrive within 3 to 4 days."
              />
            </div>
          </div>
        </FadeIn>

        {/* CTAs */}
        <FadeIn delay={800}>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/shop"
              onClick={() => reset()}
              className="group inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white px-7 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#E10600] transition-colors"
            >
              <ShoppingBag size={16} />
              Continue Shopping
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/track-order"
              className="inline-flex items-center justify-center border border-[#1a1a1a] text-[#1a1a1a] px-7 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#1a1a1a] hover:text-white transition-colors"
            >
              Track Your Order
            </Link>
          </div>
        </FadeIn>

        {/* Help */}
        <FadeIn delay={900}>
          <p className="mt-6 text-center text-xs text-[#6b7280]">
            Need help? <a href="/contact" className="text-[#E10600] hover:underline">Contact our support team</a>
          </p>
        </FadeIn>
      </div>
    </div>
  );
}

function NextStep({
  icon: Icon, title, desc,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-[#f5f0e8] flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-[#E10600]" />
      </div>
      <div className="flex-1 pt-1">
        <p className="text-sm font-semibold text-[#1a1a1a]">{title}</p>
        <p className="text-xs text-[#6b7280] mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
