-- ============================================================
-- VANGUARD ERP: MATERIAL REQUESTS & RECURRING TEMPLATES
-- ============================================================

-- 0. الجداول التأسيسية للمشتريات والتحويلات المخزنية إن لم تكن موجودة
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_code VARCHAR(50) NOT NULL UNIQUE,
    branch_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    branch_id UUID REFERENCES branches(id),
    order_date DATE DEFAULT CURRENT_DATE,
    delivery_date DATE,
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES vanguard_inventory(id),
    qty_requested NUMERIC(12, 3),
    qty_approved NUMERIC(12, 3),
    unit_price NUMERIC(12, 2) DEFAULT 0,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS internal_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_number VARCHAR(50) NOT NULL UNIQUE,
    source_branch_id UUID REFERENCES branches(id),
    destination_branch_id UUID REFERENCES branches(id),
    transfer_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS internal_transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID NOT NULL REFERENCES internal_transfers(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES vanguard_inventory(id),
    qty_requested NUMERIC(12, 3),
    qty_approved NUMERIC(12, 3),
    notes TEXT
);

-- 1. فصل الكميات المطلوبة عن المعتمدة في طلبات البضائع والمشتريات
ALTER TABLE purchase_order_items
ADD COLUMN IF NOT EXISTS qty_requested NUMERIC(12, 3),
ADD COLUMN IF NOT EXISTS qty_approved NUMERIC(12, 3);

ALTER TABLE internal_transfer_items
ADD COLUMN IF NOT EXISTS qty_requested NUMERIC(12, 3),
ADD COLUMN IF NOT EXISTS qty_approved NUMERIC(12, 3);

-- 2. جدول حفظ واسترجاع الحركات المتكررة (Store & Recall Recurring Transactions)
CREATE TABLE IF NOT EXISTS recurring_transaction_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(100) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('MATERIAL_REQUEST', 'PURCHASE_ORDER', 'TRANSFER')),
    source_branch_id UUID REFERENCES branches(id),
    destination_branch_id UUID REFERENCES branches(id),
    notes TEXT,
    created_by UUID REFERENCES employees(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recurring_transaction_template_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES recurring_transaction_templates(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES vanguard_inventory(id),
    default_quantity NUMERIC(12, 3) NOT NULL DEFAULT 1
);

-- 3. فهارس تسريع الاستعلامات والتطابق
CREATE INDEX IF NOT EXISTS idx_po_items_order ON purchase_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_transfer_items_transfer ON internal_transfer_items(transfer_id);
CREATE INDEX IF NOT EXISTS idx_rec_templates_type ON recurring_transaction_templates(transaction_type);
CREATE INDEX IF NOT EXISTS idx_rec_template_items ON recurring_transaction_template_items(template_id);
