-- Fix RLS policies to allow proper queries
-- Drop and recreate policies that might be causing 406 errors

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own stores" ON stores;
DROP POLICY IF EXISTS "Users can insert their own stores" ON stores;
DROP POLICY IF EXISTS "Users can update their own stores" ON stores;
DROP POLICY IF EXISTS "Users can delete their own stores" ON stores;
DROP POLICY IF EXISTS "Public can view stores by slug" ON stores;

-- Recreate stores policies with proper permissions
CREATE POLICY "Users can view their own stores"
  ON stores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stores"
  ON stores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stores"
  ON stores FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stores"
  ON stores FOR DELETE
  USING (auth.uid() = user_id);

-- Public read access to stores by slug (for public store pages)
CREATE POLICY "Public can view stores by slug"
  ON stores FOR SELECT
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
