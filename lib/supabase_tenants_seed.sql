-- ============================================================================
-- VANGUARD ERP — MULTI-TENANT SAAS DATABASE MIGRATION & SEED (TENANT #1)
-- ============================================================================

-- 1. CREATE TENANTS TABLE
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    brand_name_ar TEXT NOT NULL DEFAULT 'منتوجات زيت وزيتون الجنوب',
    brand_name_en TEXT NOT NULL DEFAULT 'Southern Olive Oil Products S.A.R.L',
    owner_email TEXT NOT NULL DEFAULT 'khadeer@vanguard-erp.com',
    logo_url TEXT DEFAULT '/assets/images/logo.png',
    subscription_tier TEXT NOT NULL DEFAULT 'ENTERPRISE' CHECK (subscription_tier IN ('STARTER', 'PRO', 'ENTERPRISE')),
    subscription_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (subscription_status IN ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIAL')),
    ai_usage_count INT NOT NULL DEFAULT 0,
    ai_usage_limit INT NOT NULL DEFAULT 1000,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CREATE ALIAS OR COMPATIBILITY VIEW / TABLE FOR COMPANIES
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    brand_name_ar TEXT NOT NULL DEFAULT 'منتوجات زيت وزيتون الجنوب',
    brand_name_en TEXT NOT NULL DEFAULT 'Southern Olive Oil Products S.A.R.L',
    logo_url TEXT DEFAULT '/assets/images/logo.png',
    subscription_tier TEXT NOT NULL DEFAULT 'ENTERPRISE',
    subscription_status TEXT NOT NULL DEFAULT 'ACTIVE',
    ai_usage_count INT NOT NULL DEFAULT 0,
    ai_usage_limit INT NOT NULL DEFAULT 1000,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. SEED TENANT #1: 'منتوجات زيت وزيتون الجنوب' (KHADEER OWNER)
INSERT INTO public.tenants (id, name, slug, brand_name_ar, brand_name_en, owner_email, subscription_tier, subscription_status)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'منتوجات زيت وزيتون الجنوب', 'southern-olive', 'منتوجات زيت وزيتون الجنوب', 'Southern Olive Oil Products S.A.R.L', 'khadeer@vanguard-erp.com', 'ENTERPRISE', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  brand_name_ar = EXCLUDED.brand_name_ar,
  owner_email = EXCLUDED.owner_email;

INSERT INTO public.companies (id, name, slug, brand_name_ar, brand_name_en, subscription_tier, subscription_status)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'منتوجات زيت وزيتون الجنوب', 'southern-olive', 'منتوجات زيت وزيتون الجنوب', 'Southern Olive Oil Products S.A.R.L', 'ENTERPRISE', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 4. CREATE USER PROFILES TABLE WITH TENANT_ID AND KHADEER AS OWNER
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    company_id UUID REFERENCES public.companies(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    role TEXT NOT NULL DEFAULT 'SUPER_ADMIN' CHECK (role IN ('SUPER_ADMIN', 'COMPANY_ADMIN', 'MANAGER', 'STAFF', 'DRIVER')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ALTER ALL CORE TABLES TO INCLUDE TENANT_ID & COMPANY_ID
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) DEFAULT '00000000-0000-0000-0000-000000000001';

ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) DEFAULT '00000000-0000-0000-0000-000000000001';

ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) DEFAULT '00000000-0000-0000-0000-000000000001';

ALTER TABLE public.fleet_vehicles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.fleet_vehicles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) DEFAULT '00000000-0000-0000-0000-000000000001';

ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) DEFAULT '00000000-0000-0000-0000-000000000001';

ALTER TABLE public.movement_logs ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.movement_logs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) DEFAULT '00000000-0000-0000-0000-000000000001';

-- 6. SECURITY HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS UUID AS $$
  SELECT COALESCE(tenant_id, company_id) FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 7. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movement_logs ENABLE ROW LEVEL SECURITY;

-- 8. STRICT ROW LEVEL SECURITY (RLS) POLICIES
DROP POLICY IF EXISTS tenants_tenant_isolation ON public.tenants;
CREATE POLICY tenants_tenant_isolation ON public.tenants
    FOR ALL
    USING (public.is_super_admin() OR id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS inventory_tenant_isolation ON public.inventory;
CREATE POLICY inventory_tenant_isolation ON public.inventory
    FOR ALL
    USING (public.is_super_admin() OR tenant_id = public.get_auth_tenant_id() OR company_id = public.get_auth_tenant_id())
    WITH CHECK (public.is_super_admin() OR tenant_id = public.get_auth_tenant_id() OR company_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS production_tenant_isolation ON public.production_orders;
CREATE POLICY production_tenant_isolation ON public.production_orders
    FOR ALL
    USING (public.is_super_admin() OR tenant_id = public.get_auth_tenant_id() OR company_id = public.get_auth_tenant_id())
    WITH CHECK (public.is_super_admin() OR tenant_id = public.get_auth_tenant_id() OR company_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS sales_tenant_isolation ON public.sales_invoices;
CREATE POLICY sales_tenant_isolation ON public.sales_invoices
    FOR ALL
    USING (public.is_super_admin() OR tenant_id = public.get_auth_tenant_id() OR company_id = public.get_auth_tenant_id())
    WITH CHECK (public.is_super_admin() OR tenant_id = public.get_auth_tenant_id() OR company_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS fleet_tenant_isolation ON public.fleet_vehicles;
CREATE POLICY fleet_tenant_isolation ON public.fleet_vehicles
    FOR ALL
    USING (public.is_super_admin() OR tenant_id = public.get_auth_tenant_id() OR company_id = public.get_auth_tenant_id())
    WITH CHECK (public.is_super_admin() OR tenant_id = public.get_auth_tenant_id() OR company_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS movement_logs_tenant_isolation ON public.movement_logs;
CREATE POLICY movement_logs_tenant_isolation ON public.movement_logs
    FOR ALL
    USING (public.is_super_admin() OR tenant_id = public.get_auth_tenant_id() OR company_id = public.get_auth_tenant_id())
    WITH CHECK (public.is_super_admin() OR tenant_id = public.get_auth_tenant_id() OR company_id = public.get_auth_tenant_id());

-- 9. ALLOW PUBLIC/ANON READ & INSERT ON TENANTS TABLE FOR APP INSTANCES
GRANT SELECT, INSERT, UPDATE ON public.tenants TO anon, authenticated;
DROP POLICY IF EXISTS tenants_public_select ON public.tenants;
CREATE POLICY tenants_public_select ON public.tenants FOR SELECT USING (true);
DROP POLICY IF EXISTS tenants_public_insert ON public.tenants;
CREATE POLICY tenants_public_insert ON public.tenants FOR INSERT WITH CHECK (true);
