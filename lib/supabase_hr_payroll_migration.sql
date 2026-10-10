-- Dynamic Human Resources & Payroll Tables Migration

-- 1. HR Departments
CREATE TABLE IF NOT EXISTS hr_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HR Designations
CREATE TABLE IF NOT EXISTS hr_designations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    department_id UUID REFERENCES hr_departments(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. HR Employees
CREATE TABLE IF NOT EXISTS hr_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    employee_code TEXT,
    full_name TEXT NOT NULL,
    national_id TEXT,
    phone TEXT,
    email TEXT,
    department_id UUID REFERENCES hr_departments(id) ON DELETE SET NULL,
    designation_id UUID REFERENCES hr_designations(id) ON DELETE SET NULL,
    join_date DATE,
    basic_salary NUMERIC DEFAULT 0,
    payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer')) DEFAULT 'cash',
    bank_account_details TEXT,
    status TEXT CHECK (status IN ('active', 'on_leave', 'terminated')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HR Shifts
CREATE TABLE IF NOT EXISTS hr_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    shift_name TEXT NOT NULL,
    start_time TIME,
    end_time TIME,
    standard_hours NUMERIC DEFAULT 8,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. HR Attendance Records
CREATE TABLE IF NOT EXISTS hr_attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    employee_id UUID REFERENCES hr_employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    status TEXT CHECK (status IN ('present', 'absent', 'late', 'leave')) DEFAULT 'present',
    overtime_hours NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. HR Salary Adjustments (Advances, Deductions, Bonuses)
CREATE TABLE IF NOT EXISTS hr_salary_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    employee_id UUID REFERENCES hr_employees(id) ON DELETE CASCADE,
    adjustment_type TEXT CHECK (adjustment_type IN ('advance', 'bonus', 'deduction', 'penalty')),
    amount NUMERIC NOT NULL,
    reason TEXT,
    effective_date DATE,
    is_settled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. HR Payroll Runs
CREATE TABLE IF NOT EXISTS hr_payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    payroll_month TEXT NOT NULL, -- e.g., '2026-10'
    total_net_payout NUMERIC DEFAULT 0,
    status TEXT CHECK (status IN ('draft', 'processed', 'paid')) DEFAULT 'draft',
    processed_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. HR Payroll Items
CREATE TABLE IF NOT EXISTS hr_payroll_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id UUID REFERENCES hr_payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES hr_employees(id) ON DELETE CASCADE,
    basic_salary NUMERIC DEFAULT 0,
    total_allowances NUMERIC DEFAULT 0,
    total_deductions NUMERIC DEFAULT 0,
    advances_deducted NUMERIC DEFAULT 0,
    net_salary NUMERIC DEFAULT 0,
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for all tables
ALTER TABLE hr_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_salary_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_payroll_items ENABLE ROW LEVEL SECURITY;
