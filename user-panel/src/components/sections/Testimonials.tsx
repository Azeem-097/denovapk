"use client";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { Marquee } from "@/components/animations/Marquee";

const MARQUEE_ITEMS = [
  "Premium Denim",
  "Handcrafted in Pakistan",
  "Export Quality",
  "Free Shipping all over Pakistan",
  "Selvedge Craftsmanship",
  "Cash on Delivery",
  "7-Day Returns",
  "Since 2026",
];

export function Testimonials() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#1a1a1a] text-white overflow-hidden">

      {/* Marquee ticker at top */}
      <div className="border-y border-white/10 py-4 mb-14 sm:mb-20 -mt-4">
        <Marquee items={MARQUEE_ITEMS} duration={40} itemColor="#fff" />
      </div>

      <div className="site-container">
        <div className="text-center">
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#F97316]">
              ABOUT DENOVA
            </span>
          </FadeIn>
          <TextReveal as="h2" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-2xl sm:text-4xl lg:text-5xl font-normal text-white mt-3 block leading-tight max-w-5xl mx-auto">
              &ldquo;We believe premium international fashion should be accessible in Pakistan.&rdquo;
            </span>
          </TextReveal>
        </div>
      </div>
    </section>
  );
}
