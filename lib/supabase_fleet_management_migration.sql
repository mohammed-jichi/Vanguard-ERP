-- Super Sonic Fleet & Drivers Management Dynamic Tables Migration

-- 1. Fleet Fuel Types
CREATE TABLE IF NOT EXISTS fleet_fuel_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    unit_price NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Fleet Drivers
CREATE TABLE IF NOT EXISTS fleet_drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    license_number TEXT,
    driver_type TEXT CHECK (driver_type IN ('sales', 'supply', 'general')) DEFAULT 'general',
    status TEXT CHECK (status IN ('active', 'on_leave')) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Fleet Vehicles
CREATE TABLE IF NOT EXISTS fleet_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    plate_number TEXT NOT NULL,
    vehicle_model TEXT NOT NULL,
    fuel_type_id UUID REFERENCES fleet_fuel_types(id) ON DELETE SET NULL,
    default_driver_id UUID REFERENCES fleet_drivers(id) ON DELETE SET NULL,
    current_odometer NUMERIC DEFAULT 0,
    status TEXT CHECK (status IN ('active', 'maintenance', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Fleet Fuel Logs
CREATE TABLE IF NOT EXISTS fleet_fuel_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    vehicle_id UUID REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES fleet_drivers(id) ON DELETE SET NULL,
    fuel_type_id UUID REFERENCES fleet_fuel_types(id) ON DELETE SET NULL,
    liters_filled NUMERIC NOT NULL,
    total_cost NUMERIC NOT NULL,
    odometer_at_fill NUMERIC NOT NULL,
    notes TEXT,
    log_date TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Fleet Mileage Logs
CREATE TABLE IF NOT EXISTS fleet_mileage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    vehicle_id UUID REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES fleet_drivers(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    start_km NUMERIC NOT NULL,
    end_km NUMERIC NOT NULL,
    total_km NUMERIC NOT NULL,
    business_km NUMERIC DEFAULT 0,
    personal_km NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Fleet Maintenance Records
CREATE TABLE IF NOT EXISTS fleet_maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    vehicle_id UUID REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
    work_order_no TEXT,
    service_type TEXT NOT NULL,
    part_name TEXT,
    cost NUMERIC DEFAULT 0,
    odometer NUMERIC NOT NULL,
    status TEXT CHECK (status IN ('scheduled', 'completed')) DEFAULT 'completed',
    performed_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for all tables
ALTER TABLE fleet_fuel_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_fuel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_mileage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_maintenance_records ENABLE ROW LEVEL SECURITY;
