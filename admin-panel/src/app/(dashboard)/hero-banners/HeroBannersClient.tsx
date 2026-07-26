"use client";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Image as ImageIcon, Plus, GripVertical, Trash2, Eye, EyeOff, Edit, X, Loader,
  Link as LinkIcon, Upload, Info, Monitor, Smartphone, Clock, Save,
  Sparkles, Type, MousePointer2, Move, Tag, Zap, Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastStore }   from "@/store/toastStore";
import { useConfirmStore } from "@/store/confirmStore";

// ═══════════════════════════════════════════════════════════
//  Types
// ═══════════════════════════════════════════════════════════
type ElementKey    = "brand" | "tagline" | "productDesc" | "originalPrice" | "currentPrice" | "countdown";
type EntranceAnim  = "fade-in" | "slide-up" | "slide-down" | "slide-left" | "slide-right"
                   | "scale-in" | "scale-bounce" | "blur-in" | "mask-reveal" | "none";
type DecorativeAcc = "none" | "underline-draw" | "accent-bar-left" | "shimmer-sweep" | "accent-dots";
type LoopAnim      = "none" | "float-soft" | "pulse-glow" | "breathe";
type Speed         = "fast" | "normal" | "slow";
type DelayLevel    = "immediate" | "short" | "medium" | "long";

interface AnimationConfig {
  entrance:   EntranceAnim;
  decorative: DecorativeAcc;
  loop:       LoopAnim;
  speed:      Speed;
  delay:      DelayLevel;
}

interface ElementStyle {
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

interface CountdownStyle extends ElementStyle {
  bgColor?:      string;
  bgOpacity?:    number;
  borderRadius?: number;
  paddingX?:     number;
  paddingY?:     number;
  showDays?:     boolean;
  showHours?:    boolean;
  showMinutes?:  boolean;
  showSeconds?:  boolean;
  labelStyle?:   "below" | "beside" | "none";
  separator?:    "colon" | "space" | "none";
  digitStyle?:   "minimal" | "boxed" | "pill";
  endsAt?:       string;
}

interface OverlayConfig {
  brand:         ElementStyle;
  tagline:       ElementStyle;
  productDesc:   ElementStyle;
  originalPrice: ElementStyle;
  currentPrice:  ElementStyle;
  countdown:     CountdownStyle;
}

interface OverlayV2 {
  desktop: OverlayConfig;
  mobile:  OverlayConfig;
}

type StickerKind   = "50-off" | "free-delivery";
type LegacyCorner  = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type StickerSize   = "sm" | "md" | "lg" | "xl";

interface StickerPosition {
  x:      number;
  y:      number;
  anchor: "start" | "center" | "end";
}

interface Sticker {
  enabled:          boolean;
  kind:             StickerKind;
  size:             StickerSize;
  positionDesktop?: StickerPosition;
  positionMobile?:  StickerPosition;
  corner?:          LegacyCorner;   // legacy
  offset?:          number;         // legacy
}

// Preview drag target: text elements OR stickers (indexed)
type PreviewDragKey =
  | { kind: "el"; key: ElementKey }
  | { kind: "sticker"; index: number };

export interface HeroBanner {
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

const ELEMENT_LABELS: Record<ElementKey, string> = {
  brand:         "Brand Name",
  tagline:       "Tagline / Headline",
  productDesc:   "Product Description",
  originalPrice: "Original Price",
  currentPrice:  "Current Price",
  countdown:     "Countdown Timer",
};
const ELEMENT_ORDER: ElementKey[] = ["brand", "tagline", "productDesc", "originalPrice", "currentPrice", "countdown"];

const STICKER_KINDS: Array<{ value: StickerKind; label: string; src: string }> = [
  { value: "50-off",        label: "50% OFF",       src: "/uploads/general/50-off.png"        },
  { value: "free-delivery", label: "Free Delivery", src: "/uploads/general/free-delivery.png" },
];

// Preview sticker widths (px in preview) — matches storefront sizes scaled down
const STICKER_PREVIEW_WIDTHS: Record<StickerSize, number> = { sm: 40, md: 60, lg: 84, xl: 110 };

// ═══════════════════════════════════════════════════════════
//  Animation constants (mirror user panel)
// ═══════════════════════════════════════════════════════════
const SPEED_MS: Record<Speed, number> = { fast: 400, normal: 700, slow: 1100 };
const DELAY_MS: Record<DelayLevel, number> = { immediate: 0, short: 200, medium: 500, long: 900 };

// ═══════════════════════════════════════════════════════════
//  Defaults + normalizers
// ═══════════════════════════════════════════════════════════
function defaultAnimation(): AnimationConfig {
  return { entrance: "slide-up", decorative: "none", loop: "none", speed: "normal", delay: "short" };
}

function defaultElementStyle(overrides: Partial<ElementStyle> = {}): ElementStyle {
  return {
    enabled: false, text: "",
    x: 5, y: 10, anchor: "start",
    fontSize: 24, fontWeight: 500, fontFamily: "sans",
    color: "#1a2b5c",
    textAlign: "left", lineHeight: 1.2, letterSpacing: 0, maxWidth: 45,
    textShadow: false, uppercase: false, strikethrough: false, nowPrefix: false,
    animation: defaultAnimation(),
    ...overrides,
  };
}

function defaultCountdownStyle(overrides: Partial<CountdownStyle> = {}): CountdownStyle {
  return {
    ...defaultElementStyle({
      x: 90, y: 8, anchor: "end", fontSize: 22, fontWeight: 700, fontFamily: "sans",
      color: "#ffffff", maxWidth: 40,
    }),
    bgColor: "#000000", bgOpacity: 60, borderRadius: 8, paddingX: 12, paddingY: 8,
    showDays: true, showHours: true, showMinutes: true, showSeconds: true,
    labelStyle: "below", separator: "none", digitStyle: "minimal",
    endsAt: "",
    ...overrides,
  };
}

function emptyOverlayConfig(): OverlayConfig {
  return {
    brand:         defaultElementStyle(),
    tagline:       defaultElementStyle(),
    productDesc:   defaultElementStyle(),
    originalPrice: defaultElementStyle({ strikethrough: true }),
    currentPrice:  defaultElementStyle(),
    countdown:     defaultCountdownStyle(),
  };
}

function emptyOverlayV2(): OverlayV2 {
  return { desktop: emptyOverlayConfig(), mobile: emptyOverlayConfig() };
}

function cornerToPosition(corner: LegacyCorner | undefined): StickerPosition {
  switch (corner) {
    case "top-left":     return { x: 5,  y: 5,  anchor: "start" };
    case "top-right":    return { x: 95, y: 5,  anchor: "end"   };
    case "bottom-left":  return { x: 5,  y: 95, anchor: "start" };
    case "bottom-right": return { x: 95, y: 95, anchor: "end"   };
    default:             return { x: 95, y: 5,  anchor: "end"   };
  }
}

function normalizeSticker(s: Sticker): Sticker {
  const fallback = cornerToPosition(s.corner);
  return {
    ...s,
    positionDesktop: s.positionDesktop ?? fallback,
    positionMobile:  s.positionMobile  ?? fallback,
  };
}

function referenceDesignPreset(): OverlayV2 {
  const NAVY = "#1a2b5c";

  const desktop: OverlayConfig = {
    brand: defaultElementStyle({
      enabled: true, text: "GUESS\n(USA)", x: 5, y: 6, anchor: "start",
      fontSize: 76, fontWeight: 700, fontFamily: "serif", color: NAVY,
      textAlign: "left", lineHeight: 1.0, maxWidth: 30,
      animation: { entrance: "slide-down", decorative: "none", loop: "none", speed: "normal", delay: "short" },
    }),
    tagline: defaultElementStyle({
      enabled: true, text: "Timeless Comfort.\nEffortless Style.", x: 5, y: 40, anchor: "start",
      fontSize: 92, fontWeight: 700, fontFamily: "serif", color: NAVY,
      textAlign: "left", lineHeight: 1.0, letterSpacing: -0.01, maxWidth: 55,
      animation: { entrance: "mask-reveal", decorative: "underline-draw", loop: "none", speed: "slow", delay: "medium" },
    }),
    productDesc: defaultElementStyle({
      enabled: true, text: "Classic Navy — Garment-Dyed Twill — Relaxed Fit Chino.",
      x: 5, y: 68, anchor: "start", fontSize: 28, fontWeight: 400, fontFamily: "sans",
      color: NAVY, textAlign: "left", lineHeight: 1.4, maxWidth: 45,
      animation: { entrance: "slide-up", decorative: "none", loop: "none", speed: "normal", delay: "long" },
    }),
    originalPrice: defaultElementStyle({
      enabled: true, text: "Rs 5400/-", x: 5, y: 80, anchor: "start",
      fontSize: 32, fontWeight: 400, fontFamily: "sans", color: NAVY,
      textAlign: "left", strikethrough: true, maxWidth: 30,
      animation: { entrance: "slide-up", decorative: "none", loop: "none", speed: "normal", delay: "long" },
    }),
    currentPrice: defaultElementStyle({
      enabled: true, text: "Rs 2699/-", x: 5, y: 87, anchor: "start",
      fontSize: 68, fontWeight: 700, fontFamily: "sans", color: NAVY,
      textAlign: "left", nowPrefix: true, maxWidth: 45,
      animation: { entrance: "scale-bounce", decorative: "shimmer-sweep", loop: "none", speed: "slow", delay: "long" },
    }),
    countdown: defaultCountdownStyle(),
  };

  const mobile: OverlayConfig = {
    brand: defaultElementStyle({
      enabled: true, text: "GUESS\n(USA)", x: 5, y: 3, anchor: "start",
      fontSize: 44, fontWeight: 700, fontFamily: "serif", color: NAVY,
      textAlign: "left", lineHeight: 1.0, maxWidth: 45,
      animation: { entrance: "slide-down", decorative: "none", loop: "none", speed: "normal", delay: "short" },
    }),
    tagline: defaultElementStyle({
      enabled: true, text: "Timeless\nComfort.\nEffortless\nStyle.", x: 5, y: 32, anchor: "start",
      fontSize: 56, fontWeight: 700, fontFamily: "serif", color: NAVY,
      textAlign: "left", lineHeight: 1.0, letterSpacing: -0.01, maxWidth: 55,
      animation: { entrance: "mask-reveal", decorative: "underline-draw", loop: "none", speed: "slow", delay: "medium" },
    }),
    productDesc: defaultElementStyle({
      enabled: true, text: "Classic Navy — Garment-Dyed Twill — Relaxed Fit Chino.",
      x: 5, y: 68, anchor: "start", fontSize: 20, fontWeight: 400, fontFamily: "sans",
      color: NAVY, textAlign: "left", lineHeight: 1.4, maxWidth: 55,
      animation: { entrance: "slide-up", decorative: "none", loop: "none", speed: "normal", delay: "long" },
    }),
    originalPrice: defaultElementStyle({
      enabled: true, text: "Rs 5400/-", x: 5, y: 82, anchor: "start",
      fontSize: 22, fontWeight: 400, fontFamily: "sans", color: NAVY,
      textAlign: "left", strikethrough: true, maxWidth: 35,
      animation: { entrance: "slide-up", decorative: "none", loop: "none", speed: "normal", delay: "long" },
    }),
    currentPrice: defaultElementStyle({
      enabled: true, text: "Rs 2699/-", x: 5, y: 88, anchor: "start",
      fontSize: 48, fontWeight: 700, fontFamily: "sans", color: NAVY,
      textAlign: "left", nowPrefix: true, maxWidth: 60,
      animation: { entrance: "scale-bounce", decorative: "shimmer-sweep", loop: "none", speed: "slow", delay: "long" },
    }),
    countdown: defaultCountdownStyle(),
  };

  return { desktop, mobile };
}

function genId(): string { return "b" + Math.random().toString(36).slice(2, 14); }

function emptyBanner(): HeroBanner {
  return {
    id: genId(),
    image: "", imageMobile: "",
    title: "", subtitle: "", description: "",
    buttonLabel: "", buttonHref: "",
    buttonSecondaryLabel: "", buttonSecondaryHref: "",
    isActive: true, sortOrder: 0,
    overlayV2: emptyOverlayV2(),
    overlayDarkness: 0,
    stickers: [
      { enabled: false, kind: "50-off",        size: "lg",
        positionDesktop: { x: 95, y: 5,  anchor: "end"   },
        positionMobile:  { x: 95, y: 5,  anchor: "end"   } },
      { enabled: false, kind: "free-delivery", size: "md",
        positionDesktop: { x: 5,  y: 95, anchor: "start" },
        positionMobile:  { x: 5,  y: 95, anchor: "start" } },
    ],
  };
}

function ensureOverlayV2(banner: HeroBanner): HeroBanner {
  const patched: HeroBanner = { ...banner };

  if (!patched.overlayV2) patched.overlayV2 = emptyOverlayV2();
  if (!patched.overlayV2.desktop) patched.overlayV2.desktop = emptyOverlayConfig();
  if (!patched.overlayV2.mobile)  patched.overlayV2.mobile  = emptyOverlayConfig();

  (["desktop", "mobile"] as const).forEach((d) => {
    const cfg = patched.overlayV2![d] as OverlayConfig;

    (["brand", "tagline", "productDesc", "originalPrice", "currentPrice"] as ElementKey[]).forEach((k) => {
      if (!cfg[k]) {
        (cfg as unknown as Record<string, ElementStyle>)[k] = defaultElementStyle();
      }
      if (!cfg[k].animation) {
        cfg[k].animation = defaultAnimation();
      }
    });

    if (!cfg.countdown) {
      cfg.countdown = defaultCountdownStyle({
        enabled: !!banner.countdownEnabled,
        endsAt:  banner.countdownEndsAt ?? "",
      });
    }
    if (!cfg.countdown.animation) {
      cfg.countdown.animation = defaultAnimation();
    }
  });

  if (!patched.stickers) {
    patched.stickers = [
      { enabled: false, kind: "50-off",        size: "lg",
        positionDesktop: { x: 95, y: 5,  anchor: "end"   },
        positionMobile:  { x: 95, y: 5,  anchor: "end"   } },
      { enabled: false, kind: "free-delivery", size: "md",
        positionDesktop: { x: 5,  y: 95, anchor: "start" },
        positionMobile:  { x: 5,  y: 95, anchor: "start" } },
    ];
  } else {
    // migrate old stickers that only have corner+offset
    patched.stickers = patched.stickers.map(normalizeSticker);
  }

  return patched;
}

// ─── Upload helpers ──────────────────────────────────────
async function uploadImage(file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file); fd.append("type", "banner");
  const res  = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  return res.ok ? data.image.url : null;
}
async function uploadImageFromUrl(url: string): Promise<string | null> {
  const res = await fetch("/api/upload", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, type: "banner" }),
  });
  const data = await res.json();
  return res.ok ? data.image.url : url;
}
async function saveBanners(banners: HeroBanner[]): Promise<boolean> {
  try {
    const ordered = banners.map((b, i) => ({ ...b, sortOrder: i }));
    const res = await fetch("/api/hero-banners", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ banners: ordered }),
    });
    return res.ok;
  } catch { return false; }
}
async function saveRotationSetting(seconds: number): Promise<boolean> {
  try {
    const res = await fetch("/api/settings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: [{ key: "hero_rotation_seconds", value: String(seconds), category: "hero" }] }),
    });
    return res.ok;
  } catch { return false; }
}

interface Props {
  initialBanners:  HeroBanner[];
  initialRotation: number;
}

// ═══════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════
export function HeroBannersClient({ initialBanners, initialRotation }: Props) {
  const [banners,    setBanners]    = useState<HeroBanner[]>(initialBanners.map(ensureOverlayV2));
  const [rotation,   setRotation]   = useState<number>(initialRotation);
  const [savingRot,  setSavingRot]  = useState(false);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const toast   = useToastStore();
  const confirm = useConfirmStore();

  const persist = async (next: HeroBanner[], successMsg?: string) => {
    setBanners(next);
    const ok = await saveBanners(next);
    if (ok && successMsg) toast.success(successMsg);
    if (!ok) toast.error("Failed to save. Check your connection.");
  };

  const handleAdd  = () => { setEditingId(null); setModalOpen(true); };
  const handleEdit = (id: string) => { setEditingId(id); setModalOpen(true); };

  const handleModalSave = async (banner: HeroBanner) => {
    const next = editingId
      ? banners.map((b) => b.id === editingId ? banner : b)
      : [...banners, banner];
    setModalOpen(false);
    setEditingId(null);
    await persist(next, editingId ? "Banner updated" : "Banner added");
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm.confirm({
      title: "Delete Banner", message: "Are you sure? This cannot be undone.",
      confirmText: "Delete", variant: "danger",
    });
    if (!ok) return;
    await persist(banners.filter((b) => b.id !== id), "Banner deleted");
  };

  const handleToggleActive = async (id: string) => {
    const b = banners.find((x) => x.id === id);
    if (!b) return;
    const next = banners.map((x) => x.id === id ? { ...x, isActive: !x.isActive } : x);
    await persist(next, b.isActive ? "Banner hidden" : "Banner shown");
  };

  const handleSaveRotation = async () => {
    setSavingRot(true);
    const ok = await saveRotationSetting(rotation);
    setSavingRot(false);
    if (ok) toast.success("Rotation duration updated");
    else    toast.error("Failed to save");
  };

  const dragIndex = useRef<number | null>(null);
  const onDragStart = (i: number) => { dragIndex.current = i; };
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === i) return;
    const next = [...banners];
    const [moved] = next.splice(from, 1);
    next.splice(i, 0, moved);
    setBanners(next);
    dragIndex.current = i;
  };
  const onDragEnd = async () => {
    dragIndex.current = null;
    await persist(banners, "Order updated");
  };

  const editingBanner = editingId ? banners.find((b) => b.id === editingId) ?? null : null;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <ImageIcon size={22} className="text-[#E10600]" />
            Hero Banners
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            Manage the homepage hero slider ({banners.length} banner{banners.length === 1 ? "" : "s"})
          </p>
        </div>
        <button onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-[#E10600] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#B80000] transition-colors">
          <Plus size={16} />Add Banner
        </button>
      </div>

      <div className="bg-white border border-[#e5e7eb] p-5">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-10 h-10 rounded-full bg-[#f5f0e8] flex items-center justify-center flex-shrink-0">
            <Clock size={18} className="text-[#E10600]" />
          </div>
          <div className="flex-1 min-w-[220px]">
            <p className="text-sm font-bold text-[#1a1a1a]">Auto-Rotate Duration</p>
            <p className="text-xs text-[#6b7280] mt-0.5">How long each banner is shown before switching.</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={rotation} onChange={(e) => setRotation(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none bg-white">
              <option value={3}>3 seconds</option>
              <option value={5}>5 seconds</option>
              <option value={8}>8 seconds (recommended)</option>
              <option value={10}>10 seconds</option>
              <option value={15}>15 seconds</option>
              <option value={20}>20 seconds</option>
            </select>
            <button onClick={handleSaveRotation} disabled={savingRot}
              className="inline-flex items-center gap-1.5 bg-[#1a1a1a] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-[#E10600] transition-colors disabled:opacity-40">
              {savingRot ? <Loader size={12} className="animate-spin" /> : <Save size={12} />}
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
        <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <p className="font-semibold mb-1">Live preview with animations, and stickers you can drag anywhere</p>
          <p>
            Banner images now display at their natural aspect ratio — no cropping. Animations play live in the preview, and
            each sticker can be dragged and positioned independently for desktop and mobile.
          </p>
        </div>
      </div>

      {banners.length === 0 && (
        <div className="bg-white border border-dashed border-[#e5e7eb] p-16 text-center">
          <ImageIcon size={40} className="text-[#e5e7eb] mx-auto mb-4" />
          <p className="text-sm font-semibold text-[#1a1a1a] mb-1">No banners yet</p>
          <p className="text-xs text-[#6b7280] mb-5">Add your first hero banner.</p>
          <button onClick={handleAdd}
            className="inline-flex items-center gap-2 bg-[#E10600] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#B80000] transition-colors">
            <Plus size={16} />Add First Banner
          </button>
        </div>
      )}

      {banners.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map((banner, i) => (
            <BannerCard key={banner.id} banner={banner} index={i}
              onEdit={() => handleEdit(banner.id)}
              onDelete={() => handleDelete(banner.id)}
              onToggleActive={() => handleToggleActive(banner.id)}
              onView={() => setPreviewUrl(banner.image)}
              onDragStart={() => onDragStart(i)}
              onDragOver={(e) => onDragOver(e, i)}
              onDragEnd={onDragEnd}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <BannerModal banner={editingBanner} onSave={handleModalSave}
          onClose={() => { setModalOpen(false); setEditingId(null); }} />
      )}

      {previewUrl && <ImagePreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  BANNER CARD (uses natural aspect via img)
// ═══════════════════════════════════════════════════════════
function BannerCard({
  banner, index, onEdit, onDelete, onToggleActive, onView,
  onDragStart, onDragOver, onDragEnd,
}: {
  banner: HeroBanner; index: number;
  onEdit: () => void; onDelete: () => void; onToggleActive: () => void; onView: () => void;
  onDragStart: () => void; onDragOver: (e: React.DragEvent) => void; onDragEnd: () => void;
}) {
  const hasMobile = !!banner.imageMobile;
  const v2 = banner.overlayV2;
  const overlayHint = v2?.desktop
    ? (["brand", "tagline", "productDesc", "originalPrice", "currentPrice"] as ElementKey[])
        .filter((k) => v2.desktop[k]?.enabled && v2.desktop[k]?.text).length
    : 0;
  const stickerCount = banner.stickers?.filter((s) => s.enabled).length ?? 0;
  const hasCountdown = !!v2?.desktop?.countdown?.enabled;

  return (
    <div draggable onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}
      className={cn(
        "bg-white border border-[#e5e7eb] overflow-hidden transition-shadow hover:shadow-md cursor-move",
        !banner.isActive && "opacity-60"
      )}>
      <div className="relative aspect-[16/9] bg-[#111] overflow-hidden group" onClick={onView}>
        {banner.image ? (
          <Image src={banner.image} alt={banner.title || "Banner"} fill
            className="object-cover cursor-zoom-in"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={banner.image.startsWith("/uploads")} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={32} className="text-[#333]" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1">
          <GripVertical size={12} className="opacity-60" />#{index + 1}
        </div>
        {hasMobile && (
          <div className="absolute bottom-2 right-2 w-14 h-16 border-2 border-white shadow-lg overflow-hidden bg-black">
            <Image src={banner.imageMobile!} alt="Mobile" fill className="object-cover" sizes="56px"
              unoptimized={banner.imageMobile!.startsWith("/uploads")} />
          </div>
        )}
        {!banner.isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="bg-white/90 text-[#1a1a1a] text-xs font-bold uppercase tracking-wider px-3 py-1">Hidden</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-sm font-bold text-[#1a1a1a] truncate mb-1">
          {banner.title || v2?.desktop?.brand?.text || <span className="text-[#6b7280] font-normal italic">Untitled banner</span>}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {overlayHint > 0 && (
            <span className="text-[10px] text-[#E10600] font-semibold tracking-wide">
              {overlayHint} text element{overlayHint === 1 ? "" : "s"}
            </span>
          )}
          {stickerCount > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-[#dc2626] font-semibold tracking-wide">
              <Tag size={9} />{stickerCount} sticker{stickerCount === 1 ? "" : "s"}
            </span>
          )}
          {hasCountdown && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-[#059669] font-semibold tracking-wide">
              <Clock size={9} />Countdown
            </span>
          )}
        </div>
        <p className="text-xs text-[#6b7280] flex items-center gap-1 truncate mt-1">
          {banner.buttonHref ? (
            <><LinkIcon size={11} /><span className="truncate">{banner.buttonHref}</span></>
          ) : <span className="italic">No link</span>}
        </p>
      </div>

      <div className="grid grid-cols-3 border-t border-[#e5e7eb]">
        <button onClick={onView} disabled={!banner.image}
          className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-[#E10600] hover:bg-[#f5f0e8] transition-colors disabled:opacity-40">
          <Eye size={13} />View
        </button>
        <button onClick={onEdit}
          className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-[#1a1a1a] border-l border-r border-[#e5e7eb] hover:bg-[#fafaf9] transition-colors">
          <Edit size={13} />Edit
        </button>
        <button onClick={onDelete}
          className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">
          <Trash2 size={13} />Delete
        </button>
      </div>

      <button onClick={onToggleActive}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold border-t border-[#e5e7eb] transition-colors",
          banner.isActive ? "text-[#E10600] bg-[#f5f0e8]/40 hover:bg-[#f5f0e8]" : "text-[#6b7280] bg-[#fafaf9] hover:bg-[#f0f0f0]"
        )}>
        {banner.isActive ? <><EyeOff size={13} />Hide from Website</> : <><Eye size={13} />Show on Website</>}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  BANNER MODAL
// ═══════════════════════════════════════════════════════════
function BannerModal({ banner, onSave, onClose }: {
  banner: HeroBanner | null; onSave: (b: HeroBanner) => void; onClose: () => void;
}) {
  const [form, setForm]           = useState<HeroBanner>(banner ? ensureOverlayV2(banner) : emptyBanner());
  const [device, setDevice]       = useState<"desktop" | "mobile">("desktop");
  const [selectedEl, setSelectedEl] = useState<ElementKey | null>(null);
  const [selectedSticker, setSelectedSticker] = useState<number | null>(null);
  const [saving, setSaving]       = useState(false);
  const [animVersion, setAnimVersion] = useState(0);  // bump to replay animations
  const toast = useToastStore();

  // Auto-scroll to the corresponding card when an element/sticker
  // is selected via a preview click.
  useEffect(() => {
    if (selectedEl === null) return;
    const el = document.getElementById(`hero-element-card-${selectedEl}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedEl]);

  useEffect(() => {
    if (selectedSticker === null) return;
    const el = document.getElementById(`hero-sticker-card-${selectedSticker}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedSticker]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = orig; };
  }, []);

  const currentConfig = form.overlayV2![device];

  const updateElement = useCallback((key: ElementKey, patch: Partial<ElementStyle & CountdownStyle>, isAnimChange = false) => {
    setForm((prev) => ({
      ...prev,
      overlayV2: {
        ...prev.overlayV2!,
        [device]: {
          ...prev.overlayV2![device],
          [key]: { ...prev.overlayV2![device][key], ...patch },
        },
      },
    }));
    if (isAnimChange) setAnimVersion((v) => v + 1);
  }, [device]);

  const update = <K extends keyof HeroBanner>(field: K, value: HeroBanner[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateSticker = (idx: number, patch: Partial<Sticker>) => {
    setForm((prev) => {
      const next = [...(prev.stickers ?? [])];
      next[idx] = normalizeSticker({ ...next[idx], ...patch });
      return { ...prev, stickers: next };
    });
  };

  const updateStickerPosition = (idx: number, pos: Partial<StickerPosition>) => {
    setForm((prev) => {
      const next = [...(prev.stickers ?? [])];
      const s    = normalizeSticker(next[idx]);
      const posKey = device === "desktop" ? "positionDesktop" : "positionMobile";
      next[idx]  = { ...s, [posKey]: { ...s[posKey]!, ...pos } };
      return { ...prev, stickers: next };
    });
  };

  const handleSubmit = () => {
    if (!form.image) { toast.error("Please add a desktop banner image"); return; }
    setSaving(true);
    onSave(form);
  };

  const handleLoadReference = () => {
    setForm((prev) => ({ ...prev, overlayV2: referenceDesignPreset() }));
    setAnimVersion((v) => v + 1);
    toast.success("Reference design loaded");
  };

  const handleReplay = () => setAnimVersion((v) => v + 1);

  const isEditing = !!banner;

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[95] flex items-center justify-center p-2 sm:p-4 pointer-events-none">
        <div className="w-full max-w-7xl max-h-[95vh] flex flex-col bg-white shadow-2xl pointer-events-auto overflow-hidden">

          <div className="flex items-center justify-between px-6 py-4 bg-[#1a1a1a] text-white flex-shrink-0">
            <div className="flex items-center gap-4">
              <h3 className="text-base font-bold">{isEditing ? "Edit Banner" : "Add New Banner"}</h3>
              <button type="button" onClick={handleLoadReference}
                className="inline-flex items-center gap-1.5 bg-[#E10600] text-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider hover:bg-[#B80000] transition-colors">
                <Sparkles size={12} />Load Reference Design
              </button>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded"><X size={18} /></button>
          </div>

          <div className="flex-shrink-0 border-b border-[#e5e7eb] bg-[#fafaf9] px-6 py-2 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mr-2">Editing:</span>
            <button type="button" onClick={() => { setDevice("desktop"); setSelectedEl(null); setSelectedSticker(null); setAnimVersion((v) => v + 1); }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border transition-colors",
                device === "desktop" ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#1a1a1a]"
              )}>
              <Monitor size={13} />Desktop
            </button>
            <button type="button" onClick={() => { setDevice("mobile"); setSelectedEl(null); setSelectedSticker(null); setAnimVersion((v) => v + 1); }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border transition-colors",
                device === "mobile" ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#1a1a1a]"
              )}>
              <Smartphone size={13} />Mobile
            </button>
            <span className="ml-auto text-[10px] text-[#6b7280] flex items-center gap-1">
              <MousePointer2 size={10} />Click preview to select · <Move size={10} />Drag to reposition
            </span>
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-[minmax(0,42%)_minmax(0,58%)]">
            <div className="p-5 space-y-4 border-r border-[#e5e7eb]">
              <div className="grid grid-cols-2 gap-3">
                <ImageSlot label="Desktop *" icon={Monitor} helpText="Any aspect (no cropping)" aspectClass="aspect-[16/9]"
                  value={form.image} required onChange={(url) => update("image", url)} />
                <ImageSlot label="Mobile" icon={Smartphone} helpText="Any aspect (no cropping)" aspectClass="aspect-[4/5]"
                  value={form.imageMobile ?? ""} onChange={(url) => update("imageMobile", url)} />
              </div>

              {/* Stickers */}
              <div className="border border-[#e5e7eb] bg-white">
                <div className="p-3 border-b border-[#e5e7eb] flex items-center gap-2 bg-[#fafaf9]">
                  <Tag size={13} className="text-[#dc2626]" />
                  <span className="text-xs font-bold uppercase tracking-wide text-[#1a1a1a] flex-1">Promotional Stickers</span>
                  <span className="text-[10px] text-[#6b7280]">Drag on preview to position</span>
                </div>
                <div className="p-3 space-y-2">
                  {(form.stickers ?? []).map((s, i) => (
                    <StickerCard
                      key={i}
                      index={i}
                      sticker={normalizeSticker(s)}
                      device={device}
                      isSelected={selectedSticker === i}
                      onToggleSelect={() => setSelectedSticker(selectedSticker === i ? null : i)}
                      onUpdate={(patch) => updateSticker(i, patch)}
                      onUpdatePosition={(pos) => updateStickerPosition(i, pos)}
                    />
                  ))}
                </div>
              </div>

              {/* Text elements */}
              <div className="space-y-2">
                {ELEMENT_ORDER.map((key) => (
                  <ElementCard
                    key={key}
                    elementKey={key}
                    style={currentConfig[key]}
                    isSelected={selectedEl === key}
                    onToggleSelect={() => { setSelectedEl(selectedEl === key ? null : key); setSelectedSticker(null); }}
                    onUpdate={updateElement}
                  />
                ))}
              </div>

              {/* Global banner settings */}
              <div className="border border-[#e5e7eb] p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[#1a1a1a]">Banner Settings</p>
                <div>
                  <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">
                    Overlay Darkness: {form.overlayDarkness ?? 0}%
                  </label>
                  <input type="range" min={0} max={80} step={5}
                    value={form.overlayDarkness ?? 0}
                    onChange={(e) => update("overlayDarkness", Number(e.target.value))}
                    className="w-full accent-[#E10600]" />
                </div>
                <Field label="Alt Text (SEO)" placeholder="e.g. Summer Collection"
                  value={form.title} onChange={(v) => update("title", v)} />
                <Field label="Link URL (whole banner is clickable)" placeholder="/shop or https://..."
                  value={form.buttonHref} onChange={(v) => update("buttonHref", v)} />
                <label className={cn(
                  "flex items-center gap-2 p-2 border cursor-pointer transition-colors",
                  form.isActive ? "bg-[#f5f0e8]/40 border-[#E10600]" : "bg-[#fafaf9] border-[#e5e7eb]"
                )}>
                  <input type="checkbox" checked={form.isActive}
                    onChange={(e) => update("isActive", e.target.checked)}
                    className="w-4 h-4 accent-[#E10600]" />
                  <span className="text-xs font-semibold text-[#1a1a1a]">
                    {form.isActive ? "Active on website" : "Hidden (draft)"}
                  </span>
                </label>
              </div>
            </div>

            <div className="p-5 bg-[#fafaf9] sticky top-0 self-start">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] flex items-center gap-1.5">
                  <Eye size={13} className="text-[#E10600]" />Live Preview
                  <span className="text-[10px] font-normal text-[#6b7280] normal-case">
                    ({device === "desktop" ? "Desktop" : "Mobile"})
                  </span>
                </p>
                <button type="button" onClick={handleReplay}
                  className="inline-flex items-center gap-1 bg-[#1a1a1a] text-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider hover:bg-[#E10600] transition-colors">
                  <Play size={10} />Replay
                </button>
              </div>

              <LivePreview
                banner={form}
                device={device}
                selectedEl={selectedEl}
                selectedSticker={selectedSticker}
                onSelectElement={(k) => { setSelectedEl(k); if (k) setSelectedSticker(null); }}
                onSelectSticker={(i) => { setSelectedSticker(i); if (i !== null) setSelectedEl(null); }}
                onMoveElement={(key, x, y) => updateElement(key, { x, y })}
                onMoveSticker={(i, x, y) => updateStickerPosition(i, { x, y })}
                animVersion={animVersion}
              />

              <p className="text-[10px] text-[#6b7280] mt-3 text-center italic">
                Click text or stickers to select. Drag to reposition. Change animation options to auto-replay, or click Replay.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-4 bg-[#fafaf9] border-t border-[#e5e7eb] flex-shrink-0">
            <button onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b7280] hover:text-[#1a1a1a] border border-[#e5e7eb] hover:border-[#1a1a1a] transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving || !form.image}
              className="inline-flex items-center gap-2 bg-[#E10600] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#B80000] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {saving ? <><Loader size={12} className="animate-spin" />Saving...</> :
                isEditing ? <><Edit size={12} />Update Banner</> : <><Plus size={12} />Add Banner</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  Sticker card (in the form)
// ═══════════════════════════════════════════════════════════
function StickerCard({ sticker, index, device, isSelected, onToggleSelect, onUpdate, onUpdatePosition }: {
  sticker: Sticker;
  index: number;
  device: "desktop" | "mobile";
  isSelected: boolean;
  onToggleSelect: () => void;
  onUpdate: (patch: Partial<Sticker>) => void;
  onUpdatePosition: (pos: Partial<StickerPosition>) => void;
}) {
  const cardId = `hero-sticker-card-${index}`;
  const kind = STICKER_KINDS.find((k) => k.value === sticker.kind)!;
  const pos  = (device === "desktop" ? sticker.positionDesktop : sticker.positionMobile) ?? cornerToPosition(sticker.corner);

  return (
    <div id={cardId} className={cn(
      "border transition-colors scroll-mt-4",
      isSelected ? "border-[#E10600] bg-[#f5f0e8]/30" : "border-[#e5e7eb] bg-white"
    )}>
      <div className="flex items-center gap-3 p-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={sticker.enabled}
            onChange={(e) => onUpdate({ enabled: e.target.checked })}
            className="w-4 h-4 accent-[#E10600]" />
        </label>

        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white border border-[#e5e7eb]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={kind.src} alt={kind.label} className="max-w-full max-h-full object-contain" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[#1a1a1a]">{kind.label}</p>
          {sticker.enabled && (
            <p className="text-[10px] text-[#6b7280]">
              {device === "desktop" ? "Desktop" : "Mobile"}: {pos.x}%, {pos.y}%
            </p>
          )}
        </div>

        {sticker.enabled && (
          <button type="button" onClick={onToggleSelect}
            className="text-[10px] font-mono text-[#6b7280] hover:text-[#1a1a1a]">
            {isSelected ? "▼" : "▶"}
          </button>
        )}
      </div>

      {sticker.enabled && isSelected && (
        <div className="p-3 pt-0 space-y-2 border-t border-[#e5e7eb]">
          <div>
            <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Size</label>
            <div className="grid grid-cols-4 gap-1">
              {(["sm", "md", "lg", "xl"] as StickerSize[]).map((sz) => (
                <button key={sz} type="button" onClick={() => onUpdate({ size: sz })}
                  className={cn(
                    "py-1.5 text-[10px] font-semibold uppercase border transition-colors",
                    sticker.size === sz ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "bg-white text-[#6b7280] border-[#e5e7eb]"
                  )}>
                  {sz === "sm" ? "Small" : sz === "md" ? "Medium" : sz === "lg" ? "Large" : "XL"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">X: {pos.x}%</label>
              <input type="range" min={0} max={100} step={1} value={pos.x}
                onChange={(e) => onUpdatePosition({ x: Number(e.target.value) })}
                className="w-full accent-[#E10600]" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Y: {pos.y}%</label>
              <input type="range" min={0} max={100} step={1} value={pos.y}
                onChange={(e) => onUpdatePosition({ y: Number(e.target.value) })}
                className="w-full accent-[#E10600]" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Anchor</label>
            <div className="grid grid-cols-3 gap-1">
              {(["start", "center", "end"] as const).map((a) => (
                <button key={a} type="button" onClick={() => onUpdatePosition({ anchor: a })}
                  className={cn(
                    "py-1.5 text-[10px] font-semibold uppercase border transition-colors",
                    pos.anchor === a ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "bg-white text-[#6b7280] border-[#e5e7eb]"
                  )}>
                  {a === "start" ? "◀ Left" : a === "center" ? "◀▶ Center" : "Right ▶"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ElementCard
// ═══════════════════════════════════════════════════════════
const COLOR_PRESETS = ["#1a2b5c", "#1a1a1a", "#ffffff", "#E10600", "#dc2626", "#059669", "#f59e0b"];

const ANIMATION_FIELDS = new Set(["animation"]);

function ElementCard({ elementKey, style, isSelected, onToggleSelect, onUpdate }: {
  elementKey: ElementKey;
  style: ElementStyle | CountdownStyle;
  isSelected: boolean;
  onToggleSelect: () => void;
  onUpdate: (key: ElementKey, patch: Partial<ElementStyle & CountdownStyle>, isAnimChange?: boolean) => void;
}) {
  const cardId = `hero-element-card-${elementKey}`;
  const isPrice     = elementKey === "currentPrice";
  const isOriginal  = elementKey === "originalPrice";
  const isTagline   = elementKey === "tagline";
  const isCountdown = elementKey === "countdown";
  const cd          = style as CountdownStyle;

  const patch = (p: Partial<ElementStyle & CountdownStyle>, isAnim = false) => onUpdate(elementKey, p, isAnim);

  return (
    <div id={cardId} className={cn(
      "border transition-colors scroll-mt-4",
      isSelected ? "border-[#E10600] bg-[#f5f0e8]/30 shadow-sm" : "border-[#e5e7eb] bg-white"
    )}>
      <button type="button" onClick={onToggleSelect}
        className="w-full flex items-center gap-2 p-3 hover:bg-[#fafaf9] transition-colors">
        <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={style.enabled}
            onChange={(e) => patch({ enabled: e.target.checked })}
            className="w-4 h-4 accent-[#E10600]" />
        </label>
        {isCountdown ? <Clock size={13} className={style.enabled ? "text-[#E10600]" : "text-[#6b7280]"} /> :
                       <Type size={13} className={style.enabled ? "text-[#E10600]" : "text-[#6b7280]"} />}
        <span className={cn(
          "text-xs font-bold uppercase tracking-wide flex-1 text-left",
          style.enabled ? "text-[#1a1a1a]" : "text-[#6b7280]"
        )}>
          {ELEMENT_LABELS[elementKey]}
        </span>
        {!isCountdown && style.text && (
          <span className="text-[10px] text-[#6b7280] italic truncate max-w-[120px]">
            &ldquo;{style.text.slice(0, 30)}{style.text.length > 30 ? "..." : ""}&rdquo;
          </span>
        )}
        {isCountdown && cd.endsAt && (
          <span className="text-[10px] text-[#6b7280] italic truncate max-w-[120px]">
            {new Date(cd.endsAt).toLocaleDateString()}
          </span>
        )}
        <span className="text-[10px] font-mono text-[#6b7280]">{isSelected ? "▼" : "▶"}</span>
      </button>

      {isSelected && (
        <div className="p-3 pt-0 space-y-3 border-t border-[#e5e7eb]">
          {isCountdown ? (
            <div>
              <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Ends At</label>
              <input type="datetime-local" value={cd.endsAt ?? ""}
                onChange={(e) => patch({ endsAt: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none" />
            </div>
          ) : isTagline ? (
            <div>
              <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">
                Content (press Enter for line break)
              </label>
              <textarea rows={3} value={style.text} onChange={(e) => patch({ text: e.target.value })}
                placeholder="Timeless Comfort.&#10;Effortless Style."
                className="w-full px-3 py-2 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none resize-none" />
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Content</label>
              <input type="text" value={style.text} onChange={(e) => patch({ text: e.target.value })}
                placeholder="Enter text..."
                className="w-full px-3 py-2 text-sm border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none" />
            </div>
          )}

          {/* Position */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">X: {style.x}%</label>
              <input type="range" min={0} max={100} step={1} value={style.x}
                onChange={(e) => patch({ x: Number(e.target.value) })}
                className="w-full accent-[#E10600]" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Y: {style.y}%</label>
              <input type="range" min={0} max={100} step={1} value={style.y}
                onChange={(e) => patch({ y: Number(e.target.value) })}
                className="w-full accent-[#E10600]" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Anchor</label>
            <div className="grid grid-cols-3 gap-1">
              {(["start", "center", "end"] as const).map((a) => (
                <button key={a} type="button" onClick={() => patch({ anchor: a })}
                  className={cn(
                    "py-1.5 text-[10px] font-semibold uppercase border transition-colors",
                    style.anchor === a ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "bg-white text-[#6b7280] border-[#e5e7eb]"
                  )}>
                  {a === "start" ? "◀ Left" : a === "center" ? "◀▶ Center" : "Right ▶"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Font Size: {style.fontSize}px</label>
              <input type="range" min={12} max={120} step={2} value={style.fontSize}
                onChange={(e) => patch({ fontSize: Number(e.target.value) })}
                className="w-full accent-[#E10600]" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Weight</label>
              <select value={style.fontWeight} onChange={(e) => patch({ fontWeight: Number(e.target.value) })}
                className="w-full px-2 py-1.5 text-xs border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none">
                <option value={300}>Light (300)</option>
                <option value={400}>Regular (400)</option>
                <option value={500}>Medium (500)</option>
                <option value={600}>Semibold (600)</option>
                <option value={700}>Bold (700)</option>
                <option value={800}>Extrabold (800)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Font Family</label>
              <div className="grid grid-cols-2 gap-1">
                <button type="button" onClick={() => patch({ fontFamily: "serif" })}
                  className={cn(
                    "py-1.5 text-[10px] font-semibold border transition-colors",
                    style.fontFamily === "serif" ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "bg-white text-[#6b7280] border-[#e5e7eb]"
                  )} style={{ fontFamily: "Georgia, serif" }}>Serif</button>
                <button type="button" onClick={() => patch({ fontFamily: "sans" })}
                  className={cn(
                    "py-1.5 text-[10px] font-semibold border transition-colors",
                    style.fontFamily === "sans" ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "bg-white text-[#6b7280] border-[#e5e7eb]"
                  )}>Sans</button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Color</label>
              <div className="flex items-center gap-1">
                <input type="color" value={style.color}
                  onChange={(e) => patch({ color: e.target.value })}
                  className="h-8 w-8 cursor-pointer border border-[#e5e7eb]" />
                <input type="text" value={style.color}
                  onChange={(e) => patch({ color: e.target.value })}
                  className="flex-1 min-w-0 px-2 py-1.5 text-[10px] font-mono border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none" />
              </div>
              <div className="flex gap-1 mt-1">
                {COLOR_PRESETS.map((c) => (
                  <button key={c} type="button" onClick={() => patch({ color: c })} title={c}
                    className={cn(
                      "w-4 h-4 border transition-transform hover:scale-110",
                      style.color.toLowerCase() === c.toLowerCase() ? "border-[#1a1a1a] border-2" : "border-[#e5e7eb]"
                    )}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Line Height: {style.lineHeight}</label>
              <input type="range" min={0.8} max={2} step={0.05} value={style.lineHeight}
                onChange={(e) => patch({ lineHeight: Number(e.target.value) })}
                className="w-full accent-[#E10600]" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Letter Space: {style.letterSpacing.toFixed(2)}em</label>
              <input type="range" min={-0.05} max={0.2} step={0.01} value={style.letterSpacing}
                onChange={(e) => patch({ letterSpacing: Number(e.target.value) })}
                className="w-full accent-[#E10600]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Max Width: {style.maxWidth}%</label>
              <input type="range" min={10} max={100} step={5} value={style.maxWidth}
                onChange={(e) => patch({ maxWidth: Number(e.target.value) })}
                className="w-full accent-[#E10600]" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Text Align</label>
              <div className="grid grid-cols-3 gap-1">
                {(["left", "center", "right"] as const).map((a) => (
                  <button key={a} type="button" onClick={() => patch({ textAlign: a })}
                    className={cn(
                      "py-1.5 text-[10px] font-semibold uppercase border transition-colors",
                      style.textAlign === a ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "bg-white text-[#6b7280] border-[#e5e7eb]"
                    )}>{a[0].toUpperCase()}</button>
                ))}
              </div>
            </div>
          </div>

          {isCountdown && (
            <div className="border-t border-[#e5e7eb] pt-3 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#E10600]">Countdown Style</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Digit Style</label>
                  <select value={cd.digitStyle ?? "minimal"}
                    onChange={(e) => patch({ digitStyle: e.target.value as "minimal" | "boxed" | "pill" })}
                    className="w-full px-2 py-1.5 text-xs border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none">
                    <option value="minimal">Minimal</option>
                    <option value="boxed">Boxed</option>
                    <option value="pill">Pill</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Label Style</label>
                  <select value={cd.labelStyle ?? "below"}
                    onChange={(e) => patch({ labelStyle: e.target.value as "below" | "beside" | "none" })}
                    className="w-full px-2 py-1.5 text-xs border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none">
                    <option value="below">Below</option>
                    <option value="beside">Beside</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Separator</label>
                  <select value={cd.separator ?? "none"}
                    onChange={(e) => patch({ separator: e.target.value as "colon" | "space" | "none" })}
                    className="w-full px-2 py-1.5 text-xs border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none">
                    <option value="none">Spacing</option>
                    <option value="colon">Colon</option>
                    <option value="space">Wide space</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Border Radius: {cd.borderRadius ?? 0}px</label>
                  <input type="range" min={0} max={30} step={1} value={cd.borderRadius ?? 0}
                    onChange={(e) => patch({ borderRadius: Number(e.target.value) })}
                    className="w-full accent-[#E10600]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Background Color</label>
                  <input type="color" value={cd.bgColor ?? "#000000"}
                    onChange={(e) => patch({ bgColor: e.target.value })}
                    className="h-8 w-full cursor-pointer border border-[#e5e7eb]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">BG Opacity: {cd.bgOpacity ?? 60}%</label>
                  <input type="range" min={0} max={100} step={5} value={cd.bgOpacity ?? 60}
                    onChange={(e) => patch({ bgOpacity: Number(e.target.value) })}
                    className="w-full accent-[#E10600]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Padding X: {cd.paddingX ?? 12}px</label>
                  <input type="range" min={0} max={40} step={1} value={cd.paddingX ?? 12}
                    onChange={(e) => patch({ paddingX: Number(e.target.value) })}
                    className="w-full accent-[#E10600]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Padding Y: {cd.paddingY ?? 8}px</label>
                  <input type="range" min={0} max={40} step={1} value={cd.paddingY ?? 8}
                    onChange={(e) => patch({ paddingY: Number(e.target.value) })}
                    className="w-full accent-[#E10600]" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(["showDays", "showHours", "showMinutes", "showSeconds"] as const).map((k) => (
                  <label key={k} className="flex items-center gap-1.5 text-[10px] font-semibold text-[#1a1a1a] cursor-pointer">
                    <input type="checkbox" checked={cd[k] ?? true}
                      onChange={(e) => patch({ [k]: e.target.checked })}
                      className="w-3.5 h-3.5 accent-[#E10600]" />
                    {k.replace("show", "")}
                  </label>
                ))}
              </div>
            </div>
          )}

          {!isCountdown && (
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-1.5 text-[10px] font-semibold text-[#1a1a1a] cursor-pointer">
                <input type="checkbox" checked={style.textShadow}
                  onChange={(e) => patch({ textShadow: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#E10600]" />Shadow
              </label>
              <label className="flex items-center gap-1.5 text-[10px] font-semibold text-[#1a1a1a] cursor-pointer">
                <input type="checkbox" checked={style.uppercase}
                  onChange={(e) => patch({ uppercase: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#E10600]" />UPPERCASE
              </label>
              {isOriginal && (
                <label className="flex items-center gap-1.5 text-[10px] font-semibold text-[#1a1a1a] cursor-pointer">
                  <input type="checkbox" checked={style.strikethrough}
                    onChange={(e) => patch({ strikethrough: e.target.checked })}
                    className="w-3.5 h-3.5 accent-[#E10600]" />Strikethrough
                </label>
              )}
              {isPrice && (
                <label className="flex items-center gap-1.5 text-[10px] font-semibold text-[#1a1a1a] cursor-pointer">
                  <input type="checkbox" checked={style.nowPrefix}
                    onChange={(e) => patch({ nowPrefix: e.target.checked })}
                    className="w-3.5 h-3.5 accent-[#E10600]" />&ldquo;NOW&rdquo; Prefix
                </label>
              )}
            </div>
          )}

          {/* Animations */}
          <div className="border-t border-[#e5e7eb] pt-3 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#E10600] flex items-center gap-1">
              <Zap size={11} />Animations (live in preview)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Entrance</label>
                <select value={style.animation?.entrance ?? "slide-up"}
                  onChange={(e) => patch({ animation: { ...style.animation!, entrance: e.target.value as EntranceAnim } }, true)}
                  className="w-full px-2 py-1.5 text-xs border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none">
                  <option value="none">None</option>
                  <option value="fade-in">Fade In</option>
                  <option value="slide-up">Slide Up</option>
                  <option value="slide-down">Slide Down</option>
                  <option value="slide-left">Slide Left</option>
                  <option value="slide-right">Slide Right</option>
                  <option value="scale-in">Scale In</option>
                  <option value="scale-bounce">Scale Bounce</option>
                  <option value="blur-in">Blur In</option>
                  <option value="mask-reveal">Mask Reveal ⭐</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Decorative Accent</label>
                <select value={style.animation?.decorative ?? "none"}
                  onChange={(e) => patch({ animation: { ...style.animation!, decorative: e.target.value as DecorativeAcc } }, true)}
                  className="w-full px-2 py-1.5 text-xs border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none">
                  <option value="none">None</option>
                  <option value="underline-draw">Underline Draw</option>
                  <option value="accent-bar-left">Left Accent Bar</option>
                  <option value="shimmer-sweep">Shimmer Sweep ✨</option>
                  <option value="accent-dots">Accent Dots</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Speed</label>
                <select value={style.animation?.speed ?? "normal"}
                  onChange={(e) => patch({ animation: { ...style.animation!, speed: e.target.value as Speed } }, true)}
                  className="w-full px-2 py-1.5 text-xs border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none">
                  <option value="fast">Fast</option>
                  <option value="normal">Normal</option>
                  <option value="slow">Slow</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Delay</label>
                <select value={style.animation?.delay ?? "short"}
                  onChange={(e) => patch({ animation: { ...style.animation!, delay: e.target.value as DelayLevel } }, true)}
                  className="w-full px-2 py-1.5 text-xs border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none">
                  <option value="immediate">Immediate</option>
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">Loop</label>
                <select value={style.animation?.loop ?? "none"}
                  onChange={(e) => patch({ animation: { ...style.animation!, loop: e.target.value as LoopAnim } }, true)}
                  className="w-full px-2 py-1.5 text-xs border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none">
                  <option value="none">None</option>
                  <option value="float-soft">Float</option>
                  <option value="pulse-glow">Pulse Glow</option>
                  <option value="breathe">Breathe</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

void ANIMATION_FIELDS;

// ═══════════════════════════════════════════════════════════
//  Live preview — natural aspect + LIVE animations + movable stickers
// ═══════════════════════════════════════════════════════════
function animationCSS(anim: AnimationConfig | undefined, replaySeed = 0): {
  entranceStyle: React.CSSProperties;
  decoDelay:     number;
} {
  const a = anim ?? defaultAnimation();
  const durMs = SPEED_MS[a.speed] + (replaySeed % 2);
  const delMs = DELAY_MS[a.delay];
  const hasEntrance = a.entrance !== "none";
  const hasLoop     = a.loop     !== "none";

  const parts: string[] = [];
  if (hasEntrance) {
    parts.push(`hero-${a.entrance} ${durMs}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delMs}ms both`);
  }
  if (hasLoop) {
    const loopDur = a.loop === "float-soft" ? 4 : 3;
    const loopDelay = hasEntrance ? delMs + durMs : 0;
    parts.push(`hero-${a.loop} ${loopDur}s ease-in-out infinite ${loopDelay}ms`);
  }

  if (parts.length === 0) {
    return { entranceStyle: {}, decoDelay: 0 };
  }

  return {
    entranceStyle: { animation: parts.join(", ") },
    decoDelay:     hasEntrance ? delMs + durMs + 100 : 0,
  };
}

function LivePreview({
  banner, device, selectedEl, selectedSticker,
  onSelectElement, onSelectSticker,
  onMoveElement, onMoveSticker,
  animVersion,
}: {
  banner: HeroBanner;
  device: "desktop" | "mobile";
  selectedEl: ElementKey | null;
  selectedSticker: number | null;
  onSelectElement: (key: ElementKey | null) => void;
  onSelectSticker: (index: number | null) => void;
  onMoveElement: (key: ElementKey, x: number, y: number) => void;
  onMoveSticker: (idx: number, x: number, y: number) => void;
  animVersion: number;
}) {
  // ── ALL HOOKS MUST BE AT THE TOP (before any early return) ──
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<PreviewDragKey | null>(null);
  const [imgAspect, setImgAspect] = useState<number>(16 / 9);
  const [previewWidth, setPreviewWidth] = useState(0);
  const dragStartRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);

  const imageUrl = device === "mobile" ? (banner.imageMobile || banner.image) : banner.image;
  const config   = banner.overlayV2?.[device];

  // Detect natural aspect ratio from loaded image
  useEffect(() => {
    if (!imageUrl) return;
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setImgAspect(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Measure preview width so font scaling matches real site
  useEffect(() => {
    if (!containerRef.current) return;
    const measure = () => {
      if (containerRef.current) setPreviewWidth(containerRef.current.clientWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Global mouse listeners for dragging
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      const start = dragStartRef.current;
      if (!rect || !start) return;
      const dxPct = ((e.clientX - start.x) / rect.width)  * 100;
      const dyPct = ((e.clientY - start.y) / rect.height) * 100;
      const newX = Math.max(0, Math.min(100, Math.round(start.startX + dxPct)));
      const newY = Math.max(0, Math.min(100, Math.round(start.startY + dyPct)));
      if (dragging.kind === "el")      onMoveElement(dragging.key, newX, newY);
      else                              onMoveSticker(dragging.index, newX, newY);
    };
    const onUp = () => { setDragging(null); dragStartRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, [dragging, onMoveElement, onMoveSticker]);

  const startDrag = (e: React.MouseEvent, target: PreviewDragKey) => {
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    let startX = 0, startY = 0;
    if (target.kind === "el" && config) {
      const el = config[target.key];
      startX = el.x; startY = el.y;
      onSelectElement(target.key);
    } else if (target.kind === "sticker") {
      const s = normalizeSticker((banner.stickers ?? [])[target.index]);
      const pos = (device === "desktop" ? s.positionDesktop : s.positionMobile)!;
      startX = pos.x; startY = pos.y;
      onSelectSticker(target.index);
    }
    dragStartRef.current = { x: e.clientX, y: e.clientY, startX, startY };
    setDragging(target);
  };

  // ── EARLY RETURN NOW SAFE (all hooks already called above) ──
  if (!imageUrl) {
    return (
      <div className="aspect-[16/9] bg-[#1a1a1a] flex items-center justify-center text-[#6b7280] text-xs">
        Upload a {device} image to see the preview
      </div>
    );
  }

  // Font scaling: match actual site rendering (fonts scale with banner width).
  // Reference widths: 1920 for desktop, 480 for mobile.
  const referenceWidth = device === "desktop" ? 1920 : 480;
  const scale = previewWidth > 0 ? previewWidth / referenceWidth : 0.42;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-[#111] border border-[#e5e7eb] select-none",
        dragging && "cursor-grabbing"
      )}
      style={{ aspectRatio: imgAspect }}
      onClick={() => { onSelectElement(null); onSelectSticker(null); }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false} />

      {banner.overlayDarkness !== undefined && banner.overlayDarkness > 0 && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: `rgba(0,0,0,${banner.overlayDarkness / 100})` }} />
      )}

      {/* Text elements + countdown */}
      {config && ELEMENT_ORDER.map((key) => {
        const el = config[key];
        if (!el.enabled) return null;
        if (key !== "countdown" && !el.text.trim()) return null;
        if (key === "countdown" && !(el as CountdownStyle).endsAt) return null;

        if (key === "countdown") {
          return (
            <PreviewCountdown
              key="cd"
              style={el as CountdownStyle}
              scale={scale}
              isSelected={selectedEl === "countdown"}
              isDragging={dragging?.kind === "el" && dragging.key === "countdown"}
              onMouseDown={(e) => startDrag(e, { kind: "el", key: "countdown" })}
              animVersion={animVersion}
            />
          );
        }
        return (
          <PreviewElement
            key={key}
            elementKey={key}
            style={el}
            scale={scale}
            isSelected={selectedEl === key}
            isDragging={dragging?.kind === "el" && dragging.key === key}
            onMouseDown={(e) => startDrag(e, { kind: "el", key })}
            animVersion={animVersion}
          />
        );
      })}

      {/* Stickers */}
      {(banner.stickers ?? []).map((raw, i) => {
        const s = normalizeSticker(raw);
        if (!s.enabled) return null;
        return (
          <PreviewSticker
            key={`sticker-${i}`}
            sticker={s}
            device={device}
            scale={scale}
            isSelected={selectedSticker === i}
            isDragging={dragging?.kind === "sticker" && dragging.index === i}
            onMouseDown={(e) => startDrag(e, { kind: "sticker", index: i })}
            animVersion={animVersion}
          />
        );
      })}
    </div>
  );
}
// ─── Preview element ──────────────────────────────────────
function PreviewElement({ elementKey, style, scale, isSelected, isDragging, onMouseDown, animVersion }: {
  elementKey: ElementKey; style: ElementStyle; scale: number;
  isSelected: boolean; isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  animVersion: number;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const decoRefs = useRef<Array<HTMLElement | null>>([]);

  const translateX = style.anchor === "center" ? "-50%" : style.anchor === "end" ? "-100%" : "0";
  const fontVar = style.fontFamily === "serif" ? "Georgia, 'Playfair Display', serif" : "system-ui, sans-serif";
  const isPrice    = elementKey === "currentPrice";
  const isOriginal = elementKey === "originalPrice";
  const { decoDelay } = animationCSS(style.animation);
  const deco = style.animation?.decorative ?? "none";

  // Build animation string WITHOUT applying it via React style.
  // We apply it purely imperatively so browser sees a real "reset".
  const anim = style.animation ?? defaultAnimation();
  const durMs = SPEED_MS[anim.speed];
  const delMs = DELAY_MS[anim.delay];
  const hasEntrance = anim.entrance !== "none";
  const hasLoop     = anim.loop     !== "none";

  const animParts: string[] = [];
  if (hasEntrance) {
    animParts.push(`hero-${anim.entrance} ${durMs}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delMs}ms both`);
  }
  if (hasLoop) {
    const loopDur   = anim.loop === "float-soft" ? 4 : 3;
    const loopDelay = hasEntrance ? delMs + durMs : 0;
    animParts.push(`hero-${anim.loop} ${loopDur}s ease-in-out infinite ${loopDelay}ms`);
  }
  const animCss = animParts.join(", ");

  const scaled = Math.max(6, Math.round(style.fontSize * scale));

  // ── Apply animation imperatively on mount + every animVersion change ──
  // We do NOT put `animation` in React's style prop. That way React never
  // re-renders it, and we have full control over restart.
  useEffect(() => {
    if (!outerRef.current) return;
    const el = outerRef.current;

    if (!animCss) {
      el.style.animation = "";
      return;
    }

    // Kill any running animation
    el.style.animation = "none";
    // Force reflow (browser MUST commit the "none" before we reapply)
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    void el.offsetWidth;
    // Reapply in the next frame so browser treats it as a fresh animation
    const rafId = requestAnimationFrame(() => {
      if (el) el.style.animation = animCss;
    });

    return () => cancelAnimationFrame(rafId);
  }, [animVersion, animCss]);

  // ── Same treatment for decorative accents ──
  useEffect(() => {
    decoRefs.current.forEach((d) => {
      if (!d) return;
      const computed = window.getComputedStyle(d);
      const currentAnim = computed.animation;
      if (!currentAnim || currentAnim === "none") return;
      d.style.animation = "none";
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      void d.offsetWidth;
      requestAnimationFrame(() => {
        // Clear inline so the stylesheet/element-level animation from JSX takes over again
        d.style.animation = "";
      });
    });
  }, [animVersion, deco]);

  const content = isPrice && style.nowPrefix ? (
    <span className="inline-flex items-baseline gap-2">
      <span style={{
        fontSize: `${Math.round(scaled * 0.55)}px`, fontWeight: 600,
        letterSpacing: "0.15em", opacity: 0.85,
      }}>NOW</span>
      <span style={{
        textDecoration: (isOriginal && style.strikethrough) ? "line-through" : "none",
        textDecorationThickness: (isOriginal && style.strikethrough) ? "0.1em" : undefined,
      }}>{style.text}</span>
    </span>
  ) : (
    <span style={{
      textDecoration: (isOriginal && style.strikethrough) ? "line-through" : "none",
      textDecorationThickness: (isOriginal && style.strikethrough) ? "0.1em" : undefined,
    }}>{style.text}</span>
  );

  return (
    <div
      ref={outerRef}
      onMouseDown={onMouseDown}
      className={cn(
        "absolute whitespace-pre-line cursor-move",
        isSelected && "outline outline-2 outline-[#E10600] outline-offset-2",
        isDragging && "opacity-80"
      )}
      style={{
        left: `${style.x}%`, top: `${style.y}%`,
        transform: `translate(${translateX}, 0)`,
        maxWidth: `${style.maxWidth}%`,
        fontSize: `${scaled}px`,
        fontWeight: style.fontWeight, fontFamily: fontVar,
        color: style.color, textAlign: style.textAlign,
        lineHeight: style.lineHeight, letterSpacing: `${style.letterSpacing}em`,
        textTransform: style.uppercase ? "uppercase" : "none",
        textShadow: style.textShadow ? "0 2px 6px rgba(0,0,0,0.4)" : "none",
        userSelect: "none",
        // NOTE: animation is intentionally NOT set here.
        // It is applied imperatively via useEffect above so that Replay works.
      }}
    >
      <span style={{ position: "relative", display: "inline-block" }}>
        {content}
        {deco === "underline-draw" && (
          <span
            ref={(el) => { decoRefs.current[0] = el; }}
            aria-hidden="true"
            style={{
              position: "absolute", left: 0, right: 0, bottom: "-0.15em",
              height: "3px", background: style.color, borderRadius: "2px",
              transformOrigin: "left center",
              animation: `hero-underline-draw 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${decoDelay}ms both`,
            }}
          />
        )}
        {deco === "accent-bar-left" && (
          <span
            ref={(el) => { decoRefs.current[1] = el; }}
            aria-hidden="true"
            style={{
              position: "absolute", left: "-0.5em", top: 0, bottom: 0,
              width: "3px", background: "#E10600", borderRadius: "2px",
              transformOrigin: "top center",
              animation: `hero-accent-bar-draw 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${decoDelay}ms both`,
            }}
          />
        )}
        {deco === "shimmer-sweep" && (
          <span aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            <span
              ref={(el) => { decoRefs.current[2] = el; }}
              style={{
                position: "absolute", top: 0, left: 0, width: "40%", height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
                animation: `hero-shimmer-sweep 1600ms ease-in-out ${decoDelay}ms both`,
                mixBlendMode: "overlay",
              }}
            />
          </span>
        )}
        {deco === "accent-dots" && (
          <span aria-hidden="true" style={{
            display: "inline-flex", gap: "0.35em", marginLeft: "0.5em", verticalAlign: "middle",
          }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                ref={(el) => { decoRefs.current[3 + i] = el; }}
                style={{
                  display: "inline-block", width: "0.35em", height: "0.35em",
                  borderRadius: "9999px", background: "#E10600",
                  animation: `hero-dot-pop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) ${decoDelay + i * 150}ms both`,
                }}
              />
            ))}
          </span>
        )}
      </span>
    </div>
  );
}

// ─── Preview countdown ────────────────────────────────────
function PreviewCountdown({ style, scale, isSelected, isDragging, onMouseDown, animVersion }: {
  style: CountdownStyle; scale: number; isSelected: boolean; isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  animVersion: number;
}) {
  const cdRef = useRef<HTMLDivElement>(null);
  const anim = style.animation ?? defaultAnimation();
  const durMs = SPEED_MS[anim.speed];
  const delMs = DELAY_MS[anim.delay];
  const hasEntrance = anim.entrance !== "none";
  const hasLoop     = anim.loop     !== "none";
  const animParts: string[] = [];
  if (hasEntrance) {
    animParts.push(`hero-${anim.entrance} ${durMs}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delMs}ms both`);
  }
  if (hasLoop) {
    const loopDur   = anim.loop === "float-soft" ? 4 : 3;
    const loopDelay = hasEntrance ? delMs + durMs : 0;
    animParts.push(`hero-${anim.loop} ${loopDur}s ease-in-out infinite ${loopDelay}ms`);
  }
  const cdAnimStr = animParts.join(", ");

  useEffect(() => {
    if (!cdRef.current) return;
    const el = cdRef.current;
    if (!cdAnimStr) { el.style.animation = ""; return; }
    el.style.animation = "none";
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    void el.offsetWidth;
    const rafId = requestAnimationFrame(() => { if (el) el.style.animation = cdAnimStr; });
    return () => cancelAnimationFrame(rafId);
  }, [animVersion, cdAnimStr]);
  const translateX = style.anchor === "center" ? "-50%" : style.anchor === "end" ? "-100%" : "0";
  // entranceStyle removed — animation now imperative
  const bg = style.bgColor ? hexToRgba(style.bgColor, ((style.bgOpacity ?? 60) / 100)) : "transparent";
  const scaled = Math.max(8, Math.round(style.fontSize * scale));

  return (
    <div ref={cdRef} onMouseDown={onMouseDown}
      className={cn(
        "absolute cursor-move",
        isSelected && "outline outline-2 outline-[#E10600] outline-offset-2",
        isDragging && "opacity-80"
      )}
      style={{
        left: `${style.x}%`, top: `${style.y}%`,
        transform: `translate(${translateX}, 0)`,
        background: style.digitStyle === "minimal" ? bg : "transparent",
        borderRadius: `${(style.borderRadius ?? 0) * Math.min(scale * 2, 1)}px`,
        padding: style.digitStyle === "minimal" ? `${(style.paddingY ?? 8) * scale}px ${(style.paddingX ?? 12) * scale}px` : "0",
        color: style.color,
        fontSize: `${scaled}px`,
        fontWeight: style.fontWeight,
        display: "inline-flex", alignItems: "center",
        gap: `${Math.max(2, scaled * 0.15)}px`,
        userSelect: "none",
        // animation intentionally omitted — applied imperatively via useEffect
      }}
    >
      <span style={{ fontVariantNumeric: "tabular-nums" }}>00 : 00 : 00 : 00</span>
    </div>
  );
}

// ─── Preview sticker ──────────────────────────────────────
function PreviewSticker({ sticker, device, scale, isSelected, isDragging, onMouseDown, animVersion }: {
  sticker: Sticker; device: "desktop" | "mobile"; scale: number;
  isSelected: boolean; isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  animVersion: number;
}) {
  const stickerImgRef = useRef<HTMLImageElement>(null);
  const kind = STICKER_KINDS.find((k) => k.value === sticker.kind)!;
  const pos  = (device === "desktop" ? sticker.positionDesktop : sticker.positionMobile)!;
  const translateX = pos.anchor === "center" ? "-50%" : pos.anchor === "end" ? "-100%" : "0";

  // The real storefront picks size based on device (desktop widths vs mobile widths).
  // In the preview we use the same "storefront desktop widths" scaled down by container scale
  // so it matches what the customer will actually see at that container width.
  const refWidth = device === "desktop"
    ? { sm: 140, md: 200, lg: 280, xl: 360 }[sticker.size]
    : { sm: 90,  md: 130, lg: 170, xl: 220 }[sticker.size];
  const width = Math.max(20, refWidth * scale);

  // Signature animation depending on top/bottom
  const animName = pos.y < 50 ? "hero-sticker-pop" : "hero-sticker-slide-up";

  return (
    <div
      onMouseDown={onMouseDown}
      className={cn(
        "absolute cursor-move",
        isSelected && "outline outline-2 outline-[#E10600] outline-offset-2",
        isDragging && "opacity-80"
      )}
      style={{
        left: `${pos.x}%`, top: `${pos.y}%`,
        transform: `translate(${translateX}, 0)`,
        width, zIndex: 20,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <StickerImg
        ref={stickerImgRef}
        src={kind.src}
        alt={kind.label}
        animName={animName}
        transformOrigin={pos.y < 50 ? "top center" : "bottom center"}
        animVersion={animVersion}
      />
    </div>
  );
}

// Helper: sticker image with restartable animation
const StickerImg = React.forwardRef<HTMLImageElement, {
  src: string; alt: string; animName: string;
  transformOrigin: string; animVersion: number;
}>(function StickerImg({ src, alt, animName, transformOrigin, animVersion }, ref) {
  const localRef = useRef<HTMLImageElement>(null);
  const combinedRef = (el: HTMLImageElement | null) => {
    localRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLImageElement | null>).current = el;
  };
  const animCss = `${animName} 900ms cubic-bezier(0.34, 1.56, 0.64, 1) 400ms both`;
  useEffect(() => {
    if (!localRef.current) return;
    const el = localRef.current;
    el.style.animation = "none";
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    void el.offsetWidth;
    requestAnimationFrame(() => { el.style.animation = animCss; });
  }, [animVersion, animCss]);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={combinedRef}
      src={src}
      alt={alt}
      draggable={false}
      style={{
        width: "100%", height: "auto", display: "block",
        animation: animCss,
        transformOrigin,
        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))",
        pointerEvents: "none",
      }}
    />
  );
});

// ═══════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════
function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace("#", "");
  if (c.length !== 6) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-[#6b7280] mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 text-xs border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none" />
    </div>
  );
}

void useMemo;

// ═══════════════════════════════════════════════════════════
//  ImageSlot
// ═══════════════════════════════════════════════════════════
function ImageSlot({ label, icon: Icon, helpText, aspectClass, value, required, onChange }: {
  label: string; icon: typeof Monitor; helpText: string; aspectClass: string;
  value: string; required?: boolean; onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver,  setDragOver]  = useState(false);
  const [showUrl,   setShowUrl]   = useState(false);
  const [urlInput,  setUrlInput]  = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const toast   = useToastStore();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
    setUploading(true);
    const url = await uploadImage(file);
    if (url) { onChange(url); toast.success("Image uploaded"); } else toast.error("Upload failed");
    setUploading(false);
  };

  const handleUrlAdd = async () => {
    const url = urlInput.trim();
    if (!url.startsWith("http")) return;
    setUploading(true);
    const optimized = await uploadImageFromUrl(url);
    if (optimized) { onChange(optimized); setUrlInput(""); setShowUrl(false); toast.success("Image loaded"); }
    else toast.error("Could not load image");
    setUploading(false);
  };

  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wide text-[#1a1a1a] mb-1.5 flex items-center gap-1">
        <Icon size={11} className={required ? "text-[#E10600]" : "text-[#6b7280]"} />{label}
      </label>

      {value ? (
        <div className={cn("relative border border-[#e5e7eb] overflow-hidden bg-[#111]", aspectClass)}>
          <Image src={value} alt="Preview" fill className="object-cover" sizes="300px"
            unoptimized={value.startsWith("/uploads")} />
          <div className="absolute top-1 right-1 flex gap-1">
            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileRef.current?.click(); }}
              className="bg-white/90 hover:bg-white text-[#1a1a1a] p-1 transition-colors" title="Replace">
              <Upload size={10} />
            </button>
            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(""); }}
              className="bg-white/90 hover:bg-red-500 hover:text-white text-[#1a1a1a] p-1 transition-colors" title="Remove">
              <X size={10} />
            </button>
          </div>
        </div>
      ) : (
        <div className={cn(
          "border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors",
          aspectClass,
          dragOver ? "border-[#E10600] bg-[#f5f0e8]/50" : "border-[#e5e7eb] hover:border-[#E10600] bg-[#fafaf9]"
        )}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
          {uploading ? <Loader size={16} className="text-[#E10600] animate-spin" /> : (
            <div className="flex flex-col items-center gap-1 p-2 text-center">
              <ImageIcon size={16} className="text-[#E10600]" />
              <span className="text-[10px] font-semibold text-[#1a1a1a]">Click / drop</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-1">
        {!showUrl ? (
          <button type="button" onClick={() => setShowUrl(true)}
            className="text-[9px] text-[#6b7280] hover:text-[#E10600] underline">Or paste URL</button>
        ) : (
          <div className="flex gap-1">
            <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://..."
              className="flex-1 min-w-0 px-1.5 py-1 text-[10px] border border-[#e5e7eb] focus:border-[#E10600] focus:outline-none" />
            <button type="button" onClick={handleUrlAdd} disabled={!urlInput.trim() || uploading}
              className="px-1.5 py-1 text-[9px] font-semibold bg-[#1a1a1a] text-white hover:bg-[#E10600] transition-colors disabled:opacity-40">
              Load
            </button>
            <button type="button" onClick={() => { setShowUrl(false); setUrlInput(""); }}
              className="px-1 py-1 text-[#6b7280]"><X size={9} /></button>
          </div>
        )}
      </div>

      <p className="mt-1 text-[9px] text-[#6b7280]">{helpText}</p>

      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  Image preview modal
// ═══════════════════════════════════════════════════════════
function ImagePreviewModal({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out" onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors">
        <X size={20} />
      </button>
      <div className="relative w-full max-w-6xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Full-size preview" className="w-full h-auto" />
      </div>
    </div>
  );
}