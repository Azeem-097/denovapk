"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Heart, ShoppingBag, User, Menu, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavbarMobile } from "./NavbarMobile";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { useSearchStore } from "@/store/searchStore";

const collectionsDropdown = [
  { label: "Premium",       href: "/collections/premium" },
  { label: "Super Premium", href: "/collections/super-premium" },
];

// ═══════════════════════════════════════════════════════════
//  Cloudinary logo (transparent, 612 x 408 source)
// ═══════════════════════════════════════════════════════════
const LOGO_BASE = "https://res.cloudinary.com/djy5qqco7/image/upload";
const LOGO_ID   = "v1784388373/denovapk/general/logo-without-bg_1784388368531";
const LOGO_DESKTOP = `${LOGO_BASE}/e_trim:10/f_auto,q_auto,c_limit,h_160/${LOGO_ID}`;
const LOGO_MOBILE  = `${LOGO_BASE}/e_trim:10/f_auto,q_auto,c_limit,h_120/${LOGO_ID}`;

export function Navbar() {
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted,      setMounted]      = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef   = useRef<HTMLElement>(null);
  const dividerRef  = useRef<HTMLDivElement>(null);
  const scrolledRef = useRef<boolean>(false);

  const cartCount     = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const openCart      = useCartStore((s) => s.openCart);
  const isLoggedIn    = useAuthStore((s) => s.isLoggedIn);
  const openSearch    = useSearchStore((s) => s.openSearch);

  useEffect(() => setMounted(true), []);

  // ─── SCROLL — ZERO React re-renders ───────────────────
  // Only mutates DOM class + divider opacity when scroll
  // ACTUALLY crosses the 20px threshold (not every frame)
  useEffect(() => {
    let rafId = 0;

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const isScrolled = window.scrollY > 20;
        if (isScrolled !== scrolledRef.current) {
          scrolledRef.current = isScrolled;
          const header = headerRef.current;
          const div    = dividerRef.current;
          if (header) {
            if (isScrolled) {
              header.classList.add("shadow-sm", "border-[#e5e7eb]");
              header.classList.remove("border-transparent");
            } else {
              header.classList.remove("shadow-sm", "border-[#e5e7eb]");
              header.classList.add("border-transparent");
            }
          }
          if (div) div.style.opacity = isScrolled ? "1" : "0";
        }
        rafId = 0;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const accountHref = mounted && isLoggedIn ? "/account/dashboard" : "/account/login";

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 left-0 right-0 z-40 transition-all duration-300",
          "bg-white overflow-hidden",
          "border-b border-transparent"
        )}
      >
        <div className="site-container">

          {/* ═══════════════════════════════════════════════════
              MOBILE
              ═══════════════════════════════════════════════════ */}
          <div className="lg:hidden relative flex items-center justify-between h-16">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 text-[#1a1a1a] hover:text-[#3b5f8f]"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center h-11 pointer-events-auto" aria-label="Denova PK home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LOGO_MOBILE}
                alt="Denova PK"
                className="block h-full w-auto max-h-11 object-contain"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </Link>

            <div className="flex items-center gap-1">
              <button onClick={openSearch} className="p-2 text-[#1a1a1a] hover:text-[#3b5f8f]" aria-label="Search">
                <Search size={20} />
              </button>
              <button onClick={openCart} className="relative p-2 text-[#1a1a1a] hover:text-[#3b5f8f]" aria-label="Cart">
                <ShoppingBag size={20} />
                {mounted && cartCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-[#3b5f8f] text-white text-[9px] font-bold rounded-full">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              DESKTOP
              ═══════════════════════════════════════════════════ */}
          <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center h-[88px] gap-8">

            <nav className="flex items-center justify-start gap-7">
              <Link href="/shop" className="text-sm font-medium tracking-wide text-[#1a1a1a] hover:text-[#3b5f8f] transition-colors py-1 relative group whitespace-nowrap">
                Shop
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[#3b5f8f] transition-all duration-300 group-hover:w-full" />
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1 text-sm font-medium tracking-wide text-[#1a1a1a] hover:text-[#3b5f8f] transition-colors py-1 whitespace-nowrap"
                >
                  Collections
                  <ChevronDown size={14} className={cn("transition-transform", dropdownOpen && "rotate-180")} />
                </button>

                <div className={cn(
                  "absolute top-full left-0 mt-3 w-56 bg-white border border-[#e5e7eb] shadow-lg transition-all duration-200 origin-top z-50",
                  dropdownOpen ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none"
                )}>
                  <div className="py-2">
                    {collectionsDropdown.map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-[#1a1a1a] hover:bg-[#f5f0e8] hover:text-[#3b5f8f] transition-colors">
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-[#e5e7eb] mt-1 pt-1">
                      <Link href="/collections" onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-[#3b5f8f] hover:bg-[#f5f0e8] transition-colors">
                        View All Collections →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <Link href="/shop?filter=new" className="text-sm font-medium tracking-wide text-[#1a1a1a] hover:text-[#3b5f8f] transition-colors py-1 relative group whitespace-nowrap">
                New Arrivals
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[#3b5f8f] transition-all duration-300 group-hover:w-full" />
              </Link>
            </nav>

            <Link href="/" className="flex items-center h-16 flex-shrink-0 hover:opacity-80 transition-opacity duration-300" aria-label="Denova PK home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LOGO_DESKTOP}
                alt="Denova PK"
                className="block h-full w-auto max-h-11 object-contain"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </Link>

            <div className="flex items-center justify-end gap-7">
              <Link href="/shop?filter=sale" className="text-sm font-medium tracking-wide text-[#1a1a1a] hover:text-[#3b5f8f] transition-colors py-1 relative group whitespace-nowrap">
                Sale
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[#3b5f8f] transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="/about" className="text-sm font-medium tracking-wide text-[#1a1a1a] hover:text-[#3b5f8f] transition-colors py-1 relative group whitespace-nowrap">
                About
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[#3b5f8f] transition-all duration-300 group-hover:w-full" />
              </Link>

              <div className="flex items-center gap-1 ml-3 pl-3 border-l border-[#e5e7eb]">
                <button onClick={openSearch} className="p-2 text-[#1a1a1a] hover:text-[#3b5f8f]" aria-label="Search">
                  <Search size={19} />
                </button>
                <Link href="/wishlist" className="relative p-2 text-[#1a1a1a] hover:text-[#3b5f8f]" aria-label="Wishlist">
                  <Heart size={19} />
                  {mounted && wishlistCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-[#3b5f8f] text-white text-[9px] font-bold rounded-full">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </Link>
                <Link href={accountHref} className="p-2 text-[#1a1a1a] hover:text-[#3b5f8f] relative" aria-label="Account">
                  <User size={19} />
                  {mounted && isLoggedIn && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#3b5f8f]" />
                  )}
                </Link>
                <button onClick={openCart} className="relative p-2 text-[#1a1a1a] hover:text-[#3b5f8f]" aria-label="Cart">
                  <ShoppingBag size={19} />
                  {mounted && cartCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-[#3b5f8f] text-white text-[9px] font-bold rounded-full">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider - opacity controlled directly via ref */}
        <div
          ref={dividerRef}
          className="h-px bg-gradient-to-r from-transparent via-[#3b5f8f]/40 to-transparent transition-opacity duration-300"
          style={{ opacity: 0 }}
        />
      </header>

      <NavbarMobile isOpen={mobileOpen} onClose={() => setMobileOpen(false)} cartCount={cartCount} />
    </>
  );
}