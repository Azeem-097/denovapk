"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useDevicePerformance } from "@/components/animations/useDevicePerformance";
import { cn } from "@/lib/utils";

const heroSlides = [
  {
    id: 1,
    subtitle: "Summer 2025 Collection",
    title: "Crafted for\nthe Modern You",
    description: "Discover our latest collection of premium clothing. Every piece designed with intention, made with quality.",
    cta: { label: "Shop Collection", href: "/collections/summer-essentials" },
    ctaSecondary: { label: "View Lookbook", href: "/collections" },
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80",
    imageMobile: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
  },
  {
    id: 2,
    subtitle: "The Formal Edit",
    title: "Elegance\nRedefined",
    description: "Step into sophistication with our curated formal collection. Tailored to perfection for every occasion.",
    cta: { label: "Explore Formal", href: "/collections/formal-edit" },
    ctaSecondary: { label: "New Arrivals", href: "/shop?filter=new" },
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1920&q=80",
    imageMobile: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
  },
  {
    id: 3,
    subtitle: "Exclusive Online",
    title: "Premium\nCasual Wear",
    description: "Where comfort meets style. Everyday pieces that elevate your wardrobe without compromise.",
    cta: { label: "Shop Now", href: "/shop" },
    ctaSecondary: { label: "Best Sellers", href: "/shop?filter=bestsellers" },
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&q=80",
    imageMobile: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80",
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  const { shouldAnimate, tier } = useDevicePerformance();

  const slide = heroSlides[current];

  // Auto-advance slides
  useEffect(() => {
    if (!shouldAnimate) return;
    const interval = setInterval(() => {
      goToSlide((current + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [current, shouldAnimate]);

  const goToSlide = (index: number) => {
    if (index === current) return;
    setTextVisible(false);
    setTimeout(() => {
      setCurrent(index);
      setTextVisible(true);
    }, 300);
  };

  return (
    <section className="relative w-full h-screen min-h-[600px] max-h-[900px] overflow-hidden">

      {/* ── Background Images ── */}
      {heroSlides.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            "absolute inset-0 transition-opacity",
            shouldAnimate ? "duration-1000" : "duration-0",
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          {/* Desktop image */}
          <Image
            src={s.image}
            alt={`${s.subtitle} - ${s.title.replace("\n", " ")}`}
            fill
            className="object-cover object-center hidden md:block"
            priority={i === 0}
            sizes="100vw"
            quality={85}
          />
          {/* Mobile image */}
          <Image
            src={s.imageMobile}
            alt={`${s.subtitle} - ${s.title.replace("\n", " ")}`}
            fill
            className="object-cover object-center md:hidden"
            priority={i === 0}
            sizes="100vw"
            quality={75}
          />
        </div>
      ))}

      {/* ── Dark overlay ── */}
      <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/70 via-black/40 to-black/20 md:from-black/60 md:via-black/30 md:to-transparent" />

      {/* ── Content ── */}
      <div className="relative z-30 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="w-full max-w-xl lg:max-w-2xl pt-16">

          {/* Subtitle */}
          <div
            className={cn(
              "transition-all",
              shouldAnimate ? "duration-600" : "duration-0",
              textVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: shouldAnimate ? "100ms" : "0ms" }}
          >
            <span className="inline-block text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e] border border-[#c9a96e]/40 px-3 py-1.5 mb-5 sm:mb-6">
              {slide.subtitle}
            </span>
          </div>

          {/* Title */}
          <div
            className={cn(
              "transition-all",
              shouldAnimate ? "duration-700" : "duration-0",
              textVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            )}
            style={{ transitionDelay: shouldAnimate ? "200ms" : "0ms" }}
          >
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] whitespace-pre-line mb-4 sm:mb-6">
              {slide.title}
            </h1>
          </div>

          {/* Description */}
          <div
            className={cn(
              "transition-all",
              shouldAnimate ? "duration-700" : "duration-0",
              textVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            )}
            style={{ transitionDelay: shouldAnimate ? "350ms" : "0ms" }}
          >
            <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-md mb-8 sm:mb-10">
              {slide.description}
            </p>
          </div>

          {/* CTAs */}
          <div
            className={cn(
              "flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 transition-all",
              shouldAnimate ? "duration-700" : "duration-0",
              textVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            )}
            style={{ transitionDelay: shouldAnimate ? "500ms" : "0ms" }}
          >
            <Link
              href={slide.cta.href}
              className="group inline-flex items-center gap-2 bg-white text-[#1a1a1a] px-7 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#c9a96e] hover:text-white transition-all duration-300"
            >
              {slide.cta.label}
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href={slide.ctaSecondary.href}
              className="inline-flex items-center gap-2 text-white border border-white/40 px-7 py-3.5 text-sm font-medium tracking-wide hover:bg-white/10 hover:border-white/60 transition-all duration-300"
            >
              {slide.ctaSecondary.label}
            </Link>
          </div>

        </div>
      </div>

      {/* ── Slide indicators ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className="group relative py-2"
            aria-label={`Go to slide ${i + 1}`}
          >
            <div
              className={cn(
                "h-0.5 rounded-full transition-all duration-500",
                i === current
                  ? "w-10 bg-[#c9a96e]"
                  : "w-5 bg-white/40 group-hover:bg-white/70"
              )}
            />
          </button>
        ))}
      </div>

      {/* ── Scroll hint ── */}
      <div className="absolute bottom-8 right-8 z-30 hidden lg:flex flex-col items-center gap-2">
        <span className="text-[10px] tracking-[0.2em] text-white/50 uppercase rotate-90 origin-center translate-y-5">
          Scroll
        </span>
        <div className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent mt-8" />
      </div>

    </section>
  );
}