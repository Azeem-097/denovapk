"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductImage as ProductImageType } from "@/types";

interface ImageLightboxProps {
  images:      ProductImageType[];
  initialIdx:  number;
  productName: string;
  isOpen:      boolean;
  onClose:     () => void;
}

/**
 * Full-screen image lightbox — portal-based so it escapes any
 * parent's transform/overflow/z-index constraints.
 *
 * Design: clean white full-viewport background, minimal chrome
 * (close X top-right, prev/next arrows on sides), image
 * perfectly centered at natural aspect ratio.
 *
 * Interactions:
 *   • Close:    × button, Esc key, click empty area, or click image
 *   • Navigate: ← → arrow keys, prev/next side buttons
 *   • Zoom:     Click image to toggle 1x <-> 2x
 *   • Pan:      Click-and-drag when zoomed
 */
export function ImageLightbox({
  images,
  initialIdx,
  productName,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const [mounted, setMounted]       = useState(false);
  const [currentIdx, setCurrentIdx] = useState(initialIdx);
  const [zoomed, setZoomed]         = useState(false);
  const [panX, setPanX]             = useState(0);
  const [panY, setPanY]             = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const didDragRef   = useRef(false);

  // Portal target — render at document body root
  useEffect(() => setMounted(true), []);

  const resetTransform = useCallback(() => {
    setZoomed(false);
    setPanX(0);
    setPanY(0);
  }, []);

  useEffect(() => {
    if (isOpen) setCurrentIdx(initialIdx);
  }, [isOpen, initialIdx]);

  useEffect(() => {
    resetTransform();
  }, [currentIdx, resetTransform]);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, [isOpen]);

  const goPrev = useCallback(() => {
    setCurrentIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setCurrentIdx((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":     onClose(); break;
        case "ArrowLeft":  goPrev();  break;
        case "ArrowRight": goNext();  break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, goPrev, goNext]);

  // Drag to pan (only when zoomed)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!zoomed) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    didDragRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY, panX, panY };
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDragRef.current = true;
      setPanX(dragStartRef.current.panX + dx);
      setPanY(dragStartRef.current.panY + dy);
    };
    const handleUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging]);

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If user just finished dragging, don't toggle zoom
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    if (zoomed) resetTransform();
    else        setZoomed(true);
  };

  // Click empty backdrop area to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!mounted || !isOpen || images.length === 0) return null;
  const currentImage = images[currentIdx];
  if (!currentImage) return null;

  const lightbox = (
    <div
      className="fixed inset-0 z-[9999] bg-white flex flex-col animate-fade-zoom-in"
      role="dialog"
      aria-modal="true"
      aria-label="Product image viewer"
      style={{ isolation: "isolate" }}
    >
      {/* ═══ CLOSE BUTTON (top-right) ═══════════════════════ */}
      <button
        onClick={onClose}
        aria-label="Close (Esc)"
        className="absolute top-5 right-5 sm:top-6 sm:right-6 z-20 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full text-[#1a1a1a] hover:bg-[#f5f0e8] active:scale-95 transition-all duration-200"
      >
        <X size={22} strokeWidth={1.75} />
      </button>

      {/* ═══ IMAGE COUNTER (top-left, only if multiple) ════ */}
      {images.length > 1 && (
        <div className="absolute top-5 left-5 sm:top-7 sm:left-7 z-20 text-[#1a1a1a]/70 text-sm font-medium tracking-wide tabular-nums">
          {currentIdx + 1} <span className="text-[#E10600] mx-1">/</span> {images.length}
        </div>
      )}

      {/* ═══ IMAGE AREA ════════════════════════════════════ */}
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden select-none"
        onClick={handleBackdropClick}
      >
        {/* Previous arrow */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full text-[#1a1a1a] border border-[#e5e7eb] bg-white hover:bg-[#f5f0e8] hover:border-[#E10600] shadow-sm transition-all duration-200 active:scale-95"
            aria-label="Previous image (Left arrow)"
          >
            <ChevronLeft size={20} strokeWidth={1.75} />
          </button>
        )}

        {/* Image container — transform for zoom & pan */}
        <div
          className={cn(
            "relative w-full h-full max-w-[85vw] max-h-[85vh] flex items-center justify-center transition-transform duration-300 ease-out",
            zoomed && (isDragging ? "cursor-grabbing" : "cursor-grab"),
            !zoomed && "cursor-zoom-in"
          )}
          style={{
            transform: `translate3d(${panX}px, ${panY}px, 0) scale(${zoomed ? 2 : 1})`,
            transition: isDragging ? "none" : "transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
          onMouseDown={handleMouseDown}
          onClick={handleImageClick}
        >
          <Image
            src={currentImage.url}
            alt={currentImage.alt || productName}
            width={1600}
            height={2000}
            className="w-auto h-auto max-w-full max-h-full object-contain pointer-events-none"
            priority
            draggable={false}
            unoptimized={currentImage.url.endsWith(".svg")}
          />
        </div>

        {/* Next arrow */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full text-[#1a1a1a] border border-[#e5e7eb] bg-white hover:bg-[#f5f0e8] hover:border-[#E10600] shadow-sm transition-all duration-200 active:scale-95"
            aria-label="Next image (Right arrow)"
          >
            <ChevronRight size={20} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* ═══ THUMBNAILS (bottom, only if multiple) ══════════ */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 sm:gap-3 px-4 pb-6 pt-2 overflow-x-auto scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={img.id + i}
              onClick={() => setCurrentIdx(i)}
              className={cn(
                "flex-shrink-0 relative w-12 h-14 sm:w-14 sm:h-16 overflow-hidden rounded-lg transition-all duration-200",
                i === currentIdx
                  ? "ring-2 ring-[#E10600] ring-offset-2 ring-offset-white opacity-100"
                  : "opacity-50 hover:opacity-90"
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
                unoptimized={img.url.endsWith(".svg")}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return createPortal(lightbox, document.body);
}