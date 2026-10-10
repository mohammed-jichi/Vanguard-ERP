-- Customer Management Dynamic Tables Migration

-- 1. Customer Categories
CREATE TABLE IF NOT EXISTS customer_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    discount_rate NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Customer Zones
CREATE TABLE IF NOT EXISTS customer_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    zone_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    account_code TEXT NOT NULL,
    full_name TEXT NOT NULL,
    company_name TEXT,
    category_id UUID REFERENCES customer_categories(id) ON DELETE SET NULL,
    zone_id UUID REFERENCES customer_zones(id) ON DELETE SET NULL,
    phone TEXT,
    address TEXT,
    credit_limit NUMERIC DEFAULT 0,
    current_balance NUMERIC DEFAULT 0,
    payment_terms TEXT,
    is_wholesale BOOLEAN DEFAULT FALSE,
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Customer Transactions
CREATE TABLE IF NOT EXISTS customer_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    transaction_type TEXT CHECK (transaction_type IN ('invoice', 'payment', 'adjustment', 'return')),
    amount NUMERIC NOT NULL,
    balance_after NUMERIC NOT NULL,
    reference_no TEXT,
    notes TEXT,
    transaction_date TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Customer Feedback Tickets
CREATE TABLE IF NOT EXISTS customer_feedback_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('open', 'in_progress', 'resolved')) DEFAULT 'open',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'low',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for all tables
ALTER TABLE customer_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_feedback_tickets ENABLE ROW LEVEL SECURITY;
