-- ==============================================================================
-- VANGUARD ERP: ENTERPRISE ROLE-BASED ACCESS CONTROL (RBAC) SCHEMA
-- Unified 12-Module Matrix, Granular Action Overrides, Restricted Reports & Brand Scopes
-- ==============================================================================

-- 1. Create Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    employee_role TEXT NOT NULL DEFAULT 'MANAGER',
    is_read_only BOOLEAN NOT NULL DEFAULT FALSE,
    badge_color TEXT DEFAULT 'bg-slate-100 text-slate-800 border-slate-200',
    assigned_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Role Permissions Table
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id TEXT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    module_key TEXT NOT NULL,
    node_permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    action_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
    restricted_reports JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_role_module UNIQUE(role_id, module_key)
);

-- 3. Create Role Brand Access Table (For Product Request multi-brand scopes)
CREATE TABLE IF NOT EXISTS public.role_brand_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id TEXT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    brand_id TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    can_view BOOLEAN NOT NULL DEFAULT TRUE,
    can_request BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_role_brand UNIQUE(role_id, brand_id)
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_brand_access_role_id ON public.role_brand_access(role_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_brand_access ENABLE ROW LEVEL SECURITY;

-- Permissive public/anon read and write policies for hybrid / local-first architecture
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow all users to read roles" ON public.roles;
    CREATE POLICY "Allow all users to read roles" ON public.roles FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Allow all users to manage roles" ON public.roles;
    CREATE POLICY "Allow all users to manage roles" ON public.roles FOR ALL USING (true);

    DROP POLICY IF EXISTS "Allow all users to read role_permissions" ON public.role_permissions;
    CREATE POLICY "Allow all users to read role_permissions" ON public.role_permissions FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Allow all users to manage role_permissions" ON public.role_permissions;
    CREATE POLICY "Allow all users to manage role_permissions" ON public.role_permissions FOR ALL USING (true);

    DROP POLICY IF EXISTS "Allow all users to read role_brand_access" ON public.role_brand_access;
    CREATE POLICY "Allow all users to read role_brand_access" ON public.role_brand_access FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Allow all users to manage role_brand_access" ON public.role_brand_access;
    CREATE POLICY "Allow all users to manage role_brand_access" ON public.role_brand_access FOR ALL USING (true);
END $$;
