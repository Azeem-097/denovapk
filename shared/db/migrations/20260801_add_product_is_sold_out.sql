-- Add product-level sold-out flag without changing existing product data.
ALTER TABLE products ADD COLUMN isSoldOut INTEGER NOT NULL DEFAULT 0;
