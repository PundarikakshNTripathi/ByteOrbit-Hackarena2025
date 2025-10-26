-- ============================================================================
-- STORAGE POLICIES FOR COMPLAINT-IMAGES BUCKET
-- Safe to run multiple times - uses DROP and CREATE pattern
-- ============================================================================

-- Step 1: Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-images', 'complaint-images', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop existing policies (to ensure clean state)
DROP POLICY IF EXISTS "Public read access for complaint images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload complaint images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;

-- Step 3: Create fresh policies

-- Allow public to view/download images
CREATE POLICY "Public read access for complaint images"
ON storage.objects FOR SELECT
USING (bucket_id = 'complaint-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload complaint images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'complaint-images');

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'complaint-images');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'complaint-images');

-- ============================================================================
-- STORAGE POLICIES COMPLETE
-- ============================================================================
