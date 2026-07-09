"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, ShoppingBag, Heart, User, ChevronRight, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { navLinks } from "@/lib/data";

const collectionsDropdown = [
  { label: "Summer Essentials", href: "/collections/summer-essentials" },
  { label: "Formal Edit",       href: "/collections/formal-edit" },
  { label: "Casual Comfort",    href: "/collections/casual-comfort" },
  { label: "Winter Luxe",       href: "/collections/winter-luxe" },
];

interface NavbarMobileProps {
  isOpen: boolean;
  onClose: () => void;
  cartCount: number;
}

export function NavbarMobile({ isOpen, onClose, cartCount }: NavbarMobileProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 w-[85vw] max-w-sm bg-white flex flex-col",
          "transition-transform duration-300 ease-in-out shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
          <Link href="/" onClick={onClose} className="flex flex-col leading-none">
            <span className="font-[family-name:var(--font-playfair)] text-xl font-bold tracking-[0.08em] text-[#1a1a1a]">
              DENOVA
            </span>
            <span className="text-[9px] font-medium tracking-[0.35em] text-[#c9a96e] uppercase">
              Pakistan
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Account quick links */}
        <div className="flex border-b border-[#e5e7eb]">
          <Link
            href="/account/dashboard"
            onClick={onClose}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-[#6b7280] hover:text-[#c9a96e] transition-colors"
          >
            <User size={18} />
            <span className="text-[10px] tracking-wide">Account</span>
          </Link>
          <Link
            href="/wishlist"
            onClick={onClose}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-[#6b7280] hover:text-[#c9a96e] transition-colors border-x border-[#e5e7eb]"
          >
            <Heart size={18} />
            <span className="text-[10px] tracking-wide">Wishlist</span>
          </Link>
          <Link
            href="/cart"
            onClick={onClose}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-[#6b7280] hover:text-[#c9a96e] transition-colors relative"
          >
            <ShoppingBag size={18} />
            <span className="text-[10px] tracking-wide">Cart</span>
            {cartCount > 0 && (
              <span className="absolute top-2 right-6 w-4 h-4 flex items-center justify-center bg-[#c9a96e] text-white text-[9px] font-bold rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-2">
          {navLinks.map((link) => (
            <div key={link.label}>
              <Link
                href={link.href}
                onClick={onClose}
                className="flex items-center justify-between px-5 py-4 text-sm font-medium text-[#1a1a1a] hover:text-[#c9a96e] hover:bg-[#fafaf9] transition-colors border-b border-[#f5f5f4]"
              >
                <span className="tracking-wide">{link.label}</span>
                <ChevronRight size={16} className="text-[#6b7280]" />
              </Link>
            </div>
          ))}

          {/* Collections sub-items */}
          <div className="mt-1">
            <p className="px-5 py-2 text-[10px] font-semibold tracking-[0.15em] text-[#6b7280] uppercase">
              Collections
            </p>
            {collectionsDropdown.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center px-5 py-3 text-sm text-[#6b7280] hover:text-[#c9a96e] hover:bg-[#fafaf9] transition-colors"
              >
                <span className="w-2 h-px bg-[#c9a96e] mr-3 flex-shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-[#e5e7eb] px-5 py-4 bg-[#fafaf9]">
          <p className="text-[10px] font-semibold tracking-[0.15em] text-[#6b7280] uppercase mb-3">
            Get in Touch
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="tel:+923001234567"
              className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#c9a96e] transition-colors"
            >
              <Phone size={14} />
              +92 300 123 4567
            </a>
            <a
              href="mailto:hello@denovapk.com"
              className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#c9a96e] transition-colors"
            >
              <Mail size={14} />
              hello@denovapk.com
            </a>
          </div>
          {/* Social icons */}
          <div className="flex items-center gap-3 mt-4">
            <a
              href="https://instagram.com/denovapk"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#6b7280] hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors"
              aria-label="Instagram"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a
              href="https://facebook.com/denovapk"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#6b7280] hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors"
              aria-label="Facebook"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a
              href="https://tiktok.com/@denovapk"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#6b7280] hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors"
              aria-label="TikTok"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </>
  );
}