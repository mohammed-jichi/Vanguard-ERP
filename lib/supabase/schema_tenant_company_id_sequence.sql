-- ============================================================================
-- VANGUARD ERP — TENANTS COMPANY_ID AUTO-INCREMENT SEQUENCE (STARTING AT 1300)
-- ============================================================================

-- 1. Create the sequence starting at 1300 if it does not already exist
CREATE SEQUENCE IF NOT EXISTS public.tenants_company_id_seq
    START WITH 1300
    INCREMENT BY 1
    MINVALUE 1300
    NO MAXVALUE
    CACHE 1;

-- 2. Add company_id column to public.tenants if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'tenants' 
          AND column_name = 'company_id'
    ) THEN
        ALTER TABLE public.tenants 
        ADD COLUMN company_id INT UNIQUE DEFAULT nextval('public.tenants_company_id_seq');
    END IF;
END $$;

-- 3. Ensure sequence ownership on company_id column
ALTER SEQUENCE public.tenants_company_id_seq OWNED BY public.tenants.company_id;

-- Ensure default value is set to the sequence
ALTER TABLE public.tenants 
    ALTER COLUMN company_id SET DEFAULT nextval('public.tenants_company_id_seq');

-- 4. Assign company_id = 1300 to primary tenant ('00000000-0000-0000-0000-000000000001')
UPDATE public.tenants 
SET company_id = 1300 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Ensure next sequence value starts sequentially after 1300 (1301, 1302, ...)
SELECT setval(
    'public.tenants_company_id_seq', 
    GREATEST(COALESCE((SELECT MAX(company_id) FROM public.tenants), 1300), 1300)
);

-- 5. Add company_id to public.companies compatibility table if it exists
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
              AND column_name = 'company_id'
        ) THEN
            ALTER TABLE public.companies 
            ADD COLUMN company_id INT;
        END IF;

        UPDATE public.companies 
        SET company_id = 1300 
        WHERE id = '00000000-0000-0000-0000-000000000001';
    END IF;
END $$;

-- 6. Add index for rapid lookup by company_id
CREATE INDEX IF NOT EXISTS idx_tenants_company_id ON public.tenants(company_id);
