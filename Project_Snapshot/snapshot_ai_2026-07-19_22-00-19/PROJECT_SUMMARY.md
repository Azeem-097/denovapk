# Denova PK - Project Snapshot

**Generated:** 2026-07-19 22:00:22
**Extraction mode:** ai
**Project:** Denova PK - Premium Denim E-Commerce Platform

---

## Snapshot Contents

| Section | Files | Size | Output |
|---------|-------|------|--------|
| User Panel (src/) | 176 | 864.9 KB | 1_user-panel.txt |
| Admin Panel (src/) | 135 | 776.5 KB | 2_admin-panel.txt |
| Database Files | 41 | 251.0 KB | 3_database.txt |
| Configuration Files | 16 | 13.7 KB | 4_configs.txt |

---

## Project Overview

**Denova PK** is a complete Shopify-level e-commerce platform for a Pakistani
premium denim clothing brand. The platform consists of two independent Next.js
applications sharing a single Turso database.

### User Panel (Port 3000) - denovapk.com
Customer-facing e-commerce storefront.

- Homepage with hero slider, featured collections, new arrivals
- Full product catalog with filtering, sorting, search
- Product detail pages with size/color selectors, related products
- Collections pages (Summer, Formal, Casual, Winter)
- Shopping cart (syncs to server for logged-in users)
- Wishlist system
- Complete 4-step checkout flow (info -> shipping -> payment -> review)
- Real order creation with discount validation + stock decrement
- User accounts (register, login, dashboard)
- Order history with real order tracking
- Address book (CRUD with default address)
- Search modal + full search page
- 10 static pages: FAQ, Shipping, Returns, Privacy, Terms, Size Guide,
  Track Order, Careers, About, Contact
- Newsletter subscription + contact form

### Admin Panel (Port 3001) - admin.denovapk.com
Complete business management dashboard.

- JWT-based authentication for admins
- Live dashboard with revenue chart, top products, recent orders
- Products management (list, create, edit, delete with variants)
- Orders management with status updates and tracking
- Customer profiles with computed stats (total spent, orders)
- Collections management
- Inventory management with real-time stock updates
- Discount codes management
- Analytics with revenue trends
- Staff and role management
- Settings dashboard

---

## Tech Stack

- **Framework:** Next.js 16 (App Router + Turbopack)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 (uses @import syntax, no @tailwind)
- **Database:** Turso (libSQL / SQLite) via @libsql/client (direct, no ORM)
- **Auth:** Custom JWT + bcrypt (both panels)
- **State Management:** Zustand (with localStorage persistence)
- **Forms:** react-hook-form + Zod validation
- **Icons:** lucide-react
- **Fonts:** Inter, Playfair Display, Cormorant Garamond (Google Fonts)
- **Images:** Next.js Image with AVIF/WebP optimization
- **Animation:** Custom device-aware animations (Intersection Observer)
- **Deployment:** hostonme.dev (Docker-based) or Vercel

---

## Brand Design System

- **Primary (Text):** #1a1a1a (Near Black)
- **Secondary (Accent):** #c9a96e (Warm Gold)
- **Accent:** #f5f0e8 (Cream)
- **Background:** #ffffff (Pure White)
- **Surface:** #fafaf9 (Off White)
- **Muted:** #6b7280 (Warm Gray)
- **Border:** #e5e7eb

**Typography:**
- Display: Playfair Display (elegant serif for headings)
- Body: Inter (clean sans-serif for text)
- Accent: Cormorant Garamond (luxury feel for quotes)

---

## Database Schema (20 tables)

### Users & Auth
- users - customers with email/phone/password
- admins - admin users with roles (SUPER_ADMIN, ADMIN, MANAGER, STAFF)
- sessions - user session tokens
- addresses - customer saved addresses

### Products
- products - main product catalog (prices in paisa)
- product_images - product image URLs (with isPrimary flag)
- product_variants - size/color combinations with stock
- collections - product groupings (Summer, Formal, etc.)

### Cart & Wishlist
- carts - one cart per user
- cart_items - cart line items
- wishlists - user wishlist items

### Orders
- orders - orders (both registered users and guests)
- order_items - order line items (snapshot data)
- discounts - discount codes

### Marketing
- reviews - product reviews
- newsletter - email subscribers
- contact_messages - contact form submissions

### Store Settings
- settings - key/value config storage
- shipping_zones - delivery zones
- shipping_methods - shipping options per zone

---

## Project Structure

    denovapk/
      user-panel/                    # Customer storefront (port 3000)
        src/app/                     # Next.js app router pages
          api/                       # API routes (cart, checkout, etc.)
          account/                   # User account pages
          shop/                      # Product catalog
          products/[slug]/           # Product detail
          collections/               # Collection pages
          checkout/                  # 4-step checkout
        src/components/              # UI components (organized by type)
        src/lib/                     # DB, auth, utils, adapters
          db/                        # DB client, types, repositories
        src/store/                   # Zustand stores (cart, auth, etc.)
        src/types/                   # TypeScript types
      admin-panel/                   # Business dashboard (port 3001)
        src/app/(auth)/login/        # Login page
        src/app/(dashboard)/         # Protected admin pages
        src/app/api/                 # Admin API routes
        src/components/              # Admin UI components
        src/lib/                     # DB, auth, adapters
          db/                        # Client + repositories + migrate + seed
      shared/                        # Shared resources
        db/schema.sql                # Complete SQL schema
      Project_Snapshot/              # Generated extracts (this folder)
      extract-project.ps1            # This script
      README.md
      SETUP_TURSO.md

---

## Demo Credentials

### Admin Login
- **URL:** http://localhost:3001/login (or admin.denovapk.com)
- **Email:** admin@denovapk.com
- **Password:** admin1234

### User Login
- **URL:** http://localhost:3000/account/login (or denovapk.com)
- **Email:** ayesha@example.com
- **Password:** demo1234

---

## Running the Project

### Prerequisites
1. Node.js 18+ installed
2. Turso account at https://turso.tech
3. Create database at Turso, copy URL and auth token

### Setup

**Terminal 1 - Install & Initialize:**

    cd admin-panel
    npm install
    # Create .env from .env.example, add TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
    npm run db:init      # Create all tables
    npm run db:seed      # Populate demo data
    npm run dev -- -p 3001

**Terminal 2 - Start User Panel:**

    cd user-panel
    npm install
    # Create .env from .env.example, use SAME Turso credentials
    npm run dev

---

## Database Scripts (admin-panel)

- **npm run db:init** - Create all tables from shared/db/schema.sql
- **npm run db:seed** - Populate with demo data (products, orders, users)
- **npm run db:reset** - Drop all tables (destructive!)

---

## Deployment

Deployed on hostonme.dev with:
- User Panel: https://denovapk.com
- Admin Panel: https://admin.denovapk.com (or hqdenovapk.hostonme.dev)
- Both panels connect to the same Turso database

Required env vars in production:
- TURSO_DATABASE_URL
- TURSO_AUTH_TOKEN
- JWT_SECRET (admin-panel)
- NEXTAUTH_SECRET (user-panel)
- NEXT_PUBLIC_SITE_URL
- NEXT_PUBLIC_ADMIN_URL

---

## Development Rules

### Tailwind CSS v4
- ALWAYS use `@import "tailwindcss"` in globals.css
- NEVER use `@tailwind base;` `@tailwind components;` `@tailwind utilities;`
- NEVER use `@apply` in CSS files
- Write Tailwind classes directly in components

### Prices
- Store prices in database as PAISA (integers, no decimals)
- Convert to rupees using `paisaToRupees()` for display
- Convert from rupees using `rupeesToPaisa()` for storage
- Use `formatPaisa()` or `formatPrice()` for display formatting

### Icons
- Use lucide-react for standard icons
- Use inline SVG for social media icons (Facebook, Instagram, etc.)
- These are removed from lucide-react: Facebook, Twitter, Instagram, Linkedin

### PowerShell File Writes
- ALWAYS use `[System.IO.File]::WriteAllText()`
- NEVER use `Set-Content` (causes duplication)
- Always use `Clear-Content` first (with -ErrorAction SilentlyContinue)

### Database Access
- Use `@libsql/client` directly (NO Prisma - we tried it and moved on)
- Query pattern: `db.execute({ sql: '...', args: [...] })`
- Types in `src/lib/db/types.ts` match SQL schema exactly
- Repositories in `src/lib/db/repositories/` handle business logic

---

## Status

### Completed
- Complete user panel (all pages, cart, checkout, accounts)
- Complete admin panel (dashboard, all CRUD modules)
- Database with 20 tables + demo data
- JWT authentication for admin, session cookies for users
- Real order creation with stock management
- Discount code validation
- Address book CRUD
- Cart syncs to server for logged-in users
- OG images and social meta tags configured
- Deployment to hostonme.dev working

### Optional Enhancements (Not Started)
- Cloudinary integration for product image uploads
- Email notifications (order confirmation)
- Real payment gateway integration (JazzCash/EasyPaisa)
- SEO enhancements (sitemap.xml, structured data)
- Multi-variant inventory management
- Analytics integration (Google Analytics)

---

## For AI Assistants Picking Up This Project

When continuing work on this project:

1. **Read PROJECT_SUMMARY.md first** (this file) for full context
2. **Check shared/db/schema.sql** to understand database structure
3. **Review repositories** in src/lib/db/repositories/ for query patterns
4. **API routes** live in src/app/api/ for both panels
5. **User pages** are in src/app/ (marketing) and src/app/account/ (auth-protected)
6. **Admin pages** are in src/app/(dashboard)/ (auth-protected)
7. **Use brand colors** consistently (see Brand Design System above)
8. **Prices in paisa** (integer, x100 of rupees)
9. **No Prisma** - direct SQL via @libsql/client
10. **Use hardcoded URLs** for OG images (not env vars, avoids localhost fallback)

