"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useDevicePerformance } from "@/components/animations/useDevicePerformance";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────
interface HeroBanner {
  id:                   string;
  image:                string;
  title:                string;
  subtitle:             string;
  description:          string;
  buttonLabel:          string;
  buttonHref:           string;
  buttonSecondaryLabel: string;
  buttonSecondaryHref:  string;
  isActive:             boolean;
  sortOrder:            number;
}

const FALLBACK_SLIDES: HeroBanner[] = [
  {
    id:                   "fallback-1",
    image:                "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80",
    title:                "Denova PK",
    subtitle:             "",
    description:          "",
    buttonLabel:          "",
    buttonHref:           "/shop",
    buttonSecondaryLabel: "",
    buttonSecondaryHref:  "",
    isActive:             true,
    sortOrder:            0,
  },
];

interface HeroSectionProps {
  banners?: HeroBanner[];
}

export function HeroSection({ banners: initialBanners }: HeroSectionProps) {
  const [slides, setSlides] = useState<HeroBanner[]>(
    initialBanners && initialBanners.length > 0 ? initialBanners : FALLBACK_SLIDES
  );
  const [current, setCurrent] = useState(0);
  const { shouldAnimate }     = useDevicePerformance();

  useEffect(() => {
    if (initialBanners && initialBanners.length > 0) return;
    fetch("/api/hero-banners")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.banners?.length > 0) setSlides(data.banners);
      })
      .catch(() => {});
  }, [initialBanners]);

  useEffect(() => { setCurrent(0); }, [slides.length]);

  useEffect(() => {
    if (!shouldAnimate || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [shouldAnimate, slides.length]);

  if (slides.length === 0) return null;

  const goToSlide = (index: number) => {
    if (index === current) return;
    setCurrent(index);
  };

  return (
    <section className="relative w-full bg-white overflow-hidden">

      {/*
        Each slide has its OWN sizer to determine its OWN aspect ratio.
        The ACTIVE slide is in normal flow (its sizer sets container height).
        Inactive slides are absolutely positioned & invisible (no layout impact).

        This means:
        - Each banner shows at its natural aspect ratio
        - Full image visible, no cropping
        - Container height smoothly animates between slides
      */}
      {slides.map((s, i) => {
        const isActive = i === current;
        const hasLink  = !!s.buttonHref;

        /* eslint-disable-next-line @next/next/no-img-element */
        const sizerImg = (
          <img
            src={s.image}
            alt=""
            aria-hidden="true"
            className="block w-full h-auto"
            draggable={false}
          />
        );

        const baseClass = cn(
          "top-0 left-0 w-full transition-opacity",
          shouldAnimate ? "duration-700" : "duration-0",
          isActive
            ? "relative opacity-100 z-10"
            : "absolute opacity-0 z-0 pointer-events-none"
        );

        if (hasLink) {
          return (
            <Link
              key={s.id}
              href={s.buttonHref}
              aria-label={s.title || `Banner ${i + 1}`}
              className={cn(baseClass, "block cursor-pointer")}
            >
              {sizerImg}
            </Link>
          );
        }

        return (
          <div key={s.id} className={baseClass}>
            {sizerImg}
          </div>
        );
      })}

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className="group py-1.5 px-0.5"
              aria-label={`Go to slide ${i + 1}`}
            >
              <div
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  i === current
                    ? "w-6 sm:w-8 bg-white"
                    : "w-1.5 sm:w-2 bg-white/60 group-hover:bg-white/90"
                )}
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}