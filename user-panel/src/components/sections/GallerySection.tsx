"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { useDevicePerformance } from "@/components/animations/useDevicePerformance";
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

      <div className="site-container">
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
      </div>

      {/* Image grid — full bleed */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 w-full">
        <GalleryCell slot={s1} className="aspect-square" delay={0} />
        <GalleryCell
          slot={s3}
          className="col-span-2 sm:col-span-2 sm:row-span-2 aspect-square"
          delay={100}
        />
        <GalleryCell slot={s4} className="aspect-square" delay={200} />
        <GalleryCell slot={s2} className="aspect-square" delay={300} />
        <GalleryCell slot={s5} className="aspect-square" delay={400} />
      </div>
    </section>
  );
}

interface GalleryCellProps {
  slot:      GallerySlot | undefined;
  className?: string;
  delay?:    number;
}

function GalleryCell({ slot, className, delay = 0 }: GalleryCellProps) {
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

  if (!slot || !slot.isActive || !slot.image) {
    return <div className={cn("bg-[#fafaf9]", className)} aria-hidden="true" />;
  }

  const content = (
    <>
      <Image
        src={slot.image}
        alt=""
        fill
        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
        loading="lazy"
        unoptimized={slot.image.startsWith("/uploads")}
      />
      <div className="absolute inset-0 bg-[#1a1a1a]/0 group-hover:bg-[#1a1a1a]/20 transition-colors duration-500" />
      {/* Corner accent that fades in */}
      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#c9a96e] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#c9a96e] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
    </>
  );

  const commonClass = cn(
    "group relative overflow-hidden bg-[#fafaf9]",
    className
  );

  const revealStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "scale(1) rotate(0)" : "scale(0.94) rotate(-1deg)",
    transition: shouldAnimate
      ? `opacity 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
      : "none",
    transitionDelay: `${delay}ms`,
  };

  if (slot.link) {
    const isExternal = slot.link.startsWith("http");
    if (isExternal) {
      return (
        <div ref={ref} style={revealStyle}>
          <a href={slot.link} target="_blank" rel="noopener noreferrer" className={commonClass}>
            {content}
          </a>
        </div>
      );
    }
    return (
      <div ref={ref} style={revealStyle}>
        <Link href={slot.link} className={commonClass}>
          {content}
        </Link>
      </div>
    );
  }

  return (
    <div ref={ref} style={revealStyle}>
      <div className={commonClass}>{content}</div>
    </div>
  );
}