-- ============================================================================
-- VANGUARD ERP - PART 3: INTERNAL CONTROL, AUDIT LEDGERS & EOD CLOSINGS
-- CLIENT: Southern Olive Oil Products S.A.R.L (Tenant ID: 00001)
-- ============================================================================

-- 1. MASTER POS TRANSACTIONS LEDGER (FEEDS ALL 13 TRANSACTION MODES)
CREATE TABLE IF NOT EXISTS pos_transactions_ledger (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(10) NOT NULL DEFAULT '00001' REFERENCES tenants(tenant_id),
    branch_id VARCHAR(10) NOT NULL REFERENCES branches(branch_id),
    invoice_number VARCHAR(50) NOT NULL,
    order_number INT DEFAULT 1,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    transaction_time TIME NOT NULL DEFAULT CURRENT_TIME,
    customer_id UUID REFERENCES customers(customer_id),
    customer_name VARCHAR(150),
    server_name VARCHAR(100) NOT NULL,
    workstation_id VARCHAR(30) NOT NULL DEFAULT '1', -- '1' for POS Counter, '2000' for Backoffice
    invoice_type VARCHAR(30) DEFAULT 'POS' CHECK (invoice_type IN ('POS', 'INVENTORY', 'TRAINING', 'ONLINE')),
    department VARCHAR(50) DEFAULT 'LOCAL', -- 'LOCAL', 'INTERNATIONAL', 'ONLINE'
    source_channel VARCHAR(50) DEFAULT 'WALK_IN', -- 'WALK_IN', 'WHATSAPP', 'TIKTOK', 'WEB_STORE', 'PHONE'
    payment_type VARCHAR(30) NOT NULL DEFAULT 'CASH', -- 'CASH', 'CREDIT', 'CASH_USD', 'CREDIT_CARD', 'CREDIT_CARD_USD'
    subtotal_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    discount_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    tax_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    total_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    currency VARCHAR(10) DEFAULT 'LBP',
    exchange_rate NUMERIC(10, 2) DEFAULT 90000.00,
    print_count INT DEFAULT 1,
    is_void BOOLEAN DEFAULT FALSE,
    is_refund BOOLEAN DEFAULT FALSE,
    is_zero_tax BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledger_branch_date ON pos_transactions_ledger(branch_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_ledger_invoice_no ON pos_transactions_ledger(invoice_number);
CREATE INDEX IF NOT EXISTS idx_ledger_server ON pos_transactions_ledger(server_name);

-- 2. VOID TRANSACTIONS LOG (REP_IC_001)
CREATE TABLE IF NOT EXISTS void_transactions_log (
    void_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(10) NOT NULL DEFAULT '00001' REFERENCES tenants(tenant_id),
    branch_id VARCHAR(10) NOT NULL REFERENCES branches(branch_id),
    void_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    order_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    server_name VARCHAR(100) NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    item_description VARCHAR(200) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.0,
    value_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    void_reason VARCHAR(150) NOT NULL DEFAULT 'تعداد خاطئ',
    authorized_by_manager VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. REFUND TRANSACTIONS & ITEM DETAILS (REP_IC_002)
CREATE TABLE IF NOT EXISTS refund_transactions_log (
    refund_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(10) NOT NULL DEFAULT '00001' REFERENCES tenants(tenant_id),
    branch_id VARCHAR(10) NOT NULL REFERENCES branches(branch_id),
    eod_date DATE NOT NULL DEFAULT CURRENT_DATE,
    invoice_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(150) DEFAULT 'null null',
    subtotal_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    discount_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    tax_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    service_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    grand_total_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refund_line_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    refund_id UUID NOT NULL REFERENCES refund_transactions_log(refund_id) ON DELETE CASCADE,
    quantity NUMERIC(10, 2) NOT NULL,
    description VARCHAR(200) NOT NULL,
    total_price_lbp NUMERIC(15, 2) NOT NULL
);

-- 4. METER REPORT READINGS LOG (REP_IC_004)
CREATE TABLE IF NOT EXISTS meter_readings_log (
    meter_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(10) NOT NULL DEFAULT '00001' REFERENCES tenants(tenant_id),
    branch_id VARCHAR(10) NOT NULL REFERENCES branches(branch_id),
    eod_date DATE NOT NULL,
    reading_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    by_employee VARCHAR(100) NOT NULL,
    to_employee VARCHAR(100) NOT NULL,
    reading_category VARCHAR(50) DEFAULT 'Main Reading'
);

-- 5. NO SALE EVENTS LOG (REP_IC_005)
CREATE TABLE IF NOT EXISTS no_sale_events_log (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(10) NOT NULL DEFAULT '00001' REFERENCES tenants(tenant_id),
    branch_id VARCHAR(10) NOT NULL REFERENCES branches(branch_id),
    eod_date DATE NOT NULL,
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    employee_name VARCHAR(100) NOT NULL,
    workstation_id VARCHAR(30) NOT NULL DEFAULT '1',
    reason_notes TEXT
);

-- 6. TRANSACTIONS ON HOLD & ITEMS (REP_IC_006)
CREATE TABLE IF NOT EXISTS held_transactions_log (
    hold_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(10) NOT NULL DEFAULT '00001' REFERENCES tenants(tenant_id),
    branch_id VARCHAR(10) NOT NULL REFERENCES branches(branch_id),
    workstation_id VARCHAR(50) NOT NULL DEFAULT '1 Showroom 1',
    hold_date DATE NOT NULL DEFAULT CURRENT_DATE,
    employee_id VARCHAR(30) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    total_held_amount_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS held_line_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hold_id UUID NOT NULL REFERENCES held_transactions_log(hold_id) ON DELETE CASCADE,
    hold_time TIME NOT NULL DEFAULT CURRENT_TIME,
    quantity NUMERIC(10, 2) NOT NULL,
    description VARCHAR(200) NOT NULL,
    unit_price_lbp NUMERIC(15, 2) NOT NULL,
    total_price_lbp NUMERIC(15, 2) NOT NULL
);

-- 7. USER AUDIT TRAIL LOGS (REP_IC_007)
CREATE TABLE IF NOT EXISTS user_audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(10) NOT NULL DEFAULT '00001' REFERENCES tenants(tenant_id),
    branch_id VARCHAR(10) NOT NULL REFERENCES branches(branch_id),
    user_name VARCHAR(100) NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    module_name VARCHAR(100) NOT NULL, -- 'Adjustment', 'Inventory Ing', 'Sales POS', etc.
    action_name VARCHAR(200) NOT NULL, -- 'Save & Post', 'UPDATE Fixed Offer', 'DELETE'
    computer_name VARCHAR(50) DEFAULT 'POS-DESK-01',
    reference_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. DISCOUNT SUMMARIES (REP_IC_008)
CREATE TABLE IF NOT EXISTS daily_discount_summaries (
    summary_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(10) NOT NULL DEFAULT '00001' REFERENCES tenants(tenant_id),
    branch_id VARCHAR(10) NOT NULL REFERENCES branches(branch_id),
    summary_year INT NOT NULL,
    summary_month INT NOT NULL,
    total_discount_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    total_discount_usd NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uk_branch_year_month UNIQUE (branch_id, summary_year, summary_month)
);

-- 9. END OF DAY (EOD) CLOSINGS & SHIFTS
CREATE TABLE IF NOT EXISTS end_of_day_closings (
    eod_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(10) NOT NULL DEFAULT '00001' REFERENCES tenants(tenant_id),
    branch_id VARCHAR(10) NOT NULL REFERENCES branches(branch_id),
    eod_date DATE NOT NULL,
    closed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_by_user VARCHAR(100) NOT NULL,
    gross_sales_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    total_tax_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    total_discount_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    net_sales_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    cash_collected_lbp NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    cash_collected_usd NUMERIC(15, 2) NOT NULL DEFAULT 0.0,
    z_report_number VARCHAR(50),
    is_audited BOOLEAN DEFAULT TRUE,
    CONSTRAINT uk_branch_eod_date UNIQUE (branch_id, eod_date)
);

-- 10. INDEXES FOR HIGH PERFORMANCE QUERYING & REPORTING
CREATE INDEX IF NOT EXISTS idx_void_branch_date ON void_transactions_log(branch_id, void_timestamp);
CREATE INDEX IF NOT EXISTS idx_refund_branch_date ON refund_transactions_log(branch_id, eod_date);
CREATE INDEX IF NOT EXISTS idx_meter_branch_date ON meter_readings_log(branch_id, eod_date);
CREATE INDEX IF NOT EXISTS idx_no_sale_branch_date ON no_sale_events_log(branch_id, eod_date);
CREATE INDEX IF NOT EXISTS idx_held_branch_date ON held_transactions_log(branch_id, hold_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON user_audit_logs(module_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON user_audit_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_eod_closings_date ON end_of_day_closings(eod_date);
