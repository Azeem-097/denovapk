import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Award, Leaf, Users, Heart } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { SlideUp } from "@/components/animations/SlideUp";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Denova PK — a premium Pakistani clothing brand crafted with tradition, elegance, and modern design.",
};

const STATS = [
  { number: "10+",   label: "Years of Excellence" },
  { number: "50K+",  label: "Happy Customers" },
  { number: "500+",  label: "Curated Pieces" },
  { number: "100%",  label: "Quality Guaranteed" },
];

const VALUES = [
  {
    icon: Award,
    title: "Uncompromising Quality",
    desc:  "Every piece is crafted with the finest fabrics and undergoes rigorous quality control before it reaches you.",
  },
  {
    icon: Leaf,
    title: "Sustainable Practices",
    desc:  "We are committed to ethical sourcing and sustainable production, honoring our craftsmen and our planet.",
  },
  {
    icon: Users,
    title: "Community First",
    desc:  "Our brand stands with local artisans, weavers, and tailors who bring every design to life.",
  },
  {
    icon: Heart,
    title: "Timeless Design",
    desc:  "We create pieces that transcend seasonal trends — clothing you will love for years to come.",
  },
];

const TEAM = [
  {
    name:  "Ayesha Malik",
    role:  "Founder & Creative Director",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  },
  {
    name:  "Hassan Sheikh",
    role:  "Head of Design",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
  },
  {
    name:  "Zainab Ahmed",
    role:  "Master Craftsperson",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
  },
  {
    name:  "Ali Raza",
    role:  "Head of Operations",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[400px] max-h-[600px] mt-16 lg:mt-[72px]">
        <Image
          src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&q=85"
          alt="Denova PK atelier"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

        <div className="absolute inset-0 flex items-end pb-12 sm:pb-16">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <Breadcrumb
                items={[{ label: "Home", href: "/" }, { label: "About" }]}
                className="mb-4 [&_span]:text-white/70 [&_a]:text-white/70 [&_a:hover]:text-[#3b5f8f] [&_svg]:text-white/50"
              />
            </FadeIn>
            <FadeIn delay={100}>
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#3b5f8f]">
                Our Story
              </span>
            </FadeIn>
            <TextReveal as="h1" delay={200}>
              <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-5xl lg:text-6xl font-bold text-white mt-2 block leading-tight max-w-3xl">
                Crafted with Purpose,
                <br />
                Worn with Pride
              </span>
            </TextReveal>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#3b5f8f]">
              Est. 2014
            </span>
          </FadeIn>
          <TextReveal as="h2" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-3 block leading-tight">
              Where Heritage Meets Modernity
            </span>
          </TextReveal>
          <FadeIn delay={200}>
            <p className="text-[#6b7280] text-base sm:text-lg leading-relaxed mt-6">
              Denova PK was born from a deep love for Pakistani craftsmanship and a vision to bring it to the modern world. What started as a small atelier in Lahore has grown into a beloved brand, but our mission remains the same — to create clothing that celebrates tradition while embracing the elegance of contemporary design.
            </p>
          </FadeIn>
          <FadeIn delay={300}>
            <p className="text-[#6b7280] text-base sm:text-lg leading-relaxed mt-4">
              Every piece we create tells a story. From the master weavers of Multan to the skilled tailors of our Lahore studio, our garments are the result of countless hours of dedication, passion, and unmatched craftsmanship.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 sm:py-16 bg-[#1a1a1a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {STATS.map((stat, i) => (
              <SlideUp key={stat.label} stagger={100} index={i}>
                <div className="text-center">
                  <p className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3b5f8f] leading-none">
                    {stat.number}
                  </p>
                  <p className="text-xs sm:text-sm tracking-wide text-white/60 mt-3 uppercase">
                    {stat.label}
                  </p>
                </div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <FadeIn>
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#3b5f8f]">
                What Drives Us
              </span>
            </FadeIn>
            <TextReveal as="h2" delay={100}>
              <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-3 block">
                Our Values
              </span>
            </TextReveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {VALUES.map((val, i) => (
              <SlideUp key={val.title} stagger={100} index={i}>
                <div className="group border border-[#e5e7eb] p-6 lg:p-8 hover:border-[#3b5f8f] transition-colors bg-white">
                  <div className="w-11 h-11 rounded-full bg-[#f5f0e8] flex items-center justify-center mb-4 group-hover:bg-[#3b5f8f] transition-colors">
                    <val.icon size={20} className="text-[#3b5f8f] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#1a1a1a] mb-2">
                    {val.title}
                  </h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#fafaf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <FadeIn>
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#3b5f8f]">
                The People
              </span>
            </FadeIn>
            <TextReveal as="h2" delay={100}>
              <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-3 block">
                Meet the Team
              </span>
            </TextReveal>
            <FadeIn delay={200}>
              <p className="text-[#6b7280] text-sm sm:text-base max-w-lg mx-auto mt-4">
                The passionate individuals who bring Denova PK to life every single day.
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {TEAM.map((member, i) => (
              <SlideUp key={member.name} stagger={80} index={i}>
                <div className="group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-white mb-4">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 25vw"
                      loading="lazy"
                    />
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-[#1a1a1a]">
                    {member.name}
                  </h4>
                  <p className="text-xs text-[#3b5f8f] tracking-wide mt-0.5">
                    {member.role}
                  </p>
                </div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <TextReveal as="h2">
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] leading-tight">
              Ready to Discover
              <br />
              <span className="text-[#3b5f8f]">Your Style?</span>
            </span>
          </TextReveal>
          <FadeIn delay={200}>
            <p className="text-[#6b7280] text-sm sm:text-base mt-4 max-w-md mx-auto leading-relaxed">
              Explore our latest collections and find pieces that speak to you.
            </p>
          </FadeIn>
          <FadeIn delay={300}>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/shop"
                className="group inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white px-8 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#3b5f8f] transition-colors"
              >
                Shop Collections
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center border border-[#1a1a1a] text-[#1a1a1a] px-8 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#1a1a1a] hover:text-white transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}