-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all admins
CREATE POLICY "Admins can view all admins"
  ON admins
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Policy: Only existing admins can insert new admins (for security, you might want to restrict this further)
-- For initial setup, we'll allow service role to insert
CREATE POLICY "Admins can insert admins"
  ON admins
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Policy: Admins can update admins
CREATE POLICY "Admins can update admins"
  ON admins
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Trigger to update updated_at
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = user_uuid
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- IMPORTANTE: Para criar o primeiro admin, você precisa:
-- 1. Criar um usuário no Supabase Auth (ou usar um existente)
-- 2. Executar o seguinte SQL substituindo USER_ID e EMAIL:
--
-- INSERT INTO admins (user_id, email, is_active)
-- VALUES ('USER_ID_AQUI', 'admin@shopey.com', true);
--
-- Para encontrar o USER_ID de um usuário:
-- SELECT id, email FROM auth.users WHERE email = 'seu-email@exemplo.com';


