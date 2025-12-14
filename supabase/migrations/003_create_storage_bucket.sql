-- Create storage bucket for store assets (logos, banners, products, categories)
-- This bucket will store all images uploaded by users

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-assets',
  'store-assets',
  true, -- Public bucket (images can be accessed without auth)
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read access to all files in store-assets bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-assets');

-- Policy: Allow authenticated users to upload files to their own folder
-- Files are organized as: {user_id}/{folder}/{filename}
-- Using split_part to extract the first folder (user_id) from the path
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'store-assets'
  AND auth.role() = 'authenticated'
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- Policy: Allow users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'store-assets'
  AND auth.role() = 'authenticated'
  AND split_part(name, '/', 1) = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'store-assets'
  AND auth.role() = 'authenticated'
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- Policy: Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'store-assets'
  AND auth.role() = 'authenticated'
  AND split_part(name, '/', 1) = auth.uid()::text
);

