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
  { label: "Summer Essentials", href: "/collections/summer-essentials" },
  { label: "Formal Edit",       href: "/collections/formal-edit" },
  { label: "Casual Comfort",    href: "/collections/casual-comfort" },
  { label: "Winter Luxe",       href: "/collections/winter-luxe" },
];

export function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted,      setMounted]      = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cartCount     = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const openCart      = useCartStore((s) => s.openCart);
  const isLoggedIn    = useAuthStore((s) => s.isLoggedIn);
  const openSearch    = useSearchStore((s) => s.openSearch);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
      <header className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#e5e7eb]"
          : "bg-white/90 backdrop-blur-sm"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* MOBILE */}
          <div className="lg:hidden flex items-center justify-between h-16">
            <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-[#1a1a1a] hover:text-[#c9a96e]" aria-label="Open menu">
              <Menu size={22} />
            </button>

            <Link href="/" className="flex flex-col items-center leading-none">
              <span className="font-[family-name:var(--font-playfair)] text-xl font-bold tracking-[0.08em] text-[#1a1a1a]">DENOVA</span>
              <span className="text-[9px] font-medium tracking-[0.35em] text-[#c9a96e] uppercase -mt-0.5">Pakistan</span>
            </Link>

            <div className="flex items-center gap-1">
              <button onClick={openSearch} className="p-2 text-[#1a1a1a] hover:text-[#c9a96e]" aria-label="Search">
                <Search size={20} />
              </button>
              <button onClick={openCart} className="relative p-2 text-[#1a1a1a] hover:text-[#c9a96e]" aria-label="Cart">
                <ShoppingBag size={20} />
                {mounted && cartCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-[#c9a96e] text-white text-[9px] font-bold rounded-full">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* DESKTOP */}
          <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center h-[72px] gap-8">

            {/* Left nav */}
            <nav className="flex items-center justify-start gap-7">
              <Link href="/shop" className="text-sm font-medium tracking-wide text-[#1a1a1a] hover:text-[#c9a96e] transition-colors py-1 relative group whitespace-nowrap">
                Shop
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[#c9a96e] transition-all duration-300 group-hover:w-full" />
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-1 text-sm font-medium tracking-wide text-[#1a1a1a] hover:text-[#c9a96e] transition-colors py-1 whitespace-nowrap">
                  Collections
                  <ChevronDown size={14} className={cn("transition-transform", dropdownOpen && "rotate-180")} />
                </button>

                <div className={cn(
                  "absolute top-full left-0 mt-3 w-56 bg-white border border-[#e5e7eb] shadow-lg transition-all duration-200 origin-top",
                  dropdownOpen ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none"
                )}>
                  <div className="py-2">
                    {collectionsDropdown.map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-[#1a1a1a] hover:bg-[#f5f0e8] hover:text-[#c9a96e] transition-colors">
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-[#e5e7eb] mt-1 pt-1">
                      <Link href="/collections" onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-[#c9a96e] hover:bg-[#f5f0e8] transition-colors">
                        View All Collections →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <Link href="/shop?filter=new" className="text-sm font-medium tracking-wide text-[#1a1a1a] hover:text-[#c9a96e] transition-colors py-1 relative group whitespace-nowrap">
                New Arrivals
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[#c9a96e] transition-all duration-300 group-hover:w-full" />
              </Link>
            </nav>

            {/* Logo */}
            <Link href="/" className="flex flex-col items-center leading-none flex-shrink-0">
              <span className="font-[family-name:var(--font-playfair)] text-2xl font-bold tracking-[0.08em] text-[#1a1a1a] hover:text-[#c9a96e] transition-colors duration-300">DENOVA</span>
              <span className="text-[9px] font-medium tracking-[0.35em] text-[#c9a96e] uppercase -mt-0.5">Pakistan</span>
            </Link>

            {/* Right */}
            <div className="flex items-center justify-end gap-7">
              <Link href="/shop?filter=sale" className="text-sm font-medium tracking-wide text-[#1a1a1a] hover:text-[#c9a96e] transition-colors py-1 relative group whitespace-nowrap">
                Sale
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[#c9a96e] transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="/about" className="text-sm font-medium tracking-wide text-[#1a1a1a] hover:text-[#c9a96e] transition-colors py-1 relative group whitespace-nowrap">
                About
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[#c9a96e] transition-all duration-300 group-hover:w-full" />
              </Link>

              <div className="flex items-center gap-1 ml-3 pl-3 border-l border-[#e5e7eb]">
                <button onClick={openSearch} className="p-2 text-[#1a1a1a] hover:text-[#c9a96e]" aria-label="Search">
                  <Search size={19} />
                </button>
                <Link href="/wishlist" className="relative p-2 text-[#1a1a1a] hover:text-[#c9a96e]" aria-label="Wishlist">
                  <Heart size={19} />
                  {mounted && wishlistCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-[#c9a96e] text-white text-[9px] font-bold rounded-full">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </Link>
                <Link href={accountHref} className="p-2 text-[#1a1a1a] hover:text-[#c9a96e] relative" aria-label="Account">
                  <User size={19} />
                  {mounted && isLoggedIn && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#c9a96e]" />
                  )}
                </Link>
                <button onClick={openCart} className="relative p-2 text-[#1a1a1a] hover:text-[#c9a96e]" aria-label="Cart">
                  <ShoppingBag size={19} />
                  {mounted && cartCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-[#c9a96e] text-white text-[9px] font-bold rounded-full">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={cn(
          "h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent transition-opacity duration-300",
          scrolled ? "opacity-100" : "opacity-0"
        )} />
      </header>

      <NavbarMobile isOpen={mobileOpen} onClose={() => setMobileOpen(false)} cartCount={cartCount} />
    </>
  );
}