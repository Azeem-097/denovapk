"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  title?:    string;
  children:  React.ReactNode;
  size?:     "sm" | "md" | "lg" | "xl" | "full";
  showClose?: boolean;
  className?: string;
}

const SIZES = {
  sm:   "max-w-sm",
  md:   "max-w-lg",
  lg:   "max-w-2xl",
  xl:   "max-w-4xl",
  full: "max-w-7xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={cn(
          "w-full bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] flex flex-col",
          SIZES[size],
          className
        )}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb] flex-shrink-0">
            {title ? (
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#1a1a1a]">
                {title}
              </h2>
            ) : (
              <div />
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="p-1 text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Drawer variant ─────────────────────────────────────────
interface DrawerProps {
  isOpen:     boolean;
  onClose:    () => void;
  title?:     string;
  children:   React.ReactNode;
  side?:      "left" | "right" | "bottom";
  size?:      string;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = "right",
  size = "max-w-sm",
  className,
}: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const slideClasses = {
    right:  isOpen ? "translate-x-0" : "translate-x-full",
    left:   isOpen ? "translate-x-0" : "-translate-x-full",
    bottom: isOpen ? "translate-y-0" : "translate-y-full",
  };

  const positionClasses = {
    right:  "inset-y-0 right-0 w-full",
    left:   "inset-y-0 left-0 w-full",
    bottom: "inset-x-0 bottom-0",
  };

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />
      <div
        className={cn(
          "fixed z-[70] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out",
          positionClasses[side],
          slideClasses[side],
          size,
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {(title) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb] flex-shrink-0">
            {title && (
              <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]">
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              className="p-1 text-[#6b7280] hover:text-[#1a1a1a] transition-colors ml-auto"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
}