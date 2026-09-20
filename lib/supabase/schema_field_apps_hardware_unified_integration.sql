-- ============================================================
-- VANGUARD ERP: FIELD APPS, HARDWARE & WORKFLOW INTEGRATION
-- Organization: Southern Olive Oil Products S.A.R.L
-- ============================================================

-- 1. تعريف القنوات وحالات الطلب وطرق الدفع
DO $$ BEGIN
    CREATE TYPE online_order_channel AS ENUM ('supersonic', 'social_media', 'whatsapp', 'website');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE online_order_status AS ENUM (
        'pending_rep_approval', 'approved', 'escalated_to_management', 
        'queued', 'on_route', 'delivered', 'rejected', 'moved_to_pos_pickup'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_collection_method AS ENUM ('COD', 'WHISH');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. حجز المخزون وتفاصيل التوصيل
ALTER TABLE vanguard_inventory 
ADD COLUMN IF NOT EXISTS qty_reserved NUMERIC(12, 3) DEFAULT 0 CHECK (qty_reserved >= 0),
ADD COLUMN IF NOT EXISTS plu_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS is_scale_item BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS scale_tare_weight_kg NUMERIC(6, 3) DEFAULT 0.000;

ALTER TABLE sales_invoices 
ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(30) DEFAULT 'delivered' 
  CHECK (delivery_status IN ('delivered', 'pending_delivery', 'partially_delivered', 'on_route')),
ADD COLUMN IF NOT EXISTS assigned_driver_id UUID REFERENCES employees(id),
ADD COLUMN IF NOT EXISTS delivery_corridor_id INT,
ADD COLUMN IF NOT EXISTS delivery_tracking_no VARCHAR(100),
ADD COLUMN IF NOT EXISTS proof_signature_svg TEXT;

-- 3. سندات التسليم الفعلي للبضائع (Delivery Notes / POD)
CREATE TABLE IF NOT EXISTS delivery_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_note_number SERIAL,
    tenant_id UUID REFERENCES tenants(id),
    invoice_id UUID NOT NULL REFERENCES sales_invoices(id) ON DELETE RESTRICT,
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_by UUID REFERENCES employees(id),
    recipient_name VARCHAR(255),
    payment_method payment_collection_method DEFAULT 'COD',
    collected_amount_usd NUMERIC(12, 2) DEFAULT 0,
    collected_amount_lbp NUMERIC(14, 2) DEFAULT 0,
    signature_svg TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_note_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_note_id UUID NOT NULL REFERENCES delivery_notes(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES vanguard_inventory(id),
    quantity_delivered NUMERIC(12, 3) NOT NULL CHECK (quantity_delivered > 0)
);

-- 4. جدول طلبات المنصات الموحد (Social CRM & SuperSonic Orders)
CREATE TABLE IF NOT EXISTS online_platform_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    channel online_order_channel NOT NULL DEFAULT 'whatsapp',
    external_chat_id VARCHAR(100),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    destination_town VARCHAR(100) NOT NULL,
    delivery_address TEXT NOT NULL,
    corridor_id INT DEFAULT 1,
    payment_method payment_collection_method DEFAULT 'COD',
    product_amount_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
    product_amount_lbp NUMERIC(14, 2) NOT NULL DEFAULT 0,
    delivery_fee_usd NUMERIC(12, 2) DEFAULT 0,
    rep_name VARCHAR(100),
    rep_code VARCHAR(50),
    sla_minutes_left INT DEFAULT 60,
    order_status online_order_status DEFAULT 'pending_rep_approval',
    sales_invoice_id UUID REFERENCES sales_invoices(id),
    assigned_driver_name VARCHAR(100),
    assigned_vehicle_plate VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS online_platform_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES online_platform_orders(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES vanguard_inventory(id),
    quantity NUMERIC(12, 3) NOT NULL,
    unit_price_usd NUMERIC(12, 2) NOT NULL,
    total_price_usd NUMERIC(12, 2) NOT NULL,
    is_missing BOOLEAN DEFAULT FALSE
);

-- 5. منظومة الهاردوير الشاملة المفتوحة لكافة الماركات (Hardware-Agnostic Engine)
DO $$ BEGIN
    CREATE TYPE hardware_device_category AS ENUM (
        'THERMAL_RECEIPT', 'BARCODE_LABEL_PRINTER', 'A4_OFFICE_PRINTER',
        'ELECTRONIC_SCALE', 'CUSTOMER_POLE_DISPLAY', 'BARCODE_SCANNER', 
        'CASH_DRAWER', 'PAYMENT_TERMINAL_POS'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE hardware_interface_type AS ENUM (
        'NETWORK_TCP', 'SERIAL_COM', 'USB_RAW', 'SYSTEM_SPOOLER', 'BLUETOOTH', 'KEYBOARD_WEDGE'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS system_hardware_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    device_name VARCHAR(100) NOT NULL,
    device_category hardware_device_category NOT NULL,
    interface_type hardware_interface_type NOT NULL,
    ip_address VARCHAR(45),
    port_number INT,
    serial_port VARCHAR(50),
    serial_baud_rate INT DEFAULT 9600,
    system_printer_name VARCHAR(255),
    command_protocol VARCHAR(50) DEFAULT 'STANDARD',
    device_config JSONB DEFAULT '{
        "paper_width_mm": 80,
        "auto_cutter": true,
        "cash_drawer_pulse": true,
        "weight_barcode_prefix": "20",
        "scale_unit": "KG"
    }'::jsonb,
    branch_id UUID REFERENCES branches(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. الفهارس لتسريع الاستعلام والبحث متعدد المستأجرين
CREATE INDEX IF NOT EXISTS idx_platform_orders_tenant ON online_platform_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_platform_orders_status ON online_platform_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_platform_orders_corridor ON online_platform_orders(corridor_id);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_tenant ON delivery_notes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hardware_profiles_tenant ON system_hardware_profiles(tenant_id);

