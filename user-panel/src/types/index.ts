// ─── Product Types ───────────────────────────────────────────────
export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  price: number;
  compareAtPrice?: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: ProductImage[];
  variants: ProductVariant[];
  collectionId: string;
  collection: string;
  tags: string[];
  isNew: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewCount: number;
  waist:  number | null;
  length: number | null;
  bottom: number | null;
  bgColor: string | null;   // hex e.g. "#f5f0e8" or null (keep original white background)
  brand?: string | null;   // brand name (e.g. "Denova"), or null to fall back to collection
  sku?: string;   // top-level product SKU (from DB)
  createdAt: string;
}

// ─── Collection Types ────────────────────────────────────────────
export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  minPrice?: number;
  maxPrice?: number;
}

// ─── Cart Types ──────────────────────────────────────────────────
export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  colorHex: string;
  price: number;
  quantity: number;
  slug: string;
  bgColor?: string | null;   // optional — captured at add-to-cart time
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

// ─── Wishlist Types ──────────────────────────────────────────────
export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  slug: string;
  bgColor?: string | null;
}

// ─── User / Auth Types ───────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

// ─── Order Types ─────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  address: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Testimonial Types ───────────────────────────────────────────
export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  avatar?: string;
  date: string;
}

// ─── Navigation Types ────────────────────────────────────────────
export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

// ─── Animation Types ─────────────────────────────────────────────
export type AnimationVariant = "fadeUp" | "fadeIn" | "slideLeft" | "slideRight";

export interface DevicePerformance {
  tier: "low" | "medium" | "high";
  prefersReducedMotion: boolean;
  shouldAnimate: boolean;
}