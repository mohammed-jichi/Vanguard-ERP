-- ============================================================
-- VANGUARD ERP: HR PERSONNEL MASTER RECORD CONVERGENCE
-- Organization: Southern Olive Oil Products S.A.R.L
-- Table: public.hr_employees
-- ============================================================

CREATE TABLE IF NOT EXISTS public.hr_employees (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  country_code TEXT DEFAULT '+961',
  date_of_birth DATE,
  gender TEXT DEFAULT 'Male',
  marital_status TEXT DEFAULT 'Single',
  children_count INTEGER DEFAULT 0,
  department TEXT,
  designation TEXT,
  location TEXT,
  country TEXT DEFAULT 'Lebanon',
  city TEXT,
  address TEXT,
  national_id TEXT,
  social_security_no TEXT,
  date_hired DATE,
  date_left DATE,
  attendance_mac_id TEXT,
  pos_employee_id TEXT,
  brand TEXT,
  branch TEXT,
  is_backoffice BOOLEAN DEFAULT true,
  pos_credentials JSONB,
  schedule_config JSONB,
  social_media_rep JSONB,
  record_payload JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hr_employees_pos_id ON public.hr_employees(pos_employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_employees_department ON public.hr_employees(department);
CREATE INDEX IF NOT EXISTS idx_hr_employees_active ON public.hr_employees(active);

-- Enable Row Level Security and standard permissive policy
ALTER TABLE public.hr_employees ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hr_employees' AND policyname = 'Allow all access to hr_employees'
  ) THEN
    CREATE POLICY "Allow all access to hr_employees" ON public.hr_employees FOR ALL USING (true);
  END IF;
END $$;
