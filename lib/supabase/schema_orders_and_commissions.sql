-- ============================================================================
-- VANGUARD ERP - PART 2: OMNICHANNEL ORDERS, REP COMMISSIONS & POS QUEUE
-- CLIENT: Southern Olive Oil Products S.A.R.L (Tenant ID: 00001)
-- ============================================================================

-- 1. SALES REPRESENTATIVES & COMMISSION ACCOUNTS
CREATE TABLE IF NOT EXISTS sales_representatives (
    rep_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(10) NOT NULL DEFAULT '00001' REFERENCES tenants(tenant_id),
    rep_code VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(100),
    assigned_channel VARCHAR(30) DEFAULT 'WhatsApp' CHECK (assigned_channel IN ('WhatsApp', 'TikTok', 'Instagram', 'Web Store', 'Phone', 'Showroom', 'Field Sales')),
    default_commission_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.0500, -- e.g. 0.05 = 5%
    total_commission_earned_lbp NUMERIC(15, 2) DEFAULT 0.0,
    total_commission_earned_usd NUMERIC(15, 2) DEFAULT 0.0,
    current_unpaid_balance_usd NUMERIC(15, 2) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO sales_representatives (rep_code, full_name, phone, assigned_channel, default_commission_rate) VALUES
('REP-001', 'Mahdi Kassem', '03112233', 'Field Sales', 0.0400),
('REP-002', 'Ahmad Ali Kassem', '03445566', 'WhatsApp', 0.0500),
('REP-004', 'Hiba Aloulou', '03778899', 'Instagram', 0.0500),
('REP-008', 'Hussein Mahdi', '03990011', 'TikTok', 0.0700)
ON CONFLICT (rep_code) DO NOTHING;

-- 2. CUSTOMERS MASTER DIRECTORY & KYC
CREATE TABLE IF NOT EXISTS customers (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(10) NOT NULL DEFAULT '00001' REFERENCES tenants(tenant_id),
    customer_code VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    company_name VARCHAR(150),
    phone VARCHAR(30) NOT NULL,
    mobile_alt VARCHAR(30),
    email VARCHAR(100),
    gov_id INT REFERENCES lebanon_governorates(gov_id),
    district_id INT REFERENCES lebanon_districts(district_id),
    village_id INT REFERENCES lebanon_villages(village_id),
    address_line TEXT NOT NULL,
    gps_latitude NUMERIC(10, 7),
    gps_longitude NUMERIC(10, 7),
    vat_number VARCHAR(50),
    has_vat BOOLEAN DEFAULT FALSE,
    assigned_rep_id UUID REFERENCES sales_representatives(rep_id),
    credit_limit_usd NUMERIC(15, 2) DEFAULT 0.0,
    current_balance_usd NUMERIC(15, 2) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(customer_code);

-- 3. PRODUCT CATALOG & PRICING
CREATE TABLE IF NOT EXISTS product_catalog (
    product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(10) NOT NULL DEFAULT '00001' REFERENCES tenants(tenant_id),
    item_code VARCHAR(30) NOT NULL UNIQUE,
    barcode VARCHAR(50),
    name_ar VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Olive Oil', 'Molasses', 'Pickles', 'Jam', 'Vinegar', 'Dairy'
    packaging_unit VARCHAR(50) NOT NULL, -- '17.5L Tin', '1000ml Glass', '650g Box', '500ml Bottle'
    retail_price_lbp NUMERIC(15, 2) NOT NULL,
    retail_price_usd NUMERIC(15, 2) NOT NULL,
    wholesale_price_usd NUMERIC(15, 2) NOT NULL,
    is_tax_exempt BOOLEAN DEFAULT TRUE, -- Agricultural olive products are zero tax in Lebanon
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO product_catalog (item_code, name_ar, name_en, category, packaging_unit, retail_price_lbp, retail_price_usd, wholesale_price_usd) VALUES
('OIL-175-EV', 'زيت زيتون بكر ممتاز بلدي 17.5 لتر', 'Extra Virgin Olive Oil Tin 17.5L', 'Olive Oil', '17.5L Tin', 9000000.0, 100.0, 92.0),
('OIL-100-GL', 'ألفية زيت زيتون خضير بلدي 1000 مل', 'Cold Press Olive Oil Glass 1L', 'Olive Oil', '1000ml Glass', 990000.0, 11.0, 9.5),
('MOL-500-RO', 'دبس رمان بلدي نقي 500 مل', 'Pure Pomegranate Molasses 500ml', 'Molasses', '500ml Bottle', 450000.0, 5.0, 4.2),
('OLI-650-GR', 'صندوق زيتون أخضر بلدي محشي 650غ*12', 'Pickled Green Stuffed Olives Box', 'Pickles', '650g Box*12', 1620000.0, 18.0, 15.5)
ON CONFLICT (item_code) DO NOTHING;

-- 4. OMNICHANNEL ORDERS (DISPATCH VS SHOWROOM PICKUP)
CREATE TABLE IF NOT EXISTS omnichannel_orders (
    order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(10) NOT NULL DEFAULT '00001' REFERENCES tenants(tenant_id),
    order_no VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES customers(customer_id),
    rep_id UUID REFERENCES sales_representatives(rep_id),
    platform VARCHAR(30) NOT NULL CHECK (platform IN ('Web Store', 'WhatsApp', 'TikTok Shop', 'Instagram', 'Phone')),
    fulfillment_type VARCHAR(30) NOT NULL CHECK (fulfillment_type IN ('IN_STORE_PICKUP', 'DELIVERY')),
    assigned_branch_id VARCHAR(10) NOT NULL REFERENCES branches(branch_id),
    corridor_id INT REFERENCES delivery_corridors(corridor_id),
    subtotal_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    discount_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    tax_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    delivery_fee_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    total_amount_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    total_amount_usd NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    order_approval_status VARCHAR(30) DEFAULT 'APPROVED_POSTED' CHECK (order_approval_status IN ('PENDING_APPROVAL', 'APPROVED_POSTED', 'REJECTED')),
    pos_routing_status VARCHAR(30) DEFAULT 'NOT_APPLICABLE' CHECK (pos_routing_status IN ('NOT_APPLICABLE', 'PENDING_PICKUP_AT_POS', 'RECEIVED_IN_POS_BILLED')),
    fleet_routing_status VARCHAR(30) DEFAULT 'NOT_APPLICABLE' CHECK (fleet_routing_status IN ('NOT_APPLICABLE', 'QUEUED_FOR_FLEET', 'ON_VAN', 'DELIVERED', 'REJECTED_AT_DOOR', 'PENDING_RESCHEDULE')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ORDER LINE ITEMS
CREATE TABLE IF NOT EXISTS order_line_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES omnichannel_orders(order_id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product_catalog(product_id),
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.0,
    unit_price_lbp NUMERIC(15, 2) NOT NULL,
    discount_lbp NUMERIC(15, 2) DEFAULT 0.0,
    total_price_lbp NUMERIC(15, 2) NOT NULL,
    total_price_usd NUMERIC(15, 2) NOT NULL
);

-- 6. SALES REPRESENTATIVE COMMISSION LEDGER
CREATE TABLE IF NOT EXISTS rep_commission_ledger (
    ledger_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(10) NOT NULL DEFAULT '00001' REFERENCES tenants(tenant_id),
    rep_id UUID NOT NULL REFERENCES sales_representatives(rep_id),
    order_id UUID NOT NULL REFERENCES omnichannel_orders(order_id),
    trigger_event VARCHAR(50) NOT NULL CHECK (trigger_event IN ('IN_STORE_PICKUP_BILLED', 'FLEET_DELIVERY_COLLECTED')),
    order_total_usd NUMERIC(15, 2) NOT NULL,
    commission_rate NUMERIC(5, 4) NOT NULL,
    commission_amount_lbp NUMERIC(15, 2) NOT NULL,
    commission_amount_usd NUMERIC(15, 2) NOT NULL,
    is_credited BOOLEAN DEFAULT TRUE,
    payout_status VARCHAR(30) DEFAULT 'UNPAID' CHECK (payout_status IN ('UNPAID', 'PAID_IN_PAYROLL')),
    credited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. SHOWROOM POS PICKUP QUEUE
CREATE TABLE IF NOT EXISTS pos_pickup_queue (
    queue_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL UNIQUE REFERENCES omnichannel_orders(order_id),
    branch_id VARCHAR(10) NOT NULL REFERENCES branches(branch_id),
    ready_for_pickup_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    picked_up_at TIMESTAMP WITH TIME ZONE,
    cashier_server_name VARCHAR(100),
    pos_invoice_number VARCHAR(50),
    payment_method VARCHAR(30) CHECK (payment_method IN ('CASH', 'CASH_USD', 'CREDIT_CARD', 'SPLIT')),
    amount_collected_lbp NUMERIC(15, 2) DEFAULT 0.0,
    amount_collected_usd NUMERIC(15, 2) DEFAULT 0.0,
    is_closed BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_omnichannel_orders_no ON omnichannel_orders(order_no);
CREATE INDEX IF NOT EXISTS idx_rep_commission_rep ON rep_commission_ledger(rep_id);
