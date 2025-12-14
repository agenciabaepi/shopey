-- Add products_per_row field to store_settings
-- This allows stores to configure how many products appear per row in the grid

ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS products_per_row INTEGER DEFAULT 4 CHECK (products_per_row IN (1, 2, 3, 4));
