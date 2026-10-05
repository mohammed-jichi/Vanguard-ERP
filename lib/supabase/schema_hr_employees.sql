-- ============================================================
-- VANGUARD ERP: HR PERSONNEL MASTER RECORD CONVERGENCE
-- Organization: Southern Olive Oil Products S.A.R.L
-- Table: public.employees
-- ============================================================

-- 1. Base table creation if not exists
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_code TEXT UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Safely add HR Master Record extensions if not present
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS employee_code TEXT,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT '+961',
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Male',
  ADD COLUMN IF NOT EXISTS marital_status TEXT DEFAULT 'Single',
  ADD COLUMN IF NOT EXISTS children_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS designation TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Lebanon',
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS national_id TEXT,
  ADD COLUMN IF NOT EXISTS social_security_no TEXT,
  ADD COLUMN IF NOT EXISTS date_hired DATE,
  ADD COLUMN IF NOT EXISTS date_left DATE,
  ADD COLUMN IF NOT EXISTS attendance_mac_id TEXT,
  ADD COLUMN IF NOT EXISTS pos_employee_id TEXT,
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS branch TEXT,
  ADD COLUMN IF NOT EXISTS is_backoffice BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS pos_credentials JSONB,
  ADD COLUMN IF NOT EXISTS schedule_config JSONB,
  ADD COLUMN IF NOT EXISTS social_media_rep JSONB,
  ADD COLUMN IF NOT EXISTS profile_picture TEXT,
  ADD COLUMN IF NOT EXISTS job_offer_doc TEXT,
  ADD COLUMN IF NOT EXISTS record_payload JSONB,
  ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_employees_employee_code ON public.employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_pos_id ON public.employees(pos_employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON public.employees(is_active);

-- 3. Enable Row Level Security and standard permissive policy
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'employees' AND policyname = 'Allow all access to employees'
  ) THEN
    CREATE POLICY "Allow all access to employees" ON public.employees FOR ALL USING (true);
  END IF;
END $$;

GRANT ALL ON public.employees TO anon, authenticated, service_role;
