-- Denova PK - Complete Database Schema
-- Run this in Turso SQL editor to create all tables

-- ============================================================
-- USERS & AUTH
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  email          TEXT UNIQUE NOT NULL,
  emailVerified  INTEGER,
  phone          TEXT,
  password       TEXT,
  avatar         TEXT,
  isActive       INTEGER NOT NULL DEFAULT 1,
  birthday       TEXT,
  loyaltyPoints  INTEGER NOT NULL DEFAULT 0,
  createdAt      INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone    ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_birthday ON users(birthday);

CREATE TABLE IF NOT EXISTS admins (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'STAFF',
  avatar     TEXT,
  isActive   INTEGER NOT NULL DEFAULT 1,
  lastLogin  INTEGER,
  createdAt  INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt  INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT PRIMARY KEY,
  userId        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sessionToken  TEXT UNIQUE NOT NULL,
  expires       INTEGER NOT NULL,
  createdAt     INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);

CREATE TABLE IF NOT EXISTS addresses (
  id          TEXT PRIMARY KEY,
  userId      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  fullName    TEXT NOT NULL,
  phone       TEXT NOT NULL,
  street      TEXT NOT NULL,
  apartment   TEXT,
  city        TEXT NOT NULL,
  province    TEXT NOT NULL,
  postalCode  TEXT NOT NULL,
  country     TEXT NOT NULL DEFAULT 'Pakistan',
  isDefault   INTEGER NOT NULL DEFAULT 0,
  createdAt   INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt   INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_addresses_userId ON addresses(userId);

-- ============================================================
-- COLLECTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS collections (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  image           TEXT,
  isActive        INTEGER NOT NULL DEFAULT 1,
  sortOrder       INTEGER NOT NULL DEFAULT 0,
  metaTitle       TEXT,
  metaDescription TEXT,
  createdAt       INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt       INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);

-- ============================================================
-- PRODUCTS
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  sku               TEXT UNIQUE NOT NULL,
  description       TEXT NOT NULL,
  shortDescription  TEXT,
  price             INTEGER NOT NULL,
  comparePrice      INTEGER,
  costPerItem       INTEGER,
  taxRate           REAL NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'DRAFT',
  collectionId      TEXT REFERENCES collections(id) ON DELETE SET NULL,
  isNew             INTEGER NOT NULL DEFAULT 0,
  isFeatured        INTEGER NOT NULL DEFAULT 0,
  isBestSeller      INTEGER NOT NULL DEFAULT 0,
  metaTitle         TEXT,
  metaDescription   TEXT,
  tags              TEXT NOT NULL DEFAULT '',
  rating            REAL NOT NULL DEFAULT 0,
  reviewCount       INTEGER NOT NULL DEFAULT 0,
  soldCount         INTEGER NOT NULL DEFAULT 0,
  waist             REAL,
  length            REAL,
  bottom            REAL,
  measurementsJson  TEXT,
  bgColor           TEXT,
  brand             TEXT,
  createdAt         INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt         INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_products_slug         ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status       ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_collectionId ON products(collectionId);

CREATE TABLE IF NOT EXISTS product_images (
  id         TEXT PRIMARY KEY,
  productId  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  alt        TEXT NOT NULL DEFAULT '',
  isPrimary  INTEGER NOT NULL DEFAULT 0,
  sortOrder  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_product_images_productId ON product_images(productId);

CREATE TABLE IF NOT EXISTS product_variants (
  id              TEXT PRIMARY KEY,
  productId       TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size            TEXT NOT NULL,
  color           TEXT NOT NULL,
  colorHex        TEXT NOT NULL,
  sku             TEXT UNIQUE NOT NULL,
  stock           INTEGER NOT NULL DEFAULT 0,
  price           INTEGER NOT NULL,
  compareAtPrice  INTEGER,
  weight          REAL,
  createdAt       INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt       INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(productId, size, color)
);
CREATE INDEX IF NOT EXISTS idx_variants_productId ON product_variants(productId);
CREATE INDEX IF NOT EXISTS idx_variants_sku       ON product_variants(sku);

-- ============================================================
-- CART & WISHLIST
-- ============================================================

CREATE TABLE IF NOT EXISTS carts (
  id            TEXT PRIMARY KEY,
  userId        TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lastActivity  INTEGER NOT NULL DEFAULT (unixepoch()),
  createdAt     INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt     INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_carts_lastActivity ON carts(lastActivity);

CREATE TABLE IF NOT EXISTS cart_items (
  id         TEXT PRIMARY KEY,
  cartId     TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  productId  TEXT NOT NULL REFERENCES products(id),
  variantId  TEXT NOT NULL REFERENCES product_variants(id),
  quantity   INTEGER NOT NULL DEFAULT 1,
  createdAt  INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt  INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(cartId, variantId)
);
CREATE INDEX IF NOT EXISTS idx_cart_items_cartId ON cart_items(cartId);

CREATE TABLE IF NOT EXISTS wishlists (
  id         TEXT PRIMARY KEY,
  userId     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  productId  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  createdAt  INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(userId, productId)
);
CREATE INDEX IF NOT EXISTS idx_wishlists_userId ON wishlists(userId);

-- ============================================================
-- ABANDONED CARTS
-- ============================================================

CREATE TABLE IF NOT EXISTS abandoned_carts (
  id                TEXT PRIMARY KEY,
  userId            TEXT REFERENCES users(id) ON DELETE SET NULL,
  email             TEXT,
  phone             TEXT,
  fullName          TEXT,
  city              TEXT,
  itemsJson         TEXT NOT NULL DEFAULT '[]',
  itemCount         INTEGER NOT NULL DEFAULT 0,
  subtotal          INTEGER NOT NULL DEFAULT 0,
  totalValue        INTEGER NOT NULL DEFAULT 0,
  reachedCheckout   INTEGER NOT NULL DEFAULT 0,
  isContacted       INTEGER NOT NULL DEFAULT 0,
  isRecovered       INTEGER NOT NULL DEFAULT 0,
  recoveredOrderId  TEXT REFERENCES orders(id) ON DELETE SET NULL,
  adminNote         TEXT,
  lastActivity      INTEGER NOT NULL DEFAULT (unixepoch()),
  abandonedAt       INTEGER NOT NULL DEFAULT (unixepoch()),
  createdAt         INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt         INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_userId       ON abandoned_carts(userId);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_phone        ON abandoned_carts(phone);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email        ON abandoned_carts(email);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_abandonedAt  ON abandoned_carts(abandonedAt);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_isRecovered  ON abandoned_carts(isRecovered);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE IF NOT EXISTS discounts (
  id          TEXT PRIMARY KEY,
  code        TEXT UNIQUE NOT NULL,
  type        TEXT NOT NULL,
  value       INTEGER NOT NULL,
  minOrder    INTEGER NOT NULL DEFAULT 0,
  maxUses     INTEGER NOT NULL DEFAULT 1000,
  usedCount   INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'ACTIVE',
  startsAt    INTEGER NOT NULL DEFAULT (unixepoch()),
  expiresAt   INTEGER NOT NULL,
  createdAt   INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt   INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_discounts_code   ON discounts(code);
CREATE INDEX IF NOT EXISTS idx_discounts_status ON discounts(status);

CREATE TABLE IF NOT EXISTS orders (
  id                    TEXT PRIMARY KEY,
  orderNumber           TEXT UNIQUE NOT NULL,
  userId                TEXT REFERENCES users(id),
  guestEmail            TEXT,
  guestName             TEXT,
  guestPhone            TEXT,
  subtotal              INTEGER NOT NULL,
  discount              INTEGER NOT NULL DEFAULT 0,
  loyaltyDiscount       INTEGER NOT NULL DEFAULT 0,
  loyaltyPointsUsed     INTEGER NOT NULL DEFAULT 0,
  loyaltyPointsEarned   INTEGER NOT NULL DEFAULT 0,
  birthdayDiscount      INTEGER NOT NULL DEFAULT 0,
  isBirthdayOrder       INTEGER NOT NULL DEFAULT 0,
  shipping              INTEGER NOT NULL DEFAULT 0,
  tax                   INTEGER NOT NULL DEFAULT 0,
  total                 INTEGER NOT NULL,
  status                TEXT NOT NULL DEFAULT 'PENDING',
  paymentStatus         TEXT NOT NULL DEFAULT 'PENDING',
  paymentMethod         TEXT NOT NULL,
  discountCode          TEXT,
  discountId            TEXT REFERENCES discounts(id),
  addressId             TEXT REFERENCES addresses(id),
  shippingAddress       TEXT,
  shippingMethod        TEXT NOT NULL,
  trackingNumber        TEXT,
  courierName           TEXT,
  customerNote          TEXT,
  adminNote             TEXT,
  confirmedAt           INTEGER,
  shippedAt             INTEGER,
  deliveredAt           INTEGER,
  cancelledAt           INTEGER,
  createdById           TEXT REFERENCES admins(id),
  updatedById           TEXT REFERENCES admins(id),
  createdAt             INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt             INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_orders_orderNumber   ON orders(orderNumber);
CREATE INDEX IF NOT EXISTS idx_orders_userId        ON orders(userId);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_paymentStatus ON orders(paymentStatus);

CREATE TABLE IF NOT EXISTS order_items (
  id         TEXT PRIMARY KEY,
  orderId    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  productId  TEXT NOT NULL REFERENCES products(id),
  variantId  TEXT NOT NULL REFERENCES product_variants(id),
  name       TEXT NOT NULL,
  image      TEXT NOT NULL,
  size       TEXT NOT NULL,
  color      TEXT NOT NULL,
  sku        TEXT NOT NULL,
  price      INTEGER NOT NULL,
  quantity   INTEGER NOT NULL,
  subtotal   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_items_orderId   ON order_items(orderId);
CREATE INDEX IF NOT EXISTS idx_order_items_productId ON order_items(productId);

-- ============================================================
-- LOYALTY POINTS
-- ============================================================

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id          TEXT PRIMARY KEY,
  userId      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  orderId     TEXT REFERENCES orders(id) ON DELETE SET NULL,
  type        TEXT NOT NULL,
  points      INTEGER NOT NULL,
  balance     INTEGER NOT NULL,
  description TEXT,
  createdAt   INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_userId  ON loyalty_transactions(userId);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_orderId ON loyalty_transactions(orderId);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type    ON loyalty_transactions(type);

-- ============================================================
-- REVIEWS
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id          TEXT PRIMARY KEY,
  userId      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  productId   TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL,
  title       TEXT,
  comment     TEXT NOT NULL,
  isVerified  INTEGER NOT NULL DEFAULT 0,
  isApproved  INTEGER NOT NULL DEFAULT 0,
  createdAt   INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt   INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(userId, productId)
);
CREATE INDEX IF NOT EXISTS idx_reviews_productId ON reviews(productId);

-- ============================================================
-- MARKETING
-- ============================================================

CREATE TABLE IF NOT EXISTS newsletter (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  isSubscribed  INTEGER NOT NULL DEFAULT 1,
  source        TEXT,
  createdAt     INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt     INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter(email);

CREATE TABLE IF NOT EXISTS contact_messages (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  isRead     INTEGER NOT NULL DEFAULT 0,
  isReplied  INTEGER NOT NULL DEFAULT 0,
  adminNote  TEXT,
  createdAt  INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt  INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_contact_isRead ON contact_messages(isRead);

-- ============================================================
-- SETTINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS settings (
  id         TEXT PRIMARY KEY,
  key        TEXT UNIQUE NOT NULL,
  value      TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'general',
  updatedAt  INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_settings_key      ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- ============================================================
-- SHIPPING
-- ============================================================

CREATE TABLE IF NOT EXISTS shipping_zones (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  isActive   INTEGER NOT NULL DEFAULT 1,
  cities     TEXT NOT NULL DEFAULT '',
  createdAt  INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS shipping_methods (
  id         TEXT PRIMARY KEY,
  zoneId     TEXT NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  time       TEXT NOT NULL,
  price      INTEGER NOT NULL,
  isActive   INTEGER NOT NULL DEFAULT 1,
  freeAbove  INTEGER,
  createdAt  INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt  INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_zoneId ON shipping_methods(zoneId);