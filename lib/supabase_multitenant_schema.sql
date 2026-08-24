-- ============================================================================
-- VANGUARD ERP — MULTI-TENANT SAAS DATABASE SCHEMA & RLS MIGRATION (SUPABASE)
-- ============================================================================

-- 1. CREATE TENANTS / COMPANIES TABLE
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    brand_name_ar TEXT NOT NULL DEFAULT 'منتوجات زيت وزيتون الجنوب',
    brand_name_en TEXT NOT NULL DEFAULT 'Southern Olive & Oil Products',
    logo_url TEXT DEFAULT '/assets/images/logo.png',
    subscription_tier TEXT NOT NULL DEFAULT 'PRO' CHECK (subscription_tier IN ('STARTER', 'PRO', 'ENTERPRISE')),
    subscription_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (subscription_status IN ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIAL')),
    ai_usage_count INT NOT NULL DEFAULT 0,
    ai_usage_limit INT NOT NULL DEFAULT 1000,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CREATE USER PROFILES TABLE LINKED TO SUPABASE AUTH & COMPANY
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    role TEXT NOT NULL DEFAULT 'COMPANY_ADMIN' CHECK (role IN ('SUPER_ADMIN', 'COMPANY_ADMIN', 'MANAGER', 'STAFF', 'DRIVER')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. INSERT DEFAULT MASTER SUPER ADMIN COMPANY
INSERT INTO public.companies (id, name, slug, brand_name_ar, brand_name_en, subscription_tier, subscription_status)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Vanguard Master Enterprise', 'southern-olive', 'منتوجات زيت وزيتون الجنوب', 'Southern Olive & Oil Products', 'ENTERPRISE', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 4. ADD company_id TO ALL CORE TABLES
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.fleet_vehicles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.movement_logs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) DEFAULT '00000000-0000-0000-0000-000000000001';

-- 5. SECURITY HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.get_auth_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 6. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movement_logs ENABLE ROW LEVEL SECURITY;

-- 7. ROW LEVEL SECURITY POLICIES (STRICT TENANT ISOLATION)

-- Companies Table Policy
DROP POLICY IF EXISTS companies_tenant_isolation ON public.companies;
CREATE POLICY companies_tenant_isolation ON public.companies
    FOR ALL
    USING (public.is_super_admin() OR id = public.get_auth_company_id());

-- Profiles Table Policy
DROP POLICY IF EXISTS profiles_tenant_isolation ON public.profiles;
CREATE POLICY profiles_tenant_isolation ON public.profiles
    FOR ALL
    USING (public.is_super_admin() OR company_id = public.get_auth_company_id());

-- Inventory Table Policy
DROP POLICY IF EXISTS inventory_tenant_isolation ON public.inventory;
CREATE POLICY inventory_tenant_isolation ON public.inventory
    FOR ALL
    USING (public.is_super_admin() OR company_id = public.get_auth_company_id())
    WITH CHECK (public.is_super_admin() OR company_id = public.get_auth_company_id());

-- Production Orders Policy
DROP POLICY IF EXISTS production_tenant_isolation ON public.production_orders;
CREATE POLICY production_tenant_isolation ON public.production_orders
    FOR ALL
    USING (public.is_super_admin() OR company_id = public.get_auth_company_id())
    WITH CHECK (public.is_super_admin() OR company_id = public.get_auth_company_id());

-- Sales Invoices Policy
DROP POLICY IF EXISTS sales_tenant_isolation ON public.sales_invoices;
CREATE POLICY sales_tenant_isolation ON public.sales_invoices
    FOR ALL
    USING (public.is_super_admin() OR company_id = public.get_auth_company_id())
    WITH CHECK (public.is_super_admin() OR company_id = public.get_auth_company_id());

-- Fleet Vehicles Policy
DROP POLICY IF EXISTS fleet_tenant_isolation ON public.fleet_vehicles;
CREATE POLICY fleet_tenant_isolation ON public.fleet_vehicles
    FOR ALL
    USING (public.is_super_admin() OR company_id = public.get_auth_company_id())
    WITH CHECK (public.is_super_admin() OR company_id = public.get_auth_company_id());

-- Movement Logs Policy
DROP POLICY IF EXISTS movement_logs_tenant_isolation ON public.movement_logs;
CREATE POLICY movement_logs_tenant_isolation ON public.movement_logs
    FOR ALL
    USING (public.is_super_admin() OR company_id = public.get_auth_company_id())
    WITH CHECK (public.is_super_admin() OR company_id = public.get_auth_company_id());
