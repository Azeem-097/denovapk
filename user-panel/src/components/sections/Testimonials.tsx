"use client";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { Marquee } from "@/components/animations/Marquee";

interface BrandStatementProps {
  statement: string;
  tickerItems: string[];
}

export function BrandStatement({ statement, tickerItems }: BrandStatementProps) {
  return (
    <section className="pt-8 pb-12 sm:pt-10 sm:pb-14 lg:pt-12 lg:pb-16 bg-[#1a1a1a] text-white overflow-hidden">

      {/* Marquee ticker at top */}
      <div className="border-y border-white/10 bg-[#171410] py-3 sm:py-3.5 mb-8 sm:mb-10">
        <Marquee items={tickerItems} duration={40} itemColor="#fff" />
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
              &ldquo;{statement}&rdquo;
            </span>
          </TextReveal>
        </div>
      </div>
    </section>
  );
}
