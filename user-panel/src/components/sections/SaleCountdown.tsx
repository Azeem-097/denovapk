"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FadeIn } from "@/components/animations/FadeIn";
import { SlideIn } from "@/components/animations/SlideIn";
import { cn } from "@/lib/utils";

/**
 * SaleCountdown
 * ─────────────────────────────────────────────────────────────
 * Premium "limited-time offer" section between Hero and
 * Featured Collections.
 */

// ─── Countdown target: Guarantees homepage timer is always > 4 days ─
function getSaleEndsAt(): Date {
  const now = new Date();
  const windowMs = 7 * 24 * 60 * 60 * 1000; // 7-day rolling window
  
  // Find the end of the current 7-day cycle
  let endsAt = new Date((Math.floor(now.getTime() / windowMs) + 1) * windowMs);

  // GUARANTEE: If the cycle ends in less than 4 days, push it to the NEXT cycle.
  // This ensures the sitewide sale always shows 4 to 11 days remaining,
  // making it strictly greater than the 1-2 day product-specific timers.
  if (endsAt.getTime() - now.getTime() < 4 * 24 * 60 * 60 * 1000) {
    endsAt = new Date(endsAt.getTime() + windowMs);
  }
  
  return endsAt;
}

interface TimeLeft {
  days:    number;
  hours:   number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(endsAt: Date): TimeLeft {
  const diff = Math.max(0, endsAt.getTime() - Date.now());
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function SaleCountdown() {
  const [mounted, setMounted] = useState(false);
  const [time,    setTime]    = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setMounted(true);
    const endsAt = getSaleEndsAt();

    const update = () => setTime(calculateTimeLeft(endsAt));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full bg-white py-10 sm:py-12 lg:py-14 overflow-hidden">

      {/* Subtle top border accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />

      <div className="site-container">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-8 lg:gap-16">

          {/* ── LEFT: Label + Heading + CTA ─────────────── */}
          <div className="text-center lg:text-left">
            <FadeIn>
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">
                Shop Before It Ends
              </span>
            </FadeIn>

            <FadeIn delay={100}>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1a1a1a] mt-2 sm:mt-3 leading-tight">
                Save Minimum{" "}
                <span className="relative inline-block">
                  50%
                  {/* Hand-drawn gold circle around percentage */}
                  <svg
                    className="absolute -inset-x-2 -inset-y-1 w-[calc(100%+16px)] h-[calc(100%+8px)] pointer-events-none"
                    viewBox="0 0 100 60"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <ellipse
                      cx="50"
                      cy="30"
                      rx="46"
                      ry="24"
                      fill="none"
                      stroke="#c9a96e"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="220"
                      strokeDashoffset="0"
                      style={{
                        transformOrigin: "center",
                        animation: "draw-circle 1.4s ease-out 400ms both",
                      }}
                    />
                  </svg>
                </span>{" "}
                on Crazy Deal
              </h2>
            </FadeIn>

            <FadeIn delay={200}>
              <Link
                href="/shop?filter=sale"
                className="group inline-flex items-center gap-2 mt-4 sm:mt-5 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-[#1a1a1a] border-b border-[#1a1a1a] pb-0.5 hover:text-[#c9a96e] hover:border-[#c9a96e] transition-all duration-300"
              >
                Shop The Sale
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </FadeIn>
          </div>

          {/* ── RIGHT: Live Countdown ────────────────────── */}
          <SlideIn from="right" distance={40} delay={150}>
            <div className="flex items-start justify-center lg:justify-end gap-2 sm:gap-3 lg:gap-4">
              <CountdownUnit value={time.days}    label="Days"    mounted={mounted} />
              <CountdownSeparator />
              <CountdownUnit value={time.hours}   label="Hours"   mounted={mounted} />
              <CountdownSeparator />
              <CountdownUnit value={time.minutes} label="Minutes" mounted={mounted} />
              <CountdownSeparator />
              <CountdownUnit value={time.seconds} label="Seconds" mounted={mounted} pulseOnTick />
            </div>
          </SlideIn>

        </div>
      </div>

      {/* Bottom border accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />

      {/* ─── Countdown animation keyframes (scoped inline) ─── */}
      <style jsx>{`
        @keyframes draw-circle {
          from { stroke-dashoffset: 220; opacity: 0; }
          to   { stroke-dashoffset: 0;   opacity: 1; }
        }
      `}</style>
    </section>
  );
}

/* ─── Countdown Unit ─────────────────────────────────────── */
interface CountdownUnitProps {
  value:        number;
  label:        string;
  mounted:      boolean;
  pulseOnTick?: boolean;
}

function CountdownUnit({ value, label, mounted, pulseOnTick }: CountdownUnitProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== prevValue) {
      setIsFlipping(true);
      const t = setTimeout(() => {
        setPrevValue(value);
        setIsFlipping(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [value, prevValue]);

  // Prevent hydration mismatch — render placeholder before mount
  const displayValue = mounted ? String(value).padStart(2, "0") : "--";

  return (
    <div className="flex flex-col items-center min-w-[52px] sm:min-w-[64px] lg:min-w-[76px]">
      <div className="relative overflow-hidden">
        <span
          className={cn(
            "font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] tabular-nums leading-none block transition-all duration-300",
            isFlipping && "opacity-70 -translate-y-1",
            pulseOnTick && mounted && "text-[#c9a96e]"
          )}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {displayValue}
        </span>
      </div>
      <span className="text-[9px] sm:text-[10px] lg:text-xs font-semibold tracking-[0.2em] uppercase text-[#6b7280] mt-2 sm:mt-3">
        {label}
      </span>
    </div>
  );
}

/* ─── Colon Separator between units ──────────────────────── */
function CountdownSeparator() {
  return (
    <span
      className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl font-light text-[#c9a96e]/40 leading-none mt-1 sm:mt-1.5 lg:mt-2 hidden sm:block"
      aria-hidden="true"
    >
      :
    </span>
  );
}