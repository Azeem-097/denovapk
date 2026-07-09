"use client";
import Image from "next/image";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { cn } from "@/lib/utils";

const galleryImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
    alt: "Fashion lifestyle",
    span: "col-span-1 row-span-1",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80",
    alt: "Street style",
    span: "col-span-1 row-span-2 hidden sm:block",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    alt: "Summer outfit",
    span: "col-span-1 row-span-1",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80",
    alt: "Fashion forward",
    span: "col-span-1 row-span-1",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80",
    alt: "Casual wear",
    span: "col-span-1 row-span-1 hidden sm:block",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
    alt: "Elegant style",
    span: "col-span-1 row-span-1 hidden lg:block",
  },
];

export function GallerySection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-10 lg:mb-14">
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">
              @denovapk
            </span>
          </FadeIn>

          <TextReveal as="h2" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-3 block">
              Style in Action
            </span>
          </TextReveal>

          <FadeIn delay={200}>
            <p className="text-[#6b7280] text-sm sm:text-base max-w-lg mx-auto mt-4 leading-relaxed">
              Follow us for daily style inspiration and behind-the-scenes moments
            </p>
          </FadeIn>
        </div>

        {/* Gallery grid */}
        <FadeIn delay={300}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] sm:auto-rows-[220px] lg:auto-rows-[240px] gap-2 sm:gap-3">
            {galleryImages.map((img) => (
              <a
                key={img.id}
                href="https://instagram.com/denovapk"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group relative overflow-hidden bg-[#fafaf9]",
                  img.span
                )}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  loading="lazy"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#1a1a1a]/0 group-hover:bg-[#1a1a1a]/40 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <circle cx="12" cy="12" r="4"/>
                      <circle cx="17.5" cy="6.5" r="0.5" fill="white" stroke="none"/>
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </FadeIn>

        {/* Follow CTA */}
        <FadeIn delay={500}>
          <div className="text-center mt-8">
            <a
              href="https://instagram.com/denovapk"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 text-sm font-semibold tracking-wide text-[#1a1a1a] hover:text-[#c9a96e] transition-colors duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
              </svg>
              Follow @denovapk on Instagram
            </a>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}