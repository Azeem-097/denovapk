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
const ZOOM_LEVEL      = 2.5;   // magnification factor
const LENS_WIDTH      = 180;   // px lens over source
const LENS_HEIGHT     = 220;   // px
const PANEL_MARGIN    = 24;    // px space between source column edge and panel

interface ZoomState {
  active:      boolean;
  imageUrl:    string;
  imageAlt:    string;
  lensX:       number;
  lensY:       number;
  sourceRect:  DOMRect | null;
  hostRect:    DOMRect | null;   // rect of the ProductImages container (left gallery column)
}

// ═══════════════════════════════════════════════════════════
//  ZOOM PANEL — floating portal
//  Positioned to overlay the space to the right of the
//  gallery column (i.e., visually over the info column area),
//  matching Levi's product-page behavior.
// ═══════════════════════════════════════════════════════════
function ZoomPanel({ state }: { state: ZoomState }) {
  if (!state.active || !state.sourceRect || !state.hostRect) return null;

  const { imageUrl, imageAlt, lensX, lensY, sourceRect, hostRect } = state;

  // Background offset — express lens position as a percentage of source image
  const bgX = (lensX / sourceRect.width)  * 100;
  const bgY = (lensY / sourceRect.height) * 100;

  // Background size scaled by zoom
  const bgSizeX = sourceRect.width  * ZOOM_LEVEL;
  const bgSizeY = sourceRect.height * ZOOM_LEVEL;

  // ─── Panel placement ────────────────────────────────────
  // Anchor the panel to start just after the gallery column's right edge
  // and extend to the viewport's right edge (minus a margin).
  const panelLeft  = hostRect.right + PANEL_MARGIN;
  const panelRight = window.innerWidth - PANEL_MARGIN;
  let   panelWidth = panelRight - panelLeft;

  // Fallback: if column width is too tight (unusual), pin panel to right side
  if (panelWidth < 320) {
    // Use 45% of viewport minimum 400px
    panelWidth = Math.max(400, Math.round(window.innerWidth * 0.45));
  }

  // Vertical — align top with gallery top, height matches source image or viewport
  const availableHeight = window.innerHeight - 32; // 16px top/bottom margin
  let panelHeight       = Math.min(sourceRect.height * 1.2, availableHeight);
  if (panelHeight < 400) panelHeight = 400;

  let panelTop = sourceRect.top;
  // Clamp to viewport
  const maxTop = window.innerHeight - panelHeight - 16;
  if (panelTop > maxTop) panelTop = maxTop;
  if (panelTop < 16)     panelTop = 16;

  // Recompute actual left when we forced a fallback width
  const actualLeft = panelWidth === (panelRight - panelLeft)
    ? panelLeft
    : window.innerWidth - panelWidth - PANEL_MARGIN;

  return createPortal(
    <div
      aria-hidden="true"
      style={{
        position:      "fixed",
        top:           `${panelTop}px`,
        left:          `${actualLeft}px`,
        width:         `${panelWidth}px`,
        height:        `${panelHeight}px`,
        backgroundImage:    `url(${imageUrl})`,
        backgroundRepeat:   "no-repeat",
        backgroundSize:     `${bgSizeX}px ${bgSizeY}px`,
        backgroundPosition: `${bgX}% ${bgY}%`,
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
//  LENS — overlays the source image showing the zoom region
// ═══════════════════════════════════════════════════════════
function ZoomLens({
  x, y, containerWidth, containerHeight,
}: {
  x: number;
  y: number;
  containerWidth:  number;
  containerHeight: number;
}) {
  let left = x - LENS_WIDTH  / 2;
  let top  = y - LENS_HEIGHT / 2;
  if (left < 0) left = 0;
  if (top  < 0) top  = 0;
  if (left + LENS_WIDTH  > containerWidth)  left = containerWidth  - LENS_WIDTH;
  if (top  + LENS_HEIGHT > containerHeight) top  = containerHeight - LENS_HEIGHT;

  return (
    <div
      aria-hidden="true"
      style={{
        position:       "absolute",
        top:            `${top}px`,
        left:           `${left}px`,
        width:          `${LENS_WIDTH}px`,
        height:         `${LENS_HEIGHT}px`,
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
  const galleryRef   = useRef<HTMLDivElement | null>(null); // desktop grid host
  const [mobileIndex, setMobileIndex] = useState(0);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx,  setLightboxIdx]  = useState(0);

  // ═══ ZOOM STATE ═══
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

  // Simple pointer-based detection: only enable on fine pointers (mouse/trackpad).
  // Touch devices skip zoom entirely (mobile carousel handles them).
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
    showToast({
      type: "success",
      message: isInWishlist ? "Removed from wishlist" : "Added to wishlist",
    });
  };

  const hasDiscount = !!discountPercent && discountPercent > 0;
  const isPlaceholder = (url: string) => url === PLACEHOLDER.url;

  // ═══ ZOOM HANDLERS (per-tile) ═══
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

  // Close zoom on scroll (source rect becomes stale)
  useEffect(() => {
    if (!zoom.active) return;
    const dismiss = () => {
      setZoom((prev) => ({ ...prev, active: false }));
      setActiveTileIdx(null);
    };
    window.addEventListener("scroll", dismiss, { passive: true });
    return () => window.removeEventListener("scroll", dismiss);
  }, [zoom.active]);

  return (
    <>
      {/* DESKTOP - 2x2 grid with hover-zoom + click-to-lightbox */}
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
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b5f8f] focus-visible:ring-offset-2",
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
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#3b5f8f] gap-2">
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

              {/* Lens overlay on active tile */}
              {isActive && zoom.sourceRect && (
                <ZoomLens
                  x={zoom.lensX}
                  y={zoom.lensY}
                  containerWidth={zoom.sourceRect.width}
                  containerHeight={zoom.sourceRect.height}
                />
              )}

              {/* Discount ribbon on primary image */}
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
                      mounted && isInWishlist ? "text-[#3b5f8f] fill-[#3b5f8f]" : "text-[#1a1a1a]"
                    )}
                  />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* MOBILE - swipeable carousel (UNCHANGED) */}
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
                mounted && isInWishlist ? "text-[#3b5f8f] fill-[#3b5f8f]" : "text-[#1a1a1a]"
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
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#3b5f8f] gap-2">
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

      {/* Floating zoom preview panel (portal to body) */}
      {mounted && <ZoomPanel state={zoom} />}

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