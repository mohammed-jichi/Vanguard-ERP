-- ==============================================================================
-- Vanguard ERP: Batch 3 Field Operations, CRM & Logistics Schema
-- Covers: Customer Payments (Debtors Aging), Real-Time Loyalty Ledger,
-- HR Payroll Runs & Payslips, Fleet Driver Run Sheets (POD), and Support Tickets
-- ==============================================================================

-- 1. CUSTOMER PAYMENTS & AGING CLEARING (Module 4)
CREATE TABLE IF NOT EXISTS public.customer_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    receipt_no TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT now(),
    amount NUMERIC(15, 2) NOT NULL,
    payment_method TEXT DEFAULT 'CASH', -- 'CASH', 'BANK_TRANSFER', 'CHEQUE', 'WHISH'
    reference_no TEXT,
    notes TEXT,
    allocated_invoices JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_tenant_customer_receipt UNIQUE (tenant_id, receipt_no)
);

CREATE INDEX IF NOT EXISTS idx_customer_payments_tenant ON public.customer_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customer_payments_customer ON public.customer_payments(tenant_id, customer_id);

-- 2. LOYALTY MANAGEMENT & REAL-TIME LEDGER (Module 6)
CREATE TABLE IF NOT EXISTS public.loyalty_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    customer_id TEXT,
    member_name TEXT NOT NULL,
    member_phone TEXT NOT NULL,
    member_email TEXT,
    tier TEXT DEFAULT 'BRONZE', -- 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'
    points_balance NUMERIC(12, 2) DEFAULT 0.00,
    lifetime_points NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_tenant_loyalty_phone UNIQUE (tenant_id, member_phone)
);

CREATE INDEX IF NOT EXISTS idx_loyalty_members_tenant ON public.loyalty_members(tenant_id);

CREATE TABLE IF NOT EXISTS public.loyalty_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.loyalty_members(id) ON DELETE CASCADE,
    customer_phone TEXT,
    order_id UUID,
    order_no TEXT,
    transaction_type TEXT NOT NULL, -- 'ACCRUAL', 'REDEMPTION', 'ADJUSTMENT', 'EXPIRY'
    points NUMERIC(12, 2) NOT NULL,
    points_balance_after NUMERIC(12, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_ledger_tenant ON public.loyalty_ledger(tenant_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_ledger_member ON public.loyalty_ledger(tenant_id, member_id);

-- 3. HR PAYROLL RUNS & PAYSLIP RECORDS (Module 8)
CREATE TABLE IF NOT EXISTS public.payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    run_code TEXT NOT NULL,
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    total_gross NUMERIC(15, 2) DEFAULT 0.00,
    total_deductions NUMERIC(15, 2) DEFAULT 0.00,
    total_net NUMERIC(15, 2) DEFAULT 0.00,
    employee_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'APPROVED', -- 'DRAFT', 'APPROVED', 'DISBURSED'
    disbursed_at TIMESTAMPTZ,
    journal_voucher_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_tenant_payroll_run UNIQUE (tenant_id, run_code)
);

CREATE INDEX IF NOT EXISTS idx_payroll_runs_tenant ON public.payroll_runs(tenant_id);

CREATE TABLE IF NOT EXISTS public.payslip_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    payroll_run_id UUID REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
    employee_id TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    gross_salary NUMERIC(15, 2) NOT NULL,
    deductions NUMERIC(15, 2) DEFAULT 0.00,
    net_pay NUMERIC(15, 2) NOT NULL,
    status TEXT DEFAULT 'PAID', -- 'PENDING', 'PAID', 'CANCELLED'
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payslip_records_tenant ON public.payslip_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payslip_records_run ON public.payslip_records(tenant_id, payroll_run_id);

-- 4. FLEET RUN SHEETS & PROOF OF DELIVERY (Module 9)
CREATE TABLE IF NOT EXISTS public.driver_run_sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    driver_id TEXT NOT NULL,
    driver_name TEXT NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    order_number TEXT,
    delivery_status TEXT DEFAULT 'DELIVERED',
    cash_collected NUMERIC(15, 2) DEFAULT 0.00,
    cash_currency TEXT DEFAULT 'USD',
    signature_url TEXT,
    delivered_at TIMESTAMPTZ DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_driver_run_sheets_tenant ON public.driver_run_sheets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_driver_run_sheets_driver ON public.driver_run_sheets(tenant_id, driver_id);

-- 5. SUPPORT TICKETS & CUSTOMER CARE SLA (Module 5)
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    ticket_no TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    channel TEXT DEFAULT 'WhatsApp',
    category TEXT NOT NULL,
    severity TEXT DEFAULT 'MEDIUM', -- 'CRITICAL', 'MEDIUM', 'LOW'
    status TEXT DEFAULT 'NEW', -- 'NEW', 'INVESTIGATING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'
    description TEXT NOT NULL,
    root_cause TEXT,
    corrective_plan TEXT,
    compensation_notes TEXT,
    assigned_rep TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_tenant_support_ticket UNIQUE (tenant_id, ticket_no)
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant ON public.support_tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(tenant_id, status);

-- 6. ENSURE STORAGE BUCKET FOR POD & MEDIA EXISTS
INSERT INTO storage.buckets (id, name, public)
VALUES ('organization-media', 'organization-media', true)
ON CONFLICT (id) DO NOTHING;

-- 7. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslip_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_run_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- 8. TENANT ISOLATION POLICIES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_customer_payments') THEN
        CREATE POLICY tenant_isolation_customer_payments ON public.customer_payments
            FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_loyalty_members') THEN
        CREATE POLICY tenant_isolation_loyalty_members ON public.loyalty_members
            FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_loyalty_ledger') THEN
        CREATE POLICY tenant_isolation_loyalty_ledger ON public.loyalty_ledger
            FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_payroll_runs') THEN
        CREATE POLICY tenant_isolation_payroll_runs ON public.payroll_runs
            FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_payslip_records') THEN
        CREATE POLICY tenant_isolation_payslip_records ON public.payslip_records
            FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_driver_run_sheets') THEN
        CREATE POLICY tenant_isolation_driver_run_sheets ON public.driver_run_sheets
            FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_support_tickets') THEN
        CREATE POLICY tenant_isolation_support_tickets ON public.support_tickets
            FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid);
    END IF;
END $$;
