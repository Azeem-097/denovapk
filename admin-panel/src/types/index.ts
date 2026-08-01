// ─── Admin User ───────────────────────────────────────────
export interface AdminUser {
  id:        string;
  name:      string;
  email:     string;
  role:      AdminRole;
  avatar?:   string;
  lastLogin: string;
  isActive:  boolean;
}

export type AdminRole = "super_admin" | "admin" | "manager" | "staff";

// ─── Product ──────────────────────────────────────────────
export type ProductStatus = "published" | "draft" | "archived";

export interface AdminProduct {
  id:           string;
  name:         string;
  slug:         string;
  sku:          string;
  status:       ProductStatus;
  price:        number;
  comparePrice: number | null;
  collection:   string;
  collectionId: string;
  stock:        number;
  sold:         number;
  image:        string;
  images?:       string[];  // Multiple image URLs
  brand?:       string | null;   // Optional brand name
  isNew:        boolean;
  isFeatured:   boolean;
  isBestSeller?: boolean;
  isSoldOut:    boolean;
  sortOrder?:   number;
  createdAt:    string;
  updatedAt:    string;
}

// ─── Order ────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface AdminOrderItem {
  id:        string;
  productId: string;
  name:      string;
  image:     string;
  size:      string;
  color:     string;
  price:     number;
  quantity:  number;
  sku:       string;
}

export interface AdminOrder {
  id:            string;
  orderNumber:   string;
  customer:      string;
  customerEmail: string;
  customerPhone: string;
  items:         AdminOrderItem[];
  status:        OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotal:      number;
  discount:      number;
  shipping:      number;
  total:         number;
  city:          string;
  address:       string;
  notes?:        string;
  trackingNum?:  string;
  createdAt:     string;
  updatedAt:     string;
}

// ─── Customer ─────────────────────────────────────────────
export interface AdminCustomer {
  id:          string;
  name:        string;
  email:       string;
  phone:       string;
  city:        string;
  totalOrders: number;
  totalSpent:  number;
  lastOrder:   string;
  isActive:    boolean;
  joinedAt:    string;
}

// ─── Collection ───────────────────────────────────────────
export interface AdminCollection {
  id:           string;
  name:         string;
  slug:         string;
  description:  string;
  image:        string;
  productCount: number;
  isActive:     boolean;
  createdAt:    string;
}

// ─── Discount ─────────────────────────────────────────────
export type DiscountType   = "percentage" | "fixed";
export type DiscountStatus = "active" | "expired" | "disabled";

export interface AdminDiscount {
  id:          string;
  code:        string;
  type:        DiscountType;
  value:       number;
  minOrder:    number;
  maxUses:     number;
  usedCount:   number;
  status:      DiscountStatus;
  expiresAt:   string;
  createdAt:   string;
}

// ─── Analytics ────────────────────────────────────────────
export interface DashboardStats {
  totalRevenue:     number;
  revenueChange:    number;
  totalOrders:      number;
  ordersChange:     number;
  totalCustomers:   number;
  customersChange:  number;
  totalProducts:    number;
  avgOrderValue:    number;
  conversionRate:   number;
  pendingOrders:    number;
  lowStockItems:    number;
}

export interface RevenueDataPoint {
  date:    string;
  revenue: number;
  orders:  number;
}

export interface TopProduct {
  id:       string;
  name:     string;
  image:    string;
  sold:     number;
  revenue:  number;
  stock:    number;
}

// ─── Table ────────────────────────────────────────────────
export interface TableColumn<T> {
  key:        keyof T | string;
  label:      string;
  sortable?:  boolean;
  render?:    (value: unknown, row: T) => React.ReactNode;
  width?:     string;
}

export interface SortConfig {
  key:       string;
  direction: "asc" | "desc";
}
