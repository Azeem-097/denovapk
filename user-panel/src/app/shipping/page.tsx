import type { Metadata } from "next";
import Link from "next/link";
import { Truck, Package, Phone, Shield, RotateCcw } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { getSiteInfo } from "@/lib/siteInfo";
import { getBoolSetting, getNumberSetting } from "@/lib/db/repositories/settings";

// ISR: 10 min cache. Shipping policy rarely changes.
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Learn about Denova PK shipping methods, delivery times, and charges.",
};

const SECTIONS = [
  {
    title: "Processing Time",
    content: "All orders are processed within 1-2 business days after payment confirmation. Orders placed on weekends or public holidays are processed on the next business day. You will receive an email confirmation with tracking details once your order is dispatched.",
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

function fmtRs(n: number): string {
  return `PKR ${Math.round(n).toLocaleString("en-PK")}`;
}

export default async function ShippingPage() {
  const info = await getSiteInfo();

  const [freeDeliveryAll, baseCost, threshold] = await Promise.all([
    getBoolSetting("free_delivery_all",         false),
    getNumberSetting("shipping_base_cost",      250),
    getNumberSetting("free_shipping_threshold", 5000),
  ]);

  const shippingCostLabel = freeDeliveryAll
    ? "FREE"
    : (threshold > 0
        ? `${fmtRs(baseCost)}`
        : fmtRs(baseCost));

  const shippingSubline = freeDeliveryAll
    ? "Enjoy free delivery on every order across Pakistan."
    : (threshold > 0
        ? `Standard delivery within 3-5 business days across Pakistan. Free on orders above ${fmtRs(threshold)}.`
        : "Standard delivery within 3-5 business days across Pakistan.");

  return (
    <>
      <div className="pt-28 pb-10 sm:pt-32 sm:pb-14 bg-brand-surface border-b border-[#e5e7eb]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Shipping Policy" }]}
              className="mb-4 justify-center"
            />
          </FadeIn>
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#E10600]">
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

        <section>
          <FadeIn>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1a1a1a] mb-6">
              Standard Delivery
            </h2>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="border border-[#e5e7eb] bg-white p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">

                <div className="w-14 h-14 rounded-full bg-[#f5f0e8] flex items-center justify-center flex-shrink-0">
                  <Truck size={22} className="text-[#E10600]" strokeWidth={1.75} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 flex-wrap mb-1">
                    <h3 className="text-base font-bold text-[#1a1a1a]">
                      Standard Delivery
                    </h3>
                    <span className="text-xs font-semibold text-[#E10600] tracking-wide">
                      3-5 Business Days
                    </span>
                  </div>
                  <p className="text-sm text-[#6b7280] leading-relaxed">
                    {shippingSubline}
                  </p>
                </div>

                <div className="sm:text-right sm:pl-4 sm:border-l sm:border-[#e5e7eb]">
                  <p className="text-[10px] uppercase tracking-wider text-[#6b7280] mb-0.5">
                    Delivery Fee
                  </p>
                  <p className={`text-2xl font-bold ${
                    shippingCostLabel === "FREE" ? "text-green-600" : "text-[#1a1a1a]"
                  }`}>
                    {shippingCostLabel}
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {!freeDeliveryAll && threshold > 0 && (
          <FadeIn>
            <div className="bg-[#1a1a1a] text-white p-6 sm:p-8 flex items-center gap-4">
              <Package size={32} className="text-[#E10600] flex-shrink-0" />
              <div>
                <p className="text-base font-bold mb-1">
                  Free Shipping on Orders Above {fmtRs(threshold)}
                </p>
                <p className="text-sm text-white/70">
                  Add more items to your cart to qualify for free standard delivery anywhere in Pakistan.
                </p>
              </div>
            </div>
          </FadeIn>
        )}

        {freeDeliveryAll && (
          <FadeIn>
            <div className="bg-[#1a1a1a] text-white p-6 sm:p-8 flex items-center gap-4">
              <Package size={32} className="text-[#E10600] flex-shrink-0" />
              <div>
                <p className="text-base font-bold mb-1">
                  Free Shipping on Every Order
                </p>
                <p className="text-sm text-white/70">
                  We currently offer complimentary standard delivery on all orders, everywhere in Pakistan.
                </p>
              </div>
            </div>
          </FadeIn>
        )}

        <section className="space-y-6">
          {SECTIONS.map((section, i) => (
            <FadeIn key={section.title} delay={i * 60}>
              <div className="border-l-2 border-[#E10600] pl-5">
                <h3 className="text-sm font-bold text-[#1a1a1a] mb-2">{section.title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{section.content}</p>
              </div>
            </FadeIn>
          ))}
        </section>

        <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-[#e5e7eb] bg-white p-5 text-center">
              <Package size={22} className="text-[#E10600] mx-auto mb-2" strokeWidth={1.75} />
              <p className="text-sm font-semibold text-[#1a1a1a]">Nationwide Delivery</p>
              <p className="text-xs text-[#6b7280] mt-1">All major cities and towns</p>
            </div>
            <div className="border border-[#e5e7eb] bg-white p-5 text-center">
              <RotateCcw size={22} className="text-[#E10600] mx-auto mb-2" strokeWidth={1.75} />
              <p className="text-sm font-semibold text-[#1a1a1a]">7-Day Returns</p>
              <p className="text-xs text-[#6b7280] mt-1">Easy returns on eligible items</p>
            </div>
            <div className="border border-[#e5e7eb] bg-white p-5 text-center">
              <Shield size={22} className="text-[#E10600] mx-auto mb-2" strokeWidth={1.75} />
              <p className="text-sm font-semibold text-[#1a1a1a]">Authentic Quality</p>
              <p className="text-xs text-[#6b7280] mt-1">100% guaranteed on every piece</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="bg-[#f5f0e8] border border-[#E10600]/30 p-6 flex items-start gap-4">
            <Phone size={18} className="text-[#E10600] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a] mb-1">
                Questions about your shipment?
              </p>
              <p className="text-sm text-[#6b7280] mb-1">
                Our support team is available Monday-Saturday, 10 AM - 8 PM.
              </p>
              <p className="text-xs text-[#6b7280] mb-3">
                Reach us at{" "}
                <a href={`mailto:${info.email}`} className="text-[#E10600] hover:underline">
                  {info.email}
                </a>{" "}
                or{" "}
                <a href={`tel:${info.phone}`} className="text-[#E10600] hover:underline">
                  {info.phone}
                </a>
                .
              </p>
              <Link
                href="/contact"
                className="text-xs font-semibold text-[#E10600] hover:text-[#B80000] underline"
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