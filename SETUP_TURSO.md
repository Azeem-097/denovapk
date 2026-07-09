# Denova PK - Database Setup (Direct Turso)

No Prisma. No ORM. Just direct SQL via @libsql/client.

## Step 1: Create Turso Database

1. Go to https://app.turso.tech
2. Click "Create Database"
3. Name: denovapk
4. Region: Nearest to you (e.g., ap-south-1 for Pakistan)
5. Click Create

## Step 2: Get Credentials

1. Click your new denovapk database
2. Click "Connect" tab (or the terminal icon)
3. Copy the URL (starts with libsql://)
4. Click "Create Token" - copy the token

## Step 3: Update .env Files

Paste your credentials into BOTH .env files:

- user-panel/.env
- admin-panel/.env

Change these lines:
TURSO_DATABASE_URL="libsql://denovapk-YOUR-USERNAME.turso.io"
TURSO_AUTH_TOKEN="paste-token-here"

Also generate a JWT secret:
Run in PowerShell:
[System.Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { [byte]$_ }))

Paste the result into:
- JWT_SECRET in admin-panel/.env
- NEXTAUTH_SECRET in user-panel/.env

## Step 4: Initialize Database

From admin-panel folder:
cd admin-panel
npm run db:init

You should see:
Success: 40+ statements
Tables in database: users, admins, addresses, products, etc.

## Step 5: Seed Demo Data

Still in admin-panel:
npm run db:seed

You should see:
Admin: admin@denovapk.com  / admin1234
User:  ayesha@example.com  / demo1234

## Step 6: Verify in Turso Dashboard

1. Go back to app.turso.tech
2. Click your denovapk database
3. Click "Edit Data" (that button in your screenshot)
4. You will see all tables with data!

You can browse, edit, and query data directly in the Turso web UI - no need for Prisma Studio.

## Available Commands

npm run db:init    - Create all tables (idempotent, safe to re-run)
npm run db:seed    - Populate with demo data
npm run db:reset   - Drop all tables (then run db:init + db:seed)

## Where to Write Queries

All database access uses this pattern:

import { db } from "@/lib/db/client";

const result = await db.execute({
  sql: "SELECT * FROM products WHERE status = ?",
  args: ["PUBLISHED"]
});

const products = result.rows;

## Types

Full TypeScript types for every table are in:
src/lib/db/types.ts

Example:
import type { DbProduct } from "@/lib/db/types";

const products = result.rows as unknown as DbProduct[];

## Next Steps

Once seeded, we build:
1. Auth API routes
2. Product query repositories
3. Order management API
4. Wire user panel to real data
5. Wire admin panel to real data

Reply "seeded" when done.