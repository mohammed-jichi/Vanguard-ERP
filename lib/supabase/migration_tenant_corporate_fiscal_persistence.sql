-- ============================================================================
-- VANGUARD ERP: TENANT PROFILE SCHEMA & PERSISTENCE MIGRATION
-- Run this in the Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/cmntrzsaqapybfhngmdv/sql)
-- ============================================================================

-- 1. Ensure all dedicated corporate, fiscal, and currency columns exist on public.tenants
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Lebanon',
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS billing_email TEXT,
  ADD COLUMN IF NOT EXISTS cr_number TEXT,
  ADD COLUMN IF NOT EXISTS tax_id TEXT,
  ADD COLUMN IF NOT EXISTS base_currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS secondary_currency TEXT,
  ADD COLUMN IF NOT EXISTS exchange_rate_policy TEXT DEFAULT 'PLATFORM_FIXED',
  ADD COLUMN IF NOT EXISTS headquarters_address TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS brand_name_ar TEXT DEFAULT 'منتوجات زيت وزيتون الجنوب',
  ADD COLUMN IF NOT EXISTS brand_name_en TEXT DEFAULT 'Southern Olive Oil Products S.A.R.L',
  ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#123b70',
  ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#123b70',
  ADD COLUMN IF NOT EXISTS enabled_modules TEXT[],
  ADD COLUMN IF NOT EXISTS feature_flags JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Grant table permissions to all roles
GRANT ALL ON public.tenants TO anon, authenticated, service_role;

-- 3. Ensure Row Level Security (RLS) policies allow SELECT, INSERT, and UPDATE
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Allow public read access to tenants" ON public.tenants;
DROP POLICY IF EXISTS "tenants_public_select" ON public.tenants;
DROP POLICY IF EXISTS "tenants_tenant_isolation" ON public.tenants;
DROP POLICY IF EXISTS "Allow public insert access to tenants" ON public.tenants;
DROP POLICY IF EXISTS "tenants_public_insert" ON public.tenants;
DROP POLICY IF EXISTS "Allow public update access to tenants" ON public.tenants;
DROP POLICY IF EXISTS "tenants_public_update" ON public.tenants;

-- Create comprehensive public SELECT policy
CREATE POLICY "Allow public read access to tenants"
  ON public.tenants FOR SELECT
  USING (true);

-- Create comprehensive public INSERT policy
CREATE POLICY "Allow public insert access to tenants"
  ON public.tenants FOR INSERT
  WITH CHECK (true);

-- Create comprehensive public UPDATE policy (Enables Super Admin & Tenant settings persistence)
CREATE POLICY "Allow public update access to tenants"
  ON public.tenants FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 4. Backfill default corporate & fiscal values for existing tenant #1
UPDATE public.tenants
SET
  address = COALESCE(address, 'Nabatieh Industrial Zone, Main Blvd, Bldg 4'),
  headquarters_address = COALESCE(headquarters_address, 'Nabatieh Industrial Zone, Main Blvd, Bldg 4'),
  city = COALESCE(city, 'Nabatieh'),
  country = COALESCE(country, 'Lebanon'),
  phone = COALESCE(phone, '+961 70 882 110'),
  phone_number = COALESCE(phone_number, '+961 70 882 110'),
  billing_email = COALESCE(billing_email, 'accounts@southernolive.com'),
  cr_number = COALESCE(cr_number, 'CR-104928-LB'),
  tax_id = COALESCE(tax_id, 'MOF-7489201'),
  base_currency = COALESCE(base_currency, 'USD'),
  secondary_currency = COALESCE(secondary_currency, 'LBP'),
  exchange_rate_policy = COALESCE(exchange_rate_policy, 'PLATFORM_FIXED'),
  brand_name_ar = COALESCE(brand_name_ar, 'منتوجات زيت وزيتون الجنوب'),
  brand_name_en = COALESCE(brand_name_en, 'Southern Olive Oil Products S.A.R.L'),
  updated_at = now()
WHERE id = '00000000-0000-0000-0000-000000000001'
   OR slug = 'southern-olive'
   OR slug = 'southernolive-lb';
