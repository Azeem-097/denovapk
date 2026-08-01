/**
 * Database table types.
 * These match the SQL schema exactly.
 *
 * Timestamps are Unix epochs (integers) in the DB.
 * SQLite booleans stored as 0 | 1.
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
  isActive:      number;
  birthday:      string | null;
  loyaltyPoints: number;
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
  price:            number;
  comparePrice:     number | null;
  costPerItem:      number | null;
  taxRate:          number;
  status:           ProductStatus;
  collectionId:     string | null;
  isNew:            number;
  isFeatured:       number;
  isBestSeller:     number;
  isSoldOut:        number;
  metaTitle:        string | null;
  metaDescription:  string | null;
  tags:             string;
  rating:           number;
  reviewCount:      number;
  soldCount:        number;
  waist:            number | null;   // inches
  length:           number | null;   // inches
  bottom:           number | null;   // inches
  measurementsJson: string | null;
  bgColor:          string | null;   // hex e.g. "#f5f0e8" — replaces white product image background via CSS blend
  brand:            string | null;   // e.g. "Denova", "Levi's" — free text
  sortOrder:        number;
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
  id:           string;
  userId:       string;
  lastActivity: number;
  createdAt:    number;
  updatedAt:    number;
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

// ─── Abandoned Cart ──────────────────────────────────────
export interface DbAbandonedCart {
  id:               string;
  userId:           string | null;
  email:            string | null;
  phone:            string | null;
  fullName:         string | null;
  city:             string | null;
  itemsJson:        string;
  itemCount:        number;
  subtotal:         number;
  totalValue:       number;
  reachedCheckout:  number;
  isContacted:      number;
  isRecovered:      number;
  recoveredOrderId: string | null;
  adminNote:        string | null;
  lastActivity:     number;
  abandonedAt:      number;
  createdAt:        number;
  updatedAt:        number;
}

export interface AbandonedCartItem {
  productId:  string;
  variantId:  string;
  name:       string;
  image:      string;
  size:       string;
  color:      string;
  price:      number;
  quantity:   number;
  slug:       string;
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
  id:                   string;
  orderNumber:          string;
  userId:               string | null;
  guestEmail:           string | null;
  guestName:            string | null;
  guestPhone:           string | null;
  subtotal:             number;
  discount:             number;
  loyaltyDiscount:      number;
  loyaltyPointsUsed:    number;
  loyaltyPointsEarned:  number;
  birthdayDiscount:     number;
  isBirthdayOrder:      number;
  shipping:             number;
  tax:                  number;
  total:                number;
  status:               OrderStatus;
  paymentStatus:        PaymentStatus;
  paymentMethod:        PaymentMethod;
  discountCode:         string | null;
  discountId:           string | null;
  addressId:            string | null;
  shippingAddress:      string | null;
  shippingMethod:       string;
  trackingNumber:       string | null;
  courierName:          string | null;
  customerNote:         string | null;
  adminNote:            string | null;
  confirmedAt:          number | null;
  shippedAt:            number | null;
  deliveredAt:          number | null;
  cancelledAt:          number | null;
  createdById:          string | null;
  updatedById:          string | null;
  createdAt:            number;
  updatedAt:            number;
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

// ─── Loyalty ─────────────────────────────────────────────
export type LoyaltyTransactionType = "EARNED" | "REDEEMED" | "EXPIRED" | "ADJUSTED";

export interface DbLoyaltyTransaction {
  id:          string;
  userId:      string;
  orderId:     string | null;
  type:        LoyaltyTransactionType;
  points:      number;
  balance:     number;
  description: string | null;
  createdAt:   number;
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

// ─── Settings ────────────────────────────────────────────
export interface DbSetting {
  id:        string;
  key:       string;
  value:     string;
  category:  string;
  updatedAt: number;
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
