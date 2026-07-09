# Denova PK - Premium E-Commerce Platform

A full-featured Shopify-level e-commerce platform for a Pakistani premium clothing brand.

## Architecture

- User Panel - Customer-facing storefront (Next.js)
- Admin Panel - Business management dashboard (Next.js)
- Shared - Database schema, common utilities
- Database - Turso (LibSQL / SQLite)

## Tech Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS v4
- Database: Turso (LibSQL)
- Auth: JWT + bcrypt
- State: Zustand
- Icons: lucide-react
- Forms: react-hook-form + Zod

## Features

### User Panel
- Hero section with slider
- Product catalog with filters
- Real-time cart (syncs to server for logged-in users)
- Wishlist
- Full checkout flow (4 steps)
- User accounts with order history
- Address book, Search, Discount codes
- 10 static pages (FAQ, Shipping, etc.)

### Admin Panel
- Dashboard with real-time stats
- Products CRUD
- Orders management with status updates
- Customer profiles
- Inventory management
- Collections, Discount codes, Analytics

## Getting Started

### 1. Clone

    git clone https://github.com/Azeem-097/denovapk.git
    cd denovapk

### 2. Install dependencies

    cd user-panel
    npm install
    cd ../admin-panel
    npm install

### 3. Set up Turso database

1. Sign up at https://turso.tech
2. Create a database named denovapk
3. Get URL and token from dashboard
4. Copy the .env.example files:

    cp user-panel/.env.example user-panel/.env
    cp admin-panel/.env.example admin-panel/.env

5. Fill in your credentials in both .env files.

### 4. Initialize database

    cd admin-panel
    npm run db:init
    npm run db:seed

### 5. Run both apps

Terminal 1 - User Panel (port 3000):

    cd user-panel
    npm run dev

Terminal 2 - Admin Panel (port 3001):

    cd admin-panel
    npm run dev -- -p 3001

## Demo Credentials

- Admin: admin@denovapk.com / admin1234
- User: ayesha@example.com / demo1234

## Project Structure

    denovapk/
    |-- user-panel/       Customer storefront
    |   |-- src/
    |       |-- app/
    |       |-- components/
    |       |-- lib/
    |       |-- store/
    |       |-- types/
    |
    |-- admin-panel/      Business dashboard
    |   |-- src/
    |
    |-- shared/           Shared resources
    |   |-- db/
    |       |-- schema.sql
    |
    |-- README.md

## Database Scripts

From admin-panel/ folder:

- npm run db:init - Create all tables
- npm run db:seed - Populate with demo data
- npm run db:reset - Drop all tables

## License

Private project - All rights reserved (c) 2025 Denova PK

## Contact

- Email: hello@denovapk.com
- Instagram: @denovapk