"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { SlideIn } from "@/components/animations/SlideIn";
import { ScaleIn } from "@/components/animations/ScaleIn";
import { CountUp } from "@/components/animations/CountUp";

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
      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-[1400px] mx-auto">

          {/* Image + badge — slide in from LEFT */}
          <SlideIn from="left" distance={60} duration={900}>
            <div className="relative">
              <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] overflow-hidden group">
                <Image
                  src="https://res.cloudinary.com/djy5qqco7/image/upload/v1784232629/denovapk/general/txvavizawdhvvo7y2oln.jpg"
                  alt="Denova PK craftsmanship"
                  fill
                  className="object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                  unoptimized
                />
                {/* Subtle overlay warm tint on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#E10600]/0 to-transparent group-hover:from-[#E10600]/10 transition-all duration-700" />
              </div>

              {/* Badge — scales in + soft float loop + CountUp */}
              <ScaleIn from={0.6} delay={400} duration={800}>
                <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-32 sm:w-40 bg-[#E10600] p-4 sm:p-5 hidden sm:block animate-float-soft shadow-2xl">
                  <p className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-white leading-none">
                    <CountUp end={10} duration={1600} />
                    <span>+</span>
                  </p>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-white/80 mt-1">
                    Years of<br />Excellence
                  </p>
                </div>
              </ScaleIn>
            </div>
          </SlideIn>

          {/* Text column — slide in from RIGHT */}
          <SlideIn from="right" distance={60} duration={900} delay={150}>
            <div className="lg:pl-4 max-w-2xl">
              <FadeIn>
                <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#E10600]">
                  Our Story
                </span>
              </FadeIn>

              <TextReveal as="h2" delay={100}>
                <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-3 block leading-tight">
                  Where Tradition
                  <br />
                  <span className="text-[#E10600]">Meets Modern</span>
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

              <div className="mt-8 sm:mt-10 flex flex-col gap-5">
                {brandValues.map((value, i) => (
                  <SlideIn key={value.number} from="right" distance={30} delay={300 + i * 120} duration={600}>
                    <div className="flex items-start gap-4 group cursor-default">
                      <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[#E10600] leading-none mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        {value.number}
                      </span>
                      <div className="border-l border-[#e5e7eb] pl-4 group-hover:border-[#E10600] group-hover:pl-5 transition-all duration-300">
                        <h4 className="text-sm font-semibold text-[#1a1a1a] tracking-wide mb-0.5 group-hover:text-[#E10600] transition-colors duration-300">
                          {value.title}
                        </h4>
                        <p className="text-xs text-[#6b7280] leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </SlideIn>
                ))}
              </div>

              <FadeIn delay={800}>
                <div className="mt-8 sm:mt-10">
                  <Link
                    href="/about"
                    className="group inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-[#1a1a1a] border-b border-[#1a1a1a] pb-0.5 hover:text-[#E10600] hover:border-[#E10600] transition-all duration-300"
                  >
                    Read Our Full Story
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                  </Link>
                </div>
              </FadeIn>
            </div>
          </SlideIn>

        </div>
      </div>
    </section>
  );
}