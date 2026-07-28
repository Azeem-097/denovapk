"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { cn } from "@/lib/utils";
import Link from "next/link";

const FAQ_CATEGORIES = [
  {
    category: "Orders & Shipping",
    items: [
      {
        question: "How long does delivery take?",
        answer: "Standard delivery takes 3-5 business days across Pakistan. Express delivery arrives within 1-2 business days. Same-day delivery is available in Lahore only, within 24 hours of order placement.",
      },
      {
        question: "Do you offer free shipping?",
        answer: "Yes! We offer free standard shipping on all orders above PKR 5,000. Orders below PKR 5,000 incur a flat shipping fee of PKR 250.",
      },
      {
        question: "Can I track my order?",
        answer: "Absolutely. Once your order is dispatched, you will receive a tracking number via SMS and email. You can also track your order from your Account Dashboard or our Track Order page.",
      },
      {
        question: "Do you ship internationally?",
        answer: "Currently, we ship within Pakistan only. International shipping is planned for the near future. Sign up for our newsletter to be notified when it launches.",
      },
      {
        question: "Can I change my delivery address after placing an order?",
        answer: "Address changes can be made within 1 hour of placing the order. Please contact our support team immediately via WhatsApp or phone.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    items: [
      {
        question: "What is your return policy?",
        answer: "We accept returns within 7 days of delivery. Items must be unworn, unwashed, and in their original packaging with all tags intact. Sale items are not eligible for returns.",
      },
      {
        question: "How do I initiate a return?",
        answer: "Contact our support team via WhatsApp (+92 300 123 4567) or email (hello@denovapk.com) with your order number and reason for return. We will arrange a pickup.",
      },
      {
        question: "When will I receive my refund?",
        answer: "Refunds are processed within 5-7 business days after we receive and inspect the returned item. Bank transfers may take an additional 2-3 working days.",
      },
      {
        question: "Can I exchange an item for a different size?",
        answer: "Yes, exchanges for a different size or color are accepted within 7 days of delivery, subject to availability. Shipping for the exchange is complimentary.",
      },
    ],
  },
  {
    category: "Payments",
    items: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept Cash on Delivery (COD), Credit/Debit Cards (Visa, Mastercard), JazzCash, EasyPaisa, and Direct Bank Transfer.",
      },
      {
        question: "Is online payment secure?",
        answer: "Yes, all online transactions are encrypted and processed through secure payment gateways. We never store your card details.",
      },
      {
        question: "Can I pay in installments?",
        answer: "Installment plans via select credit cards are available. Please check with your bank for applicable offers on our products.",
      },
    ],
  },
  {
    category: "Products & Sizing",
    items: [
      {
        question: "How do I find the right size?",
        answer: "We recommend checking our detailed Size Guide before purchasing. You can find measurements for all sizes in our Size Guide page.",
      },
      {
        question: "Are your products true to size?",
        answer: "Our clothing is true to standard Pakistani sizing. However, we recommend checking individual product descriptions as some styles may vary. When in doubt, size up.",
      },
      {
        question: "How do I care for my Denova garments?",
        answer: "Care instructions vary by fabric. Each product includes a care label inside the garment. Generally, we recommend hand washing or dry cleaning for embroidered and embellished pieces.",
      },
      {
        question: "Are your products authentic?",
        answer: "100% yes. Every product sold on Denova PK is designed and quality-checked by our team. We use premium fabrics sourced directly from certified mills.",
      },
    ],
  },
  {
    category: "Account & Orders",
    items: [
      {
        question: "Do I need an account to place an order?",
        answer: "No, you can checkout as a guest. However, creating an account gives you access to order history, saved addresses, wishlist, and exclusive early access to premium products.",
      },
      {
        question: "How do I reset my password?",
        answer: "Click Forgot Password on the login page, enter your registered email, and we will send you a password reset link within a few minutes.",
      },
      {
        question: "Can I cancel my order?",
        answer: "Orders can be cancelled within 1 hour of placement. After that, the order goes into processing and cannot be cancelled. You may initiate a return once delivered.",
      },
    ],
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(FAQ_CATEGORIES[0].category);

  return (
    <>
      {/* Header */}
      <div className="pt-28 pb-10 sm:pt-32 sm:pb-14 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "FAQ" },
              ]}
              className="mb-4 justify-center"
            />
          </FadeIn>
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#E10600]">
              Help Center
            </span>
          </FadeIn>
          <TextReveal as="h1" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-2 block">
              Frequently Asked Questions
            </span>
          </TextReveal>
          <FadeIn delay={200}>
            <p className="text-[#6b7280] text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed">
              Find answers to the most common questions about shopping with Denova PK.
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 lg:gap-12">

          {/* Sidebar categories */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="space-y-1">
              {FAQ_CATEGORIES.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => setActiveCategory(cat.category)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-sm font-medium transition-all duration-200 border-l-2",
                    activeCategory === cat.category
                      ? "border-[#E10600] text-[#E10600] bg-[#f5f0e8]"
                      : "border-transparent text-[#6b7280] hover:text-[#1a1a1a] hover:bg-[#fafaf9]"
                  )}
                >
                  {cat.category}
                </button>
              ))}
            </nav>

            {/* Still have questions */}
            <div className="mt-8 bg-[#1a1a1a] text-white p-5">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#E10600] mb-2">
                Still Need Help?
              </p>
              <p className="text-xs text-white/70 leading-relaxed mb-4">
                Our team is available 7 days a week to help you.
              </p>
              <Link
                href="/contact"
                className="block text-center bg-[#E10600] text-white text-xs font-semibold tracking-wide uppercase py-2.5 hover:bg-[#B80000] transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </aside>

          {/* FAQ items */}
          <div>
            {FAQ_CATEGORIES.filter((cat) => cat.category === activeCategory).map((cat) => (
              <div key={cat.category}>
                <FadeIn>
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1a1a1a] mb-6">
                    {cat.category}
                  </h2>
                </FadeIn>
                <div className="space-y-3">
                  {cat.items.map((item, i) => (
                    <FadeIn key={i} delay={i * 50}>
                      <FAQItem question={item.question} answer={item.answer} />
                    </FadeIn>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "border bg-white transition-colors duration-200",
        open ? "border-[#E10600]" : "border-[#e5e7eb]"
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-3"
      >
        <span className="text-sm font-semibold text-[#1a1a1a] leading-snug">
          {question}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "transition-transform duration-300 text-[#6b7280] flex-shrink-0",
            open && "rotate-180 text-[#E10600]"
          )}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-[#6b7280] leading-relaxed border-t border-[#f5f0e8] pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}
