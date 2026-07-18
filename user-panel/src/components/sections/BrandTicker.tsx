"use client";
import { useDevicePerformance } from "@/components/animations/useDevicePerformance";

/**
 * BrandTicker
 * ─────────────────────────────────────────────────────────────
 * Premium horizontal marquee displaying international brand
 * collaborations. Placed between Featured Collections and
 * New Arrivals — acts as a trust-building bridge before
 * users start browsing products.
 *
 * Design:
 *   • Dark background (#1a1a1a) — creates a premium divider
 *     between the white Collections and off-white NewArrivals
 *   • "DENOVA X" prefix in muted gold — brand identity
 *   • Brand name in bright white — main focus
 *   • "(COUNTRY)" in small gold — subtle context
 *   • Continuous right-to-left scroll — natural reading direction
 *   • Diamond separators between entries — luxury aesthetic
 *   • Duplicated content for seamless infinite loop
 */

interface BrandEntry {
  brand:   string;
  country: string;
}

const BRAND_COLLABORATIONS: BrandEntry[] = [
  { brand: "ZARA",           country: "SPAIN"    },
  { brand: "GUESS",          country: "USA"      },
  { brand: "JACK & JONES",   country: "DENMARK"  },
  { brand: "CROOP",          country: "POLAND"   },
  { brand: "MANGUNN",        country: "GERMANY"  },
  { brand: "EXPORT ARTICLE", country: ""         },
];

export function BrandTicker() {
  const { shouldAnimate } = useDevicePerformance();

  // Duplicate the array so the loop is seamless (no visible restart)
  const doubled = [...BRAND_COLLABORATIONS, ...BRAND_COLLABORATIONS];

  return (
    <section
      className="relative w-full bg-[#1a1a1a] overflow-hidden select-none"
      aria-label="International brand collaborations"
    >
      {/* Top gold hairline accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9a96e]/60 to-transparent" />

      {/* Marquee container — vertically padded for breathing room */}
      <div className="py-6 sm:py-7 lg:py-8 overflow-hidden">
        <div
          className={`flex w-max ${shouldAnimate ? "animate-marquee" : ""} hover:[animation-play-state:paused]`}
          style={{ animationDuration: "40s" }}
        >
          {doubled.map((entry, i) => (
            <BrandItem key={i} entry={entry} />
          ))}
        </div>
      </div>

      {/* Bottom gold hairline accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9a96e]/60 to-transparent" />

      {/* Edge fade — soft vignette on left/right so items appear/disappear elegantly */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 lg:w-32 bg-gradient-to-r from-[#1a1a1a] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 lg:w-32 bg-gradient-to-l from-[#1a1a1a] to-transparent" />
    </section>
  );
}

function BrandItem({ entry }: { entry: BrandEntry }) {
  return (
    <div className="flex items-center gap-6 sm:gap-8 lg:gap-10 px-6 sm:px-8 lg:px-10 whitespace-nowrap">
      {/* Diamond separator (leading) */}
      <span
        aria-hidden="true"
        className="w-1.5 h-1.5 bg-[#c9a96e] rotate-45 flex-shrink-0 opacity-70"
      />

      {/* Text block: DENOVA X BRAND (COUNTRY) */}
      <div className="flex items-baseline gap-2 sm:gap-3">
        {/* "DENOVA X" prefix — subtle gold, thin letter-spacing */}
        <span className="font-[family-name:var(--font-playfair)] text-xs sm:text-sm lg:text-base font-normal tracking-[0.25em] uppercase text-[#c9a96e]/80">
          DENOVA
        </span>

        <span className="text-xs sm:text-sm lg:text-base text-[#c9a96e]/60 font-light">
          &times;
        </span>

        {/* Brand name — bold, prominent */}
        <span className="font-[family-name:var(--font-playfair)] text-lg sm:text-xl lg:text-2xl font-bold tracking-[0.08em] uppercase text-white">
          {entry.brand}
        </span>

        {/* Country tag — small, muted gold */}
        {entry.country && (
          <span className="text-[10px] sm:text-xs lg:text-sm font-medium tracking-[0.2em] uppercase text-[#c9a96e]/70">
            ({entry.country})
          </span>
        )}
      </div>
    </div>
  );
}