-- Vanguard ERP: HR attendance logs and payroll runs (matches the live Supabase tables).
-- The tables already exist in production with this structure; this file is for fresh environments. Safe to re-run.

create table if not exists public.hr_attendance_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  employee_id uuid,
  employee_name text,
  brand text,
  branch text,
  work_date date not null,
  punch_in timestamptz,
  punch_out timestamptz,
  duration_minutes integer default 0,
  expected_minutes integer default 0,
  overtime_minutes integer default 0,
  source text,
  created_at timestamptz not null default now()
);
create index if not exists hr_attendance_logs_tenant_emp_idx on public.hr_attendance_logs (tenant_id, employee_id, punch_in);
alter table public.hr_attendance_logs enable row level security;

create table if not exists public.hr_payroll_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  year integer not null,
  month integer not null,
  brand text,
  branch text,
  processing_label text not null,
  currency text default 'USD',
  exchange_rate numeric,
  total_salary numeric default 0,
  total_gross numeric default 0,
  total_deductions numeric default 0,
  total_net numeric default 0,
  employer_burden numeric default 0,
  status text default 'Draft',
  items jsonb default '[]'::jsonb,
  line_items jsonb default '[]'::jsonb,
  saved_at timestamptz default now(),
  posted_at timestamptz
);
create index if not exists hr_payroll_runs_tenant_period_idx on public.hr_payroll_runs (tenant_id, year, month);
alter table public.hr_payroll_runs enable row level security;
-- RLS is on with no anon policies: the Vanguard server routes use the service role, which bypasses RLS.
