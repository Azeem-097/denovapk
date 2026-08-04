"use client";
import { useDevicePerformance } from "@/components/animations/useDevicePerformance";

/**
 * BrandTicker — international brand collaborations.
 * Accent colour follows the Denova orange brand accent.
 *
 * Sizing: intentionally compact (~30% smaller than original design)
 * for a refined, editorial marquee feel that does not dominate
 * the vertical rhythm of the homepage.
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
  { brand: "PRIMARK",        country: "UK"         },
];

const ACCENT = "#F97316";

export function BrandTicker() {
  const { shouldAnimate } = useDevicePerformance();
  const doubled = [...BRAND_COLLABORATIONS, ...BRAND_COLLABORATIONS];

  return (
    <section
      className="relative w-full bg-[#1a1a1a] overflow-hidden select-none"
      aria-label="International brand collaborations"
    >
      {/* Top hairline accent — lighter, more visible */}
      <div
        className="h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }}
      />

      <div className="py-4 sm:py-5 lg:py-6 overflow-hidden">
        <div
          className={`flex w-max ${shouldAnimate ? "animate-marquee" : ""} hover:[animation-play-state:paused]`}
          style={{ animationDuration: "40s" }}
        >
          {doubled.map((entry, i) => (
            <BrandItem key={i} entry={entry} />
          ))}
        </div>
      </div>

      {/* Bottom hairline accent */}
      <div
        className="h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }}
      />

      {/* Edge fade vignette */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-16 lg:w-24 bg-gradient-to-r from-[#1a1a1a] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-16 lg:w-24 bg-gradient-to-l from-[#1a1a1a] to-transparent" />
    </section>
  );
}

function BrandItem({ entry }: { entry: BrandEntry }) {
  return (
    <div className="flex items-center gap-4 sm:gap-6 lg:gap-7 px-4 sm:px-6 lg:px-7 whitespace-nowrap">
      {/* Diamond separator */}
      <span
        aria-hidden="true"
        className="w-1 h-1 rotate-45 flex-shrink-0"
        style={{ backgroundColor: ACCENT, boxShadow: `0 0 10px ${ACCENT}` }}
      />

      <div className="flex items-baseline gap-1.5 sm:gap-2">
        <span
          className="font-[family-name:var(--font-playfair)] text-[10px] sm:text-xs lg:text-sm font-normal tracking-[0.25em] uppercase"
          style={{ color: ACCENT }}
        >
          DENOVA
        </span>

        <span className="text-[10px] sm:text-xs lg:text-sm font-light" style={{ color: ACCENT }}>
          &times;
        </span>

        <span className="font-[family-name:var(--font-playfair)] text-sm sm:text-base lg:text-lg font-bold tracking-[0.08em] uppercase text-white">
          {entry.brand}
        </span>

        {entry.country && (
          <span
            className="text-[8px] sm:text-[10px] lg:text-xs font-medium tracking-[0.2em] uppercase"
            style={{ color: ACCENT }}
          >
            ({entry.country})
          </span>
        )}
      </div>
    </div>
  );
}
