/**
 * Seed script - Populates database with demo data + default settings
 * Run with: npm run db:seed
 */

import "dotenv/config";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const genId = () => "c" + randomBytes(12).toString("hex");
const now   = () => Math.floor(Date.now() / 1000);

// ═══════════════════════════════════════════════════════════════════
//  SAFETY GUARD — prevents accidental data wipe
// ═══════════════════════════════════════════════════════════════════
const FORCE_FLAG = process.argv.includes("--force");

if (!FORCE_FLAG) {
  console.error("\n╔══════════════════════════════════════════════════════════════╗");
  console.error("║                                                              ║");
  console.error("║   ⚠️   DANGER: This script will DELETE ALL DATA in your DB   ║");
  console.error("║                                                              ║");
  console.error("║   - All products, collections, orders, users will be wiped   ║");
  console.error("║   - All settings will be reset to defaults                   ║");
  console.error("║   - This cannot be undone (no backups on Turso Free tier)    ║");
  console.error("║                                                              ║");
  console.error("║   To proceed, re-run with the --force flag:                  ║");
  console.error("║                                                              ║");
  console.error("║     npm run db:seed -- --force                               ║");
  console.error("║                                                              ║");
  console.error("╚══════════════════════════════════════════════════════════════╝\n");
  process.exit(1);
}

console.log("[FORCE FLAG DETECTED] Proceeding with database seed...\n");

async function seed() {
  const url       = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("Missing TURSO_DATABASE_URL in .env");
    process.exit(1);
  }

  const db = createClient({ url, authToken });

  console.log("Seeding database...\n");

  console.log("Cleaning existing data...");
  const tables = [
    "loyalty_transactions", "abandoned_carts",
    "order_items", "orders",
    "cart_items", "carts",
    "wishlists", "reviews",
    "product_variants", "product_images",
    "products", "collections",
    "discounts", "addresses",
    "sessions", "users", "admins",
    "newsletter", "contact_messages",
    "shipping_methods", "shipping_zones",
    "settings"
  ];
  for (const t of tables) {
    try { await db.execute(`DELETE FROM ${t};`); } catch {}
  }
  console.log("Cleaned.\n");

  console.log("Creating admin...");
  const adminId       = genId();
  const adminPassword = await bcrypt.hash("admin1234", 10);
  await db.execute({
    sql: `INSERT INTO admins (id, name, email, password, role, isActive, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [adminId, "Jamal Ahmad", "admin@denovapk.com", adminPassword, "SUPER_ADMIN", 1, now(), now()],
  });
  console.log("Admin: admin@denovapk.com / admin1234\n");

  console.log("Creating test user with birthday...");
  const userId       = genId();
  const userPassword = await bcrypt.hash("demo1234", 10);
  const today        = new Date();
  const testBirthday = `${today.getFullYear() - 25}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  await db.execute({
    sql: `INSERT INTO users (id, name, email, password, phone, isActive, birthday, loyaltyPoints, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, 1, ?, 500, ?, ?)`,
    args: [userId, "Ayesha Malik", "ayesha@example.com", userPassword,
           "+92 300 1234567", testBirthday, now(), now()],
  });
  const addrId = genId();
  await db.execute({
    sql: `INSERT INTO addresses (id, userId, label, fullName, phone, street, city, province, postalCode, isDefault, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [addrId, userId, "Home", "Ayesha Malik", "+92 300 1234567",
           "House 42, Street 7, DHA Phase 5", "Lahore", "Punjab", "54000", 1, now(), now()],
  });
  console.log(`User: ayesha@example.com / demo1234 (birthday: ${testBirthday}, 500 pts)\n`);

  console.log("Creating collections...");
  const collections = [
    { id: genId(), name: "Summer Essentials", slug: "summer-essentials", desc: "Light, breathable pieces for the warm season",  img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800" },
    { id: genId(), name: "Formal Edit",       slug: "formal-edit",       desc: "Sophisticated styles for every occasion",       img: "https://images.unsplash.com/photo-1594938298603-c8148c4b5a20?w=800" },
    { id: genId(), name: "Casual Comfort",    slug: "casual-comfort",    desc: "Everyday wear that never compromises on style", img: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800" },
    { id: genId(), name: "Winter Luxe",       slug: "winter-luxe",       desc: "Warm, refined pieces for cooler days",          img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800" },
  ];

  for (const c of collections) {
    await db.execute({
      sql: `INSERT INTO collections (id, name, slug, description, image, isActive, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
      args: [c.id, c.name, c.slug, c.desc, c.img, now(), now()],
    });
    console.log(`  ${c.name}`);
  }
  console.log("");

  console.log("Creating products...");
  const products = [
    { name: "Classic Linen Kurta",    slug: "classic-linen-kurta",    sku: "CLK-001", price: 350000,  compare: 450000,  coll: 0, sold: 278, stock: 23, isNew: 0, isFeatured: 1, isBestSeller: 1, img: "https://images.unsplash.com/photo-1604975701397-6365ccbd028a?w=800", desc: "A timeless linen kurta crafted for everyday elegance.", tags: "kurta,linen,summer" },
    { name: "Premium Formal Shirt",   slug: "premium-formal-shirt",   sku: "PFS-001", price: 280000,  compare: null,    coll: 1, sold: 198, stock: 18, isNew: 1, isFeatured: 1, isBestSeller: 0, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800", desc: "Elevate your formal wardrobe with this crisp, tailored shirt.", tags: "shirt,formal,cotton" },
    { name: "Relaxed Chino Trousers", slug: "relaxed-chino-trousers", sku: "RCT-001", price: 320000,  compare: 380000,  coll: 2, sold: 167, stock: 27, isNew: 1, isFeatured: 0, isBestSeller: 1, img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800", desc: "Versatile chino trousers with a relaxed fit.", tags: "trousers,chino,casual" },
    { name: "Wool Blend Overcoat",    slug: "wool-blend-overcoat",    sku: "WBO-001", price: 1200000, compare: 1500000, coll: 3, sold: 43,  stock: 7,  isNew: 0, isFeatured: 1, isBestSeller: 0, img: "https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=800", desc: "A refined wool blend overcoat with timeless sophistication.", tags: "coat,wool,winter,luxury" },
    { name: "Embroidered Lawn Suit",  slug: "embroidered-lawn-suit",  sku: "ELS-001", price: 650000,  compare: 800000,  coll: 0, sold: 312, stock: 14, isNew: 1, isFeatured: 1, isBestSeller: 1, img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800", desc: "Delicate embroidery on premium lawn fabric.", tags: "lawn,embroidered,suit" },
    { name: "Structured Blazer",      slug: "structured-blazer",      sku: "SB-001",  price: 850000,  compare: null,    coll: 1, sold: 78,  stock: 12, isNew: 0, isFeatured: 1, isBestSeller: 0, img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800", desc: "A sharp, structured blazer that commands attention.", tags: "blazer,formal" },
    { name: "Cotton Pique Polo",      slug: "cotton-pique-polo",      sku: "CPP-001", price: 220000,  compare: null,    coll: 2, sold: 241, stock: 42, isNew: 1, isFeatured: 0, isBestSeller: 1, img: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800", desc: "A refined take on the classic polo.", tags: "polo,cotton,casual" },
    { name: "Cashmere Roll-Neck",     slug: "cashmere-roll-neck",     sku: "CRN-001", price: 980000,  compare: 1200000, coll: 3, sold: 32,  stock: 5,  isNew: 0, isFeatured: 1, isBestSeller: 0, img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800", desc: "Luxuriously soft cashmere roll-neck.", tags: "cashmere,knitwear,winter" },
  ];

  for (const p of products) {
    const pid   = genId();
    const rating = 4.5 + Math.random() * 0.5;
    const reviews = Math.floor(Math.random() * 100) + 20;

    await db.execute({
      sql: `INSERT INTO products (id, name, slug, sku, description, price, comparePrice, collectionId, status, isNew, isFeatured, isBestSeller, tags, rating, reviewCount, soldCount, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [pid, p.name, p.slug, p.sku, p.desc, p.price, p.compare, collections[p.coll].id, "PUBLISHED",
             p.isNew, p.isFeatured, p.isBestSeller, p.tags, rating, reviews, p.sold, now(), now()],
    });

    await db.execute({
      sql: `INSERT INTO product_images (id, productId, url, alt, isPrimary, sortOrder)
            VALUES (?, ?, ?, ?, 1, 0)`,
      args: [genId(), pid, p.img, p.name],
    });

    const stockPerVar = Math.floor(p.stock / 3);
    for (const size of ["S", "M", "L"]) {
      await db.execute({
        sql: `INSERT INTO product_variants (id, productId, size, color, colorHex, sku, stock, price, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [genId(), pid, size, "White", "#ffffff", `${p.sku}-${size}-W`, stockPerVar, p.price, now(), now()],
      });
    }
    console.log(`  ${p.name}`);
  }
  console.log("");

  console.log("Creating discounts...");
  const oneYear = now() + 60 * 60 * 24 * 365;
  await db.execute({
    sql: `INSERT INTO discounts (id, code, type, value, minOrder, maxUses, usedCount, status, expiresAt, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [genId(), "DENOVA10",   "PERCENTAGE", 10,     300000, 500, 284, "ACTIVE", oneYear, now(), now()],
  });
  await db.execute({
    sql: `INSERT INTO discounts (id, code, type, value, minOrder, maxUses, usedCount, status, expiresAt, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [genId(), "WELCOME500", "FIXED",      50000,  200000, 200, 12,  "ACTIVE", oneYear, now(), now()],
  });
  console.log("2 discount codes\n");

  console.log("Creating default settings...");

  // Footer link columns (JSON arrays serialized as strings)
  const footerCol1Links = JSON.stringify([
    { label: "New Arrivals", href: "/shop?filter=new" },
    { label: "Best Sellers", href: "/shop?filter=bestsellers" },
    { label: "Sale",         href: "/shop?filter=sale" },
    { label: "All Products", href: "/shop" },
  ]);

  const footerCol2Links = JSON.stringify([
    { label: "Premium",         href: "/collections/premium" },
    { label: "Super Premium",   href: "/collections/super-premium" },
    { label: "All Collections", href: "/collections" },
  ]);

  const footerCol3Links = JSON.stringify([
    { label: "Track My Order",    href: "/track-order" },
    { label: "Returns & Refunds", href: "/returns" },
    { label: "Shipping Policy",   href: "/shipping" },
    { label: "Size Guide",        href: "/size-guide" },
    { label: "FAQ",               href: "/faq" },
    { label: "Contact Us",        href: "/contact" },
  ]);

  const footerCol4Links = JSON.stringify([
    { label: "About Denova",     href: "/about" },
    { label: "Careers",          href: "/careers" },
    { label: "Privacy Policy",   href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ]);

  const footerBottomLinks = JSON.stringify([
    { label: "Privacy", href: "/privacy" },
    { label: "Terms",   href: "/terms" },
    { label: "Sitemap", href: "/sitemap" },
  ]);

  const defaultSettings: Array<[string, string, string]> = [
    ["brand_name",              "Denova PK",                                                      "restaurant"],
    ["brand_tagline",           "Crafted for the Modern You",                                     "restaurant"],
    ["brand_description",       "Premium Denim Clothing - Pakistan's finest selvedge jeans",      "restaurant"],
    ["brand_city",              "Lahore",                                                          "restaurant"],
    ["brand_address",           "DHA Phase 5, Lahore, Pakistan",                                  "restaurant"],
    ["brand_year",              "2026",                                                           "restaurant"],
    ["contact_phone_primary",   "+923001234567",                                                  "contact"],
    ["contact_phone_secondary", "+924231234567",                                                  "contact"],
    ["contact_email",           "hello@denovapk.com",                                             "contact"],
    ["contact_whatsapp",        "+923001234567",                                                  "contact"],
    ["abandoned_cart_enabled",   "true",                                                           "abandoned_cart"],
    ["abandoned_cart_timeout_minutes", "15",                                                       "abandoned_cart"],
    ["abandoned_cart_wa_message",
      "Hi {{name}}! We noticed you added some items to your cart on Denova PK but didn't complete your order. Your cart total is Rs. {{amount}}. Would you like to complete your purchase? We're here to help if you experienced any issues. Shop here: https://denovapk.com/cart",
      "abandoned_cart"],
    ["loyalty_enabled",           "true",                                                          "loyalty"],
    ["loyalty_earning_rate",      "5",                                                             "loyalty"],
    ["loyalty_point_value",       "1",                                                             "loyalty"],
    ["loyalty_min_redemption",    "100",                                                           "loyalty"],
    ["loyalty_max_redemption_pct","20",                                                            "loyalty"],
    ["loyalty_program_name",      "Denova Rewards",                                                "loyalty"],
    ["birthday_enabled",        "true",                                                            "birthday"],
    ["birthday_discount_pct",   "15",                                                              "birthday"],
    ["birthday_fixed_amount",   "0",                                                               "birthday"],
    ["birthday_min_order",      "3000",                                                            "birthday"],
    ["birthday_validity_days",  "7",                                                               "birthday"],
    ["birthday_reminder_days",  "7",                                                               "birthday"],
    ["birthday_free_gift",      "",                                                                "birthday"],
    ["birthday_wa_message",
      "Happy Birthday {{name}}! We wish you a wonderful day. As a birthday gift from us, enjoy {{discount}}% OFF on your next order at Denova PK. Minimum order: Rs. {{minOrder}}. Valid for {{days}} days. Shop now: https://denovapk.com",
      "birthday"],
    ["tax_percentage",          "0",                                                               "pricing"],
    ["currency_symbol",         "Rs.",                                                             "pricing"],
    ["free_shipping_threshold", "5000",                                                            "pricing"],
    ["shipping_cost_default",   "250",                                                             "pricing"],
    ["social_facebook",         "https://facebook.com/denovapk",                                   "social"],
    ["social_instagram",        "https://instagram.com/denovapk",                                  "social"],
    ["social_tiktok",           "https://tiktok.com/@denovapk",                                    "social"],

    // ── Shipping ──
    ["free_delivery_all",       "false",                                                           "shipping"],
    ["shipping_base_cost",      "250",                                                             "shipping"],
    ["cod_extra_fee",           "0",                                                               "shipping"],

    // ── Payment Methods — all enabled by default ──
    ["payment_cod_enabled",       "true",                                                          "payments"],
    ["payment_card_enabled",      "true",                                                          "payments"],
    ["payment_jazzcash_enabled",  "true",                                                          "payments"],
    ["payment_easypaisa_enabled", "true",                                                          "payments"],
    ["payment_bank_enabled",      "true",                                                          "payments"],

    // ── Footer ──
    ["footer_brand_description", "Premium clothing crafted for the modern Pakistani.",             "footer"],
    ["footer_copyright",         "Denova PK. All rights reserved.",                                "footer"],
    ["footer_payment_methods",   "JazzCash | EasyPaisa | COD | Bank Transfer",                     "footer"],
    ["footer_col1_title",        "Shop",                                                           "footer"],
    ["footer_col1_links",        footerCol1Links,                                                  "footer"],
    ["footer_col2_title",        "Collections",                                                    "footer"],
    ["footer_col2_links",        footerCol2Links,                                                  "footer"],
    ["footer_col3_title",        "Help",                                                           "footer"],
    ["footer_col3_links",        footerCol3Links,                                                  "footer"],
    ["footer_col4_title",        "Company",                                                        "footer"],
    ["footer_col4_links",        footerCol4Links,                                                  "footer"],
    ["footer_bottom_links",      footerBottomLinks,                                                "footer"],
  ];

  for (const [key, value, category] of defaultSettings) {
    await db.execute({
      sql:  "INSERT INTO settings (id, key, value, category, updatedAt) VALUES (?, ?, ?, ?, ?)",
      args: [genId(), key, value, category, now()],
    });
  }
  console.log(`${defaultSettings.length} default settings created\n`);

  console.log("═══════════════════════════════════════════════════════");
  console.log("Seed complete!");
  console.log("═══════════════════════════════════════════════════════");
  console.log("Admin:  admin@denovapk.com / admin1234  (Jamal Ahmad)");
  console.log("User:   ayesha@example.com / demo1234");
  console.log(`        Birthday: ${testBirthday}`);
  console.log("        Loyalty Points: 500");
  console.log("═══════════════════════════════════════════════════════\n");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});