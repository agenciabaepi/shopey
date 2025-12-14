-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stores table
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('store', 'restaurant')),
  phone VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  primary_color VARCHAR(7) DEFAULT '#000000',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Store settings table
CREATE TABLE store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE UNIQUE,
  font_family VARCHAR(100) DEFAULT 'Inter',
  layout_style VARCHAR(50) DEFAULT 'default',
  show_address BOOLEAN DEFAULT false,
  address TEXT,
  about_text TEXT,
  opening_hours JSONB,
  custom_css TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  stock_quantity INTEGER,
  is_unlimited_stock BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Banners table
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title VARCHAR(255),
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_carousel BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Visits table (for analytics)
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  page_path VARCHAR(255),
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- WhatsApp clicks table (for analytics)
CREATE TABLE whatsapp_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_stores_user_id ON stores(user_id);
CREATE INDEX idx_stores_slug ON stores(slug);
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_categories_store_id ON categories(store_id);
CREATE INDEX idx_banners_store_id ON banners(store_id);
CREATE INDEX idx_visits_store_id ON visits(store_id);
CREATE INDEX idx_whatsapp_clicks_store_id ON whatsapp_clicks(store_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_clicks ENABLE ROW LEVEL SECURITY;

-- Stores policies
CREATE POLICY "Users can view their own stores"
  ON stores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stores"
  ON stores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stores"
  ON stores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stores"
  ON stores FOR DELETE
  USING (auth.uid() = user_id);

-- Public read access to stores by slug
CREATE POLICY "Public can view stores by slug"
  ON stores FOR SELECT
  USING (true);

-- Store settings policies
CREATE POLICY "Users can manage their store settings"
  ON store_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = store_settings.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- Public read access to store settings
CREATE POLICY "Public can view store settings"
  ON store_settings FOR SELECT
  USING (true);

-- Categories policies
CREATE POLICY "Store owners can manage their categories"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = categories.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- Public read access to active categories
CREATE POLICY "Public can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Products policies
CREATE POLICY "Store owners can manage their products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- Public read access to active products
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Banners policies
CREATE POLICY "Store owners can manage their banners"
  ON banners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = banners.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- Public read access to active banners
CREATE POLICY "Public can view active banners"
  ON banners FOR SELECT
  USING (is_active = true);

-- Visits policies (public insert, owner read)
CREATE POLICY "Anyone can insert visits"
  ON visits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Store owners can view their visits"
  ON visits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = visits.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- WhatsApp clicks policies (public insert, owner read)
CREATE POLICY "Anyone can insert whatsapp clicks"
  ON whatsapp_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Store owners can view their whatsapp clicks"
  ON whatsapp_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = whatsapp_clicks.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON store_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
