-- Vanguard ERP: HR attendance logs and payroll runs.
-- Optional: until these tables exist, the HR screens keep the same data in tenants.feature_flags.
-- Run once in the Supabase SQL editor. Safe to re-run.

create table if not exists public.hr_attendance_logs (
  id text primary key,
  tenant_id uuid not null,
  employee_id text not null,
  employee_name text,
  brand text,
  branch text,
  punch_in timestamptz not null,
  punch_out timestamptz,
  duration_hours numeric not null default 0,
  source text,
  created_at timestamptz not null default now()
);
create index if not exists hr_attendance_logs_tenant_emp_idx on public.hr_attendance_logs (tenant_id, employee_id, punch_in);
alter table public.hr_attendance_logs enable row level security;

create table if not exists public.hr_payroll_runs (
  id text primary key,
  tenant_id uuid not null,
  year int not null,
  month int not null,
  brand text,
  branch text,
  label text,
  total_salary numeric not null default 0,
  currency text default 'USD',
  status text not null default 'Draft',
  lines jsonb not null default '[]'::jsonb,
  saved_at timestamptz not null default now()
);
create index if not exists hr_payroll_runs_tenant_period_idx on public.hr_payroll_runs (tenant_id, year, month);
alter table public.hr_payroll_runs enable row level security;
-- RLS is on with no anon policies: the Vanguard server routes use the service role, which bypasses RLS.
