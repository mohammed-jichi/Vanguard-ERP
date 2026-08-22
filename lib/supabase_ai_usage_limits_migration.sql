-- ============================================================================
-- VANGUARD ERP — AI USAGE LIMITS & COUNTER MIGRATION (SUPABASE)
-- ============================================================================

-- 1. ADD AI USAGE COLUMNS TO COMPANIES TABLE
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS ai_usage_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_usage_limit INT NOT NULL DEFAULT 1000;

-- 2. ADD AI USAGE COLUMNS TO TENANTS TABLE (IF EXISTS)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') THEN
        ALTER TABLE public.tenants
          ADD COLUMN IF NOT EXISTS ai_usage_count INT NOT NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS ai_usage_limit INT NOT NULL DEFAULT 1000;
    END IF;
END $$;

-- 3. STORED PROCEDURE / FUNCTION TO CHECK AND INCREMENT AI USAGE
CREATE OR REPLACE FUNCTION public.increment_ai_usage(p_tenant_id UUID)
RETURNS TABLE(allowed BOOLEAN, current_count INT, usage_limit INT) AS $$
DECLARE
    v_count INT;
    v_limit INT;
BEGIN
    -- Check companies table
    SELECT ai_usage_count, ai_usage_limit INTO v_count, v_limit
    FROM public.companies
    WHERE id = p_tenant_id
    FOR UPDATE;

    -- Fallback to tenants table if not found in companies
    IF NOT FOUND AND EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') THEN
        SELECT ai_usage_count, ai_usage_limit INTO v_count, v_limit
        FROM public.tenants
        WHERE id = p_tenant_id
        FOR UPDATE;
    END IF;

    IF v_count IS NULL THEN
        -- Company / Tenant not found, allow default
        RETURN QUERY SELECT TRUE, 0, 1000;
        RETURN;
    END IF;

    IF v_count >= v_limit THEN
        -- Limit exceeded
        RETURN QUERY SELECT FALSE, v_count, v_limit;
        RETURN;
    ELSE
        -- Increment count
        UPDATE public.companies
        SET ai_usage_count = ai_usage_count + 1,
            updated_at = NOW()
        WHERE id = p_tenant_id;

        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') THEN
            UPDATE public.tenants
            SET ai_usage_count = ai_usage_count + 1,
                updated_at = NOW()
            WHERE id = p_tenant_id;
        END IF;

        RETURN QUERY SELECT TRUE, v_count + 1, v_limit;
        RETURN;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNCTION TO RESET AI USAGE COUNTER (ADMIN RESET)
CREATE OR REPLACE FUNCTION public.reset_ai_usage(p_tenant_id UUID, p_new_limit INT DEFAULT 1000)
RETURNS VOID AS $$
BEGIN
    UPDATE public.companies
    SET ai_usage_count = 0,
        ai_usage_limit = COALESCE(p_new_limit, ai_usage_limit),
        updated_at = NOW()
    WHERE id = p_tenant_id;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') THEN
        UPDATE public.tenants
        SET ai_usage_count = 0,
            ai_usage_limit = COALESCE(p_new_limit, ai_usage_limit),
            updated_at = NOW()
        WHERE id = p_tenant_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
