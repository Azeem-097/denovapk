"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Package, Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useToastStore } from "@/store/toastStore";
import { ProductBgWrapper } from "./ProductBgWrapper";
import { DiscountBadge } from "./DiscountBadge";
import { ImageLightbox } from "./ImageLightbox";
import { trackMetaEvent } from "@/lib/metaPixel";
import { cn } from "@/lib/utils";
import type { ProductImage as ProductImageType } from "@/types";

interface ProductImagesProps {
  images:           ProductImageType[];
  productName:      string;
  productId:        string;
  productSlug:      string;
  productPrice:     number;
  bgColor?:         string | null;
  discountPercent?: number;
}

const PLACEHOLDER: ProductImageType = {
  id:        "placeholder",
  url:       "/uploads/placeholder.svg",
  alt:       "Product image coming soon",
  isPrimary: true,
};

// ═══════════════════════════════════════════════════════════
//  ZOOM CONFIG
// ═══════════════════════════════════════════════════════════
const ZOOM_LEVEL_TARGET   = 2.5;   // desired magnification
const PANEL_MARGIN        = 24;    // horizontal margin
const PANEL_BOTTOM        = 0;     // px from viewport bottom

// Lens size will be derived, but with these guards:
const LENS_MIN            = 80;    // px  — smallest permitted lens edge
const LENS_MAX_RATIO      = 0.65;  // never let lens exceed 65% of the source dimension

interface ZoomState {
  active:      boolean;
  imageUrl:    string;
  imageAlt:    string;
  lensX:       number;         // cursor x inside source
  lensY:       number;         // cursor y inside source
  sourceRect:  DOMRect | null;
  hostRect:    DOMRect | null;
}

// ═══════════════════════════════════════════════════════════
//  compute panel + lens dimensions (single source of truth)
// ═══════════════════════════════════════════════════════════
interface Layout {
  panelLeft:   number;
  panelTop:    number;
  panelWidth:  number;
  panelHeight: number;
  lensWidth:   number;
  lensHeight:  number;
  zoomLevel:   number;         // may be bumped if lens would be too big
}

function computeLayout(sourceRect: DOMRect, hostRect: DOMRect): Layout {
  // ─── Horizontal ─────────────────────────────────────────
  const rawLeft  = hostRect.right + PANEL_MARGIN;
  const rawRight = window.innerWidth - PANEL_MARGIN;
  let   panelWidth = rawRight - rawLeft;
  let   panelLeft  = rawLeft;

  if (panelWidth < 320) {
    panelWidth = Math.max(400, Math.round(window.innerWidth * 0.45));
    panelLeft  = window.innerWidth - panelWidth - PANEL_MARGIN;
  }

  // ─── Vertical ───────────────────────────────────────────
  // Rules:
  //   1. Never overlap the sticky <header>
  //   2. Top:    max(sourceRect.top,    headerBottom)
  //   3. Bottom: min(sourceRect.bottom, viewportBottom)
  const headerEl     = typeof document !== "undefined" ? document.querySelector("header") : null;
  const headerBottom = headerEl ? headerEl.getBoundingClientRect().bottom : 0;

  const panelTop    = Math.max(sourceRect.top,    headerBottom);
  const panelBottom = Math.min(sourceRect.bottom, window.innerHeight);
  let   panelHeight = panelBottom - panelTop;

  // Guard: if the hovered image is (almost) entirely outside the visible
  // safe area, panelHeight would be zero or negative. Force a minimum
  // so React doesn't render a degenerate box; the panel will still be
  // hidden by the caller's activation state.
  if (panelHeight < 120) panelHeight = 120;
  // ─── Zoom level & lens size ─────────────────────────────
  //
  // Ideal relationship:
  //   lens_width  * ZOOM_LEVEL = panel_width
  //   lens_height * ZOOM_LEVEL = panel_height
  //
  // So the region UNDER the lens is exactly what the panel shows.
  //
  // If, at the target zoom, the lens would exceed LENS_MAX_RATIO of
  // the source image, bump ZOOM_LEVEL until it fits. This guarantees
  // a lens the user can actually see and reposition.
  //
  let zoomLevel  = ZOOM_LEVEL_TARGET;
  let lensWidth  = panelWidth  / zoomLevel;
  let lensHeight = panelHeight / zoomLevel;

  const maxLensW = sourceRect.width  * LENS_MAX_RATIO;
  const maxLensH = sourceRect.height * LENS_MAX_RATIO;

  if (lensWidth > maxLensW || lensHeight > maxLensH) {
    const zoomForW = panelWidth  / maxLensW;
    const zoomForH = panelHeight / maxLensH;
    zoomLevel  = Math.max(zoomForW, zoomForH);
    lensWidth  = panelWidth  / zoomLevel;
    lensHeight = panelHeight / zoomLevel;
  }

  // Enforce lens minimum (rare, but for tiny gallery tiles)
  if (lensWidth  < LENS_MIN) lensWidth  = LENS_MIN;
  if (lensHeight < LENS_MIN) lensHeight = LENS_MIN;

  return {
    panelLeft, panelTop, panelWidth, panelHeight,
    lensWidth, lensHeight, zoomLevel,
  };
}

// ═══════════════════════════════════════════════════════════
//  ZOOM PANEL — floating portal
// ═══════════════════════════════════════════════════════════
function ZoomPanel({ state, layout }: { state: ZoomState; layout: Layout }) {
  if (!state.active || !state.sourceRect) return null;

  const { imageUrl, imageAlt, lensX, lensY, sourceRect } = state;
  const { panelLeft, panelTop, panelWidth, panelHeight, lensWidth, lensHeight, zoomLevel } = layout;

  // The panel shows the source image scaled by zoomLevel.
  // We need the point in the SCALED image that corresponds to
  // the cursor, then position the background so that point is
  // in the center of the panel.

  // Clamp the "focus point" so the lens stays inside the source rect,
  // matching the clamping the lens does visually. This keeps them in sync.
  let focusX = lensX;
  let focusY = lensY;
  const halfLW = lensWidth  / 2;
  const halfLH = lensHeight / 2;
  if (focusX < halfLW) focusX = halfLW;
  if (focusY < halfLH) focusY = halfLH;
  if (focusX > sourceRect.width  - halfLW) focusX = sourceRect.width  - halfLW;
  if (focusY > sourceRect.height - halfLH) focusY = sourceRect.height - halfLH;

  const bgSizeX = sourceRect.width  * zoomLevel;
  const bgSizeY = sourceRect.height * zoomLevel;

  // Position: shift the background so that the focus point sits at the
  // center of the panel.
  const bgPosX = -(focusX * zoomLevel) + panelWidth  / 2;
  const bgPosY = -(focusY * zoomLevel) + panelHeight / 2;

  return createPortal(
    <div
      aria-hidden="true"
      style={{
        position:      "fixed",
        top:           `${panelTop}px`,
        left:          `${panelLeft}px`,
        width:         `${panelWidth}px`,
        height:        `${panelHeight}px`,
        backgroundImage:    `url(${imageUrl})`,
        backgroundRepeat:   "no-repeat",
        backgroundSize:     `${bgSizeX}px ${bgSizeY}px`,
        backgroundPosition: `${bgPosX}px ${bgPosY}px`,
        backgroundColor:    "#ffffff",
        border:        "1px solid #e5e7eb",
        boxShadow:     "0 20px 50px -12px rgba(0,0,0,0.22), 0 8px 20px -8px rgba(0,0,0,0.14)",
        zIndex:        60,
        pointerEvents: "none",
        borderRadius:  "8px",
      }}
      role="img"
      aria-label={`Zoomed view: ${imageAlt}`}
    />,
    document.body
  );
}

// ═══════════════════════════════════════════════════════════
//  LENS
// ═══════════════════════════════════════════════════════════
function ZoomLens({
  x, y, containerWidth, containerHeight, lensWidth, lensHeight,
}: {
  x: number;
  y: number;
  containerWidth:  number;
  containerHeight: number;
  lensWidth:       number;
  lensHeight:      number;
}) {
  let left = x - lensWidth  / 2;
  let top  = y - lensHeight / 2;
  if (left < 0) left = 0;
  if (top  < 0) top  = 0;
  if (left + lensWidth  > containerWidth)  left = containerWidth  - lensWidth;
  if (top  + lensHeight > containerHeight) top  = containerHeight - lensHeight;

  return (
    <div
      aria-hidden="true"
      style={{
        position:       "absolute",
        top:            `${top}px`,
        left:           `${left}px`,
        width:          `${lensWidth}px`,
        height:         `${lensHeight}px`,
        border:         "1.5px solid rgba(26,26,26,0.55)",
        backgroundColor:"rgba(255,255,255,0.28)",
        pointerEvents:  "none",
        zIndex:         5,
        borderRadius:   "2px",
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════
export function ProductImages({
  images,
  productName,
  productId,
  productSlug,
  productPrice,
  bgColor,
  discountPercent,
}: ProductImagesProps) {
  const safeImages = images && images.length > 0 ? images : [PLACEHOLDER];

  const sortedImages = [...safeImages].sort(
    (a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)
  );

  const scrollerRef  = useRef<HTMLDivElement | null>(null);
  const galleryRef   = useRef<HTMLDivElement | null>(null);
  const [mobileIndex, setMobileIndex] = useState(0);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx,  setLightboxIdx]  = useState(0);

  const [zoom, setZoom] = useState<ZoomState>({
    active:     false,
    imageUrl:   "",
    imageAlt:   "",
    lensX:      0,
    lensY:      0,
    sourceRect: null,
    hostRect:   null,
  });
  const [activeTileIdx, setActiveTileIdx] = useState<number | null>(null);

  const [canZoom, setCanZoom] = useState(false);
  useEffect(() => {
    const check = () => {
      if (typeof window === "undefined") return;
      const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
      setCanZoom(mq.matches);
    };
    check();
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    mq.addEventListener?.("change", check);
    return () => mq.removeEventListener?.("change", check);
  }, []);

  const openLightbox = useCallback((idx: number) => {
    setLightboxIdx(idx);
    setLightboxOpen(true);
    setZoom((z) => ({ ...z, active: false }));
    setActiveTileIdx(null);
  }, []);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== mobileIndex) setMobileIndex(idx);
  }, [mobileIndex]);

  const scrollToSlide = useCallback((idx: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist   = useWishlistStore((s) => s.isInWishlist(productId));
  const showToast      = useToastStore((s) => s.addToast);

  const primaryImage = sortedImages[0];

  const handleWishlist = () => {
    toggleWishlist({
      id:        productId,
      productId: productId,
      name:      productName,
      image:     primaryImage.url,
      price:     productPrice,
      slug:      productSlug,
      bgColor:   bgColor,
    });

    trackMetaEvent("AddToWishlist", {
      content_ids: [productId],
      content_name: productName,
      content_type: "product",
      value: productPrice,
      currency: "PKR",
    });

    showToast({
      type: "success",
      message: isInWishlist ? "Removed from wishlist" : "Added to wishlist",
    });
  };

  const hasDiscount = !!discountPercent && discountPercent > 0;
  const isPlaceholder = (url: string) => url === PLACEHOLDER.url;

  const handleTileMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    img: ProductImageType,
    idx: number
  ) => {
    if (!canZoom) return;
    if (isPlaceholder(img.url)) return;
    if (lightboxOpen) return;

    const rect     = e.currentTarget.getBoundingClientRect();
    const hostRect = galleryRef.current?.getBoundingClientRect() ?? null;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setActiveTileIdx(idx);
    setZoom({
      active:     true,
      imageUrl:   img.url,
      imageAlt:   img.alt || productName,
      lensX:      x,
      lensY:      y,
      sourceRect: rect,
      hostRect,
    });
  };

  const handleTileMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canZoom || !zoom.active) return;
    const rect     = e.currentTarget.getBoundingClientRect();
    const hostRect = galleryRef.current?.getBoundingClientRect() ?? null;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setZoom((prev) => ({
      ...prev,
      lensX:      x,
      lensY:      y,
      sourceRect: rect,
      hostRect,
    }));
  };

  const handleTileMouseLeave = () => {
    if (!canZoom) return;
    setZoom((prev) => ({ ...prev, active: false }));
    setActiveTileIdx(null);
  };

  useEffect(() => {
    if (!zoom.active) return;
    const dismiss = () => {
      setZoom((prev) => ({ ...prev, active: false }));
      setActiveTileIdx(null);
    };
    window.addEventListener("scroll", dismiss, { passive: true });
    return () => window.removeEventListener("scroll", dismiss);
  }, [zoom.active]);

  // Compute layout ONCE per render when zoom is active — single source of truth
  const layout = (zoom.active && zoom.sourceRect && zoom.hostRect)
    ? computeLayout(zoom.sourceRect, zoom.hostRect)
    : null;

  return (
    <>
      {/* DESKTOP */}
      <div
        ref={galleryRef}
        className="hidden sm:grid grid-cols-2 gap-2 lg:gap-3"
      >
        {sortedImages.map((img, i) => {
          const zoomable = canZoom && !isPlaceholder(img.url);
          const isActive = activeTileIdx === i && zoom.active;

          return (
            <div
              key={img.id + i}
              className="relative group"
              onMouseEnter={(e) => handleTileMouseEnter(e, img, i)}
              onMouseMove={handleTileMouseMove}
              onMouseLeave={handleTileMouseLeave}
            >
              <button
                type="button"
                onClick={() => !isPlaceholder(img.url) && openLightbox(i)}
                disabled={isPlaceholder(img.url)}
                className={cn(
                  "block w-full relative disabled:cursor-default rounded-xl lg:rounded-2xl overflow-hidden",
                  zoomable ? "cursor-crosshair" : "cursor-zoom-in",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2",
                  isActive && "ring-2 ring-[#1a1a1a] ring-offset-2"
                )}
                aria-label={`View image ${i + 1} in full screen`}
              >
                <ProductBgWrapper
                  bgColor={bgColor}
                  className={cn(
                    "aspect-[4/5] overflow-hidden",
                    !bgColor && "bg-[#f4f2ee]"
                  )}
                >
                  {isPlaceholder(img.url) ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#F97316] gap-2">
                      <Package size={48} strokeWidth={1.5} />
                      <p className="text-xs font-medium tracking-widest uppercase text-[#6b7280]">
                        Image coming soon
                      </p>
                    </div>
                  ) : (
                    <Image
                      src={img.url}
                      alt={img.alt || productName}
                      fill
                      className={cn(
                        "object-cover transition-transform duration-700 ease-out",
                        !isActive && "group-hover:scale-110"
                      )}
                      sizes="(max-width: 1024px) 50vw, 45vw"
                      priority={i === 0}
                      loading={i === 0 ? "eager" : "lazy"}
                      unoptimized={img.url.endsWith(".svg")}
                    />
                  )}
                </ProductBgWrapper>
              </button>

              {isActive && layout && zoom.sourceRect && (
                <ZoomLens
                  x={zoom.lensX}
                  y={zoom.lensY}
                  containerWidth={zoom.sourceRect.width}
                  containerHeight={zoom.sourceRect.height}
                  lensWidth={layout.lensWidth}
                  lensHeight={layout.lensHeight}
                />
              )}

              {i === 0 && hasDiscount && (
                <DiscountBadge percent={discountPercent!} />
              )}

              {i === 0 && (
                <button
                  onClick={handleWishlist}
                  aria-label={mounted && isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  className={cn(
                    "absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-sm transition-all duration-300",
                    "opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0",
                    mounted && isInWishlist && "opacity-100 translate-x-0"
                  )}
                >
                  <Heart
                    size={16}
                    className={cn(
                      "transition-colors",
                      mounted && isInWishlist ? "text-[#F97316] fill-[#F97316]" : "text-[#1a1a1a]"
                    )}
                  />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* MOBILE - unchanged */}
      <div className="sm:hidden">
        <div className="relative">
          <button
            onClick={handleWishlist}
            aria-label={mounted && isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-sm"
          >
            <Heart
              size={16}
              className={cn(
                "transition-colors",
                mounted && isInWishlist ? "text-[#F97316] fill-[#F97316]" : "text-[#1a1a1a]"
              )}
            />
          </button>

          {hasDiscount && (
            <DiscountBadge percent={discountPercent!} />
          )}

          <div
            ref={scrollerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide overscroll-x-contain touch-pan-x"
            style={{ scrollBehavior: "auto" }}
          >
            {sortedImages.map((img, i) => (
              <button
                key={img.id + i}
                type="button"
                onClick={() => !isPlaceholder(img.url) && openLightbox(i)}
                disabled={isPlaceholder(img.url)}
                className="flex-shrink-0 w-full snap-start cursor-zoom-in disabled:cursor-default"
                aria-label={`View image ${i + 1} in full screen`}
              >
                <ProductBgWrapper
                  bgColor={bgColor}
                  className={cn(
                    "aspect-[4/5] rounded-xl overflow-hidden",
                    !bgColor && "bg-[#f4f2ee]"
                  )}
                >
                  {isPlaceholder(img.url) ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#F97316] gap-2">
                      <Package size={48} strokeWidth={1.5} />
                      <p className="text-xs font-medium tracking-widest uppercase text-[#6b7280]">
                        Image coming soon
                      </p>
                    </div>
                  ) : (
                    <Image
                      src={img.url}
                      alt={img.alt || productName}
                      fill
                      className="object-cover pointer-events-none"
                      sizes="100vw"
                      priority={i === 0}
                      draggable={false}
                    />
                  )}
                </ProductBgWrapper>
              </button>
            ))}
          </div>

          {sortedImages.length > 1 && (
            <div className="absolute top-3 left-3 z-10 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold tracking-wide px-2 py-1 rounded-full">
              {mobileIndex + 1} / {sortedImages.length}
            </div>
          )}
        </div>

        {sortedImages.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-4 pb-1">
            {sortedImages.map((_, i) => {
              const isActive = i === mobileIndex;
              return (
                <button
                  key={i}
                  onClick={() => scrollToSlide(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    isActive
                      ? "w-6 bg-[#1a1a1a]"
                      : "w-1.5 bg-[#d1d5db] hover:bg-[#9ca3af]"
                  )}
                />
              );
            })}
          </div>
        )}
      </div>

      <ImageLightbox
        images={sortedImages.filter((img) => !isPlaceholder(img.url))}
        initialIdx={lightboxIdx}
        productName={productName}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
      />

      {mounted && layout && <ZoomPanel state={zoom} layout={layout} />}

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}