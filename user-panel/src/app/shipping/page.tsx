import type { Metadata } from "next";
import Link from "next/link";
import { Truck, Package, Clock, MapPin, Phone } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { SlideUp } from "@/components/animations/SlideUp";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Learn about Denova PK shipping methods, delivery times, and charges.",
};

const SHIPPING_METHODS = [
  {
    icon: Truck,
    title: "Standard Delivery",
    time: "3–5 Business Days",
    cost: "PKR 250 (FREE above PKR 5,000)",
    desc: "Available nationwide across all major cities and towns in Pakistan.",
  },
  {
    icon: Clock,
    title: "Express Delivery",
    time: "1–2 Business Days",
    cost: "PKR 500",
    desc: "Priority handling and faster courier for urgent orders.",
  },
  {
    icon: MapPin,
    title: "Same-Day Delivery",
    time: "Within 24 Hours",
    cost: "PKR 800",
    desc: "Available in Lahore only. Order before 12 PM for same-day delivery.",
  },
];

const SECTIONS = [
  {
    title: "Processing Time",
    content: "All orders are processed within 1–2 business days after payment confirmation. Orders placed on weekends or public holidays are processed on the next business day. You will receive an email confirmation with tracking details once your order is dispatched.",
  },
  {
    title: "Tracking Your Order",
    content: "Once your order is shipped, you will receive an SMS and email with your tracking number. You can track your order in real-time from your Account Dashboard or via our Track Order page. For COD orders, tracking begins after the order is confirmed by our team.",
  },
  {
    title: "Delivery Areas",
    content: "We currently deliver to all major cities and towns across Pakistan including Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Hyderabad, and more. Remote areas may experience slightly longer delivery times.",
  },
  {
    title: "Failed Delivery Attempts",
    content: "Our courier will attempt delivery twice. If both attempts fail, the package will be held at the courier facility for 3 days. After that, it will be returned to us. Please ensure someone is available to receive the order, or provide accurate contact details.",
  },
  {
    title: "Damaged or Lost Packages",
    content: "In the rare event that your package arrives damaged or is lost in transit, please contact us within 48 hours of the expected delivery date. We will investigate and either resend the order or issue a full refund at no cost to you.",
  },
];

export default function ShippingPage() {
  return (
    <>
      <div className="pt-28 pb-10 sm:pt-32 sm:pb-14 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Shipping Policy" }]}
              className="mb-4 justify-center"
            />
          </FadeIn>
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">
              Delivery Information
            </span>
          </FadeIn>
          <TextReveal as="h1" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-2 block">
              Shipping Policy
            </span>
          </TextReveal>
          <FadeIn delay={200}>
            <p className="text-[#6b7280] text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed">
              We are committed to delivering your order safely and on time, every time.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-12">

        {/* Shipping methods */}
        <section>
          <FadeIn>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1a1a1a] mb-6">
              Shipping Methods
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SHIPPING_METHODS.map((method, i) => (
              <SlideUp key={method.title} stagger={100} index={i}>
                <div className="border border-[#e5e7eb] bg-white p-6 h-full">
                  <div className="w-10 h-10 rounded-full bg-[#f5f0e8] flex items-center justify-center mb-4">
                    <method.icon size={18} className="text-[#c9a96e]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1a1a1a] mb-1">{method.title}</h3>
                  <p className="text-xs font-semibold text-[#c9a96e] mb-2">{method.time}</p>
                  <p className="text-xs font-medium text-[#1a1a1a] mb-3">{method.cost}</p>
                  <p className="text-xs text-[#6b7280] leading-relaxed">{method.desc}</p>
                </div>
              </SlideUp>
            ))}
          </div>
        </section>

        {/* Free shipping banner */}
        <FadeIn>
          <div className="bg-[#1a1a1a] text-white p-6 sm:p-8 flex items-center gap-4">
            <Package size={32} className="text-[#c9a96e] flex-shrink-0" />
            <div>
              <p className="text-base font-bold mb-1">Free Shipping on Orders Above PKR 5,000</p>
              <p className="text-sm text-white/70">
                Add more items to your cart to qualify for free standard delivery anywhere in Pakistan.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Detail sections */}
        <section className="space-y-6">
          {SECTIONS.map((section, i) => (
            <FadeIn key={section.title} delay={i * 60}>
              <div className="border-l-2 border-[#c9a96e] pl-5">
                <h3 className="text-sm font-bold text-[#1a1a1a] mb-2">{section.title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{section.content}</p>
              </div>
            </FadeIn>
          ))}
        </section>

        {/* Contact */}
        <FadeIn>
          <div className="bg-[#f5f0e8] border border-[#c9a96e]/30 p-6 flex items-start gap-4">
            <Phone size={18} className="text-[#c9a96e] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a] mb-1">
                Questions about your shipment?
              </p>
              <p className="text-sm text-[#6b7280] mb-3">
                Our support team is available Monday–Saturday, 10 AM – 8 PM.
              </p>
              <Link
                href="/contact"
                className="text-xs font-semibold text-[#c9a96e] hover:text-[#b8955a] underline"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </FadeIn>

      </div>
    </>
  );
}