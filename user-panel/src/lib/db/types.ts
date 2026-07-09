/**
 * Database table types.
 * These match the SQL schema exactly.
 *
 * Timestamps are Unix epochs (integers) in the DB, but we
 * convert them to Date on the way out via helper functions.
 */

// ─── Users ───────────────────────────────────────────────
export interface DbUser {
  id:            string;
  name:          string;
  email:         string;
  emailVerified: number | null;
  phone:         string | null;
  password:      string | null;
  avatar:        string | null;
  isActive:      number; // 0 | 1
  createdAt:     number;
  updatedAt:     number;
}

export interface DbAdmin {
  id:         string;
  name:       string;
  email:      string;
  password:   string;
  role:       "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "STAFF";
  avatar:     string | null;
  isActive:   number;
  lastLogin:  number | null;
  createdAt:  number;
  updatedAt:  number;
}

export interface DbAddress {
  id:          string;
  userId:      string;
  label:       string;
  fullName:    string;
  phone:       string;
  street:      string;
  apartment:   string | null;
  city:        string;
  province:    string;
  postalCode:  string;
  country:     string;
  isDefault:   number;
  createdAt:   number;
  updatedAt:   number;
}

// ─── Collections ─────────────────────────────────────────
export interface DbCollection {
  id:              string;
  name:            string;
  slug:            string;
  description:     string;
  image:           string | null;
  isActive:        number;
  sortOrder:       number;
  metaTitle:       string | null;
  metaDescription: string | null;
  createdAt:       number;
  updatedAt:       number;
}

// ─── Products ────────────────────────────────────────────
export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface DbProduct {
  id:               string;
  name:             string;
  slug:             string;
  sku:              string;
  description:      string;
  shortDescription: string | null;
  price:            number; // in paisa
  comparePrice:     number | null;
  costPerItem:      number | null;
  taxRate:          number;
  status:           ProductStatus;
  collectionId:     string | null;
  isNew:            number;
  isFeatured:       number;
  isBestSeller:     number;
  metaTitle:        string | null;
  metaDescription:  string | null;
  tags:             string; // Comma-separated
  rating:           number;
  reviewCount:      number;
  soldCount:        number;
  createdAt:        number;
  updatedAt:        number;
}

export interface DbProductImage {
  id:        string;
  productId: string;
  url:       string;
  alt:       string;
  isPrimary: number;
  sortOrder: number;
}

export interface DbProductVariant {
  id:              string;
  productId:       string;
  size:            string;
  color:           string;
  colorHex:        string;
  sku:             string;
  stock:           number;
  price:           number;
  compareAtPrice:  number | null;
  weight:          number | null;
  createdAt:       number;
  updatedAt:       number;
}

// ─── Cart & Wishlist ─────────────────────────────────────
export interface DbCart {
  id:        string;
  userId:    string;
  createdAt: number;
  updatedAt: number;
}

export interface DbCartItem {
  id:        string;
  cartId:    string;
  productId: string;
  variantId: string;
  quantity:  number;
  createdAt: number;
  updatedAt: number;
}

export interface DbWishlist {
  id:        string;
  userId:    string;
  productId: string;
  createdAt: number;
}

// ─── Orders ──────────────────────────────────────────────
export type OrderStatus =
  | "PENDING" | "CONFIRMED" | "PROCESSING"
  | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";

export type PaymentStatus =
  | "PENDING" | "PAID" | "FAILED"
  | "REFUNDED" | "PARTIALLY_REFUNDED";

export type PaymentMethod =
  | "COD" | "CARD" | "JAZZCASH" | "EASYPAISA" | "BANK_TRANSFER";

export interface DbOrder {
  id:               string;
  orderNumber:      string;
  userId:           string | null;
  guestEmail:       string | null;
  guestName:        string | null;
  guestPhone:       string | null;
  subtotal:         number;
  discount:         number;
  shipping:         number;
  tax:              number;
  total:            number;
  status:           OrderStatus;
  paymentStatus:    PaymentStatus;
  paymentMethod:    PaymentMethod;
  discountCode:     string | null;
  discountId:       string | null;
  addressId:        string | null;
  shippingAddress:  string | null; // JSON
  shippingMethod:   string;
  trackingNumber:   string | null;
  courierName:      string | null;
  customerNote:     string | null;
  adminNote:        string | null;
  confirmedAt:      number | null;
  shippedAt:        number | null;
  deliveredAt:      number | null;
  cancelledAt:      number | null;
  createdById:      string | null;
  updatedById:      string | null;
  createdAt:        number;
  updatedAt:        number;
}

export interface DbOrderItem {
  id:        string;
  orderId:   string;
  productId: string;
  variantId: string;
  name:      string;
  image:     string;
  size:      string;
  color:     string;
  sku:       string;
  price:     number;
  quantity:  number;
  subtotal:  number;
}

// ─── Discounts ───────────────────────────────────────────
export type DiscountType   = "PERCENTAGE" | "FIXED";
export type DiscountStatus = "ACTIVE" | "EXPIRED" | "DISABLED";

export interface DbDiscount {
  id:          string;
  code:        string;
  type:        DiscountType;
  value:       number;
  minOrder:    number;
  maxUses:     number;
  usedCount:   number;
  status:      DiscountStatus;
  startsAt:    number;
  expiresAt:   number;
  createdAt:   number;
  updatedAt:   number;
}

// ─── Others ──────────────────────────────────────────────
export interface DbReview {
  id:          string;
  userId:      string;
  productId:   string;
  rating:      number;
  title:       string | null;
  comment:     string;
  isVerified:  number;
  isApproved:  number;
  createdAt:   number;
  updatedAt:   number;
}

export interface DbNewsletter {
  id:            string;
  email:         string;
  isSubscribed:  number;
  source:        string | null;
  createdAt:     number;
  updatedAt:     number;
}

export interface DbContactMessage {
  id:         string;
  name:       string;
  email:      string;
  phone:      string | null;
  subject:    string;
  message:    string;
  isRead:     number;
  isReplied:  number;
  adminNote:  string | null;
  createdAt:  number;
  updatedAt:  number;
}