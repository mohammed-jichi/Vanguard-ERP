-- ============================================================
-- VANGUARD ERP: HR LEAVE REQUESTS & WORKSTATION CONVERGENCE
-- Organization: Southern Olive Oil Products S.A.R.L
-- ============================================================

-- 1. HR LEAVE REQUESTS (Days Off, Sick, Annual, Force Majeure)
CREATE TABLE IF NOT EXISTS public.hr_leave_requests (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  leave_type TEXT NOT NULL DEFAULT 'Full Day',
  hours_off NUMERIC(5,2),
  paid BOOLEAN DEFAULT true,
  notes TEXT,
  approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hr_leave_employee ON public.hr_leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_leave_dates ON public.hr_leave_requests(start_date, end_date);

-- 2. POS WORKSTATION & HARDWARE PROFILES CONVERGENCE
CREATE TABLE IF NOT EXISTS public.workstation_configs (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  branch TEXT NOT NULL,
  authority JSONB NOT NULL DEFAULT '{}'::jsonb,
  drawer_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  printer_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  pos_credentials JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workstation_employee ON public.workstation_configs(employee_id);
CREATE INDEX IF NOT EXISTS idx_workstation_branch ON public.workstation_configs(branch);

-- Enable RLS and permissive policies for authenticated access
ALTER TABLE public.hr_leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workstation_configs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hr_leave_requests' AND policyname = 'Allow all access to hr_leave_requests'
  ) THEN
    CREATE POLICY "Allow all access to hr_leave_requests" ON public.hr_leave_requests FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'workstation_configs' AND policyname = 'Allow all access to workstation_configs'
  ) THEN
    CREATE POLICY "Allow all access to workstation_configs" ON public.workstation_configs FOR ALL USING (true);
  END IF;
END $$;
