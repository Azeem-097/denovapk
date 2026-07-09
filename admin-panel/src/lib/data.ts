import type {
  AdminProduct, AdminOrder, AdminCustomer,
  AdminCollection, AdminDiscount,
  DashboardStats, RevenueDataPoint, TopProduct,
} from "@/types";

// ─── Dashboard Stats ──────────────────────────────────────
export const dashboardStats: DashboardStats = {
  totalRevenue:    2847500,
  revenueChange:   12.5,
  totalOrders:     1284,
  ordersChange:    8.3,
  totalCustomers:  3421,
  customersChange: 15.2,
  totalProducts:   84,
  avgOrderValue:   2217,
  conversionRate:  3.4,
  pendingOrders:   23,
  lowStockItems:   7,
};

// ─── Revenue Chart Data ───────────────────────────────────
export const revenueData: RevenueDataPoint[] = [
  { date: "Jan", revenue: 180000,  orders: 82  },
  { date: "Feb", revenue: 220000,  orders: 98  },
  { date: "Mar", revenue: 195000,  orders: 89  },
  { date: "Apr", revenue: 280000,  orders: 124 },
  { date: "May", revenue: 310000,  orders: 142 },
  { date: "Jun", revenue: 265000,  orders: 118 },
  { date: "Jul", revenue: 340000,  orders: 157 },
  { date: "Aug", revenue: 298000,  orders: 134 },
  { date: "Sep", revenue: 385000,  orders: 173 },
  { date: "Oct", revenue: 420000,  orders: 189 },
  { date: "Nov", revenue: 510000,  orders: 226 },
  { date: "Dec", revenue: 445000,  orders: 201 },
];

// ─── Top Products ─────────────────────────────────────────
export const topProducts: TopProduct[] = [
  { id: "1", name: "Embroidered Lawn Suit",  image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&q=80", sold: 312, revenue: 2028000, stock: 8  },
  { id: "2", name: "Classic Linen Kurta",    image: "https://images.unsplash.com/photo-1604975701397-6365ccbd028a?w=200&q=80", sold: 278, revenue: 973000,  stock: 15 },
  { id: "3", name: "Cotton Pique Polo",      image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=200&q=80", sold: 241, revenue: 530200,  stock: 32 },
  { id: "4", name: "Premium Formal Shirt",   image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&q=80", sold: 198, revenue: 554400,  stock: 21 },
  { id: "5", name: "Relaxed Chino Trousers", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&q=80", sold: 167, revenue: 534400,  stock: 18 },
];

// ─── Products ─────────────────────────────────────────────
export const adminProducts: AdminProduct[] = [
  { id: "p1",  name: "Classic Linen Kurta",    slug: "classic-linen-kurta",    sku: "CLK-001", status: "published", price: 3500,  comparePrice: 4500,  collection: "Summer Essentials", collectionId: "col-1", stock: 23,  sold: 278, image: "https://images.unsplash.com/photo-1604975701397-6365ccbd028a?w=200&q=80", isNew: false, isFeatured: true,  createdAt: "2024-03-01", updatedAt: "2024-07-15" },
  { id: "p2",  name: "Premium Formal Shirt",   slug: "premium-formal-shirt",   sku: "PFS-001", status: "published", price: 2800,  comparePrice: null,  collection: "Formal Edit",       collectionId: "col-2", stock: 18,  sold: 198, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&q=80", isNew: true,  isFeatured: true,  createdAt: "2024-05-10", updatedAt: "2024-07-10" },
  { id: "p3",  name: "Relaxed Chino Trousers", slug: "relaxed-chino-trousers", sku: "RCT-001", status: "published", price: 3200,  comparePrice: 3800,  collection: "Casual Comfort",    collectionId: "col-3", stock: 27,  sold: 167, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&q=80", isNew: true,  isFeatured: false, createdAt: "2024-06-01", updatedAt: "2024-07-05" },
  { id: "p4",  name: "Wool Blend Overcoat",    slug: "wool-blend-overcoat",    sku: "WBO-001", status: "published", price: 12000, comparePrice: 15000, collection: "Winter Luxe",       collectionId: "col-4", stock: 7,   sold: 43,  image: "https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=200&q=80", isNew: false, isFeatured: true,  createdAt: "2024-01-15", updatedAt: "2024-06-20" },
  { id: "p5",  name: "Embroidered Lawn Suit",  slug: "embroidered-lawn-suit",  sku: "ELS-001", status: "published", price: 6500,  comparePrice: 8000,  collection: "Summer Essentials", collectionId: "col-1", stock: 14,  sold: 312, image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&q=80", isNew: true,  isFeatured: true,  createdAt: "2024-05-20", updatedAt: "2024-07-18" },
  { id: "p6",  name: "Structured Blazer",      slug: "structured-blazer",      sku: "SB-001",  status: "published", price: 8500,  comparePrice: null,  collection: "Formal Edit",       collectionId: "col-2", stock: 12,  sold: 78,  image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&q=80", isNew: false, isFeatured: true,  createdAt: "2024-02-28", updatedAt: "2024-07-01" },
  { id: "p7",  name: "Cotton Pique Polo",      slug: "cotton-pique-polo",      sku: "CPP-001", status: "published", price: 2200,  comparePrice: null,  collection: "Casual Comfort",    collectionId: "col-3", stock: 42,  sold: 241, image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=200&q=80", isNew: true,  isFeatured: false, createdAt: "2024-06-10", updatedAt: "2024-07-12" },
  { id: "p8",  name: "Cashmere Roll-Neck",     slug: "cashmere-roll-neck",     sku: "CRN-001", status: "published", price: 9800,  comparePrice: 12000, collection: "Winter Luxe",       collectionId: "col-4", stock: 5,   sold: 32,  image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&q=80", isNew: false, isFeatured: true,  createdAt: "2024-01-20", updatedAt: "2024-06-18" },
  { id: "p9",  name: "Silk Evening Kurta",     slug: "silk-evening-kurta",     sku: "SEK-001", status: "draft",     price: 7200,  comparePrice: null,  collection: "Formal Edit",       collectionId: "col-2", stock: 0,   sold: 0,   image: "https://images.unsplash.com/photo-1594938298603-c8148c4b5a20?w=200&q=80", isNew: true,  isFeatured: false, createdAt: "2024-07-20", updatedAt: "2024-07-20" },
  { id: "p10", name: "Linen Trouser Set",      slug: "linen-trouser-set",      sku: "LTS-001", status: "archived",  price: 4800,  comparePrice: 5500,  collection: "Summer Essentials", collectionId: "col-1", stock: 3,   sold: 54,  image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=200&q=80", isNew: false, isFeatured: false, createdAt: "2024-02-10", updatedAt: "2024-07-08" },
];

// ─── Orders ───────────────────────────────────────────────
export const adminOrders: AdminOrder[] = [
  { id: "o1",  orderNumber: "DNV00001", customer: "Ayesha Mahmood",  customerEmail: "ayesha@email.com", customerPhone: "+92 300 1111111", items: [{ id: "oi1", productId: "p5", name: "Embroidered Lawn Suit",  image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=100", size: "M",  color: "Mint",  price: 6500,  quantity: 2, sku: "ELS-M-M" }], status: "delivered",  paymentStatus: "paid",    paymentMethod: "JazzCash",  subtotal: 13000, discount: 0,    shipping: 0,   total: 13000, city: "Lahore",    address: "DHA Phase 5, Lahore", createdAt: "2024-06-15", updatedAt: "2024-06-19" },
  { id: "o2",  orderNumber: "DNV00002", customer: "Usman Tariq",     customerEmail: "usman@email.com",  customerPhone: "+92 301 2222222", items: [{ id: "oi2", productId: "p2", name: "Premium Formal Shirt",   image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100", size: "L",  color: "Navy",  price: 2800,  quantity: 3, sku: "PFS-L-N" }], status: "shipped",    paymentStatus: "paid",    paymentMethod: "Card",      subtotal: 8400,  discount: 0,    shipping: 250, total: 8650,  city: "Karachi",   address: "Clifton Block 4",     createdAt: "2024-07-10", updatedAt: "2024-07-12" },
  { id: "o3",  orderNumber: "DNV00003", customer: "Sana Rizvi",      customerEmail: "sana@email.com",   customerPhone: "+92 302 3333333", items: [{ id: "oi3", productId: "p8", name: "Cashmere Roll-Neck",     image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100", size: "S",  color: "Cream", price: 9800,  quantity: 1, sku: "CRN-S-C" }], status: "processing", paymentStatus: "paid",    paymentMethod: "EasyPaisa", subtotal: 9800,  discount: 0,    shipping: 0,   total: 9800,  city: "Islamabad", address: "F-7/2 Islamabad",     createdAt: "2024-08-01", updatedAt: "2024-08-02" },
  { id: "o4",  orderNumber: "DNV00004", customer: "Bilal Ahmed",     customerEmail: "bilal@email.com",  customerPhone: "+92 303 4444444", items: [{ id: "oi4", productId: "p4", name: "Wool Blend Overcoat",    image: "https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=100", size: "L",  color: "Camel", price: 12000, quantity: 1, sku: "WBO-L-C" }], status: "confirmed",  paymentStatus: "pending", paymentMethod: "COD",       subtotal: 12000, discount: 500,  shipping: 0,   total: 11500, city: "Rawalpindi", address: "Bahria Town Phase 8", createdAt: "2024-08-05", updatedAt: "2024-08-05" },
  { id: "o5",  orderNumber: "DNV00005", customer: "Fatima Khan",     customerEmail: "fatima@email.com", customerPhone: "+92 304 5555555", items: [{ id: "oi5", productId: "p1", name: "Classic Linen Kurta",    image: "https://images.unsplash.com/photo-1604975701397-6365ccbd028a?w=100", size: "S",  color: "White", price: 3500,  quantity: 2, sku: "CLK-S-W" }, { id: "oi6", productId: "p7", name: "Cotton Pique Polo", image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=100", size: "M", color: "Navy", price: 2200, quantity: 1, sku: "CPP-M-N" }], status: "pending", paymentStatus: "pending", paymentMethod: "COD", subtotal: 9200, discount: 0, shipping: 0, total: 9200, city: "Lahore", address: "Gulberg III, Lahore", createdAt: "2024-08-08", updatedAt: "2024-08-08" },
  { id: "o6",  orderNumber: "DNV00006", customer: "Hassan Sheikh",   customerEmail: "hassan@email.com", customerPhone: "+92 305 6666666", items: [{ id: "oi7", productId: "p6", name: "Structured Blazer",     image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100", size: "M",  color: "Charcoal", price: 8500, quantity: 1, sku: "SB-M-C" }], status: "cancelled", paymentStatus: "refunded", paymentMethod: "Card", subtotal: 8500, discount: 0, shipping: 500, total: 9000, city: "Faisalabad", address: "Canal Road Faisalabad", createdAt: "2024-07-25", updatedAt: "2024-07-28" },
  { id: "o7",  orderNumber: "DNV00007", customer: "Zainab Ahmed",    customerEmail: "zainab@email.com", customerPhone: "+92 306 7777777", items: [{ id: "oi8", productId: "p5", name: "Embroidered Lawn Suit",  image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=100", size: "L",  color: "Peach", price: 6500,  quantity: 1, sku: "ELS-L-P" }], status: "delivered",  paymentStatus: "paid",    paymentMethod: "Bank",      subtotal: 6500,  discount: 650,  shipping: 0,   total: 5850,  city: "Multan",    address: "Gulshan Colony Multan", createdAt: "2024-07-05", updatedAt: "2024-07-09" },
  { id: "o8",  orderNumber: "DNV00008", customer: "Ali Raza",        customerEmail: "ali@email.com",    customerPhone: "+92 307 8888888", items: [{ id: "oi9", productId: "p3", name: "Relaxed Chino Trousers", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=100", size: "M",  color: "Khaki", price: 3200,  quantity: 2, sku: "RCT-M-K" }], status: "shipped",    paymentStatus: "paid",    paymentMethod: "JazzCash",  subtotal: 6400,  discount: 0,    shipping: 0,   total: 6400,  city: "Peshawar", address: "University Town Peshawar", createdAt: "2024-08-03", updatedAt: "2024-08-06" },
];

// ─── Customers ────────────────────────────────────────────
export const adminCustomers: AdminCustomer[] = [
  { id: "c1", name: "Ayesha Mahmood",  email: "ayesha@email.com",  phone: "+92 300 1111111", city: "Lahore",     totalOrders: 8,  totalSpent: 72000,  lastOrder: "2024-08-01", isActive: true,  joinedAt: "2024-01-10" },
  { id: "c2", name: "Usman Tariq",     email: "usman@email.com",   phone: "+92 301 2222222", city: "Karachi",    totalOrders: 5,  totalSpent: 43250,  lastOrder: "2024-07-10", isActive: true,  joinedAt: "2024-02-15" },
  { id: "c3", name: "Sana Rizvi",      email: "sana@email.com",    phone: "+92 302 3333333", city: "Islamabad",  totalOrders: 12, totalSpent: 118500, lastOrder: "2024-08-05", isActive: true,  joinedAt: "2023-11-20" },
  { id: "c4", name: "Bilal Ahmed",     email: "bilal@email.com",   phone: "+92 303 4444444", city: "Rawalpindi", totalOrders: 3,  totalSpent: 28000,  lastOrder: "2024-08-05", isActive: true,  joinedAt: "2024-04-08" },
  { id: "c5", name: "Fatima Khan",     email: "fatima@email.com",  phone: "+92 304 5555555", city: "Lahore",     totalOrders: 15, totalSpent: 142000, lastOrder: "2024-08-08", isActive: true,  joinedAt: "2023-09-05" },
  { id: "c6", name: "Hassan Sheikh",   email: "hassan@email.com",  phone: "+92 305 6666666", city: "Faisalabad", totalOrders: 2,  totalSpent: 17500,  lastOrder: "2024-07-25", isActive: false, joinedAt: "2024-05-12" },
  { id: "c7", name: "Zainab Ahmed",    email: "zainab@email.com",  phone: "+92 306 7777777", city: "Multan",     totalOrders: 7,  totalSpent: 58900,  lastOrder: "2024-07-05", isActive: true,  joinedAt: "2024-01-28" },
  { id: "c8", name: "Ali Raza",        email: "ali@email.com",     phone: "+92 307 8888888", city: "Peshawar",   totalOrders: 4,  totalSpent: 31200,  lastOrder: "2024-08-03", isActive: true,  joinedAt: "2024-03-17" },
];

// ─── Collections ──────────────────────────────────────────
export const adminCollections: AdminCollection[] = [
  { id: "col-1", name: "Summer Essentials", slug: "summer-essentials", description: "Light, breathable pieces for the warm season", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400", productCount: 24, isActive: true,  createdAt: "2024-01-01" },
  { id: "col-2", name: "Formal Edit",       slug: "formal-edit",       description: "Sophisticated styles for every occasion",    image: "https://images.unsplash.com/photo-1594938298603-c8148c4b5a20?w=400", productCount: 18, isActive: true,  createdAt: "2024-01-01" },
  { id: "col-3", name: "Casual Comfort",    slug: "casual-comfort",    description: "Everyday wear without compromise",           image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400", productCount: 32, isActive: true,  createdAt: "2024-01-01" },
  { id: "col-4", name: "Winter Luxe",       slug: "winter-luxe",       description: "Warm, refined pieces for cooler days",      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400", productCount: 20, isActive: true,  createdAt: "2024-01-01" },
  { id: "col-5", name: "Eid Festive",       slug: "eid-festive",       description: "Exclusive festive collection",              image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400", productCount: 0,  isActive: false, createdAt: "2024-07-01" },
];

// ─── Discounts ────────────────────────────────────────────
export const adminDiscounts: AdminDiscount[] = [
  { id: "d1", code: "DENOVA10",   type: "percentage", value: 10, minOrder: 3000,  maxUses: 500,  usedCount: 284, status: "active",   expiresAt: "2024-12-31", createdAt: "2024-01-01" },
  { id: "d2", code: "WELCOME500", type: "fixed",      value: 500, minOrder: 2000, maxUses: 200,  usedCount: 198, status: "active",   expiresAt: "2024-09-30", createdAt: "2024-06-01" },
  { id: "d3", code: "EID2024",    type: "percentage", value: 20, minOrder: 5000,  maxUses: 1000, usedCount: 1000,status: "expired",  expiresAt: "2024-04-15", createdAt: "2024-04-01" },
  { id: "d4", code: "SUMMER15",   type: "percentage", value: 15, minOrder: 4000,  maxUses: 300,  usedCount: 67,  status: "active",   expiresAt: "2024-10-31", createdAt: "2024-07-01" },
  { id: "d5", code: "FLAT1000",   type: "fixed",      value: 1000, minOrder: 8000,maxUses: 100,  usedCount: 12,  status: "disabled", expiresAt: "2024-11-30", createdAt: "2024-07-15" },
];