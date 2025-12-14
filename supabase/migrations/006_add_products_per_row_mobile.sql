-- Add products_per_row_mobile field to store_settings
-- This allows stores to configure how many products appear per row on mobile devices

ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS products_per_row_mobile INTEGER DEFAULT 1 CHECK (products_per_row_mobile IN (1, 2));

