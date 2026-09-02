-- ============================================================================
-- VANGUARD ERP - PART 1: LEBANESE GEOGRAPHIC DATA & SUPERSONIC FLEET ENGINE
-- CLIENT: Southern Olive Oil Products S.A.R.L (Tenant ID: 00001)
-- ============================================================================

-- 1. EXTENSIONS & MULTI-TENANT BASE
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tenants (
    tenant_id VARCHAR(10) PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL DEFAULT 'Southern Olive Oil Products S.A.R.L',
    commercial_registry VARCHAR(50),
    vat_number VARCHAR(50),
    headquarters VARCHAR(150) DEFAULT 'Choueifat Industrial Zone, Mount Lebanon',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO tenants (tenant_id, company_name, headquarters)
VALUES ('00001', 'Southern Olive Oil Products S.A.R.L', 'Choueifat Industrial Zone, Mount Lebanon')
ON CONFLICT (tenant_id) DO NOTHING;

-- 2. OPERATIONAL BRANCHES REGISTRY
CREATE TABLE IF NOT EXISTS branches (
    branch_id VARCHAR(10) PRIMARY KEY,
    tenant_id VARCHAR(10) NOT NULL REFERENCES tenants(tenant_id),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO branches (branch_id, tenant_id, code, name, region) VALUES
('BR_001', '00001', 'BR_001', '001 - Choueifat Main Facility', 'Mount Lebanon'),
('BR_002', '00001', 'BR_002', '002 - Beirut Distribution Hub', 'Beirut'),
('BR_003', '00001', 'BR_003', '003 - Saida Southern Center', 'South Lebanon'),
('BR_004', '00001', 'BR_004', '004 - Zahle Bekaa Branch', 'Bekaa')
ON CONFLICT (code) DO NOTHING;

-- 3. THE 7 STRATEGIC CHOUEIFAT DELIVERY CORRIDORS
CREATE TABLE IF NOT EXISTS delivery_corridors (
    corridor_id SERIAL PRIMARY KEY,
    corridor_number INT NOT NULL UNIQUE,
    title_ar VARCHAR(150) NOT NULL,
    title_en VARCHAR(150) NOT NULL,
    frequency_schedule VARCHAR(100) NOT NULL,
    origin_point VARCHAR(100) DEFAULT 'Choueifat Main Facility',
    highway_route TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO delivery_corridors (corridor_number, title_ar, title_en, frequency_schedule, highway_route) VALUES
(1, 'بيروت الكبرى والساحل المتصل', 'Greater Beirut & Connected Coast', 'Daily (يومي)', 'الشويفات -> خلدة -> بعبدا/الحدث/الضاحية -> بيروت -> ساحل المتن'),
(2, 'جبل لبنان الأوسط والجنوبي', 'Central & Southern Mount Lebanon', 'Daily / Near-Daily (يومي أو شبه يومي)', 'الشويفات -> عرمون/بشامون/قبرشمون -> عاليه/بحمدون/صوفر -> الشوف الأعلى'),
(3, 'خط الساحل الجنوبي والعمق', 'Southern Coast & Deep South', 'Daily (يومي)', 'الدامور/الجية -> صيدا -> صور -> النبطية'),
(4, 'الساحل الشمالي وصولاً للبترون', 'Northern Coast to Batroun', '3-4 times/week (3-4 مرات أسبوعياً)', 'أنطلياس/الضبية -> جونية/كسروان -> جبيل -> البترون -> الكورة'),
(5, 'طرابلس، عكار والضنية', 'Tripoli, Akkar & Dinnieh', '2-3 times/week (2-3 مرات أسبوعياً)', 'طرابلس -> المنية -> زغرتا -> الضنية -> عكار: حلبا، العبدة، القبيات، خريبة الجندي'),
(6, 'البقاع الأوسط والغربي والجنوب الشرقي', 'Central, West Bekaa & South-East', '2-3 times/week (2-3 مرات أسبوعياً)', 'طريق الشام -> ضهر البيدر -> شتورا/زحلة -> البقاع الغربي -> راشيا -> حاصبيا -> جزين'),
(7, 'البقاع الشمالي - بعلبك الهرمل', 'North Bekaa - Baalbek Hermel', '1-2 times/week (1-2 مرات أسبوعياً)', 'رياق -> بعلبك -> دير الأحمر -> اللبوة -> الهرمل')
ON CONFLICT (corridor_number) DO NOTHING;

-- 4. LEBANON GEOGRAPHIC HIERARCHY (GOVERNORATES, DISTRICTS, TOWNS)
CREATE TABLE IF NOT EXISTS lebanon_governorates (
    gov_id SERIAL PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL UNIQUE,
    name_en VARCHAR(100) NOT NULL,
    name_fr VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS lebanon_districts (
    district_id SERIAL PRIMARY KEY,
    gov_id INT NOT NULL REFERENCES lebanon_governorates(gov_id) ON DELETE CASCADE,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    default_corridor_id INT REFERENCES delivery_corridors(corridor_id),
    CONSTRAINT uk_gov_district UNIQUE (gov_id, name_ar)
);

CREATE TABLE IF NOT EXISTS lebanon_villages (
    village_id SERIAL PRIMARY KEY,
    district_id INT NOT NULL REFERENCES lebanon_districts(district_id) ON DELETE CASCADE,
    name_ar VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    corridor_id INT REFERENCES delivery_corridors(corridor_id),
    postal_code VARCHAR(20)
);

CREATE INDEX IF NOT EXISTS idx_villages_name_ar ON lebanon_villages(name_ar);
CREATE INDEX IF NOT EXISTS idx_villages_district ON lebanon_villages(district_id);

-- 5. SUPERSONIC FLEET VEHICLES & DRIVERS
CREATE TABLE IF NOT EXISTS fleet_vehicles (
    vehicle_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(10) NOT NULL DEFAULT '00001' REFERENCES tenants(tenant_id),
    plate_number VARCHAR(30) NOT NULL UNIQUE,
    vehicle_type VARCHAR(30) NOT NULL CHECK (vehicle_type IN ('VAN', 'CAR', 'MOTORCYCLE')),
    brand_model VARCHAR(100) NOT NULL,
    max_payload_kg NUMERIC(10, 2) NOT NULL,
    oil_tins_capacity INT DEFAULT 40,
    fuel_level_percent INT DEFAULT 100,
    odometer_km NUMERIC(10, 1) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fleet_drivers (
    driver_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(10) NOT NULL DEFAULT '00001' REFERENCES tenants(tenant_id),
    driver_code VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    license_number VARCHAR(50),
    assigned_vehicle_id UUID REFERENCES fleet_vehicles(vehicle_id),
    shift_status VARCHAR(30) DEFAULT 'OFF_DUTY' CHECK (shift_status IN ('OFF_DUTY', 'ON_DUTY', 'LOADING', 'DEPARTED', 'RETURNING')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DISPATCH RUNS, STOPS, PROOF OF DELIVERY & COD SETTLEMENTS
CREATE TABLE IF NOT EXISTS fleet_dispatch_runs (
    run_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(10) NOT NULL DEFAULT '00001' REFERENCES tenants(tenant_id),
    run_number VARCHAR(50) NOT NULL UNIQUE,
    corridor_id INT NOT NULL REFERENCES delivery_corridors(corridor_id),
    driver_id UUID NOT NULL REFERENCES fleet_drivers(driver_id),
    vehicle_id UUID NOT NULL REFERENCES fleet_vehicles(vehicle_id),
    run_date DATE NOT NULL DEFAULT CURRENT_DATE,
    departure_time TIMESTAMP WITH TIME ZONE,
    return_time TIMESTAMP WITH TIME ZONE,
    run_status VARCHAR(30) DEFAULT 'QUEUED' CHECK (run_status IN ('QUEUED', 'LOADING', 'ON_ROUTE', 'COMPLETED', 'RECONCILED')),
    total_stops INT DEFAULT 0,
    completed_stops INT DEFAULT 0,
    total_cod_expected_lbp NUMERIC(15, 2) DEFAULT 0.0,
    total_cod_expected_usd NUMERIC(15, 2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fleet_delivery_stops (
    stop_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID NOT NULL REFERENCES fleet_dispatch_runs(run_id) ON DELETE CASCADE,
    stop_sequence INT NOT NULL,
    order_no VARCHAR(50) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    village_id INT REFERENCES lebanon_villages(village_id),
    delivery_address TEXT NOT NULL,
    gps_latitude NUMERIC(10, 7),
    gps_longitude NUMERIC(10, 7),
    order_amount_lbp NUMERIC(15, 2) DEFAULT 0.0,
    order_amount_usd NUMERIC(15, 2) DEFAULT 0.0,
    delivery_fee_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    delivery_fee_usd NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    stop_status VARCHAR(30) DEFAULT 'QUEUED' CHECK (stop_status IN ('QUEUED', 'EN_ROUTE', 'DELIVERED', 'REJECTED', 'PENDING')),
    reason_notes TEXT,
    delivery_fee_collected BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fleet_proof_of_delivery (
    pod_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stop_id UUID NOT NULL UNIQUE REFERENCES fleet_delivery_stops(stop_id) ON DELETE CASCADE,
    signed_by_name VARCHAR(100) NOT NULL,
    digital_signature_data TEXT,
    photo_proof_1_url TEXT,
    photo_proof_2_url TEXT,
    gps_delivered_latitude NUMERIC(10, 7) NOT NULL,
    gps_delivered_longitude NUMERIC(10, 7) NOT NULL,
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fleet_cod_settlements (
    settlement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID NOT NULL REFERENCES fleet_dispatch_runs(run_id),
    driver_id UUID NOT NULL REFERENCES fleet_drivers(driver_id),
    settlement_date DATE DEFAULT CURRENT_DATE,
    collected_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    collected_usd NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    treasury_handover_status VARCHAR(30) DEFAULT 'PENDING' CHECK (treasury_handover_status IN ('PENDING', 'DEPOSITED_VERIFIED')),
    received_by_treasury_officer VARCHAR(100),
    handover_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_dispatch_runs_date ON fleet_dispatch_runs(run_date);
CREATE INDEX IF NOT EXISTS idx_delivery_stops_status ON fleet_delivery_stops(stop_status);
