-- Add mobile image URL to banners table
-- This allows stores to have different banner images for mobile and desktop

ALTER TABLE banners
ADD COLUMN IF NOT EXISTS image_url_mobile TEXT;

-- Add comment
COMMENT ON COLUMN banners.image_url_mobile IS 'URL da imagem do banner para dispositivos móveis. Se não especificado, usa image_url';

