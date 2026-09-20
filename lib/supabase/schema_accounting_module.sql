-- ==============================================================================
-- Vanguard ERP System: Accounting Module Database Schema (Omega Parity)
-- Complete schema for Plan Comptable General (PCG), Chart of Accounts,
-- Journal Vouchers (Dual Entry), AR/AP Aging, Reconciliations & VAT Closings.
-- ==============================================================================

-- 1. Master Account Classes (Classes 1 to 7)
CREATE TABLE IF NOT EXISTS public.acc_classes (
    id SERIAL PRIMARY KEY,
    class_number INT NOT NULL UNIQUE,
    account_group_name VARCHAR(150) NOT NULL,
    account_label VARCHAR(200) NOT NULL
);

-- 2. Account Header 1 (Sub Class 1)
CREATE TABLE IF NOT EXISTS public.acc_sub_class1 (
    id SERIAL PRIMARY KEY,
    class_id INT REFERENCES public.acc_classes(id) ON DELETE CASCADE,
    account_number_ref INT NOT NULL,
    account_name VARCHAR(200) NOT NULL,
    account_label VARCHAR(250)
);

-- 3. Account Header 2 (Sub Class 2)
CREATE TABLE IF NOT EXISTS public.acc_sub_class2 (
    id SERIAL PRIMARY KEY,
    sub_class1_id INT REFERENCES public.acc_sub_class1(id) ON DELETE CASCADE,
    account_number_ref INT NOT NULL,
    account_name VARCHAR(200) NOT NULL
);

-- 4. Account Header 3 (Sub Class 3)
CREATE TABLE IF NOT EXISTS public.acc_sub_class3 (
    id SERIAL PRIMARY KEY,
    sub_class2_id INT REFERENCES public.acc_sub_class2(id) ON DELETE CASCADE,
    account_number_ref INT NOT NULL,
    account_name VARCHAR(200) NOT NULL
);

-- 5. Account Group (Sub Class 4)
CREATE TABLE IF NOT EXISTS public.acc_sub_class4 (
    id SERIAL PRIMARY KEY,
    sub_class3_id INT REFERENCES public.acc_sub_class3(id) ON DELETE CASCADE,
    account_number_ref INT NOT NULL,
    account_name VARCHAR(200) NOT NULL,
    depreciation_interval VARCHAR(50) DEFAULT 'MONTHLY',
    depreciation_account_id INT,
    depreciation_expense_account_id INT
);

-- 6. Detail Accounts (Chart of Accounts)
CREATE TABLE IF NOT EXISTS public.acc_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_name_ar VARCHAR(255),
    description TEXT,
    class_id INT REFERENCES public.acc_classes(id),
    sub_class4_id INT REFERENCES public.acc_sub_class4(id),
    account_type VARCHAR(50) NOT NULL, -- ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    currency_id VARCHAR(10) DEFAULT 'USD',
    balance_first_cur NUMERIC(15,2) DEFAULT 0.00,
    balance_sec_cur NUMERIC(15,2) DEFAULT 0.00,
    checking_account BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unq_tenant_account_number UNIQUE (tenant_id, account_number)
);

-- 7. Currencies & Exchange Rates
CREATE TABLE IF NOT EXISTS public.acc_currencies (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    exchange_rate NUMERIC(15,4) NOT NULL DEFAULT 1.0000,
    decimal_digits INT NOT NULL DEFAULT 2,
    is_main BOOLEAN DEFAULT FALSE
);

-- 8. Department Groups, Departments & Sub-Departments
CREATE TABLE IF NOT EXISTS public.acc_department_groups (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    group_name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.acc_departments (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    group_id INT REFERENCES public.acc_department_groups(id) ON DELETE SET NULL,
    department_name VARCHAR(100) NOT NULL,
    department_code VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS public.acc_sub_departments (
    id SERIAL PRIMARY KEY,
    department_id INT REFERENCES public.acc_departments(id) ON DELETE CASCADE,
    sub_department_name VARCHAR(100) NOT NULL
);

-- 9. Journal Vouchers Header
CREATE TABLE IF NOT EXISTS public.acc_journal_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    jv_number VARCHAR(50) NOT NULL,
    date_of_jv DATE NOT NULL DEFAULT CURRENT_DATE,
    jv_type VARCHAR(50) NOT NULL DEFAULT 'STANDARD', -- STANDARD, OPENING, DEPRECIATION, ADJUSTING, CLOSING
    currency_id VARCHAR(10) DEFAULT 'USD',
    doc_ref_number VARCHAR(100),
    description TEXT,
    internal_remark TEXT,
    total_debit NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_credit NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    is_posted BOOLEAN DEFAULT FALSE,
    posted_at TIMESTAMPTZ,
    posted_by VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unq_tenant_jv_number UNIQUE (tenant_id, jv_number)
);

-- 10. Journal Voucher Detail Lines (Dual Entry)
CREATE TABLE IF NOT EXISTS public.acc_journal_voucher_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jv_id UUID REFERENCES public.acc_journal_vouchers(id) ON DELETE CASCADE,
    line_number INT NOT NULL,
    account_id UUID REFERENCES public.acc_accounts(id),
    account_number VARCHAR(50),
    account_name VARCHAR(255),
    description VARCHAR(255),
    department_id INT REFERENCES public.acc_departments(id),
    sub_department_id INT REFERENCES public.acc_sub_departments(id),
    amount_debit NUMERIC(15,2) DEFAULT 0.00,
    amount_credit NUMERIC(15,2) DEFAULT 0.00,
    currency_rate NUMERIC(12,4) DEFAULT 1.0000,
    amount_native NUMERIC(15,2) NOT NULL DEFAULT 0.00
);

-- 11. Bank Reconciliations
CREATE TABLE IF NOT EXISTS public.acc_bank_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.acc_accounts(id),
    statement_date DATE NOT NULL,
    beginning_balance NUMERIC(15,2) NOT NULL,
    ending_balance NUMERIC(15,2) NOT NULL,
    cleared_deposits NUMERIC(15,2) DEFAULT 0.00,
    cleared_withdrawals NUMERIC(15,2) DEFAULT 0.00,
    reconciled_balance NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    difference NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. VAT Period Closings
CREATE TABLE IF NOT EXISTS public.acc_vat_period_closings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    taxable_sales_amount NUMERIC(15,2) DEFAULT 0.00,
    vat_output_amount NUMERIC(15,2) DEFAULT 0.00,
    taxable_purchases_amount NUMERIC(15,2) DEFAULT 0.00,
    vat_input_amount NUMERIC(15,2) DEFAULT 0.00,
    net_vat_payable NUMERIC(15,2) DEFAULT 0.00,
    closing_jv_id UUID REFERENCES public.acc_journal_vouchers(id),
    closed_by VARCHAR(100),
    closed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Cash Flow Report Mapping Setup
CREATE TABLE IF NOT EXISTS public.acc_cash_flow_setup (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    mapping_type VARCHAR(50) NOT NULL, -- ACCOUNT or SUB_CLASS4
    account_id UUID REFERENCES public.acc_accounts(id) ON DELETE CASCADE,
    sub_class4_id INT REFERENCES public.acc_sub_class4(id) ON DELETE CASCADE,
    cash_flow_section VARCHAR(50) NOT NULL -- OPERATING, INVESTING, FINANCING
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_acc_accounts_tenant ON public.acc_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_acc_accounts_number ON public.acc_accounts(tenant_id, account_number);
CREATE INDEX IF NOT EXISTS idx_acc_jv_tenant ON public.acc_journal_vouchers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_acc_jv_date ON public.acc_journal_vouchers(tenant_id, date_of_jv DESC);
CREATE INDEX IF NOT EXISTS idx_acc_jv_lines_jv ON public.acc_journal_voucher_lines(jv_id);
CREATE INDEX IF NOT EXISTS idx_acc_jv_lines_acc ON public.acc_journal_voucher_lines(account_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.acc_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_sub_class1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_sub_class2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_sub_class3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_sub_class4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_journal_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_journal_voucher_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read account classes" ON public.acc_classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Tenant isolation for accounts" ON public.acc_accounts FOR ALL TO authenticated USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid OR tenant_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY "Tenant isolation for journal vouchers" ON public.acc_journal_vouchers FOR ALL TO authenticated USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid OR tenant_id = '00000000-0000-0000-0000-000000000001');

-- ==============================================================================
-- SEED DATA: 7 PLAN COMPTABLE GENERAL (PCG) CLASSES
-- ==============================================================================
INSERT INTO public.acc_classes (class_number, account_group_name, account_label) VALUES
(1, 'Permanent Capital Accounts', 'Permanent Capital Accounts, (1)'),
(2, 'Fixed Assets Accounts', 'Fixed Assets Accounts, (2)'),
(3, 'Stocks & Work In Progress', 'Stocks & Work In Progress, (3)'),
(4, 'Accounts Payable & Receivable', 'Accounts Payable & Receivable, (4)'),
(5, 'Monetary Accounts', 'Monetary Accounts, (5)'),
(6, 'Expenditure', 'Expenditure, (6)'),
(7, 'Revenues Accounts', 'Revenues Accounts, (7)')
ON CONFLICT (class_number) DO NOTHING;

-- Seed Currencies
INSERT INTO public.acc_currencies (id, name, symbol, exchange_rate, decimal_digits, is_main) VALUES
('USD', 'US Dollar', '$', 1.0000, 2, TRUE),
('LBP', 'Lebanese Pound', 'L.L.', 89500.0000, 0, FALSE),
('EUR', 'Euro', '€', 0.9200, 2, FALSE)
ON CONFLICT (id) DO NOTHING;
