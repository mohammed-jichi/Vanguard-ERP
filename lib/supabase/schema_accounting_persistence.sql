-- ==============================================================================
-- Vanguard ERP: Accounting Module Production Database Schema
-- Complete schema for Accounts, Journal Vouchers, Voucher Lines, Expenses, and General Ledger Entries.
-- ==============================================================================

-- 1. Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Master Chart of Accounts Table
CREATE TABLE IF NOT EXISTS public.acc_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_name_ar VARCHAR(255),
    description TEXT,
    class_id INT DEFAULT 1,
    sub_class4_id INT DEFAULT 1000,
    account_type VARCHAR(50) NOT NULL DEFAULT 'ASSET', -- ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    account_sub_type VARCHAR(50) DEFAULT 'OTHERS',
    type VARCHAR(50) DEFAULT 'Other',                 -- Cash, Bank, Customer, Supplier, Employee, Expense, Other
    class_type VARCHAR(50) DEFAULT 'Assets',          -- Assets, Liabilities, Equity, Revenue, Expense
    currency_id VARCHAR(10) DEFAULT 'USD',
    balance_first_cur NUMERIC(15,2) DEFAULT 0.00,     -- USD Balance
    balance_sec_cur NUMERIC(15,2) DEFAULT 0.00,       -- LBP Balance (Rate 89,500)
    checking_account BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_by VARCHAR(100) DEFAULT 'Super Admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unq_acc_tenant_account_number UNIQUE (tenant_id, account_number)
);

-- 3. Journal Vouchers Header Table
CREATE TABLE IF NOT EXISTS public.acc_journal_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
    jv_number VARCHAR(50) NOT NULL,
    date_of_jv DATE NOT NULL DEFAULT CURRENT_DATE,
    jv_type VARCHAR(50) NOT NULL DEFAULT 'JV',        -- JV, PU, PV, RV, EV, DP, CN, DN
    currency_id VARCHAR(10) DEFAULT 'USD',
    doc_ref_number VARCHAR(255),
    description TEXT NOT NULL,
    internal_remark TEXT,
    department VARCHAR(100) DEFAULT 'Main Department',
    sub_department VARCHAR(100) DEFAULT 'General Operations',
    total_debit NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_credit NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    is_posted BOOLEAN DEFAULT FALSE,
    posted_at TIMESTAMPTZ,
    posted_by VARCHAR(100),
    status VARCHAR(50) DEFAULT 'DRAFT',               -- DRAFT, POSTED, VOID
    created_by VARCHAR(100) DEFAULT 'Super Admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unq_acc_tenant_jv_number UNIQUE (tenant_id, jv_number)
);

-- 4. Journal Voucher Detail Lines Table
CREATE TABLE IF NOT EXISTS public.acc_journal_voucher_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jv_id UUID NOT NULL REFERENCES public.acc_journal_vouchers(id) ON DELETE CASCADE,
    line_number INT NOT NULL,
    account_id UUID REFERENCES public.acc_accounts(id) ON DELETE SET NULL,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    department_id INT,
    department_name VARCHAR(100),
    sub_department_id INT,
    amount_debit NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    amount_credit NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    currency_rate NUMERIC(15,4) DEFAULT 1.0000,
    amount_native NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Expense / Purchases Vouchers Table (Module 2 Lifecycle)
CREATE TABLE IF NOT EXISTS public.acc_expense_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
    ev_number VARCHAR(50) NOT NULL,
    date_of_ev DATE NOT NULL DEFAULT CURRENT_DATE,
    payee VARCHAR(255) NOT NULL,
    reference VARCHAR(100),
    purchase_account_id UUID REFERENCES public.acc_accounts(id) ON DELETE SET NULL,
    purchase_dept VARCHAR(100) DEFAULT 'Main Department',
    currency_id VARCHAR(10) DEFAULT 'USD',
    amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_disbursed NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    payment_difference NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    description TEXT NOT NULL,
    internal_remark TEXT,
    supporting_doc_url TEXT,
    status VARCHAR(50) DEFAULT 'DRAFT',              -- DRAFT, UNCLOSED_PENDING_SETTLEMENT, FULLY_CLOSED_RECONCILED
    is_posted BOOLEAN DEFAULT FALSE,
    posted_at TIMESTAMPTZ,
    posted_by VARCHAR(100),
    created_by VARCHAR(100) DEFAULT 'Super Admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unq_acc_tenant_ev_number UNIQUE (tenant_id, ev_number)
);

-- 6. Expense Payment Lines Table
CREATE TABLE IF NOT EXISTS public.acc_expense_payment_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ev_id UUID NOT NULL REFERENCES public.acc_expense_vouchers(id) ON DELETE CASCADE,
    line_number INT NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'CASH',
    disbursing_account_id UUID REFERENCES public.acc_accounts(id) ON DELETE SET NULL,
    disbursing_account_name VARCHAR(255),
    amount_paid NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    cheque_wire_ref VARCHAR(100),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    department VARCHAR(100) DEFAULT 'Main Department',
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. General Ledger Entries Table (Immutable Audit Ledger)
CREATE TABLE IF NOT EXISTS public.acc_gl_ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
    voucher_id UUID NOT NULL,
    voucher_type VARCHAR(50) NOT NULL,
    voucher_number VARCHAR(50) NOT NULL,
    entry_date DATE NOT NULL,
    account_id UUID REFERENCES public.acc_accounts(id) ON DELETE CASCADE,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    debit NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    credit NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    balance_after NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    narration TEXT,
    created_by VARCHAR(100) DEFAULT 'Super Admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Operational Approvals & Inbox Table
CREATE TABLE IF NOT EXISTS public.acc_inbox_items (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
    category VARCHAR(50) NOT NULL DEFAULT 'APPROVAL', -- APPROVAL, ALERT, REPORT, MEMO
    entity_type VARCHAR(50),                         -- VOUCHER, PURCHASE_ORDER, EXPENSE, LIMIT_EXTENSION, VOID_ALERT
    entity_id VARCHAR(100),
    subject VARCHAR(255) NOT NULL,
    sender VARCHAR(100) NOT NULL,
    branch VARCHAR(100) DEFAULT 'Main Facility',
    amount NUMERIC(15,2),
    ref_code VARCHAR(100),
    time VARCHAR(50),
    date VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',    -- PENDING, APPROVED, REJECTED, REVIEWED
    is_read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'NORMAL',            -- HIGH, NORMAL
    content TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    actioned_by VARCHAR(100),
    actioned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_acc_accounts_tenant ON public.acc_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_acc_accounts_num ON public.acc_accounts(tenant_id, account_number);
CREATE INDEX IF NOT EXISTS idx_acc_jv_tenant ON public.acc_journal_vouchers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_acc_jv_date ON public.acc_journal_vouchers(tenant_id, date_of_jv DESC);
CREATE INDEX IF NOT EXISTS idx_acc_jvl_jv ON public.acc_journal_voucher_lines(jv_id);
CREATE INDEX IF NOT EXISTS idx_acc_ev_tenant ON public.acc_expense_vouchers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_acc_ev_date ON public.acc_expense_vouchers(tenant_id, date_of_ev DESC);
CREATE INDEX IF NOT EXISTS idx_acc_evl_ev ON public.acc_expense_payment_lines(ev_id);
CREATE INDEX IF NOT EXISTS idx_acc_gl_acc ON public.acc_gl_ledger_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_acc_gl_date ON public.acc_gl_ledger_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_acc_inbox_tenant_status ON public.acc_inbox_items(tenant_id, status);

-- 9. Row Level Security & Public Grants
ALTER TABLE public.acc_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_journal_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_journal_voucher_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_expense_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_expense_payment_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_gl_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acc_inbox_items ENABLE ROW LEVEL SECURITY;

-- Drop prior policies to avoid conflicts
DROP POLICY IF EXISTS "Allow all access to acc_accounts" ON public.acc_accounts;
DROP POLICY IF EXISTS "Allow all access to acc_journal_vouchers" ON public.acc_journal_vouchers;
DROP POLICY IF EXISTS "Allow all access to acc_journal_voucher_lines" ON public.acc_journal_voucher_lines;
DROP POLICY IF EXISTS "Allow all access to acc_expense_vouchers" ON public.acc_expense_vouchers;
DROP POLICY IF EXISTS "Allow all access to acc_expense_payment_lines" ON public.acc_expense_payment_lines;
DROP POLICY IF EXISTS "Allow all access to acc_gl_ledger_entries" ON public.acc_gl_ledger_entries;
DROP POLICY IF EXISTS "Allow all access to acc_inbox_items" ON public.acc_inbox_items;

CREATE POLICY "Allow all access to acc_accounts" ON public.acc_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to acc_journal_vouchers" ON public.acc_journal_vouchers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to acc_journal_voucher_lines" ON public.acc_journal_voucher_lines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to acc_expense_vouchers" ON public.acc_expense_vouchers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to acc_expense_payment_lines" ON public.acc_expense_payment_lines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to acc_gl_ledger_entries" ON public.acc_gl_ledger_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to acc_inbox_items" ON public.acc_inbox_items FOR ALL USING (true) WITH CHECK (true);

-- Grant schema usage & full table permissions to anon, authenticated, service_role
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

GRANT ALL ON public.acc_accounts TO anon, authenticated, service_role;
GRANT ALL ON public.acc_journal_vouchers TO anon, authenticated, service_role;
GRANT ALL ON public.acc_journal_voucher_lines TO anon, authenticated, service_role;
GRANT ALL ON public.acc_expense_vouchers TO anon, authenticated, service_role;
GRANT ALL ON public.acc_expense_payment_lines TO anon, authenticated, service_role;
GRANT ALL ON public.acc_gl_ledger_entries TO anon, authenticated, service_role;
GRANT ALL ON public.acc_inbox_items TO anon, authenticated, service_role;


