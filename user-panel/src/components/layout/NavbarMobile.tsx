"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, ShoppingBag, Heart, User, ChevronRight, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const LOGO_MOBILE = "https://res.cloudinary.com/djy5qqco7/image/upload/e_trim:10/f_auto,q_auto,c_limit,h_120/v1784388373/denovapk/general/logo-without-bg_1784388368531";
const MOBILE_NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Premium", href: "/shop?filter=new" },
  { label: "Sale", href: "/shop?filter=sale" },
];

interface MobileSiteInfo {
  email: string;
  phone: string;
}

const DEFAULT_SITE_INFO: MobileSiteInfo = {
  email: "hello@denovapk.com",
  phone: "+92 300 123 4567",
};

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

interface NavbarMobileProps {
  isOpen: boolean;
  onClose: () => void;
  cartCount: number;
}

export function NavbarMobile({ isOpen, onClose, cartCount }: NavbarMobileProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [siteInfo, setSiteInfo] = useState(DEFAULT_SITE_INFO);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const controller = new AbortController();
    fetch("/api/site-info", { signal: controller.signal, cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        setSiteInfo({
          email: typeof data.email === "string" && data.email.trim() ? data.email : DEFAULT_SITE_INFO.email,
          phone: typeof data.phone === "string" && data.phone.trim() ? data.phone : DEFAULT_SITE_INFO.phone,
        });
      })
      .catch((error) => {
        if (error?.name !== "AbortError") setSiteInfo(DEFAULT_SITE_INFO);
      });

    return () => controller.abort();
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

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

        {/* Header — logo with strict height cap */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e5e7eb]">
          <Link href="/" onClick={onClose} className="flex items-center h-11" aria-label="Denova PK home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_MOBILE}
              alt="Denova PK"
              className="block h-full w-auto max-h-11 object-contain"
              loading="eager"
              decoding="async"
            />
          </Link>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex border-b border-[#e5e7eb]">
          <Link href="/account/dashboard" onClick={onClose} className="flex-1 flex flex-col items-center gap-1 py-3 text-[#6b7280] hover:text-[#E10600] transition-colors">
            <User size={18} />
            <span className="text-[10px] tracking-wide">Account</span>
          </Link>
          <Link href="/wishlist" onClick={onClose} className="flex-1 flex flex-col items-center gap-1 py-3 text-[#6b7280] hover:text-[#E10600] transition-colors border-x border-[#e5e7eb]">
            <Heart size={18} />
            <span className="text-[10px] tracking-wide">Wishlist</span>
          </Link>
          <Link href="/cart" onClick={onClose} className="flex-1 flex flex-col items-center gap-1 py-3 text-[#6b7280] hover:text-[#E10600] transition-colors relative">
            <ShoppingBag size={18} />
            <span className="text-[10px] tracking-wide">Cart</span>
            {mounted && cartCount > 0 && (
              <span className="absolute top-2 right-6 w-4 h-4 flex items-center justify-center bg-[#E10600] text-white text-[9px] font-bold rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {MOBILE_NAV_LINKS.map((link) => (
            <div key={link.label}>
              <Link href={link.href} onClick={onClose} className="flex items-center justify-between px-5 py-4 text-base font-medium text-[#1a1a1a] hover:text-[#E10600] hover:bg-[#fafaf9] transition-colors border-b border-[#f5f5f4]">
                <span className="tracking-wide">{link.label}</span>
                <ChevronRight size={16} className="text-[#6b7280]" />
              </Link>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#e5e7eb] px-5 py-4 bg-[#fafaf9]">
          <p className="text-[10px] font-semibold tracking-[0.15em] text-[#6b7280] uppercase mb-3">
            Get in Touch
          </p>
          <div className="flex flex-col gap-2">
            <a href={`tel:${normalizePhone(siteInfo.phone)}`} className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#E10600] transition-colors">
              <Phone size={14} />
              {siteInfo.phone}
            </a>
            <a href={`mailto:${siteInfo.email}`} className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#E10600] transition-colors">
              <Mail size={14} />
              {siteInfo.email}
            </a>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <a href="https://instagram.com/denovapk" target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#6b7280] hover:border-[#E10600] hover:text-[#E10600] transition-colors" aria-label="Instagram">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href="https://facebook.com/denovapk" target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#6b7280] hover:border-[#E10600] hover:text-[#E10600] transition-colors" aria-label="Facebook">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="https://tiktok.com/@denovapk" target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full border border-[#e5e7eb] text-[#6b7280] hover:border-[#E10600] hover:text-[#E10600] transition-colors" aria-label="TikTok">
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
