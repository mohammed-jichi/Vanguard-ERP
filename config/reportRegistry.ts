// ============================================================================
// VANGUARD ERP: DYNAMIC REPORT CONFIGURATION & FILTER SCHEMA REGISTRY
// ============================================================================

import { getDuplicateInvoiceConfig, DUPLICATE_INVOICES_REGISTRY } from '@/types/duplicate-invoices';

export type FilterFieldType = 'select' | 'text' | 'date-range' | 'date' | 'checkbox' | 'toggle' | 'number';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterCondition {
  field: string;
  equals?: any;
  notEquals?: any;
  in?: any[];
  isTruthy?: boolean;
}

export interface ReportFilterFieldConfig {
  id: string;
  label: string;
  type: FilterFieldType;
  options?: FilterOption[];
  defaultValue?: any;
  placeholder?: string;
  className?: string;
  dependsOn?: FilterCondition;
  tooltip?: string;
}

export interface ReportConfig {
  reportKey: string;
  reportTitle: string;
  code?: string;
  module: 'sales' | 'operations' | 'loyalty' | 'accounting' | 'fleet' | 'social' | 'general';
  category?: string;
  description?: string;
  filters: ReportFilterFieldConfig[];
}

// ============================================================================
// REUSABLE STANDARD FILTER FIELD PRESETS
// ============================================================================

export const STANDARD_DATE_RANGE_FIELD: ReportFilterFieldConfig = {
  id: 'period',
  label: 'Period & Date Range',
  type: 'date-range',
  defaultValue: 'This Month',
  options: [
    { label: 'Today', value: 'Today' },
    { label: 'Yesterday', value: 'Yesterday' },
    { label: 'This Week', value: 'This Week' },
    { label: 'This Month', value: 'This Month' },
    { label: 'Last Month', value: 'Last Month' },
    { label: 'First Quarter', value: 'First Quarter' },
    { label: 'Second Quarter', value: 'Second Quarter' },
    { label: 'Third Quarter', value: 'Third Quarter' },
    { label: 'Fourth Quarter', value: 'Fourth Quarter' },
    { label: 'This Year', value: 'This Year' },
    { label: 'Custom Date Range', value: 'Custom' },
  ],
};

export const STANDARD_BRANCH_FIELD: ReportFilterFieldConfig = {
  id: 'branch',
  label: 'Branch / Facility',
  type: 'select',
  defaultValue: 'ALL',
  options: [
    { label: 'All Branches (Consolidated)', value: 'ALL' },
    { label: 'Main Branch (Choueifat Facility)', value: 'Main Branch' },
    { label: 'Choueifat Main Facility', value: 'Choueifat Main Facility' },
    { label: 'Beirut Gourmet Depot (Verdun)', value: 'Beirut Gourmet Depot' },
    { label: 'Sidon Hub & Plant', value: 'Sidon Hub' },
    { label: 'Tripoli Northern Depot', value: 'Tripoli Depot' },
  ],
};

export const STANDARD_MULTI_BRANCH_FIELD: ReportFilterFieldConfig = {
  id: 'branchesMulti',
  label: 'Branches / Facilities',
  type: 'select',
  defaultValue: 'ALL',
  options: [
    { label: 'All Branches (Consolidated Comparison)', value: 'ALL' },
    { label: 'Choueifat Main vs Beirut Gourmet Depot', value: 'CHOUEIFAT_VS_BEIRUT' },
    { label: 'Choueifat Main vs Sidon Hub', value: 'CHOUEIFAT_VS_SIDON' },
    { label: 'Beirut Depot vs Tripoli Northern Depot', value: 'BEIRUT_VS_TRIPOLI' },
    { label: 'Top 3 Active Retail Locations', value: 'TOP_3_RETAIL' },
  ],
};

// --------------------------------------------------------------------------
// REUSABLE SUB-SCHEMAS FOR TRANSACTION MASTER & OPERATIONAL MODULES
// --------------------------------------------------------------------------
export const TODAY_LOCKED_DATE_FIELD: ReportFilterFieldConfig = {
  id: 'dateScope',
  label: 'Operational Date',
  type: 'select',
  defaultValue: 'TODAY',
  options: [
    { label: 'Today (Locked In-Session)', value: 'TODAY' },
  ],
};

export const INVOICE_TYPE_FILTER: ReportFilterFieldConfig = {
  id: 'invoiceType',
  label: 'Invoice Type',
  type: 'select',
  defaultValue: 'ALL',
  options: [
    { label: 'All Invoices (Consolidated)', value: 'ALL' },
    { label: 'POS Invoices', value: 'POS' },
    { label: 'Inventory Invoices', value: 'INVENTORY' },
    { label: 'Training Invoices', value: 'TRAINING' },
  ],
};

export const PAYMENT_TYPE_FILTER: ReportFilterFieldConfig = {
  id: 'paymentType',
  label: 'Payment Method / Tender',
  type: 'select',
  defaultValue: 'ALL',
  options: [
    { label: 'All Payment Types', value: 'ALL' },
    { label: 'Cash LBP', value: 'CASH_LBP' },
    { label: 'Cash USD', value: 'CASH_USD' },
    { label: 'Credit Card', value: 'CARD' },
    { label: 'Credit Card USD', value: 'CARD_USD' },
    { label: 'Credit / On Account', value: 'CREDIT' },
    { label: 'Mixed / Split Tender', value: 'MIXED' },
  ],
};

export const AUDIT_STATUS_FILTER: ReportFilterFieldConfig = {
  id: 'auditStatus',
  label: 'Audit Status',
  type: 'select',
  defaultValue: 'ALL',
  options: [
    { label: 'All Transactions (Standard)', value: 'ALL' },
    { label: 'Audited & Verified', value: 'AUDITED' },
    { label: 'Pending Audit', value: 'PENDING' },
    { label: 'Discrepancy / Flagged', value: 'FLAGGED' },
    { label: 'Voided / Cancelled', value: 'VOIDED' },
  ],
};

export const DEPARTMENT_CHANNEL_FILTER: ReportFilterFieldConfig = {
  id: 'departmentChannel',
  label: 'Department / Channel',
  type: 'select',
  defaultValue: 'ALL',
  options: [
    { label: 'Show All', value: 'ALL' },
    { label: 'Local', value: 'LOCAL' },
    { label: 'International', value: 'INTERNATIONAL' },
    { label: 'Online', value: 'ONLINE' },
  ],
};

// ============================================================================
// DUPLICATE INVOICES: MASTER TRANSACTION ENGINE FILTER PRESETS
// ============================================================================

export const PRIMARY_TRANSACTION_MODE_FIELD: ReportFilterFieldConfig = {
  id: 'primaryMode',
  label: 'Transaction Mode / View',
  type: 'select',
  defaultValue: 'Duplicate Invoices',
  options: [
    { label: 'Transactions by Salesman', value: 'Transactions by Salesman' },
    { label: 'Transactions by Date', value: 'Transactions by Date' },
    { label: 'Transactions by Employees by Payment', value: 'Transactions by Employees by Payment' },
    { label: 'Transactions by Customers by Employee', value: 'Transactions by Customers by Employee' },
    { label: 'Transactions by Invoice Number', value: 'Transactions by Invoice Number' },
    { label: 'Duplicate Invoices', value: 'Duplicate Invoices' },
    { label: 'Transactions by Date by Payments', value: 'Transactions by Date by Payments' },
    { label: 'Transactions by Customers', value: 'Transactions by Customers' },
    { label: 'Transactions by Customers by Groups', value: 'Transactions by Customers by Groups' },
    { label: 'Transactions by Customers details', value: 'Transactions by Customers details' },
    { label: 'Transactions by Workstation', value: 'Transactions by Workstation' },
    { label: 'Transactions by Employees', value: 'Transactions by Employees' },
    { label: 'Transactions By Source', value: 'Transactions By Source' },
  ],
};

export const SALESMAN_DROPDOWN_FILTER: ReportFilterFieldConfig = {
  id: 'salesman',
  label: 'Salesman Dropdown',
  type: 'select',
  defaultValue: 'ALL',
  options: [
    { label: 'All Salesmen', value: 'ALL' },
    { label: 'Ahmad Al-Hajj (Senior Rep)', value: 'REP_AHMAD' },
    { label: 'Maya Khoury (Corporate Accounts)', value: 'REP_MAYA' },
    { label: 'Jad Tannous (Regional Wholesale)', value: 'REP_JAD' },
    { label: 'Rania Eid (Commercial Supervisor)', value: 'REP_RANIA' },
    { label: 'Ziad Chehab (Key Account Manager)', value: 'REP_ZIAD' },
  ],
};

export const PAYMENT_TYPES_MASTER_FILTER: ReportFilterFieldConfig = {
  id: 'paymentType',
  label: 'All Payment Types',
  type: 'select',
  defaultValue: 'ALL',
  options: [
    { label: 'All Payment Types', value: 'ALL' },
    { label: 'Cash LBP', value: 'CASH_LBP' },
    { label: 'Cash USD', value: 'CASH_USD' },
    { label: 'Cash EUR', value: 'CASH_EUR' },
    { label: 'Credit Card LBP', value: 'CARD_LBP' },
    { label: 'Credit Card USD', value: 'CARD_USD' },
    { label: 'Credit Card EUR', value: 'CARD_EUR' },
    { label: 'Credit on Account', value: 'CREDIT_ACCOUNT' },
    { label: 'Mixed / Split Tender', value: 'SPLIT' },
    { label: 'Whish Money / E-Wallets', value: 'WHISH' },
    { label: 'All USD Transactions', value: 'USD' },
    { label: 'All LBP Transactions', value: 'LBP' },
    { label: 'All EUR Transactions', value: 'EUR' },
    { label: 'Cash (All Currencies)', value: 'CASH' },
    { label: 'Credit Card (All Currencies)', value: 'CARD' },
    { label: 'Credit (Legacy)', value: 'CREDIT' },
  ],
};

export const CURRENCY_MASTER_FILTER: ReportFilterFieldConfig = {
  id: 'currency',
  label: 'Target Currency',
  type: 'select',
  defaultValue: 'ALL',
  options: [
    { label: 'All Currencies (Native)', value: 'ALL' },
    { label: 'USD ($) - US Dollar', value: 'USD' },
    { label: 'LBP (LBP) - Lebanese Pound', value: 'LBP' },
    { label: 'EUR (€) - Euro', value: 'EUR' },
    { label: 'GBP (£) - British Pound', value: 'GBP' },
  ],
};

export const AUDIT_FLAGS_FILTER: ReportFilterFieldConfig = {
  id: 'auditFlags',
  label: 'Filters Dropdown',
  type: 'select',
  defaultValue: 'ALL',
  options: [
    { label: 'All Invoices (Standard)', value: 'ALL' },
    { label: 'Show Refund', value: 'SHOW_REFUND' },
    { label: 'Show Zero Invoices', value: 'SHOW_ZERO' },
    { label: 'Show Discount', value: 'SHOW_DISCOUNT' },
    { label: 'Show Top 10 Invoices by Amount', value: 'SHOW_TOP_10' },
    { label: 'Show Zero Tax', value: 'SHOW_ZERO_TAX' },
  ],
};

export const SHOW_RATE_CHECKBOX: ReportFilterFieldConfig = {
  id: 'showRate',
  label: 'Show Rate',
  type: 'checkbox',
  defaultValue: true,
};

export const GROUP_BY_DATE_CHECKBOX: ReportFilterFieldConfig = {
  id: 'groupByDate',
  label: 'Group by Date',
  type: 'checkbox',
  defaultValue: true,
};

export const REAL_DATE_CHECKBOX: ReportFilterFieldConfig = {
  id: 'realDate',
  label: 'Real Date',
  type: 'checkbox',
  defaultValue: false,
};

export const EMPLOYEE_SELECTOR_FILTER: ReportFilterFieldConfig = {
  id: 'employee',
  label: 'Employee Selector',
  type: 'select',
  defaultValue: 'ALL',
  options: [
    { label: 'All Employees & Cashiers', value: 'ALL' },
    { label: 'Ahmad Al-Hajj', value: 'EMP_AHMAD' },
    { label: 'Maya Khoury', value: 'EMP_MAYA' },
    { label: 'Jad Tannous', value: 'EMP_JAD' },
    { label: 'Nour Saliba', value: 'EMP_NOUR' },
    { label: 'Rania Eid', value: 'EMP_RANIA' },
  ],
};

export const CUSTOMER_ACCOUNT_SEARCH_FILTER: ReportFilterFieldConfig = {
  id: 'customerAccount',
  label: 'Customer Account Search',
  type: 'text',
  placeholder: 'Search customer name or ID...',
};

export const FROM_INVOICE_NO_FIELD: ReportFilterFieldConfig = {
  id: 'fromInvoiceNo',
  label: 'From Invoice #',
  type: 'text',
  placeholder: 'e.g. 100001',
};

export const TO_INVOICE_NO_FIELD: ReportFilterFieldConfig = {
  id: 'toInvoiceNo',
  label: 'To Invoice #',
  type: 'text',
  placeholder: 'e.g. 100500',
};

export const SHOW_ZERO_TAX_CHECKBOX: ReportFilterFieldConfig = {
  id: 'showZeroTax',
  label: 'Show Zero Tax',
  type: 'checkbox',
  defaultValue: false,
};

export const SUMMARY_CHECKBOX: ReportFilterFieldConfig = {
  id: 'summaryView',
  label: 'Summary',
  type: 'checkbox',
  defaultValue: false,
};

export const CUSTOMER_SEARCH_FILTER: ReportFilterFieldConfig = {
  id: 'customerSearch',
  label: 'Customer Search',
  type: 'text',
  placeholder: 'Search customer name or ID...',
};

export const VAT_FILTER: ReportFilterFieldConfig = {
  id: 'vatStatus',
  label: 'VAT Filter',
  type: 'select',
  defaultValue: 'ALL',
  options: [
    { label: 'All', value: 'ALL' },
    { label: 'With VAT', value: 'WITH_VAT' },
    { label: 'Without VAT', value: 'WITHOUT_VAT' },
  ],
};

export const CUSTOMER_GROUP_FILTER: ReportFilterFieldConfig = {
  id: 'customerGroup',
  label: 'Customer Group Dropdown',
  type: 'select',
  defaultValue: 'ALL',
  options: [
    { label: 'All Customer Groups', value: 'ALL' },
    { label: 'Wholesale Depot Accounts', value: 'WHOLESALE' },
    { label: 'Retail Walk-in Consumers', value: 'RETAIL' },
    { label: 'Key Accounts & Hypermarkets', value: 'KEY_ACCOUNTS' },
    { label: 'Hospitality & Horeca Clients', value: 'HORECA' },
  ],
};

export const SERVER_CASHIER_SEARCH_FILTER: ReportFilterFieldConfig = {
  id: 'serverCashier',
  label: 'All Servers / Cashiers Search',
  type: 'select',
  defaultValue: 'ALL',
  options: [
    { label: 'All Servers & Cashiers', value: 'ALL' },
    { label: 'Ahmad Al-Hajj', value: 'EMP_AHMAD' },
    { label: 'Maya Khoury', value: 'EMP_MAYA' },
    { label: 'Jad Tannous', value: 'EMP_JAD' },
    { label: 'Nour Saliba', value: 'EMP_NOUR' },
    { label: 'Rania Eid', value: 'EMP_RANIA' },
  ],
};

export const GROUP_BY_SERVER_CHECKBOX: ReportFilterFieldConfig = {
  id: 'groupByServer',
  label: 'Group by Server',
  type: 'checkbox',
  defaultValue: true,
};

export function getDuplicateInvoicesModeFilters(mode: string): ReportFilterFieldConfig[] {
  const config = getDuplicateInvoiceConfig(mode);
  const fields: ReportFilterFieldConfig[] = [];

  // Active filters driven by DUPLICATE_INVOICES_REGISTRY
  if (config.activeFilters.period) {
    fields.push(STANDARD_DATE_RANGE_FIELD);
  }
  if (config.activeFilters.branch) {
    fields.push(STANDARD_BRANCH_FIELD);
  }
  if (config.activeFilters.invoiceType) {
    fields.push(INVOICE_TYPE_FILTER);
  }
  if (config.activeFilters.departmentSelect) {
    fields.push(DEPARTMENT_CHANNEL_FILTER);
  }
  if (config.activeFilters.paymentType) {
    fields.push(PAYMENT_TYPES_MASTER_FILTER);
  }
  if (config.activeFilters.salesmanSelector) {
    fields.push(SALESMAN_DROPDOWN_FILTER);
  }
  if (config.activeFilters.serverSelector) {
    fields.push(SERVER_CASHIER_SEARCH_FILTER);
  }
  if (config.activeFilters.customerSearch) {
    fields.push(CUSTOMER_SEARCH_FILTER);
  }
  if (config.activeFilters.invoiceRange) {
    fields.push(FROM_INVOICE_NO_FIELD);
    fields.push(TO_INVOICE_NO_FIELD);
  }
  if (config.activeFilters.vatSelector) {
    fields.push(VAT_FILTER);
  }
  if (config.activeFilters.auditFilters) {
    fields.push(AUDIT_FLAGS_FILTER);
  }

  // Checkboxes driven by DUPLICATE_INVOICES_REGISTRY
  if (config.checkboxes.showRate) {
    fields.push(SHOW_RATE_CHECKBOX);
  }
  if (config.checkboxes.groupDate) {
    fields.push(GROUP_BY_DATE_CHECKBOX);
  }
  if (config.checkboxes.realDate) {
    fields.push(REAL_DATE_CHECKBOX);
  }
  if (config.checkboxes.summary) {
    fields.push(SUMMARY_CHECKBOX);
  }
  if (config.checkboxes.groupedByServer) {
    fields.push(GROUP_BY_SERVER_CHECKBOX);
  }
  if (config.checkboxes.showZeroTax) {
    fields.push(SHOW_ZERO_TAX_CHECKBOX);
  }

  return fields;
}

// ============================================================================
// REPORT SCHEMAS REGISTRY
// ============================================================================

export const REPORT_CONFIG_REGISTRY: Record<string, ReportConfig> = {
  // --------------------------------------------------------------------------
  // 1. SALES CONTROL MODULE
  // --------------------------------------------------------------------------
  
  // Tax Summary: Show Date Range, Branch, Tax Rates. (Hide payment methods and categories)
  'Tax Summary': {
    reportKey: 'Tax Summary',
    reportTitle: 'Tax Summary & VAT Declaration Register',
    code: 'REP_SALES_004',
    module: 'sales',
    category: 'Taxes & Compliance',
    description: 'Lebanese Ministry of Finance VAT register and tax summary statements.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'taxRates',
        label: 'Tax Rates',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Tax Rates', value: 'ALL' },
          { label: 'Standard VAT (11%)', value: 'VAT_11' },
          { label: 'Reduced VAT (5%)', value: 'VAT_05' },
          { label: 'Zero-Rated / Exempt (0%)', value: 'EXEMPT' },
          { label: 'Export Tax Free (0%)', value: 'EXPORT' },
        ],
      },
      {
        id: 'vatDeclarationFormat',
        label: 'Declaration Output',
        type: 'select',
        defaultValue: 'MOF_STANDARD',
        options: [
          { label: 'Lebanese MoF Official Form', value: 'MOF_STANDARD' },
          { label: 'Detailed Tax Invoice Breakdown', value: 'DETAILED' },
          { label: 'Customs & Clearance Audit', value: 'CUSTOMS' },
        ],
      },
      {
        id: 'includeExemptSubtotal',
        label: 'Include Exempt Subtotals',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
  },

  // Summary of Voids: Show Date Range, Cashier/User select, Void Reason.
  'Summary of Voids': {
    reportKey: 'Summary of Voids',
    reportTitle: 'Summary of Voids & Transaction Cancellations',
    code: 'REP_SALES_003',
    module: 'sales',
    category: 'Audits & Corrections',
    description: 'Detailed cashier audit of post-sale ticket and line cancellations.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      {
        id: 'cashier',
        label: 'Cashier / User',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Cashiers & Users', value: 'ALL' },
          { label: 'Ahmad Al-Hajj (POS-01)', value: 'Ahmad Al-Hajj' },
          { label: 'Noura Haddad (POS-02)', value: 'Noura Haddad' },
          { label: 'Karem Assaf (POS-03)', value: 'Karem Assaf' },
          { label: 'Mohammad Zein (Supervisor)', value: 'Mohammad Zein' },
          { label: 'System Admin (Override)', value: 'Admin' },
        ],
      },
      {
        id: 'voidReason',
        label: 'Void Reason',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Void Reasons', value: 'ALL' },
          { label: 'Customer Changed Mind', value: 'CUSTOMER_CHANGED_MIND' },
          { label: 'Pricing / Barcode Scan Error', value: 'PRICING_ERROR' },
          { label: 'Damaged / Spilled Product', value: 'DAMAGED_ITEM' },
          { label: 'Duplicate Item Entry', value: 'DUPLICATE_SCAN' },
          { label: 'Order Cancellation Before Tender', value: 'ORDER_CANCELLED' },
          { label: 'Manager Forced Override', value: 'MANAGER_OVERRIDE' },
        ],
      },
      {
        id: 'minVoidAmount',
        label: 'Min Void Amount ($)',
        type: 'number',
        defaultValue: 0,
        placeholder: '0.00',
      },
      {
        id: 'flaggedOnly',
        label: 'Manager Flagged Only',
        type: 'checkbox',
        defaultValue: false,
      },
    ],
  },


  'Summary of Sales by Items': {
    reportKey: 'Summary of Sales by Items',
    reportTitle: 'Summary of Sales by Items & Products',
    code: 'REP_SALES_002',
    module: 'sales',
    category: 'Sales',
    description: 'Item sales volumes, unit revenues, weighted margins, and category contributions.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'itemCategory',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil (EVOO)', value: 'EVOO' },
          { label: 'Virgin Olive Oil', value: 'VOO' },
          { label: 'Glass Bottles (Retail 250ml-1L)', value: 'RETAIL_BOTTLES' },
          { label: 'Bulk Commercial Tins (17.5L)', value: 'BULK_TINS' },
          { label: 'Pomegranate Molasses & Specialty', value: 'SPECIALTY' },
        ],
      },
      {
        id: 'sortBy',
        label: 'Sort By',
        type: 'select',
        defaultValue: 'REVENUE_DESC',
        options: [
          { label: 'Gross Revenue (High to Low)', value: 'REVENUE_DESC' },
          { label: 'Units Sold (High to Low)', value: 'QTY_DESC' },
          { label: 'Profit Margin % (High to Low)', value: 'MARGIN_DESC' },
          { label: 'Product Name (A-Z)', value: 'NAME_ASC' },
        ],
      },
      {
        id: 'searchQuery',
        label: 'SKU or Item Search',
        type: 'text',
        placeholder: 'Search SKU or description...',
      },
    ],
  },

  'Summary of Refunds': {
    reportKey: 'Summary of Refunds',
    reportTitle: 'Summary of Refunds & Credit Notes',
    code: 'REP_SALES_005',
    module: 'sales',
    category: 'Audits & Corrections',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'refundMethod',
        label: 'Refund Tender',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Methods', value: 'ALL' },
          { label: 'Cash Reimbursement', value: 'CASH' },
          { label: 'Store Credit Voucher', value: 'CREDIT' },
          { label: 'Reversal to Whish Account', value: 'WHISH' },
        ],
      },
      {
        id: 'refundReason',
        label: 'Refund Reason',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Reasons', value: 'ALL' },
          { label: 'Quality Dissatisfaction', value: 'QUALITY' },
          { label: 'Packaging Defect', value: 'DEFECT' },
          { label: 'Billing Error', value: 'BILLING' },
        ],
      },
    ],
  },
  'Summary of refunds': {
    reportKey: 'Summary of refunds',
    reportTitle: 'Summary of Refunds & Credit Notes',
    code: 'REP_SALES_005',
    module: 'sales',
    category: 'Audits & Corrections',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'refundMethod',
        label: 'Refund Tender',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Methods', value: 'ALL' },
          { label: 'Cash Reimbursement', value: 'CASH' },
          { label: 'Store Credit Voucher', value: 'CREDIT' },
          { label: 'Reversal to Whish Account', value: 'WHISH' },
        ],
      },
      {
        id: 'refundReason',
        label: 'Refund Reason',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Reasons', value: 'ALL' },
          { label: 'Quality Dissatisfaction', value: 'QUALITY' },
          { label: 'Packaging Defect', value: 'DEFECT' },
          { label: 'Billing Error', value: 'BILLING' },
        ],
      },
    ],
  },
  'Summary of voids': {
    reportKey: 'Summary of voids',
    reportTitle: 'Summary of Voids & Transaction Cancellations',
    code: 'REP_SALES_003',
    module: 'sales',
    category: 'Audits & Corrections',
    description: 'Detailed cashier audit of post-sale ticket and line cancellations.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      {
        id: 'cashier',
        label: 'Cashier / User',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Cashiers & Users', value: 'ALL' },
          { label: 'Ahmad Al-Hajj (POS-01)', value: 'Ahmad Al-Hajj' },
          { label: 'Noura Haddad (POS-02)', value: 'Noura Haddad' },
          { label: 'Karem Assaf (POS-03)', value: 'Karem Assaf' },
          { label: 'Mohammad Zein (Supervisor)', value: 'Mohammad Zein' },
          { label: 'System Admin (Override)', value: 'Admin' },
        ],
      },
      {
        id: 'voidReason',
        label: 'Void Reason',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Void Reasons', value: 'ALL' },
          { label: 'Customer Changed Mind', value: 'CUSTOMER_CHANGED_MIND' },
          { label: 'Pricing / Barcode Scan Error', value: 'PRICING_ERROR' },
          { label: 'Damaged / Spilled Product', value: 'DAMAGED_ITEM' },
          { label: 'Duplicate Item Entry', value: 'DUPLICATE_SCAN' },
          { label: 'Order Cancellation Before Tender', value: 'ORDER_CANCELLED' },
          { label: 'Manager Forced Override', value: 'MANAGER_OVERRIDE' },
        ],
      },
      {
        id: 'minVoidAmount',
        label: 'Min Void Amount ($)',
        type: 'number',
        defaultValue: 0,
        placeholder: '0.00',
      },
      {
        id: 'flaggedOnly',
        label: 'Manager Flagged Only',
        type: 'checkbox',
        defaultValue: false,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // INTERNAL CONTROL & AUDIT SCHEMAS (SECURITY & CONTROL AUDIT)
  // --------------------------------------------------------------------------

  // 1. No Sale Report (Drawer Openings without Transaction)
  'No Sale Report': {
    reportKey: 'No Sale Report',
    reportTitle: 'No Sale & Drawer Openings Audit Log',
    code: 'REP_S_00190',
    module: 'sales',
    category: 'Internal Control',
    description: 'Security register tracking non-transaction cash drawer manual pop events.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'cashier',
        label: 'Cashier / User',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Cashiers & Staff', value: 'ALL' },
          { label: 'Ahmad Al-Hajj (POS-01)', value: 'Ahmad Al-Hajj' },
          { label: 'Noura Haddad (POS-02)', value: 'Noura Haddad' },
          { label: 'Karem Assaf (POS-03)', value: 'Karem Assaf' },
          { label: 'Mohammad Zein (Supervisor)', value: 'Mohammad Zein' },
          { label: 'System Admin (Override)', value: 'Admin' },
        ],
      },
      {
        id: 'workstation',
        label: 'POS Terminal / Workstation ID',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All POS Terminals', value: 'ALL' },
          { label: 'POS Terminal 01 (Front Register)', value: 'POS-01' },
          { label: 'POS Terminal 02 (Deli & Bulk Counter)', value: 'POS-02' },
          { label: 'POS Terminal 03 (Drive-Thru / Express)', value: 'POS-03' },
          { label: 'POS Terminal 04 (Warehouse Dispatch)', value: 'POS-04' },
        ],
      },
      {
        id: 'openReason',
        label: 'Open Reason',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Open Reasons', value: 'ALL' },
          { label: 'Making Change / Customer Breakdown', value: 'CHANGE' },
          { label: 'Drawer Audit / Cash Inspection', value: 'AUDIT' },
          { label: 'Hardware Maintenance / Jam Clearance', value: 'MAINTENANCE' },
          { label: 'Cash Drop / Vault Skim', value: 'CASH_DROP' },
          { label: 'End-of-Day Balancing', value: 'EOD_BALANCE' },
        ],
      },
    ],
  },
  'No Sale': {
    reportKey: 'No Sale',
    reportTitle: 'No Sale & Drawer Openings Audit Log',
    code: 'REP_S_00190',
    module: 'sales',
    category: 'Internal Control',
    description: 'Security register tracking non-transaction cash drawer manual pop events.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'cashier',
        label: 'Cashier / User',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Cashiers & Staff', value: 'ALL' },
          { label: 'Ahmad Al-Hajj (POS-01)', value: 'Ahmad Al-Hajj' },
          { label: 'Noura Haddad (POS-02)', value: 'Noura Haddad' },
          { label: 'Karem Assaf (POS-03)', value: 'Karem Assaf' },
          { label: 'Mohammad Zein (Supervisor)', value: 'Mohammad Zein' },
          { label: 'System Admin (Override)', value: 'Admin' },
        ],
      },
      {
        id: 'workstation',
        label: 'POS Terminal / Workstation ID',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All POS Terminals', value: 'ALL' },
          { label: 'POS Terminal 01 (Front Register)', value: 'POS-01' },
          { label: 'POS Terminal 02 (Deli & Bulk Counter)', value: 'POS-02' },
          { label: 'POS Terminal 03 (Drive-Thru / Express)', value: 'POS-03' },
          { label: 'POS Terminal 04 (Warehouse Dispatch)', value: 'POS-04' },
        ],
      },
      {
        id: 'openReason',
        label: 'Open Reason',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Open Reasons', value: 'ALL' },
          { label: 'Making Change / Customer Breakdown', value: 'CHANGE' },
          { label: 'Drawer Audit / Cash Inspection', value: 'AUDIT' },
          { label: 'Hardware Maintenance / Jam Clearance', value: 'MAINTENANCE' },
          { label: 'Cash Drop / Vault Skim', value: 'CASH_DROP' },
          { label: 'End-of-Day Balancing', value: 'EOD_BALANCE' },
        ],
      },
    ],
  },

  // 2. User Log Report (Security & Access Audit)
  'User Log Report': {
    reportKey: 'User Log Report',
    reportTitle: 'User Log & Security Audit Trail',
    code: 'REP_S_00192',
    module: 'sales',
    category: 'Internal Control',
    description: 'Chronological security audit trail recording authentication, permissions, and administrative overrides.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'userAccount',
        label: 'User / Staff Account',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Staff Accounts', value: 'ALL' },
          { label: 'Ahmad Al-Hajj (Cashier)', value: 'ahmad.hajj' },
          { label: 'Noura Haddad (Cashier)', value: 'noura.haddad' },
          { label: 'Karem Assaf (Cashier)', value: 'karem.assaf' },
          { label: 'Mohammad Zein (Branch Supervisor)', value: 'mohammad.zein' },
          { label: 'Layla Chami (Inventory Lead)', value: 'layla.chami' },
          { label: 'System Administrator (Root)', value: 'admin' },
        ],
      },
      {
        id: 'actionType',
        label: 'Event / Action Type',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Action Types', value: 'ALL' },
          { label: 'Login', value: 'LOGIN' },
          { label: 'Logout', value: 'LOGOUT' },
          { label: 'Drawer Open', value: 'DRAWER_OPEN' },
          { label: 'Price Override', value: 'PRICE_OVERRIDE' },
          { label: 'Discount Applied', value: 'DISCOUNT_APPLIED' },
          { label: 'Session Timeout', value: 'SESSION_TIMEOUT' },
        ],
      },
      {
        id: 'deviceIp',
        label: 'Terminal / Device IP',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Terminals & Devices', value: 'ALL' },
          { label: 'POS-01 (192.168.1.101)', value: '192.168.1.101' },
          { label: 'POS-02 (192.168.1.102)', value: '192.168.1.102' },
          { label: 'POS-03 (192.168.1.103)', value: '192.168.1.103' },
          { label: 'Server Console (192.168.1.10)', value: '192.168.1.10' },
          { label: 'Manager Tablet (192.168.1.150)', value: '192.168.1.150' },
        ],
      },
    ],
  },
  'User Log': {
    reportKey: 'User Log',
    reportTitle: 'User Log & Security Audit Trail',
    code: 'REP_S_00192',
    module: 'sales',
    category: 'Internal Control',
    description: 'Chronological security audit trail recording authentication, permissions, and administrative overrides.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'userAccount',
        label: 'User / Staff Account',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Staff Accounts', value: 'ALL' },
          { label: 'Ahmad Al-Hajj (Cashier)', value: 'ahmad.hajj' },
          { label: 'Noura Haddad (Cashier)', value: 'noura.haddad' },
          { label: 'Karem Assaf (Cashier)', value: 'karem.assaf' },
          { label: 'Mohammad Zein (Branch Supervisor)', value: 'mohammad.zein' },
          { label: 'Layla Chami (Inventory Lead)', value: 'layla.chami' },
          { label: 'System Administrator (Root)', value: 'admin' },
        ],
      },
      {
        id: 'actionType',
        label: 'Event / Action Type',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Action Types', value: 'ALL' },
          { label: 'Login', value: 'LOGIN' },
          { label: 'Logout', value: 'LOGOUT' },
          { label: 'Drawer Open', value: 'DRAWER_OPEN' },
          { label: 'Price Override', value: 'PRICE_OVERRIDE' },
          { label: 'Discount Applied', value: 'DISCOUNT_APPLIED' },
          { label: 'Session Timeout', value: 'SESSION_TIMEOUT' },
        ],
      },
      {
        id: 'deviceIp',
        label: 'Terminal / Device IP',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Terminals & Devices', value: 'ALL' },
          { label: 'POS-01 (192.168.1.101)', value: '192.168.1.101' },
          { label: 'POS-02 (192.168.1.102)', value: '192.168.1.102' },
          { label: 'POS-03 (192.168.1.103)', value: '192.168.1.103' },
          { label: 'Server Console (192.168.1.10)', value: '192.168.1.10' },
          { label: 'Manager Tablet (192.168.1.150)', value: '192.168.1.150' },
        ],
      },
    ],
  },

  // 3. Duplicate Invoice Report (Reprinted Bills Audit)
  'Duplicate Invoice Report': {
    reportKey: 'Duplicate Invoice Report',
    reportTitle: 'Duplicate Invoices & Bill Reprint Audit',
    code: 'REP_S_00188',
    module: 'sales',
    category: 'Internal Control',
    description: 'Audit log of reprinted customer bills, re-issuance counters, and duplicate ticket verification.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'invoiceNumber',
        label: 'Original Invoice #',
        type: 'text',
        placeholder: 'e.g. 102971',
      },
      {
        id: 'reprintedBy',
        label: 'Reprinted By (Cashier / User)',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Cashiers & Users', value: 'ALL' },
          { label: 'Ahmad Al-Hajj (POS-01)', value: 'Ahmad Al-Hajj' },
          { label: 'Noura Haddad (POS-02)', value: 'Noura Haddad' },
          { label: 'Karem Assaf (POS-03)', value: 'Karem Assaf' },
          { label: 'Mohammad Zein (Supervisor)', value: 'Mohammad Zein' },
          { label: 'System Admin (Override)', value: 'Admin' },
        ],
      },
      {
        id: 'printCountThreshold',
        label: 'Print Count Threshold',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Duplicates (≥ 2 prints)', value: 'ALL' },
          { label: '> 1 Reprint (≥ 2 prints)', value: '>1' },
          { label: '> 2 Reprints (≥ 3 prints)', value: '>2' },
          { label: '> 3 Reprints (≥ 4 prints - High Risk)', value: '>3' },
          { label: '5+ Reprints (Critical Flag)', value: '>=5' },
        ],
      },
    ],
  },


  // 4. Discount Summary Report (Discount & Markdown Audit)
  'Discount Summary Report': {
    reportKey: 'Discount Summary Report',
    reportTitle: 'Discount Summary & Price Concession Audit',
    code: 'REP_S_00193',
    module: 'sales',
    category: 'Internal Control',
    description: 'Detailed audit ledger of promotional price concessions, manual cashier discounts, and supervisor approvals.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'discountType',
        label: 'Discount Type / Rule',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Discount Rules', value: 'ALL' },
          { label: 'Staff Discount', value: 'STAFF_DISCOUNT' },
          { label: 'Manager Override', value: 'MANAGER_OVERRIDE' },
          { label: 'Loyalty Promo', value: 'LOYALTY_PROMO' },
          { label: 'Damaged Goods', value: 'DAMAGED_GOODS' },
          { label: 'Wholesale Deal', value: 'WHOLESALE_DEAL' },
        ],
      },
      {
        id: 'authorizedBy',
        label: 'Authorized By (Manager ID)',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Authorizers', value: 'ALL' },
          { label: 'Mohammad Zein (MGR-01)', value: 'MGR-01' },
          { label: 'Fadi Khoury (MGR-02)', value: 'MGR-02' },
          { label: 'Layla Chami (MGR-03)', value: 'MGR-03' },
          { label: 'System Automated Rule', value: 'SYSTEM' },
        ],
      },
      {
        id: 'minDiscount',
        label: 'Min Discount Amount / %',
        type: 'number',
        defaultValue: 0,
        placeholder: '0.00',
      },
    ],
  },
  'Discount Summary': {
    reportKey: 'Discount Summary',
    reportTitle: 'Discount Summary & Price Concession Audit',
    code: 'REP_S_00193',
    module: 'sales',
    category: 'Internal Control',
    description: 'Detailed audit ledger of promotional price concessions, manual cashier discounts, and supervisor approvals.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'discountType',
        label: 'Discount Type / Rule',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Discount Rules', value: 'ALL' },
          { label: 'Staff Discount', value: 'STAFF_DISCOUNT' },
          { label: 'Manager Override', value: 'MANAGER_OVERRIDE' },
          { label: 'Loyalty Promo', value: 'LOYALTY_PROMO' },
          { label: 'Damaged Goods', value: 'DAMAGED_GOODS' },
          { label: 'Wholesale Deal', value: 'WHOLESALE_DEAL' },
        ],
      },
      {
        id: 'authorizedBy',
        label: 'Authorized By (Manager ID)',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Authorizers', value: 'ALL' },
          { label: 'Mohammad Zein (MGR-01)', value: 'MGR-01' },
          { label: 'Fadi Khoury (MGR-02)', value: 'MGR-02' },
          { label: 'Layla Chami (MGR-03)', value: 'MGR-03' },
          { label: 'System Automated Rule', value: 'SYSTEM' },
        ],
      },
      {
        id: 'minDiscount',
        label: 'Min Discount Amount / %',
        type: 'number',
        defaultValue: 0,
        placeholder: '0.00',
      },
    ],
  },

  // 5. Meter / Shift Reading Report
  'Meter / Shift Reading Report': {
    reportKey: 'Meter / Shift Reading Report',
    reportTitle: 'Meter & Shift Reading Register (Z-Report Audit)',
    code: 'REP_S_00189',
    module: 'sales',
    category: 'Internal Control',
    description: 'Fiscal cash register reading log, totalizer resets, shift reconciliations, and Z-report batches.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'workstation',
        label: 'Terminal / Workstation',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Terminals & Registers', value: 'ALL' },
          { label: 'POS-01 (Front Register)', value: 'POS-01' },
          { label: 'POS-02 (Deli & Bulk Counter)', value: 'POS-02' },
          { label: 'POS-03 (Express Counter)', value: 'POS-03' },
          { label: 'POS-04 (Warehouse Dispatch)', value: 'POS-04' },
        ],
      },
      {
        id: 'shiftBatch',
        label: 'Shift # / Z-Report Batch',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Shifts & Batches', value: 'ALL' },
          { label: 'Shift 1 (Morning Opening)', value: 'SHIFT_1' },
          { label: 'Shift 2 (Evening Peak)', value: 'SHIFT_2' },
          { label: 'Shift 3 (Night Closure)', value: 'SHIFT_3' },
          { label: 'Z-Report Final Batch', value: 'Z_FINAL' },
          { label: 'Mid-Day X-Reading Snapshot', value: 'X_READING' },
        ],
      },
    ],
  },
  'Meter Report': {
    reportKey: 'Meter Report',
    reportTitle: 'Meter & Shift Reading Register (Z-Report Audit)',
    code: 'REP_S_00189',
    module: 'sales',
    category: 'Internal Control',
    description: 'Fiscal cash register reading log, totalizer resets, shift reconciliations, and Z-report batches.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'workstation',
        label: 'Terminal / Workstation',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Terminals & Registers', value: 'ALL' },
          { label: 'POS-01 (Front Register)', value: 'POS-01' },
          { label: 'POS-02 (Deli & Bulk Counter)', value: 'POS-02' },
          { label: 'POS-03 (Express Counter)', value: 'POS-03' },
          { label: 'POS-04 (Warehouse Dispatch)', value: 'POS-04' },
        ],
      },
      {
        id: 'shiftBatch',
        label: 'Shift # / Z-Report Batch',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Shifts & Batches', value: 'ALL' },
          { label: 'Shift 1 (Morning Opening)', value: 'SHIFT_1' },
          { label: 'Shift 2 (Evening Peak)', value: 'SHIFT_2' },
          { label: 'Shift 3 (Night Closure)', value: 'SHIFT_3' },
          { label: 'Z-Report Final Batch', value: 'Z_FINAL' },
          { label: 'Mid-Day X-Reading Snapshot', value: 'X_READING' },
        ],
      },
    ],
  },

  // --------------------------------------------------------------------------
  // FINANCIAL REPORTS MODULE SCHEMAS
  // --------------------------------------------------------------------------

  // A. Statistics
  'Sales Summary': {
    reportKey: 'Sales Summary',
    reportTitle: 'Sales Summary & Revenue Performance Register',
    code: 'REP_S_00201',
    module: 'sales',
    category: 'Statistics',
    description: 'Executive revenue rollup by payment tenders, order fulfillment channels, and gross billings.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'paymentMethod',
        label: 'Payment Method',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Payment Methods', value: 'ALL' },
          { label: 'Cash Tender ($ / LBP)', value: 'CASH' },
          { label: 'Whish Money Transfer', value: 'WHISH' },
          { label: 'Credit Card / Visa POS', value: 'CARD' },
        ],
      },
      {
        id: 'orderType',
        label: 'Order Type',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Order Types', value: 'ALL' },
          { label: 'Takeaway Counter', value: 'TAKEAWAY' },
          { label: 'Direct Delivery', value: 'DELIVERY' },
          { label: 'POS / Dine-in', value: 'POS' },
          { label: 'Wholesale B2B Order', value: 'WHOLESALE' },
        ],
      },
    ],
  },

  'Statistics by Workstation': {
    reportKey: 'Statistics by Workstation',
    reportTitle: 'Workstation & Terminal Throughput Statistics',
    code: 'REP_S_00202',
    module: 'sales',
    category: 'Statistics',
    description: 'POS register load, throughput analysis, and shift revenue per lane.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'workstation',
        label: 'POS Terminal / Workstation ID',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Terminals', value: 'ALL' },
          { label: 'POS-01 (Front Register)', value: 'POS-01' },
          { label: 'POS-02 (Deli Counter)', value: 'POS-02' },
          { label: 'POS-03 (Express Counter)', value: 'POS-03' },
          { label: 'POS-04 (Warehouse Dispatch)', value: 'POS-04' },
        ],
      },
      {
        id: 'shiftBatch',
        label: 'Shift / Z-Report #',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Shifts & Batches', value: 'ALL' },
          { label: 'Shift 1 (Morning Opening)', value: 'SHIFT_1' },
          { label: 'Shift 2 (Evening Peak)', value: 'SHIFT_2' },
          { label: 'Shift 3 (Night Closure)', value: 'SHIFT_3' },
          { label: 'Z-Report Final Batch', value: 'Z_FINAL' },
        ],
      },
    ],
  },

  'Statistics by Department': {
    reportKey: 'Statistics by Department',
    reportTitle: 'Departmental & Divisional Sales Statistics',
    code: 'REP_S_00203',
    module: 'sales',
    category: 'Statistics',
    description: 'Category and division contributions to gross turnover.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'department',
        label: 'Department / Division',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Departments & Divisions', value: 'ALL' },
          { label: 'Olive Oil & Production', value: 'OLIVE_OIL' },
          { label: 'Bulk & Packaging', value: 'BULK_PACKAGING' },
          { label: 'Retail Grocery', value: 'RETAIL_GROCERY' },
          { label: 'Deli & Dairy', value: 'DELI_DAIRY' },
          { label: 'Household Goods', value: 'HOUSEHOLD' },
        ],
      },
    ],
  },

  'Summary of Sales by Employee': {
    reportKey: 'Summary of Sales by Employee',
    reportTitle: 'Employee & Cashier Sales Performance Register',
    code: 'REP_S_00204',
    module: 'sales',
    category: 'Statistics',
    description: 'Staff member billings, transaction count, ticket average, and cashier shift reconciliation.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'cashier',
        label: 'Employee / Cashier',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Staff Members', value: 'ALL' },
          { label: 'Ahmad Al-Hajj (Cashier POS-01)', value: 'Ahmad Al-Hajj' },
          { label: 'Noura Haddad (Cashier POS-02)', value: 'Noura Haddad' },
          { label: 'Karem Assaf (Cashier POS-03)', value: 'Karem Assaf' },
          { label: 'Mohammad Zein (Supervisor)', value: 'Mohammad Zein' },
          { label: 'Layla Chami (Inventory Lead)', value: 'Layla Chami' },
        ],
      },
      {
        id: 'roleShift',
        label: 'Role / Shift',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Roles & Shifts', value: 'ALL' },
          { label: 'Cashier - Morning Shift', value: 'CASHIER_MORNING' },
          { label: 'Cashier - Evening Shift', value: 'CASHIER_EVENING' },
          { label: 'Supervisor - Full Day', value: 'SUPERVISOR' },
          { label: 'Dispatch Driver / Courier', value: 'DISPATCH' },
        ],
      },
    ],
  },

  'Sales by Employee by Category': {
    reportKey: 'Sales by Employee by Category',
    reportTitle: 'Sales by Employee & Product Category Matrix',
    code: 'REP_S_00205',
    module: 'sales',
    category: 'Statistics',
    description: 'Cross-tabulation of cashier productivity by inventory merchandise department.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'cashier',
        label: 'Employee / Cashier',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Staff Members', value: 'ALL' },
          { label: 'Ahmad Al-Hajj', value: 'Ahmad Al-Hajj' },
          { label: 'Noura Haddad', value: 'Noura Haddad' },
          { label: 'Karem Assaf', value: 'Karem Assaf' },
          { label: 'Mohammad Zein', value: 'Mohammad Zein' },
        ],
      },
      {
        id: 'category',
        label: 'Item Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Infused & Flavored Oils', value: 'INFUSED_OILS' },
          { label: 'Pickles & Table Olives', value: 'PICKLES_OLIVES' },
          { label: 'Honey & Natural Preserves', value: 'HONEY_JAMS' },
          { label: 'Olive Oil Soap & Cosmetics', value: 'COSMETICS' },
        ],
      },
    ],
  },

  'Sales by Supplier': {
    reportKey: 'Sales by Supplier',
    reportTitle: 'Supplier Sales Turnover & Vendor Concession Report',
    code: 'REP_S_00206',
    module: 'sales',
    category: 'Statistics',
    description: 'Vendor product velocity, supplier commission basis, and consignment turnover.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'supplier',
        label: 'Supplier Name',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Suppliers & Farms', value: 'ALL' },
          { label: 'Al-Janoub Agro Farming Coop', value: 'SUP_001' },
          { label: 'Chouf Mills & Presses', value: 'SUP_002' },
          { label: 'Batroun Packaging Supplies', value: 'SUP_003' },
          { label: 'Tripoli Glassworks & Bottles', value: 'SUP_004' },
        ],
      },
      {
        id: 'categoryBrand',
        label: 'Item Category / Brand',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories & Brands', value: 'ALL' },
          { label: 'Southern Olive Prime Label', value: 'SOUTHERN_OLIVE' },
          { label: 'Artisan Olive Wood Crafts', value: 'WOOD_CRAFTS' },
          { label: 'Regional Gourmet Goods', value: 'REGIONAL_GOURMET' },
        ],
      },
    ],
  },

  'Delivery Orders by Date and Branch': {
    reportKey: 'Delivery Orders by Date and Branch',
    reportTitle: 'Delivery Orders & Dispatch Route Register',
    code: 'REP_S_00207',
    module: 'sales',
    category: 'Statistics',
    description: 'Courier dispatch logs, delivery destination performance, and route settlement.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'driver',
        label: 'Delivery Driver / Courier',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Drivers & Couriers', value: 'ALL' },
          { label: 'Ali Saad (Supersonic Courier)', value: 'ALI_SAAD' },
          { label: 'Fadi Abboud (Express Van)', value: 'FADI_ABBOUD' },
          { label: 'Hassan Saleh (Van Fleet-01)', value: 'HASSAN_SALEH' },
          { label: 'Whish Express Delivery Partner', value: 'WHISH_EXPRESS' },
        ],
      },
      {
        id: 'routeZone',
        label: 'Delivery Zone / Route',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Delivery Zones', value: 'ALL' },
          { label: 'Greater Beirut Area', value: 'BEIRUT' },
          { label: 'Chouf & Mountain Area', value: 'CHOUF' },
          { label: 'Saida & South Lebanon Highway', value: 'SOUTH' },
          { label: 'North Expressway (Tripoli Hub)', value: 'NORTH' },
        ],
      },
      {
        id: 'deliveryStatus',
        label: 'Delivery Status',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Delivery Statuses', value: 'ALL' },
          { label: 'Pending Dispatch', value: 'PENDING' },
          { label: 'In Transit / Dispatched', value: 'DISPATCHED' },
          { label: 'Delivered & Collected', value: 'DELIVERED' },
          { label: 'Returned / Cancelled', value: 'RETURNED' },
        ],
      },
    ],
  },
  'Delivery Orders by Date & Branch Register': {
    reportKey: 'Delivery Orders by Date & Branch Register',
    reportTitle: 'Delivery Orders & Dispatch Route Register',
    code: 'REP_S_00207',
    module: 'sales',
    category: 'Statistics',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'driver',
        label: 'Delivery Driver / Courier',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Drivers & Couriers', value: 'ALL' },
          { label: 'Ali Saad (Supersonic Courier)', value: 'ALI_SAAD' },
          { label: 'Fadi Abboud (Express Van)', value: 'FADI_ABBOUD' },
          { label: 'Hassan Saleh (Van Fleet-01)', value: 'HASSAN_SALEH' },
          { label: 'Whish Express Delivery Partner', value: 'WHISH_EXPRESS' },
        ],
      },
      {
        id: 'routeZone',
        label: 'Delivery Zone / Route',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Delivery Zones', value: 'ALL' },
          { label: 'Greater Beirut Area', value: 'BEIRUT' },
          { label: 'Chouf & Mountain Area', value: 'CHOUF' },
          { label: 'Saida & South Lebanon Highway', value: 'SOUTH' },
          { label: 'North Expressway (Tripoli Hub)', value: 'NORTH' },
        ],
      },
      {
        id: 'deliveryStatus',
        label: 'Delivery Status',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Delivery Statuses', value: 'ALL' },
          { label: 'Pending Dispatch', value: 'PENDING' },
          { label: 'In Transit / Dispatched', value: 'DISPATCHED' },
          { label: 'Delivered & Collected', value: 'DELIVERED' },
          { label: 'Returned / Cancelled', value: 'RETURNED' },
        ],
      },
    ],
  },

  // B. Tax Reports
  'Tax Summary Comparative': {
    reportKey: 'Tax Summary Comparative',
    reportTitle: 'Tax Summary Comparative Statement',
    code: 'REP_S_00211',
    module: 'sales',
    category: 'Taxes & Compliance',
    description: 'Multi-period Lebanese VAT comparison statement with variance auditing.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'comparisonPeriod',
        label: 'Compare Against Period',
        type: 'select',
        defaultValue: 'PREV_MONTH',
        options: [
          { label: 'Previous Month (MoM)', value: 'PREV_MONTH' },
          { label: 'Same Period Last Year (YoY)', value: 'PREV_YEAR' },
          { label: 'Previous Quarter (QoQ)', value: 'PREV_QUARTER' },
        ],
      },
      {
        id: 'taxRates',
        label: 'Tax Rates',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Tax Rates', value: 'ALL' },
          { label: 'Standard VAT (11%)', value: 'VAT_11' },
          { label: 'Reduced VAT (5%)', value: 'VAT_05' },
          { label: 'Zero-Rated / Exempt (0%)', value: 'EXEMPT' },
        ],
      },
      {
        id: 'vatDeclarationFormat',
        label: 'Declaration Output',
        type: 'select',
        defaultValue: 'MOF_STANDARD',
        options: [
          { label: 'Lebanese MoF Official Form', value: 'MOF_STANDARD' },
          { label: 'Detailed Tax Invoice Breakdown', value: 'DETAILED' },
        ],
      },
      {
        id: 'includeExemptSubtotal',
        label: 'Include Exempt Subtotals',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
  },

  // C. Discount Reports
  'Summary of Discount by Divisions': {
    reportKey: 'Summary of Discount by Divisions',
    reportTitle: 'Summary of Discount by Divisions',
    code: 'REP_S_00212',
    module: 'sales',
    category: 'Discounts',
    description: 'Price concession audit aggregated across corporate commercial divisions.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'division',
        label: 'Division',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Divisions', value: 'ALL' },
          { label: 'Retail Store Counter', value: 'RETAIL' },
          { label: 'Wholesale Depot', value: 'WHOLESALE' },
          { label: 'E-Commerce Direct', value: 'ECOMMERCE' },
          { label: 'Catering & Hospitality', value: 'CATERING' },
        ],
      },
      {
        id: 'discountType',
        label: 'Discount Type / Reason',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Discount Reasons', value: 'ALL' },
          { label: 'Promotional Campaign', value: 'PROMO' },
          { label: 'Bulk Tier Discount', value: 'BULK_TIER' },
          { label: 'Damaged Packaging Markdown', value: 'DAMAGED' },
          { label: 'Staff Courtesy Markdown', value: 'STAFF_COURTESY' },
        ],
      },
    ],
  },

  'Discount By Category by Department': {
    reportKey: 'Discount By Category by Department',
    reportTitle: 'Discount by Category by Department',
    code: 'REP_S_00213',
    module: 'sales',
    category: 'Discounts',
    description: 'Hierarchical breakdown of markdowns grouped by department and category.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'department',
        label: 'Department',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Departments', value: 'ALL' },
          { label: 'Olive Oil Division', value: 'OLIVE_OIL' },
          { label: 'Pantry & Gourmet Delicacies', value: 'PANTRY' },
          { label: 'Soap & Herbal Cosmetics', value: 'COSMETICS' },
          { label: 'Gift Baskets & Hampers', value: 'GIFTS' },
        ],
      },
      {
        id: 'category',
        label: 'Item Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Pure Olive Oil', value: 'PURE' },
          { label: 'Olive Tapenades & Spreads', value: 'SPREADS' },
          { label: 'Handmade Soap Bars', value: 'SOAP' },
        ],
      },
    ],
  },
  'Discount by Category by Department': {
    reportKey: 'Discount by Category by Department',
    reportTitle: 'Discount by Category by Department',
    code: 'REP_S_00213',
    module: 'sales',
    category: 'Discounts',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'department',
        label: 'Department',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Departments', value: 'ALL' },
          { label: 'Olive Oil Division', value: 'OLIVE_OIL' },
          { label: 'Pantry & Gourmet Delicacies', value: 'PANTRY' },
          { label: 'Soap & Herbal Cosmetics', value: 'COSMETICS' },
          { label: 'Gift Baskets & Hampers', value: 'GIFTS' },
        ],
      },
      {
        id: 'category',
        label: 'Item Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Pure Olive Oil', value: 'PURE' },
          { label: 'Olive Tapenades & Spreads', value: 'SPREADS' },
          { label: 'Handmade Soap Bars', value: 'SOAP' },
        ],
      },
    ],
  },

  'Discount By Description by Employee': {
    reportKey: 'Discount By Description by Employee',
    reportTitle: 'Discount by Description by Employee',
    code: 'REP_S_00215',
    module: 'sales',
    category: 'Discounts',
    description: 'Cashier markdown behavior classified by authorization reason notes.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'cashier',
        label: 'Employee / Cashier',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Staff Members', value: 'ALL' },
          { label: 'Ahmad Al-Hajj', value: 'Ahmad Al-Hajj' },
          { label: 'Noura Haddad', value: 'Noura Haddad' },
          { label: 'Karem Assaf', value: 'Karem Assaf' },
          { label: 'Mohammad Zein', value: 'Mohammad Zein' },
        ],
      },
      {
        id: 'discountDescription',
        label: 'Discount Reason / Description',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Descriptions & Reasons', value: 'ALL' },
          { label: 'Manager Loyalty Override', value: 'MGR_LOYALTY' },
          { label: 'Friends & Family Courtesy', value: 'FAMILY' },
          { label: 'End of Batch Clearance', value: 'CLEARANCE' },
          { label: 'Counter Courtesy Concession', value: 'COURTESY' },
        ],
      },
    ],
  },
  'Discount by Description by Employee': {
    reportKey: 'Discount by Description by Employee',
    reportTitle: 'Discount by Description by Employee',
    code: 'REP_S_00215',
    module: 'sales',
    category: 'Discounts',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'cashier',
        label: 'Employee / Cashier',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Staff Members', value: 'ALL' },
          { label: 'Ahmad Al-Hajj', value: 'Ahmad Al-Hajj' },
          { label: 'Noura Haddad', value: 'Noura Haddad' },
          { label: 'Karem Assaf', value: 'Karem Assaf' },
          { label: 'Mohammad Zein', value: 'Mohammad Zein' },
        ],
      },
      {
        id: 'discountDescription',
        label: 'Discount Reason / Description',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Descriptions & Reasons', value: 'ALL' },
          { label: 'Manager Loyalty Override', value: 'MGR_LOYALTY' },
          { label: 'Friends & Family Courtesy', value: 'FAMILY' },
          { label: 'End of Batch Clearance', value: 'CLEARANCE' },
          { label: 'Counter Courtesy Concession', value: 'COURTESY' },
        ],
      },
    ],
  },

  'Summary of Discount By Items Amount': {
    reportKey: 'Summary of Discount By Items Amount',
    reportTitle: 'Summary of Discount by Items Amount',
    code: 'REP_S_00216',
    module: 'sales',
    category: 'Discounts',
    description: 'Item-level discount totals, markdowns by SKU, and threshold filters.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Product Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Bulk Gallons & Tins', value: 'BULK' },
          { label: 'Gourmet Specialty Jars', value: 'SPECIALTY' },
          { label: 'Gift Packs', value: 'GIFTS' },
        ],
      },
      {
        id: 'itemSku',
        label: 'Item Search / SKU',
        type: 'text',
        placeholder: 'Enter SKU or item name...',
      },
      {
        id: 'minDiscountAmount',
        label: 'Min Discount Amount ($)',
        type: 'number',
        defaultValue: 0,
        placeholder: '0.00',
      },
    ],
  },
  'Summary of Discount by Items Amount': {
    reportKey: 'Summary of Discount by Items Amount',
    reportTitle: 'Summary of Discount by Items Amount',
    code: 'REP_S_00216',
    module: 'sales',
    category: 'Discounts',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Product Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Bulk Gallons & Tins', value: 'BULK' },
          { label: 'Gourmet Specialty Jars', value: 'SPECIALTY' },
          { label: 'Gift Packs', value: 'GIFTS' },
        ],
      },
      {
        id: 'itemSku',
        label: 'Item Search / SKU',
        type: 'text',
        placeholder: 'Enter SKU or item name...',
      },
      {
        id: 'minDiscountAmount',
        label: 'Min Discount Amount ($)',
        type: 'number',
        defaultValue: 0,
        placeholder: '0.00',
      },
    ],
  },

  // D. Payment Reports
  'Summary of Payment': {
    reportKey: 'Summary of Payment',
    reportTitle: 'Summary of Payment & Tender Reconciliation',
    code: 'REP_S_00220',
    module: 'sales',
    category: 'Payments',
    description: 'Consolidated settlement totals across all cash, bank, and digital collection modes.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'paymentTender',
        label: 'Payment Tender',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Payment Tenders', value: 'ALL' },
          { label: 'Cash Tender (LBP)', value: 'CASH_LBP' },
          { label: 'Cash Tender (USD)', value: 'CASH_USD' },
          { label: 'Whish Money Transfer', value: 'WHISH' },
          { label: 'Credit / Debit Card POS', value: 'CARD' },
          { label: 'Customer Credit (On Account)', value: 'CREDIT' },
          { label: 'Bank Cheque', value: 'CHEQUE' },
        ],
      },
      {
        id: 'currency',
        label: 'Currency',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Currencies', value: 'ALL' },
          { label: 'Lebanese Pounds (LBP)', value: 'LBP' },
          { label: 'US Dollars (USD)', value: 'USD' },
        ],
      },
    ],
  },

  'Summary of Payment by Department': {
    reportKey: 'Summary of Payment by Department',
    reportTitle: 'Summary of Payment by Department',
    code: 'REP_S_00221',
    module: 'sales',
    category: 'Payments',
    description: 'Payment tender distribution broken down across operational store departments.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'department',
        label: 'Department / Division',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Departments', value: 'ALL' },
          { label: 'Retail Store Sales', value: 'RETAIL' },
          { label: 'Wholesale Depot', value: 'WHOLESALE' },
          { label: 'Delivery Hub', value: 'DELIVERY' },
          { label: 'Factory Outlet', value: 'FACTORY' },
        ],
      },
      {
        id: 'paymentTender',
        label: 'Payment Tender',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Tenders', value: 'ALL' },
          { label: 'Cash', value: 'CASH' },
          { label: 'Credit Card', value: 'CARD' },
          { label: 'Whish Money', value: 'WHISH' },
          { label: 'Cheque', value: 'CHEQUE' },
          { label: 'Credit Account', value: 'CREDIT' },
        ],
      },
    ],
  },

  'Summary of payment by workstation': {
    reportKey: 'Summary of payment by workstation',
    reportTitle: 'Summary of Payment by Workstation',
    code: 'REP_S_00222',
    module: 'sales',
    category: 'Payments',
    description: 'Terminal lane cash and card settlements cross-referenced against register balances.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'workstation',
        label: 'POS Terminal / Workstation',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Terminals', value: 'ALL' },
          { label: 'POS-01 (Front Register)', value: 'POS-01' },
          { label: 'POS-02 (Deli & Bulk Counter)', value: 'POS-02' },
          { label: 'POS-03 (Express Counter)', value: 'POS-03' },
          { label: 'POS-04 (Warehouse Dispatch)', value: 'POS-04' },
        ],
      },
      {
        id: 'shiftBatch',
        label: 'Shift / Drawer #',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Shifts & Drawers', value: 'ALL' },
          { label: 'Shift 1 (Morning)', value: 'SHIFT_1' },
          { label: 'Shift 2 (Evening)', value: 'SHIFT_2' },
          { label: 'Shift 3 (Night)', value: 'SHIFT_3' },
          { label: 'Final End-of-Day Close', value: 'FINAL_CLOSE' },
        ],
      },
      {
        id: 'paymentTender',
        label: 'Payment Tender',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Tenders', value: 'ALL' },
          { label: 'Cash', value: 'CASH' },
          { label: 'Credit Card', value: 'CARD' },
          { label: 'Whish Money', value: 'WHISH' },
          { label: 'Cheque', value: 'CHEQUE' },
        ],
      },
    ],
  },
  'Summary of Payment by Workstation': {
    reportKey: 'Summary of Payment by Workstation',
    reportTitle: 'Summary of Payment by Workstation',
    code: 'REP_S_00222',
    module: 'sales',
    category: 'Payments',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'workstation',
        label: 'POS Terminal / Workstation',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Terminals', value: 'ALL' },
          { label: 'POS-01 (Front Register)', value: 'POS-01' },
          { label: 'POS-02 (Deli & Bulk Counter)', value: 'POS-02' },
          { label: 'POS-03 (Express Counter)', value: 'POS-03' },
          { label: 'POS-04 (Warehouse Dispatch)', value: 'POS-04' },
        ],
      },
      {
        id: 'shiftBatch',
        label: 'Shift / Drawer #',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Shifts & Drawers', value: 'ALL' },
          { label: 'Shift 1 (Morning)', value: 'SHIFT_1' },
          { label: 'Shift 2 (Evening)', value: 'SHIFT_2' },
          { label: 'Shift 3 (Night)', value: 'SHIFT_3' },
          { label: 'Final End-of-Day Close', value: 'FINAL_CLOSE' },
        ],
      },
      {
        id: 'paymentTender',
        label: 'Payment Tender',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Tenders', value: 'ALL' },
          { label: 'Cash', value: 'CASH' },
          { label: 'Credit Card', value: 'CARD' },
          { label: 'Whish Money', value: 'WHISH' },
          { label: 'Cheque', value: 'CHEQUE' },
        ],
      },
    ],
  },

  'Summary of Payment by Employee': {
    reportKey: 'Summary of Payment by Employee',
    reportTitle: 'Summary of Payment by Employee',
    code: 'REP_S_00223',
    module: 'sales',
    category: 'Payments',
    description: 'Cashier collection audits detailing cash, card, and digital tender responsibility.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'cashier',
        label: 'Cashier / Employee',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Staff Members', value: 'ALL' },
          { label: 'Ahmad Al-Hajj', value: 'Ahmad Al-Hajj' },
          { label: 'Noura Haddad', value: 'Noura Haddad' },
          { label: 'Karem Assaf', value: 'Karem Assaf' },
          { label: 'Mohammad Zein', value: 'Mohammad Zein' },
        ],
      },
      {
        id: 'shiftBatch',
        label: 'Shift #',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Shifts', value: 'ALL' },
          { label: 'Shift 1 (Morning)', value: 'SHIFT_1' },
          { label: 'Shift 2 (Evening)', value: 'SHIFT_2' },
          { label: 'Shift 3 (Night)', value: 'SHIFT_3' },
        ],
      },
      {
        id: 'paymentTender',
        label: 'Payment Tender',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Tenders', value: 'ALL' },
          { label: 'Cash', value: 'CASH' },
          { label: 'Credit Card', value: 'CARD' },
          { label: 'Whish Money', value: 'WHISH' },
          { label: 'Cheque', value: 'CHEQUE' },
        ],
      },
    ],
  },

  'Advanced Payment History': {
    reportKey: 'Advanced Payment History',
    reportTitle: 'Advanced Payment History & Deposits Register',
    code: 'REP_S_00224',
    module: 'sales',
    category: 'Payments',
    description: 'Customer advance deposits, down-payments, and down-payment utilization tracking.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'customerAccount',
        label: 'Customer Account',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Customer Accounts', value: 'ALL' },
          { label: 'Al-Nour Food Establishment', value: 'CUST_001' },
          { label: 'Al-Baraka Supermarket S.A.R.L', value: 'CUST_002' },
          { label: 'Beirut Olive House Wholesale', value: 'CUST_003' },
          { label: 'Walk-in Retail Client', value: 'WALKIN' },
        ],
      },
      {
        id: 'paymentTender',
        label: 'Payment Tender',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Tenders', value: 'ALL' },
          { label: 'Cash', value: 'CASH' },
          { label: 'Whish Money', value: 'WHISH' },
          { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
          { label: 'Cheque Deposit', value: 'CHEQUE' },
        ],
      },
      {
        id: 'advanceStatus',
        label: 'Status',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Utilized in Full', value: 'UTILIZED' },
          { label: 'Partially Utilized', value: 'PARTIAL' },
          { label: 'Pending Unapplied', value: 'PENDING' },
          { label: 'Refunded Deposit', value: 'REFUNDED' },
        ],
      },
    ],
  },

  'Paid In/Out': {
    reportKey: 'Paid In/Out',
    reportTitle: 'Paid In / Out Register (Drawer Non-Sales Cash Movement)',
    code: 'REP_S_00225',
    module: 'sales',
    category: 'Payments',
    description: 'Petty cash disbursements, manual cash float injections, and safe drops.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'transType',
        label: 'Transaction Type',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Cash Movements', value: 'ALL' },
          { label: 'Paid In (Cash Inflow)', value: 'PAID_IN' },
          { label: 'Paid Out (Cash Outflow / Petty Cash)', value: 'PAID_OUT' },
        ],
      },
      {
        id: 'cashier',
        label: 'Cashier / User',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Staff Members', value: 'ALL' },
          { label: 'Ahmad Al-Hajj', value: 'Ahmad Al-Hajj' },
          { label: 'Noura Haddad', value: 'Noura Haddad' },
          { label: 'Mohammad Zein (Supervisor)', value: 'Mohammad Zein' },
          { label: 'Head Cashier / Vault Admin', value: 'Head Cashier' },
        ],
      },
      {
        id: 'expenseCategory',
        label: 'Expense Category / Reason',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Expense Categories', value: 'ALL' },
          { label: 'Petty Cash / Office Supplies', value: 'SUPPLIES' },
          { label: 'Minor Equipment Maintenance', value: 'MAINTENANCE' },
          { label: 'Supplier COD Reimbursement', value: 'SUPPLIER_COD' },
          { label: 'Driver Delivery Fuel / Allowance', value: 'FUEL' },
          { label: 'Cash Float Top-up', value: 'FLOAT_TOPUP' },
        ],
      },
    ],
  },
  'Paid In / Out': {
    reportKey: 'Paid In / Out',
    reportTitle: 'Paid In / Out Register (Drawer Non-Sales Cash Movement)',
    code: 'REP_S_00225',
    module: 'sales',
    category: 'Payments',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'transType',
        label: 'Transaction Type',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Cash Movements', value: 'ALL' },
          { label: 'Paid In (Cash Inflow)', value: 'PAID_IN' },
          { label: 'Paid Out (Cash Outflow / Petty Cash)', value: 'PAID_OUT' },
        ],
      },
      {
        id: 'cashier',
        label: 'Cashier / User',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Staff Members', value: 'ALL' },
          { label: 'Ahmad Al-Hajj', value: 'Ahmad Al-Hajj' },
          { label: 'Noura Haddad', value: 'Noura Haddad' },
          { label: 'Mohammad Zein (Supervisor)', value: 'Mohammad Zein' },
          { label: 'Head Cashier / Vault Admin', value: 'Head Cashier' },
        ],
      },
      {
        id: 'expenseCategory',
        label: 'Expense Category / Reason',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Expense Categories', value: 'ALL' },
          { label: 'Petty Cash / Office Supplies', value: 'SUPPLIES' },
          { label: 'Minor Equipment Maintenance', value: 'MAINTENANCE' },
          { label: 'Supplier COD Reimbursement', value: 'SUPPLIER_COD' },
          { label: 'Driver Delivery Fuel / Allowance', value: 'FUEL' },
          { label: 'Cash Float Top-up', value: 'FLOAT_TOPUP' },
        ],
      },
    ],
  },

  'Customer Payments': {
    reportKey: 'Customer Payments',
    reportTitle: 'Customer Payments & AR Collections Ledger',
    code: 'REP_S_00226',
    module: 'sales',
    category: 'Payments',
    description: 'Post-dated bill collections, client credit settlements, and voucher receipts.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'customerAccount',
        label: 'Customer Account / Ledger',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Customer Accounts', value: 'ALL' },
          { label: 'Al-Baraka Supermarket S.A.R.L', value: 'CUST_002' },
          { label: 'Al-Nour Food Establishment', value: 'CUST_001' },
          { label: 'Cedars Gourmet Retailers', value: 'CUST_004' },
          { label: 'Individual Key Accounts', value: 'KEY_ACCOUNTS' },
        ],
      },
      {
        id: 'paymentTender',
        label: 'Payment Tender',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Tenders', value: 'ALL' },
          { label: 'Cash', value: 'CASH' },
          { label: 'Bank Wire / Transfer', value: 'BANK' },
          { label: 'Commercial Cheque', value: 'CHEQUE' },
          { label: 'Whish Money Transfer', value: 'WHISH' },
        ],
      },
      {
        id: 'voucherNo',
        label: 'Receipt / Voucher #',
        type: 'text',
        placeholder: 'Enter receipt or voucher #...',
      },
    ],
  },
  'Customer Payment': {
    reportKey: 'Customer Payment',
    reportTitle: 'Customer Payments & AR Collections Ledger',
    code: 'REP_S_00226',
    module: 'sales',
    category: 'Payments',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'customerAccount',
        label: 'Customer Account / Ledger',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Customer Accounts', value: 'ALL' },
          { label: 'Al-Baraka Supermarket S.A.R.L', value: 'CUST_002' },
          { label: 'Al-Nour Food Establishment', value: 'CUST_001' },
          { label: 'Cedars Gourmet Retailers', value: 'CUST_004' },
          { label: 'Individual Key Accounts', value: 'KEY_ACCOUNTS' },
        ],
      },
      {
        id: 'paymentTender',
        label: 'Payment Tender',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Tenders', value: 'ALL' },
          { label: 'Cash', value: 'CASH' },
          { label: 'Bank Wire / Transfer', value: 'BANK' },
          { label: 'Commercial Cheque', value: 'CHEQUE' },
          { label: 'Whish Money Transfer', value: 'WHISH' },
        ],
      },
      {
        id: 'voucherNo',
        label: 'Receipt / Voucher #',
        type: 'text',
        placeholder: 'Enter receipt or voucher #...',
      },
    ],
  },

  'List of Layaway Sales': {
    reportKey: 'List of Layaway Sales',
    reportTitle: 'Layaway Sales & Extended Reserve Orders',
    code: 'REP_S_00227',
    module: 'sales',
    category: 'Payments',
    description: 'Active installment customer holds, layaway fulfillment status, and contract records.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'customerAccount',
        label: 'Customer Account',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Customer Accounts', value: 'ALL' },
          { label: 'Individual Retail Clients', value: 'INDIVIDUAL' },
          { label: 'Institutional Key Accounts', value: 'KEY_ACCOUNTS' },
        ],
      },
      {
        id: 'layawayStatus',
        label: 'Layaway Status',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Layaway Statuses', value: 'ALL' },
          { label: 'Active / In Progress', value: 'ACTIVE' },
          { label: 'Completed / Released', value: 'COMPLETED' },
          { label: 'Cancelled / Forfeited', value: 'CANCELLED' },
        ],
      },
    ],
  },
  'Layaway History': {
    reportKey: 'Layaway History',
    reportTitle: 'Layaway History & Audit Ledger',
    code: 'REP_S_00228',
    module: 'sales',
    category: 'Payments',
    description: 'Historical layaway lifecycle, deposit payment records, and customer fulfillment timeline.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'customerAccount',
        label: 'Customer Account',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Customer Accounts', value: 'ALL' },
          { label: 'Individual Retail Clients', value: 'INDIVIDUAL' },
          { label: 'Institutional Key Accounts', value: 'KEY_ACCOUNTS' },
        ],
      },
      {
        id: 'layawayStatus',
        label: 'Layaway Status',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Layaway Statuses', value: 'ALL' },
          { label: 'Active / In Progress', value: 'ACTIVE' },
          { label: 'Completed / Released', value: 'COMPLETED' },
          { label: 'Cancelled / Forfeited', value: 'CANCELLED' },
        ],
      },
    ],
  },

  'List of Pending Invoices with Advance Payment': {
    reportKey: 'List of Pending Invoices with Advance Payment',
    reportTitle: 'Pending Invoices with Advance Payment Register',
    code: 'REP_S_00229',
    module: 'sales',
    category: 'Payments',
    description: 'Uninvoiced or partially billed customer orders with active down-payments.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'customerAccount',
        label: 'Customer Account',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Accounts', value: 'ALL' },
          { label: 'Wholesale Clients', value: 'WHOLESALE' },
          { label: 'Direct Contract Buyers', value: 'DIRECT' },
          { label: 'Retail Advance Orders', value: 'RETAIL' },
        ],
      },
      {
        id: 'agingThreshold',
        label: 'Pending Aging Threshold',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Aging Windows', value: 'ALL' },
          { label: '> 7 Days Pending', value: '>7' },
          { label: '> 15 Days Pending', value: '>15' },
          { label: '> 30 Days Overdue', value: '>30' },
          { label: 'Critical (> 60 Days)', value: '>60' },
        ],
      },
    ],
  },
  'Pending Invoices with Advanced Payment': {
    reportKey: 'Pending Invoices with Advanced Payment',
    reportTitle: 'Pending Invoices with Advance Payment Register',
    code: 'REP_S_00229',
    module: 'sales',
    category: 'Payments',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'customerAccount',
        label: 'Customer Account',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Accounts', value: 'ALL' },
          { label: 'Wholesale Clients', value: 'WHOLESALE' },
          { label: 'Direct Contract Buyers', value: 'DIRECT' },
          { label: 'Retail Advance Orders', value: 'RETAIL' },
        ],
      },
      {
        id: 'agingThreshold',
        label: 'Pending Aging Threshold',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Aging Windows', value: 'ALL' },
          { label: '> 7 Days Pending', value: '>7' },
          { label: '> 15 Days Pending', value: '>15' },
          { label: '> 30 Days Overdue', value: '>30' },
          { label: 'Critical (> 60 Days)', value: '>60' },
        ],
      },
    ],
  },

  // E. Internal Control
  'Transactions on Hold': {
    reportKey: 'Transactions on Hold',
    reportTitle: 'Transactions on Hold & Staged Carts Audit',
    code: 'REP_S_00191',
    module: 'sales',
    category: 'Internal Control',
    description: 'Suspended tickets, stalled register queues, and abandoned cart audit log.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'cashier',
        label: 'Cashier / User',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Cashiers', value: 'ALL' },
          { label: 'Ahmad Al-Hajj (POS-01)', value: 'Ahmad Al-Hajj' },
          { label: 'Noura Haddad (POS-02)', value: 'Noura Haddad' },
          { label: 'Karem Assaf (POS-03)', value: 'Karem Assaf' },
          { label: 'Mohammad Zein (Supervisor)', value: 'Mohammad Zein' },
        ],
      },
      {
        id: 'holdReason',
        label: 'Hold Reason',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Hold Reasons', value: 'ALL' },
          { label: 'Customer Stepped Away', value: 'CUSTOMER_STEPPED_AWAY' },
          { label: 'Price Verification Needed', value: 'PRICE_CHECK' },
          { label: 'Manager Approval Required', value: 'MANAGER_APPROVAL' },
          { label: 'Payment Method Issue', value: 'PAYMENT_ISSUE' },
        ],
      },
      {
        id: 'holdAge',
        label: 'Hold Age / Threshold',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Hold Durations', value: 'ALL' },
          { label: '> 15 Minutes', value: '>15m' },
          { label: '> 1 Hour', value: '>1h' },
          { label: '> 4 Hours', value: '>4h' },
          { label: 'Stale EOD Holds (> 12 Hours)', value: '>12h' },
        ],
      },
    ],
  },
  'Transaction on Hold': {
    reportKey: 'Transaction on Hold',
    reportTitle: 'Transactions on Hold & Staged Carts Audit',
    code: 'REP_S_00191',
    module: 'sales',
    category: 'Internal Control',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'cashier',
        label: 'Cashier / User',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Cashiers', value: 'ALL' },
          { label: 'Ahmad Al-Hajj (POS-01)', value: 'Ahmad Al-Hajj' },
          { label: 'Noura Haddad (POS-02)', value: 'Noura Haddad' },
          { label: 'Karem Assaf (POS-03)', value: 'Karem Assaf' },
          { label: 'Mohammad Zein (Supervisor)', value: 'Mohammad Zein' },
        ],
      },
      {
        id: 'holdReason',
        label: 'Hold Reason',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Hold Reasons', value: 'ALL' },
          { label: 'Customer Stepped Away', value: 'CUSTOMER_STEPPED_AWAY' },
          { label: 'Price Verification Needed', value: 'PRICE_CHECK' },
          { label: 'Manager Approval Required', value: 'MANAGER_APPROVAL' },
          { label: 'Payment Method Issue', value: 'PAYMENT_ISSUE' },
        ],
      },
      {
        id: 'holdAge',
        label: 'Hold Age / Threshold',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Hold Durations', value: 'ALL' },
          { label: '> 15 Minutes', value: '>15m' },
          { label: '> 1 Hour', value: '>1h' },
          { label: '> 4 Hours', value: '>4h' },
          { label: 'Stale EOD Holds (> 12 Hours)', value: '>12h' },
        ],
      },
    ],
  },

  // F. Profit Summary
  'Profit by Invoices Summary': {
    reportKey: 'Profit by Invoices Summary',
    reportTitle: 'Profit by Invoices Summary Register',
    code: 'REP_S_00235',
    module: 'sales',
    category: 'Profit Summary',
    description: 'Ticket-level gross profit, COGS margin percentage, and markup metrics per invoice.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'invoiceSearch',
        label: 'Invoice # / Search',
        type: 'text',
        placeholder: 'e.g. 102971',
      },
      {
        id: 'customerAccount',
        label: 'Customer Account',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Customers & Accounts', value: 'ALL' },
          { label: 'Retail Walk-in', value: 'WALKIN' },
          { label: 'Wholesale Accounts', value: 'WHOLESALE' },
          { label: 'Corporate Contract Clients', value: 'CORPORATE' },
        ],
      },
      {
        id: 'marginThreshold',
        label: 'Margin Threshold',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Margins', value: 'ALL' },
          { label: 'Below Target (< 15%)', value: '<15' },
          { label: 'Negative Margin / Loss (< 0%)', value: '<0' },
          { label: 'Standard Healthy (15% - 30%)', value: '15_30' },
          { label: 'High Margin (> 30%)', value: '>30' },
        ],
      },
    ],
  },
  'Profit by Invoice Summary': {
    reportKey: 'Profit by Invoice Summary',
    reportTitle: 'Profit by Invoices Summary Register',
    code: 'REP_S_00235',
    module: 'sales',
    category: 'Profit Summary',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'invoiceSearch',
        label: 'Invoice # / Search',
        type: 'text',
        placeholder: 'e.g. 102971',
      },
      {
        id: 'customerAccount',
        label: 'Customer Account',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Customers & Accounts', value: 'ALL' },
          { label: 'Retail Walk-in', value: 'WALKIN' },
          { label: 'Wholesale Accounts', value: 'WHOLESALE' },
          { label: 'Corporate Contract Clients', value: 'CORPORATE' },
        ],
      },
      {
        id: 'marginThreshold',
        label: 'Margin Threshold',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Margins', value: 'ALL' },
          { label: 'Below Target (< 15%)', value: '<15' },
          { label: 'Negative Margin / Loss (< 0%)', value: '<0' },
          { label: 'Standard Healthy (15% - 30%)', value: '15_30' },
          { label: 'High Margin (> 30%)', value: '>30' },
        ],
      },
    ],
  },
  'Profit By Invoices': {
    reportKey: 'Profit By Invoices',
    reportTitle: 'Profit by Invoices Detailed Register',
    code: 'REP_S_00239',
    module: 'sales',
    category: 'Profit Summary',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'invoiceSearch',
        label: 'Invoice # / Search',
        type: 'text',
        placeholder: 'e.g. 102971',
      },
      {
        id: 'customerAccount',
        label: 'Customer Account',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Customers & Accounts', value: 'ALL' },
          { label: 'Retail Walk-in', value: 'WALKIN' },
          { label: 'Wholesale Accounts', value: 'WHOLESALE' },
          { label: 'Corporate Contract Clients', value: 'CORPORATE' },
        ],
      },
      {
        id: 'marginThreshold',
        label: 'Margin Threshold',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Margins', value: 'ALL' },
          { label: 'Below Target (< 15%)', value: '<15' },
          { label: 'Negative Margin / Loss (< 0%)', value: '<0' },
          { label: 'Standard Healthy (15% - 30%)', value: '15_30' },
          { label: 'High Margin (> 30%)', value: '>30' },
        ],
      },
    ],
  },
  'Profit by Invoice': {
    reportKey: 'Profit by Invoice',
    reportTitle: 'Profit by Invoices Detailed Register',
    code: 'REP_S_00239',
    module: 'sales',
    category: 'Profit Summary',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'invoiceSearch',
        label: 'Invoice # / Search',
        type: 'text',
        placeholder: 'e.g. 102971',
      },
      {
        id: 'customerAccount',
        label: 'Customer Account',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Customers & Accounts', value: 'ALL' },
          { label: 'Retail Walk-in', value: 'WALKIN' },
          { label: 'Wholesale Accounts', value: 'WHOLESALE' },
          { label: 'Corporate Contract Clients', value: 'CORPORATE' },
        ],
      },
      {
        id: 'marginThreshold',
        label: 'Margin Threshold',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Margins', value: 'ALL' },
          { label: 'Below Target (< 15%)', value: '<15' },
          { label: 'Negative Margin / Loss (< 0%)', value: '<0' },
          { label: 'Standard Healthy (15% - 30%)', value: '15_30' },
          { label: 'High Margin (> 30%)', value: '>30' },
        ],
      },
    ],
  },

  'Profit by item summary': {
    reportKey: 'Profit by item summary',
    reportTitle: 'Profit by Item Summary & Product Margin',
    code: 'REP_S_00236',
    module: 'sales',
    category: 'Profit Summary',
    description: 'SKU unit cost, net selling price, gross margin %, and volume profit ranking.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Product Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Bulk Packs & Tins', value: 'BULK' },
          { label: 'Gourmet Specialties', value: 'SPECIALTY' },
          { label: 'Packaging & Bottles', value: 'PACKAGING' },
        ],
      },
      {
        id: 'itemSearch',
        label: 'Sort by SKU / Item Search',
        type: 'text',
        placeholder: 'Filter SKU / Name...',
      },
      {
        id: 'sortOrder',
        label: 'Sort Order',
        type: 'select',
        defaultValue: 'MARGIN_AMT_DESC',
        options: [
          { label: 'Highest Margin Amount ($)', value: 'MARGIN_AMT_DESC' },
          { label: 'Highest Margin Percentage (%)', value: 'MARGIN_PCT_DESC' },
          { label: 'Highest Sales Volume', value: 'VOLUME_DESC' },
          { label: 'Lowest Profit Margin (Risk Watch)', value: 'MARGIN_ASC' },
        ],
      },
    ],
  },
  'Profit by Item Summary': {
    reportKey: 'Profit by Item Summary',
    reportTitle: 'Profit by Item Summary & Product Margin',
    code: 'REP_S_00236',
    module: 'sales',
    category: 'Profit Summary',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Product Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Bulk Packs & Tins', value: 'BULK' },
          { label: 'Gourmet Specialties', value: 'SPECIALTY' },
          { label: 'Packaging & Bottles', value: 'PACKAGING' },
        ],
      },
      {
        id: 'itemSearch',
        label: 'Sort by SKU / Item Search',
        type: 'text',
        placeholder: 'Filter SKU / Name...',
      },
      {
        id: 'sortOrder',
        label: 'Sort Order',
        type: 'select',
        defaultValue: 'MARGIN_AMT_DESC',
        options: [
          { label: 'Highest Margin Amount ($)', value: 'MARGIN_AMT_DESC' },
          { label: 'Highest Margin Percentage (%)', value: 'MARGIN_PCT_DESC' },
          { label: 'Highest Sales Volume', value: 'VOLUME_DESC' },
          { label: 'Lowest Profit Margin (Risk Watch)', value: 'MARGIN_ASC' },
        ],
      },
    ],
  },

  'Profit by category summary': {
    reportKey: 'Profit by category summary',
    reportTitle: 'Profit by Category Summary',
    code: 'REP_S_00237',
    module: 'sales',
    category: 'Profit Summary',
    description: 'Category contribution to company bottom line and average product markup.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'category',
        label: 'Item Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Flavored & Infused Oils', value: 'INFUSED' },
          { label: 'Preserved & Table Olives', value: 'OLIVES' },
          { label: 'Vinegar & Dressings', value: 'VINEGAR' },
        ],
      },
      {
        id: 'calcMode',
        label: 'Calculation Mode',
        type: 'select',
        defaultValue: 'MARGIN',
        options: [
          { label: 'Gross Margin % (Sales Basis)', value: 'MARGIN' },
          { label: 'Markup % (Cost Basis)', value: 'MARKUP' },
          { label: 'Absolute Profit Dollar ($)', value: 'DOLLAR' },
        ],
      },
    ],
  },
  'Profit by Category Summary': {
    reportKey: 'Profit by Category Summary',
    reportTitle: 'Profit by Category Summary',
    code: 'REP_S_00237',
    module: 'sales',
    category: 'Profit Summary',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'category',
        label: 'Item Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Flavored & Infused Oils', value: 'INFUSED' },
          { label: 'Preserved & Table Olives', value: 'OLIVES' },
          { label: 'Vinegar & Dressings', value: 'VINEGAR' },
        ],
      },
      {
        id: 'calcMode',
        label: 'Calculation Mode',
        type: 'select',
        defaultValue: 'MARGIN',
        options: [
          { label: 'Gross Margin % (Sales Basis)', value: 'MARGIN' },
          { label: 'Markup % (Cost Basis)', value: 'MARKUP' },
          { label: 'Absolute Profit Dollar ($)', value: 'DOLLAR' },
        ],
      },
    ],
  },

  'Profit by category by department': {
    reportKey: 'Profit by category by department',
    reportTitle: 'Profit by Category by Department Matrix',
    code: 'REP_S_00238',
    module: 'sales',
    category: 'Profit Summary',
    description: 'Multidimensional departmental profit cross-referenced against item category lines.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'department',
        label: 'Department / Division',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Departments', value: 'ALL' },
          { label: 'Production & Press', value: 'PRODUCTION' },
          { label: 'Retail Shelf Store', value: 'RETAIL' },
          { label: 'Wholesale Supply', value: 'WHOLESALE' },
        ],
      },
      {
        id: 'category',
        label: 'Item Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Premium Bottled Oils', value: 'PREMIUM_OILS' },
          { label: 'Bulk Barrels & Tins', value: 'BULK_TINS' },
          { label: 'Table Olives & Pickles', value: 'TABLE_OLIVES' },
          { label: 'Gift Merchandise', value: 'MERCHANDISE' },
        ],
      },
    ],
  },
  'Profit by Category by Department': {
    reportKey: 'Profit by Category by Department',
    reportTitle: 'Profit by Category by Department Matrix',
    code: 'REP_S_00238',
    module: 'sales',
    category: 'Profit Summary',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'department',
        label: 'Department / Division',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Departments', value: 'ALL' },
          { label: 'Production & Press', value: 'PRODUCTION' },
          { label: 'Retail Shelf Store', value: 'RETAIL' },
          { label: 'Wholesale Supply', value: 'WHOLESALE' },
        ],
      },
      {
        id: 'category',
        label: 'Item Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Premium Bottled Oils', value: 'PREMIUM_OILS' },
          { label: 'Bulk Barrels & Tins', value: 'BULK_TINS' },
          { label: 'Table Olives & Pickles', value: 'TABLE_OLIVES' },
          { label: 'Gift Merchandise', value: 'MERCHANDISE' },
        ],
      },
    ],
  },

  // G. Comparative Reports
  'Sales summary by day': {
    reportKey: 'Sales summary by day',
    reportTitle: 'Daily Sales Comparative Summary',
    code: 'REP_S_00240',
    module: 'sales',
    category: 'Comparative',
    description: 'Day-by-day revenue velocity benchmarked against trailing cycles.',
    filters: [
      {
        id: 'baseDate',
        label: 'Base Date',
        type: 'date',
        defaultValue: '2026-08-31',
      },
      {
        id: 'compareAgainst',
        label: 'Compare Against',
        type: 'select',
        defaultValue: 'PREV_WEEK',
        options: [
          { label: 'Previous Week (Same Day)', value: 'PREV_WEEK' },
          { label: 'Previous Year (Same Day)', value: 'PREV_YEAR' },
          { label: 'Previous Day (Sequential)', value: 'PREV_DAY' },
          { label: 'Custom Reference Date', value: 'CUSTOM' },
        ],
      },
      STANDARD_BRANCH_FIELD,
      {
        id: 'includeTax',
        label: 'Include Tax in Totals',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
  },
  'Daily Sales': {
    reportKey: 'Daily Sales',
    reportTitle: 'Daily Sales Comparative Summary',
    code: 'REP_S_00241',
    module: 'sales',
    category: 'Comparative',
    filters: [
      {
        id: 'baseDate',
        label: 'Base Date',
        type: 'date',
        defaultValue: '2026-08-31',
      },
      {
        id: 'compareAgainst',
        label: 'Compare Against',
        type: 'select',
        defaultValue: 'PREV_WEEK',
        options: [
          { label: 'Previous Week (Same Day)', value: 'PREV_WEEK' },
          { label: 'Previous Year (Same Day)', value: 'PREV_YEAR' },
          { label: 'Previous Day (Sequential)', value: 'PREV_DAY' },
          { label: 'Custom Reference Date', value: 'CUSTOM' },
        ],
      },
      STANDARD_BRANCH_FIELD,
      {
        id: 'includeTax',
        label: 'Include Tax in Totals',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
  },
  'Sales Summary by Day': {
    reportKey: 'Sales Summary by Day',
    reportTitle: 'Daily Sales Comparative Summary',
    code: 'REP_S_00240',
    module: 'sales',
    category: 'Comparative',
    filters: [
      {
        id: 'baseDate',
        label: 'Base Date',
        type: 'date',
        defaultValue: '2026-08-31',
      },
      {
        id: 'compareAgainst',
        label: 'Compare Against',
        type: 'select',
        defaultValue: 'PREV_WEEK',
        options: [
          { label: 'Previous Week (Same Day)', value: 'PREV_WEEK' },
          { label: 'Previous Year (Same Day)', value: 'PREV_YEAR' },
          { label: 'Previous Day (Sequential)', value: 'PREV_DAY' },
          { label: 'Custom Reference Date', value: 'CUSTOM' },
        ],
      },
      STANDARD_BRANCH_FIELD,
      {
        id: 'includeTax',
        label: 'Include Tax in Totals',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
  },

  'Comparative Yearly Sales': {
    reportKey: 'Comparative Yearly Sales',
    reportTitle: 'Comparative Yearly Sales & Growth Register',
    code: 'REP_S_00242',
    module: 'sales',
    category: 'Comparative',
    description: 'Multi-year fiscal benchmarking with annual growth trendlines.',
    filters: [
      {
        id: 'fiscalYears',
        label: 'Fiscal Years Selection',
        type: 'select',
        defaultValue: '2026_2025_2024',
        options: [
          { label: '2026 vs 2025 vs 2024 (3-Year Trend)', value: '2026_2025_2024' },
          { label: '2026 vs 2025 (Prior Year)', value: '2026_2025' },
          { label: '2025 vs 2024 (Historical)', value: '2025_2024' },
          { label: 'Last 5 Fiscal Years (5-Year Long Range)', value: 'LAST_5_YEARS' },
        ],
      },
      STANDARD_BRANCH_FIELD,
      {
        id: 'viewBy',
        label: 'View By',
        type: 'select',
        defaultValue: 'MONTHLY',
        options: [
          { label: 'Monthly Breakdown', value: 'MONTHLY' },
          { label: 'Quarterly Breakdown', value: 'QUARTERLY' },
          { label: 'Semester Breakdown', value: 'SEMESTER' },
        ],
      },
      {
        id: 'metricFocus',
        label: 'Metric Focus',
        type: 'select',
        defaultValue: 'REVENUE',
        options: [
          { label: 'Net Revenue ($)', value: 'REVENUE' },
          { label: 'Sales Volume (Units)', value: 'VOLUME' },
          { label: 'YoY Growth Rate (%)', value: 'GROWTH' },
        ],
      },
    ],
  },

  'Comparative Monthly Sales': {
    reportKey: 'Comparative Monthly Sales',
    reportTitle: 'Comparative Monthly Sales (MoM & YoY)',
    code: 'REP_S_00243',
    module: 'sales',
    category: 'Comparative',
    description: 'Month-over-month and year-over-year seasonal velocity audits.',
    filters: [
      {
        id: 'targetMonth',
        label: 'Target Year & Month',
        type: 'select',
        defaultValue: '2026_08',
        options: [
          { label: 'August 2026', value: '2026_08' },
          { label: 'July 2026', value: '2026_07' },
          { label: 'June 2026', value: '2026_06' },
          { label: 'May 2026', value: '2026_05' },
          { label: 'April 2026', value: '2026_04' },
        ],
      },
      {
        id: 'compareWith',
        label: 'Compare With',
        type: 'select',
        defaultValue: 'MOM',
        options: [
          { label: 'Previous Month (MoM)', value: 'MOM' },
          { label: 'Same Month Last Year (YoY)', value: 'YOY' },
          { label: '3-Month Trailing Average', value: 'TRAILING_3M' },
        ],
      },
      STANDARD_BRANCH_FIELD,
      {
        id: 'department',
        label: 'Department / Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Departments', value: 'ALL' },
          { label: 'Olive Oil Division', value: 'OLIVE_OIL' },
          { label: 'Bulk Production', value: 'BULK' },
          { label: 'Retail Shelf Store', value: 'RETAIL' },
        ],
      },
    ],
  },

  'Comparative Monthly Sales by Employee': {
    reportKey: 'Comparative Monthly Sales by Employee',
    reportTitle: 'Comparative Monthly Sales by Employee',
    code: 'REP_S_00244',
    module: 'sales',
    category: 'Comparative',
    description: 'Staff member productivity ranking benchmarked against historical months.',
    filters: [
      {
        id: 'targetMonth',
        label: 'Target Month',
        type: 'select',
        defaultValue: '2026_08',
        options: [
          { label: 'August 2026', value: '2026_08' },
          { label: 'July 2026', value: '2026_07' },
          { label: 'June 2026', value: '2026_06' },
          { label: 'Year-to-Date Average', value: 'YTD' },
        ],
      },
      {
        id: 'compareWith',
        label: 'Compare With Period',
        type: 'select',
        defaultValue: 'MOM',
        options: [
          { label: 'Prior Month (MoM)', value: 'MOM' },
          { label: 'Same Month Prior Year (YoY)', value: 'YOY' },
          { label: 'Team Benchmark Average', value: 'TEAM_BENCHMARK' },
        ],
      },
      STANDARD_BRANCH_FIELD,
      {
        id: 'cashier',
        label: 'Employee Selection',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Sales Staff', value: 'ALL' },
          { label: 'Top 5 Performers', value: 'TOP_5' },
          { label: 'Ahmad Al-Hajj', value: 'Ahmad Al-Hajj' },
          { label: 'Noura Haddad', value: 'Noura Haddad' },
          { label: 'Karem Assaf', value: 'Karem Assaf' },
        ],
      },
      {
        id: 'rankingMetric',
        label: 'Ranking Metric',
        type: 'select',
        defaultValue: 'REVENUE',
        options: [
          { label: 'Total Sales Volume ($)', value: 'REVENUE' },
          { label: 'Transaction Count (#)', value: 'COUNT' },
          { label: 'Average Ticket Value ($)', value: 'AVG_TICKET' },
          { label: 'Gross Margin Contribution ($)', value: 'MARGIN' },
        ],
      },
    ],
  },

  // H. Transaction Summary
  'Electronic Journal': {
    reportKey: 'Electronic Journal',
    reportTitle: 'Electronic Journal & Terminal Event Audit',
    code: 'REP_S_00248',
    module: 'sales',
    category: 'Transaction Summary',
    description: 'Fiscal cash register electronic journal recording sales, drawer operations, and security events.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'eventType',
        label: 'Event Type',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Event Types', value: 'ALL' },
          { label: 'Sale & Payment', value: 'SALE' },
          { label: 'Void & Cancellation', value: 'VOID' },
          { label: 'Refund & Credit Note', value: 'REFUND' },
          { label: 'No-Sale Drawer Pop', value: 'NO_SALE' },
          { label: 'Price Override', value: 'OVERRIDE' },
          { label: 'System Event / Login', value: 'SYSTEM' },
        ],
      },
      {
        id: 'cashier',
        label: 'Cashier / User',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Cashiers & Users', value: 'ALL' },
          { label: 'Ahmad Al-Hajj (POS-01)', value: 'Ahmad Al-Hajj' },
          { label: 'Noura Haddad (POS-02)', value: 'Noura Haddad' },
          { label: 'Karem Assaf (POS-03)', value: 'Karem Assaf' },
          { label: 'Mohammad Zein (Supervisor)', value: 'Mohammad Zein' },
          { label: 'Layla Chami (Inventory Lead)', value: 'Layla Chami' },
          { label: 'System Admin (Root)', value: 'Admin' },
        ],
      },
      {
        id: 'refNo',
        label: 'Invoice / Reference #',
        type: 'text',
        placeholder: 'e.g. INV-104420, SYS-IN',
      },
    ],
  },

  'Credit Sales': {
    reportKey: 'Credit Sales',
    reportTitle: 'Credit Sales & On-Account Ledger',
    code: 'REP_S_00245',
    module: 'sales',
    category: 'Transaction Summary',
    description: 'Receivables ledger for customer billing on account, payment terms, and aging overdue balances.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'customerAccount',
        label: 'Customer Account',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Customer Accounts', value: 'ALL' },
          { label: 'Al-Nour Food Establishment', value: 'CUST_001' },
          { label: 'Al-Baraka Supermarket S.A.R.L', value: 'CUST_002' },
          { label: 'Beirut Olive House Wholesale', value: 'CUST_003' },
          { label: 'All Wholesale Partners', value: 'ALL_WHOLESALE' },
        ],
      },
      {
        id: 'agingStatus',
        label: 'Aging / Due Status',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Credit Accounts', value: 'ALL' },
          { label: 'Unpaid / Current', value: 'CURRENT' },
          { label: 'Overdue Only (> 30 Days)', value: 'OVERDUE' },
          { label: 'Partially Paid', value: 'PARTIAL' },
          { label: 'Critical Overdue (> 60 Days)', value: 'CRITICAL' },
        ],
      },
    ],
  },

  'Credit Card Report': {
    reportKey: 'Credit Card Report',
    reportTitle: 'Credit Card & POS Terminal Settlement Report',
    code: 'REP_S_00246',
    module: 'sales',
    category: 'Transaction Summary',
    description: 'Card acquiring terminal batches, merchant gateway reconciliations, and authorization logs.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'cardNetwork',
        label: 'Card Type / Network',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Networks', value: 'ALL' },
          { label: 'Visa Credit & Debit', value: 'VISA' },
          { label: 'MasterCard Worldwide', value: 'MASTERCARD' },
          { label: 'American Express', value: 'AMEX' },
          { label: 'Domestic Debit (Local POS)', value: 'DOMESTIC' },
        ],
      },
      {
        id: 'merchantTerminal',
        label: 'POS Terminal / Merchant ID',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Terminals & MIDs', value: 'ALL' },
          { label: 'MID-88412 (Main Front POS)', value: 'MID_88412' },
          { label: 'MID-88413 (Express Desk)', value: 'MID_88413' },
          { label: 'MID-88414 (Online Payment Gateway)', value: 'MID_88414' },
        ],
      },
      {
        id: 'batchNo',
        label: 'Settlement Batch #',
        type: 'text',
        placeholder: 'e.g. BATCH-2026-08',
      },
    ],
  },

  // I. Time Sales Analysis
  'Timer Report Group by transaction count': {
    reportKey: 'Timer Report Group by transaction count',
    reportTitle: 'Timer Report Group by Transactions Count',
    code: 'REP_S_00253',
    module: 'sales',
    category: 'Time sales analysis',
    description: 'Hourly transaction distribution and customer velocity metrics.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'timeInterval',
        label: 'Time Interval',
        type: 'select',
        defaultValue: '60m',
        options: [
          { label: '60 Minutes (Hourly)', value: '60m' },
          { label: '30 Minutes', value: '30m' },
          { label: '15 Minutes (Fine Grain)', value: '15m' },
          { label: 'Shift Duration', value: 'SHIFT' },
        ],
      },
      {
        id: 'dayOfWeek',
        label: 'Day of Week Filter',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Days', value: 'ALL' },
          { label: 'Weekdays Only (Mon-Fri)', value: 'WEEKDAYS' },
          { label: 'Weekends (Sat-Sun)', value: 'WEEKENDS' },
          { label: 'Peak Day (Saturday)', value: 'SATURDAY' },
        ],
      },
    ],
  },
  'Timer Report Group by Transactions Count': {
    reportKey: 'Timer Report Group by Transactions Count',
    reportTitle: 'Timer Report Group by Transactions Count',
    code: 'REP_S_00253',
    module: 'sales',
    category: 'Time sales analysis',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'timeInterval',
        label: 'Time Interval',
        type: 'select',
        defaultValue: '60m',
        options: [
          { label: '60 Minutes (Hourly)', value: '60m' },
          { label: '30 Minutes', value: '30m' },
          { label: '15 Minutes (Fine Grain)', value: '15m' },
          { label: 'Shift Duration', value: 'SHIFT' },
        ],
      },
      {
        id: 'dayOfWeek',
        label: 'Day of Week Filter',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Days', value: 'ALL' },
          { label: 'Weekdays Only (Mon-Fri)', value: 'WEEKDAYS' },
          { label: 'Weekends (Sat-Sun)', value: 'WEEKENDS' },
          { label: 'Peak Day (Saturday)', value: 'SATURDAY' },
        ],
      },
    ],
  },

  'Time report by date': {
    reportKey: 'Time report by date',
    reportTitle: 'Time Report by Date & Hourly Load',
    code: 'REP_S_00254',
    module: 'sales',
    category: 'Time sales analysis',
    description: 'Hourly sales distribution and peak operational capacity window analysis.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'hourRange',
        label: 'Hour Range / Peak Hours',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'Full Operating Hours (08:00 - 22:00)', value: 'ALL' },
          { label: 'Morning Rush (08:00 - 12:00)', value: 'MORNING' },
          { label: 'Lunch & Afternoon (12:00 - 16:00)', value: 'LUNCH' },
          { label: 'Evening Peak (16:00 - 21:00)', value: 'EVENING' },
          { label: 'Night / Off-Hours', value: 'NIGHT' },
        ],
      },
      {
        id: 'orderChannel',
        label: 'Order Type / Channel',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Channels', value: 'ALL' },
          { label: 'In-Store Walk-in', value: 'WALKIN' },
          { label: 'Phone Delivery', value: 'PHONE' },
          { label: 'Online / Social CRM Orders', value: 'ONLINE' },
        ],
      },
    ],
  },
  'Time Report by Date': {
    reportKey: 'Time Report by Date',
    reportTitle: 'Time Report by Date & Hourly Load',
    code: 'REP_S_00254',
    module: 'sales',
    category: 'Time sales analysis',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'hourRange',
        label: 'Hour Range / Peak Hours',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'Full Operating Hours (08:00 - 22:00)', value: 'ALL' },
          { label: 'Morning Rush (08:00 - 12:00)', value: 'MORNING' },
          { label: 'Lunch & Afternoon (12:00 - 16:00)', value: 'LUNCH' },
          { label: 'Evening Peak (16:00 - 21:00)', value: 'EVENING' },
          { label: 'Night / Off-Hours', value: 'NIGHT' },
        ],
      },
      {
        id: 'orderChannel',
        label: 'Order Type / Channel',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Channels', value: 'ALL' },
          { label: 'In-Store Walk-in', value: 'WALKIN' },
          { label: 'Phone Delivery', value: 'PHONE' },
          { label: 'Online / Social CRM Orders', value: 'ONLINE' },
        ],
      },
    ],
  },
  'Transaction Report by Time': {
    reportKey: 'Transaction Report by Time',
    reportTitle: 'Transaction Report by Time',
    code: 'REP_S_00257',
    module: 'sales',
    category: 'Time sales analysis',
    description: 'Chronological timeline of transactional events classified by timestamp blocks.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'hourRange',
        label: 'Hour Range / Peak Hours',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'Full Operating Hours (08:00 - 22:00)', value: 'ALL' },
          { label: 'Morning Rush (08:00 - 12:00)', value: 'MORNING' },
          { label: 'Lunch & Afternoon (12:00 - 16:00)', value: 'LUNCH' },
          { label: 'Evening Peak (16:00 - 21:00)', value: 'EVENING' },
          { label: 'Night / Off-Hours', value: 'NIGHT' },
        ],
      },
      {
        id: 'orderChannel',
        label: 'Order Type / Channel',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Channels', value: 'ALL' },
          { label: 'In-Store Walk-in', value: 'WALKIN' },
          { label: 'Phone Delivery', value: 'PHONE' },
          { label: 'Online / Social CRM Orders', value: 'ONLINE' },
        ],
      },
    ],
  },

  'Time report - Average Check': {
    reportKey: 'Time report - Average Check',
    reportTitle: 'Average Check Size by Operating Hour',
    code: 'REP_S_00255',
    module: 'sales',
    category: 'Time sales analysis',
    description: 'Average ticket spend and customer basket depth plotted across time intervals.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'timeInterval',
        label: 'Time Interval',
        type: 'select',
        defaultValue: 'HOURLY',
        options: [
          { label: 'Hourly (60m Intervals)', value: 'HOURLY' },
          { label: 'Lunch Peak (12:00 - 15:00)', value: 'LUNCH' },
          { label: 'Evening Rush (18:00 - 21:00)', value: 'EVENING' },
          { label: 'Full Shift Periods', value: 'SHIFT' },
        ],
      },
      {
        id: 'paymentMethod',
        label: 'Payment Method',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Payment Methods', value: 'ALL' },
          { label: 'Cash Only', value: 'CASH' },
          { label: 'Card Only', value: 'CARD' },
          { label: 'Whish Money', value: 'WHISH' },
          { label: 'Mixed Tender', value: 'MIXED' },
        ],
      },
    ],
  },
  'Time Report - Average Check': {
    reportKey: 'Time Report - Average Check',
    reportTitle: 'Average Check Size by Operating Hour',
    code: 'REP_S_00255',
    module: 'sales',
    category: 'Time sales analysis',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'timeInterval',
        label: 'Time Interval',
        type: 'select',
        defaultValue: 'HOURLY',
        options: [
          { label: 'Hourly (60m Intervals)', value: 'HOURLY' },
          { label: 'Lunch Peak (12:00 - 15:00)', value: 'LUNCH' },
          { label: 'Evening Rush (18:00 - 21:00)', value: 'EVENING' },
          { label: 'Full Shift Periods', value: 'SHIFT' },
        ],
      },
      {
        id: 'paymentMethod',
        label: 'Payment Method',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Payment Methods', value: 'ALL' },
          { label: 'Cash Only', value: 'CASH' },
          { label: 'Card Only', value: 'CARD' },
          { label: 'Whish Money', value: 'WHISH' },
          { label: 'Mixed Tender', value: 'MIXED' },
        ],
      },
    ],
  },

  'Time report By EOD date': {
    reportKey: 'Time report By EOD date',
    reportTitle: 'Time Report by EOD Date & Shift Reconciliation',
    code: 'REP_S_00256',
    module: 'sales',
    category: 'Time sales analysis',
    description: 'End-of-day register closure batches and hourly sales distribution.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'eodBatch',
        label: 'Shift / EOD Batch #',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All EOD Batches', value: 'ALL' },
          { label: 'Morning Shift Close', value: 'EOD_MORNING' },
          { label: 'Evening Shift Close', value: 'EOD_EVENING' },
          { label: 'Night Final Z-Close', value: 'EOD_NIGHT' },
        ],
      },
      {
        id: 'workstation',
        label: 'Cashier / Workstation',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Workstations', value: 'ALL' },
          { label: 'POS-01 (Main Front)', value: 'POS-01' },
          { label: 'POS-02 (Deli & Bulk)', value: 'POS-02' },
          { label: 'POS-03 (Express Counter)', value: 'POS-03' },
          { label: 'POS-04 (Warehouse Dispatch)', value: 'POS-04' },
        ],
      },
    ],
  },
  'Time Report by EOD Date': {
    reportKey: 'Time Report by EOD Date',
    reportTitle: 'Time Report by EOD Date & Shift Reconciliation',
    code: 'REP_S_00256',
    module: 'sales',
    category: 'Time sales analysis',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'eodBatch',
        label: 'Shift / EOD Batch #',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All EOD Batches', value: 'ALL' },
          { label: 'Morning Shift Close', value: 'EOD_MORNING' },
          { label: 'Evening Shift Close', value: 'EOD_EVENING' },
          { label: 'Night Final Z-Close', value: 'EOD_NIGHT' },
        ],
      },
      {
        id: 'workstation',
        label: 'Cashier / Workstation',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Workstations', value: 'ALL' },
          { label: 'POS-01 (Main Front)', value: 'POS-01' },
          { label: 'POS-02 (Deli & Bulk)', value: 'POS-02' },
          { label: 'POS-03 (Express Counter)', value: 'POS-03' },
          { label: 'POS-04 (Warehouse Dispatch)', value: 'POS-04' },
        ],
      },
    ],
  },

  // --------------------------------------------------------------------------
  // PRODUCT SALES MODULE SCHEMAS
  // --------------------------------------------------------------------------

  // Section 1: Product Sales Core
  'Summary of Sales By Items': {
    reportKey: 'Summary of Sales By Items',
    reportTitle: 'Summary of Sales by Items & Products',
    code: 'REP_S_00251',
    module: 'sales',
    category: 'Product Sales',
    description: 'Item sales volumes, unit revenues, weighted margins, and category contributions.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Product Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil (EVOO)', value: 'EVOO' },
          { label: 'Virgin Olive Oil', value: 'VOO' },
          { label: 'Glass Bottles (Retail 250ml-1L)', value: 'RETAIL_BOTTLES' },
          { label: 'Bulk Commercial Tins (17.5L)', value: 'BULK_TINS' },
          { label: 'Pomegranate Molasses & Specialty', value: 'SPECIALTY' },
        ],
      },
      {
        id: 'sortBy',
        label: 'Sorted By',
        type: 'select',
        defaultValue: 'REVENUE_DESC',
        options: [
          { label: 'Gross Revenue (High to Low)', value: 'REVENUE_DESC' },
          { label: 'Units Sold (High to Low)', value: 'QTY_DESC' },
          { label: 'Profit Margin % (High to Low)', value: 'MARGIN_DESC' },
          { label: 'Product Name (A-Z)', value: 'NAME_ASC' },
        ],
      },
      {
        id: 'searchQuery',
        label: 'SKU or Item Search',
        type: 'text',
        placeholder: 'Search SKU or description...',
      },
    ],
  },

  'Sales by Items': {
    reportKey: 'Sales by Items',
    reportTitle: 'Sales by Items Detail Register',
    code: 'REP_S_00252',
    module: 'sales',
    category: 'Product Sales',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Product Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil (EVOO)', value: 'EVOO' },
          { label: 'Virgin Olive Oil', value: 'VOO' },
          { label: 'Glass Bottles (Retail 250ml-1L)', value: 'RETAIL_BOTTLES' },
          { label: 'Bulk Commercial Tins (17.5L)', value: 'BULK_TINS' },
          { label: 'Pomegranate Molasses & Specialty', value: 'SPECIALTY' },
        ],
      },
      {
        id: 'sortBy',
        label: 'Sorted By',
        type: 'select',
        defaultValue: 'REVENUE_DESC',
        options: [
          { label: 'Gross Revenue (High to Low)', value: 'REVENUE_DESC' },
          { label: 'Units Sold (High to Low)', value: 'QTY_DESC' },
          { label: 'Profit Margin % (High to Low)', value: 'MARGIN_DESC' },
          { label: 'Product Name (A-Z)', value: 'NAME_ASC' },
        ],
      },
      {
        id: 'searchQuery',
        label: 'SKU or Item Search',
        type: 'text',
        placeholder: 'Search SKU or description...',
      },
    ],
  },

  'Daily Sales by Item': {
    reportKey: 'Daily Sales by Item',
    reportTitle: 'Daily Sales by Item Velocity Register',
    code: 'REP_S_00260',
    module: 'sales',
    category: 'Product Sales',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Bulk Commercial Gallons', value: 'BULK' },
          { label: 'Retail Table Goods', value: 'RETAIL' },
        ],
      },
      {
        id: 'sortBy',
        label: 'Sorted By',
        type: 'select',
        defaultValue: 'REVENUE_DESC',
        options: [
          { label: 'Revenue (High to Low)', value: 'REVENUE_DESC' },
          { label: 'Units Sold', value: 'QTY_DESC' },
          { label: 'Item Name', value: 'NAME_ASC' },
        ],
      },
      {
        id: 'searchQuery',
        label: 'SKU or Item Search',
        type: 'text',
        placeholder: 'Filter SKU / description...',
      },
    ],
  },
  'Daily Sales By Items': {
    reportKey: 'Daily Sales By Items',
    reportTitle: 'Daily Sales by Item Velocity Register',
    code: 'REP_S_00260',
    module: 'sales',
    category: 'Product Sales',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Bulk Commercial Gallons', value: 'BULK' },
          { label: 'Retail Table Goods', value: 'RETAIL' },
        ],
      },
      {
        id: 'sortBy',
        label: 'Sorted By',
        type: 'select',
        defaultValue: 'REVENUE_DESC',
        options: [
          { label: 'Revenue (High to Low)', value: 'REVENUE_DESC' },
          { label: 'Units Sold', value: 'QTY_DESC' },
          { label: 'Item Name', value: 'NAME_ASC' },
        ],
      },
      {
        id: 'searchQuery',
        label: 'SKU or Item Search',
        type: 'text',
        placeholder: 'Filter SKU / description...',
      },
    ],
  },

  'Not Sold Items': {
    reportKey: 'Not Sold Items',
    reportTitle: 'Dead Inventory & Not Sold Items Audit',
    code: 'REP_S_00264',
    module: 'sales',
    category: 'Product Sales',
    description: 'Dormant inventory tracking items with zero transaction velocity during the specified window.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Pure Olive Oil', value: 'PURE' },
          { label: 'Soap & Herbal Cosmetics', value: 'COSMETICS' },
          { label: 'Seasonal Gift Packs', value: 'GIFTS' },
        ],
      },
      {
        id: 'sortBy',
        label: 'Sorted By',
        type: 'select',
        defaultValue: 'STOCK_DESC',
        options: [
          { label: 'Highest Stock On Hand', value: 'STOCK_DESC' },
          { label: 'Highest Tied-up Capital ($)', value: 'VALUE_DESC' },
          { label: 'Oldest Last Sold Date', value: 'LAST_SOLD_ASC' },
          { label: 'Item Name (A-Z)', value: 'NAME_ASC' },
        ],
      },
      {
        id: 'searchQuery',
        label: 'SKU or Item Search',
        type: 'text',
        placeholder: 'Search dormant SKU...',
      },
    ],
  },

  'Sales details for one sales item': {
    reportKey: 'Sales details for one sales item',
    reportTitle: 'Sales Details for One Sales Item',
    code: 'REP_S_00258',
    module: 'sales',
    category: 'Product Sales',
    description: 'Granular drilldown for an isolated SKU showing each ticket sale, customer, and price.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'targetItem',
        label: 'Target Item / SKU',
        type: 'select',
        defaultValue: 'EVOO-1000ML',
        options: [
          { label: 'Extra Virgin Olive Oil 1000ml (EVOO-1000ML)', value: 'EVOO-1000ML' },
          { label: 'Extra Virgin Olive Oil 500ml (EVOO-500ML)', value: 'EVOO-500ML' },
          { label: 'Oak Charcoal 4kg (OAK-CHAR-04)', value: 'OAK-CHAR-04' },
          { label: 'Stuffed Vine Leaves 500g (VINE-LVS-500)', value: 'VINE-LVS-500' },
          { label: 'Bulk Olive Oil Tin 17.5L (TIN-175L)', value: 'TIN-175L' },
        ],
      },
      {
        id: 'channelType',
        label: 'Sales Channel / Type',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Channels', value: 'ALL' },
          { label: 'Wholesale Depot', value: 'WHOLESALE' },
          { label: 'Retail Store Counter', value: 'RETAIL' },
          { label: 'Direct Delivery Courier', value: 'DELIVERY' },
          { label: 'Key Accounts', value: 'KEY_ACCOUNTS' },
        ],
      },
    ],
  },
  'Sales Details for One Sales Item': {
    reportKey: 'Sales Details for One Sales Item',
    reportTitle: 'Sales Details for One Sales Item',
    code: 'REP_S_00258',
    module: 'sales',
    category: 'Product Sales',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'targetItem',
        label: 'Target Item / SKU',
        type: 'select',
        defaultValue: 'EVOO-1000ML',
        options: [
          { label: 'Extra Virgin Olive Oil 1000ml (EVOO-1000ML)', value: 'EVOO-1000ML' },
          { label: 'Extra Virgin Olive Oil 500ml (EVOO-500ML)', value: 'EVOO-500ML' },
          { label: 'Oak Charcoal 4kg (OAK-CHAR-04)', value: 'OAK-CHAR-04' },
          { label: 'Stuffed Vine Leaves 500g (VINE-LVS-500)', value: 'VINE-LVS-500' },
          { label: 'Bulk Olive Oil Tin 17.5L (TIN-175L)', value: 'TIN-175L' },
        ],
      },
      {
        id: 'channelType',
        label: 'Sales Channel / Type',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Channels', value: 'ALL' },
          { label: 'Wholesale Depot', value: 'WHOLESALE' },
          { label: 'Retail Store Counter', value: 'RETAIL' },
          { label: 'Direct Delivery Courier', value: 'DELIVERY' },
          { label: 'Key Accounts', value: 'KEY_ACCOUNTS' },
        ],
      },
    ],
  },

  'Sales By Customer By Items': {
    reportKey: 'Sales By Customer By Items',
    reportTitle: 'Sales by Customer by Item Matrix',
    code: 'REP_S_00259',
    module: 'sales',
    category: 'Product Sales',
    description: 'Purchasing profile mapping customer accounts against ordered product lines.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'customerAccount',
        label: 'Customer Account',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Customer Accounts', value: 'ALL' },
          { label: 'Al-Baraka Supermarket S.A.R.L', value: 'CUST_002' },
          { label: 'Al-Nour Food Establishment', value: 'CUST_001' },
          { label: 'Cedars Gourmet Retailers', value: 'CUST_004' },
          { label: 'Beirut Olive House Wholesale', value: 'CUST_003' },
        ],
      },
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Bulk Gallons & Tins', value: 'BULK' },
          { label: 'Specialty Preserves', value: 'SPECIALTY' },
        ],
      },
      {
        id: 'searchQuery',
        label: 'SKU or Item Search',
        type: 'text',
        placeholder: 'Filter item or SKU...',
      },
    ],
  },
  'Sales by Customer by Item': {
    reportKey: 'Sales by Customer by Item',
    reportTitle: 'Sales by Customer by Item Matrix',
    code: 'REP_S_00259',
    module: 'sales',
    category: 'Product Sales',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'customerAccount',
        label: 'Customer Account',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Customer Accounts', value: 'ALL' },
          { label: 'Al-Baraka Supermarket S.A.R.L', value: 'CUST_002' },
          { label: 'Al-Nour Food Establishment', value: 'CUST_001' },
          { label: 'Cedars Gourmet Retailers', value: 'CUST_004' },
          { label: 'Beirut Olive House Wholesale', value: 'CUST_003' },
        ],
      },
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Bulk Gallons & Tins', value: 'BULK' },
          { label: 'Specialty Preserves', value: 'SPECIALTY' },
        ],
      },
      {
        id: 'searchQuery',
        label: 'SKU or Item Search',
        type: 'text',
        placeholder: 'Filter item or SKU...',
      },
    ],
  },

  'Sales Items by Transaction': {
    reportKey: 'Sales Items by Transaction',
    reportTitle: 'Sales Items by Transaction Register',
    code: 'REP_S_00263',
    module: 'sales',
    category: 'Product Sales',
    description: 'Line item records tied back to invoice numbers and transaction headers.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'invoiceRef',
        label: 'Invoice # / Reference',
        type: 'text',
        placeholder: 'e.g. 102971, INV-104420',
      },
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Virgin Olive Oil', value: 'VOO' },
          { label: 'Gourmet Jars', value: 'GOURMET' },
        ],
      },
      {
        id: 'searchQuery',
        label: 'SKU or Item Search',
        type: 'text',
        placeholder: 'Search SKU or description...',
      },
    ],
  },

  'Sales By Categories': {
    reportKey: 'Sales By Categories',
    reportTitle: 'Sales by Product Categories Register',
    code: 'REP_S_00261',
    module: 'sales',
    category: 'Product Sales',
    description: 'Category aggregate billings, unit turnover, and divisional sales split.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil (EVOO)', value: 'EVOO' },
          { label: 'Pure Olive Oil', value: 'PURE' },
          { label: 'Infused & Flavored Oils', value: 'INFUSED' },
          { label: 'Pickles & Table Olives', value: 'PICKLES' },
          { label: 'Soap & Herbal Cosmetics', value: 'COSMETICS' },
        ],
      },
      {
        id: 'department',
        label: 'Department / Division',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Departments', value: 'ALL' },
          { label: 'Olive Oil Division', value: 'OLIVE_OIL' },
          { label: 'Pantry & Gourmet Delicacies', value: 'PANTRY' },
          { label: 'Soap & Herbal Cosmetics', value: 'COSMETICS' },
          { label: 'Gift Sets & Hampers', value: 'GIFTS' },
        ],
      },
    ],
  },
  'Sales by Categories': {
    reportKey: 'Sales by Categories',
    reportTitle: 'Sales by Product Categories Register',
    code: 'REP_S_00261',
    module: 'sales',
    category: 'Product Sales',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil (EVOO)', value: 'EVOO' },
          { label: 'Pure Olive Oil', value: 'PURE' },
          { label: 'Infused & Flavored Oils', value: 'INFUSED' },
          { label: 'Pickles & Table Olives', value: 'PICKLES' },
          { label: 'Soap & Herbal Cosmetics', value: 'COSMETICS' },
        ],
      },
      {
        id: 'department',
        label: 'Department / Division',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Departments', value: 'ALL' },
          { label: 'Olive Oil Division', value: 'OLIVE_OIL' },
          { label: 'Pantry & Gourmet Delicacies', value: 'PANTRY' },
          { label: 'Soap & Herbal Cosmetics', value: 'COSMETICS' },
          { label: 'Gift Sets & Hampers', value: 'GIFTS' },
        ],
      },
    ],
  },

  'Sales By Divisions': {
    reportKey: 'Sales By Divisions',
    reportTitle: 'Sales by Divisions Register',
    code: 'REP_S_00262',
    module: 'sales',
    category: 'Product Sales',
    description: 'Commercial corporate divisions turnover, channel splits, and volume ranking.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'division',
        label: 'Division',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Divisions', value: 'ALL' },
          { label: 'Retail Store Counter', value: 'RETAIL' },
          { label: 'Wholesale Depot', value: 'WHOLESALE' },
          { label: 'E-Commerce Direct', value: 'ECOMMERCE' },
          { label: 'Catering & Hospitality', value: 'CATERING' },
        ],
      },
      {
        id: 'sortMetric',
        label: 'Sort Metric',
        type: 'select',
        defaultValue: 'REVENUE',
        options: [
          { label: 'Gross Revenue ($)', value: 'REVENUE' },
          { label: 'Total Volume Sold (Units)', value: 'VOLUME' },
          { label: 'Gross Margin Contribution ($)', value: 'MARGIN' },
        ],
      },
    ],
  },
  'Sales by Divisions': {
    reportKey: 'Sales by Divisions',
    reportTitle: 'Sales by Divisions Register',
    code: 'REP_S_00262',
    module: 'sales',
    category: 'Product Sales',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'division',
        label: 'Division',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Divisions', value: 'ALL' },
          { label: 'Retail Store Counter', value: 'RETAIL' },
          { label: 'Wholesale Depot', value: 'WHOLESALE' },
          { label: 'E-Commerce Direct', value: 'ECOMMERCE' },
          { label: 'Catering & Hospitality', value: 'CATERING' },
        ],
      },
      {
        id: 'sortMetric',
        label: 'Sort Metric',
        type: 'select',
        defaultValue: 'REVENUE',
        options: [
          { label: 'Gross Revenue ($)', value: 'REVENUE' },
          { label: 'Total Volume Sold (Units)', value: 'VOLUME' },
          { label: 'Gross Margin Contribution ($)', value: 'MARGIN' },
        ],
      },
    ],
  },

  'Sold Serial Numbers': {
    reportKey: 'Sold Serial Numbers',
    reportTitle: 'Sold Serial Numbers & Batch Tracking Ledger',
    code: 'REP_S_00265',
    module: 'sales',
    category: 'Product Sales',
    description: 'Serialized inventory audit logging dispatched barrels, tin batches, and warranty IDs.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'serialQuery',
        label: 'Serial Number / Barcode Query',
        type: 'text',
        placeholder: 'Scan or type SN/barcode...',
      },
      {
        id: 'itemQuery',
        label: 'Product / Item Search',
        type: 'text',
        placeholder: 'Search item name/SKU...',
      },
      {
        id: 'customerAccount',
        label: 'Customer Account',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Customer Accounts', value: 'ALL' },
          { label: 'Retail Walk-in', value: 'WALKIN' },
          { label: 'Wholesale Accounts', value: 'WHOLESALE' },
          { label: 'Corporate Clients', value: 'CORPORATE' },
        ],
      },
    ],
  },

  // Section 2: Comparative By Branch (Cross-Facility Audit)
  'Sales By Category': {
    reportKey: 'Sales By Category',
    reportTitle: 'Comparative Sales by Category Across Branches',
    code: 'REP_S_00266',
    module: 'sales',
    category: 'Comparative By Branch',
    description: 'Multi-branch category benchmark comparing product velocity across company facilities.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_MULTI_BRANCH_FIELD,
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Pure Olive Oil', value: 'PURE' },
          { label: 'Flavored & Infused Oils', value: 'INFUSED' },
          { label: 'Pickles & Table Olives', value: 'OLIVES' },
        ],
      },
      {
        id: 'comparisonMetric',
        label: 'Comparison Metric',
        type: 'select',
        defaultValue: 'SALES_VALUE',
        options: [
          { label: 'Sales Value ($)', value: 'SALES_VALUE' },
          { label: 'Volume Quantity (Units)', value: 'VOLUME' },
          { label: 'Average Unit Selling Price', value: 'AVG_PRICE' },
        ],
      },
    ],
  },
  'Sales by Category': {
    reportKey: 'Sales by Category',
    reportTitle: 'Comparative Sales by Category Across Branches',
    code: 'REP_S_00266',
    module: 'sales',
    category: 'Comparative By Branch',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_MULTI_BRANCH_FIELD,
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Pure Olive Oil', value: 'PURE' },
          { label: 'Flavored & Infused Oils', value: 'INFUSED' },
          { label: 'Pickles & Table Olives', value: 'OLIVES' },
        ],
      },
      {
        id: 'comparisonMetric',
        label: 'Comparison Metric',
        type: 'select',
        defaultValue: 'SALES_VALUE',
        options: [
          { label: 'Sales Value ($)', value: 'SALES_VALUE' },
          { label: 'Volume Quantity (Units)', value: 'VOLUME' },
          { label: 'Average Unit Selling Price', value: 'AVG_PRICE' },
        ],
      },
    ],
  },

  'Sales By Division': {
    reportKey: 'Sales By Division',
    reportTitle: 'Comparative Sales by Division Across Branches',
    code: 'REP_S_00267',
    module: 'sales',
    category: 'Comparative By Branch',
    description: 'Multi-branch divisional performance comparison measuring retail vs wholesale throughput.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_MULTI_BRANCH_FIELD,
      {
        id: 'division',
        label: 'Division',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Divisions', value: 'ALL' },
          { label: 'Retail Stores', value: 'RETAIL' },
          { label: 'Wholesale Depot', value: 'WHOLESALE' },
          { label: 'Catering & Institutional', value: 'CATERING' },
        ],
      },
      {
        id: 'comparisonMetric',
        label: 'Comparison Metric',
        type: 'select',
        defaultValue: 'SALES_VALUE',
        options: [
          { label: 'Sales Value ($)', value: 'SALES_VALUE' },
          { label: 'Volume Quantity (Units)', value: 'VOLUME' },
          { label: 'Growth vs Prior Period (%)', value: 'GROWTH' },
        ],
      },
    ],
  },
  'Sales by Division': {
    reportKey: 'Sales by Division',
    reportTitle: 'Comparative Sales by Division Across Branches',
    code: 'REP_S_00267',
    module: 'sales',
    category: 'Comparative By Branch',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_MULTI_BRANCH_FIELD,
      {
        id: 'division',
        label: 'Division',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Divisions', value: 'ALL' },
          { label: 'Retail Stores', value: 'RETAIL' },
          { label: 'Wholesale Depot', value: 'WHOLESALE' },
          { label: 'Catering & Institutional', value: 'CATERING' },
        ],
      },
      {
        id: 'comparisonMetric',
        label: 'Comparison Metric',
        type: 'select',
        defaultValue: 'SALES_VALUE',
        options: [
          { label: 'Sales Value ($)', value: 'SALES_VALUE' },
          { label: 'Volume Quantity (Units)', value: 'VOLUME' },
          { label: 'Growth vs Prior Period (%)', value: 'GROWTH' },
        ],
      },
    ],
  },

  'Sales By Groups': {
    reportKey: 'Sales By Groups',
    reportTitle: 'Comparative Sales by Item Groups Across Branches',
    code: 'REP_S_00268',
    module: 'sales',
    category: 'Comparative By Branch',
    description: 'Sub-category merchandise group sales distributed across branch stores.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_MULTI_BRANCH_FIELD,
      {
        id: 'itemGroup',
        label: 'Item Group / Sub-Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Groups & Sub-Categories', value: 'ALL' },
          { label: 'Glass Bottles (250ml - 1L)', value: 'BOTTLES' },
          { label: 'Gallons & Tins (3.75L - 17.5L)', value: 'TINS' },
          { label: 'Organic Certified Lines', value: 'ORGANIC' },
          { label: 'Infused Garlic & Herb', value: 'INFUSED' },
        ],
      },
      {
        id: 'sortOrder',
        label: 'Sort Order',
        type: 'select',
        defaultValue: 'REVENUE_DESC',
        options: [
          { label: 'Highest Group Revenue ($)', value: 'REVENUE_DESC' },
          { label: 'Highest Volume Sold', value: 'VOLUME_DESC' },
          { label: 'Branch Contribution Share %', value: 'SHARE_DESC' },
        ],
      },
    ],
  },
  'Sales by Groups': {
    reportKey: 'Sales by Groups',
    reportTitle: 'Comparative Sales by Item Groups Across Branches',
    code: 'REP_S_00268',
    module: 'sales',
    category: 'Comparative By Branch',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_MULTI_BRANCH_FIELD,
      {
        id: 'itemGroup',
        label: 'Item Group / Sub-Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Groups & Sub-Categories', value: 'ALL' },
          { label: 'Glass Bottles (250ml - 1L)', value: 'BOTTLES' },
          { label: 'Gallons & Tins (3.75L - 17.5L)', value: 'TINS' },
          { label: 'Organic Certified Lines', value: 'ORGANIC' },
          { label: 'Infused Garlic & Herb', value: 'INFUSED' },
        ],
      },
      {
        id: 'sortOrder',
        label: 'Sort Order',
        type: 'select',
        defaultValue: 'REVENUE_DESC',
        options: [
          { label: 'Highest Group Revenue ($)', value: 'REVENUE_DESC' },
          { label: 'Highest Volume Sold', value: 'VOLUME_DESC' },
          { label: 'Branch Contribution Share %', value: 'SHARE_DESC' },
        ],
      },
    ],
  },

  'Sales By Items': {
    reportKey: 'Sales By Items',
    reportTitle: 'Comparative Sales by Items Across Branches',
    code: 'REP_S_00269',
    module: 'sales',
    category: 'Comparative By Branch',
    description: 'Multi-facility cross-branch item performance comparison, evaluating product revenue share and volume distribution across branch stores.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_MULTI_BRANCH_FIELD,
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Product Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil (EVOO)', value: 'EVOO' },
          { label: 'Virgin Olive Oil', value: 'VOO' },
          { label: 'Glass Bottles (Retail 250ml-1L)', value: 'RETAIL_BOTTLES' },
          { label: 'Bulk Commercial Tins (17.5L)', value: 'BULK_TINS' },
          { label: 'Pomegranate Molasses & Specialty', value: 'SPECIALTY' },
        ],
      },
      {
        id: 'searchQuery',
        label: 'SKU or Item Search',
        type: 'text',
        placeholder: 'Search SKU or description...',
      },
      {
        id: 'sortBy',
        label: 'Sorted By',
        type: 'select',
        defaultValue: 'REVENUE_DESC',
        options: [
          { label: 'Highest Revenue ($)', value: 'REVENUE_DESC' },
          { label: 'Highest Volume (Qty)', value: 'QTY_DESC' },
          { label: 'Branch Share %', value: 'BRANCH_SHARE_DESC' },
        ],
      },
    ],
  },
  'Sales by Items (Comparative)': {
    reportKey: 'Sales by Items (Comparative)',
    reportTitle: 'Comparative Sales by Items Across Branches',
    code: 'REP_S_00269',
    module: 'sales',
    category: 'Comparative By Branch',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_MULTI_BRANCH_FIELD,
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Product Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil (EVOO)', value: 'EVOO' },
          { label: 'Virgin Olive Oil', value: 'VOO' },
          { label: 'Glass Bottles (Retail 250ml-1L)', value: 'RETAIL_BOTTLES' },
          { label: 'Bulk Commercial Tins (17.5L)', value: 'BULK_TINS' },
          { label: 'Pomegranate Molasses & Specialty', value: 'SPECIALTY' },
        ],
      },
      {
        id: 'searchQuery',
        label: 'SKU or Item Search',
        type: 'text',
        placeholder: 'Search SKU or description...',
      },
      {
        id: 'sortBy',
        label: 'Sorted By',
        type: 'select',
        defaultValue: 'REVENUE_DESC',
        options: [
          { label: 'Highest Revenue ($)', value: 'REVENUE_DESC' },
          { label: 'Highest Volume (Qty)', value: 'QTY_DESC' },
          { label: 'Branch Share %', value: 'BRANCH_SHARE_DESC' },
        ],
      },
    ],
  },

  // Section 3: Top Performers (Pareto / Ranking Analysis)
  'Top N sold by Quantity': {
    reportKey: 'Top N sold by Quantity',
    reportTitle: 'Top N Sold by Quantity (Volume Pareto Analysis)',
    code: 'REP_S_00270',
    module: 'sales',
    category: 'Top Performers',
    description: 'Pareto volume leaderboards ranking top fast-moving SKUs without text search restriction.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'topNThreshold',
        label: 'Top N Threshold',
        type: 'select',
        defaultValue: '10',
        options: [
          { label: 'Top 5 Items', value: '5' },
          { label: 'Top 10 Items (Standard)', value: '10' },
          { label: 'Top 20 Items', value: '20' },
          { label: 'Top 50 Items', value: '50' },
          { label: 'Top 100 Items', value: '100' },
        ],
      },
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Pure Olive Oil', value: 'PURE' },
          { label: 'Table Olives & Pickles', value: 'OLIVES' },
          { label: 'Soap & Cosmetics', value: 'COSMETICS' },
        ],
      },
      {
        id: 'department',
        label: 'Department / Division',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Departments', value: 'ALL' },
          { label: 'Olive Oil Division', value: 'OLIVE_OIL' },
          { label: 'Gourmet Foods', value: 'GOURMET' },
          { label: 'Packaging Materials', value: 'PACKAGING' },
        ],
      },
    ],
  },
  'Top N Sold by Quantity': {
    reportKey: 'Top N Sold by Quantity',
    reportTitle: 'Top N Sold by Quantity (Volume Pareto Analysis)',
    code: 'REP_S_00270',
    module: 'sales',
    category: 'Top Performers',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'topNThreshold',
        label: 'Top N Threshold',
        type: 'select',
        defaultValue: '10',
        options: [
          { label: 'Top 5 Items', value: '5' },
          { label: 'Top 10 Items (Standard)', value: '10' },
          { label: 'Top 20 Items', value: '20' },
          { label: 'Top 50 Items', value: '50' },
          { label: 'Top 100 Items', value: '100' },
        ],
      },
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Pure Olive Oil', value: 'PURE' },
          { label: 'Table Olives & Pickles', value: 'OLIVES' },
          { label: 'Soap & Cosmetics', value: 'COSMETICS' },
        ],
      },
      {
        id: 'department',
        label: 'Department / Division',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Departments', value: 'ALL' },
          { label: 'Olive Oil Division', value: 'OLIVE_OIL' },
          { label: 'Gourmet Foods', value: 'GOURMET' },
          { label: 'Packaging Materials', value: 'PACKAGING' },
        ],
      },
    ],
  },

  'Top N sold by Amount': {
    reportKey: 'Top N sold by Amount',
    reportTitle: 'Top N Sold by Amount (Revenue Pareto Analysis)',
    code: 'REP_S_00271',
    module: 'sales',
    category: 'Top Performers',
    description: 'Revenue generator ranking evaluating top gross turnover SKUs.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'topNThreshold',
        label: 'Top N Threshold',
        type: 'select',
        defaultValue: '10',
        options: [
          { label: 'Top 5 Items', value: '5' },
          { label: 'Top 10 Items (Standard)', value: '10' },
          { label: 'Top 20 Items', value: '20' },
          { label: 'Top 50 Items', value: '50' },
          { label: 'Top 100 Items', value: '100' },
        ],
      },
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Bulk Commercial Tins', value: 'BULK' },
          { label: 'Gourmet Delicacies', value: 'GOURMET' },
        ],
      },
      {
        id: 'currency',
        label: 'Currency',
        type: 'select',
        defaultValue: 'USD',
        options: [
          { label: 'US Dollars ($ USD)', value: 'USD' },
          { label: 'Lebanese Pounds (LBP)', value: 'LBP' },
          { label: 'Consolidated Reporting ($)', value: 'CONSOLIDATED' },
        ],
      },
    ],
  },
  'Top N Sold by Amount': {
    reportKey: 'Top N Sold by Amount',
    reportTitle: 'Top N Sold by Amount (Revenue Pareto Analysis)',
    code: 'REP_S_00271',
    module: 'sales',
    category: 'Top Performers',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'topNThreshold',
        label: 'Top N Threshold',
        type: 'select',
        defaultValue: '10',
        options: [
          { label: 'Top 5 Items', value: '5' },
          { label: 'Top 10 Items (Standard)', value: '10' },
          { label: 'Top 20 Items', value: '20' },
          { label: 'Top 50 Items', value: '50' },
          { label: 'Top 100 Items', value: '100' },
        ],
      },
      {
        id: 'category',
        label: 'Product Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Extra Virgin Olive Oil', value: 'EVOO' },
          { label: 'Bulk Commercial Tins', value: 'BULK' },
          { label: 'Gourmet Delicacies', value: 'GOURMET' },
        ],
      },
      {
        id: 'currency',
        label: 'Currency',
        type: 'select',
        defaultValue: 'USD',
        options: [
          { label: 'US Dollars ($ USD)', value: 'USD' },
          { label: 'Lebanese Pounds (LBP)', value: 'LBP' },
          { label: 'Consolidated Reporting ($)', value: 'CONSOLIDATED' },
        ],
      },
    ],
  },

  // Section 4: Voids and Refunds
  'Details of refunds': {
    reportKey: 'Details of refunds',
    reportTitle: 'Details of Refunds & Customer Credit Notes',
    code: 'REP_S_00274',
    module: 'sales',
    category: 'Voids & Refunds',
    description: 'Granular ticket-level refund audit recording reason codes, returned items, and approving manager.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'refundMethod',
        label: 'Refund Tender',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Refund Methods', value: 'ALL' },
          { label: 'Cash Reimbursement', value: 'CASH' },
          { label: 'Store Credit Voucher', value: 'CREDIT' },
          { label: 'Reversal to Whish Account', value: 'WHISH' },
        ],
      },
      {
        id: 'refundReason',
        label: 'Refund Reason',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Reasons', value: 'ALL' },
          { label: 'Quality Dissatisfaction', value: 'QUALITY' },
          { label: 'Packaging Defect / Seal Broken', value: 'DEFECT' },
          { label: 'Billing / Pricing Error', value: 'BILLING' },
          { label: 'Wrong Item Scanned', value: 'WRONG_ITEM' },
        ],
      },
      {
        id: 'searchQuery',
        label: 'Invoice # / Customer Search',
        type: 'text',
        placeholder: 'Search invoice or customer...',
      },
    ],
  },
  'Details of Refund': {
    reportKey: 'Details of Refund',
    reportTitle: 'Details of Refunds & Customer Credit Notes',
    code: 'REP_S_00274',
    module: 'sales',
    category: 'Voids & Refunds',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'refundMethod',
        label: 'Refund Tender',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Refund Methods', value: 'ALL' },
          { label: 'Cash Reimbursement', value: 'CASH' },
          { label: 'Store Credit Voucher', value: 'CREDIT' },
          { label: 'Reversal to Whish Account', value: 'WHISH' },
        ],
      },
      {
        id: 'refundReason',
        label: 'Refund Reason',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Reasons', value: 'ALL' },
          { label: 'Quality Dissatisfaction', value: 'QUALITY' },
          { label: 'Packaging Defect / Seal Broken', value: 'DEFECT' },
          { label: 'Billing / Pricing Error', value: 'BILLING' },
          { label: 'Wrong Item Scanned', value: 'WRONG_ITEM' },
        ],
      },
      {
        id: 'searchQuery',
        label: 'Invoice # / Customer Search',
        type: 'text',
        placeholder: 'Search invoice or customer...',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CUSTOMER SALES MODULE SCHEMAS
  // --------------------------------------------------------------------------

  // Section 1: Top Performers
  'Top N Customers by Amount': {
    reportKey: 'Top N Customers by Amount',
    reportTitle: 'Top N Customers by Amount (Revenue Pareto Analysis)',
    code: 'REP_S_00280',
    module: 'sales',
    category: 'Customer Sales',
    description: 'Pareto customer spend ranking identifying high-value commercial accounts, purchasing velocity, and revenue concentration.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'topNThreshold',
        label: 'Top N Threshold',
        type: 'select',
        defaultValue: '10',
        options: [
          { label: 'Top 5 Customers', value: '5' },
          { label: 'Top 10 Customers (Standard)', value: '10' },
          { label: 'Top 25 Customers', value: '25' },
          { label: 'Top 50 Customers', value: '50' },
          { label: 'Top 100 Customers', value: '100' },
        ],
      },
      {
        id: 'customerType',
        label: 'Customer Category / Type',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Customer Categories', value: 'ALL' },
          { label: 'Wholesale Depot Accounts', value: 'WHOLESALE' },
          { label: 'Retail Store Accounts', value: 'RETAIL' },
          { label: 'Key Accounts & Supermarkets', value: 'KEY_ACCOUNTS' },
          { label: 'Hospitality & Catering (Horeca)', value: 'HORECA' },
        ],
      },
      {
        id: 'minSpend',
        label: 'Min Spend Threshold ($)',
        type: 'number',
        defaultValue: 0,
        placeholder: '0.00',
      },
    ],
  },

  // Section 2: Customers & Delivery
  'Sales by Customers': {
    reportKey: 'Sales by Customers',
    reportTitle: 'Sales by Customers Register',
    code: 'REP_S_00285',
    module: 'sales',
    category: 'Customer Sales',
    description: 'Commercial client billing register detailing account classifications, payment terms, and aggregate turnover.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'customerAccount',
        label: 'Customer Account / Search',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Customer Accounts', value: 'ALL' },
          { label: 'Al-Baraka Supermarket S.A.R.L (CUST-001)', value: 'CUST-001' },
          { label: 'Al-Nour Food Establishment (CUST-002)', value: 'CUST-002' },
          { label: 'Cedars Gourmet Retailers (CUST-003)', value: 'CUST-003' },
          { label: 'Beirut Olive House Wholesale (CUST-004)', value: 'CUST-004' },
          { label: 'Tripoli Food Hub (CUST-005)', value: 'CUST-005' },
        ],
      },
      {
        id: 'customerClassification',
        label: 'Customer Classification',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Classifications', value: 'ALL' },
          { label: 'Tier A - Key Enterprise Client', value: 'TIER_A' },
          { label: 'Tier B - High-Volume Commercial', value: 'TIER_B' },
          { label: 'Tier C - Standard Wholesale Store', value: 'TIER_C' },
          { label: 'Tier D - Direct Retail Consumer', value: 'TIER_D' },
        ],
      },
      {
        id: 'paymentTerms',
        label: 'Payment Terms',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Payment Terms', value: 'ALL' },
          { label: 'Cash On Delivery (COD)', value: 'COD' },
          { label: 'Net 15 Days', value: 'NET_15' },
          { label: 'Net 30 Days', value: 'NET_30' },
          { label: 'Net 60 Days', value: 'NET_60' },
          { label: 'Credit / On-Account', value: 'CREDIT' },
        ],
      },
    ],
  },

  'Customer in Detail': {
    reportKey: 'Customer in Detail',
    reportTitle: 'Sales by Customer in Detail Ledger',
    code: 'REP_S_00281',
    module: 'sales',
    category: 'Customer Sales',
    description: 'Transaction-level purchasing history for a selected customer account with invoice references and return tracking.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'targetCustomer',
        label: 'Target Customer Account',
        type: 'select',
        defaultValue: 'CUST-001',
        options: [
          { label: 'Al-Baraka Supermarket S.A.R.L (CUST-001)', value: 'CUST-001' },
          { label: 'Al-Nour Food Establishment (CUST-002)', value: 'CUST-002' },
          { label: 'Cedars Gourmet Retailers (CUST-003)', value: 'CUST-003' },
          { label: 'Beirut Olive House Wholesale (CUST-004)', value: 'CUST-004' },
          { label: 'Tripoli Food Hub (CUST-005)', value: 'CUST-005' },
        ],
      },
      {
        id: 'invoiceSearch',
        label: 'Invoice # / Search',
        type: 'text',
        placeholder: 'e.g. 102971, INV-104420...',
      },
      {
        id: 'includeReturns',
        label: 'Include Returns / Voids',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
  },
  'Sales by customer In Detail': {
    reportKey: 'Sales by customer In Detail',
    reportTitle: 'Sales by Customer in Detail Ledger',
    code: 'REP_S_00281',
    module: 'sales',
    category: 'Customer Sales',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'targetCustomer',
        label: 'Target Customer Account',
        type: 'select',
        defaultValue: 'CUST-001',
        options: [
          { label: 'Al-Baraka Supermarket S.A.R.L (CUST-001)', value: 'CUST-001' },
          { label: 'Al-Nour Food Establishment (CUST-002)', value: 'CUST-002' },
          { label: 'Cedars Gourmet Retailers (CUST-003)', value: 'CUST-003' },
          { label: 'Beirut Olive House Wholesale (CUST-004)', value: 'CUST-004' },
          { label: 'Tripoli Food Hub (CUST-005)', value: 'CUST-005' },
        ],
      },
      {
        id: 'invoiceSearch',
        label: 'Invoice # / Search',
        type: 'text',
        placeholder: 'e.g. 102971, INV-104420...',
      },
      {
        id: 'includeReturns',
        label: 'Include Returns / Voids',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
  },
  'Sales by Customer In Detail': {
    reportKey: 'Sales by Customer In Detail',
    reportTitle: 'Sales by Customer in Detail Ledger',
    code: 'REP_S_00281',
    module: 'sales',
    category: 'Customer Sales',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'targetCustomer',
        label: 'Target Customer Account',
        type: 'select',
        defaultValue: 'CUST-001',
        options: [
          { label: 'Al-Baraka Supermarket S.A.R.L (CUST-001)', value: 'CUST-001' },
          { label: 'Al-Nour Food Establishment (CUST-002)', value: 'CUST-002' },
          { label: 'Cedars Gourmet Retailers (CUST-003)', value: 'CUST-003' },
          { label: 'Beirut Olive House Wholesale (CUST-004)', value: 'CUST-004' },
          { label: 'Tripoli Food Hub (CUST-005)', value: 'CUST-005' },
        ],
      },
      {
        id: 'invoiceSearch',
        label: 'Invoice # / Search',
        type: 'text',
        placeholder: 'e.g. 102971, INV-104420...',
      },
      {
        id: 'includeReturns',
        label: 'Include Returns / Voids',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
  },

  'Sales by Zone': {
    reportKey: 'Sales by Zone',
    reportTitle: 'Sales by Delivery Zone Register',
    code: 'REP_S_00282',
    module: 'sales',
    category: 'Customer Sales',
    description: 'Regional distribution turnover and delivery density breakdown across geographic delivery zones.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'deliveryZone',
        label: 'Delivery Zone / Region',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Delivery Zones & Regions', value: 'ALL' },
          { label: 'Beirut Metro (Ras Beirut, Hamra, Verdun)', value: 'BEIRUT_METRO' },
          { label: 'Greater Beirut (Ashrafieh, Sin El Fil)', value: 'GREATER_BEIRUT' },
          { label: 'Mount Lebanon & Metn', value: 'MOUNT_LEBANON' },
          { label: 'Chouf & Aley Hills', value: 'CHOUF_ALEY' },
          { label: 'South Lebanon (Sidon, Tyre)', value: 'SOUTH_LEBANON' },
          { label: 'North Lebanon (Tripoli, Koura)', value: 'NORTH_LEBANON' },
          { label: 'Bekaa Valley Hub (Zahle, Chtaura)', value: 'BEKAA_VALLEY' },
        ],
      },
      {
        id: 'distributionRoute',
        label: 'Distribution Route',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Distribution Routes', value: 'ALL' },
          { label: 'Coastal Highway Corridor', value: 'COASTAL' },
          { label: 'Mountain Radial Route', value: 'MOUNTAIN' },
          { label: 'Inland Commercial Trunk', value: 'INLAND' },
          { label: 'Express Direct Dispatch', value: 'EXPRESS' },
        ],
      },
    ],
  },
  'Sales by zone': {
    reportKey: 'Sales by zone',
    reportTitle: 'Sales by Delivery Zone Register',
    code: 'REP_S_00282',
    module: 'sales',
    category: 'Customer Sales',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'deliveryZone',
        label: 'Delivery Zone / Region',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Delivery Zones & Regions', value: 'ALL' },
          { label: 'Beirut Metro (Ras Beirut, Hamra, Verdun)', value: 'BEIRUT_METRO' },
          { label: 'Greater Beirut (Ashrafieh, Sin El Fil)', value: 'GREATER_BEIRUT' },
          { label: 'Mount Lebanon & Metn', value: 'MOUNT_LEBANON' },
          { label: 'Chouf & Aley Hills', value: 'CHOUF_ALEY' },
          { label: 'South Lebanon (Sidon, Tyre)', value: 'SOUTH_LEBANON' },
          { label: 'North Lebanon (Tripoli, Koura)', value: 'NORTH_LEBANON' },
          { label: 'Bekaa Valley Hub (Zahle, Chtaura)', value: 'BEKAA_VALLEY' },
        ],
      },
      {
        id: 'distributionRoute',
        label: 'Distribution Route',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Distribution Routes', value: 'ALL' },
          { label: 'Coastal Highway Corridor', value: 'COASTAL' },
          { label: 'Mountain Radial Route', value: 'MOUNTAIN' },
          { label: 'Inland Commercial Trunk', value: 'INLAND' },
          { label: 'Express Direct Dispatch', value: 'EXPRESS' },
        ],
      },
    ],
  },

  'Delivery Sales Summary': {
    reportKey: 'Delivery Sales Summary',
    reportTitle: 'Delivery Sales & Courier Dispatch Summary',
    code: 'REP_S_00283',
    module: 'sales',
    category: 'Customer Sales',
    description: 'Dispatch reconciliation tracking client deliveries by zone, fulfillment status, and payment settlement tender.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'deliveryZone',
        label: 'Delivery Zone',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Delivery Zones', value: 'ALL' },
          { label: 'Beirut Metro', value: 'BEIRUT_METRO' },
          { label: 'Greater Beirut', value: 'GREATER_BEIRUT' },
          { label: 'Mount Lebanon', value: 'MOUNT_LEBANON' },
          { label: 'Chouf & Aley', value: 'CHOUF_ALEY' },
          { label: 'South Lebanon', value: 'SOUTH_LEBANON' },
          { label: 'North Lebanon', value: 'NORTH_LEBANON' },
          { label: 'Bekaa Valley', value: 'BEKAA_VALLEY' },
        ],
      },
      {
        id: 'deliveryStatus',
        label: 'Delivery Status',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Delivery Statuses', value: 'ALL' },
          { label: 'Pending Dispatch', value: 'PENDING' },
          { label: 'Dispatched / On Route', value: 'DISPATCHED' },
          { label: 'Successfully Delivered', value: 'DELIVERED' },
          { label: 'Returned / Rejected', value: 'RETURNED' },
        ],
      },
      {
        id: 'settlementTender',
        label: 'Settlement / Payment Tender',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Tenders', value: 'ALL' },
          { label: 'Cash On Delivery (COD)', value: 'COD' },
          { label: 'Card on Delivery', value: 'CARD' },
          { label: 'Pre-paid / Whish Transfer', value: 'PREPAID' },
          { label: 'Commercial Credit Note', value: 'CREDIT' },
        ],
      },
    ],
  },

  "Driver's History": {
    reportKey: "Driver's History",
    reportTitle: "Driver's History & Dispatch Audit Register",
    code: 'REP_S_00284',
    module: 'sales',
    category: 'Customer Sales',
    description: 'Courier dispatch log tracking completed drop-offs, batch runs, cash collection, and delivery outcomes.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'driver',
        label: 'Driver / Courier',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Drivers & Couriers', value: 'ALL' },
          { label: 'Ali Al-Husseini (Van 01)', value: 'DRV_01' },
          { label: 'Charbel Mattar (Van 02)', value: 'DRV_02' },
          { label: 'Tarek Ziyad (Moto Express 01)', value: 'DRV_03' },
          { label: 'Fadi Saade (Regional Van 03)', value: 'DRV_04' },
          { label: 'Supersonic Fleet Courier', value: 'DRV_SUPERSONIC' },
        ],
      },
      {
        id: 'batchRunNumber',
        label: 'Dispatch Batch / Run #',
        type: 'text',
        placeholder: 'e.g. BATCH-2026-0815, RUN-04...',
      },
      {
        id: 'outcomeStatus',
        label: 'Delivery Outcome Status',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Outcomes', value: 'ALL' },
          { label: 'Delivered & Cash Collected', value: 'DELIVERED_CASH' },
          { label: 'Delivered & Card Paid', value: 'DELIVERED_CARD' },
          { label: 'Partial Return (Client Refusal)', value: 'PARTIAL_RETURN' },
          { label: 'Full Return (Damaged / Missing)', value: 'FULL_RETURN' },
          { label: 'Rescheduled for Next Shift', value: 'RESCHEDULED' },
        ],
      },
    ],
  },
  'Drivers History': {
    reportKey: 'Drivers History',
    reportTitle: "Driver's History & Dispatch Audit Register",
    code: 'REP_S_00284',
    module: 'sales',
    category: 'Customer Sales',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'driver',
        label: 'Driver / Courier',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Drivers & Couriers', value: 'ALL' },
          { label: 'Ali Al-Husseini (Van 01)', value: 'DRV_01' },
          { label: 'Charbel Mattar (Van 02)', value: 'DRV_02' },
          { label: 'Tarek Ziyad (Moto Express 01)', value: 'DRV_03' },
          { label: 'Fadi Saade (Regional Van 03)', value: 'DRV_04' },
          { label: 'Supersonic Fleet Courier', value: 'DRV_SUPERSONIC' },
        ],
      },
      {
        id: 'batchRunNumber',
        label: 'Dispatch Batch / Run #',
        type: 'text',
        placeholder: 'e.g. BATCH-2026-0815, RUN-04...',
      },
      {
        id: 'outcomeStatus',
        label: 'Delivery Outcome Status',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Outcomes', value: 'ALL' },
          { label: 'Delivered & Cash Collected', value: 'DELIVERED_CASH' },
          { label: 'Delivered & Card Paid', value: 'DELIVERED_CARD' },
          { label: 'Partial Return (Client Refusal)', value: 'PARTIAL_RETURN' },
          { label: 'Full Return (Damaged / Missing)', value: 'FULL_RETURN' },
          { label: 'Rescheduled for Next Shift', value: 'RESCHEDULED' },
        ],
      },
    ],
  },

  // --------------------------------------------------------------------------
  // TODAY'S & HISTORY MODULE SCHEMAS
  // --------------------------------------------------------------------------

  // Section 1: Today's Sales (Live In-Session Views)
  'Reading / X-Report': {
    reportKey: 'Reading / X-Report',
    reportTitle: 'Reading / X-Report',
    code: 'REP_S_00187',
    module: 'sales',
    category: "Today's Sales",
    description: 'Instantaneous non-resetting mid-shift drawer audit, physical takings check, hourly interval velocity, and terminal telemetry.',
    filters: [
      TODAY_LOCKED_DATE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'terminalId',
        label: 'Active Terminal ID',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Active Terminals', value: 'ALL' },
          { label: 'POS-01 (Front Retail Checkout)', value: 'POS-01' },
          { label: 'POS-02 (Bulk Warehouse Terminal)', value: 'POS-02' },
          { label: 'POS-03 (Express Counter Terminal)', value: 'POS-03' },
          { label: 'POS-04 (Fleet & Dispatch Bay)', value: 'POS-04' },
        ],
      },
      {
        id: 'shiftNumber',
        label: 'Shift #',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Active Shifts', value: 'ALL' },
          { label: 'Shift 1 - Morning (07:00 - 15:30)', value: 'SHIFT_1' },
          { label: 'Shift 2 - Evening (15:00 - 23:30)', value: 'SHIFT_2' },
          { label: 'Shift 3 - Night Maintenance', value: 'SHIFT_3' },
        ],
      },
      {
        id: 'cashierUser',
        label: 'Cashier / User',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Active Cashiers & Users', value: 'ALL' },
          { label: 'Ahmad Al-Hajj (Lead Cashier)', value: 'EMP_AHMAD' },
          { label: 'Maya Khoury (Front Desk)', value: 'EMP_MAYA' },
          { label: 'Jad Tannous (Wholesale Bay)', value: 'EMP_JAD' },
          { label: 'Nour Saliba (Express POS)', value: 'EMP_NOUR' },
          { label: 'Shift Supervisor / Manager', value: 'ADMIN' },
        ],
      },
      {
        id: 'paymentMethod',
        label: 'Payment Method',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Payment Methods', value: 'ALL' },
          { label: 'Cash (LBP / USD)', value: 'CASH' },
          { label: 'Credit Card (Visa / MC)', value: 'CARD' },
          { label: 'Whish Money Digital', value: 'WHISH' },
        ],
      },
      {
        id: 'hourlyInterval',
        label: 'Hourly Interval',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Shift Hours', value: 'ALL' },
          { label: 'Morning Peak (08:00 - 12:00)', value: 'PEAK_MORNING' },
          { label: 'Midday Velocity (12:00 - 16:00)', value: 'MIDDAY' },
          { label: 'Evening Peak (16:00 - 20:00)', value: 'PEAK_EVENING' },
          { label: 'Night Close (20:00 - 24:00)', value: 'NIGHT_CLOSE' },
        ],
      },
    ],
  },

  "Today's Sales": {
    reportKey: "Today's Sales",
    reportTitle: 'Reading / X-Report',
    code: 'REP_S_00187',
    module: 'sales',
    category: "Today's Sales",
    description: 'Consolidated into canonical Reading / X-Report (REP_S_00187).',
    filters: [
      TODAY_LOCKED_DATE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'cashierUser',
        label: 'Cashier / User',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Active Cashiers & Users', value: 'ALL' },
          { label: 'Ahmad Al-Hajj (Lead Cashier)', value: 'EMP_AHMAD' },
          { label: 'Maya Khoury (Front Desk)', value: 'EMP_MAYA' },
          { label: 'Jad Tannous (Wholesale Bay)', value: 'EMP_JAD' },
          { label: 'Nour Saliba (Express POS)', value: 'EMP_NOUR' },
          { label: 'Shift Supervisor / Manager', value: 'ADMIN' },
        ],
      },
      {
        id: 'paymentMethod',
        label: 'Payment Method',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Payment Methods', value: 'ALL' },
          { label: 'Cash (LBP / USD)', value: 'CASH' },
          { label: 'Credit Card (Visa / MC)', value: 'CARD' },
          { label: 'Whish Money Digital', value: 'WHISH' },
        ],
      },
    ],
  },

  "Today's Statistics": {
    reportKey: "Today's Statistics",
    reportTitle: 'Reading / X-Report',
    code: 'REP_S_00187',
    module: 'sales',
    category: "Today's Sales",
    description: 'Consolidated into canonical Reading / X-Report (REP_S_00187).',
    filters: [
      TODAY_LOCKED_DATE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'hourlyInterval',
        label: 'Hourly Interval',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Shift Hours', value: 'ALL' },
          { label: 'Morning Peak (08:00 - 12:00)', value: 'PEAK_MORNING' },
          { label: 'Midday Velocity (12:00 - 16:00)', value: 'MIDDAY' },
          { label: 'Evening Peak (16:00 - 20:00)', value: 'PEAK_EVENING' },
          { label: 'Night Close (20:00 - 24:00)', value: 'NIGHT_CLOSE' },
        ],
      },
    ],
  },

  "Today's Summary of payment": {
    reportKey: "Today's Summary of payment",
    reportTitle: "Today's Settlement & Payment Tender Summary",
    code: 'REP_SALES_004',
    module: 'sales',
    category: "Today's Sales",
    description: 'Reconciliation of tender types, cash drawers, and electronic card settlements for current shift.',
    filters: [
      TODAY_LOCKED_DATE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'paymentTender',
        label: 'Payment Tender',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Payment Tenders', value: 'ALL' },
          { label: 'Cash (LBP / USD)', value: 'CASH' },
          { label: 'Whish Money Digital', value: 'WHISH' },
          { label: 'Credit Card (Visa / MC)', value: 'CARD' },
          { label: 'Credit / On-Account', value: 'CREDIT' },
        ],
      },
      {
        id: 'posTerminal',
        label: 'POS Terminal / Workstation ID',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All POS Terminals', value: 'ALL' },
          { label: 'POS-01 (Main Front Checkout)', value: 'POS-01' },
          { label: 'POS-02 (Bulk Depot Terminal)', value: 'POS-02' },
          { label: 'POS-03 (Express Counter)', value: 'POS-03' },
          { label: 'POS-04 (Dispatch & Delivery Bay)', value: 'POS-04' },
        ],
      },
    ],
  },
  "Today's Summary of Payment": {
    reportKey: "Today's Summary of Payment",
    reportTitle: "Today's Settlement & Payment Tender Summary",
    code: 'REP_SALES_004',
    module: 'sales',
    category: "Today's Sales",
    filters: [
      TODAY_LOCKED_DATE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'paymentTender',
        label: 'Payment Tender',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Payment Tenders', value: 'ALL' },
          { label: 'Cash (LBP / USD)', value: 'CASH' },
          { label: 'Whish Money Digital', value: 'WHISH' },
          { label: 'Credit Card (Visa / MC)', value: 'CARD' },
          { label: 'Credit / On-Account', value: 'CREDIT' },
        ],
      },
      {
        id: 'posTerminal',
        label: 'POS Terminal / Workstation ID',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All POS Terminals', value: 'ALL' },
          { label: 'POS-01 (Main Front Checkout)', value: 'POS-01' },
          { label: 'POS-02 (Bulk Depot Terminal)', value: 'POS-02' },
          { label: 'POS-03 (Express Counter)', value: 'POS-03' },
          { label: 'POS-04 (Dispatch & Delivery Bay)', value: 'POS-04' },
        ],
      },
    ],
  },

  "Today's summary by Employee": {
    reportKey: "Today's summary by Employee",
    reportTitle: "Today's Sales Summary by Employee & Cashier",
    code: 'REP_SALES_003',
    module: 'sales',
    category: "Today's Sales",
    description: 'Individual employee drawer accountability, cash takings, and invoice counts for current day.',
    filters: [
      TODAY_LOCKED_DATE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'employeeCashier',
        label: 'Employee / Cashier',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Cashiers & Staff', value: 'ALL' },
          { label: 'Ahmad Al-Hajj (Senior Cashier)', value: 'EMP_AHMAD' },
          { label: 'Maya Khoury (Front Desk)', value: 'EMP_MAYA' },
          { label: 'Jad Tannous (Wholesale Lead)', value: 'EMP_JAD' },
          { label: 'Nour Saliba (Terminal Operator)', value: 'EMP_NOUR' },
          { label: 'Rania Eid (Shift Supervisor)', value: 'EMP_RANIA' },
        ],
      },
      {
        id: 'shiftNumber',
        label: 'Active Shift #',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Active Shifts', value: 'ALL' },
          { label: 'Shift #1 (Morning)', value: 'SHIFT_1' },
          { label: 'Shift #2 (Evening)', value: 'SHIFT_2' },
          { label: 'Shift #3 (Night Audit)', value: 'SHIFT_3' },
        ],
      },
    ],
  },
  "Today's Summary by Employee": {
    reportKey: "Today's Summary by Employee",
    reportTitle: "Today's Sales Summary by Employee & Cashier",
    code: 'REP_SALES_003',
    module: 'sales',
    category: "Today's Sales",
    filters: [
      TODAY_LOCKED_DATE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'employeeCashier',
        label: 'Employee / Cashier',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Cashiers & Staff', value: 'ALL' },
          { label: 'Ahmad Al-Hajj (Senior Cashier)', value: 'EMP_AHMAD' },
          { label: 'Maya Khoury (Front Desk)', value: 'EMP_MAYA' },
          { label: 'Jad Tannous (Wholesale Lead)', value: 'EMP_JAD' },
          { label: 'Nour Saliba (Terminal Operator)', value: 'EMP_NOUR' },
          { label: 'Rania Eid (Shift Supervisor)', value: 'EMP_RANIA' },
        ],
      },
      {
        id: 'shiftNumber',
        label: 'Active Shift #',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Active Shifts', value: 'ALL' },
          { label: 'Shift #1 (Morning)', value: 'SHIFT_1' },
          { label: 'Shift #2 (Evening)', value: 'SHIFT_2' },
          { label: 'Shift #3 (Night Audit)', value: 'SHIFT_3' },
        ],
      },
    ],
  },

  "Today's Transactions": {
    reportKey: "Today's Transactions",
    reportTitle: "Today's Live Transactions Ledger",
    code: 'REP_S_00195',
    module: 'sales',
    category: "Today's Sales",
    description: 'Chronological transaction stream of all receipts, returns, and billings issued today.',
    filters: [
      TODAY_LOCKED_DATE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'invoiceSearch',
        label: 'Invoice # / Reference Search',
        type: 'text',
        placeholder: 'e.g. 102971, REC-9042...',
      },
      {
        id: 'cashierUser',
        label: 'Cashier / User',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Cashiers & Users', value: 'ALL' },
          { label: 'Ahmad Al-Hajj', value: 'EMP_AHMAD' },
          { label: 'Maya Khoury', value: 'EMP_MAYA' },
          { label: 'Jad Tannous', value: 'EMP_JAD' },
          { label: 'Shift Admin / Manager', value: 'ADMIN' },
        ],
      },
      {
        id: 'transactionType',
        label: 'Transaction Type',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Transactions', value: 'ALL' },
          { label: 'Regular Sale', value: 'SALE' },
          { label: 'Customer Return / Refund', value: 'RETURN' },
          { label: 'Voided Transaction', value: 'VOID' },
        ],
      },
    ],
  },

  // Section 2: History & Archive
  'Preview Older Sales': {
    reportKey: 'Preview Older Sales',
    reportTitle: 'Preview Older Sales & Archived Ledger',
    code: 'REP_S_00290',
    module: 'sales',
    category: 'History',
    description: 'Long-term historical sales records retrieval from cold storage archive databases.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'fiscalYearBatch',
        label: 'Fiscal Year / Archive Batch',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Archived Batches', value: 'ALL' },
          { label: 'FY 2026 Archived Quarters', value: 'FY2026' },
          { label: 'FY 2025 Closed Fiscal Year', value: 'FY2025' },
          { label: 'FY 2024 Closed Fiscal Year', value: 'FY2024' },
          { label: 'Historical Vault (2020-2023)', value: 'VAULT' },
        ],
      },
      {
        id: 'aggregationLevel',
        label: 'Aggregation Level',
        type: 'select',
        defaultValue: 'DAILY',
        options: [
          { label: 'Daily Consolidated Records', value: 'DAILY' },
          { label: 'Monthly Summary Totals', value: 'MONTHLY' },
          { label: 'Yearly Audit Rollup', value: 'YEARLY' },
        ],
      },
    ],
  },

  'Main Reading History': {
    reportKey: 'Main Reading History',
    reportTitle: 'Main Reading History & Fiscal Meter Register',
    code: 'REP_S_00291',
    module: 'sales',
    category: 'History',
    description: 'Historical archive of main reading records, sequential register audits, shift reconciliations, and Z-report closures.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'terminalId',
        label: 'Terminal / Workstation',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Terminals & Registers', value: 'ALL' },
          { label: 'POS-01 (Main Retail Counter)', value: 'POS-01' },
          { label: 'POS-02 (Bulk Warehouse Terminal)', value: 'POS-02' },
          { label: 'POS-03 (Express Counter Terminal)', value: 'POS-03' },
          { label: 'POS-04 (Warehouse Dispatch Bay)', value: 'POS-04' },
        ],
      },
      {
        id: 'readingType',
        label: 'Reading Type',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Readings (X & Z)', value: 'ALL' },
          { label: 'Z-Report (End of Day Close)', value: 'Z_REPORT' },
          { label: 'X-Reading (Mid-Day Audit)', value: 'X_REPORT' },
        ],
      },
      {
        id: 'cashierSupervisor',
        label: 'Cashier / Shift Supervisor',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Shift Supervisors', value: 'ALL' },
          { label: 'Rania Eid (Head Supervisor)', value: 'RANIA' },
          { label: 'Ahmad Al-Hajj (Senior Lead)', value: 'AHMAD' },
          { label: 'Ziad Chehab (Operations Mgr)', value: 'ZIAD' },
        ],
      },
    ],
  },

  // --------------------------------------------------------------------------
  // TIME & ATTENDANCE MODULE SCHEMAS
  // --------------------------------------------------------------------------

  'Employee attendance': {
    reportKey: 'Employee attendance',
    reportTitle: 'Employee Attendance & Shift Roster Register',
    code: 'REP_S_00301',
    module: 'sales',
    category: 'Time & Attendance',
    description: 'Daily clock-in/out records, tardiness audits, absenteeism tracking, and authorized leave logs.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'employee',
        label: 'Employee / Staff Member',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Active Employees', value: 'ALL' },
          { label: 'Ahmad Al-Hajj (Milling Operator)', value: 'EMP_001' },
          { label: 'Maya Khoury (Quality Specialist)', value: 'EMP_002' },
          { label: 'Jad Tannous (Bottling Tech)', value: 'EMP_003' },
          { label: 'Nour Saliba (Inventory Clerk)', value: 'EMP_004' },
          { label: 'Ali Al-Husseini (Regional Driver)', value: 'EMP_005' },
          { label: 'Charbel Mattar (Fleet Courier)', value: 'EMP_006' },
          { label: 'Fadi Saade (Pressing Foreman)', value: 'EMP_007' },
        ],
      },
      {
        id: 'department',
        label: 'Department / Division',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Departments', value: 'ALL' },
          { label: 'Executive Administration & Finance', value: 'ADMIN' },
          { label: 'Processing & Pressing Plant', value: 'PLANT' },
          { label: 'Packaging & Automated Bottling', value: 'BOTTLING' },
          { label: 'Logistics, Fleet & Dispatch', value: 'DISPATCH' },
          { label: 'Quality Assurance & Laboratory', value: 'QA' },
          { label: 'Sales & Retail Storefront', value: 'SALES' },
        ],
      },
      {
        id: 'attendanceStatus',
        label: 'Attendance Status',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Attendance States', value: 'ALL' },
          { label: 'Present / On-Time', value: 'PRESENT' },
          { label: 'Late Arrival (> 15 mins)', value: 'LATE' },
          { label: 'Absent (Unexcused)', value: 'ABSENT' },
          { label: 'Approved Annual Leave', value: 'LEAVE_ANNUAL' },
          { label: 'Certified Sick Leave', value: 'LEAVE_SICK' },
        ],
      },
    ],
  },
  'Employee Attendance': {
    reportKey: 'Employee Attendance',
    reportTitle: 'Employee Attendance & Shift Roster Register',
    code: 'REP_S_00301',
    module: 'sales',
    category: 'Time & Attendance',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'employee',
        label: 'Employee / Staff Member',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Active Employees', value: 'ALL' },
          { label: 'Ahmad Al-Hajj (Milling Operator)', value: 'EMP_001' },
          { label: 'Maya Khoury (Quality Specialist)', value: 'EMP_002' },
          { label: 'Jad Tannous (Bottling Tech)', value: 'EMP_003' },
          { label: 'Nour Saliba (Inventory Clerk)', value: 'EMP_004' },
          { label: 'Ali Al-Husseini (Regional Driver)', value: 'EMP_005' },
          { label: 'Charbel Mattar (Fleet Courier)', value: 'EMP_006' },
          { label: 'Fadi Saade (Pressing Foreman)', value: 'EMP_007' },
        ],
      },
      {
        id: 'department',
        label: 'Department / Division',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Departments', value: 'ALL' },
          { label: 'Executive Administration & Finance', value: 'ADMIN' },
          { label: 'Processing & Pressing Plant', value: 'PLANT' },
          { label: 'Packaging & Automated Bottling', value: 'BOTTLING' },
          { label: 'Logistics, Fleet & Dispatch', value: 'DISPATCH' },
          { label: 'Quality Assurance & Laboratory', value: 'QA' },
          { label: 'Sales & Retail Storefront', value: 'SALES' },
        ],
      },
      {
        id: 'attendanceStatus',
        label: 'Attendance Status',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Attendance States', value: 'ALL' },
          { label: 'Present / On-Time', value: 'PRESENT' },
          { label: 'Late Arrival (> 15 mins)', value: 'LATE' },
          { label: 'Absent (Unexcused)', value: 'ABSENT' },
          { label: 'Approved Annual Leave', value: 'LEAVE_ANNUAL' },
          { label: 'Certified Sick Leave', value: 'LEAVE_SICK' },
        ],
      },
    ],
  },

  'Time And Attendance': {
    reportKey: 'Time And Attendance',
    reportTitle: 'Time and Attendance Master Punch Ledger',
    code: 'REP_S_00302',
    module: 'sales',
    category: 'Time & Attendance',
    description: 'Biometric card terminal punches, break intervals, schedule deviations, and overtime audits.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'shiftSchedule',
        label: 'Shift Schedule',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Shift Schedules', value: 'ALL' },
          { label: 'Morning Production Shift (07:00 - 15:30)', value: 'MORNING' },
          { label: 'Evening Pressing Shift (15:00 - 23:30)', value: 'EVENING' },
          { label: 'Night Silo Maintenance (23:00 - 07:30)', value: 'NIGHT' },
          { label: 'Standard Office Schedule (08:30 - 17:00)', value: 'OFFICE' },
        ],
      },
      {
        id: 'overtimeOnly',
        label: 'Overtime Only Toggle',
        type: 'checkbox',
        defaultValue: false,
      },
      {
        id: 'punchExceptionType',
        label: 'Punch Exception Type',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Recorded Punches', value: 'ALL' },
          { label: 'Missing Badge / Punch Out Error', value: 'MISSING_OUT' },
          { label: 'Early Departure (< Shift End)', value: 'EARLY_DEPARTURE' },
          { label: 'Late Arrival (> Grace Period)', value: 'LATE_ARRIVAL' },
          { label: 'Unscheduled Overtime (> 8 hrs)', value: 'OVERTIME' },
        ],
      },
    ],
  },
  'Time and Attendance': {
    reportKey: 'Time and Attendance',
    reportTitle: 'Time and Attendance Master Punch Ledger',
    code: 'REP_S_00302',
    module: 'sales',
    category: 'Time & Attendance',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'shiftSchedule',
        label: 'Shift Schedule',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Shift Schedules', value: 'ALL' },
          { label: 'Morning Production Shift (07:00 - 15:30)', value: 'MORNING' },
          { label: 'Evening Pressing Shift (15:00 - 23:30)', value: 'EVENING' },
          { label: 'Night Silo Maintenance (23:00 - 07:30)', value: 'NIGHT' },
          { label: 'Standard Office Schedule (08:30 - 17:00)', value: 'OFFICE' },
        ],
      },
      {
        id: 'overtimeOnly',
        label: 'Overtime Only Toggle',
        type: 'checkbox',
        defaultValue: false,
      },
      {
        id: 'punchExceptionType',
        label: 'Punch Exception Type',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Recorded Punches', value: 'ALL' },
          { label: 'Missing Badge / Punch Out Error', value: 'MISSING_OUT' },
          { label: 'Early Departure (< Shift End)', value: 'EARLY_DEPARTURE' },
          { label: 'Late Arrival (> Grace Period)', value: 'LATE_ARRIVAL' },
          { label: 'Unscheduled Overtime (> 8 hrs)', value: 'OVERTIME' },
        ],
      },
    ],
  },

  'Labor Cost': {
    reportKey: 'Labor Cost',
    reportTitle: 'Labor Cost & Revenue Allocation Ledger',
    code: 'REP_S_00303',
    module: 'sales',
    category: 'Time & Attendance',
    description: 'Direct and indirect labor burden allocation against pressing batch revenues and cost centers.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'departmentCostCenter',
        label: 'Department / Cost Center',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Departments & Cost Centers', value: 'ALL' },
          { label: 'CC-100 Pressing & Extraction Floor', value: 'CC_100' },
          { label: 'CC-200 Packaging & Bottling Line', value: 'CC_200' },
          { label: 'CC-300 Fleet, Logistics & Drivers', value: 'CC_300' },
          { label: 'CC-400 Retail Storefront & Showroom', value: 'CC_400' },
          { label: 'CC-500 Executive Admin & HR', value: 'CC_500' },
        ],
      },
      {
        id: 'compensationCategory',
        label: 'Compensation Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Compensation Categories', value: 'ALL' },
          { label: 'Regular Base Salary', value: 'SALARY_BASE' },
          { label: 'Hourly Direct Production Wages', value: 'WAGES_HOURLY' },
          { label: 'Overtime Pay Premium (1.5x)', value: 'OVERTIME' },
          { label: 'Sunday & Holiday Shift Differentials', value: 'HOLIDAY' },
          { label: 'Harvest Yield Production Bonuses', value: 'BONUS' },
        ],
      },
    ],
  },

  // --------------------------------------------------------------------------
  // LISTS MODULE SCHEMAS
  // --------------------------------------------------------------------------

  'Customer List Standard': {
    reportKey: 'Customer List Standard',
    reportTitle: 'Customer Master Directory Standard Register',
    code: 'REP_S_00310',
    module: 'sales',
    category: 'Lists',
    description: 'Comprehensive commercial client directory with verified contacts, billing tiers, and balances.',
    filters: [
      STANDARD_BRANCH_FIELD,
      {
        id: 'customerSearch',
        label: 'Customer Search / Lookup',
        type: 'text',
        placeholder: 'Search by Name, Phone, Account #...',
      },
      {
        id: 'customerCategory',
        label: 'Customer Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Wholesale Depot Accounts', value: 'WHOLESALE' },
          { label: 'Retail Walk-in Consumers', value: 'RETAIL' },
          { label: 'Key Accounts & Supermarket Chains', value: 'KEY_ACCOUNTS' },
          { label: 'Hospitality & Horeca', value: 'HORECA' },
        ],
      },
      {
        id: 'balanceFilter',
        label: 'Balance Filter',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Customers (Zero + Debtors)', value: 'ALL' },
          { label: 'With Balance / Debtors Only', value: 'WITH_BALANCE' },
          { label: 'Zero Balance / Fully Settled', value: 'ZERO_BALANCE' },
        ],
      },
    ],
  },

  'Not Active Customers': {
    reportKey: 'Not Active Customers',
    reportTitle: 'Inactive & Dormant Accounts Audit',
    code: 'REP_S_00311',
    module: 'sales',
    category: 'Lists',
    description: 'Accounts with no order activity within the specified churn threshold.',
    filters: [
      {
        id: 'inactivityThreshold',
        label: 'Inactivity Period Threshold',
        type: 'select',
        defaultValue: '60',
        options: [
          { label: 'Inactive > 30 Days', value: '30' },
          { label: 'Inactive > 60 Days (Standard)', value: '60' },
          { label: 'Inactive > 90 Days', value: '90' },
          { label: 'Inactive > 180 Days (Critical Churn)', value: '180' },
        ],
      },
      STANDARD_BRANCH_FIELD,
      {
        id: 'customerCategory',
        label: 'Customer Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Categories', value: 'ALL' },
          { label: 'Wholesale Depot Accounts', value: 'WHOLESALE' },
          { label: 'Retail Store Accounts', value: 'RETAIL' },
          { label: 'Key Accounts & Supermarkets', value: 'KEY_ACCOUNTS' },
        ],
      },
      {
        id: 'lastTransactionBefore',
        label: 'Last Transaction Before Date',
        type: 'date',
        defaultValue: '2026-07-01',
      },
    ],
  },

  'New Customers': {
    reportKey: 'New Customers',
    reportTitle: 'New Customer Accounts Onboarding Ledger',
    code: 'REP_S_00312',
    module: 'sales',
    category: 'Lists',
    description: 'Newly registered commercial buyers, onboarded sales representatives, and conversion velocity.',
    filters: [
      {
        id: 'registrationDate',
        label: 'Registration Date Range',
        type: 'date-range',
        defaultValue: 'This Month',
        options: [
          { label: 'This Week', value: 'This Week' },
          { label: 'This Month', value: 'This Month' },
          { label: 'Last Month', value: 'Last Month' },
          { label: 'This Quarter', value: 'Third Quarter' },
          { label: 'Custom Range', value: 'Custom' },
        ],
      },
      STANDARD_BRANCH_FIELD,
      {
        id: 'onboardedBy',
        label: 'Onboarded By / Sales Rep',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Sales Representatives', value: 'ALL' },
          { label: 'Ahmad Al-Hajj (Senior Rep)', value: 'REP_AHMAD' },
          { label: 'Maya Khoury (Corporate Accounts)', value: 'REP_MAYA' },
          { label: 'Jad Tannous (Regional Wholesale)', value: 'REP_JAD' },
          { label: 'Direct Portal Self-Registration', value: 'PORTAL' },
        ],
      },
      {
        id: 'firstOrderStatus',
        label: 'First Order Status',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All New Customers', value: 'ALL' },
          { label: 'Has Purchased (First Order Active)', value: 'PURCHASED' },
          { label: 'No Transactions Yet (Pending Activation)', value: 'PENDING' },
        ],
      },
    ],
  },

  'Black List Customers': {
    reportKey: 'Black List Customers',
    reportTitle: 'Blacklisted & Delinquent Accounts Ledger',
    code: 'REP_S_00313',
    module: 'sales',
    category: 'Lists',
    description: 'High-risk commercial accounts blocked due to bad debt, bounced cheques, or administrative holds.',
    filters: [
      STANDARD_BRANCH_FIELD,
      {
        id: 'blockReason',
        label: 'Block Reason / Flag',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Block Reasons', value: 'ALL' },
          { label: 'Bounced Cheque / Legal Hold', value: 'BOUNCED_CHEQUE' },
          { label: 'Bad Debt / Defaulted Balance', value: 'BAD_DEBT' },
          { label: 'Administrative / Contract Dispute', value: 'ADMIN_DISPUTE' },
          { label: 'Fraud / Security Risk Hold', value: 'FRAUD_RISK' },
        ],
      },
      {
        id: 'customerSearch',
        label: 'Customer Search',
        type: 'text',
        placeholder: 'Search blocked customer...',
      },
      {
        id: 'minOverdueBalance',
        label: 'Min Overdue Balance Threshold ($)',
        type: 'number',
        defaultValue: 0,
        placeholder: '0.00',
      },
    ],
  },
  'Blacklist Customers': {
    reportKey: 'Blacklist Customers',
    reportTitle: 'Blacklisted & Delinquent Accounts Ledger',
    code: 'REP_S_00313',
    module: 'sales',
    category: 'Lists',
    filters: [
      STANDARD_BRANCH_FIELD,
      {
        id: 'blockReason',
        label: 'Block Reason / Flag',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Block Reasons', value: 'ALL' },
          { label: 'Bounced Cheque / Legal Hold', value: 'BOUNCED_CHEQUE' },
          { label: 'Bad Debt / Defaulted Balance', value: 'BAD_DEBT' },
          { label: 'Administrative / Contract Dispute', value: 'ADMIN_DISPUTE' },
          { label: 'Fraud / Security Risk Hold', value: 'FRAUD_RISK' },
        ],
      },
      {
        id: 'customerSearch',
        label: 'Customer Search',
        type: 'text',
        placeholder: 'Search blocked customer...',
      },
      {
        id: 'minOverdueBalance',
        label: 'Min Overdue Balance Threshold ($)',
        type: 'number',
        defaultValue: 0,
        placeholder: '0.00',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // TRANSACTION MASTER & DUPLICATE INVOICES POLYMORPHIC ENGINE SCHEMAS
  // --------------------------------------------------------------------------

  'Transactions by Salesman': {
    reportKey: 'Transactions by Salesman',
    reportTitle: 'Transactions by Salesman Register',
    code: 'REP_S_00249',
    module: 'sales',
    category: 'Transaction Summary',
    description: 'Transaction log segmented by account executive and commercial sales representative.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'salesman',
        label: 'Salesman / Representative',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Sales Representatives', value: 'ALL' },
          { label: 'Ahmad Al-Hajj (Senior Rep)', value: 'REP_AHMAD' },
          { label: 'Maya Khoury (Corporate Accounts)', value: 'REP_MAYA' },
          { label: 'Jad Tannous (Regional Wholesale)', value: 'REP_JAD' },
          { label: 'Rania Eid (Commercial Supervisor)', value: 'REP_RANIA' },
          { label: 'Ziad Chehab (Key Account Manager)', value: 'REP_ZIAD' },
        ],
      },
    ],
  },

  'Transactions by Date': {
    reportKey: 'Transactions by Date',
    reportTitle: 'Transactions by Date & Time Master Register',
    code: 'REP_S_00247',
    module: 'sales',
    category: 'Transaction Summary',
    description: 'Audited chronological invoice register with exchange rate markers and multi-channel reconciliation.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      INVOICE_TYPE_FILTER,
      DEPARTMENT_CHANNEL_FILTER,
      PAYMENT_TYPE_FILTER,
      {
        id: 'auditFlags',
        label: 'Audit Flags',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Transactions (Standard)', value: 'ALL' },
          { label: 'Show Refund Only', value: 'SHOW_REFUND' },
          { label: 'Show Zero Invoices Only', value: 'SHOW_ZERO' },
          { label: 'Show Discounted Bills', value: 'SHOW_DISCOUNT' },
          { label: 'Show Top 10 Invoices by Amount', value: 'SHOW_TOP_10' },
          { label: 'Show Zero Tax Transactions', value: 'SHOW_ZERO_TAX' },
        ],
      },
      {
        id: 'showRate',
        label: 'Show Rate',
        type: 'checkbox',
        defaultValue: true,
      },
      {
        id: 'groupByDate',
        label: 'Group by Date',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
  },

  'Transactions by Employee by Payment': {
    reportKey: 'Transactions by Employee by Payment',
    reportTitle: 'Transactions by Employee & Payment Tender Register',
    code: 'REP_S_00250',
    module: 'sales',
    category: 'Transaction Summary',
    description: 'Detailed billing cross-tabulation mapping cashiers to tender breakdown and physical takings.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      INVOICE_TYPE_FILTER,
      {
        id: 'employee',
        label: 'Cashier / Employee',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Cashiers & Employees', value: 'ALL' },
          { label: 'Ahmad Al-Hajj', value: 'EMP_AHMAD' },
          { label: 'Maya Khoury', value: 'EMP_MAYA' },
          { label: 'Jad Tannous', value: 'EMP_JAD' },
          { label: 'Nour Saliba', value: 'EMP_NOUR' },
          { label: 'Rania Eid', value: 'EMP_RANIA' },
        ],
      },
      PAYMENT_TYPE_FILTER,
      {
        id: 'realDate',
        label: 'Real Date (Actual Timestamp)',
        type: 'checkbox',
        defaultValue: false,
      },
    ],
  },

  'Transactions by Customers by Employee': {
    reportKey: 'Transactions by Customers by Employee',
    reportTitle: 'Transactions by Customers & Serving Employee',
    code: 'REP_S_00272',
    module: 'sales',
    category: 'Transaction Summary',
    description: 'Cross-tabulated transaction log connecting specific customer accounts to the serving representative.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'employee',
        label: 'Employee / Cashier Selector',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Employees & Cashiers', value: 'ALL' },
          { label: 'Ahmad Al-Hajj', value: 'EMP_AHMAD' },
          { label: 'Maya Khoury', value: 'EMP_MAYA' },
          { label: 'Jad Tannous', value: 'EMP_JAD' },
          { label: 'Nour Saliba', value: 'EMP_NOUR' },
        ],
      },
      {
        id: 'customerAccount',
        label: 'Customer Account Lookup',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Customers & Accounts', value: 'ALL' },
          { label: 'Al-Baraka Supermarket S.A.R.L (CUST-001)', value: 'CUST-001' },
          { label: 'Al-Nour Food Establishment (CUST-002)', value: 'CUST-002' },
          { label: 'Cedars Gourmet Retailers (CUST-003)', value: 'CUST-003' },
          { label: 'Beirut Olive House Wholesale (CUST-004)', value: 'CUST-004' },
        ],
      },
    ],
  },

  'Transactions by Invoice Number': {
    reportKey: 'Transactions by Invoice Number',
    reportTitle: 'Transactions by Invoice Number Sequence Audit',
    code: 'REP_S_00273',
    module: 'sales',
    category: 'Transaction Summary',
    description: 'Strict sequential invoice range ledger verifying numbered billing completeness and missing numbers.',
    filters: [
      STANDARD_BRANCH_FIELD,
      {
        id: 'fromInvoiceNo',
        label: 'From Invoice #',
        type: 'text',
        placeholder: 'e.g. 100001',
      },
      {
        id: 'toInvoiceNo',
        label: 'To Invoice #',
        type: 'text',
        placeholder: 'e.g. 100500',
      },
      {
        id: 'showZeroTax',
        label: 'Show Zero Tax',
        type: 'checkbox',
        defaultValue: false,
      },
    ],
  },

  'Duplicate Invoices': {
    reportKey: 'Duplicate Invoices',
    reportTitle: 'Duplicate Invoices & Master Transaction Engine',
    code: 'REP_S_00188',
    module: 'sales',
    category: 'Internal Control',
    description: 'Master Transaction Engine Container dynamically hosting all 13 transaction report modes.',
    filters: [
      PRIMARY_TRANSACTION_MODE_FIELD,
      ...getDuplicateInvoicesModeFilters('Duplicate Invoices'),
    ],
  },
  'Duplicate Invoices / Audit Search': {
    reportKey: 'Duplicate Invoices / Audit Search',
    reportTitle: 'Duplicate Invoices & Master Transaction Engine',
    code: 'REP_S_00188',
    module: 'sales',
    category: 'Internal Control',
    description: 'Master Transaction Engine Container dynamically hosting all 13 transaction report modes.',
    filters: [
      PRIMARY_TRANSACTION_MODE_FIELD,
      ...getDuplicateInvoicesModeFilters('Duplicate Invoices'),
    ],
  },

  'Transactions by Date by Payment': {
    reportKey: 'Transactions by Date by Payment',
    reportTitle: 'Transactions by Date & Payment Method Cross-Tab',
    code: 'REP_S_00275',
    module: 'sales',
    category: 'Transaction Summary',
    description: 'Chronological sales stream cross-referenced with payment settlement tender.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      INVOICE_TYPE_FILTER,
      PAYMENT_TYPE_FILTER,
      {
        id: 'summaryView',
        label: 'Summary View',
        type: 'checkbox',
        defaultValue: false,
      },
    ],
  },

  'Transactions by Customers': {
    reportKey: 'Transactions by Customers',
    reportTitle: 'Transactions by Customer Accounts Register',
    code: 'REP_S_00276',
    module: 'sales',
    category: 'Transaction Summary',
    description: 'Customer account transactional billing register with tax ID verification status.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      INVOICE_TYPE_FILTER,
      {
        id: 'customerAccount',
        label: 'Customer Account Search',
        type: 'text',
        placeholder: 'Search customer name or ID...',
      },
      {
        id: 'vatStatus',
        label: 'VAT Status Filter',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Customers', value: 'ALL' },
          { label: 'With VAT Number Only', value: 'WITH_VAT' },
          { label: 'Without VAT Number (Exempt / Retail)', value: 'WITHOUT_VAT' },
        ],
      },
    ],
  },

  'Transactions by Customers by Groups': {
    reportKey: 'Transactions by Customers by Groups',
    reportTitle: 'Transactions by Customer Classification Groups',
    code: 'REP_S_00277',
    module: 'sales',
    category: 'Transaction Summary',
    description: 'Sales transactional audit grouped by customer tier, wholesale bracket, and buying group.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      INVOICE_TYPE_FILTER,
      {
        id: 'customerGroup',
        label: 'Customer Group / Classification',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Customer Groups', value: 'ALL' },
          { label: 'Wholesale Depot Accounts', value: 'WHOLESALE' },
          { label: 'Retail Walk-in Consumers', value: 'RETAIL' },
          { label: 'Key Accounts & Hypermarkets', value: 'KEY_ACCOUNTS' },
          { label: 'Hospitality & Horeca Clients', value: 'HORECA' },
        ],
      },
    ],
  },

  'Transactions by Customers Details': {
    reportKey: 'Transactions by Customers Details',
    reportTitle: 'Transactions by Customer Account Details Register',
    code: 'REP_S_00278',
    module: 'sales',
    category: 'Transaction Summary',
    description: 'Exhaustive customer purchase line items, voucher offsets, and balance adjustments.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      INVOICE_TYPE_FILTER,
      {
        id: 'customerAccount',
        label: 'Customer Account Search',
        type: 'text',
        placeholder: 'Filter customer name, phone, code...',
      },
      {
        id: 'summaryView',
        label: 'Summary View',
        type: 'checkbox',
        defaultValue: false,
      },
    ],
  },

  'Transactions by Workstation': {
    reportKey: 'Transactions by Workstation',
    reportTitle: 'Transactions by POS Terminal & Workstation Register',
    code: 'REP_S_00279',
    module: 'sales',
    category: 'Transaction Summary',
    description: 'Hardware terminal transaction log tracking drawer sequences, register audits, and station takings.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      INVOICE_TYPE_FILTER,
      {
        id: 'workstation',
        label: 'POS Terminal / Workstation ID',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Workstations', value: 'ALL' },
          { label: 'POS-01 (Main Front Checkout)', value: 'POS-01' },
          { label: 'POS-02 (Bulk & Deli Terminal)', value: 'POS-02' },
          { label: 'POS-03 (Express Counter)', value: 'POS-03' },
          { label: 'POS-04 (Warehouse Dispatch Desk)', value: 'POS-04' },
        ],
      },
      {
        id: 'realDate',
        label: 'Real Date',
        type: 'checkbox',
        defaultValue: false,
      },
    ],
  },

  'Transactions by Employees': {
    reportKey: 'Transactions by Employees',
    reportTitle: 'Transactions by Serving Employees & Staff Register',
    code: 'REP_S_00286',
    module: 'sales',
    category: 'Transaction Summary',
    description: 'Comprehensive staff sales log grouped by server with timestamp audits.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'serverCashier',
        label: 'Server / Cashier Lookup',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Serving Staff', value: 'ALL' },
          { label: 'Ahmad Al-Hajj', value: 'EMP_AHMAD' },
          { label: 'Maya Khoury', value: 'EMP_MAYA' },
          { label: 'Jad Tannous', value: 'EMP_JAD' },
          { label: 'Nour Saliba', value: 'EMP_NOUR' },
          { label: 'Rania Eid', value: 'EMP_RANIA' },
        ],
      },
      {
        id: 'groupByServer',
        label: 'Group by Server',
        type: 'checkbox',
        defaultValue: true,
      },
      {
        id: 'realDate',
        label: 'Real Date',
        type: 'checkbox',
        defaultValue: false,
      },
    ],
  },

  'Transactions by Source': {
    reportKey: 'Transactions by Source',
    reportTitle: 'Transactions by Source Channel & Fulfillment Hub',
    code: 'REP_S_00287',
    module: 'sales',
    category: 'Transaction Summary',
    description: 'Omnichannel sales transactions segregated by intake portal, showroom, export, and online dispatch.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      INVOICE_TYPE_FILTER,
      DEPARTMENT_CHANNEL_FILTER,
      PAYMENT_TYPE_FILTER,
      {
        id: 'groupByDate',
        label: 'Group by Date',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
  },

  'Cashier Shift Ledger': {
    reportKey: 'Cashier Shift Ledger',
    reportTitle: 'Cashier Shift Audit & Drawer Settlement Ledger',
    code: 'REP_S_00253',
    module: 'sales',
    category: 'Transaction Summary',
    description: 'Detailed cashier shift reconciliation tracking cash drops, terminal totals, and drawer discrepancy over/shorts.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'cashierUser',
        label: 'Cashier / Employee',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Cashiers & Employees', value: 'ALL' },
          { label: 'Ahmad Al-Hajj (Lead Cashier)', value: 'EMP_AHMAD' },
          { label: 'Maya Khoury (Front Desk)', value: 'EMP_MAYA' },
          { label: 'Jad Tannous (Wholesale Bay)', value: 'EMP_JAD' },
          { label: 'Nour Saliba (Terminal Operator)', value: 'EMP_NOUR' },
          { label: 'Rania Eid (Shift Supervisor)', value: 'EMP_RANIA' },
        ],
      },
      {
        id: 'shiftNumber',
        label: 'Shift #',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Shift Sessions', value: 'ALL' },
          { label: 'Shift #1 (Morning Session)', value: 'SHIFT_1' },
          { label: 'Shift #2 (Evening Session)', value: 'SHIFT_2' },
          { label: 'Shift #3 (Night Audit)', value: 'SHIFT_3' },
        ],
      },
      {
        id: 'discrepancyOnly',
        label: 'Discrepancy Only (Over / Short)',
        type: 'checkbox',
        defaultValue: false,
      },
    ],
  },

  'Void and Refund Audit Trail': {
    reportKey: 'Void and Refund Audit Trail',
    reportTitle: 'Void & Refund Managerial Authorization Audit Trail',
    code: 'REP_S_00254',
    module: 'sales',
    category: 'Transaction Summary',
    description: 'Forensic audit register tracking all post-bill voids, item cancellations, manager supervisor approvals, and reason codes.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'supervisorAuthId',
        label: 'Supervisor Authorization ID',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Authorizations', value: 'ALL' },
          { label: 'Rania Eid (Head Supervisor)', value: 'SUP_RANIA' },
          { label: 'Ahmad Al-Hajj (Lead Cashier / Key Holder)', value: 'SUP_AHMAD' },
          { label: 'Ziad Chehab (Operations Manager)', value: 'SUP_ZIAD' },
          { label: 'Master Admin Override', value: 'ADMIN' },
        ],
      },
      {
        id: 'reasonCode',
        label: 'Reason Code',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Reason Codes', value: 'ALL' },
          { label: 'Customer Return / Unsatisfied', value: 'CUST_RETURN' },
          { label: 'Cashier Entry / Ringing Error', value: 'ENTRY_ERROR' },
          { label: 'Price Correction / Markdown', value: 'PRICE_CORRECT' },
          { label: 'Manager Discretion / Quality Hold', value: 'MGR_DISCRETION' },
        ],
      },
      {
        id: 'minAmount',
        label: 'Min Amount Threshold ($)',
        type: 'number',
        defaultValue: 0,
        placeholder: '0.00',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 2. OPERATIONS CENTER MODULE
  // --------------------------------------------------------------------------

  // Wastage Report: Show Date Range, Warehouse/Location, Item Category, Wastage Reason.
  'Wastage Report': {
    reportKey: 'Wastage Report',
    reportTitle: 'Wastage & Production Scrap Loss Report',
    code: 'REP_OPS_006',
    module: 'operations',
    category: 'Quality & Loss',
    description: 'Material shrinkage, processing scrap, packaging defects, and oxidation loss ledger.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      {
        id: 'location',
        label: 'Warehouse / Location',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Locations', value: 'ALL' },
          { label: 'Choueifat Central Facility - Pressing Floor', value: 'CHOUEIFAT_PRESS' },
          { label: 'South Processing Silo & Tanks', value: 'SOUTH_SILO' },
          { label: 'Beirut Cold Storage Depot', value: 'BEIRUT_COLD' },
          { label: 'Raw Olive Intake Receiving Bay', value: 'RAW_BAY' },
          { label: 'Automated Bottling Line A', value: 'LINE_A' },
          { label: 'Tin Packaging Line B', value: 'LINE_B' },
        ],
      },
      {
        id: 'itemCategory',
        label: 'Item Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Item Categories', value: 'ALL' },
          { label: 'Raw Olive Crop Harvest', value: 'RAW_OLIVES' },
          { label: 'Extra Virgin Olive Oil Bulk (L)', value: 'EVOO_BULK' },
          { label: 'Glass Bottles & Containers', value: 'GLASSWARE' },
          { label: 'Food-Grade Tin Packaging', value: 'TINS' },
          { label: 'Filtration Earth & Media', value: 'FILTER_MEDIA' },
        ],
      },
      {
        id: 'wastageReason',
        label: 'Wastage Reason',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Wastage Reasons', value: 'ALL' },
          { label: 'Spoilage & Oxidation', value: 'OXIDATION' },
          { label: 'Bottle Breakage & Line Jam', value: 'BREAKAGE' },
          { label: 'Decanter Sludge Residuals', value: 'DECANTER_SLUDGE' },
          { label: 'QA Acidic Failure / Lab Rejection', value: 'LAB_REJECT' },
          { label: 'Defective Valve / Spillage', value: 'SPILLAGE' },
          { label: 'Shelf-Life Expiry', value: 'EXPIRY' },
        ],
      },
      {
        id: 'includeCostBurden',
        label: 'Calculate Financial Loss Cost ($)',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
  },

  // Purchase Details: Show Date Range, Supplier dropdown, Branch, Invoice status.
  'Purchase Details': {
    reportKey: 'Purchase Details',
    reportTitle: 'Purchase Details & Supplier Invoices Ledger',
    code: 'REP_OPS_007',
    module: 'operations',
    category: 'Procurement',
    description: 'Comprehensive registry of inbound raw crops, dry goods packaging, and supplier settlements.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      {
        id: 'supplier',
        label: 'Supplier',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Suppliers', value: 'ALL' },
          { label: 'South Lebanon Olive Farmers Co-op', value: 'VEND_SOUTH_COOP' },
          { label: 'Mediterranean Bottle & Glass Works', value: 'VEND_MED_GLASS' },
          { label: 'Al-Hilal Tin Containers & Drums', value: 'VEND_AL_HILAL' },
          { label: 'Mount Lebanon Agricultural Association', value: 'VEND_MT_LEBANON' },
          { label: 'Bekaa Grove Growers Network', value: 'VEND_BEKAA_GROWERS' },
        ],
      },
      STANDARD_BRANCH_FIELD,
      {
        id: 'invoiceStatus',
        label: 'Invoice Status',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Received & QA Verified', value: 'VERIFIED' },
          { label: 'Pending QA Inspection', value: 'PENDING_QA' },
          { label: 'Partial Delivery Handed Over', value: 'PARTIAL' },
          { label: 'Paid & Closed', value: 'SETTLED' },
          { label: 'Disputed / Returned', value: 'DISPUTED' },
        ],
      },
      {
        id: 'currencyFilter',
        label: 'Settlement Currency',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Currencies', value: 'ALL' },
          { label: 'USD ($)', value: 'USD' },
          { label: 'LBP (Lebanese Pounds)', value: 'LBP' },
        ],
      },
    ],
  },

  'Production & Extraction Logs': {
    reportKey: 'Production & Extraction Logs',
    reportTitle: 'Production & Olive Extraction Logs',
    code: 'REP_OPS_001',
    module: 'operations',
    category: 'Extraction',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      {
        id: 'shiftLine',
        label: 'Shift / Line',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Lines & Shifts', value: 'ALL' },
          { label: 'Pressing Line 01 (Choueifat)', value: 'Line 01' },
          { label: 'Pressing Line 02 (South Plant)', value: 'Line 02' },
          { label: 'Shift A (06:00 - 14:00)', value: 'Shift A' },
          { label: 'Shift B (14:00 - 22:00)', value: 'Shift B' },
        ],
      },
      {
        id: 'growerSource',
        label: 'Grower / Crop Source',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Growers', value: 'ALL' },
          { label: 'Hasbaya Olive Groves', value: 'Hasbaya' },
          { label: 'Koura Estate Organic Harvest', value: 'Koura' },
          { label: 'Chouf Cooperative', value: 'Chouf' },
        ],
      },
      {
        id: 'status',
        label: 'Extraction Status',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Optimal / Completed', value: 'COMPLETED' },
          { label: 'In Progress', value: 'IN_PROGRESS' },
          { label: 'Quality Hold', value: 'QUALITY_HOLD' },
        ],
      },
    ],
  },

  'Work Orders & Assembly Tracking': {
    reportKey: 'Work Orders & Assembly Tracking',
    reportTitle: 'Work Orders & Packaging Assembly Tracking',
    code: 'REP_OPS_004',
    module: 'operations',
    category: 'Manufacturing',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      {
        id: 'line',
        label: 'Packaging Line',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Lines', value: 'ALL' },
          { label: 'Bottling Line A', value: 'Bottling Line A' },
          { label: 'Packaging Line B', value: 'Packaging Line B' },
        ],
      },
      {
        id: 'priority',
        label: 'Priority',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Priorities', value: 'ALL' },
          { label: 'Urgent', value: 'URGENT' },
          { label: 'High', value: 'HIGH' },
          { label: 'Normal', value: 'NORMAL' },
        ],
      },
      {
        id: 'status',
        label: 'Work Order State',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All States', value: 'ALL' },
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'In Progress', value: 'IN_PROGRESS' },
          { label: 'Scheduled', value: 'SCHEDULED' },
        ],
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 3. ACCOUNTING & FINANCE MODULE
  // --------------------------------------------------------------------------

  // General Ledger: Show Fiscal Year/Period, Account Code Range, Sub-ledger toggle.
  'General Ledger': {
    reportKey: 'General Ledger',
    reportTitle: 'General Ledger Detail & Audit Register',
    code: 'REP_ACC_005',
    module: 'accounting',
    category: 'Financial Statements',
    description: 'Complete double-entry accounting ledger with debits, credits, and progressive running balances.',
    filters: [
      {
        id: 'fiscalPeriod',
        label: 'Fiscal Year / Period',
        type: 'select',
        defaultValue: 'FY2026_Q3',
        options: [
          { label: 'FY 2026 - Q3 (Current Active)', value: 'FY2026_Q3' },
          { label: 'FY 2026 - Q2 (Apr - Jun)', value: 'FY2026_Q2' },
          { label: 'FY 2026 - Q1 (Jan - Mar)', value: 'FY2026_Q1' },
          { label: 'FY 2025 - Full Audited Year', value: 'FY2025_FULL' },
          { label: 'Custom Date Range', value: 'CUSTOM' },
        ],
      },
      {
        id: 'accountCodeRange',
        label: 'Account Code Range',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Accounts (1000 - 9999)', value: 'ALL' },
          { label: '1000s - Assets & Cash Equivalents', value: 'ASSETS_1000' },
          { label: '2000s - Liabilities & Payables', value: 'LIAB_2000' },
          { label: '3000s - Equity & Share Capital', value: 'EQUITY_3000' },
          { label: '4000s - Operating Revenue', value: 'REV_4000' },
          { label: '5000s - Direct Procurement (COGS)', value: 'COGS_5000' },
          { label: '6000s - Operating & Admin Overhead', value: 'OPEX_6000' },
          { label: '7000s-8000s - Tax & Depreciation', value: 'TAX_DEPR' },
        ],
      },
      STANDARD_BRANCH_FIELD,
      {
        id: 'currency',
        label: 'Reporting Currency',
        type: 'select',
        defaultValue: 'USD',
        options: [
          { label: 'USD ($) - Base Currency', value: 'USD' },
          { label: 'LBP (Lebanese Pounds)', value: 'LBP' },
          { label: 'Dual Currency View', value: 'DUAL' },
        ],
      },
      {
        id: 'includeSubLedgers',
        label: 'Include Sub-Ledgers & Subsidiary Accounts',
        type: 'checkbox',
        defaultValue: true,
      },
      {
        id: 'showUnposted',
        label: 'Show Unposted / Draft Vouchers',
        type: 'checkbox',
        defaultValue: false,
      },
    ],
  },

  'Income Statement': {
    reportKey: 'Income Statement',
    reportTitle: 'Income Statement (Profit & Loss)',
    code: 'REP_ACC_001',
    module: 'accounting',
    category: 'Financial Statements',
    filters: [
      {
        id: 'fiscalPeriod',
        label: 'Reporting Period',
        type: 'select',
        defaultValue: 'This Quarter',
        options: [
          { label: 'This Month', value: 'This Month' },
          { label: 'This Quarter', value: 'This Quarter' },
          { label: 'Year to Date (YTD)', value: 'YTD' },
          { label: 'Prior Year Full', value: 'PRIOR_YEAR' },
        ],
      },
      STANDARD_BRANCH_FIELD,
      {
        id: 'comparisonPeriod',
        label: 'Comparison View',
        type: 'select',
        defaultValue: 'PREV_PERIOD',
        options: [
          { label: 'Compare with Previous Period', value: 'PREV_PERIOD' },
          { label: 'Compare with Prior Year (YoY)', value: 'YOY' },
          { label: 'Compare with Budget Target', value: 'BUDGET' },
          { label: 'None (Standalone Period)', value: 'NONE' },
        ],
      },
      {
        id: 'showTaxes',
        label: 'Show Net of Tax Breakdown',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
  },

  'Receivables': {
    reportKey: 'Receivables',
    reportTitle: 'Accounts Receivable (AR) Aging Summary',
    code: 'REP_ACC_003',
    module: 'accounting',
    category: 'Ledgers & Accounts',
    filters: [
      {
        id: 'asOfDate',
        label: 'As-of Aging Date',
        type: 'date',
        defaultValue: '2026-09-15',
      },
      STANDARD_BRANCH_FIELD,
      {
        id: 'riskLevel',
        label: 'Risk Classification',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Risk Categories', value: 'ALL' },
          { label: 'High Risk (90+ Days Overdue)', value: 'HIGH' },
          { label: 'Medium Risk (30-60 Days)', value: 'MEDIUM' },
          { label: 'Current / Low Risk', value: 'LOW' },
        ],
      },
      {
        id: 'minBalance',
        label: 'Min Debt Threshold ($)',
        type: 'number',
        defaultValue: 0,
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 4. SUPERSONIC FLEET MODULE
  // --------------------------------------------------------------------------

  // REP_FLT_001: Deliveries & Dispatch Logs
  'Deliveries & Dispatch Logs': {
    reportKey: 'Deliveries & Dispatch Logs',
    reportTitle: 'Deliveries & Dispatch Logs Register',
    code: 'REP_FLT_001',
    module: 'fleet',
    category: 'Dispatch & Corridors',
    description: 'Real-time dispatch orders, assigned couriers, destination corridors, and delivery status tracking.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      {
        id: 'driver',
        label: 'Assigned Driver / Courier',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Couriers & Drivers', value: 'ALL' },
          { label: 'Fadi Abou Assi', value: 'Fadi Abou Assi' },
          { label: 'Mohammad Al-Husseini', value: 'Mohammad Al-Husseini' },
          { label: 'Charbel Rahme', value: 'Charbel Rahme' },
          { label: 'Khaled Merhi', value: 'Khaled Merhi' },
          { label: 'Tony Khoury', value: 'Tony Khoury' },
          { label: 'Ahmad Zein', value: 'Ahmad Zein' },
          { label: 'Hassan Sleiman', value: 'Hassan Sleiman' },
        ],
      },
      {
        id: 'corridor',
        label: 'Regional Corridor',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Regional Corridors', value: 'ALL' },
          { label: 'Corridor 1: Beirut Central - Verdun Axis', value: '1' },
          { label: 'Corridor 2: Aley & Mount Lebanon Spine', value: '2' },
          { label: 'Corridor 3: Sidon & South Coastal Highway', value: '3' },
          { label: 'Corridor 4: Jounieh - Byblos - North Highway', value: '4' },
          { label: 'Corridor 5: Bekaa Valley Highway (Chtaura/Zahle)', value: '5' },
        ],
      },
      {
        id: 'deliveryStatus',
        label: 'Delivery Status',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Delivered (Success)', value: 'DELIVERED' },
          { label: 'On Route (En Transit)', value: 'ON_ROUTE' },
          { label: 'Queued for Loading', value: 'QUEUED' },
          { label: 'Pending Dispatch', value: 'PENDING' },
          { label: 'Rejected (Return)', value: 'REJECTED' },
          { label: 'Moved to POS Pickup', value: 'MOVED_TO_POS_PICKUP' },
        ],
      },
      {
        id: 'searchQuery',
        label: 'Search Shipments',
        type: 'text',
        placeholder: 'Search waybill #, customer, town, driver...',
      },
    ],
  },

  // REP_FLT_002: Driver Performance & Reconciliation
  'Driver Performance & Reconciliation': {
    reportKey: 'Driver Performance & Reconciliation',
    reportTitle: 'Courier Daily Performance & Trip Reconciliations',
    code: 'REP_FLT_002',
    module: 'fleet',
    category: 'Driver Reconciliation',
    description: 'Audited delivery efficiency, run counts, cash collections, and success ratings per driver.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      {
        id: 'driver',
        label: 'Driver / Courier',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Couriers & Drivers', value: 'ALL' },
          { label: 'Fadi Abou Assi', value: 'Fadi Abou Assi' },
          { label: 'Mohammad Al-Husseini', value: 'Mohammad Al-Husseini' },
          { label: 'Charbel Rahme', value: 'Charbel Rahme' },
          { label: 'Khaled Merhi', value: 'Khaled Merhi' },
          { label: 'Tony Khoury', value: 'Tony Khoury' },
          { label: 'Ahmad Zein', value: 'Ahmad Zein' },
          { label: 'Hassan Sleiman', value: 'Hassan Sleiman' },
        ],
      },
      {
        id: 'searchQuery',
        label: 'Filter Couriers',
        type: 'text',
        placeholder: 'Search driver name, phone, or asset...',
      },
    ],
  },

  // REP_FLT_003: COD, Whish & Cash Settlements
  'COD, Whish & Cash Settlements': {
    reportKey: 'COD, Whish & Cash Settlements',
    reportTitle: 'SuperSonic Financial Settlements & Treasury Reconciliations',
    code: 'REP_FLT_003',
    module: 'fleet',
    category: 'Settlements & Vault',
    description: 'Driver physical cash handovers, Whish digital transfers, and 3PL merchant disbursements.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      {
        id: 'driver',
        label: 'Driver / Merchant',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Drivers & Merchants', value: 'ALL' },
          { label: 'Tony Khoury', value: 'Tony Khoury' },
          { label: 'La Rose Fashion Boutique', value: 'La Rose Fashion Boutique' },
          { label: 'Hassan Sleiman', value: 'Hassan Sleiman' },
          { label: 'Fadi Abou Assi', value: 'Fadi Abou Assi' },
        ],
      },
      {
        id: 'paymentType',
        label: 'Payment Classification',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Payment Types', value: 'ALL' },
          { label: 'Vault Cash Handover', value: 'VAULT_CASH' },
          { label: 'Whish Digital Transfer', value: 'WHISH_TRANSFER' },
          { label: 'Merchant COD Remittance', value: 'MERCHANT_REMITTANCE' },
          { label: 'SuperSonic Operating Revenue', value: 'DELIVERY_REVENUE' },
        ],
      },
      {
        id: 'auditStatus',
        label: 'Audit Status',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Audit Statuses', value: 'ALL' },
          { label: 'Cleared & Reconciled', value: 'CLEARED' },
          { label: 'Pending Vault Audit', value: 'PENDING_AUDIT' },
        ],
      },
      {
        id: 'searchQuery',
        label: 'Search Settlements',
        type: 'text',
        placeholder: 'Search voucher #, account, notes...',
      },
    ],
  },

  // REP_FLT_004: Fulfillment Transition Audit Trail
  'Fulfillment Transition Audit Trail': {
    reportKey: 'Fulfillment Transition Audit Trail',
    reportTitle: 'Fulfillment Transition & Operational Audit Trail',
    code: 'REP_FLT_004',
    module: 'fleet',
    category: 'Audit & Transitions',
    description: 'Full system tracking of orders converted between Fleet Delivery Dispatch and Showroom POS Pickup.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      {
        id: 'actionType',
        label: 'Fulfillment Action',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Transition Actions', value: 'ALL' },
          { label: 'Moved to POS Pickup', value: 'MOVED_TO_POS' },
          { label: 'Returned to Delivery Dispatch', value: 'RETURNED_TO_DELIVERY' },
        ],
      },
      {
        id: 'actorRole',
        label: 'Operator Role',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Operator Roles', value: 'ALL' },
          { label: 'Management Override', value: 'MANAGEMENT' },
          { label: 'Dispatch Representative', value: 'REPRESENTATIVE' },
        ],
      },
      {
        id: 'searchQuery',
        label: 'Search Audit Trail',
        type: 'text',
        placeholder: 'Search order #, customer, user code...',
      },
    ],
  },

  // REP_FLT_005: Vehicle Trips & Odometer Asset Log
  'Vehicle Trips': {
    reportKey: 'Vehicle Trips',
    reportTitle: 'Vehicle Trips & Fleet Dispatch Logs',
    code: 'REP_FLT_005',
    module: 'fleet',
    category: 'Fleet Operations',
    description: 'Vehicle GPS routes, dispatched trip waybills, courier assignments, and delivery performance.',
    filters: [
      {
        id: 'vehicleId',
        label: 'Vehicle ID',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Fleet Vehicles', value: 'ALL' },
          { label: 'Plate G-183921 (Isuzu 4.5T Box)', value: 'G-183921' },
          { label: 'Plate T-492102 (Mercedes Atego 8T)', value: 'T-492102' },
          { label: 'Plate B-310928 (Hino 300 Flatbed)', value: 'B-310928' },
          { label: 'Plate Z-102948 (Renault Master Van)', value: 'Z-102948' },
          { label: 'Plate B-492102 (Toyota Dyna 3.5T)', value: 'B-492102' },
        ],
      },
      {
        id: 'driver',
        label: 'Assigned Driver',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Couriers & Drivers', value: 'ALL' },
          { label: 'Fadi Abou Assi', value: 'Fadi Abou Assi' },
          { label: 'Mohammad Al-Husseini', value: 'Mohammad Al-Husseini' },
          { label: 'Charbel Rahme', value: 'Charbel Rahme' },
          { label: 'Tarek Khoury', value: 'Tarek Khoury' },
          { label: 'Tony Khoury', value: 'Tony Khoury' },
        ],
      },
      STANDARD_DATE_RANGE_FIELD,
      {
        id: 'corridor',
        label: 'Regional Corridor',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Regional Corridors', value: 'ALL' },
          { label: 'Corridor 1: Beirut Central - Verdun Axis', value: '1' },
          { label: 'Corridor 2: Aley & Mount Lebanon Spine', value: '2' },
          { label: 'Corridor 3: Sidon & South Coastal Highway', value: '3' },
          { label: 'Corridor 4: Jounieh - Byblos - North Highway', value: '4' },
          { label: 'Corridor 5: Bekaa Valley Highway (Chtaura/Zahle)', value: '5' },
        ],
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 5. LOYALTY MANAGEMENT MODULE
  // --------------------------------------------------------------------------

  'Loyalty Program Members Roster': {
    reportKey: 'Loyalty Program Members Roster',
    reportTitle: 'Loyalty Program Members Roster & Tier Census',
    code: 'REP_LOY_001',
    module: 'loyalty',
    category: 'Member Activity & Engagement',
    filters: [
      {
        id: 'tierFilter',
        label: 'Membership Tier',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Tiers', value: 'ALL' },
          { label: 'Platinum VIP', value: 'PLATINUM' },
          { label: 'Gold Tier', value: 'GOLD' },
          { label: 'Silver Tier', value: 'SILVER' },
          { label: 'Bronze Entry', value: 'BRONZE' },
        ],
      },
      {
        id: 'status',
        label: 'Account Status',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Active & Engaged', value: 'ACTIVE' },
          { label: 'Churn Risk (No orders in 60d)', value: 'CHURN_RISK' },
          { label: 'Inactive / Dormant', value: 'INACTIVE' },
        ],
      },
      STANDARD_DATE_RANGE_FIELD,
      {
        id: 'searchQuery',
        label: 'Member Search',
        type: 'text',
        placeholder: 'Search name, phone, or ID...',
      },
    ],
  },

  'Points Accrual & Redemption Ledger': {
    reportKey: 'Points Accrual & Redemption Ledger',
    reportTitle: 'Points Accrual & Redemption Audit Ledger',
    code: 'REP_LOY_002',
    module: 'loyalty',
    category: 'Points Ledgers & Financial Liability',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      {
        id: 'transactionType',
        label: 'Transaction Type',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Transaction Types', value: 'ALL' },
          { label: 'Purchase Accrual (+)', value: 'PURCHASE_ACCRUAL' },
          { label: 'Gift / Voucher Redemption (-)', value: 'GIFT_REDEMPTION' },
          { label: 'Harvest Promotion Bonus (+)', value: 'HARVEST_PROMO' },
          { label: 'Points Expiration Revocation (-)', value: 'EXPIRATION' },
        ],
      },
      {
        id: 'tierFilter',
        label: 'Member Tier',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Tiers', value: 'ALL' },
          { label: 'Platinum', value: 'PLATINUM' },
          { label: 'Gold', value: 'GOLD' },
          { label: 'Silver', value: 'SILVER' },
          { label: 'Bronze', value: 'BRONZE' },
        ],
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 6. SOCIAL CRM MODULE
  // --------------------------------------------------------------------------

  'Social Orders & Conversion Reconciliation': {
    reportKey: 'Social Orders & Conversion Reconciliation',
    reportTitle: 'Social Orders & Omnichannel Conversion Audit',
    code: 'REP_SOC_001',
    module: 'social',
    category: 'Orders & Fulfillment',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      {
        id: 'platform',
        label: 'Social Platform',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Platforms', value: 'ALL' },
          { label: 'WhatsApp Direct Chat', value: 'WhatsApp' },
          { label: 'Instagram Direct', value: 'Instagram' },
          { label: 'TikTok Shop & Chat', value: 'TikTok' },
          { label: 'Facebook Messenger', value: 'Facebook' },
        ],
      },
      {
        id: 'orderStage',
        label: 'Conversion Stage',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Stages', value: 'ALL' },
          { label: 'Converted & Invoiced', value: 'CONVERTED' },
          { label: 'Delivered & Settled', value: 'DELIVERED' },
          { label: 'In Progress / Quoted', value: 'IN_PROGRESS' },
          { label: 'Lost Opportunity', value: 'LOST' },
        ],
      },
      {
        id: 'repName',
        label: 'Representative',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Representatives', value: 'ALL' },
          { label: 'Ahmad Ali Kassem', value: 'Ahmad Ali Kassem' },
          { label: 'Hiba Aloulou', value: 'Hiba Aloulou' },
          { label: 'Karim Masri', value: 'Karim Masri' },
          { label: 'Nour El-Hajj', value: 'Nour El-Hajj' },
        ],
      },
    ],
  },

  'Ad Campaigns, CPL & ROAS Performance': {
    reportKey: 'Ad Campaigns, CPL & ROAS Performance',
    reportTitle: 'Omnichannel Ad Campaigns & ROAS Analysis',
    code: 'REP_SOC_002',
    module: 'social',
    category: 'Ad Campaigns & CPL',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      {
        id: 'channelPlatform',
        label: 'Ad Network Channel',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Ad Networks', value: 'ALL' },
          { label: 'Meta (Instagram & Facebook)', value: 'Meta' },
          { label: 'TikTok Ads Network', value: 'TikTok' },
          { label: 'Google Search & YouTube', value: 'Google' },
        ],
      },
      {
        id: 'campaignStatus',
        label: 'Campaign Status',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'Scheduled', value: 'SCHEDULED' },
        ],
      },
      {
        id: 'minRoas',
        label: 'Min Return on Ad Spend (ROAS)',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'Any ROAS', value: 'ALL' },
          { label: 'High Performers (> 4.0x)', value: 'HIGH' },
          { label: 'Acceptable (2.0x - 4.0x)', value: 'MEDIUM' },
          { label: 'Sub-Optimal (< 2.0x)', value: 'LOW' },
        ],
      },
    ],
  },

  // REP_SOC_003: Support Agent SLA & Commission Breakdown
  'Support Agent SLA & Commission Breakdown': {
    reportKey: 'Support Agent SLA & Commission Breakdown',
    reportTitle: 'Support & Sales Representative Compensation Statement',
    code: 'REP_SOC_003',
    module: 'social',
    category: 'Support & Commissions',
    description: 'Closed chat conversions, response time SLA, and earned sales commissions per agent.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      {
        id: 'repName',
        label: 'Representative',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Representatives', value: 'ALL' },
          { label: 'Ahmad Ali Kassem', value: 'Ahmad Ali Kassem' },
          { label: 'Hiba Aloulou', value: 'Hiba Aloulou' },
          { label: 'Karim Masri', value: 'Karim Masri' },
          { label: 'Nour El-Hajj', value: 'Nour El-Hajj' },
        ],
      },
      {
        id: 'searchQuery',
        label: 'Filter Agents',
        type: 'text',
        placeholder: 'Search agent name, code, channel...',
      },
    ],
  },

  // REP_SOC_004: Omnichannel Lead Attribution by Channel
  'Omnichannel Lead Attribution by Channel': {
    reportKey: 'Omnichannel Lead Attribution by Channel',
    reportTitle: 'Omnichannel Channel Breakdown & Lead Conversion Efficiency',
    code: 'REP_SOC_004',
    module: 'social',
    category: 'Channel Attribution',
    description: 'Comparative attribution of inquiries, closed sales, and revenue across social communication platforms.',
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      {
        id: 'platform',
        label: 'Channel Platform',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Channels', value: 'ALL' },
          { label: 'WhatsApp Direct Chat', value: 'WhatsApp' },
          { label: 'Instagram Direct', value: 'Instagram' },
          { label: 'TikTok Shop & Chat', value: 'TikTok' },
          { label: 'Facebook Messenger', value: 'Facebook' },
        ],
      },
      {
        id: 'searchQuery',
        label: 'Search Channel Data',
        type: 'text',
        placeholder: 'Search platform or notes...',
      },
    ],
  },
};

// ============================================================================
// HELPER: GET REPORT CONFIGURATION WITH SMART FALLBACK RESOLUTION
// ============================================================================

export function getReportConfig(
  reportNameOrCode: string = '',
  moduleContext: 'sales' | 'operations' | 'loyalty' | 'accounting' | 'fleet' | 'social' | 'general' = 'general'
): ReportConfig {
  const cleanKey = reportNameOrCode.trim();

  // 1. Direct key match in registry
  if (REPORT_CONFIG_REGISTRY[cleanKey]) {
    return REPORT_CONFIG_REGISTRY[cleanKey];
  }

  // 2. Direct code match in registry (e.g. REP_S_00270, REP_S_00269, etc.)
  const matchByCode = Object.values(REPORT_CONFIG_REGISTRY).find(
    (cfg) => cfg.code && cfg.code.toLowerCase() === cleanKey.toLowerCase()
  );
  if (matchByCode) {
    return matchByCode;
  }

  // 3. Case-insensitive key match in registry
  const lower = cleanKey.toLowerCase();
  const matchByCase = Object.entries(REPORT_CONFIG_REGISTRY).find(
    ([k]) => k.toLowerCase() === lower
  );
  if (matchByCase) {
    return matchByCase[1];
  }

  // 4. Substring & Alias matching for known reports (Prioritized from specific to general)

  // --- VOIDS & REFUNDS ---
  // Details of Refund (Must be checked BEFORE generic refund)
  if (lower.includes('details of refund') || cleanKey === 'REP_S_00274') {
    return REPORT_CONFIG_REGISTRY['Details of Refund'] || REPORT_CONFIG_REGISTRY['Details of refunds'];
  }
  // Voids (Retained)
  if (lower.includes('void') || lower.includes('cancellation') || cleanKey === 'REP_S_00184' || cleanKey === 'REP_SALES_003') {
    return REPORT_CONFIG_REGISTRY['Summary of Voids'];
  }
  // Summary of Refunds (Retained)
  if (lower.includes('refund') || lower.includes('credit note') || cleanKey === 'REP_S_00185' || cleanKey === 'REP_SALES_005') {
    return REPORT_CONFIG_REGISTRY['Summary of Refunds'];
  }

  // --- TOP PERFORMERS (PARETO / RANKING ANALYSIS) ---
  if ((lower.includes('top n') && (lower.includes('quantity') || lower.includes('qty'))) || cleanKey === 'REP_S_00270') {
    return REPORT_CONFIG_REGISTRY['Top N Sold by Quantity'] || REPORT_CONFIG_REGISTRY['Top N sold by Quantity'];
  }
  if ((lower.includes('top n') && (lower.includes('amount') || lower.includes('revenue') || lower.includes('value'))) || cleanKey === 'REP_S_00271') {
    return REPORT_CONFIG_REGISTRY['Top N Sold by Amount'] || REPORT_CONFIG_REGISTRY['Top N sold by Amount'];
  }

  // --- COMPARATIVE BY BRANCH (CROSS-FACILITY BENCHMARK) ---
  if (cleanKey === 'REP_S_00269' || (lower.includes('by items') && (lower.includes('branch') || lower.includes('comparative')))) {
    return REPORT_CONFIG_REGISTRY['Sales By Items'];
  }
  if (cleanKey === 'REP_S_00266' || (lower.includes('by category') && !lower.includes('categories') && !lower.includes('department') && !lower.includes('employee'))) {
    return REPORT_CONFIG_REGISTRY['Sales by Category'] || REPORT_CONFIG_REGISTRY['Sales By Category'];
  }
  if (cleanKey === 'REP_S_00267' || (lower.includes('by division') && !lower.includes('divisions'))) {
    return REPORT_CONFIG_REGISTRY['Sales by Division'] || REPORT_CONFIG_REGISTRY['Sales By Division'];
  }
  if (lower.includes('by groups') || lower.includes('by group') || cleanKey === 'REP_S_00268') {
    return REPORT_CONFIG_REGISTRY['Sales by Groups'] || REPORT_CONFIG_REGISTRY['Sales By Groups'];
  }

  // --- PRODUCT SALES CORE ---
  if (lower.includes('one sales item') || lower.includes('one item') || cleanKey === 'REP_S_00258') {
    return REPORT_CONFIG_REGISTRY['Sales Details for One Sales Item'] || REPORT_CONFIG_REGISTRY['Sales details for one sales item'];
  }
  if (lower.includes('customer by item') || cleanKey === 'REP_S_00259') {
    return REPORT_CONFIG_REGISTRY['Sales by Customer by Item'] || REPORT_CONFIG_REGISTRY['Sales By Customer By Items'];
  }
  if (lower.includes('items by transaction') || lower.includes('item by transaction') || cleanKey === 'REP_S_00263') {
    return REPORT_CONFIG_REGISTRY['Sales Items by Transaction'];
  }
  if (lower.includes('not sold') || lower.includes('dead inventory') || cleanKey === 'REP_S_00264') {
    return REPORT_CONFIG_REGISTRY['Not Sold Items'];
  }
  if (lower.includes('serial number') || lower.includes('barcode query') || cleanKey === 'REP_S_00265') {
    return REPORT_CONFIG_REGISTRY['Sold Serial Numbers'];
  }
  if (lower.includes('daily sales') || cleanKey === 'REP_S_00260') {
    return REPORT_CONFIG_REGISTRY['Daily Sales by Item'] || REPORT_CONFIG_REGISTRY['Daily Sales By Items'];
  }
  if (lower.includes('by categories') || cleanKey === 'REP_S_00261') {
    return REPORT_CONFIG_REGISTRY['Sales by Categories'] || REPORT_CONFIG_REGISTRY['Sales By Categories'];
  }
  if (lower.includes('by divisions') || cleanKey === 'REP_S_00262') {
    return REPORT_CONFIG_REGISTRY['Sales by Divisions'] || REPORT_CONFIG_REGISTRY['Sales By Divisions'];
  }

  // --- CUSTOMER SALES MODULE ---
  if (lower.includes('top n customer') || cleanKey === 'REP_S_00280') {
    return REPORT_CONFIG_REGISTRY['Top N Customers by Amount'];
  }
  if (lower === 'sales by customers' || cleanKey === 'REP_S_00285') {
    return REPORT_CONFIG_REGISTRY['Sales by Customers'];
  }
  if (lower.includes('customer in detail') || lower.includes('customer in-detail') || cleanKey === 'REP_S_00281') {
    return REPORT_CONFIG_REGISTRY['Customer in Detail'] || REPORT_CONFIG_REGISTRY['Sales by customer In Detail'];
  }
  if (lower.includes('by zone') || cleanKey === 'REP_S_00282') {
    return REPORT_CONFIG_REGISTRY['Sales by Zone'] || REPORT_CONFIG_REGISTRY['Sales by zone'];
  }
  if (lower.includes('delivery sales') || cleanKey === 'REP_S_00283') {
    return REPORT_CONFIG_REGISTRY['Delivery Sales Summary'];
  }
  if (lower.includes('driver') || cleanKey === 'REP_S_00284') {
    return REPORT_CONFIG_REGISTRY["Driver's History"] || REPORT_CONFIG_REGISTRY['Drivers History'];
  }

  // --- TODAY'S & HISTORY MODULE ---
  if (lower === "today's statistics" || lower === "today's sales" || cleanKey === 'REP_S_00187' || cleanKey === 'REP_S_00186') {
    return REPORT_CONFIG_REGISTRY["Today's Statistics"];
  }
  if (lower.includes('reading / x') || lower.includes('x-report') || lower.includes('x-reading') || cleanKey === 'REP_S_00197') {
    return REPORT_CONFIG_REGISTRY["Today's Statistics"];
  }
  if (lower.includes('main reading history') || lower.includes('reading history') || lower.includes('z-report') || cleanKey === 'REP_S_00291') {
    return REPORT_CONFIG_REGISTRY['Main Reading History'];
  }
  if (lower.includes('preview older sales') || lower.includes('older sales') || lower.includes('older shift') || lower.includes('shift audit') || cleanKey === 'REP_S_00290' || cleanKey === 'REP_S_00292' || cleanKey === 'REP_S_00293') {
    return REPORT_CONFIG_REGISTRY['Preview Older Sales'];
  }
  if (lower.includes("today's summary of payment") || lower.includes('batch settlement') || cleanKey === 'REP_SALES_004' || cleanKey === 'REP_S_00194' || cleanKey === 'REP_S_00295') {
    return REPORT_CONFIG_REGISTRY["Today's Summary of payment"] || REPORT_CONFIG_REGISTRY["Today's Summary of Payment"];
  }
  if (lower.includes("today's summary by employee") || cleanKey === 'REP_SALES_003' || cleanKey === 'REP_S_00196') {
    return REPORT_CONFIG_REGISTRY["Today's summary by Employee"] || REPORT_CONFIG_REGISTRY["Today's Summary by Employee"];
  }
  if (lower.includes("today's transaction") || lower.includes('transactions history') || lower.includes('transaction history') || cleanKey === 'REP_S_00195' || cleanKey === 'REP_S_00294') {
    return REPORT_CONFIG_REGISTRY["Today's Transactions"];
  }

  // --- TIME & ATTENDANCE MODULE ---
  if (lower.includes('employee attendance') || cleanKey === 'REP_S_00301') {
    return REPORT_CONFIG_REGISTRY['Employee attendance'] || REPORT_CONFIG_REGISTRY['Employee Attendance'];
  }
  if (lower.includes('time and attendance') || cleanKey === 'REP_S_00302') {
    return REPORT_CONFIG_REGISTRY['Time And Attendance'] || REPORT_CONFIG_REGISTRY['Time and Attendance'];
  }
  if (lower.includes('labor cost') || cleanKey === 'REP_S_00303') {
    return REPORT_CONFIG_REGISTRY['Labor Cost'];
  }

  // --- LISTS MODULE ---
  if (lower.includes('customer list standard') || cleanKey === 'REP_S_00310') {
    return REPORT_CONFIG_REGISTRY['Customer List Standard'];
  }
  if (lower.includes('not active customer') || cleanKey === 'REP_S_00311') {
    return REPORT_CONFIG_REGISTRY['Not Active Customers'];
  }
  if (lower.includes('new customer') || cleanKey === 'REP_S_00312') {
    return REPORT_CONFIG_REGISTRY['New Customers'];
  }
  if (lower.includes('black list customer') || lower.includes('blacklist customer') || cleanKey === 'REP_S_00313') {
    return REPORT_CONFIG_REGISTRY['Black List Customers'] || REPORT_CONFIG_REGISTRY['Blacklist Customers'];
  }

  // --- TRANSACTION MASTER & DUPLICATE INVOICES POLYMORPHIC ENGINE ---
  if (lower.includes('by salesman') || cleanKey === 'REP_S_00249') {
    return REPORT_CONFIG_REGISTRY['Transactions by Salesman'];
  }
  if (lower === 'transactions by date' || cleanKey === 'REP_S_00247') {
    return REPORT_CONFIG_REGISTRY['Transactions by Date'];
  }
  if (lower.includes('cashier shift') || cleanKey === 'REP_S_00253') {
    return REPORT_CONFIG_REGISTRY['Cashier Shift Ledger'];
  }
  if (lower.includes('void and refund') || lower.includes('void & refund') || cleanKey === 'REP_S_00254') {
    return REPORT_CONFIG_REGISTRY['Void and Refund Audit Trail'];
  }
  if (lower.includes('by employee by payment') || cleanKey === 'REP_S_00250') {
    return REPORT_CONFIG_REGISTRY['Transactions by Employee by Payment'];
  }
  if (lower.includes('by customers by employee') || cleanKey === 'REP_S_00272') {
    return REPORT_CONFIG_REGISTRY['Transactions by Customers by Employee'];
  }
  if (lower.includes('by invoice number') || cleanKey === 'REP_S_00273') {
    return REPORT_CONFIG_REGISTRY['Transactions by Invoice Number'];
  }
  if (lower.includes('duplicate invoice') || cleanKey === 'REP_S_00188') {
    return REPORT_CONFIG_REGISTRY['Duplicate Invoices'];
  }
  if (lower.includes('credit sale') || cleanKey === 'REP_S_00245') {
    return REPORT_CONFIG_REGISTRY['Credit Sales'];
  }
  if (lower.includes('credit card report') || cleanKey === 'REP_S_00246') {
    return REPORT_CONFIG_REGISTRY['Credit Card Report'];
  }
  if (lower.includes('electronic journal') || cleanKey === 'REP_S_00248') {
    return REPORT_CONFIG_REGISTRY['Electronic Journal'];
  }
  if (lower.includes('by date by payment') || cleanKey === 'REP_S_00275') {
    return REPORT_CONFIG_REGISTRY['Transactions by Date by Payment'];
  }
  if (lower.includes('by customers by groups') || cleanKey === 'REP_S_00277') {
    return REPORT_CONFIG_REGISTRY['Transactions by Customers by Groups'];
  }
  if (lower.includes('by customers details') || cleanKey === 'REP_S_00278') {
    return REPORT_CONFIG_REGISTRY['Transactions by Customers Details'];
  }
  if (lower === 'transactions by customers' || cleanKey === 'REP_S_00276') {
    return REPORT_CONFIG_REGISTRY['Transactions by Customers'];
  }
  if (lower.includes('by workstation') || cleanKey === 'REP_S_00279') {
    return REPORT_CONFIG_REGISTRY['Transactions by Workstation'];
  }
  if (lower.includes('by employees') || cleanKey === 'REP_S_00286') {
    return REPORT_CONFIG_REGISTRY['Transactions by Employees'];
  }
  if (lower.includes('by source') || cleanKey === 'REP_S_00287') {
    return REPORT_CONFIG_REGISTRY['Transactions by Source'];
  }

  // Tax Summary
  if (lower.includes('tax') || lower.includes('vat')) {
    return REPORT_CONFIG_REGISTRY['Tax Summary'];
  }

  // --- INTERNAL CONTROL & AUDIT REPORTS ---
  // No Sale (Drawer Openings without Transaction)
  if (lower.includes('no sale') || lower.includes('drawer open') || cleanKey === 'REP_S_00190') {
    return REPORT_CONFIG_REGISTRY['No Sale Report'];
  }

  // User Log Report (Security & Access Audit)
  if (lower.includes('user log') || lower.includes('security log') || lower.includes('audit log') || lower.includes('access audit') || cleanKey === 'REP_S_00192' || cleanKey === 'LST_LOG_001' || cleanKey === 'REP_ACC_010') {
    return REPORT_CONFIG_REGISTRY['User Log Report'];
  }

  // Duplicate Invoice Report (Reprinted Bills Audit)
  if (lower.includes('duplicate invoice') || lower.includes('duplicate bills') || lower.includes('reprint') || cleanKey === 'REP_S_00188') {
    return REPORT_CONFIG_REGISTRY['Duplicate Invoice Report'];
  }

  // Discount Summary Report (Discount & Markdown Audit)
  if (lower.includes('discount summary') || lower.includes('summary of discount') || cleanKey === 'REP_S_00193') {
    return REPORT_CONFIG_REGISTRY['Discount Summary Report'];
  }

  // Meter / Shift Reading Report
  if (lower.includes('meter') || lower.includes('reading history') || lower.includes('shift reading') || lower.includes('z-report') || cleanKey === 'REP_S_00189' || cleanKey === 'REP_S_00291') {
    return REPORT_CONFIG_REGISTRY['Meter / Shift Reading Report'];
  }

  // Wastage
  if (lower.includes('wastage') || lower.includes('scrap') || lower.includes('loss')) {
    return REPORT_CONFIG_REGISTRY['Wastage Report'];
  }

  // Purchase Details
  if (lower.includes('purchase detail') || lower.includes('supplier receipt') || lower.includes('purchase order')) {
    return REPORT_CONFIG_REGISTRY['Purchase Details'];
  }

  // General Ledger
  if (lower.includes('general ledger') || lower.includes('journal entry') || lower.includes('trial balance')) {
    return REPORT_CONFIG_REGISTRY['General Ledger'];
  }

  // Fleet Reports (Strictly Specific)
  if (lower.includes('rep_flt_001') || lower.includes('deliveries & dispatch') || (lower.includes('dispatch') && moduleContext === 'fleet')) {
    return REPORT_CONFIG_REGISTRY['Deliveries & Dispatch Logs'];
  }
  if (lower.includes('rep_flt_002') || lower.includes('driver performance')) {
    return REPORT_CONFIG_REGISTRY['Driver Performance & Reconciliation'];
  }
  if (lower.includes('rep_flt_003') || lower.includes('cod') || lower.includes('whish') || lower.includes('settlement')) {
    return REPORT_CONFIG_REGISTRY['COD, Whish & Cash Settlements'];
  }
  if (lower.includes('rep_flt_004') || lower.includes('fulfillment') || lower.includes('pos pickup')) {
    return REPORT_CONFIG_REGISTRY['Fulfillment Transition Audit Trail'];
  }
  if (lower.includes('rep_flt_005') || lower.includes('vehicle') || lower.includes('trip')) {
    return REPORT_CONFIG_REGISTRY['Vehicle Trips'];
  }

  // Loyalty Members
  if (lower.includes('member') || lower.includes('loyalty')) {
    return REPORT_CONFIG_REGISTRY['Loyalty Program Members Roster'];
  }

  // Points
  if (lower.includes('point') || lower.includes('redemption') || lower.includes('cashback')) {
    return REPORT_CONFIG_REGISTRY['Points Accrual & Redemption Ledger'];
  }

  // Social CRM Reports (Strictly Specific)
  if (lower.includes('rep_soc_001') || lower.includes('social order')) {
    return REPORT_CONFIG_REGISTRY['Social Orders & Conversion Reconciliation'];
  }
  if (lower.includes('rep_soc_002') || lower.includes('campaign') || lower.includes('cpl') || lower.includes('roas')) {
    return REPORT_CONFIG_REGISTRY['Ad Campaigns, CPL & ROAS Performance'];
  }
  if (lower.includes('rep_soc_003') || lower.includes('agent sla') || lower.includes('commission')) {
    return REPORT_CONFIG_REGISTRY['Support Agent SLA & Commission Breakdown'];
  }
  if (lower.includes('rep_soc_004') || lower.includes('attribution') || lower.includes('channel')) {
    return REPORT_CONFIG_REGISTRY['Omnichannel Lead Attribution by Channel'];
  }

  // Sales items (Generic)
  if (lower.includes('item') || lower.includes('product sales')) {
    return REPORT_CONFIG_REGISTRY['Summary of Sales by Items'] || REPORT_CONFIG_REGISTRY['Summary of Sales By Items'];
  }

  // Production
  if (lower.includes('production') || lower.includes('extraction')) {
    return REPORT_CONFIG_REGISTRY['Production & Extraction Logs'];
  }

  // Income Statement / Balance Sheet
  if (lower.includes('income statement') || lower.includes('profit and loss') || lower.includes('p&l')) {
    return REPORT_CONFIG_REGISTRY['Income Statement'];
  }
  if (lower.includes('receivable') || lower.includes('ar aging')) {
    return REPORT_CONFIG_REGISTRY['Receivables'];
  }

  // 5. Smart Default Fallback based on Module Context
  return {
    reportKey: cleanKey || 'Report',
    reportTitle: cleanKey || 'Standard Report Sheet',
    module: moduleContext,
    filters: [
      STANDARD_DATE_RANGE_FIELD,
      STANDARD_BRANCH_FIELD,
      {
        id: 'searchQuery',
        label: 'Item / Record Search',
        type: 'text',
        placeholder: 'Search records...',
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Active / Completed', value: 'ACTIVE' },
          { label: 'Pending / Draft', value: 'PENDING' },
        ],
      },
    ],
  };
}
