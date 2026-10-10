-- Operation Center Dynamic Tables Migration

-- 1. Units of Measure (No hardcoded data)
CREATE TABLE IF NOT EXISTS units_of_measure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Raw Materials
CREATE TABLE IF NOT EXISTS raw_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    unit_id UUID REFERENCES units_of_measure(id) ON DELETE RESTRICT,
    current_stock NUMERIC DEFAULT 0,
    reorder_level NUMERIC DEFAULT 0,
    cost_per_unit NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Production Recipes (BOM)
CREATE TABLE IF NOT EXISTS production_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    recipe_name TEXT NOT NULL,
    output_item_name TEXT NOT NULL,
    default_batch_size NUMERIC DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Recipe Ingredients (Many-to-one with recipe, one-to-one with material)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES production_recipes(id) ON DELETE CASCADE,
    raw_material_id UUID REFERENCES raw_materials(id) ON DELETE RESTRICT,
    quantity_required NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Production Batches
CREATE TABLE IF NOT EXISTS production_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    batch_number TEXT NOT NULL,
    recipe_id UUID REFERENCES production_recipes(id) ON DELETE SET NULL,
    output_item_name TEXT NOT NULL,
    quantity_produced NUMERIC,
    status TEXT CHECK (status IN ('draft', 'completed')),
    production_date DATE,
    expiry_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Quality Checks
CREATE TABLE IF NOT EXISTS quality_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    batch_id UUID REFERENCES production_batches(id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    test_value TEXT,
    is_passed BOOLEAN,
    tested_by TEXT,
    tested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for all tables (optional based on existing setup, assuming standard Vanguard ERP pattern)
-- Just ensuring tenants can only access their own data
ALTER TABLE units_of_measure ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_checks ENABLE ROW LEVEL SECURITY;

-- Note: In a full deployment, standard tenant isolation policies should be attached to these.
