-- ============================================================================
-- Vanguard ERP - Module 11 (Olive Mill) & Module 1 (POS & Coupons) Schema
-- ============================================================================

-- 1. WEIGHBRIDGE TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.weighbridge_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  ticket_number TEXT UNIQUE NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  season_id TEXT,
  line_id TEXT,
  farmer_id TEXT,
  farmer_name TEXT NOT NULL,
  farmer_phone TEXT,
  vehicle_plate TEXT,
  variety TEXT NOT NULL DEFAULT 'Souri',
  gross_weight NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tare_weight NUMERIC(12, 2) NOT NULL DEFAULT 0,
  net_weight NUMERIC(12, 2) NOT NULL DEFAULT 0,
  acidity_pct NUMERIC(5, 2) DEFAULT 0.60,
  target_tank_id TEXT DEFAULT 'TK-01',
  settlement_method TEXT NOT NULL DEFAULT 'In_Kind',
  cash_fee_rate_per_kg NUMERIC(6, 4) DEFAULT 0.08,
  in_kind_retention_pct NUMERIC(5, 2) DEFAULT 10.0,
  estimated_yield_pct NUMERIC(5, 2) DEFAULT 20.0,
  estimated_oil_kg NUMERIC(10, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Weighed',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PRESSING LINE QUEUE TABLE
CREATE TABLE IF NOT EXISTS public.pressing_line_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  ticket_number TEXT NOT NULL,
  line_id TEXT NOT NULL,
  line_name TEXT,
  farmer_name TEXT NOT NULL,
  variety TEXT NOT NULL,
  net_weight NUMERIC(12, 2) NOT NULL,
  target_tank_id TEXT DEFAULT 'TK-01',
  status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'In_Process', 'Completed', 'Cancelled'
  priority INTEGER DEFAULT 1,
  queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 3. MILL TANKS FARM TABLE
CREATE TABLE IF NOT EXISTS public.mill_tanks (
  id TEXT PRIMARY KEY,
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  title TEXT NOT NULL,
  capacity_liters NUMERIC(12, 2) NOT NULL DEFAULT 10000,
  current_level_liters NUMERIC(12, 2) NOT NULL DEFAULT 0,
  grade TEXT NOT NULL DEFAULT 'Settling_Raw', -- 'Extra_Virgin', 'Virgin', 'Settling_Raw', 'Sanitized_Empty'
  acidity_pct NUMERIC(5, 2) DEFAULT 0.0,
  internal_temp_c NUMERIC(5, 2) DEFAULT 18.0,
  nitrogen_blanketed BOOLEAN DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'Active',
  allocated_farmer_or_batch TEXT,
  last_cleaned_date TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. OIL DISPATCH PASSES (GATE PASSES)
CREATE TABLE IF NOT EXISTS public.oil_dispatch_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  pass_number TEXT UNIQUE NOT NULL,
  date TEXT NOT NULL,
  farmer_name TEXT NOT NULL,
  ticket_number TEXT,
  tins_released NUMERIC(10, 1) NOT NULL DEFAULT 0,
  liters_released NUMERIC(12, 2) NOT NULL DEFAULT 0,
  receiver_name TEXT,
  vehicle_plate TEXT,
  authorized_by TEXT NOT NULL DEFAULT 'Foreman',
  status TEXT NOT NULL DEFAULT 'Approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. COUPONS & VOUCHERS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  code TEXT UNIQUE NOT NULL,
  voucher_type INTEGER NOT NULL DEFAULT 0, -- 0 = Coupon, 1 = Gift Certificate
  value NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT '$',
  expiry_date TEXT,
  consumed INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  anyone_can_use INTEGER NOT NULL DEFAULT 1,
  customer_id INTEGER,
  employee_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
