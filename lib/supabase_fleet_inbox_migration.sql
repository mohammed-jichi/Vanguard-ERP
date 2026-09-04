-- ============================================================================
-- SUPERSONIC FLEET & INBOX NOTIFICATIONS DATABASE SCHEMA
-- TENANT: Southern Olive Oil Products S.A.R.L (00001)
-- ============================================================================

-- 1. Create SuperSonic Path Cards / Active Route Runs Table
CREATE TABLE IF NOT EXISTS public.fleet_path_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_code VARCHAR(64) UNIQUE NOT NULL,
    corridor_id INT NOT NULL,
    corridor_name TEXT NOT NULL,
    driver_name TEXT NOT NULL,
    driver_phone TEXT,
    vehicle_plate TEXT NOT NULL,
    trip_no INT NOT NULL DEFAULT 1,
    status VARCHAR(32) NOT NULL DEFAULT 'READY_FOR_LOADING',
    en_route_notes TEXT,
    total_packages INT NOT NULL DEFAULT 0,
    total_cod_amount_usd NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id VARCHAR(32) DEFAULT '00001'
);

-- 2. Create Complaints & Reviews Table
CREATE TABLE IF NOT EXISTS public.fleet_complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_code VARCHAR(32) UNIQUE NOT NULL,
    order_no VARCHAR(64) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    courier_name TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT,
    resolution_notes TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    source_entity VARCHAR(64) DEFAULT 'SOUTHERN_OLIVE',
    reported_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Real Operations & Financial Inbox Table
CREATE TABLE IF NOT EXISTS public.inbox_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(32) DEFAULT '00001',
    source_module VARCHAR(64) NOT NULL,
    notification_type VARCHAR(64) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    action_url TEXT,
    amount_usd NUMERIC(12,2) DEFAULT 0.00,
    amount_lbp NUMERIC(14,2) DEFAULT 0.00,
    status VARCHAR(32) NOT NULL DEFAULT 'NEW',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
