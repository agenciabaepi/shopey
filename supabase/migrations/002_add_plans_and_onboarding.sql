-- Add plan and onboarding fields to stores table
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
ADD COLUMN IF NOT EXISTS document_type VARCHAR(10) CHECK (document_type IN ('cpf', 'cnpj')),
ADD COLUMN IF NOT EXISTS document VARCHAR(20),
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS first_product_tutorial_completed BOOLEAN DEFAULT false;

-- Add template field to store_settings
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS template_id VARCHAR(50) DEFAULT 'default';

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  max_products INTEGER NOT NULL,
  max_templates INTEGER NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default plans
INSERT INTO plans (id, name, max_products, max_templates, price, features) VALUES
('free', 'Gratuito', 5, 1, 0, '{"whatsapp_orders": true, "basic_analytics": true, "custom_colors": true}'::jsonb),
('pro', 'Pro', 100, 5, 29.90, '{"whatsapp_orders": true, "advanced_analytics": true, "custom_colors": true, "custom_domain": true, "priority_support": true}'::jsonb),
('enterprise', 'Enterprise', -1, -1, 99.90, '{"whatsapp_orders": true, "advanced_analytics": true, "custom_colors": true, "custom_domain": true, "priority_support": true, "api_access": true, "white_label": true}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  plan_required VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default template
INSERT INTO templates (id, name, description, is_premium, plan_required) VALUES
('default', 'Padrão', 'Template padrão moderno e responsivo', false, 'free')
ON CONFLICT (id) DO NOTHING;

-- Function to check product limit
CREATE OR REPLACE FUNCTION check_product_limit()
RETURNS TRIGGER AS $$
DECLARE
  store_plan VARCHAR(20);
  max_products INTEGER;
  current_count INTEGER;
BEGIN
  -- Get store plan
  SELECT s.plan INTO store_plan
  FROM stores s
  WHERE s.id = NEW.store_id;
  
  -- Get max products for plan
  SELECT p.max_products INTO max_products
  FROM plans p
  WHERE p.id = store_plan;
  
  -- If unlimited (-1), allow
  IF max_products = -1 THEN
    RETURN NEW;
  END IF;
  
  -- Count current products
  SELECT COUNT(*) INTO current_count
  FROM products
  WHERE store_id = NEW.store_id AND is_active = true;
  
  -- Check limit
  IF current_count >= max_products THEN
    RAISE EXCEPTION 'Limite de produtos atingido para o plano %. Máximo: % produtos', store_plan, max_products;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check product limit
DROP TRIGGER IF EXISTS trigger_check_product_limit ON products;
CREATE TRIGGER trigger_check_product_limit
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION check_product_limit();
