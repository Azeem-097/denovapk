export const SITE_NAME = "Denova PK";
export const SITE_DESCRIPTION = "Premium Denim Clothing - Crafted for the Modern You. Pakistan's finest selvedge jeans and denim apparel. Summer 2026 Collection.";

// ══════════════════════════════════════════════════════════
// HARDCODED to always point to production domain
// ══════════════════════════════════════════════════════════
export const SITE_URL = "https://denovapk.com";

export const BRAND_COLORS = {
  primary:    "#1a1a1a",
  secondary:  "#c9a96e",
  accent:     "#f5f0e8",
  background: "#ffffff",
  surface:    "#fafaf9",
  text:       "#111111",
  muted:      "#6b7280",
  border:     "#e5e7eb",
} as const;

export const NAV_LINKS = [
  { label: "Shop",         href: "/shop" },
  { label: "Collections",  href: "/collections" },
  { label: "New Arrivals", href: "/shop?filter=new" },
  { label: "Sale",         href: "/shop?filter=sale" },
  { label: "About",        href: "/about" },
] as const;

export const SIZES = ["28", "30", "32", "34", "36", "38", "40"] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending:    "Pending",
  confirmed:  "Confirmed",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
  refunded:   "Refunded",
};

// ═══════════════════════════════════════════════════════════
// FALLBACK ONLY — actual value comes from admin settings via
// /api/shipping-config. Do NOT import this for shipping logic.
// ═══════════════════════════════════════════════════════════
export const FREE_SHIPPING_THRESHOLD = 5000;

export const ITEMS_PER_PAGE = 12;

export const BRAND_YEAR = 2026;
export const BRAND_SEASON = "Summer 2026";