import type { Metadata } from "next";
import Link from "next/link";
import { RotateCcw, CheckCircle, XCircle, Clock } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { SlideUp } from "@/components/animations/SlideUp";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: "Denova PK returns, exchanges, and refund policy.",
};

const ELIGIBLE = [
  "Item received in wrong size or color",
  "Manufacturing defect or quality issue",
  "Item significantly different from product description",
  "Damaged packaging upon delivery",
];

const NOT_ELIGIBLE = [
  "Items worn, washed, or altered",
  "Items without original tags and packaging",
  "Sale or discounted items",
  "Customized or made-to-order pieces",
  "Returns requested after 7 days of delivery",
];

const STEPS = [
  { num: "01", title: "Initiate Return", desc: "Contact us via WhatsApp or email with your order number and reason for return within 7 days of delivery." },
  { num: "02", title: "Return Approved", desc: "Our team will review your request within 24 hours and send you a return authorization confirmation." },
  { num: "03", title: "Ship the Item", desc: "Pack the item securely in its original packaging. Our courier will schedule a pickup from your address." },
  { num: "04", title: "Inspection", desc: "We inspect the returned item within 2 business days of receipt to verify its condition." },
  { num: "05", title: "Refund Processed", desc: "Approved refunds are processed within 5-7 business days via your original payment method." },
];

export default function ReturnsPage() {
  return (
    <>
      <div className="pt-28 pb-10 sm:pt-32 sm:pb-14 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Returns & Refunds" }]}
              className="mb-4 justify-center"
            />
          </FadeIn>
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#3b5f8f]">
              Easy Returns
            </span>
          </FadeIn>
          <TextReveal as="h1" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-2 block">
              Returns & Refunds
            </span>
          </TextReveal>
          <FadeIn delay={200}>
            <div className="inline-flex items-center gap-2 mt-4 bg-[#f5f0e8] border border-[#3b5f8f]/30 px-4 py-2">
              <Clock size={14} className="text-[#3b5f8f]" />
              <span className="text-sm text-[#1a1a1a] font-medium">7-Day Return Window</span>
            </div>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-12">

        {/* Eligible / Not Eligible */}
        <section>
          <FadeIn>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1a1a1a] mb-6">
              What Can Be Returned?
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SlideUp stagger={0} index={0}>
              <div className="border border-green-200 bg-green-50 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={18} className="text-green-600" />
                  <h3 className="text-sm font-bold text-green-800">Eligible for Return</h3>
                </div>
                <ul className="space-y-2">
                  {ELIGIBLE.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-green-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </SlideUp>
            <SlideUp stagger={0} index={1}>
              <div className="border border-red-200 bg-red-50 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle size={18} className="text-red-500" />
                  <h3 className="text-sm font-bold text-red-800">Not Eligible for Return</h3>
                </div>
                <ul className="space-y-2">
                  {NOT_ELIGIBLE.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-red-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </SlideUp>
          </div>
        </section>

        {/* Return Process */}
        <section>
          <FadeIn>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1a1a1a] mb-6">
              Return Process
            </h2>
          </FadeIn>
          <div className="space-y-4">
            {STEPS.map((step, i) => (
              <FadeIn key={step.num} delay={i * 60}>
                <div className="flex items-start gap-4 bg-white border border-[#e5e7eb] p-5">
                  <span className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-[#3b5f8f] leading-none flex-shrink-0">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#1a1a1a] mb-1">{step.title}</h3>
                    <p className="text-sm text-[#6b7280] leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Refund methods */}
        <FadeIn>
          <div className="bg-[#1a1a1a] text-white p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <RotateCcw size={18} className="text-[#3b5f8f]" />
              <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#3b5f8f]">
                Refund Methods
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-white/80">
              <div>
                <p className="font-semibold text-white mb-1">Original Payment Method</p>
                <p>Card payments are refunded to the original card within 5–7 business days.</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Bank Transfer</p>
                <p>For COD orders, refunds are issued via bank transfer. Please provide your account details.</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">JazzCash / EasyPaisa</p>
                <p>Mobile wallet refunds are processed within 2–3 business days.</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Store Credit</p>
                <p>Opt for store credit and receive an extra 5% bonus on your refund amount.</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn>
          <div className="text-center py-6 border-t border-[#e5e7eb]">
            <p className="text-sm text-[#6b7280] mb-4">
              Ready to return an item or have a question?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 text-sm font-semibold hover:bg-[#3b5f8f] transition-colors"
              >
                WhatsApp Us
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center border border-[#1a1a1a] text-[#1a1a1a] px-6 py-3 text-sm font-semibold hover:bg-[#1a1a1a] hover:text-white transition-colors"
              >
                Email Support
              </Link>
            </div>
          </div>
        </FadeIn>

      </div>
    </>
  );
}