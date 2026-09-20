-- ============================================================
-- VANGUARD ERP: ADVANCED ACCOUNTING, TAX SPLIT & ALLOCATIONS
-- ============================================================

-- 0. الجداول المرجعية التأسيسية إن لم تكن موجودة (Base Reference Tables)
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    currency VARCHAR(20) DEFAULT 'USD',
    normal_balance VARCHAR(10) DEFAULT 'Debit',
    balance NUMERIC(14, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS company_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    cost_center_code VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_number VARCHAR(50) NOT NULL UNIQUE,
    voucher_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_no VARCHAR(100),
    narration TEXT,
    is_posted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_id UUID NOT NULL REFERENCES journal_vouchers(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    department_id UUID REFERENCES company_departments(id),
    description TEXT,
    debit NUMERIC(14, 2) DEFAULT 0,
    credit NUMERIC(14, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_tax_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_code VARCHAR(50) NOT NULL UNIQUE,
    tax_name VARCHAR(100) NOT NULL,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 11.0, -- Default Lebanese VAT (11%)
    is_active BOOLEAN DEFAULT TRUE,
    enable_rounding_up BOOLEAN DEFAULT FALSE,
    tax1_account_id UUID REFERENCES chart_of_accounts(id),
    tax2_account_id UUID REFERENCES chart_of_accounts(id),
    tax3_account_id UUID REFERENCES chart_of_accounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. خيارات تهيئة الضرائب المتقدمة وتقريب المبالغ
ALTER TABLE system_tax_configurations
ADD COLUMN IF NOT EXISTS enable_rounding_up BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tax1_account_id UUID REFERENCES chart_of_accounts(id),
ADD COLUMN IF NOT EXISTS tax2_account_id UUID REFERENCES chart_of_accounts(id),
ADD COLUMN IF NOT EXISTS tax3_account_id UUID REFERENCES chart_of_accounts(id);

-- 2. دعم الأقسام في دليل الحسابات وسندات اليومية (Department Filter)
ALTER TABLE journal_entry_lines
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES company_departments(id);

-- 3. جدول التوزيع الآلي للمصاريف المدفوعة مقدماً (Prepaid Expense Allocation)
CREATE TABLE IF NOT EXISTS gl_prepaid_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin_voucher_id UUID NOT NULL REFERENCES journal_vouchers(id),
    prepaid_asset_account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    expense_target_account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    total_amount NUMERIC(14, 2) NOT NULL,
    monthly_installment NUMERIC(14, 2) NOT NULL,
    total_months INT NOT NULL CHECK (total_months > 0),
    remaining_months INT NOT NULL,
    start_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- دالة تقريب الضريبة لأقرب عدد صحيح عند التفعيل
CREATE OR REPLACE FUNCTION calculate_vanguard_tax(
    base_amount NUMERIC,
    tax_rate NUMERIC,
    apply_rounding BOOLEAN
) RETURNS NUMERIC AS $$
DECLARE
    calculated_tax NUMERIC;
BEGIN
    calculated_tax := base_amount * (tax_rate / 100.0);
    IF apply_rounding THEN
        RETURN CEIL(calculated_tax);
    ELSE
        RETURN ROUND(calculated_tax, 2);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. فهارس الأداء وتدقيق السجلات
CREATE INDEX IF NOT EXISTS idx_journal_lines_department ON journal_entry_lines(department_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_voucher ON journal_entry_lines(voucher_id);
CREATE INDEX IF NOT EXISTS idx_prepaid_allocations_status ON gl_prepaid_allocations(status);
CREATE INDEX IF NOT EXISTS idx_prepaid_allocations_dates ON gl_prepaid_allocations(start_date);
