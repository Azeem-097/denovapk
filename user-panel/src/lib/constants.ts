export const SITE_NAME = "Denova PK";
export const SITE_DESCRIPTION = "Premium Clothing - Crafted for the Modern You";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
  { label: "Shop",        href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "New Arrivals",href: "/shop?filter=new" },
  { label: "Sale",        href: "/shop?filter=sale" },
  { label: "About",       href: "/about" },
] as const;

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending:    "Pending",
  confirmed:  "Confirmed",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
  refunded:   "Refunded",
};

export const FREE_SHIPPING_THRESHOLD = 5000; // PKR
export const ITEMS_PER_PAGE = 12;