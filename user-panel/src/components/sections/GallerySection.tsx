"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { Marquee } from "@/components/animations/Marquee";
import { useDevicePerformance } from "@/components/animations/useDevicePerformance";
import { cn } from "@/lib/utils";

type GalleryLayout = "square" | "portrait" | "landscape" | "wide";

interface GalleryItem {
  id:        string;
  image:     string;
  name:      string;
  link:      string;
  layout:    GalleryLayout;
  isActive:  boolean;
  sortOrder: number;
}

interface GalleryConfig {
  enabled:            boolean;
  sectionLabel:       string;
  sectionTitle:       string;
  sectionDescription: string;
  items:              GalleryItem[];
}

const FALLBACK: GalleryConfig = {
  enabled:            true,
  sectionLabel:       "@denovapk",
  sectionTitle:       "Style in Action",
  sectionDescription: "Follow us for daily style inspiration and behind-the-scenes moments",
  items:              [],
};

const QUALITY_MARQUEE_ITEMS = Array.from(
  { length: 6 },
  () => "Premium Quality - Without Premium Prices"
);

function layoutClasses(layout: GalleryLayout): string {
  switch (layout) {
    case "portrait":
      return "col-span-1 row-span-2";
    case "landscape":
      return "col-span-2 row-span-1";
    case "wide":
      return "col-span-2 sm:col-span-4 row-span-1";
    case "square":
    default:
      return "col-span-1 row-span-1";
  }
}

export function GallerySection() {
  const [config, setConfig] = useState<GalleryConfig | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setConfig(data?.config ?? FALLBACK))
      .catch(() => setConfig(FALLBACK));
  }, []);

  if (!config || !config.enabled) return null;
  if (config.items.length === 0) return null;

  const marqueeIndex = Math.min(5, config.items.length);
  const topItems = config.items.slice(0, marqueeIndex);
  const bottomItems = config.items.slice(marqueeIndex);

  return (
    <section className="pt-8 pb-0 sm:pt-12 sm:pb-0 lg:pt-14 lg:pb-0 bg-white">

      {/* Header */}
      <div className="site-container">
        <div className="text-center mb-10 lg:mb-14">
          {config.sectionLabel && (
            <FadeIn>
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#F97316]">
                {config.sectionLabel}
              </span>
            </FadeIn>
          )}

          <TextReveal as="h2" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-3 block">
              {config.sectionTitle}
            </span>
          </TextReveal>

          {config.sectionDescription && (
            <FadeIn delay={200}>
              <p className="text-[#6b7280] text-sm sm:text-base max-w-lg mx-auto mt-4 leading-relaxed">
                {config.sectionDescription}
              </p>
            </FadeIn>
          )}
        </div>
      </div>

      {/*
        Dynamic CSS grid — full bleed.
        grid-auto-rows uses vw so a portrait cell (row-span-2) is TWICE as tall
        as a square, matching what "portrait" should look like.
      */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-0 w-full gallery-grid"
        style={{ gridAutoFlow: "dense" }}
      >
        {topItems.map((item, i) => (
          <GalleryCell key={item.id} item={item} delay={i * 80} />
        ))}
      </div>

      <div className="gallery-quality-marquee border-y border-[#e5e7eb] bg-[#fafaf9] py-3 sm:py-3.5 -mb-px">
        <Marquee
          items={QUALITY_MARQUEE_ITEMS}
          duration={40}
          itemColor="#1a1a1a"
        />
      </div>

      {bottomItems.length > 0 && (
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-0 w-full gallery-grid"
          style={{ gridAutoFlow: "dense" }}
        >
          {bottomItems.map((item, i) => (
            <GalleryCell key={item.id} item={item} delay={(marqueeIndex + i) * 80} />
          ))}
        </div>
      )}

      <style jsx>{`
        .gallery-grid {
          grid-auto-rows: 50vw;
        }
        @media (min-width: 640px) {
          .gallery-grid {
            grid-auto-rows: 25vw;
          }
        }
        .gallery-quality-marquee :global(.w-1.h-1) {
          width: 3px;
          height: 3px;
          transform: translateY(-1px);
        }
      `}</style>
    </section>
  );
}

interface GalleryCellProps {
  item:   GalleryItem;
  delay?: number;
}

/**
 * Uses a single generic HTMLElement ref that works for div, a, and Link.
 * IntersectionObserver only reads .isIntersecting, doesn't care about element type.
 */
function GalleryCell({ item, delay = 0 }: GalleryCellProps) {
  const ref = useRef<HTMLElement | null>(null);
  const { shouldAnimate } = useDevicePerformance();
  const [isVisible, setIsVisible] = useState(!shouldAnimate);

  useEffect(() => {
    if (!shouldAnimate) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [shouldAnimate]);

  const cellClass = cn(
    "group relative overflow-hidden bg-[#fafaf9] w-full h-full block",
    layoutClasses(item.layout)
  );

  const content = (
    <>
      <Image
        src={item.image}
        alt={item.name || ""}
        fill
        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        loading="lazy"
        unoptimized={item.image.startsWith("/uploads")}
      />
      <div className="absolute inset-0 bg-[#1a1a1a]/0 group-hover:bg-[#1a1a1a]/20 transition-colors duration-500" />
      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#F97316] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#F97316] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
    </>
  );

  const revealStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "scale(1) rotate(0)" : "scale(0.94) rotate(-1deg)",
    transition: shouldAnimate
      ? `opacity 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
      : "none",
    transitionDelay: `${delay}ms`,
  };

  if (item.link) {
    const isExternal = item.link.startsWith("http");

    if (isExternal) {
      return (
        <a
          ref={(el) => { ref.current = el; }}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className={cellClass}
          style={revealStyle}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        ref={(el) => { ref.current = el; }}
        href={item.link}
        className={cellClass}
        style={revealStyle}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      ref={(el) => { ref.current = el; }}
      className={cellClass}
      style={revealStyle}
    >
      {content}
    </div>
  );
}
