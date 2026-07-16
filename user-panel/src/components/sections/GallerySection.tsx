"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { cn } from "@/lib/utils";

interface GallerySlot {
  id:       string;
  image:    string;
  link:     string;
  isActive: boolean;
}

interface GalleryConfig {
  enabled:            boolean;
  sectionLabel:       string;
  sectionTitle:       string;
  sectionDescription: string;
  slots:              GallerySlot[];
}

const FALLBACK: GalleryConfig = {
  enabled:            true,
  sectionLabel:       "@denovapk",
  sectionTitle:       "Style in Action",
  sectionDescription: "Follow us for daily style inspiration and behind-the-scenes moments",
  slots: [],
};

export function GallerySection() {
  const [config, setConfig] = useState<GalleryConfig | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setConfig(data?.config ?? FALLBACK))
      .catch(() => setConfig(FALLBACK));
  }, []);

  if (!config || !config.enabled) return null;

  const activeSlots = config.slots.filter((s) => s.isActive && s.image);
  if (activeSlots.length === 0) return null;

  const [s1, s2, s3, s4, s5] = config.slots;

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-10 lg:mb-14">
          {config.sectionLabel && (
            <FadeIn>
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">
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

        {/*
          LAYOUT — using CSS Grid with aspect-square rows via padding hack.

          Structure:
            - Desktop:  4 columns, 2 rows
            - Center slot spans 2 cols x 2 rows  ->  ends up naturally SQUARE
              because 2col-wide = 2row-tall (rows sized by the square cells)
            - Corner slots are 1 col x 1 row (auto square)

          The trick: we use `grid-cols-4` with `aspect-square` on each individual
          corner cell. The center cell being 2x2 becomes a big square that
          matches the height of two stacked corner cells.

          On mobile: 2 cols. Center spans full width but stays square.
        */}
        <FadeIn delay={300}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">

            {/* Top-left (slot 1) */}
            <GalleryCell slot={s1} className="aspect-square" />

            {/* Center (slot 3) - spans 2 cols on both mobile & desktop, 2 rows on desktop only */}
            <GalleryCell
              slot={s3}
              className="col-span-2 sm:col-span-2 sm:row-span-2 aspect-square"
            />

            {/* Top-right (slot 4) */}
            <GalleryCell slot={s4} className="aspect-square" />

            {/* Bottom-left (slot 2) */}
            <GalleryCell slot={s2} className="aspect-square" />

            {/* Bottom-right (slot 5) */}
            <GalleryCell slot={s5} className="aspect-square" />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Gallery Cell ────────────────────────────────────────
function GalleryCell({
  slot, className,
}: {
  slot: GallerySlot | undefined;
  className?: string;
}) {
  // Empty or hidden slot — render placeholder to preserve grid
  if (!slot || !slot.isActive || !slot.image) {
    return <div className={cn("bg-[#fafaf9]", className)} aria-hidden="true" />;
  }

  const content = (
    <>
      <Image
        src={slot.image}
        alt=""
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        loading="lazy"
        unoptimized={slot.image.startsWith("/uploads")}
      />
      {/* Subtle hover overlay */}
      <div className="absolute inset-0 bg-[#1a1a1a]/0 group-hover:bg-[#1a1a1a]/15 transition-colors duration-300" />
    </>
  );

  const commonClass = cn(
    "group relative overflow-hidden bg-[#fafaf9]",
    className
  );

  if (slot.link) {
    const isExternal = slot.link.startsWith("http");
    if (isExternal) {
      return (
        <a
          href={slot.link}
          target="_blank"
          rel="noopener noreferrer"
          className={commonClass}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={slot.link} className={commonClass}>
        {content}
      </Link>
    );
  }

  return <div className={commonClass}>{content}</div>;
}