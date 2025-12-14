-- Make product image_url required (NOT NULL)
-- This ensures all products have an image

-- First, set a default image URL for existing products without images (if any)
-- You may want to handle this differently based on your needs
-- UPDATE products SET image_url = 'https://via.placeholder.com/400' WHERE image_url IS NULL;

-- Make image_url NOT NULL
ALTER TABLE products
ALTER COLUMN image_url SET NOT NULL;

-- Add a check constraint to ensure image_url is not empty
ALTER TABLE products
ADD CONSTRAINT products_image_url_not_empty 
CHECK (image_url IS NOT NULL AND length(trim(image_url)) > 0);

