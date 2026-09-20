-- ============================================================
-- VANGUARD ERP: HARDWARE-AGNOSTIC ENGINE SAFE COMPATIBILITY PATCH
-- Ready to run directly in Supabase SQL Editor (100% Idempotent)
-- ============================================================

-- ============================================================
-- 1. ENUMS (Safe Creation)
-- ============================================================
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

-- ============================================================
-- 2. UNIVERSAL HARDWARE ENGINE (Open to all brands & types)
-- ============================================================
-- جدول موحد مرن يتعامل مع أي طابعة (حرارية/ليبل/عادية) أو ميزان أو ملحقات بدون التقيد بماركة
CREATE TABLE IF NOT EXISTS system_hardware_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_name VARCHAR(100) NOT NULL,
    device_category hardware_device_category NOT NULL,
    interface_type hardware_interface_type NOT NULL,
    
    -- الاتصال المفتوح (شبكة أو سيريال أو ويندوز)
    ip_address VARCHAR(45),
    port_number INT,
    serial_port VARCHAR(50),             -- COM1, COM3, إلخ
    serial_baud_rate INT DEFAULT 9600,
    system_printer_name VARCHAR(255),    -- اسم الجهاز إذا كان معرف مسبقاً على النظام/الويندوز
    command_protocol VARCHAR(50) DEFAULT 'STANDARD', -- ESC/POS, TSPL, ZPL, CAS/TOLEDO, etc.
    
    -- بارامترات ديناميكية بملف JSON لا تتطلب تغيير تركيبة الجدول لاحقاً
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

-- ربط الصنف بالميزان الإلكتروني (إذا لم تكن مضافة)
ALTER TABLE vanguard_inventory 
ADD COLUMN IF NOT EXISTS plu_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS is_scale_item BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS scale_tare_weight_kg NUMERIC(6, 3) DEFAULT 0.000;
