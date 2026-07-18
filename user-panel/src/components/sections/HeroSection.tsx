"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useDevicePerformance } from "@/components/animations/useDevicePerformance";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
//  Types
// ═══════════════════════════════════════════════════════════
export type ElementKey    = "brand" | "tagline" | "productDesc" | "originalPrice" | "currentPrice" | "countdown";
export type EntranceAnim  = "fade-in" | "slide-up" | "slide-down" | "slide-left" | "slide-right"
                          | "scale-in" | "scale-bounce" | "blur-in" | "mask-reveal" | "none";
export type DecorativeAcc = "none" | "underline-draw" | "accent-bar-left" | "shimmer-sweep" | "accent-dots";
export type LoopAnim      = "none" | "float-soft" | "pulse-glow" | "breathe";
export type Speed         = "fast" | "normal" | "slow";
export type DelayLevel    = "immediate" | "short" | "medium" | "long";

export interface AnimationConfig {
  entrance:   EntranceAnim;
  decorative: DecorativeAcc;
  loop:       LoopAnim;
  speed:      Speed;
  delay:      DelayLevel;
}

export interface ElementStyle {
  enabled:       boolean;
  text:          string;
  x:             number;
  y:             number;
  anchor:        "start" | "center" | "end";
  fontSize:      number;
  fontWeight:    number;
  fontFamily:    "serif" | "sans";
  color:         string;
  textAlign:     "left" | "center" | "right";
  lineHeight:    number;
  letterSpacing: number;
  maxWidth:      number;
  textShadow:    boolean;
  uppercase:     boolean;
  strikethrough: boolean;
  nowPrefix:     boolean;
  animation?:    AnimationConfig;
}

export interface CountdownStyle extends ElementStyle {
  bgColor?:       string;
  bgOpacity?:     number;
  borderRadius?:  number;
  paddingX?:      number;
  paddingY?:      number;
  showDays?:      boolean;
  showHours?:     boolean;
  showMinutes?:   boolean;
  showSeconds?:   boolean;
  labelStyle?:    "below" | "beside" | "none";
  separator?:     "colon" | "space" | "none";
  digitStyle?:    "minimal" | "boxed" | "pill";
  endsAt?:        string;
}

export interface OverlayConfig {
  brand:         ElementStyle;
  tagline:       ElementStyle;
  productDesc:   ElementStyle;
  originalPrice: ElementStyle;
  currentPrice:  ElementStyle;
  countdown:     CountdownStyle;
}

export interface OverlayV2 {
  desktop: OverlayConfig;
  mobile:  OverlayConfig;
}

// ── Stickers ──
export type StickerKind    = "50-off" | "free-delivery";
export type LegacyCorner   = "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type StickerSize    = "sm" | "md" | "lg" | "xl";

// New sticker position (per device)
export interface StickerPosition {
  x:      number;
  y:      number;
  anchor: "start" | "center" | "end";
}

export interface Sticker {
  enabled:         boolean;
  kind:            StickerKind;
  size:            StickerSize;

  // NEW per-device positions
  positionDesktop?: StickerPosition;
  positionMobile?:  StickerPosition;

  // Legacy fields (auto-migrated)
  corner?: LegacyCorner;
  offset?: number;
}

interface HeroBanner {
  id:                   string;
  image:                string;
  imageMobile?:         string;
  title:                string;
  subtitle:             string;
  description:          string;
  buttonLabel:          string;
  buttonHref:           string;
  buttonSecondaryLabel: string;
  buttonSecondaryHref:  string;
  isActive:             boolean;
  sortOrder:            number;

  overlayV2?:        OverlayV2;
  overlayDarkness?:  number;
  stickers?:         Sticker[];

  // Legacy
  countdownEnabled?: boolean;
  countdownEndsAt?:  string;
  brand?:            string;
  productTitle?:     string;
  currentPrice?:     string;
  originalPrice?:    string;
  discountPercent?:  string;
  contentPosition?:  string;
  textTheme?:        "light" | "dark";
}

interface HeroSectionProps {
  banners?:         HeroBanner[];
  rotationSeconds?: number;
}

const FALLBACK: HeroBanner[] = [
  {
    id: "fallback-1",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80",
    imageMobile: "",
    title: "Denova PK", subtitle: "", description: "",
    buttonLabel: "", buttonHref: "/shop",
    buttonSecondaryLabel: "", buttonSecondaryHref: "",
    isActive: true, sortOrder: 0,
  },
];

// ═══════════════════════════════════════════════════════════
//  Defaults + adapters
// ═══════════════════════════════════════════════════════════
export function defaultAnimation(): AnimationConfig {
  return { entrance: "slide-up", decorative: "none", loop: "none", speed: "normal", delay: "short" };
}

export function defaultElementStyle(overrides: Partial<ElementStyle> = {}): ElementStyle {
  return {
    enabled: false, text: "",
    x: 5, y: 10, anchor: "start",
    fontSize: 24, fontWeight: 500, fontFamily: "sans",
    color: "#ffffff",
    textAlign: "left", lineHeight: 1.2, letterSpacing: 0, maxWidth: 45,
    textShadow: true, uppercase: false, strikethrough: false, nowPrefix: false,
    animation: defaultAnimation(),
    ...overrides,
  };
}

function defaultCountdownStyle(overrides: Partial<CountdownStyle> = {}): CountdownStyle {
  return {
    ...defaultElementStyle({
      x: 90, y: 8, anchor: "end", fontSize: 20, fontWeight: 700, fontFamily: "sans",
      color: "#ffffff", maxWidth: 40,
    }),
    bgColor: "#000000", bgOpacity: 60, borderRadius: 8, paddingX: 12, paddingY: 8,
    showDays: true, showHours: true, showMinutes: true, showSeconds: true,
    labelStyle: "below", separator: "none", digitStyle: "minimal",
    endsAt: "",
    ...overrides,
  };
}

// ─── Sticker corner → x/y/anchor migration ────────────────
function cornerToPosition(corner: LegacyCorner | undefined): StickerPosition {
  switch (corner) {
    case "top-left":     return { x: 5,  y: 5,  anchor: "start" };
    case "top-right":    return { x: 95, y: 5,  anchor: "end"   };
    case "bottom-left":  return { x: 5,  y: 95, anchor: "start" };
    case "bottom-right": return { x: 95, y: 95, anchor: "end"   };
    default:             return { x: 95, y: 5,  anchor: "end"   };
  }
}

// Normalize a sticker so positionDesktop + positionMobile always exist
function normalizeSticker(s: Sticker): Sticker {
  const fallback = cornerToPosition(s.corner);
  return {
    ...s,
    positionDesktop: s.positionDesktop ?? fallback,
    positionMobile:  s.positionMobile  ?? fallback,
  };
}

// Legacy converter — pre-V2 banners
function legacyToOverlayV2(banner: HeroBanner): OverlayV2 {
  const isLight = (banner.textTheme ?? "light") === "light";
  const color   = isLight ? "#ffffff" : "#1a1a1a";
  const pos     = banner.contentPosition ?? "center-left";
  const xy      = getLegacyXY(pos);
  const anchor  = xy.anchor;

  const makeEl = (extra: Partial<ElementStyle>): ElementStyle =>
    defaultElementStyle({
      color, anchor,
      textAlign: anchor === "end" ? "right" : anchor === "center" ? "center" : "left",
      ...extra,
    });

  const config: OverlayConfig = {
    brand:         makeEl({ enabled: !!banner.brand,         text: banner.brand ?? "",         x: xy.x, y: Math.max(5, xy.y - 20), fontSize: 56, fontWeight: 700, fontFamily: "serif" }),
    tagline:       makeEl({ enabled: false, text: "" }),
    productDesc:   makeEl({ enabled: !!banner.productTitle,  text: banner.productTitle ?? "",  x: xy.x, y: xy.y,                    fontSize: 32, fontWeight: 600, fontFamily: "serif" }),
    originalPrice: makeEl({ enabled: !!banner.originalPrice, text: banner.originalPrice ?? "", x: xy.x, y: Math.min(85, xy.y + 20), fontSize: 20, fontWeight: 400, strikethrough: true }),
    currentPrice:  makeEl({ enabled: !!banner.currentPrice,  text: banner.currentPrice ?? "",  x: xy.x, y: Math.min(90, xy.y + 28), fontSize: 40, fontWeight: 700, nowPrefix: !!banner.originalPrice }),
    countdown:     defaultCountdownStyle({ enabled: !!banner.countdownEnabled, endsAt: banner.countdownEndsAt ?? "" }),
  };

  return { desktop: config, mobile: config };
}

function getLegacyXY(pos: string): { x: number; y: number; anchor: "start" | "center" | "end" } {
  switch (pos) {
    case "top-left":      return { x: 5,  y: 15, anchor: "start"  };
    case "top-center":    return { x: 50, y: 15, anchor: "center" };
    case "top-right":     return { x: 95, y: 15, anchor: "end"    };
    case "center-left":   return { x: 5,  y: 50, anchor: "start"  };
    case "center":        return { x: 50, y: 50, anchor: "center" };
    case "center-right":  return { x: 95, y: 50, anchor: "end"    };
    case "bottom-left":   return { x: 5,  y: 85, anchor: "start"  };
    case "bottom-center": return { x: 50, y: 85, anchor: "center" };
    case "bottom-right":  return { x: 95, y: 85, anchor: "end"    };
    default:              return { x: 5,  y: 50, anchor: "start"  };
  }
}

function ensureCountdownInConfig(cfg: OverlayConfig | undefined, legacy: HeroBanner): OverlayConfig {
  if (!cfg) return legacyToOverlayV2(legacy).desktop;
  if (!cfg.countdown) {
    return { ...cfg, countdown: defaultCountdownStyle({ enabled: !!legacy.countdownEnabled, endsAt: legacy.countdownEndsAt ?? "" }) };
  }
  const patched: OverlayConfig = { ...cfg };
  (["brand", "tagline", "productDesc", "originalPrice", "currentPrice", "countdown"] as ElementKey[]).forEach((k) => {
    if (!patched[k].animation) patched[k].animation = defaultAnimation();
  });
  return patched;
}

// ═══════════════════════════════════════════════════════════
//  Animation constants
// ═══════════════════════════════════════════════════════════
const SPEED_MS: Record<Speed, number> = { fast: 400, normal: 700, slow: 1100 };
const DELAY_MS: Record<DelayLevel, number> = { immediate: 0, short: 200, medium: 500, long: 900 };

function animationCSS(anim: AnimationConfig | undefined, shouldAnim: boolean): {
  entranceStyle: React.CSSProperties;
  loopStyle:     React.CSSProperties;
  decoDelay:     number;
  totalMs:       number;
} {
  const a = anim ?? defaultAnimation();
  if (!shouldAnim || a.entrance === "none") {
    return { entranceStyle: {}, loopStyle: {}, decoDelay: 0, totalMs: 0 };
  }
  const durMs = SPEED_MS[a.speed];
  const delMs = DELAY_MS[a.delay];
  const entrance: React.CSSProperties = {
    animation: `hero-${a.entrance} ${durMs}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delMs}ms both`,
  };
  const loop: React.CSSProperties = a.loop === "none" ? {} : {
    animation: `${entrance.animation}, hero-${a.loop} ${a.loop === "float-soft" ? 4 : 3}s ease-in-out infinite ${delMs + durMs}ms`,
  };
  return { entranceStyle: loop.animation ? loop : entrance, loopStyle: {}, decoDelay: delMs + durMs + 100, totalMs: delMs + durMs };
}

// ═══════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════
export function HeroSection({ banners: initialBanners, rotationSeconds = 8 }: HeroSectionProps) {
  const [slides, setSlides] = useState<HeroBanner[]>(
    initialBanners && initialBanners.length > 0 ? initialBanners : FALLBACK
  );
  const [rotation, setRotation] = useState(rotationSeconds);
  const [current, setCurrent]   = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { shouldAnimate } = useDevicePerformance();

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    check();
    const mq = window.matchMedia("(max-width: 767px)");
    const listener = () => check();
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    if (initialBanners && initialBanners.length > 0) return;
    fetch("/api/hero-banners")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.banners?.length > 0) setSlides(data.banners);
        if (data?.rotationSeconds)     setRotation(Number(data.rotationSeconds));
      })
      .catch(() => {});
  }, [initialBanners]);

  useEffect(() => { setCurrent(0); }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const next = slides[(current + 1) % slides.length];
    if (next?.image)       { const img = new window.Image(); img.src = next.image; }
    if (next?.imageMobile) { const img = new window.Image(); img.src = next.imageMobile; }
  }, [current, slides]);

  useEffect(() => {
    if (!shouldAnimate || slides.length <= 1 || isPaused) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const durationMs = Math.max(2, rotation) * 1000;
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const pct = Math.min(elapsed / durationMs, 1);
      setProgress(pct * 100);
      if (pct >= 1) {
        setCurrent((c) => (c + 1) % slides.length);
        startTimeRef.current = performance.now();
        setProgress(0);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [shouldAnimate, slides.length, rotation, isPaused, current]);

  useEffect(() => {
    const onVis = () => setIsPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (slides.length === 0) return null;

  const goToSlide = (i: number) => {
    if (i === current) return;
    setCurrent(i); setProgress(0); startTimeRef.current = performance.now();
  };

  return (
    <section
      className="relative w-full bg-white overflow-hidden group/hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, i) => (
        <BannerSlide
          key={slide.id}
          slide={slide}
          isActive={i === current}
          index={i}
          shouldAnimate={shouldAnimate}
          isMobile={isMobile}
        />
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-30 h-[3px] bg-black/20">
          <div className="h-full bg-[#c9a96e] shadow-[0_0_8px_rgba(201,169,110,0.6)]"
            style={{ width: `${progress}%`, transition: progress === 0 ? "none" : "width 100ms linear" }} />
        </div>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => goToSlide(i)} className="group/dot py-2 px-0.5" aria-label={`Go to slide ${i + 1}`}>
              <div className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === current ? "w-8 bg-white" : "w-1.5 bg-white/60 group-hover/dot:bg-white/90"
              )} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
//  BannerSlide — natural aspect ratio (NO CROPPING)
// ═══════════════════════════════════════════════════════════
interface BannerSlideProps {
  slide: HeroBanner; isActive: boolean; index: number;
  shouldAnimate: boolean; isMobile: boolean;
}

function BannerSlide({ slide, isActive, index, shouldAnimate, isMobile }: BannerSlideProps) {
  const hasLink   = !!slide.buttonHref;
  const mobileSrc = slide.imageMobile || slide.image;

  const rawOverlay: OverlayV2 = slide.overlayV2 ?? legacyToOverlayV2(slide);
  const config = ensureCountdownInConfig(isMobile ? rawOverlay.mobile : rawOverlay.desktop, slide);

  // <picture> ensures mobile browsers get the mobile image via a media source.
  const imgElement = (
    <picture>
      <source media="(max-width: 767px)" srcSet={mobileSrc} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slide.image}
        alt={slide.title || `Banner ${index + 1}`}
        className="block w-full h-auto"
        draggable={false}
        loading={index === 0 ? "eager" : "lazy"}
        fetchPriority={index === 0 ? "high" : "auto"}
      />
    </picture>
  );

  const containerClass = cn(
    "top-0 left-0 w-full transition-opacity",
    shouldAnimate ? "duration-700" : "duration-0",
    isActive ? "relative opacity-100 z-10" : "absolute opacity-0 z-0 pointer-events-none"
  );

  const inner = (
    <div className="relative">
      {imgElement}

      {slide.overlayDarkness !== undefined && slide.overlayDarkness > 0 && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: `rgba(0,0,0,${slide.overlayDarkness / 100})` }} />
      )}

      <BannerOverlayV2 config={config} slide={slide} isActive={isActive} shouldAnimate={shouldAnimate} isMobile={isMobile} />

      {/* Stickers — draggable-positioned per device */}
      {(slide.stickers ?? []).filter((s) => s.enabled).map((s, i) => (
        <StickerLayer key={`${s.kind}-${i}`} sticker={normalizeSticker(s)} isActive={isActive} shouldAnimate={shouldAnimate} isMobile={isMobile} />
      ))}
    </div>
  );

  if (hasLink) {
    return (
      <Link href={slide.buttonHref} aria-label={slide.title || `Banner ${index + 1}`}
        className={cn(containerClass, "block cursor-pointer")}>
        {inner}
      </Link>
    );
  }
  return <div className={containerClass}>{inner}</div>;
}

// ═══════════════════════════════════════════════════════════
//  Overlay
// ═══════════════════════════════════════════════════════════
const ELEMENT_ORDER: ElementKey[] = ["brand", "tagline", "productDesc", "originalPrice", "currentPrice", "countdown"];

function BannerOverlayV2({ config, slide, isActive, shouldAnimate, isMobile }: {
  config: OverlayConfig; slide: HeroBanner; isActive: boolean; shouldAnimate: boolean; isMobile: boolean;
}) {
  const shouldAnim = shouldAnimate && isActive;
  return (
    <div className="absolute inset-0 pointer-events-none">
      {ELEMENT_ORDER.map((key) => {
        const el = config[key];
        if (!el.enabled) return null;
        if (key !== "countdown" && !el.text.trim()) return null;

        if (key === "countdown") {
          const cd = el as CountdownStyle;
          if (!cd.endsAt) return null;
          return <CountdownElement key={`${key}-${slide.id}-${isActive}`} style={cd} shouldAnim={shouldAnim} isMobile={isMobile} />;
        }

        return (
          <OverlayElement
            key={`${key}-${slide.id}-${isActive}`}
            elementKey={key}
            style={el}
            shouldAnim={shouldAnim}
          />
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  Text element
// ═══════════════════════════════════════════════════════════
function OverlayElement({ elementKey, style, shouldAnim }: {
  elementKey: ElementKey; style: ElementStyle; shouldAnim: boolean;
}) {
  const translateX = style.anchor === "center" ? "-50%" : style.anchor === "end" ? "-100%" : "0";
  const fontVar = style.fontFamily === "serif"
    ? "var(--font-playfair), Georgia, serif"
    : "var(--font-inter), system-ui, sans-serif";

  const isDark = isColorDark(style.color);
  const shadow = style.textShadow
    ? isDark ? "0 1px 3px rgba(255,255,255,0.4)" : "0 2px 8px rgba(0,0,0,0.4)"
    : "none";

  const isPrice    = elementKey === "currentPrice";
  const isOriginal = elementKey === "originalPrice";

  const content = isPrice && style.nowPrefix ? (
    <span className="inline-flex items-baseline gap-2">
      <span style={{
        fontSize: `${Math.round(style.fontSize * 0.55)}px`, fontWeight: 600,
        letterSpacing: "0.15em", opacity: 0.85,
      }}>NOW</span>
      <span>{style.text}</span>
    </span>
  ) : (
    style.text
  );

  const { entranceStyle, decoDelay } = animationCSS(style.animation, shouldAnim);
  const deco = style.animation?.decorative ?? "none";

  return (
    <div
      className="absolute pointer-events-none whitespace-pre-line"
      style={{
        left: `${style.x}%`, top: `${style.y}%`,
        transform: `translate(${translateX}, 0)`,
        maxWidth: `${style.maxWidth}%`,
        fontSize:
          `clamp(${Math.max(10, Math.round(style.fontSize * 0.4))}px,` +
          ` ${(style.fontSize / 19.2).toFixed(2)}vw,` +
          ` ${style.fontSize}px)`,
        fontWeight: style.fontWeight, fontFamily: fontVar,
        color: style.color, textAlign: style.textAlign,
        lineHeight: style.lineHeight, letterSpacing: `${style.letterSpacing}em`,
        textTransform: style.uppercase ? "uppercase" : "none",
        textDecoration: (isOriginal && style.strikethrough) ? "line-through" : "none",
        textShadow: shadow,
        position: "absolute",
        ...entranceStyle,
      }}
    >
      <span style={{ position: "relative", display: "inline-block" }}>
        {content}

        {deco === "underline-draw" && (
          <span aria-hidden="true"
            style={{
              position: "absolute", left: 0, right: 0, bottom: "-0.15em",
              height: "3px", background: style.color, borderRadius: "2px",
              transformOrigin: "left center",
              animation: shouldAnim ? `hero-underline-draw 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${decoDelay}ms both` : "none",
            }} />
        )}

        {deco === "accent-bar-left" && (
          <span aria-hidden="true"
            style={{
              position: "absolute", left: "-0.5em", top: 0, bottom: 0,
              width: "3px", background: "#c9a96e", borderRadius: "2px",
              transformOrigin: "top center",
              animation: shouldAnim ? `hero-accent-bar-draw 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${decoDelay}ms both` : "none",
            }} />
        )}

        {deco === "shimmer-sweep" && (
          <span aria-hidden="true"
            style={{
              position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
            }}>
            <span
              style={{
                position: "absolute", top: 0, left: 0, width: "40%", height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
                animation: shouldAnim ? `hero-shimmer-sweep 1600ms ease-in-out ${decoDelay}ms both` : "none",
                mixBlendMode: "overlay",
              }} />
          </span>
        )}

        {deco === "accent-dots" && (
          <span aria-hidden="true"
            style={{
              display: "inline-flex", gap: "0.35em", marginLeft: "0.5em", verticalAlign: "middle",
            }}>
            {[0, 1, 2].map((i) => (
              <span key={i}
                style={{
                  display: "inline-block", width: "0.35em", height: "0.35em",
                  borderRadius: "9999px", background: "#c9a96e",
                  animation: shouldAnim ? `hero-dot-pop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) ${decoDelay + i * 150}ms both` : "none",
                }} />
            ))}
          </span>
        )}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  Countdown element
// ═══════════════════════════════════════════════════════════
function CountdownElement({ style, shouldAnim }: {
  style: CountdownStyle; shouldAnim: boolean; isMobile: boolean;
}) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false });

  useEffect(() => {
    if (!style.endsAt) return;
    const calc = () => {
      const diff = new Date(style.endsAt!).getTime() - Date.now();
      if (diff <= 0) { setTime({ d: 0, h: 0, m: 0, s: 0, expired: true }); return; }
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
        expired: false,
      });
    };
    calc();
    const int = setInterval(calc, 1000);
    return () => clearInterval(int);
  }, [style.endsAt]);

  if (!style.endsAt || time.expired) return null;

  const translateX = style.anchor === "center" ? "-50%" : style.anchor === "end" ? "-100%" : "0";
  const fontVar = style.fontFamily === "serif"
    ? "var(--font-playfair), Georgia, serif"
    : "var(--font-inter), system-ui, sans-serif";

  const { entranceStyle } = animationCSS(style.animation, shouldAnim);
  const bgAlpha = ((style.bgOpacity ?? 60) / 100).toFixed(2);
  const bg      = style.bgColor && style.bgColor !== ""
    ? hexToRgba(style.bgColor, Number(bgAlpha))
    : "transparent";

  const units: Array<{ v: number; label: string; show: boolean }> = [
    { v: time.d, label: "D", show: !!style.showDays  && time.d > 0 },
    { v: time.h, label: "H", show: !!style.showHours   },
    { v: time.m, label: "M", show: !!style.showMinutes },
    { v: time.s, label: "S", show: !!style.showSeconds },
  ].filter((u) => u.show);

  const digitStyle: React.CSSProperties = {
    fontSize: `${style.fontSize}px`, fontWeight: style.fontWeight,
    fontFamily: fontVar, color: style.color, lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: `${Math.max(9, Math.round(style.fontSize * 0.32))}px`,
    letterSpacing: "0.15em", opacity: 0.75, textTransform: "uppercase",
    color: style.color, fontWeight: 600,
  };

  const cellClass = "flex flex-col items-center";

  const cellBg = (extraStyle: React.CSSProperties = {}) => ({
    background: style.digitStyle === "boxed" || style.digitStyle === "pill" ? bg : "transparent",
    border: style.digitStyle === "boxed" ? `1px solid ${hexToRgba(style.color, 0.25)}` : "none",
    borderRadius: style.digitStyle === "pill" ? "9999px" : `${style.borderRadius ?? 0}px`,
    padding: `${style.paddingY ?? 8}px ${style.paddingX ?? 12}px`,
    minWidth: `${style.fontSize * 1.4}px`,
    ...extraStyle,
  });

  const outerBg = style.digitStyle === "minimal" ? {
    background: bg,
    borderRadius: `${style.borderRadius ?? 0}px`,
    padding: `${style.paddingY ?? 8}px ${style.paddingX ?? 12}px`,
  } : {};

  return (
    <div className="absolute pointer-events-none"
      style={{
        left: `${style.x}%`, top: `${style.y}%`,
        transform: `translate(${translateX}, 0)`,
        maxWidth: `${style.maxWidth}%`,
        ...entranceStyle,
      }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: `${Math.max(4, style.fontSize * 0.15)}px`, ...outerBg }}>
        {units.map((u, i) => (
          <div key={u.label} style={{ display: "flex", alignItems: "center" }}>
            <div className={cellClass} style={cellBg()}>
              {style.labelStyle === "beside" ? (
                <span style={{ display: "inline-flex", alignItems: "baseline", gap: "0.15em" }}>
                  <span style={digitStyle}>{String(u.v).padStart(2, "0")}</span>
                  <span style={{ ...labelStyle, fontSize: `${Math.max(10, Math.round(style.fontSize * 0.4))}px` }}>
                    {u.label.toLowerCase()}
                  </span>
                </span>
              ) : (
                <>
                  <span style={digitStyle}>{String(u.v).padStart(2, "0")}</span>
                  {style.labelStyle === "below" && (
                    <span style={{ ...labelStyle, marginTop: "0.3em" }}>{u.label}</span>
                  )}
                </>
              )}
            </div>
            {i < units.length - 1 && style.separator === "colon" && (
              <span style={{ ...digitStyle, margin: `0 ${Math.max(4, style.fontSize * 0.1)}px`, opacity: 0.5 }}>:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  Sticker layer — X/Y positioning per device
// ═══════════════════════════════════════════════════════════
const STICKER_SIZES: Record<StickerSize, { w: number; wMobile: number }> = {
  sm: { w: 140, wMobile: 90  },
  md: { w: 200, wMobile: 130 },
  lg: { w: 280, wMobile: 170 },
  xl: { w: 360, wMobile: 220 },
};

function StickerLayer({ sticker, isActive, shouldAnimate, isMobile }: {
  sticker: Sticker; isActive: boolean; shouldAnimate: boolean; isMobile: boolean;
}) {
  const src = sticker.kind === "50-off"
    ? "/uploads/general/50-off.png"
    : "/uploads/general/free-delivery.png";

  const width = isMobile ? STICKER_SIZES[sticker.size].wMobile : STICKER_SIZES[sticker.size].w;
  const pos   = (isMobile ? sticker.positionMobile : sticker.positionDesktop) ?? cornerToPosition(sticker.corner);
  const translateX = pos.anchor === "center" ? "-50%" : pos.anchor === "end" ? "-100%" : "0";

  const shouldAnim = shouldAnimate && isActive;

  // Signature entrance animation depends on position (top vs bottom)
  const animName = pos.y < 50 ? "hero-sticker-pop" : "hero-sticker-slide-up";

  return (
    <div style={{
      position: "absolute",
      left: `${pos.x}%`, top: `${pos.y}%`,
      transform: `translate(${translateX}, 0)`,
      width,
      zIndex: 20,
      pointerEvents: "none",
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={sticker.kind === "50-off" ? "50% off" : "Free delivery"}
        style={{
          width: "100%", height: "auto", display: "block",
          animation: shouldAnim ? `${animName} 900ms cubic-bezier(0.34, 1.56, 0.64, 1) 400ms both` : "none",
          transformOrigin: pos.y < 50 ? "top center" : "bottom center",
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))",
        }}
        draggable={false}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════
function isColorDark(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length !== 6) return false;
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace("#", "");
  if (c.length !== 6) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}