-- ============================================================
-- VANGUARD ERP: UNIVERSAL SCALE INTEGRATION, CONTROL & NOTIFICATIONS
-- Organization: Southern Olive Oil Products S.A.R.L
-- ============================================================

-- 1. دعم الموازين الإلكترونية المتعددة (Universal Scale Integration: Alfa, Bizerba, Dibal, Digi, CAS, Toledo, etc.)
DO $$ BEGIN
    CREATE TYPE electronic_scale_protocol AS ENUM ('UNIVERSAL_PLU', 'ALFA', 'BIZERBA', 'DIBAL', 'DIGI', 'CAS', 'TOLEDO');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE vanguard_inventory
ADD COLUMN IF NOT EXISTS plu_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS is_scale_item BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS scale_shelf_life_days INT DEFAULT 365,
ADD COLUMN IF NOT EXISTS scale_tare_weight_kg NUMERIC(6, 3) DEFAULT 0.000,
ADD COLUMN IF NOT EXISTS scale_item_description VARCHAR(100);

-- جدول تعريف وضبط الموازين المتصلة بالشبكة (Network Scales Profiles)
CREATE TABLE IF NOT EXISTS electronic_scale_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scale_name VARCHAR(100) NOT NULL,
    scale_model electronic_scale_protocol DEFAULT 'UNIVERSAL_PLU',
    ip_address VARCHAR(45),
    port_number INT DEFAULT 4001,
    weight_barcode_prefix VARCHAR(4) DEFAULT '20', -- بادئة الباركود الموزون (مثل 20 أو 21 أو 22)
    branch_id UUID REFERENCES branches(id),
    is_active BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMP WITH TIME ZONE
);

-- 2. ضبط الفترات الزمنية وإقفال الطاولات بالحجوزات (Table Stay Period & Shifts)
ALTER TABLE reservation_settings
ADD COLUMN IF NOT EXISTS table_stay_period_minutes INT DEFAULT 120,
ADD COLUMN IF NOT EXISTS active_shift_id UUID;

CREATE TABLE IF NOT EXISTS reservation_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_name VARCHAR(50) NOT NULL, -- Lunch, Dinner, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. محرك وقوالب رسائل SMS المباشرة (Transactions, Feedback, Invites)
CREATE TABLE IF NOT EXISTS sms_notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id VARCHAR(50) NOT NULL,
    country_code VARCHAR(10) DEFAULT '+961',
    auto_send_on_invoice_close BOOLEAN DEFAULT FALSE,
    send_feedback_link BOOLEAN DEFAULT FALSE,
    feedback_url_base TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. تقرير الرقابة: البيع بأقل من التكلفة (View: Under Cost Sales Report)
CREATE OR REPLACE VIEW view_under_cost_sales_report AS
SELECT 
    i.item_name,
    line.unit_price_usd AS selling_price,
    i.capacity_kg,
    inv.cost_price AS unit_cost,
    (inv.cost_price - line.unit_price_usd) AS loss_margin,
    inv_parent.created_at AS sale_date
FROM sales_invoice_items line
JOIN vanguard_inventory i ON line.item_id = i.id
LEFT JOIN vanguard_inventory inv ON inv.id = line.item_id
JOIN sales_invoices inv_parent ON line.invoice_id = inv_parent.id
WHERE line.unit_price_usd <= COALESCE(inv.cost_price, 0);
