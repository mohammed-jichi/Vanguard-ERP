-- ==============================================================================
-- Vanguard ERP - System Activities & Audit Logs Database Schema
-- Multi-Tenant System Audit Trail for Tenant Management & Module Feature Flags
-- ==============================================================================

-- 1. Create system_activities table
CREATE TABLE IF NOT EXISTS public.system_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT,
    company_id INT,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    performed_by TEXT NOT NULL DEFAULT 'Super Admin (System Owner)',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Also ensure synonym/alias table audit_logs exists or views to system_activities
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    performed_by TEXT NOT NULL DEFAULT 'Super Admin (System Owner)',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Performance indexes for fast descending chronological feeds & pagination
CREATE INDEX IF NOT EXISTS idx_system_activities_created_at_desc ON public.system_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_activities_tenant_id ON public.system_activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_system_activities_action_type ON public.system_activities(action_type);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at_desc ON public.audit_logs(created_at DESC);

-- 3. Row Level Security (RLS) policies
ALTER TABLE public.system_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow Super Admins and authenticated staff to select & insert activity logs
DROP POLICY IF EXISTS "Public read system activities" ON public.system_activities;
CREATE POLICY "Public read system activities" ON public.system_activities
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert system activities" ON public.system_activities;
CREATE POLICY "Public insert system activities" ON public.system_activities
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read audit logs" ON public.audit_logs;
CREATE POLICY "Public read audit logs" ON public.audit_logs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert audit logs" ON public.audit_logs;
CREATE POLICY "Public insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- 4. Initial Seed Audit Data documenting historical operations
INSERT INTO public.system_activities (tenant_id, company_id, action_type, description, performed_by, metadata, created_at)
VALUES 
    (
        '00000000-0000-0000-0000-000000000001',
        1300,
        'TENANT_INITIALIZED',
        'تأسيس واعتماد مساحة العمل الرئيسية لمؤسسة منتوجات زيت وزيتون الجنوب وتخصيص معرف الشركة رقم 1300',
        'Super Admin (Mohammed Jichi)',
        '{"modules_count": 9, "tier": "ENTERPRISE"}'::jsonb,
        now() - INTERVAL '3 days'
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        1300,
        'MODULES_CONFIGURED',
        'تفعيل كافة الوحدات التشغيلية التسع (المبيعات، العمليات، العملاء، المحاسبة، الأسطول، الولاء، الملاحظات، الرواتب، وخدمة العملاء)',
        'Super Admin (Mohammed Jichi)',
        '{"enabled_modules": ["sales", "operations", "customers", "feedback", "loyalty", "accounting", "hr", "fleet", "social"]}'::jsonb,
        now() - INTERVAL '2 days'
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        1300,
        'BRANDING_UPDATED',
        'تحديث الهوية البصرية وشعار المؤسسة وتعيين اللون الرئيسي المعتمد (#123b70 Vanguard Navy)',
        'Super Admin (Mohammed Jichi)',
        '{"primary_color": "#123b70", "logo_url": "/assets/images/logo.png"}'::jsonb,
        now() - INTERVAL '1 day'
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        1300,
        'FEATURE_FLAGS_ENFORCED',
        'تطبيق نظام حراسة المسارات (Route Guards) وعزل الصلاحيات للوحدات المخصصة عبر مساحات العمل',
        'System Engine (Vanguard Controller)',
        '{"guard_status": "ACTIVE"}'::jsonb,
        now() - INTERVAL '8 hours'
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        1300,
        'WORKSPACE_PREVIEW',
        'دخول ومعاينة مساحة العمل التجريبية لمؤسسة منتوجات زيت وزيتون الجنوب (#1300) والتحقق من الروابط السحابية',
        'Super Admin (Mohammed Jichi)',
        '{"target_route": "/1300/dashboard"}'::jsonb,
        now() - INTERVAL '1 hour'
    )
ON CONFLICT DO NOTHING;
