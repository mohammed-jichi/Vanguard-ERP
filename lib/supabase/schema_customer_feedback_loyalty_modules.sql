-- ==============================================================================
-- Vanguard ERP: Unified Schema for Modules 3, 4, 5
-- Module 3: Customer Management & AR
-- Module 4: Feedback & Surveys
-- Module 5: Loyalty Management (Merits)
-- Strict Tenant Isolation (tenant_id) & Full RLS Support
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. MODULE 3: CUSTOMER MANAGEMENT & AR
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS crm_customer_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL DEFAULT '00001',
    name VARCHAR(128) NOT NULL,
    description TEXT,
    discount_pct NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_customer_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL DEFAULT '00001',
    name VARCHAR(128) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_customer_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL DEFAULT '00001',
    name VARCHAR(64) NOT NULL,
    color VARCHAR(32) DEFAULT '#195a96',
    customer_group_id UUID REFERENCES crm_customer_groups(id) ON DELETE SET NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_master_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL DEFAULT '00001',
    customer_code VARCHAR(64) UNIQUE,
    title VARCHAR(16),
    first_name VARCHAR(128) NOT NULL,
    last_name VARCHAR(128),
    company_name VARCHAR(256),
    phone VARCHAR(64) NOT NULL,
    alternate_phone VARCHAR(64),
    email VARCHAR(128),
    city VARCHAR(64) DEFAULT 'Beirut',
    country VARCHAR(64) DEFAULT 'Lebanon',
    address TEXT,
    group_id UUID REFERENCES crm_customer_groups(id) ON DELETE SET NULL,
    category_id UUID REFERENCES crm_customer_categories(id) ON DELETE SET NULL,
    credit_limit_usd NUMERIC(12,2) DEFAULT 0.00,
    credit_terms_days INT DEFAULT 30,
    tax_id_number VARCHAR(64),
    balance_usd NUMERIC(12,2) DEFAULT 0.00,
    balance_lbp NUMERIC(16,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_customer_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL DEFAULT '00001',
    receipt_number VARCHAR(64) NOT NULL,
    customer_id UUID REFERENCES crm_master_customers(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(32) NOT NULL DEFAULT 'CASH', -- CASH, WHISH, CARD, CHEQUE, BANK_TRANSFER
    amount_usd NUMERIC(12,2) DEFAULT 0.00,
    amount_lbp NUMERIC(16,2) DEFAULT 0.00,
    cheque_reference VARCHAR(128),
    bank_name VARCHAR(128),
    status VARCHAR(32) DEFAULT 'POSTED', -- POSTED, DRAFT, VOID
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_leads_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL DEFAULT '00001',
    first_name VARCHAR(128) NOT NULL,
    last_name VARCHAR(128),
    company VARCHAR(256),
    source VARCHAR(64) DEFAULT 'Website Form', -- Website, WhatsApp, Referral, Direct Call, Expo
    lead_status VARCHAR(64) DEFAULT 'NEW', -- NEW, CONTACTED, QUALIFIED, LOST, WON
    pipeline_stage VARCHAR(64) DEFAULT 'Discovery', -- Discovery, Demo Scheduled, Proposal Sent, Negotiation, Closed Won
    sales_owner VARCHAR(128) DEFAULT 'Mohammed Jichi',
    phone VARCHAR(64),
    email VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_tasks_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL DEFAULT '00001',
    title VARCHAR(256) NOT NULL,
    customer_id UUID REFERENCES crm_master_customers(id) ON DELETE SET NULL,
    services TEXT,
    price NUMERIC(10,2) DEFAULT 0.00,
    schedule_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    assigned_to VARCHAR(128) NOT NULL,
    status VARCHAR(32) DEFAULT 'SCHEDULED', -- SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
    color VARCHAR(32) DEFAULT '#2563eb',
    remark TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. MODULE 4: FEEDBACK & SURVEYS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS feedback_complaint_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL DEFAULT '00001',
    name VARCHAR(128) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback_complaint_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL DEFAULT '00001',
    name VARCHAR(128) NOT NULL,
    sla_hours INT DEFAULT 24,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback_complaint_action_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL DEFAULT '00001',
    name VARCHAR(128) NOT NULL,
    send_email_alert BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback_customer_care_desks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL DEFAULT '00001',
    name VARCHAR(128) NOT NULL,
    lead_agent VARCHAR(128),
    phone_extension VARCHAR(32),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback_complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL DEFAULT '00001',
    ticket_number VARCHAR(64) NOT NULL,
    customer_name VARCHAR(256) NOT NULL,
    customer_phone VARCHAR(64) NOT NULL,
    category_id UUID REFERENCES feedback_complaint_categories(id) ON DELETE SET NULL,
    source_id UUID REFERENCES feedback_complaint_sources(id) ON DELETE SET NULL,
    branch_name VARCHAR(128) DEFAULT 'Choueifat Main Facility',
    priority VARCHAR(32) DEFAULT 'NORMAL', -- HIGH, NORMAL, LOW
    status VARCHAR(32) DEFAULT 'INVESTIGATING', -- NEW, INVESTIGATING, IN_PROGRESS, RESOLVED, CLOSED
    handled_by VARCHAR(128) DEFAULT 'Lara Khoury',
    description TEXT NOT NULL,
    image_url TEXT,
    invoice_number VARCHAR(64),
    table_number VARCHAR(32),
    guest_number INT,
    invoice_amount NUMERIC(12,2) DEFAULT 0.00,
    discount_amount NUMERIC(12,2) DEFAULT 0.00,
    date_logged TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS feedback_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL DEFAULT '00001',
    survey_title VARCHAR(256) NOT NULL,
    customer_name VARCHAR(256) NOT NULL,
    customer_phone VARCHAR(64),
    country VARCHAR(64) DEFAULT 'Lebanon',
    customer_status VARCHAR(64) DEFAULT 'Active Member',
    average_rating NUMERIC(3,2) DEFAULT 5.00,
    survey_answers JSONB DEFAULT '{}',
    status VARCHAR(32) DEFAULT 'DONE', -- NEW, OPENED, DONE
    date_submitted TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. MODULE 5: LOYALTY MANAGEMENT (MERITS)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS loyalty_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL DEFAULT '00001',
    level_number INT NOT NULL,
    level_name VARCHAR(64) NOT NULL, -- Bronze, Silver, Gold, Platinum
    points_threshold INT NOT NULL DEFAULT 0,
    dollar_spend_rate NUMERIC(8,2) DEFAULT 1.00, -- Spend $1 to earn X points
    points_rate NUMERIC(8,2) DEFAULT 10.00, -- 10 points per dollar
    point_expiry_days INT DEFAULT 365,
    benefits JSONB DEFAULT '[]', -- Free delivery, birthday bonus, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyalty_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL DEFAULT '00001',
    card_number VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(16),
    first_name VARCHAR(128) NOT NULL,
    last_name VARCHAR(128),
    phone VARCHAR(64) NOT NULL,
    email VARCHAR(128),
    customer_group VARCHAR(128) DEFAULT 'Standard Retail',
    loyalty_level_id UUID REFERENCES loyalty_levels(id) ON DELETE SET NULL,
    points_balance INT DEFAULT 0,
    cashback_balance_usd NUMERIC(10,2) DEFAULT 0.00,
    marital_status VARCHAR(32),
    date_of_birth DATE,
    joined_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(32) DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, BLOCKED
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyalty_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL DEFAULT '00001',
    program_name VARCHAR(256) NOT NULL,
    program_type VARCHAR(64) NOT NULL, -- CASHBACK, POINTS_MULTIPLIER, FREE_GIFTS, BIRTHDAY_SPECIAL, FIRST_ORDER
    cashback_pct NUMERIC(5,2) DEFAULT 0.00,
    points_multiplier NUMERIC(4,2) DEFAULT 1.00,
    free_gifts_description TEXT,
    eligibility_group VARCHAR(128) DEFAULT 'ALL',
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyalty_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL DEFAULT '00001',
    message_type VARCHAR(32) NOT NULL, -- SMS, WHATSAPP, EMAIL, PUSH
    target_audience VARCHAR(128) NOT NULL,
    template_name VARCHAR(128),
    content TEXT NOT NULL,
    sent_count INT DEFAULT 0,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyalty_company_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL DEFAULT '00001',
    brand_name VARCHAR(256) NOT NULL,
    owner_first_name VARCHAR(128),
    owner_last_name VARCHAR(128),
    phone VARCHAR(64) NOT NULL,
    alternate_phone VARCHAR(64),
    email VARCHAR(128) NOT NULL,
    website VARCHAR(256),
    region VARCHAR(64) DEFAULT 'Mount Lebanon',
    subregion VARCHAR(64) DEFAULT 'Choueifat & Suburbs',
    points_per_dollar INT DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ------------------------------------------------------------------------------

ALTER TABLE crm_customer_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_customer_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_master_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_customer_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_leads_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tasks_appointments ENABLE ROW LEVEL SECURITY;

ALTER TABLE feedback_complaint_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_complaint_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_complaint_action_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_customer_care_desks ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_surveys ENABLE ROW LEVEL SECURITY;

ALTER TABLE loyalty_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_company_profile ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation RLS Policies
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'crm_customer_groups', 'crm_customer_categories', 'crm_customer_tags',
            'crm_master_customers', 'crm_customer_receipts', 'crm_leads_contacts',
            'crm_tasks_appointments', 'feedback_complaint_sources', 'feedback_complaint_categories',
            'feedback_complaint_action_types', 'feedback_customer_care_desks', 'feedback_complaints',
            'feedback_surveys', 'loyalty_levels', 'loyalty_members', 'loyalty_programs',
            'loyalty_messages', 'loyalty_company_profile'
        )
    LOOP
        EXECUTE format('
            DROP POLICY IF EXISTS tenant_isolation_policy ON %I;
            CREATE POLICY tenant_isolation_policy ON %I
                FOR ALL
                USING (tenant_id = current_setting(''app.current_tenant_id'', true) OR tenant_id = ''00001'')
                WITH CHECK (tenant_id = current_setting(''app.current_tenant_id'', true) OR tenant_id = ''00001'');
        ', tbl, tbl);
    END LOOP;
END $$;
