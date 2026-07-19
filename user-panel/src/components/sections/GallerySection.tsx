"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
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

/**
 * Convert layout type -> CSS grid classes.
 *
 * Grid base rows are FIXED via grid-auto-rows on the parent so that
 * row-span-2 actually results in a visually taller cell (twice the row height).
 *
 * We DO NOT set aspect ratio on individual cells — they get their size
 * from the grid cell dimensions instead. This is what makes portrait
 * actually look tall vs. two squares stacked.
 */
function layoutClasses(layout: GalleryLayout): string {
  switch (layout) {
    case "portrait":
      // 1 col wide, 2 rows tall
      return "col-span-1 row-span-2";
    case "landscape":
      // 2 cols wide, 1 row tall
      return "col-span-2 row-span-1";
    case "wide":
      // Full-width banner: all columns, 1 row
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

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">

      {/* Header */}
      <div className="site-container">
        <div className="text-center mb-10 lg:mb-14">
          {config.sectionLabel && (
            <FadeIn>
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#3b5f8f]">
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

        Key trick: grid-auto-rows uses a fraction of viewport WIDTH so rows are
        SQUARE-shaped (matching col width). A portrait cell (row-span-2) then
        naturally becomes TWICE as tall as a square, which is exactly what
        "portrait" should look like.

        Mobile: 2 cols -> row height = 50vw    (each cell is 50vw x 50vw square base)
        Desktop: 4 cols -> row height = 25vw   (each cell is 25vw x 25vw square base)

        grid-auto-flow: dense fills gaps left by tall items.
      */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-0 w-full gallery-grid"
        style={{ gridAutoFlow: "dense" }}
      >
        {config.items.map((item, i) => (
          <GalleryCell key={item.id} item={item} delay={i * 80} />
        ))}
      </div>

      <style jsx>{`
        .gallery-grid {
          /* Mobile: 2 columns  ->  row = 50vw (square base) */
          grid-auto-rows: 50vw;
        }
        @media (min-width: 640px) {
          .gallery-grid {
            /* Desktop: 4 columns -> row = 25vw (square base) */
            grid-auto-rows: 25vw;
          }
        }
      `}</style>
    </section>
  );
}

interface GalleryCellProps {
  item:   GalleryItem;
  delay?: number;
}

function GalleryCell({ item, delay = 0 }: GalleryCellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { shouldAnimate } = useDevicePerformance();

  useEffect(() => {
    if (!shouldAnimate) { setIsVisible(true); return; }

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

  // NO aspect ratio here — cell gets size from grid row/col span.
  // overflow-hidden + relative + h-full/w-full so the Image fill works.
  const cellClass = cn(
    "group relative overflow-hidden bg-[#fafaf9] w-full h-full",
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
      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#3b5f8f] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#3b5f8f] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
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
          ref={ref as React.RefObject<HTMLAnchorElement>}
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
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={item.link}
        className={cellClass}
        style={revealStyle}
      >
        {content}
      </Link>
    );
  }

  return (
    <div ref={ref} className={cellClass} style={revealStyle}>
      {content}
    </div>
  );
}