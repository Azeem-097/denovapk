"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";

const brandValues = [
  {
    number: "01",
    title: "Premium Fabrics",
    description: "Sourced from the finest mills across Pakistan and beyond",
  },
  {
    number: "02",
    title: "Expert Craftsmanship",
    description: "Every stitch reflects decades of tailoring tradition",
  },
  {
    number: "03",
    title: "Timeless Design",
    description: "Pieces that transcend seasonal trends and last for years",
  },
];

export function BrandStory() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: Image */}
          <FadeIn className="relative">
            <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5]">
              <Image
                src="https://res.cloudinary.com/djy5qqco7/image/upload/v1784232629/denovapk/general/txvavizawdhvvo7y2oln.jpg"
                alt="Denova PK craftsmanship"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
                unoptimized
              />
            </div>

            {/* Floating accent box */}
            <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-32 sm:w-40 bg-[#c9a96e] p-4 sm:p-5 hidden sm:block">
              <p className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-white leading-none">
                10+
              </p>
              <p className="text-[10px] tracking-[0.15em] uppercase text-white/80 mt-1">
                Years of
                <br />
                Excellence
              </p>
            </div>
          </FadeIn>

          {/* Right: Content */}
          <div className="lg:pl-4">
            <FadeIn>
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">
                Our Story
              </span>
            </FadeIn>

            <TextReveal as="h2" delay={100}>
              <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-3 block leading-tight">
                Where Tradition
                <br />
                <span className="text-[#c9a96e]">Meets Modern</span>
              </span>
            </TextReveal>

            <FadeIn delay={200}>
              <p className="text-[#6b7280] text-sm sm:text-base leading-relaxed mt-5 max-w-md">
                Denova PK was born from a simple belief — that Pakistani fashion deserves
                a brand that honors its rich textile heritage while embracing contemporary
                design. Every piece in our collection is a bridge between the timeless
                artistry of our craftsmen and the refined tastes of today.
              </p>
            </FadeIn>

            {/* Brand values */}
            <div className="mt-8 sm:mt-10 flex flex-col gap-5">
              {brandValues.map((value, i) => (
                <FadeIn key={value.number} delay={300 + i * 100}>
                  <div className="flex items-start gap-4 group">
                    <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[#c9a96e] leading-none mt-0.5 flex-shrink-0">
                      {value.number}
                    </span>
                    <div className="border-l border-[#e5e7eb] pl-4 group-hover:border-[#c9a96e] transition-colors duration-300">
                      <h4 className="text-sm font-semibold text-[#1a1a1a] tracking-wide mb-0.5">
                        {value.title}
                      </h4>
                      <p className="text-xs text-[#6b7280] leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={600}>
              <div className="mt-8 sm:mt-10">
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-[#1a1a1a] border-b border-[#1a1a1a] pb-0.5 hover:text-[#c9a96e] hover:border-[#c9a96e] transition-colors duration-200"
                >
                  Read Our Full Story
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </section>
  );
}