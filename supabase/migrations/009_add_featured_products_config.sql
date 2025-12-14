-- Add featured products configuration to store_settings
-- This allows stores to configure which products appear in the featured section

ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS featured_products TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS featured_section_title VARCHAR(255) DEFAULT 'Destaques',
ADD COLUMN IF NOT EXISTS products_display_mode VARCHAR(50) DEFAULT 'grid' CHECK (products_display_mode IN ('grid', 'list'));

-- Add comment
COMMENT ON COLUMN store_settings.featured_products IS 'Array of product IDs to display in the featured section';
COMMENT ON COLUMN store_settings.featured_section_title IS 'Title for the featured products section';
COMMENT ON COLUMN store_settings.products_display_mode IS 'Display mode for products: grid or list';

