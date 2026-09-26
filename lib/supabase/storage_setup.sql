-- ============================================================================
-- Vanguard ERP System - Supabase Storage Buckets & Policies
-- Storage Bucket: brand-assets & organization-media
-- ============================================================================

-- 1. Create storage bucket for brand assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-assets',
  'brand-assets',
  true,
  10485760, -- 10 MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Create storage bucket for organization media & certificates
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-media',
  'organization-media',
  true,
  20971520, -- 20 MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Public Read Access Policy
DROP POLICY IF EXISTS "Public Read brand-assets" ON storage.objects;
CREATE POLICY "Public Read brand-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-assets');

DROP POLICY IF EXISTS "Public Read organization-media" ON storage.objects;
CREATE POLICY "Public Read organization-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'organization-media');

-- 4. Public / Service Insert Access Policy
DROP POLICY IF EXISTS "Public Insert brand-assets" ON storage.objects;
CREATE POLICY "Public Insert brand-assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'brand-assets');

DROP POLICY IF EXISTS "Public Insert organization-media" ON storage.objects;
CREATE POLICY "Public Insert organization-media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'organization-media');

-- 5. Public / Service Update Access Policy
DROP POLICY IF EXISTS "Public Update brand-assets" ON storage.objects;
CREATE POLICY "Public Update brand-assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'brand-assets');

DROP POLICY IF EXISTS "Public Update organization-media" ON storage.objects;
CREATE POLICY "Public Update organization-media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'organization-media');
