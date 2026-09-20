# Blueprint & Schema Extraction: Omega Software Accounting Module -> Vanguard ERP

## Executive Summary
This document provides the complete deep-inspection, architectural breakdown, and data contracts extracted directly from **Omega Software ERP** (Customer ID: 22901 - Southern Olive Oil Products S.A.R.L) for reproduction and modernization in **Vanguard ERP**.

---

## 1. Route Architecture & Hierarchy

```
/accounting
│
├── / (Dashboard)
│   ├── Filter Bar: Time Range (Today, Week, Month, Quarter, Year, Custom), Currency (Main/Second), Dept, Sub-Dept
│   ├── P&L Trend Interactive Chart (Monthly Revenue vs. Expense with delta tooltip)
│   └── Summary Metric Blocks:
│       ├── General Ledger (Total Debit, Total Credit, JV Count)
│       ├── Accounts Receivable (Current, 30d, 60d, 90d+ Aging)
│       ├── Accounts Payable (Current, Due Soon, Overdue)
│       ├── Cash & Bank Balance (Vault Cash, Checking Accounts, Foreign Currency)
│       ├── Budget Overview (Variance % and Budget vs. Actual by Cost Center)
│       └── Latest Activities (Live transaction log)
│
├── /actions (Operational Accounting Workstations)
│   ├── Journal Voucher (JV) [AccountsJournalVoucherController.js]
│   │   ├── Dual-entry debit/credit grid with auto-balancing validation (Σ Debit = Σ Credit)
│   │   ├── Multi-currency line conversion (LBP / USD / EUR)
│   │   ├── Supporting document attachment & internal remarks
│   │   └── Post / Unpost workflow & recurring frequency templates
│   ├── Purchase / Expense [ExpenseController.js]
│   │   ├── Supplier invoice intake with VAT auto-calculation
│   │   └── Cost center & department allocation
│   ├── Payments [PaymentController.js]
│   │   ├── Bank/Cash account remittance to vendor
│   │   └── Payment method (Wire transfer, corporate cheque, cash drawer)
│   ├── Receipts [TransactionsController.js]
│   │   ├── Customer invoice collection into bank/vault account
│   │   └── Optional VAT receipt classification
│   ├── Accounts Receivable (AR) [AccountsReceivablesController.js]
│   │   ├── Aging analysis (0-7, 8-14, 15-30, 31-60, 60-90, 90+ days)
│   │   └── Statement of Account (SOA) generator & customer verification
│   ├── Accounts Payable (AP) [AccountsPayablesController.js]
│   │   ├── Supplier aging and payment terms tracking
│   │   └── Batch payment settlement
│   ├── Bank Reconciliation [BankReconciliationController.js]
│   │   ├── Beginning & ending statement balance reconciliation
│   │   ├── Cleared deposits vs cleared withdrawals calculation
│   │   └── Statement import (CSV, QBO, OFX)
│   └── VAT Period Closing [acc-closed-vat-period]
│       ├── Output VAT (Sales) vs Input VAT (Purchases) net tax determination
│       └── Automated closing JV posting
│
├── /reports (Financial & Operational Reporting Engine)
│   ├── Recommended Income Statement (ACC_R_0015)
│   ├── Balance Sheet (ACC_R_0006)
│   ├── General Ledger (ACC_R_0011)
│   ├── Vendor Aged Payables (ACC_R_0032)
│   ├── Top Customers by Sales Volume (ACC_R_0034)
│   ├── Top Suppliers & Active Procurement (ACC_R_0035)
│   └── Chart of Accounts Directory (ACC_R_0040)
│
└── /setup (Core Master Data & Configurations)
    ├── Chart of Accounts [AccountsController.js]
    │   ├── 7-Class Plan Comptable General (PCG) Tree Hierarchy
    │   └── Account creation modal (Class, Sub-classes 1-4, Currency, Checking account)
    ├── Account Auxiliaries [AccountsSubClass1-4Controller.js]
    │   ├── Account Classes (Classes 1 to 7)
    │   ├── Account Header 1 (Sub Class 1)
    │   ├── Account Header 2 (Sub Class 2)
    │   ├── Account Header 3 (Sub Class 3)
    │   └── Account Group (Sub Class 4, with depreciation intervals & asset accounts)
    ├── JV Setup
    │   ├── JV Types (Standard, Opening, Adjusting, Depreciation, Closing)
    │   └── JV Descriptions (Standardized transaction remarks)
    ├── Currency Setup [CurrencySetupsController.js]
    │   ├── Currency definitions (USD, LBP, EUR)
    │   └── Daily exchange rate tables & decimal precision rules
    └── Departments & Cash Flow
        ├── Department Groups, Departments, Sub-Departments
        └── Cash Flow Report Setup (Operating, Investing, Financing mapping)
```

---

## 2. Database Schema Data Contracts (Postgres / Supabase)

### Table 1: `acc_classes` (Master Account Classes)
- `id` (INT PRIMARY KEY)
- `class_number` (INT UNIQUE) - 1: Capital, 2: Fixed Assets, 3: Stocks, 4: AP/AR, 5: Monetary, 6: Expenses, 7: Revenues
- `account_group_name` (VARCHAR(150))
- `account_label` (VARCHAR(200))

### Table 2: `acc_sub_class1` (Account Header 1)
- `id` (SERIAL PRIMARY KEY)
- `class_id` (INT REFERENCES acc_classes(id))
- `account_number_ref` (INT)
- `account_name` (VARCHAR(200))
- `account_label` (VARCHAR(250))

### Table 3: `acc_sub_class2` (Account Header 2)
- `id` (SERIAL PRIMARY KEY)
- `sub_class1_id` (INT REFERENCES acc_sub_class1(id))
- `account_number_ref` (INT)
- `account_name` (VARCHAR(200))

### Table 4: `acc_sub_class3` (Account Header 3)
- `id` (SERIAL PRIMARY KEY)
- `sub_class2_id` (INT REFERENCES acc_sub_class2(id))
- `account_number_ref` (INT)
- `account_name` (VARCHAR(200))

### Table 5: `acc_sub_class4` (Account Group / Sub Class 4)
- `id` (SERIAL PRIMARY KEY)
- `sub_class3_id` (INT REFERENCES acc_sub_class3(id))
- `account_number_ref` (INT)
- `account_name` (VARCHAR(200))
- `depreciation_interval` (VARCHAR(50))
- `depreciation_account_id` (INT)
- `depreciation_expense_account_id` (INT)

### Table 6: `acc_accounts` (Chart of Accounts - Detail Level)
- `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
- `tenant_id` (UUID REFERENCES public.tenants(id) ON DELETE CASCADE)
- `account_number` (VARCHAR(50) NOT NULL)
- `account_name` (VARCHAR(255) NOT NULL)
- `account_name_ar` (VARCHAR(255))
- `description` (TEXT)
- `class_id` (INT REFERENCES acc_classes(id))
- `sub_class4_id` (INT REFERENCES acc_sub_class4(id))
- `account_type` (VARCHAR(50)) -- ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
- `currency_id` (VARCHAR(10) DEFAULT 'USD')
- `balance_first_cur` (NUMERIC(15,2) DEFAULT 0.00)
- `balance_sec_cur` (NUMERIC(15,2) DEFAULT 0.00)
- `checking_account` (BOOLEAN DEFAULT FALSE)
- `is_active` (BOOLEAN DEFAULT TRUE)
- `created_at` (TIMESTAMPTZ DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ DEFAULT NOW())

### Table 7: `acc_journal_vouchers` (Journal Voucher Headers)
- `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
- `tenant_id` (UUID REFERENCES public.tenants(id) ON DELETE CASCADE)
- `jv_number` (VARCHAR(50) NOT NULL)
- `date_of_jv` (DATE NOT NULL)
- `jv_type` (VARCHAR(50) NOT NULL DEFAULT 'STANDARD')
- `currency_id` (VARCHAR(10) DEFAULT 'USD')
- `doc_ref_number` (VARCHAR(100))
- `description` (TEXT)
- `internal_remark` (TEXT)
- `total_debit` (NUMERIC(15,2) NOT NULL DEFAULT 0.00)
- `total_credit` (NUMERIC(15,2) NOT NULL DEFAULT 0.00)
- `is_posted` (BOOLEAN DEFAULT FALSE)
- `posted_at` (TIMESTAMPTZ)
- `posted_by` (VARCHAR(100))
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

### Table 8: `acc_journal_voucher_lines` (JV Dual-Entry Line Items)
- `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
- `jv_id` (UUID REFERENCES acc_journal_vouchers(id) ON DELETE CASCADE)
- `line_number` (INT NOT NULL)
- `account_id` (UUID REFERENCES acc_accounts(id))
- `account_number` (VARCHAR(50))
- `account_name` (VARCHAR(255))
- `description` (VARCHAR(255))
- `department_id` (INT)
- `sub_department_id` (INT)
- `amount_debit` (NUMERIC(15,2) DEFAULT 0.00)
- `amount_credit` (NUMERIC(15,2) DEFAULT 0.00)
- `currency_rate` (NUMERIC(12,4) DEFAULT 1.0000)
- `amount_native` (NUMERIC(15,2) NOT NULL)

### Table 9: `acc_bank_reconciliations` (Bank Reconciliation)
- `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
- `tenant_id` (UUID REFERENCES public.tenants(id) ON DELETE CASCADE)
- `account_id` (UUID REFERENCES acc_accounts(id))
- `statement_date` (DATE NOT NULL)
- `beginning_balance` (NUMERIC(15,2) NOT NULL)
- `ending_balance` (NUMERIC(15,2) NOT NULL)
- `cleared_deposits` (NUMERIC(15,2) DEFAULT 0.00)
- `cleared_withdrawals` (NUMERIC(15,2) DEFAULT 0.00)
- `reconciled_balance` (NUMERIC(15,2) NOT NULL)
- `difference` (NUMERIC(15,2) NOT NULL)
- `status` (VARCHAR(50) DEFAULT 'IN_PROGRESS') -- IN_PROGRESS, RECONCILED

### Table 10: `acc_vat_period_closings` (VAT Period Closing)
- `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
- `tenant_id` (UUID REFERENCES public.tenants(id) ON DELETE CASCADE)
- `period_start` (DATE NOT NULL)
- `period_end` (DATE NOT NULL)
- `taxable_sales_amount` (NUMERIC(15,2) DEFAULT 0.00)
- `vat_output_amount` (NUMERIC(15,2) DEFAULT 0.00)
- `taxable_purchases_amount` (NUMERIC(15,2) DEFAULT 0.00)
- `vat_input_amount` (NUMERIC(15,2) DEFAULT 0.00)
- `net_vat_payable` (NUMERIC(15,2) DEFAULT 0.00)
- `closing_jv_id` (UUID REFERENCES acc_journal_vouchers(id))
- `closed_by` (VARCHAR(100))
- `closed_at` (TIMESTAMPTZ DEFAULT NOW())

---

## 3. Form Validation & Debit/Credit Balancing Rules

1. **Dual Entry Rule**:
   $$\sum_{i=1}^n \text{amount\_debit}_i = \sum_{i=1}^n \text{amount\_credit}_i$$
   A Journal Voucher cannot be saved or posted if $|\sum \text{Debit} - \sum \text{Credit}| > 0.001$.
2. **Line Integrity Rule**:
   Each line MUST have either `amount_debit > 0` OR `amount_credit > 0`, never both on the same line.
3. **Currency Conversion Rule**:
   $$\text{amount\_native} = \text{amount} \times \text{currency\_rate}$$
   If transaction currency is USD and main currency is LBP at rate 89,500, base amount is computed accordingly.
4. **Account Validation**:
   Only posting-level detail accounts (`acc_accounts`) may be selected in JV lines. Header accounts (Classes 1-3, Sub-classes 1-4) are aggregate-only and cannot have direct debit/credit postings.
5. **Closed VAT Period Guard**:
   Transactions dated within a closed VAT period cannot be edited or unposted without super admin override.
