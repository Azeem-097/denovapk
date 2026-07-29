"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

interface FooterLink {
  label: string;
  href:  string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterData {
  brand: {
    name:        string;
    description: string;
    copyright:   string;
    payment:     string;
  };
  contact: {
    phone:    string;
    email:    string;
    whatsapp: string;
    address:  string;
  };
  social: {
    instagram: string;
    facebook:  string;
    tiktok:    string;
  };
  columns:     FooterColumn[];
  bottomLinks: FooterLink[];
}

const FALLBACK: FooterData = {
  brand: {
    name:        "Denova PK",
    description: "Premium clothing crafted for the modern Pakistani.",
    copyright:   "Denova PK. All rights reserved.",
    payment:     "JazzCash | EasyPaisa | COD | Bank Transfer",
  },
  contact: {
    phone: "+92 300 123 4567", email: "hello@denovapk.com",
    whatsapp: "+923001234567", address: "Lahore, Pakistan",
  },
  social: {
    instagram: "https://instagram.com/denovapk",
    facebook:  "https://facebook.com/denovapk",
    tiktok:    "https://tiktok.com/@denovapk",
  },
  columns: [
    { title: "Shop", links: [
      { label: "Premium", href: "/shop?filter=new" },
      { label: "Best Sellers", href: "/shop?filter=bestsellers" },
      { label: "Sale",         href: "/shop?filter=sale" },
      { label: "All Products", href: "/shop" },
    ]},
    { title: "Help", links: [
      { label: "Track My Order",    href: "/track-order" },
      { label: "Returns & Refunds", href: "/returns" },
      { label: "Shipping Policy",   href: "/shipping" },
      { label: "Size Guide",        href: "/size-guide" },
      { label: "FAQ",               href: "/faq" },
      { label: "Contact Us",        href: "/contact" },
    ]},
    { title: "Company", links: [
      { label: "Careers",          href: "/careers" },
      { label: "Privacy Policy",   href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ]},
  ],
  bottomLinks: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms",   href: "/terms" },
    { label: "Sitemap", href: "/sitemap" },
  ],
};

function visibleLinks(links: FooterLink[]): FooterLink[] {
  return links.filter((link) => link.href !== "/about");
}

function mergeWithFallback(api: FooterData): FooterData {
  const sourceColumns = api.columns.filter((col) => col.title.toLowerCase() !== "collections");
  const fallbackColumns = FALLBACK.columns.filter((col) => col.title.toLowerCase() !== "collections");
  const mergedColumns: FooterColumn[] = fallbackColumns.map((fbCol, i) => {
    const apiCol = sourceColumns[i];
    if (apiCol && apiCol.links && apiCol.links.length > 0) {
      return { title: apiCol.title || fbCol.title, links: visibleLinks(apiCol.links) };
    }
    return { ...fbCol, links: visibleLinks(fbCol.links) };
  });

  return {
    brand: {
      name:        api.brand.name        || FALLBACK.brand.name,
      description: api.brand.description || FALLBACK.brand.description,
      copyright:   api.brand.copyright   || FALLBACK.brand.copyright,
      payment:     api.brand.payment     || FALLBACK.brand.payment,
    },
    contact: {
      phone:    api.contact.phone    || FALLBACK.contact.phone,
      email:    api.contact.email    || FALLBACK.contact.email,
      whatsapp: api.contact.whatsapp || FALLBACK.contact.whatsapp,
      address:  api.contact.address  || FALLBACK.contact.address,
    },
    social: {
      instagram: api.social.instagram || FALLBACK.social.instagram,
      facebook:  api.social.facebook  || FALLBACK.social.facebook,
      tiktok:    api.social.tiktok    || FALLBACK.social.tiktok,
    },
    columns: mergedColumns,
    bottomLinks: (api.bottomLinks && api.bottomLinks.length > 0)
      ? api.bottomLinks
      : FALLBACK.bottomLinks,
  };
}

export function Footer() {
  const [data, setData] = useState<FooterData>(FALLBACK);
  const year = new Date().getFullYear();

  useEffect(() => {
    fetch("/api/footer")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d && !d.error) setData(mergeWithFallback(d));
      })
      .catch(() => {});
  }, []);

  const socialLinks = [
    {
      label: "Instagram",
      href:  data.social.instagram,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
        </svg>
      ),
    },
    {
      label: "Facebook",
      href:  data.social.facebook,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
        </svg>
      ),
    },
    {
      label: "TikTok",
      href:  data.social.tiktok,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      href:  data.contact.whatsapp ? `https://wa.me/${data.contact.whatsapp.replace(/[^0-9]/g, "")}` : "",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.138.564 4.14 1.545 5.873L.057 23.997l6.306-1.654A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.017-1.376l-.36-.214-3.733.979 1-3.646-.234-.374A9.818 9.818 0 0 1 12 2.182c5.427 0 9.818 4.391 9.818 9.818 0 5.428-4.391 9.818-9.818 9.818z"/>
        </svg>
      ),
    },
  ].filter((s) => s.href);

  return (
    <footer className="bg-[#1a1a1a] text-white">

      <div className="h-px bg-gradient-to-r from-transparent via-[#E10600] to-transparent" />

      <div className="site-container py-14 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-x-6 gap-y-10 lg:gap-8">

          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex flex-col leading-none mb-5">
              <span className="font-[family-name:var(--font-playfair)] text-2xl font-bold tracking-[0.08em] text-white">
                DENOVA
              </span>
              <span className="text-[9px] font-medium tracking-[0.35em] text-[#E10600] uppercase -mt-0.5">
                Pakistan
              </span>
            </Link>

            <p className="text-sm text-white/60 leading-relaxed max-w-xs mb-6">
              {data.brand.description}
            </p>

            <div className="flex flex-col gap-3 mb-6">
              {data.contact.phone && (
                <a href={`tel:${data.contact.phone}`}
                  className="flex items-center gap-2.5 text-sm text-white/60 hover:text-[#E10600] transition-colors">
                  <Phone size={14} className="text-[#E10600] flex-shrink-0" />
                  {data.contact.phone}
                </a>
              )}
              {data.contact.email && (
                <a href={`mailto:${data.contact.email}`}
                  className="flex items-center gap-2.5 text-sm text-white/60 hover:text-[#E10600] transition-colors">
                  <Mail size={14} className="text-[#E10600] flex-shrink-0" />
                  {data.contact.email}
                </a>
              )}
              {data.contact.address && (
                <div className="flex items-start gap-2.5 text-sm text-white/60">
                  <MapPin size={14} className="text-[#E10600] flex-shrink-0 mt-0.5" />
                  {data.contact.address}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:border-[#E10600] hover:text-[#E10600] transition-all duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {data.columns.map((col, i) => (
            <div key={i} className="lg:col-span-1">
              <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#E10600] mb-4">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="site-container py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/40 text-center sm:text-left">
              &copy; {year} {data.brand.copyright}
            </p>
            <div className="flex items-center gap-5">
              {data.bottomLinks.map((link) => (
                <Link key={link.href + link.label} href={link.href}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
            <p className="text-xs text-white/30">
              {data.brand.payment}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Developer credit ─── */}
      <div className="border-t border-white/5 bg-black/40">
        <div className="site-container py-3">
          <p className="text-[11px] text-white/40 text-center tracking-wide">
            Developed by{" "}
            <a
              href="https://devnixstudios.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#E10600] hover:text-white transition-colors duration-200"
            >
              Devnix Studios
            </a>
          </p>
        </div>
      </div>

    </footer>
  );
}
