-- ============================================================
-- VANGUARD ERP: UNIVERSAL HARDWARE INTEGRATION ENGINE
-- (Agnostic to Brands: Printers, Scales, Scanners, Displays, Drawers)
-- Organization: Southern Olive Oil Products S.A.R.L
-- ============================================================

-- 1. تصنيف أنواع الهاردوير المدعومة
DO $$ BEGIN
    CREATE TYPE hardware_device_category AS ENUM (
        'THERMAL_RECEIPT', 
        'BARCODE_LABEL_PRINTER', 
        'A4_OFFICE_PRINTER',
        'ELECTRONIC_SCALE', 
        'CUSTOMER_POLE_DISPLAY', 
        'BARCODE_SCANNER', 
        'CASH_DRAWER', 
        'PAYMENT_TERMINAL_POS'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. بروتوكولات التوصيل القياسية لكافة الأجهزة
DO $$ BEGIN
    CREATE TYPE hardware_interface_type AS ENUM (
        'NETWORK_TCP',       -- Ethernet / Wi-Fi (IP + Port)
        'SERIAL_COM',        -- RS-232 / USB Virtual COM
        'USB_RAW',           -- Direct USB Endpoint
        'SYSTEM_SPOOLER',    -- Windows/Linux Driver Spooler
        'BLUETOOTH',         -- Wireless Bluetooth SPP
        'KEYBOARD_WEDGE'     -- Scanners via USB Keyboard emulation
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. جدول تعاريف وبروفايلات أجهزة الهاردوير الشامل
CREATE TABLE IF NOT EXISTS system_hardware_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_name VARCHAR(100) NOT NULL,
    device_category hardware_device_category NOT NULL,
    interface_type hardware_interface_type NOT NULL,
    
    -- بارامترات الاتصال المفتوحة
    ip_address VARCHAR(45),
    port_number INT,
    serial_port VARCHAR(50),             -- مثل COM1, COM3, /dev/ttyUSB0
    serial_baud_rate INT DEFAULT 9600,   -- سرعة نقل البيانات القياسية للموازين والشاشات
    serial_data_bits INT DEFAULT 8,
    serial_parity VARCHAR(10) DEFAULT 'NONE',
    serial_stop_bits INT DEFAULT 1,
    system_printer_name VARCHAR(255),    -- اسم الطابعة بالويندوز/النظام إذا كان Spooler
    
    -- لغة البروتوكول القياسية (Agnostic Protocols)
    command_protocol VARCHAR(50) DEFAULT 'STANDARD', -- ESC/POS, TSPL, ZPL, CAS/TOLEDO_CONTINUOUS, SMA, NCI
    
    -- إعدادات إضافية متغيرة لكل جهاز (JSON Configuration)
    -- تتيح ضبط الباركود، نبضة درج الكاش، عدد الأحرف، أو البادئة دون تعديل جداول
    device_config JSONB DEFAULT '{
        "paper_width_mm": 80,
        "characters_per_line": 48,
        "auto_cutter": true,
        "cash_drawer_pulse": true,
        "weight_barcode_prefix": "20",
        "scale_unit": "KG"
    }'::jsonb,
    
    branch_id UUID REFERENCES branches(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ربط الصنف بالميزان الإلكتروني (إذا لم تكن مضافة)
ALTER TABLE vanguard_inventory 
ADD COLUMN IF NOT EXISTS plu_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS is_scale_item BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS scale_tare_weight_kg NUMERIC(6, 3) DEFAULT 0.000;

