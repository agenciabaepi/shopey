-- Add header configuration to store_settings
-- This allows stores to customize header appearance, logo position, menu position, etc.

ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS header_background_color VARCHAR(7) DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS header_text_color VARCHAR(7) DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS header_icon_color VARCHAR(7) DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS logo_position VARCHAR(20) DEFAULT 'center' CHECK (logo_position IN ('left', 'center', 'right')),
ADD COLUMN IF NOT EXISTS logo_size VARCHAR(20) DEFAULT 'medium' CHECK (logo_size IN ('small', 'medium', 'large')),
ADD COLUMN IF NOT EXISTS menu_position VARCHAR(20) DEFAULT 'left' CHECK (menu_position IN ('left', 'center', 'right')),
ADD COLUMN IF NOT EXISTS cart_position VARCHAR(20) DEFAULT 'right' CHECK (cart_position IN ('left', 'right')),
ADD COLUMN IF NOT EXISTS header_mobile_background_color VARCHAR(7) DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS header_mobile_text_color VARCHAR(7) DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS header_mobile_icon_color VARCHAR(7) DEFAULT '#000000';

-- Add comments
COMMENT ON COLUMN store_settings.header_background_color IS 'Cor de fundo do cabeçalho';
COMMENT ON COLUMN store_settings.header_text_color IS 'Cor do texto do cabeçalho';
COMMENT ON COLUMN store_settings.header_icon_color IS 'Cor dos ícones do cabeçalho';
COMMENT ON COLUMN store_settings.logo_position IS 'Posição do logo: left, center, right';
COMMENT ON COLUMN store_settings.logo_size IS 'Tamanho do logo: small, medium, large';
COMMENT ON COLUMN store_settings.menu_position IS 'Posição do menu: left, center, right';
COMMENT ON COLUMN store_settings.cart_position IS 'Posição do carrinho: left, right';
COMMENT ON COLUMN store_settings.header_mobile_background_color IS 'Cor de fundo do cabeçalho mobile';
COMMENT ON COLUMN store_settings.header_mobile_text_color IS 'Cor do texto do cabeçalho mobile';
COMMENT ON COLUMN store_settings.header_mobile_icon_color IS 'Cor dos ícones do cabeçalho mobile';
