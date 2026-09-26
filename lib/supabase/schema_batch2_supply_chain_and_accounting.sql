-- ==============================================================================
-- Vanguard ERP: Batch 2 Supply Chain & Financial Integrity Schema
-- Covers: Operations & Wastage, Inter-Warehouse Transfers,
-- Procurement & GRN, and Core General Ledger Accounting
-- ==============================================================================

-- 1. INVENTORY ADJUSTMENTS & WASTAGE / LOST GOODS
CREATE TABLE IF NOT EXISTS public.inventory_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    ser INTEGER NOT NULL,
    waist_id INTEGER,
    branch_id INTEGER,
    branch_name TEXT,
    location_id INTEGER,
    location_description TEXT,
    adjustment_type TEXT DEFAULT 'WASTAGE_LOST_GOODS', -- 'WASTAGE_LOST_GOODS', 'CYCLE_COUNT', 'WRITE_OFF'
    reason_id INTEGER,
    reason_description TEXT,
    employee_name TEXT,
    status TEXT DEFAULT 'DRAFT', -- 'DRAFT', 'POSTED', 'VOID'
    is_posted BOOLEAN DEFAULT false,
    posted_at TIMESTAMPTZ,
    journal_voucher_id UUID,
    total_cost NUMERIC(15, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_adjustment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    adjustment_id UUID NOT NULL REFERENCES public.inventory_adjustments(id) ON DELETE CASCADE,
    item_code TEXT NOT NULL,
    item_description TEXT NOT NULL,
    quantity NUMERIC(12, 3) NOT NULL,
    unit_cost NUMERIC(12, 4) DEFAULT 0.0000,
    total_cost NUMERIC(15, 2) DEFAULT 0.00,
    unit TEXT,
    remark TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. LIVE INVENTORY STOCK & MOVEMENTS
CREATE TABLE IF NOT EXISTS public.inventory_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    branch_id INTEGER NOT NULL DEFAULT 1,
    location_id INTEGER NOT NULL DEFAULT 1,
    item_code TEXT NOT NULL,
    item_name TEXT NOT NULL,
    on_hand_qty NUMERIC(15, 3) DEFAULT 0.000,
    in_transit_qty NUMERIC(15, 3) DEFAULT 0.000,
    reserved_qty NUMERIC(15, 3) DEFAULT 0.000,
    unit TEXT DEFAULT 'Unit',
    average_unit_cost NUMERIC(15, 4) DEFAULT 0.0000,
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_tenant_loc_item UNIQUE (tenant_id, location_id, item_code)
);

CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    branch_id INTEGER DEFAULT 1,
    location_id INTEGER DEFAULT 1,
    item_code TEXT NOT NULL,
    movement_type TEXT NOT NULL, -- 'WASTAGE_OUT', 'TRANSFER_OUT', 'TRANSFER_IN', 'PURCHASE_RECEIPT', 'SALE_POS'
    reference_id TEXT,
    quantity NUMERIC(15, 3) NOT NULL,
    unit_cost NUMERIC(15, 4) DEFAULT 0.0000,
    total_cost NUMERIC(15, 2) DEFAULT 0.00,
    balance_after NUMERIC(15, 3),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. INTER-WAREHOUSE TRANSFERS
CREATE TABLE IF NOT EXISTS public.inventory_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    transfer_number TEXT NOT NULL,
    date DATE NOT NULL,
    from_branch_id INTEGER,
    from_branch_name TEXT,
    from_location_id INTEGER NOT NULL,
    from_location_name TEXT NOT NULL,
    to_branch_id INTEGER,
    to_branch_name TEXT,
    to_location_id INTEGER NOT NULL,
    to_location_name TEXT NOT NULL,
    status TEXT DEFAULT 'DRAFT', -- 'DRAFT', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED'
    shipped_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    total_items INTEGER DEFAULT 0,
    total_quantity NUMERIC(15, 3) DEFAULT 0.000,
    total_cost NUMERIC(15, 2) DEFAULT 0.00,
    driver_name TEXT,
    truck_plate TEXT,
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    transfer_id UUID NOT NULL REFERENCES public.inventory_transfers(id) ON DELETE CASCADE,
    item_code TEXT NOT NULL,
    item_description TEXT NOT NULL,
    quantity NUMERIC(15, 3) NOT NULL,
    unit TEXT,
    unit_cost NUMERIC(15, 4) DEFAULT 0.0000,
    total_cost NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PURCHASES INVOICES (AP BILLS) CONVERTED FROM PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS public.purchases_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    po_number TEXT,
    supplier_id TEXT,
    supplier_name TEXT NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    currency TEXT DEFAULT 'USD',
    exchange_rate NUMERIC(12, 4) DEFAULT 1.0000,
    subtotal NUMERIC(15, 2) DEFAULT 0.00,
    tax_amount NUMERIC(15, 2) DEFAULT 0.00,
    total_amount NUMERIC(15, 2) NOT NULL,
    status TEXT DEFAULT 'DRAFT', -- 'DRAFT', 'POSTED', 'PAID', 'VOID'
    is_posted BOOLEAN DEFAULT false,
    posted_at TIMESTAMPTZ,
    journal_voucher_id UUID,
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.purchases_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.purchases_invoices(id) ON DELETE CASCADE,
    item_code TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(15, 3) NOT NULL,
    unit_price NUMERIC(15, 4) NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
