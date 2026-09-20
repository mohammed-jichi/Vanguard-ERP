-- ============================================================
-- VANGUARD ERP: SUPERSONIC FLEET & SOCIAL CRM INTEGRATION
-- ============================================================

-- 0. الجداول المسبقة لضمان تكامل المفاتيح الأجنبية (Prerequisites Safe Creation)
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) DEFAULT 'DRIVER',
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vanguard_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name TEXT UNIQUE NOT NULL,
    capacity_kg NUMERIC(10, 2) NOT NULL DEFAULT 15.2,
    packaging_type TEXT NOT NULL DEFAULT 'تطفيح صاج',
    vanguard_stock NUMERIC(12, 3) NOT NULL DEFAULT 0 CHECK (vanguard_stock >= 0),
    qty_reserved NUMERIC(12, 3) DEFAULT 0 CHECK (qty_reserved >= 0),
    min_threshold INTEGER NOT NULL DEFAULT 20,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sales_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_ref TEXT UNIQUE NOT NULL,
    driver_name TEXT,
    item_name TEXT,
    sold_qty NUMERIC(12, 3) DEFAULT 0,
    total_amount_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    is_posted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sales_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES sales_invoices(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES vanguard_inventory(id),
    quantity NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
    unit_price_usd NUMERIC(12, 2) DEFAULT 0.00,
    total_price_usd NUMERIC(12, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS public.stock_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES vanguard_inventory(id),
    transaction_type VARCHAR(50) NOT NULL,
    reference_id UUID,
    qty_in NUMERIC(12, 3) DEFAULT 0,
    qty_out NUMERIC(12, 3) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1. تعريف الأنواع الموحدة (Enums)
DO $$ BEGIN
    CREATE TYPE online_order_channel AS ENUM ('supersonic', 'social_media', 'whatsapp', 'website');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE online_order_status AS ENUM ('pending_rep_approval', 'approved', 'escalated_to_management', 'queued', 'on_route', 'delivered', 'rejected', 'moved_to_pos_pickup');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_collection_method AS ENUM ('COD', 'WHISH');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. تحديث جدول المخزون لإدارة حجز الكميات ( لمنع البيع المزدوج)
ALTER TABLE vanguard_inventory 
ADD COLUMN IF NOT EXISTS qty_reserved NUMERIC(12, 3) DEFAULT 0 CHECK (qty_reserved >= 0);

-- 3. تحديث جدول الفواتير لبيانات التوصيل والتتبع
ALTER TABLE sales_invoices 
ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(30) DEFAULT 'delivered' 
  CHECK (delivery_status IN ('delivered', 'pending_delivery', 'partially_delivered', 'on_route')),
ADD COLUMN IF NOT EXISTS assigned_driver_id UUID REFERENCES employees(id),
ADD COLUMN IF NOT EXISTS delivery_corridor_id INT,
ADD COLUMN IF NOT EXISTS delivery_tracking_no VARCHAR(100),
ADD COLUMN IF NOT EXISTS proof_signature_svg TEXT,
ADD COLUMN IF NOT EXISTS reference_credit_note_id UUID REFERENCES sales_invoices(id),
ADD COLUMN IF NOT EXISTS is_posted BOOLEAN DEFAULT TRUE;

-- 4. جدول سندات التسليم الفعلي للبضائع (Delivery Notes / POD)
CREATE TABLE IF NOT EXISTS delivery_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_note_number SERIAL,
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

-- 5. بنود سند التسليم
CREATE TABLE IF NOT EXISTS delivery_note_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_note_id UUID NOT NULL REFERENCES delivery_notes(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES vanguard_inventory(id),
    quantity_delivered NUMERIC(12, 3) NOT NULL CHECK (quantity_delivered > 0)
);

-- 6. جدول طلبات المنصات الموحد (Platform Orders: Social CRM + SuperSonic)
CREATE TABLE IF NOT EXISTS online_platform_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    channel online_order_channel NOT NULL DEFAULT 'whatsapp',
    external_chat_id VARCHAR(100),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    destination_town VARCHAR(100) NOT NULL,
    delivery_address TEXT NOT NULL,
    corridor_id INT DEFAULT 1, -- من 1 إلى 7 حسب خطوط السير
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

-- 7. بنود الطلب الإلكتروني
CREATE TABLE IF NOT EXISTS online_platform_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES online_platform_orders(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES vanguard_inventory(id),
    quantity NUMERIC(12, 3) NOT NULL,
    unit_price_usd NUMERIC(12, 2) NOT NULL,
    total_price_usd NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    is_missing BOOLEAN DEFAULT FALSE
);

-- 8. التريجر الذكي: حجز البضاعة عند الفواتير المجدولة للتوصيل
CREATE OR REPLACE FUNCTION process_vanguard_invoice_stock()
RETURNS TRIGGER AS $$
DECLARE
    line RECORD;
    is_future_delivery BOOLEAN;
BEGIN
    is_future_delivery := (NEW.delivery_date IS NOT NULL AND NEW.delivery_date > NEW.created_at);

    IF (TG_OP = 'INSERT' AND NEW.is_posted = TRUE) THEN
        FOR line IN SELECT * FROM sales_invoice_items WHERE invoice_id = NEW.id LOOP
            IF is_future_delivery THEN
                UPDATE vanguard_inventory
                SET qty_reserved = qty_reserved + line.quantity
                WHERE id = line.item_id;
                
                NEW.delivery_status := 'pending_delivery';
            ELSE
                UPDATE vanguard_inventory
                SET vanguard_stock = vanguard_stock - line.quantity
                WHERE id = line.item_id;

                INSERT INTO stock_ledger (item_id, transaction_type, reference_id, qty_out, created_at)
                VALUES (line.item_id, 'SALES_DIRECT', NEW.id, line.quantity, NOW());
                
                NEW.delivery_status := 'delivered';
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ربط التريجر بجدول sales_invoices
DROP TRIGGER IF EXISTS trg_process_vanguard_invoice_stock ON sales_invoices;
CREATE TRIGGER trg_process_vanguard_invoice_stock
BEFORE INSERT ON sales_invoices
FOR EACH ROW
EXECUTE FUNCTION process_vanguard_invoice_stock();

-- 9. الفهارس لتسريع الاستعلامات وعمليات التتبع
CREATE INDEX IF NOT EXISTS idx_online_orders_status ON online_platform_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_online_orders_corridor ON online_platform_orders(corridor_id);
CREATE INDEX IF NOT EXISTS idx_online_orders_rep ON online_platform_orders(rep_code);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_invoice ON delivery_notes(invoice_id);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_date ON delivery_notes(delivered_at);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_tracking ON sales_invoices(delivery_tracking_no);
