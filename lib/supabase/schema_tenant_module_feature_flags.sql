-- ============================================================================
-- VANGUARD ERP — TENANTS MODULE FEATURE FLAGS & BRANDING CONFIGURATION
-- ============================================================================

-- 1. Add enabled_modules column to public.tenants if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'tenants' 
          AND column_name = 'enabled_modules'
    ) THEN
        ALTER TABLE public.tenants 
        ADD COLUMN enabled_modules TEXT[] DEFAULT ARRAY['sales', 'operations', 'customers', 'feedback', 'loyalty', 'accounting', 'hr', 'fleet', 'social'];
    END IF;
END $$;

-- 2. Add primary_color and theme_color columns if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'tenants' 
          AND column_name = 'primary_color'
    ) THEN
        ALTER TABLE public.tenants 
        ADD COLUMN primary_color TEXT DEFAULT '#123b70';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'tenants' 
          AND column_name = 'theme_color'
    ) THEN
        ALTER TABLE public.tenants 
        ADD COLUMN theme_color TEXT DEFAULT '#123b70';
    END IF;
END $$;

-- 3. Update primary tenant ('00000000-0000-0000-0000-000000000001', company_id = 1300)
UPDATE public.tenants
SET 
    enabled_modules = ARRAY['sales', 'operations', 'customers', 'feedback', 'loyalty', 'accounting', 'hr', 'fleet', 'social'],
    primary_color = '#123b70',
    theme_color = '#123b70',
    updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 4. Sync public.companies compatibility table if present
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'companies'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'companies' 
              AND column_name = 'enabled_modules'
        ) THEN
            ALTER TABLE public.companies 
            ADD COLUMN enabled_modules TEXT[] DEFAULT ARRAY['sales', 'operations', 'customers', 'feedback', 'loyalty', 'accounting', 'hr', 'fleet', 'social'];
        END IF;

        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'companies' 
              AND column_name = 'theme_color'
        ) THEN
            ALTER TABLE public.companies 
            ADD COLUMN theme_color TEXT DEFAULT '#123b70';
        END IF;
    END IF;
END $$;
