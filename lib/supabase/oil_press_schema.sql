-- ============================================================================
-- Vanguard ERP System - SUPABASE DATABASE SCHEMA & TRIGGERS
-- Module: Receive & Production Center (Oil Press, Receive & Production)
-- ============================================================================

-- 1. MASTER VANGUARD ERP INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.vanguard_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT UNIQUE NOT NULL,
  capacity_kg NUMERIC(10, 2) NOT NULL DEFAULT 15.2,
  packaging_type TEXT NOT NULL DEFAULT 'تطفيح صاج',
  vanguard_stock INTEGER NOT NULL DEFAULT 0 CHECK (vanguard_stock >= 0),
  min_threshold INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DEDICATED SUPERSONIC FLEET STOCK TABLE
CREATE TABLE IF NOT EXISTS public.supersonic_fleet_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_name TEXT NOT NULL DEFAULT 'المستودع الرئيسي لشركة SuperSonic',
  vehicle_info TEXT NOT NULL DEFAULT 'المستودع المركزي',
  item_name TEXT NOT NULL REFERENCES public.vanguard_inventory(item_name) ON UPDATE CASCADE ON DELETE CASCADE,
  qty INTEGER NOT NULL DEFAULT 0 CHECK (qty >= 0),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(driver_name, item_name)
);

-- 3. RAW BULK OIL TANKS BALANCE TABLE
CREATE TABLE IF NOT EXISTS public.raw_oil_stock (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  kura_kg NUMERIC(12, 2) NOT NULL DEFAULT 1600.0,
  evoo_kg NUMERIC(12, 2) NOT NULL DEFAULT 2400.0,
  palm_kg NUMERIC(12, 2) NOT NULL DEFAULT 800.0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. RECEIVING SHIPMENTS LOG TABLE
CREATE TABLE IF NOT EXISTS public.oil_receiving_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name TEXT NOT NULL,
  kura_kg NUMERIC(10, 2) DEFAULT 0,
  evoo_kg NUMERIC(10, 2) DEFAULT 0,
  palm_kg NUMERIC(10, 2) DEFAULT 0,
  total_kg NUMERIC(10, 2) GENERATED ALWAYS AS (kura_kg + evoo_kg + palm_kg) STORED,
  notes TEXT,
  received_by TEXT NOT NULL DEFAULT 'أمين المستودع',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PRODUCTION DELIVERIES LOG TABLE
CREATE TABLE IF NOT EXISTS public.production_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_hub TEXT NOT NULL,
  item_name TEXT NOT NULL,
  delivery_qty INTEGER NOT NULL CHECK (delivery_qty > 0),
  dispatched_by TEXT NOT NULL DEFAULT 'مدير العمليات',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SALES INVOICES TABLE (TRIGGERS AUTOMATIC RECONCILIATION)
CREATE TABLE IF NOT EXISTS public.sales_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_ref TEXT UNIQUE NOT NULL,
  driver_name TEXT NOT NULL,
  item_name TEXT NOT NULL,
  sold_qty INTEGER NOT NULL CHECK (sold_qty > 0),
  total_amount_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- BUSINESS LOGIC REQUIREMENT 2: TAB 3 PRODUCTION DELIVERY RPC TRANSACTION
-- Simultaneously increases Vanguard ERP Inventory AND SuperSonic Fleet Stock
-- ============================================================================

CREATE OR REPLACE FUNCTION public.confirm_production_delivery(
  p_target_hub TEXT,
  p_item_name TEXT,
  p_delivery_qty INTEGER,
  p_dispatched_by TEXT DEFAULT 'مدير العمليات'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vanguard_new_qty INT;
  v_fleet_new_qty INT;
BEGIN
  -- 1. Verify item exists in Vanguard ERP Inventory
  IF NOT EXISTS (SELECT 1 FROM public.vanguard_inventory WHERE item_name = p_item_name) THEN
    RAISE EXCEPTION 'Item "%" does not exist in Vanguard ERP Inventory', p_item_name;
  END IF;

  -- 2. Increment stock in Master Vanguard ERP Inventory table
  UPDATE public.vanguard_inventory
  SET vanguard_stock = vanguard_stock + p_delivery_qty,
      updated_at = NOW()
  WHERE item_name = p_item_name
  RETURNING vanguard_stock INTO v_vanguard_new_qty;

  -- 3. Increment stock in SuperSonic Fleet Stock table
  INSERT INTO public.supersonic_fleet_stock (driver_name, vehicle_info, item_name, qty, last_updated)
  VALUES (p_target_hub, 'SuperSonic Fleet Center', p_item_name, p_delivery_qty, NOW())
  ON CONFLICT (driver_name, item_name)
  DO UPDATE SET
    qty = supersonic_fleet_stock.qty + EXCLUDED.qty,
    last_updated = NOW()
  RETURNING qty INTO v_fleet_new_qty;

  -- 4. Record Audit Log
  INSERT INTO public.production_deliveries (target_hub, item_name, delivery_qty, dispatched_by)
  VALUES (p_target_hub, p_item_name, p_delivery_qty, p_dispatched_by);

  RETURN jsonb_build_object(
    'status', 'SUCCESS',
    'message', 'Atomic delivery transaction completed successfully across Vanguard and SuperSonic',
    'item_name', p_item_name,
    'delivered_qty', p_delivery_qty,
    'new_vanguard_stock', v_vanguard_new_qty,
    'new_supersonic_stock', v_fleet_new_qty
  );
END;
$$;


-- ============================================================================
-- BUSINESS LOGIC REQUIREMENT 3: FLEET TO INVENTORY RECONCILIATION TRIGGER
-- Deducts stock from Supersonic Fleet AND Master Vanguard ERP Inventory
-- ============================================================================

CREATE OR REPLACE FUNCTION public.reconcile_fleet_sale_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Simultaneously deduct from SuperSonic Fleet stock table
  UPDATE public.supersonic_fleet_stock
  SET qty = GREATEST(0, qty - NEW.sold_qty),
      last_updated = NOW()
  WHERE item_name = NEW.item_name
    AND driver_name = NEW.driver_name;

  -- 2. Simultaneously deduct from Master Vanguard ERP Inventory table
  UPDATE public.vanguard_inventory
  SET vanguard_stock = GREATEST(0, vanguard_stock - NEW.sold_qty),
      updated_at = NOW()
  WHERE item_name = NEW.item_name;

  RETURN NEW;
END;
$$;

-- Attach Trigger AFTER INSERT on sales_invoices
DROP TRIGGER IF EXISTS trg_reconcile_fleet_sale ON public.sales_invoices;
CREATE TRIGGER trg_reconcile_fleet_sale
  AFTER INSERT ON public.sales_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.reconcile_fleet_sale_func();

-- ============================================================================
-- INITIAL SEED DATA
-- Populate Raw Stock & Vendor 'أنور الموزع'
-- ============================================================================

INSERT INTO public.raw_oil_stock (id, kura_kg, evoo_kg, palm_kg)
VALUES (1, 1600.00, 2400.00, 800.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.vanguard_inventory (item_name, capacity_kg, packaging_type, vanguard_stock, min_threshold)
VALUES
  ('تنكة كاملة معشبة (15.2 كجم)', 15.2, 'تطفيح صاج', 145, 30),
  ('نصف تنكة (7.8 كجم)', 7.8, 'تطفيح صاج', 80, 20),
  ('غالون بلاستيك 5 لتر (4.5 كجم)', 4.5, 'بلاستيك مقوى', 210, 50),
  ('قنينة زجاج 1 لتر (1.09 كجم)', 1.09, 'زجاج فاخر', 350, 100)
ON CONFLICT (item_name) DO NOTHING;
