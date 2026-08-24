-- =========================================================
-- Southern Olive & Oil Products / VANGUARD ERP
-- Supabase Row Level Security (RLS) Fix for Tenants Table
-- =========================================================

-- 1. Ensure RLS is enabled on tenants table
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 2. Grant explicit database permissions to anon, authenticated, and service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO anon, authenticated, service_role;

-- 3. Drop all previous restrictive SELECT policies on public.tenants
DROP POLICY IF EXISTS "Allow public read access to tenants" ON public.tenants;
DROP POLICY IF EXISTS "tenants_tenant_isolation" ON public.tenants;
DROP POLICY IF EXISTS "tenants_public_select" ON public.tenants;
DROP POLICY IF EXISTS "tenants_public_insert" ON public.tenants;

-- 4. Create public SELECT policy allowing unauthenticated & authenticated queries
CREATE POLICY "Allow public read access to tenants"
ON public.tenants
FOR SELECT
USING (true);

-- 5. Create public INSERT policy allowing new tenant onboarding
CREATE POLICY "Allow public insert access to tenants"
ON public.tenants
FOR INSERT
WITH CHECK (true);

-- 6. Insert primary seed tenant if table is currently empty
INSERT INTO public.tenants (id, name, slug, brand_name_ar, brand_name_en, subscription_tier, subscription_status, ai_usage_count, ai_usage_limit)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'منتوجات زيت وزيتون الجنوب',
  'southern-olive',
  'منتوجات زيت وزيتون الجنوب',
  'Southern Olive & Oil Products',
  'ENTERPRISE',
  'ACTIVE',
  0,
  1000
)
ON CONFLICT (id) DO UPDATE SET
  brand_name_ar = EXCLUDED.brand_name_ar,
  brand_name_en = EXCLUDED.brand_name_en;
