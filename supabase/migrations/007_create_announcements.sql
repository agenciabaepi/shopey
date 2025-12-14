-- Create announcements table for promo banners
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  background_color VARCHAR(7) DEFAULT '#EC4899',
  text_color VARCHAR(7) DEFAULT '#FFFFFF',
  icon VARCHAR(50),
  link_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_announcements_store_id ON announcements(store_id);
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(store_id, is_active);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own store's announcements
CREATE POLICY "Users can view their own store's announcements"
  ON announcements
  FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert announcements for their own store
CREATE POLICY "Users can insert announcements for their own store"
  ON announcements
  FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update announcements for their own store
CREATE POLICY "Users can update announcements for their own store"
  ON announcements
  FOR UPDATE
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete announcements for their own store
CREATE POLICY "Users can delete announcements for their own store"
  ON announcements
  FOR DELETE
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

-- Policy: Public can view active announcements (for store pages)
CREATE POLICY "Public can view active announcements"
  ON announcements
  FOR SELECT
  USING (is_active = true);

-- Trigger to update updated_at
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
