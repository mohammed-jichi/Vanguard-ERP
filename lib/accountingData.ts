/**
 * Vanguard ERP - Accounting & Finance Data Engine
 * Harvested and reverse-engineered from Omega Software ERP (Customer ID 22901 - Southern Olive Oil Products S.A.R.L)
 * Enriched with full Omega Lebanese Standard Chart of Accounts (COA) & Sub Classes 3 & 4.
 */

export interface AccountClass {
  id: number;
  class_number: number;
  account_group_name: string;
  account_label: string;
}

export interface AccountHeader1 {
  id: number;
  class_id: number;
  account_number_ref: number;
  account_name: string;
  account_label: string;
}

export interface AccountHeader2 {
  id: number;
  sub_class1_id: number;
  account_number_ref: number;
  account_name: string;
}

export interface AccountHeader3 {
  id: number;
  sub_class2_id: number;
  account_number_ref: number;
  account_name: string;
}

export interface AccountGroup4 {
  id: number;
  sub_class3_id: number;
  account_number_ref: number;
  account_name: string;
  depreciation_interval: string;
  depreciation_account_id?: number;
  depreciation_expense_account_id?: number;
}

export interface AccountDetail {
  id: string;
  tenant_id: string;
  account_number: string;
  account_name: string;
  account_name_ar?: string;
  description?: string;
  class_id: number;
  sub_class4_id: number;
  account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  account_sub_type?: 'BANK' | 'CASH' | 'CUSTOMER' | 'SUPPLIER' | 'EMPLOYEE' | 'EXPENSE' | 'OTHERS';
  type?: 'Cash' | 'Bank' | 'Customer' | 'Supplier' | 'Employee' | 'Expense' | 'Other' | string;
  class_type?: 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Expense' | string;
  currency_id: 'USD' | 'LBP' | 'EUR';
  balance_first_cur: number; // USD
  balance_sec_cur: number; // LBP (rate: 89,500)
  checking_account: boolean;
  is_active: boolean;
}

export interface JVLine {
  id: string;
  line_number: number;
  account_id: string;
  account_number: string;
  account_name: string;
  description: string;
  department_id?: number;
  department_name?: string;
  amount_debit: number;
  amount_credit: number;
  currency_rate: number;
  amount_native: number;
}

export type VoucherType =
  | 'JV'
  | 'PV'
  | 'RV'
  | 'EV'
  | 'CV'
  | 'CN'
  | 'DN'
  | 'STANDARD'
  | 'PAYMENT'
  | 'RECEIPT'
  | 'EXPENSE'
  | 'CONTRA'
  | 'OPENING'
  | 'DEPRECIATION'
  | 'ADJUSTING'
  | 'CLOSING'
  | string;

export interface JournalVoucher {
  id: string;
  tenant_id: string;
  jv_number: string;
  date_of_jv: string;
  jv_type: VoucherType;
  currency_id: 'USD' | 'LBP' | string;
  doc_ref_number?: string;
  description: string;
  internal_remark?: string;
  department?: string;
  sub_department?: string;
  payee_or_recipient?: string;
  payment_method?: string;
  reference_number?: string;
  supporting_doc_url?: string;
  created_by?: string;
  total_debit: number;
  total_credit: number;
  is_posted: boolean;
  posted_at?: string;
  posted_by?: string;
  status?: 'Draft' | 'Posted' | 'Void' | 'Pending Approval' | 'Rejected' | 'DRAFT' | 'POSTED' | string;
  created_at?: string;
  updated_at?: string;
  lines: JVLine[];
}

export interface ARAgingItem {
  accountCode: string;
  customerName: string;
  current: number;
  days30: number;
  days60: number;
  days90Plus: number;
  overDue: number;
  lastPaymentDate: string;
  totalDebt: number;
  creditLimit: number;
  dailyLimit?: number;
  sellingPriceLevel?: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  title?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  commercialName?: string;
  group?: string;
  tags?: { label: string; color: string }[];
  mobile?: string;
  email?: string;
  landline?: string;
  contactPerson?: string;
  street?: string;
  building?: string;
  floor?: string;
  city?: string;
  state?: string;
  country?: string;
  near?: string;
  zipCode?: string;
  zone?: string;
  lat?: number;
  lng?: number;
  remark1?: string;
  remark2?: string;
  remark3?: string;
  remark4?: string;
  note?: string;
  website?: string;
  membershipCode?: string;
  membershipExpiry?: string;
  membershipNumber?: string;
  birthday?: string;
  discountType?: 'Null' | 'DISCOUNT' | 'DISCOUNT 100%';
  discountPercent?: number;
  vatAccountNumber?: string;
}

export interface APAgingItem {
  vendorCode: string;
  supplierName: string;
  current: number;
  days7: number;
  days14: number;
  days30: number;
  days60: number;
  days90Plus: number;
  overDue: number;
  lastPaymentDate: string;
  totalOwed: number;
  terms: string;
  paymentTypes?: string;
  status: 'CURRENT' | 'DUE_SOON' | 'OVERDUE';
  contactPerson?: string;
  contactTitle?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  email?: string;
  emailCc?: string;
  street?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  currency?: 'USD' | 'LBP' | 'EUR' | 'GBP';
  bankInfo?: string;
  vatReg?: boolean;
  vatNb?: string;
  grade?: string;
  website?: string;
  internalNote?: string;
}

export interface MoneyCollectionRecord {
  id: string;
  accountNumber: string;
  accountName: string;
  dateCreated: string;
  type: 'N/A' | 'Amount Ready' | 'Call Him Back';
  remark: string;
  datePromised: string;
  byUser: string;
}

export interface ExpenseRecurringTemplate {
  id: string;
  description: string;
  purchaseAccount?: string;
  expenseAccount: string;
  amount: number;
  currency: 'USD' | 'LBP' | 'EUR' | 'GBP';
  department: string;
  refInvoice?: string;
  internalRemark?: string;
}

export interface BankStatementTransaction {
  id: string;
  date: string;
  description: string;
  payeeCustomer: string;
  payment: number;
  deposit: number;
  remark: string;
  cleared: boolean;
}

// Exchange rate helper
export const LBP_RATE = 89500;

// ==============================================================================
// 1. AUTHENTIC OMEGA ERP MASTER CATALOG DATA & CLASSES
// ==============================================================================

export const OMEGA_ACCOUNT_CLASSES: AccountClass[] = [
  { id: 1, class_number: 1, account_group_name: 'Permanent Capital Accounts', account_label: 'Permanent Capital Accounts, (1)' },
  { id: 2, class_number: 2, account_group_name: 'Fixed Assets Accounts', account_label: 'Fixed Assets Accounts, (2)' },
  { id: 3, class_number: 3, account_group_name: 'Stocks & Work In Progress', account_label: 'Stocks & Work In Progress, (3)' },
  { id: 4, class_number: 4, account_group_name: 'Accounts Payable & Receivable', account_label: 'Accounts Payable & Receivable, (4)' },
  { id: 5, class_number: 5, account_group_name: 'Monetary Accounts', account_label: 'Monetary Accounts, (5)' },
  { id: 6, class_number: 6, account_group_name: 'Expenditure', account_label: 'Expenditure, (6)' },
  { id: 7, class_number: 7, account_group_name: 'Revenues Accounts', account_label: 'Revenues Accounts, (7)' }
];

export const OMEGA_HEADER_1_SAMPLE: AccountHeader1[] = [
  { id: 1, class_id: 1, account_number_ref: 11, account_name: 'Capital (Individual or Partners)', account_label: 'Capital (11)' },
  { id: 2, class_id: 1, account_number_ref: 12, account_name: 'Premiums Related to Capital', account_label: 'Premiums Related to Capital (12)' },
  { id: 3, class_id: 1, account_number_ref: 13, account_name: 'Reserves & Retained Earnings', account_label: 'Reserves & Retained Earnings (13)' },
  { id: 4, class_id: 2, account_number_ref: 21, account_name: 'Tangible Fixed Assets & Equipment', account_label: 'Tangible Fixed Assets (21)' },
  { id: 5, class_id: 2, account_number_ref: 28, account_name: 'Depreciation & Amortisation Of Fixed Assets', account_label: 'Depreciation Of Assets (28)' },
  { id: 6, class_id: 3, account_number_ref: 31, account_name: 'Raw Materials & Supplies (Olives & Bottles)', account_label: 'Raw Materials (31)' },
  { id: 7, class_id: 3, account_number_ref: 35, account_name: 'Finished Goods Inventory (Olive Oil Bottles & Tins)', account_label: 'Finished Goods (35)' },
  { id: 8, class_id: 4, account_number_ref: 40, account_name: 'Suppliers & Accounts Payable', account_label: 'Suppliers (40)' },
  { id: 9, class_id: 4, account_number_ref: 41, account_name: 'Customers & Accounts Receivable', account_label: 'Customers (41)' },
  { id: 10, class_id: 4, account_number_ref: 44, account_name: 'State, Taxes & VAT Recoverable/Payable', account_label: 'State & Taxes (44)' },
  { id: 11, class_id: 5, account_number_ref: 51, account_name: 'Financial Institutions & Bank Accounts', account_label: 'Bank Accounts (51)' },
  { id: 12, class_id: 5, account_number_ref: 53, account_name: 'Cash Vaults & Physical Cash Drawers', account_label: 'Cash Drawers (53)' },
  { id: 13, class_id: 6, account_number_ref: 60, account_name: 'Purchases Consumed (Crop Procurement COGS)', account_label: 'Purchases Consumed (60)' },
  { id: 14, class_id: 6, account_number_ref: 61, account_name: 'External Services & Rent Expenses', account_label: 'External Services (61)' },
  { id: 15, class_id: 6, account_number_ref: 64, account_name: 'Personnel & Payroll Charges', account_label: 'Personnel & Payroll (64)' },
  { id: 16, class_id: 7, account_number_ref: 70, account_name: 'Sales of Manufactured Goods & Oils', account_label: 'Sales of Goods (70)' }
];

export const OMEGA_SUB_CLASSES_3: AccountHeader3[] = [
  { id: 101, sub_class2_id: 11, account_number_ref: 1010, account_name: 'Capital and Reserves' },
  { id: 111, sub_class2_id: 11, account_number_ref: 1110, account_name: 'Legal and Statutory Reserves' },
  { id: 138, sub_class2_id: 13, account_number_ref: 1381, account_name: 'Profit / Loss Brought Forward' },
  { id: 215, sub_class2_id: 21, account_number_ref: 2151, account_name: 'Industrial Machinery & Equipment' },
  { id: 218, sub_class2_id: 21, account_number_ref: 2182, account_name: 'Vehicles & Office Equipment' },
  { id: 223, sub_class2_id: 22, account_number_ref: 2231, account_name: 'Buildings & Installations' },
  { id: 224, sub_class2_id: 22, account_number_ref: 2244, account_name: 'Industrial Tools & Equipment' },
  { id: 225, sub_class2_id: 22, account_number_ref: 2250, account_name: 'Transport Equipment & Vehicles' },
  { id: 227, sub_class2_id: 22, account_number_ref: 2271, account_name: 'Land & Real Estate Properties' },
  { id: 291, sub_class2_id: 29, account_number_ref: 2911, account_name: 'Intangible Trademarks & Licenses' },
  { id: 311, sub_class2_id: 31, account_number_ref: 3111, account_name: 'Raw Materials & Harvests' },
  { id: 401, sub_class2_id: 40, account_number_ref: 4011, account_name: 'Domestic Suppliers & Payables' },
  { id: 404, sub_class2_id: 40, account_number_ref: 4041, account_name: 'Fixed Asset & Machinery Suppliers' },
  { id: 411, sub_class2_id: 41, account_number_ref: 4111, account_name: 'Trade Customers & Receivables' },
  { id: 415, sub_class2_id: 41, account_number_ref: 4115, account_name: 'Doubtful & Bad Debtors' },
  { id: 441, sub_class2_id: 44, account_number_ref: 4411, account_name: 'State Tax Dues & VAT Payables' },
  { id: 442, sub_class2_id: 44, account_number_ref: 4426, account_name: 'State VAT Deductible on Purchases' },
  { id: 443, sub_class2_id: 44, account_number_ref: 4427, account_name: 'Customer VAT Collected on Sales' },
  { id: 470, sub_class2_id: 47, account_number_ref: 4700, account_name: 'Due Salaries & Wages' },
  { id: 512, sub_class2_id: 51, account_number_ref: 5121, account_name: 'Bank Operating Accounts (LBP/USD)' },
  { id: 530, sub_class2_id: 53, account_number_ref: 5300, account_name: 'Cash Vaults & Physical Cash Drawers' },
  { id: 532, sub_class2_id: 53, account_number_ref: 5320, account_name: 'Petty Cash & Floor Vaults' },
  { id: 611, sub_class2_id: 61, account_number_ref: 6111, account_name: 'Raw Materials Consumed' },
  { id: 612, sub_class2_id: 61, account_number_ref: 6121, account_name: 'Packaging, Consumables & Fuels' },
  { id: 614, sub_class2_id: 61, account_number_ref: 6114, account_name: 'Electricity & Utilities' },
  { id: 626, sub_class2_id: 62, account_number_ref: 6264, account_name: 'Rents, Maintenance & Operations' },
  { id: 631, sub_class2_id: 63, account_number_ref: 6311, account_name: 'Salaries & Personnel Expenses' },
  { id: 635, sub_class2_id: 63, account_number_ref: 6350, account_name: 'Social Security Charges (NSSF)' },
  { id: 701, sub_class2_id: 70, account_number_ref: 7011, account_name: 'Wholesale Commercial Revenues' },
  { id: 719, sub_class2_id: 71, account_number_ref: 7191, account_name: 'Production & Service Sales' },
  { id: 775, sub_class2_id: 77, account_number_ref: 7750, account_name: 'Exchange Rate Gains' }
];

export const OMEGA_SUB_CLASSES_4: AccountGroup4[] = [
  { id: 1010, sub_class3_id: 101, account_number_ref: 10100, account_name: 'Capital Shares', depreciation_interval: 'NONE' },
  { id: 1110, sub_class3_id: 111, account_number_ref: 11100, account_name: 'Legal Reserves', depreciation_interval: 'NONE' },
  { id: 1381, sub_class3_id: 138, account_number_ref: 13810, account_name: 'Retained Profit Results', depreciation_interval: 'NONE' },
  { id: 1391, sub_class3_id: 138, account_number_ref: 13910, account_name: 'Accumulated Loss Results', depreciation_interval: 'NONE' },
  { id: 2151, sub_class3_id: 215, account_number_ref: 21510, account_name: 'Industrial Machinery & Production Equipment', depreciation_interval: 'YEARLY' },
  { id: 2182, sub_class3_id: 218, account_number_ref: 21820, account_name: 'Transport & Logistics Vehicles', depreciation_interval: 'YEARLY' },
  { id: 2184, sub_class3_id: 218, account_number_ref: 21840, account_name: 'Office Hardware & IT Equipment', depreciation_interval: 'YEARLY' },
  { id: 2231, sub_class3_id: 223, account_number_ref: 22310, account_name: 'Buildings & Warehouses', depreciation_interval: 'YEARLY' },
  { id: 2244, sub_class3_id: 224, account_number_ref: 22440, account_name: 'Industrial Extraction Tools', depreciation_interval: 'YEARLY' },
  { id: 2250, sub_class3_id: 225, account_number_ref: 22500, account_name: 'Transport Equipment & Trucks', depreciation_interval: 'YEARLY' },
  { id: 2271, sub_class3_id: 227, account_number_ref: 22710, account_name: 'Land & Groves', depreciation_interval: 'NONE' },
  { id: 2911, sub_class3_id: 291, account_number_ref: 29110, account_name: 'Trade Marks & Brand Assets', depreciation_interval: 'NONE' },
  { id: 3111, sub_class3_id: 311, account_number_ref: 31110, account_name: 'Raw Harvest Inventory Assets', depreciation_interval: 'NONE' },
  { id: 4011, sub_class3_id: 401, account_number_ref: 40110, account_name: 'Trade Accounts Payables', depreciation_interval: 'NONE' },
  { id: 4012, sub_class3_id: 401, account_number_ref: 40110002, account_name: 'Packaging & Raw Material Vendors', depreciation_interval: 'NONE' },
  { id: 4041, sub_class3_id: 404, account_number_ref: 40410, account_name: 'Fixed Asset & Machinery Vendors', depreciation_interval: 'NONE' },
  { id: 4111, sub_class3_id: 411, account_number_ref: 41110, account_name: 'Trade Account Receivables', depreciation_interval: 'NONE' },
  { id: 4115, sub_class3_id: 415, account_number_ref: 41150, account_name: 'Doubtful Debtors', depreciation_interval: 'NONE' },
  { id: 4411, sub_class3_id: 441, account_number_ref: 44111, account_name: 'VAT Payables to State', depreciation_interval: 'NONE' },
  { id: 4426, sub_class3_id: 442, account_number_ref: 44269, account_name: 'VAT Deductible on Purchases', depreciation_interval: 'NONE' },
  { id: 4427, sub_class3_id: 443, account_number_ref: 44270, account_name: 'Customer VAT Collected', depreciation_interval: 'NONE' },
  { id: 4700, sub_class3_id: 470, account_number_ref: 47000, account_name: 'Due Salaries to Personnel', depreciation_interval: 'NONE' },
  { id: 5121, sub_class3_id: 512, account_number_ref: 51210, account_name: 'Bank Bob LBP Account', depreciation_interval: 'NONE' },
  { id: 5300, sub_class3_id: 530, account_number_ref: 53000, account_name: 'Vault Cash Reserves', depreciation_interval: 'NONE' },
  { id: 5320, sub_class3_id: 532, account_number_ref: 53200, account_name: 'Petty Cash & Floor Vault', depreciation_interval: 'NONE' },
  { id: 6111, sub_class3_id: 611, account_number_ref: 61110, account_name: 'Purchase Of Raw Materials', depreciation_interval: 'NONE' },
  { id: 6121, sub_class3_id: 612, account_number_ref: 61210, account_name: 'Packaging Materials (Jars, Bottles, Caps, Labels)', depreciation_interval: 'NONE' },
  { id: 6122, sub_class3_id: 612, account_number_ref: 61220, account_name: 'Food & Chemical Consumables / Production Ingredients', depreciation_interval: 'NONE' },
  { id: 6123, sub_class3_id: 612, account_number_ref: 61230, account_name: 'Diesel & Fuel (Generators / Boilers)', depreciation_interval: 'NONE' },
  { id: 6114, sub_class3_id: 614, account_number_ref: 61140, account_name: 'Electricity & Generators', depreciation_interval: 'NONE' },
  { id: 6262, sub_class3_id: 626, account_number_ref: 62620, account_name: 'Repairs & Maintenance', depreciation_interval: 'NONE' },
  { id: 6264, sub_class3_id: 626, account_number_ref: 62640, account_name: 'Rent & Operating Expenses', depreciation_interval: 'NONE' },
  { id: 6311, sub_class3_id: 631, account_number_ref: 63110, account_name: 'Salaries & Base Remunerations', depreciation_interval: 'NONE' },
  { id: 6312, sub_class3_id: 631, account_number_ref: 63120, account_name: 'Plant Wages & Overtime', depreciation_interval: 'NONE' },
  { id: 6350, sub_class3_id: 635, account_number_ref: 63500, account_name: 'Social Security Charges (NSSF)', depreciation_interval: 'NONE' },
  { id: 7011, sub_class3_id: 701, account_number_ref: 70110, account_name: 'Operating Revenue Account', depreciation_interval: 'NONE' },
  { id: 7191, sub_class3_id: 719, account_number_ref: 71910, account_name: 'Sales Of Productions', depreciation_interval: 'NONE' },
  { id: 7193, sub_class3_id: 719, account_number_ref: 71930, account_name: 'Sales Of Services', depreciation_interval: 'NONE' },
  { id: 7750, sub_class3_id: 775, account_number_ref: 77500, account_name: 'Profit On Exchange Rate', depreciation_interval: 'NONE' }
];

// ==============================================================================
// 2. SEED CHART OF ACCOUNTS (FULL LEBANESE / OMEGA STANDARDS - MODULE 8.D)
// ==============================================================================

export const INITIAL_ACCOUNT_DETAILS: AccountDetail[] = [
  // Class 5: Monetary Accounts
  {
    id: 'acc-53000',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '53000',
    account_name: 'Cash (Main Physical Vault)',
    account_name_ar: 'الصندوق - الخزينة الرئيسية',
    description: 'Main cash vault for physical receipts and settlements',
    class_id: 5,
    sub_class4_id: 5300,
    account_type: 'ASSET',
    account_sub_type: 'CASH',
    currency_id: 'USD',
    balance_first_cur: 48500.00,
    balance_sec_cur: 48500.00 * LBP_RATE,
    checking_account: true,
    is_active: true
  },
  {
    id: 'acc-53200',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '53200',
    account_name: 'Petty Cash & Floor Vault',
    account_name_ar: 'صندوق المصاريف النثرية وقسم المعصرة',
    description: 'Petty cash and operational till fund on the pressing plant floor',
    class_id: 5,
    sub_class4_id: 5320,
    account_type: 'ASSET',
    account_sub_type: 'CASH',
    currency_id: 'USD',
    balance_first_cur: 6500.00,
    balance_sec_cur: 6500.00 * LBP_RATE,
    checking_account: true,
    is_active: true
  },
  {
    id: 'acc-51210',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '51210',
    account_name: 'Commercial Bank Accounts',
    account_name_ar: 'الحسابات المصرفية التجارية الجارية',
    description: 'Corporate commercial bank checking accounts (BLOM, Audi, Bank of Beirut)',
    class_id: 5,
    sub_class4_id: 5121,
    account_type: 'ASSET',
    account_sub_type: 'BANK',
    currency_id: 'USD',
    balance_first_cur: 184200.00,
    balance_sec_cur: 184200.00 * LBP_RATE,
    checking_account: true,
    is_active: true
  },
  {
    id: 'acc-5121',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '5121',
    account_name: 'Bank Bob Lbp (Bank of Beirut Commercial)',
    account_name_ar: 'بنك بيروت - حساب العمليات الجاري',
    description: 'Primary commercial checking and wire account',
    class_id: 5,
    sub_class4_id: 5121,
    account_type: 'ASSET',
    account_sub_type: 'BANK',
    currency_id: 'USD',
    balance_first_cur: 184200.00,
    balance_sec_cur: 184200.00 * LBP_RATE,
    checking_account: true,
    is_active: true
  },
  // Class 3: Inventory
  {
    id: 'acc-31110',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '31110',
    account_name: 'Inventory Assets (Raw Olives & Goods)',
    account_name_ar: 'مخزون المواد الأولية والبضائع',
    description: 'Cold-pressed stock and procurement inventory',
    class_id: 3,
    sub_class4_id: 3111,
    account_type: 'ASSET',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 395000.00,
    balance_sec_cur: 395000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  // Class 2: Fixed Assets
  {
    id: 'acc-22710',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '22710',
    account_name: 'Land (Agricultural Estates & Groves)',
    account_name_ar: 'الأراضي والمزارع الزراعية',
    description: 'Freehold agricultural land in Mount Lebanon & South',
    class_id: 2,
    sub_class4_id: 2271,
    account_type: 'ASSET',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 620000.00,
    balance_sec_cur: 620000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-22310',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '22310',
    account_name: 'Buildings (Pressing Plants & Warehouses)',
    account_name_ar: 'الأبنية والمعاصر ومستودعات التخزين',
    description: 'Industrial facilities and packaging centers',
    class_id: 2,
    sub_class4_id: 2231,
    account_type: 'ASSET',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 850000.00,
    balance_sec_cur: 850000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-22500',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '22500',
    account_name: 'Transport Equipment (Distribution Fleet)',
    account_name_ar: 'آليات النقل وأسطول التوزيع التجاري',
    description: 'Refrigerated trucks and logistics trailers',
    class_id: 2,
    sub_class4_id: 2250,
    account_type: 'ASSET',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 145000.00,
    balance_sec_cur: 145000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-22440',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '22440',
    account_name: 'Industrial Tools (Centrifuges & Stainless Tanks)',
    account_name_ar: 'المعدات الصناعية والخزانات الاستانلس ستيل',
    description: 'Heavy hydraulic presses and stainless storage vats',
    class_id: 2,
    sub_class4_id: 2244,
    account_type: 'ASSET',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 280000.00,
    balance_sec_cur: 280000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-29110',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '29110',
    account_name: 'Trade Marks (Brand Assets & Trademarks)',
    account_name_ar: 'العلامات التجارية والامتيازات المسجلة',
    description: 'Registered brand marks and olive oil certifications',
    class_id: 2,
    sub_class4_id: 2911,
    account_type: 'ASSET',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 95000.00,
    balance_sec_cur: 95000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-21510',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '21510',
    account_name: 'Industrial Machinery & Production Equipment',
    account_name_ar: 'الآلات والمعدات الصناعية للإنتاج والمعاصر',
    description: 'Heavy hydraulic olive oil extraction presses, centrifuges, and decanters',
    class_id: 2,
    sub_class4_id: 2151,
    account_type: 'ASSET',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 380000.00,
    balance_sec_cur: 380000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-21820',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '21820',
    account_name: 'Transport & Logistics Vehicles',
    account_name_ar: 'مركبات النقل والخدمات اللوجستية',
    description: 'Olive harvest hauling trucks and distribution vans',
    class_id: 2,
    sub_class4_id: 2182,
    account_type: 'ASSET',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 165000.00,
    balance_sec_cur: 165000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-21840',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '21840',
    account_name: 'Office Hardware & IT Equipment',
    account_name_ar: 'معدات المكاتب وتكنولوجيا المعلومات والخوادم',
    description: 'Enterprise ERP workstations, servers, network switches, and automated scale terminals',
    class_id: 2,
    sub_class4_id: 2184,
    account_type: 'ASSET',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 45000.00,
    balance_sec_cur: 45000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  // Class 4: Receivables
  {
    id: 'acc-41110',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '41110',
    account_name: 'Account Receivables (Control Account)',
    account_name_ar: 'الذمم المدينة التجارية - حساب المراقبة',
    description: 'Customer credit ledger and outstanding receivables',
    class_id: 4,
    sub_class4_id: 4111,
    account_type: 'ASSET',
    account_sub_type: 'CUSTOMER',
    currency_id: 'USD',
    balance_first_cur: 64700.00,
    balance_sec_cur: 64700.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-44270000',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '44270000',
    account_name: 'Customer Vat* (Output VAT on Sales)',
    account_name_ar: 'ضريبة القيمة المضافة المحصلة من الزبائن (11%)',
    description: 'VAT collected on domestic deliveries and wholesale',
    class_id: 4,
    sub_class4_id: 4427,
    account_type: 'LIABILITY',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 19800.00,
    balance_sec_cur: 19800.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-4426900000',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '4426900000',
    account_name: 'Vat Deductible* (Input VAT on Purchases)',
    account_name_ar: 'ضريبة القيمة المضافة القابلة للخصم على المشتريات',
    description: 'Recoverable input VAT paid on vendor bills',
    class_id: 4,
    sub_class4_id: 4426,
    account_type: 'ASSET',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 11200.00,
    balance_sec_cur: 11200.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-41150',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '41150',
    account_name: 'Doubtful Debtors (Provision Account)',
    account_name_ar: 'المدينون المشكوك في تحصيل ديونهم',
    description: 'Delinquent accounts past maturity',
    class_id: 4,
    sub_class4_id: 4115,
    account_type: 'ASSET',
    account_sub_type: 'CUSTOMER',
    currency_id: 'USD',
    balance_first_cur: 8500.00,
    balance_sec_cur: 8500.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-42810',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '42810',
    account_name: 'Loans & Advances To Staff (Employee Advance)',
    account_name_ar: 'سلف وقروض الموظفين والكوادر',
    description: 'Operational advances and petty allowances to staff members',
    class_id: 4,
    sub_class4_id: 4281,
    account_type: 'ASSET',
    account_sub_type: 'EMPLOYEE',
    currency_id: 'USD',
    balance_first_cur: 1500.00,
    balance_sec_cur: 1500.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  // Class 4: Liabilities & Payables
  {
    id: 'acc-40110',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '40110',
    account_name: 'Accounts Payables (Control Account)',
    account_name_ar: 'الذمم الدائنة للموردين - حساب المراقبة',
    description: 'Outstanding supplier balances and agricultural bills',
    class_id: 4,
    sub_class4_id: 4011,
    account_type: 'LIABILITY',
    account_sub_type: 'SUPPLIER',
    currency_id: 'USD',
    balance_first_cur: 86400.00,
    balance_sec_cur: 86400.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-4411100000',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '4411100000',
    account_name: 'Vat Payables* (Ministry of Finance Dues)',
    account_name_ar: 'ضريبة القيمة المضافة المستحقة لوزارة المالية',
    description: 'Quarterly VAT liability account',
    class_id: 4,
    sub_class4_id: 4411,
    account_type: 'LIABILITY',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 18700.00,
    balance_sec_cur: 18700.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-401100002',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '401100002',
    account_name: 'Suppliers (Farmers & Packaging Vendors)',
    account_name_ar: 'الموردون ومزارعو زيتون الجنوب',
    description: 'Direct procurement balances for local farmers',
    class_id: 4,
    sub_class4_id: 4011,
    account_type: 'LIABILITY',
    account_sub_type: 'SUPPLIER',
    currency_id: 'USD',
    balance_first_cur: 34500.00,
    balance_sec_cur: 34500.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-40110002',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '40110002',
    account_name: 'Packaging & Raw Material Vendors',
    account_name_ar: 'موردو مواد التعبئة والتغليف والمواد الأولية',
    description: 'Direct procurement balances for packaging, glass bottles, and raw harvest materials',
    class_id: 4,
    sub_class4_id: 4011,
    account_type: 'LIABILITY',
    account_sub_type: 'SUPPLIER',
    currency_id: 'USD',
    balance_first_cur: 34500.00,
    balance_sec_cur: 34500.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-40410',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '40410',
    account_name: 'Fixed Asset & Machinery Vendors',
    account_name_ar: 'موردو الأصول الثابتة والآلات والمعدات',
    description: 'Payables to industrial machinery suppliers and capital plant contractors',
    class_id: 4,
    sub_class4_id: 4041,
    account_type: 'LIABILITY',
    account_sub_type: 'SUPPLIER',
    currency_id: 'USD',
    balance_first_cur: 78000.00,
    balance_sec_cur: 78000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-47000',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '47000',
    account_name: 'Due Salaries (Accrued Payroll)',
    account_name_ar: 'الرواتب والأجور المستحقة للموظفين',
    description: 'Pending month-end payroll distributions',
    class_id: 4,
    sub_class4_id: 4700,
    account_type: 'LIABILITY',
    account_sub_type: 'EMPLOYEE',
    currency_id: 'USD',
    balance_first_cur: 24000.00,
    balance_sec_cur: 24000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-44110',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '44110',
    account_name: 'Taxes & Fees Dues (Municipal & Stamp Fees)',
    account_name_ar: 'الضرائب والرسوم البلدية ورسوم الطوابع المستحقة',
    description: 'Fiscal revenue stamps and municipal licenses',
    class_id: 4,
    sub_class4_id: 4411,
    account_type: 'LIABILITY',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 7400.00,
    balance_sec_cur: 7400.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-63500',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '63500',
    account_name: 'Social Security Charges (NSSF / الضمان الاجتماعي)',
    account_name_ar: 'أعباء الصندوق الوطني للضمان الاجتماعي',
    description: 'Employer mandatory social security contributions',
    class_id: 6,
    sub_class4_id: 6350,
    account_type: 'EXPENSE',
    account_sub_type: 'EXPENSE',
    currency_id: 'USD',
    balance_first_cur: 15600.00,
    balance_sec_cur: 15600.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  // Class 1: Equity
  {
    id: 'acc-10100',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '10100',
    account_name: 'Capital (Issued & Paid Capital)',
    account_name_ar: 'رأس المال المكتتب به والمدفوع',
    description: 'Share capital of Southern Olive Oil Products S.A.R.L',
    class_id: 1,
    sub_class4_id: 1010,
    account_type: 'EQUITY',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 1400000.00,
    balance_sec_cur: 1400000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-11100',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '11100',
    account_name: 'Legal Reserves (Statutory Lebanese Reserves)',
    account_name_ar: 'الاحتياطي القانوني الإلزامي',
    description: '10% annual net profit compulsory legal reserve',
    class_id: 1,
    sub_class4_id: 1110,
    account_type: 'EQUITY',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 140000.00,
    balance_sec_cur: 140000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-13810',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '13810',
    account_name: 'Profit Results (Retained Retained Earnings)',
    account_name_ar: 'أرباح السنوات السابقة المدورة',
    description: 'Cumulative retained operational net earnings',
    class_id: 1,
    sub_class4_id: 1381,
    account_type: 'EQUITY',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 320000.00,
    balance_sec_cur: 320000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-13910',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '13910',
    account_name: 'Loss Results (Carried Forward Deficits)',
    account_name_ar: 'خسائر السنوات السابقة المدورة',
    description: 'Net deficit carry-forwards (currently zero)',
    class_id: 1,
    sub_class4_id: 1391,
    account_type: 'EQUITY',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 0.00,
    balance_sec_cur: 0.00,
    checking_account: false,
    is_active: true
  },
  // Class 6: Expenses
  {
    id: 'acc-61110',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '61110',
    account_name: 'Purchase Of Raw Materials (Olive Harvest COGS)',
    account_name_ar: 'مشتريات المواد الأولية - محصول الزيتون',
    description: 'Procurement expenses for raw harvest deliveries',
    class_id: 6,
    sub_class4_id: 6111,
    account_type: 'EXPENSE',
    account_sub_type: 'EXPENSE',
    currency_id: 'USD',
    balance_first_cur: 215000.00,
    balance_sec_cur: 215000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-61210',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '61210',
    account_name: 'Packaging Materials (Jars, Bottles, Caps, Labels)',
    account_name_ar: 'مواد التعبئة والتغليف (مرطبانات، زجاجات، أغطية، ملصقات)',
    description: 'Bottling supplies, dark glass bottles, tinplate cans, and branded labels',
    class_id: 6,
    sub_class4_id: 6121,
    account_type: 'EXPENSE',
    account_sub_type: 'EXPENSE',
    currency_id: 'USD',
    balance_first_cur: 42500.00,
    balance_sec_cur: 42500.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-61220',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '61220',
    account_name: 'Food & Chemical Consumables / Production Ingredients',
    account_name_ar: 'المستهلكات الغذائية والكيميائية ومواد الإنتاج',
    description: 'Nitrogen gas blanketing, filtration media, and food-grade cleaning consumables',
    class_id: 6,
    sub_class4_id: 6122,
    account_type: 'EXPENSE',
    account_sub_type: 'EXPENSE',
    currency_id: 'USD',
    balance_first_cur: 14200.00,
    balance_sec_cur: 14200.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-61230',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '61230',
    account_name: 'Diesel & Fuel (Generators / Boilers)',
    account_name_ar: 'المازوت والوقود (مولدات وغلايات المعصرة)',
    description: 'Diesel fuel for backup generators, boilers, and mill pressing heating lines',
    class_id: 6,
    sub_class4_id: 6123,
    account_type: 'EXPENSE',
    account_sub_type: 'EXPENSE',
    currency_id: 'USD',
    balance_first_cur: 21800.00,
    balance_sec_cur: 21800.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-61140',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '61140',
    account_name: 'Electricity (EDL & Commercial Generators)',
    account_name_ar: 'مصاريف الكهرباء واشتراك المولدات',
    description: 'Factory pressing power and generator diesel',
    class_id: 6,
    sub_class4_id: 6114,
    account_type: 'EXPENSE',
    account_sub_type: 'EXPENSE',
    currency_id: 'USD',
    balance_first_cur: 34200.00,
    balance_sec_cur: 34200.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-62640',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '62640',
    account_name: 'Rent & Operation Expenses (Lease & Utilities)',
    account_name_ar: 'إيجارات المعصرة والمصاريف التشغيلية',
    description: 'Depot rent and general administration operating costs',
    class_id: 6,
    sub_class4_id: 6264,
    account_type: 'EXPENSE',
    account_sub_type: 'EXPENSE',
    currency_id: 'USD',
    balance_first_cur: 28500.00,
    balance_sec_cur: 28500.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-63110',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '63110',
    account_name: 'Salaries (Administrative & Technical Staff)',
    account_name_ar: 'رواتب الجهاز الإداري والتقني',
    description: 'Fixed monthly payroll for executives and engineers',
    class_id: 6,
    sub_class4_id: 6311,
    account_type: 'EXPENSE',
    account_sub_type: 'EXPENSE',
    currency_id: 'USD',
    balance_first_cur: 64200.00,
    balance_sec_cur: 64200.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-63120',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '63120',
    account_name: 'Wages (Seasonal Mill Workers & Bottlers)',
    account_name_ar: 'أجور عمال المعصرة الموسميين والتعبئة',
    description: 'Hourly harvest labor and night shift packing wages',
    class_id: 6,
    sub_class4_id: 6312,
    account_type: 'EXPENSE',
    account_sub_type: 'EXPENSE',
    currency_id: 'USD',
    balance_first_cur: 18400.00,
    balance_sec_cur: 18400.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-62620',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '62620',
    account_name: 'Repairs & Maintenance (Mill Machinery & Fleet)',
    account_name_ar: 'صيانة وتصليح آلات المعصرة وأسطول النقل',
    description: 'Centrifuge repairs and preventative plant servicing',
    class_id: 6,
    sub_class4_id: 6262,
    account_type: 'EXPENSE',
    account_sub_type: 'EXPENSE',
    currency_id: 'USD',
    balance_first_cur: 12800.00,
    balance_sec_cur: 12800.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  // Class 7: Revenues
  {
    id: 'acc-701100001',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '701100001',
    account_name: 'Revenue Account* (Extra Virgin Wholesale)',
    account_name_ar: 'حساب الإيرادات الرئيسي - مبيعات زيت الزيتون بالجملة',
    description: 'Bulk extra virgin sales to regional supermarkets and distributors',
    class_id: 7,
    sub_class4_id: 7011,
    account_type: 'REVENUE',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 485000.00,
    balance_sec_cur: 485000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-71910',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '71910',
    account_name: 'Sales Of Productions (Bottled & Tinned Oils)',
    account_name_ar: 'مبيعات الإنتاج المصنع - زجاجات وصفائح',
    description: 'Finished branded packaged oils for export and retail',
    class_id: 7,
    sub_class4_id: 7191,
    account_type: 'REVENUE',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 195000.00,
    balance_sec_cur: 195000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-71930',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '71930',
    account_name: 'Sales Of Services (Custom Pressing & Lab Tests)',
    account_name_ar: 'إيرادات خدمات العصر والفحص المخبري للغير',
    description: 'Fee revenues from milling harvests for third-party growers',
    class_id: 7,
    sub_class4_id: 7193,
    account_type: 'REVENUE',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 42000.00,
    balance_sec_cur: 42000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'acc-77500',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '77500',
    account_name: 'Profit On Exchange (Foreign Exchange Gains)',
    account_name_ar: 'أرباح فروقات أسعار الصرف (USD / LBP)',
    description: 'Financial exchange conversion profits',
    class_id: 7,
    sub_class4_id: 7750,
    account_type: 'REVENUE',
    account_sub_type: 'OTHERS',
    currency_id: 'USD',
    balance_first_cur: 14800.00,
    balance_sec_cur: 14800.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  }
];

// ==============================================================================
// 3. INITIAL JOURNAL VOUCHERS (MODULE 1 SEED)
// ==============================================================================

export const INITIAL_JOURNAL_VOUCHERS: JournalVoucher[] = [
  {
    id: 'jv-2026-001',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    jv_number: 'JV-2026-1984',
    date_of_jv: '2026-09-15',
    jv_type: 'STANDARD',
    currency_id: 'USD',
    doc_ref_number: 'INV-9941',
    description: 'Settlement of wholesale commercial olive oil shipment to Al-Baraka Group',
    internal_remark: 'Matched with BLOM Bank checking wire #8814',
    department: 'ADMIN',
    sub_department: 'Finance & Treasury',
    created_by: 'Finance Controller (Admin)',
    total_debit: 12400.00,
    total_credit: 12400.00,
    is_posted: true,
    posted_at: '2026-09-15T10:30:00Z',
    posted_by: 'Super Admin (Mohammed Jichi)',
    lines: [
      {
        id: 'jvl-01',
        line_number: 1,
        account_id: 'acc-5121',
        account_number: '5121',
        account_name: 'Bank Bob Lbp (Bank of Beirut Commercial)',
        description: 'Direct wire deposit for invoice #INV-9941',
        amount_debit: 12400.00,
        amount_credit: 0.00,
        currency_rate: 1.0,
        amount_native: 12400.00
      },
      {
        id: 'jvl-02',
        line_number: 2,
        account_id: 'acc-41110',
        account_number: '41110',
        account_name: 'Account Receivables (Control Account)',
        description: 'Customer balance settlement for Al-Baraka',
        amount_debit: 0.00,
        amount_credit: 12400.00,
        currency_rate: 1.0,
        amount_native: 12400.00
      }
    ]
  },
  {
    id: 'jv-2026-002',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    jv_number: 'JV-2026-1985',
    date_of_jv: '2026-09-14',
    jv_type: 'STANDARD',
    currency_id: 'USD',
    doc_ref_number: 'GRN-COOP-88',
    description: 'Receipt of raw olive crop batch from Southern Farmers Cooperative',
    internal_remark: 'Certified batch 45 metric tons Suri extra virgin harvest',
    department: 'PRODUCTION',
    sub_department: 'Mill Operations',
    created_by: 'Procurement Specialist',
    total_debit: 18500.00,
    total_credit: 18500.00,
    is_posted: true,
    posted_at: '2026-09-14T14:15:00Z',
    posted_by: 'Super Admin (Mohammed Jichi)',
    lines: [
      {
        id: 'jvl-03',
        line_number: 1,
        account_id: 'acc-61110',
        account_number: '61110',
        account_name: 'Purchase Of Raw Materials (Olive Harvest COGS)',
        description: 'Raw olive crop harvest delivery 45T',
        amount_debit: 18500.00,
        amount_credit: 0.00,
        currency_rate: 1.0,
        amount_native: 18500.00
      },
      {
        id: 'jvl-04',
        line_number: 2,
        account_id: 'acc-40110',
        account_number: '40110',
        account_name: 'Accounts Payables (Control Account)',
        description: 'Cooperative payable 30 days credit term',
        amount_debit: 0.00,
        amount_credit: 18500.00,
        currency_rate: 1.0,
        amount_native: 18500.00
      }
    ]
  },
  {
    id: 'jv-2026-003',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    jv_number: 'JV-2026-1986',
    date_of_jv: '2026-09-12',
    jv_type: 'STANDARD',
    currency_id: 'USD',
    doc_ref_number: 'EDL-SEP-01',
    description: 'Monthly plant electricity utility bill settlement and fuel provisioning',
    internal_remark: 'Paid through Cash Vault',
    department: 'PRODUCTION',
    sub_department: 'Utilities & Power',
    created_by: 'Accountant (Ziad Khoury)',
    total_debit: 4600.00,
    total_credit: 4600.00,
    is_posted: false,
    lines: [
      {
        id: 'jvl-05',
        line_number: 1,
        account_id: 'acc-61140',
        account_number: '61140',
        account_name: 'Electricity (EDL & Commercial Generators)',
        description: 'Industrial generator maintenance and power consumption',
        amount_debit: 4600.00,
        amount_credit: 0.00,
        currency_rate: 1.0,
        amount_native: 4600.00
      },
      {
        id: 'jvl-06',
        line_number: 2,
        account_id: 'acc-53000',
        account_number: '53000',
        account_name: 'Cash (Main Physical Vault)',
        description: 'Cash disbursement from plant vault',
        amount_debit: 0.00,
        amount_credit: 4600.00,
        currency_rate: 1.0,
        amount_native: 4600.00
      }
    ]
  }
];

// ==============================================================================
// 4. AR AGING & CUSTOMERS SEED (MODULE 5)
// ==============================================================================

export const INITIAL_AR_AGING: ARAgingItem[] = [
  {
    accountCode: '41110-01',
    customerName: 'Al-Baraka Supermarkets Group S.A.R.L',
    current: 12400,
    days30: 4200,
    days60: 0,
    days90Plus: 0,
    overDue: 0,
    lastPaymentDate: '2026-09-15',
    totalDebt: 16600,
    creditLimit: 25000,
    dailyLimit: 5000,
    sellingPriceLevel: 1,
    risk: 'LOW',
    title: 'Mr.',
    firstName: 'Tariq',
    lastName: 'Baraka',
    company: 'Al-Baraka Supermarkets Group',
    commercialName: 'Al-Baraka Retail',
    group: 'Wholesale Key Accounts',
    tags: [{ label: 'VIP Retailer', color: '#16a34a' }],
    mobile: '+961 71 884 920',
    email: 'finance@albaraka-retail.lb',
    contactPerson: 'Tariq Baraka (Managing Director)',
    street: 'Main Highway Blvd',
    city: 'Saida',
    country: 'Lebanon',
    vatAccountNumber: '44270-001'
  },
  {
    accountCode: '41110-02',
    customerName: 'Marwan Chehab Commercial Trading',
    current: 3300,
    days30: 2100,
    days60: 1400,
    days90Plus: 0,
    overDue: 1400,
    lastPaymentDate: '2026-08-28',
    totalDebt: 6800,
    creditLimit: 10000,
    dailyLimit: 2000,
    sellingPriceLevel: 2,
    risk: 'MEDIUM',
    title: 'Mr.',
    firstName: 'Marwan',
    lastName: 'Chehab',
    company: 'Chehab Trading Est.',
    commercialName: 'Chehab Food Supplies',
    group: 'Regional Distributors',
    tags: [{ label: 'Promised Payment', color: '#f59e0b' }],
    mobile: '+961 03 449 211',
    email: 'marwan@chehab-trading.com',
    contactPerson: 'Marwan Chehab',
    street: 'Old Souk Rd',
    city: 'Beirut',
    country: 'Lebanon',
    vatAccountNumber: '44270-004'
  },
  {
    accountCode: '41110-03',
    customerName: 'Cedar Hospitality Hotels & Resorts',
    current: 18900,
    days30: 0,
    days60: 0,
    days90Plus: 0,
    overDue: 0,
    lastPaymentDate: '2026-09-10',
    totalDebt: 18900,
    creditLimit: 50000,
    dailyLimit: 10000,
    sellingPriceLevel: 1,
    risk: 'LOW',
    title: 'Ms.',
    firstName: 'Nour',
    lastName: 'Khoury',
    company: 'Cedar Hospitality Group',
    commercialName: 'The Cedar Grand',
    group: 'Hotels & Restaurants (HORECA)',
    tags: [{ label: 'Corporate Contract', color: '#2563eb' }],
    mobile: '+961 70 339 448',
    email: 'procurement@cedarhotels.com',
    contactPerson: 'Nour Khoury (Purchasing Director)',
    street: 'Corniche El Manara',
    city: 'Beirut',
    country: 'Lebanon',
    vatAccountNumber: '44270-008'
  },
  {
    accountCode: '41110-04',
    customerName: 'Phoenicia Gourmet Chain',
    current: 8500,
    days30: 5400,
    days60: 3200,
    days90Plus: 1800,
    overDue: 5000,
    lastPaymentDate: '2026-07-22',
    totalDebt: 18900,
    creditLimit: 20000,
    dailyLimit: 3000,
    sellingPriceLevel: 3,
    risk: 'HIGH',
    title: 'Mr.',
    firstName: 'Sami',
    lastName: 'Haddad',
    company: 'Phoenicia Gourmet Foods',
    commercialName: 'Phoenicia Market',
    group: 'Gourmet Delicatessen',
    tags: [{ label: 'Collection Warning', color: '#dc2626' }],
    mobile: '+961 76 991 200',
    email: 'accounting@phoeniciagourmet.lb',
    contactPerson: 'Sami Haddad',
    street: 'Verdun Commercial St',
    city: 'Beirut',
    country: 'Lebanon',
    vatAccountNumber: '44270-012'
  },
  {
    accountCode: '41110-05',
    customerName: 'Southern Heritage Bistro',
    current: 1200,
    days30: 800,
    days60: 0,
    days90Plus: 0,
    overDue: 0,
    lastPaymentDate: '2026-09-02',
    totalDebt: 2000,
    creditLimit: 5000,
    dailyLimit: 1000,
    sellingPriceLevel: 2,
    risk: 'LOW',
    title: 'Mr.',
    firstName: 'Hassan',
    lastName: 'Diab',
    company: 'Southern Heritage Food Co',
    commercialName: 'Heritage Bistro',
    group: 'Dining & Catering',
    tags: [{ label: 'Cash & Carry', color: '#0891b2' }],
    mobile: '+961 07 721 940',
    email: 'info@heritagebistro.lb',
    contactPerson: 'Hassan Diab',
    street: 'Old Port District',
    city: 'Tyre',
    country: 'Lebanon',
    vatAccountNumber: '44270-019'
  }
];

// ==============================================================================
// 5. AP AGING & SUPPLIERS SEED (MODULE 6)
// ==============================================================================

export const INITIAL_AP_AGING: APAgingItem[] = [
  {
    vendorCode: '40110-01',
    supplierName: 'South Olive Farmers Cooperative',
    current: 32000,
    days7: 12000,
    days14: 10000,
    days30: 14500,
    days60: 0,
    days90Plus: 0,
    overDue: 0,
    lastPaymentDate: '2026-09-12',
    totalOwed: 46500,
    terms: 'Net 30 Days',
    paymentTypes: 'Wire Transfer / Check',
    status: 'DUE_SOON',
    contactPerson: 'Abu Fadi (Cooperative President)',
    contactTitle: 'Chairman',
    phone: '+961 7 760 119',
    mobile: '+961 3 992 014',
    city: 'Nabatieh',
    country: 'Lebanon',
    currency: 'USD',
    vatReg: true,
    vatNb: 'VAT-COOP-88210',
    grade: 'A',
    bankInfo: 'BLOM Bank Saida Branch - Account #88129031'
  },
  {
    vendorCode: '40110-02',
    supplierName: 'Mediterranean Glass & Bottles Factory',
    current: 11200,
    days7: 4000,
    days14: 7200,
    days30: 0,
    days60: 0,
    days90Plus: 0,
    overDue: 0,
    lastPaymentDate: '2026-09-08',
    totalOwed: 11200,
    terms: 'Net 15 Days',
    paymentTypes: 'Corporate Cheque',
    status: 'CURRENT',
    contactPerson: 'George Boulos (Sales Director)',
    contactTitle: 'Sales Director',
    phone: '+961 1 890 221',
    mobile: '+961 70 551 229',
    city: 'Choueifat',
    country: 'Lebanon',
    currency: 'USD',
    vatReg: true,
    vatNb: 'VAT-MED-99120',
    grade: 'A',
    bankInfo: 'Bank Audi Bab Idriss - Account #119283'
  },
  {
    vendorCode: '40110-03',
    supplierName: 'Al-Hilal Food Metal Tins Factory',
    current: 6500,
    days7: 0,
    days14: 3000,
    days30: 3500,
    days60: 0,
    days90Plus: 0,
    overDue: 0,
    lastPaymentDate: '2026-08-30',
    totalOwed: 6500,
    terms: 'Net 30 Days',
    paymentTypes: 'Cash / Wire',
    status: 'CURRENT',
    contactPerson: 'Hilal Sayegh',
    contactTitle: 'General Manager',
    phone: '+961 5 431 890',
    mobile: '+961 71 220 891',
    city: 'Tripoli',
    country: 'Lebanon',
    currency: 'USD',
    vatReg: true,
    vatNb: 'VAT-HIL-33910',
    grade: 'B',
    bankInfo: 'Byblos Bank Tripoli - Account #338190'
  },
  {
    vendorCode: '40110-04',
    supplierName: 'Beirut Logistics & Fleet Services',
    current: 4800,
    days7: 0,
    days14: 0,
    days30: 2400,
    days60: 2400,
    days90Plus: 0,
    overDue: 2400,
    lastPaymentDate: '2026-08-14',
    totalOwed: 4800,
    terms: 'Net 30 Days',
    paymentTypes: 'Wire Transfer',
    status: 'OVERDUE',
    contactPerson: 'Karim Trad',
    contactTitle: 'Fleet Director',
    phone: '+961 1 552 198',
    mobile: '+961 3 441 902',
    city: 'Beirut',
    country: 'Lebanon',
    currency: 'USD',
    vatReg: false,
    grade: 'C',
    bankInfo: 'Bank of Beirut Dora Branch - Account #77120'
  }
];

// ==============================================================================
// 6. MONEY COLLECTION RECORDS (MODULE 5.B)
// ==============================================================================

export const INITIAL_MONEY_COLLECTION_LOGS: MoneyCollectionRecord[] = [
  {
    id: 'col-01',
    accountNumber: '41110-02',
    accountName: 'Marwan Chehab Commercial Trading',
    dateCreated: '2026-09-12 11:30',
    type: 'Amount Ready',
    remark: 'Client confirmed check of $2,100 is signed and ready for collector pickup at Beirut office',
    datePromised: '2026-09-20',
    byUser: 'Collector (Rami Zein)'
  },
  {
    id: 'col-02',
    accountNumber: '41110-04',
    accountName: 'Phoenicia Gourmet Chain',
    dateCreated: '2026-09-10 15:45',
    type: 'Call Him Back',
    remark: 'Managing director was traveling; accountant requested follow-up call on Monday morning',
    datePromised: '2026-09-22',
    byUser: 'Credit Manager (Ziad Khoury)'
  }
];

// ==============================================================================
// 7. EXPENSE RECURRING TEMPLATES (MODULE 2.C)
// ==============================================================================

export const INITIAL_RECURRING_EXPENSES: ExpenseRecurringTemplate[] = [
  {
    id: 'rec-01',
    description: 'Monthly Industrial Generator Fuel Procurement & Maintenance',
    purchaseAccount: '401100002',
    expenseAccount: '61140',
    amount: 3200,
    currency: 'USD',
    department: 'PRODUCTION',
    refInvoice: 'REC-GEN-MONTHLY',
    internalRemark: 'Recurring diesel provision for 250kVA standby generator'
  },
  {
    id: 'rec-02',
    description: 'Choueifat Packaging Facility Monthly Commercial Rent',
    purchaseAccount: '40110',
    expenseAccount: '62640',
    amount: 4500,
    currency: 'USD',
    department: 'ADMIN',
    refInvoice: 'REC-RENT-MILL',
    internalRemark: 'Direct lease contract with Al-Choueifat Real Estate'
  },
  {
    id: 'rec-03',
    description: 'Cold-Press Filter Membrane Replacement & Oil Testing Reagents',
    purchaseAccount: '401100002',
    expenseAccount: '62620',
    amount: 1850,
    currency: 'USD',
    department: 'PRODUCTION',
    refInvoice: 'REC-LAB-REAGENTS',
    internalRemark: 'High-purity laboratory filter paper and acidity titration tests'
  }
];

// ==============================================================================
// 8. BANK STATEMENT TRANSACTIONS (MODULE 7.B)
// ==============================================================================

export const INITIAL_BANK_STATEMENT_TRANSACTIONS: BankStatementTransaction[] = [
  {
    id: 'stmt-01',
    date: '2026-09-02',
    description: 'Direct Inward Wire - Al-Baraka Group Settlement',
    payeeCustomer: 'Al-Baraka Supermarkets',
    payment: 0,
    deposit: 12400.00,
    remark: 'Ref: W-99120 BLOM',
    cleared: true
  },
  {
    id: 'stmt-02',
    date: '2026-09-05',
    description: 'Outgoing Cheque #004419 - Mediterranean Glass Bottles',
    payeeCustomer: 'Mediterranean Glass',
    payment: 11200.00,
    deposit: 0,
    remark: 'Cleared cheque batch 14',
    cleared: true
  },
  {
    id: 'stmt-03',
    date: '2026-09-09',
    description: 'Online Banking Deposit - Cedar Hospitality Invoice',
    payeeCustomer: 'Cedar Hospitality',
    payment: 0,
    deposit: 18900.00,
    remark: 'Confirmed automated transfer',
    cleared: true
  },
  {
    id: 'stmt-04',
    date: '2026-09-14',
    description: 'Outgoing Wire Transfer - South Olive Farmers Coop',
    payeeCustomer: 'South Olive Farmers Coop',
    payment: 18500.00,
    deposit: 0,
    remark: 'Batch 45T harvest payment',
    cleared: true
  },
  {
    id: 'stmt-05',
    date: '2026-09-17',
    description: 'Bank Service Commission & Monthly Account Maintenance',
    payeeCustomer: 'Bank of Beirut',
    payment: 65.00,
    deposit: 0,
    remark: 'Monthly maintenance fee',
    cleared: false
  }
];

// Monthly P&L Trend for Dashboard Chart
export const MONTHLY_PL_TREND = [
  { month: 'Jan', revenue: 38000, expenses: 24000, netProfit: 14000 },
  { month: 'Feb', revenue: 42000, expenses: 26500, netProfit: 15500 },
  { month: 'Mar', revenue: 49000, expenses: 29000, netProfit: 20000 },
  { month: 'Apr', revenue: 45000, expenses: 28200, netProfit: 16800 },
  { month: 'May', revenue: 53000, expenses: 31000, netProfit: 22000 },
  { month: 'Jun', revenue: 58000, expenses: 33500, netProfit: 24500 },
  { month: 'Jul', revenue: 64000, expenses: 36000, netProfit: 28000 },
  { month: 'Aug', revenue: 61000, expenses: 35200, netProfit: 25800 },
  { month: 'Sep', revenue: 72000, expenses: 38500, netProfit: 33500 }
];

// LocalStorage Synchronization Keys
const STORAGE_ACCOUNTS_KEY = 'vanguard_accounting_accounts_data';
const STORAGE_JVS_KEY = 'vanguard_accounting_jvs_data';
const STORAGE_AR_KEY = 'vanguard_accounting_ar_data';
const STORAGE_AP_KEY = 'vanguard_accounting_ap_data';
const STORAGE_COLLECTIONS_KEY = 'vanguard_accounting_collections_data';
const STORAGE_REC_KEY = 'vanguard_accounting_rec_expenses_data';
const STORAGE_STMT_KEY = 'vanguard_accounting_stmt_data';

export function getLocalAccounts(): AccountDetail[] {
  if (typeof window === 'undefined') return INITIAL_ACCOUNT_DETAILS.map(normalizeAccount);
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (!raw) {
      const initial = INITIAL_ACCOUNT_DETAILS.map(normalizeAccount);
      localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed.map(normalizeAccount)
      : INITIAL_ACCOUNT_DETAILS.map(normalizeAccount);
  } catch (e) {
    return INITIAL_ACCOUNT_DETAILS.map(normalizeAccount);
  }
}

export function saveLocalAccounts(list: AccountDetail[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(list));
  } catch (e) {}
}

export function getLocalJVs(): JournalVoucher[] {
  if (typeof window === 'undefined') return INITIAL_JOURNAL_VOUCHERS;
  try {
    const raw = localStorage.getItem(STORAGE_JVS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_JVS_KEY, JSON.stringify(INITIAL_JOURNAL_VOUCHERS));
      return INITIAL_JOURNAL_VOUCHERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_JOURNAL_VOUCHERS;
  } catch (e) {
    return INITIAL_JOURNAL_VOUCHERS;
  }
}

export function saveLocalJVs(list: JournalVoucher[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_JVS_KEY, JSON.stringify(list));
  } catch (e) {}
}

export function getLocalAR(): ARAgingItem[] {
  if (typeof window === 'undefined') return INITIAL_AR_AGING;
  try {
    const raw = localStorage.getItem(STORAGE_AR_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_AR_KEY, JSON.stringify(INITIAL_AR_AGING));
      return INITIAL_AR_AGING;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_AR_AGING;
  } catch (e) {
    return INITIAL_AR_AGING;
  }
}

export function saveLocalAR(list: ARAgingItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_AR_KEY, JSON.stringify(list));
  } catch (e) {}
}

export function getLocalAP(): APAgingItem[] {
  if (typeof window === 'undefined') return INITIAL_AP_AGING;
  try {
    const raw = localStorage.getItem(STORAGE_AP_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_AP_KEY, JSON.stringify(INITIAL_AP_AGING));
      return INITIAL_AP_AGING;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_AP_AGING;
  } catch (e) {
    return INITIAL_AP_AGING;
  }
}

export function saveLocalAP(list: APAgingItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_AP_KEY, JSON.stringify(list));
  } catch (e) {}
}

export function getLocalCollections(): MoneyCollectionRecord[] {
  if (typeof window === 'undefined') return INITIAL_MONEY_COLLECTION_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_COLLECTIONS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_COLLECTIONS_KEY, JSON.stringify(INITIAL_MONEY_COLLECTION_LOGS));
      return INITIAL_MONEY_COLLECTION_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MONEY_COLLECTION_LOGS;
  } catch (e) {
    return INITIAL_MONEY_COLLECTION_LOGS;
  }
}

export function saveLocalCollections(list: MoneyCollectionRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_COLLECTIONS_KEY, JSON.stringify(list));
  } catch (e) {}
}

export function getLocalRecurringExpenses(): ExpenseRecurringTemplate[] {
  if (typeof window === 'undefined') return INITIAL_RECURRING_EXPENSES;
  try {
    const raw = localStorage.getItem(STORAGE_REC_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_REC_KEY, JSON.stringify(INITIAL_RECURRING_EXPENSES));
      return INITIAL_RECURRING_EXPENSES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_RECURRING_EXPENSES;
  } catch (e) {
    return INITIAL_RECURRING_EXPENSES;
  }
}

export function saveLocalRecurringExpenses(list: ExpenseRecurringTemplate[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_REC_KEY, JSON.stringify(list));
  } catch (e) {}
}

export function getLocalBankStatement(): BankStatementTransaction[] {
  if (typeof window === 'undefined') return INITIAL_BANK_STATEMENT_TRANSACTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_STMT_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_STMT_KEY, JSON.stringify(INITIAL_BANK_STATEMENT_TRANSACTIONS));
      return INITIAL_BANK_STATEMENT_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BANK_STATEMENT_TRANSACTIONS;
  } catch (e) {
    return INITIAL_BANK_STATEMENT_TRANSACTIONS;
  }
}

export function saveLocalBankStatement(list: BankStatementTransaction[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_STMT_KEY, JSON.stringify(list));
  } catch (e) {}
}

// ==============================================================================
// MULTI-COUNTRY CHART OF ACCOUNTS (DYNAMIC MAPPING & PRESETS)
// ==============================================================================

export type CoaPresetId = 'lebanese_pca' | 'international_ifrs' | 'custom_blank';

export interface CoaPresetMetadata {
  id: CoaPresetId;
  name: string;
  codeFormat: string;
  region: string;
  description: string;
}

export function normalizeAccount(acc: AccountDetail): AccountDetail {
  const account_sub_type = acc.account_sub_type || 'OTHERS';
  let type = acc.type;
  if (!type) {
    switch (account_sub_type) {
      case 'CASH': type = 'Cash'; break;
      case 'BANK': type = 'Bank'; break;
      case 'CUSTOMER': type = 'Customer'; break;
      case 'SUPPLIER': type = 'Supplier'; break;
      case 'EMPLOYEE': type = 'Employee'; break;
      case 'EXPENSE': type = 'Expense'; break;
      default: type = 'Other'; break;
    }
  }

  let class_type = acc.class_type;
  if (!class_type) {
    switch (acc.account_type) {
      case 'ASSET': class_type = 'Assets'; break;
      case 'LIABILITY': class_type = 'Liabilities'; break;
      case 'EQUITY': class_type = 'Equity'; break;
      case 'REVENUE': class_type = 'Revenue'; break;
      case 'EXPENSE': class_type = 'Expense'; break;
      default: class_type = 'Assets'; break;
    }
  }

  return {
    ...acc,
    type,
    class_type,
    account_sub_type,
    checking_account: acc.checking_account || type === 'Cash' || type === 'Bank' || account_sub_type === 'CASH' || account_sub_type === 'BANK'
  };
}

export function isCashAccount(acc: Partial<AccountDetail>): boolean {
  if (!acc) return false;
  const num = String(acc.account_number || '').trim();
  const t = (acc.type || acc.account_sub_type || '').toLowerCase();
  return (t === 'cash' || num.startsWith('53')) && !num.startsWith('4');
}

export function isBankAccount(acc: Partial<AccountDetail>): boolean {
  if (!acc) return false;
  const num = String(acc.account_number || '').trim();
  const t = (acc.type || acc.account_sub_type || '').toLowerCase();
  return (t === 'bank' || num.startsWith('51')) && !num.startsWith('4');
}

/**
 * Strict Lebanese PCG Treasury / Disbursing Account Filter:
 * Strictly Class 5 financial and treasury accounts (Main Cash Vault, Petty Cash, Commercial Banks).
 * Explicitly removes Staff Loans (#42810) and Accrued Salaries (#47000).
 */
export function isTreasuryDisbursingAccount(acc: Partial<AccountDetail>): boolean {
  if (!acc) return false;
  const num = String(acc.account_number || '').trim();
  const idStr = String(acc.id || '').trim();

  // Explicitly remove staff loans #42810 and accrued salaries #47000
  if (
    num === '42810' ||
    num === '47000' ||
    idStr.includes('42810') ||
    idStr.includes('47000') ||
    num.startsWith('42') ||
    num.startsWith('47')
  ) {
    return false;
  }

  // Strictly Class 5 accounts
  if (acc.class_id === 5) return true;
  if (num.startsWith('5')) return true;

  const t = (acc.type || acc.account_sub_type || '').toLowerCase();
  if ((t === 'cash' || t === 'bank') && !num.startsWith('4')) {
    return true;
  }
  return false;
}

export function isDisbursingAccount(acc: Partial<AccountDetail>): boolean {
  return isTreasuryDisbursingAccount(acc);
}

/**
 * Strict Lebanese PCG Supplier / Creditor Account Filter:
 * Strictly Class 40 trade accounts (e.g. #40110 Master Suppliers, #40110002 Packaging/Raw Materials, #40410 Machinery Vendors).
 * Explicitly removes Customer VAT (#44270), Tax Dues (#44110), and VAT Payables (#44111).
 */
export function isTradeSupplierAccount(acc: Partial<AccountDetail>): boolean {
  if (!acc) return false;
  const num = String(acc.account_number || '').trim();
  const idStr = String(acc.id || '').trim();

  // Explicitly remove Customer VAT (#44270), Tax dues (#44110), and VAT payables (#44111)
  if (
    num.startsWith('44') ||
    num.startsWith('42') ||
    num.startsWith('47') ||
    num.startsWith('41') ||
    idStr.includes('4427') ||
    idStr.includes('4411')
  ) {
    return false;
  }

  // Strictly Class 40 accounts
  if (num.startsWith('40')) return true;

  const t = (acc.type || acc.account_sub_type || '').toLowerCase();
  return t === 'supplier' && !num.startsWith('44') && !num.startsWith('47') && !num.startsWith('41');
}

export function isSupplierAccount(acc: Partial<AccountDetail>): boolean {
  return isTradeSupplierAccount(acc);
}

export function isCustomerAccount(acc: Partial<AccountDetail>): boolean {
  if (!acc) return false;
  const num = String(acc.account_number || '').trim();
  if (num.startsWith('41')) return true;
  const t = (acc.type || acc.account_sub_type || '').toLowerCase();
  const c = (acc.class_type || acc.account_type || '').toLowerCase();
  return (t === 'customer' || (c === 'assets' && t !== 'cash' && t !== 'bank')) && !num.startsWith('5');
}

/**
 * Lebanese PCG Purchase / Expense / Asset Breakdown Account Filter:
 * Accepts both Class 6 (Operating Purchases & Expenses) and Class 2 (Capitalized Fixed Assets/Machinery).
 */
export function isPurchaseExpenseOrAssetAccount(acc: Partial<AccountDetail>): boolean {
  if (!acc) return false;
  const num = String(acc.account_number || '').trim();

  // Accept Class 6 (Expenses) and Class 2 (Fixed Assets/Capitalized Machinery)
  if (acc.class_id === 6 || acc.class_id === 2) return true;
  if (num.startsWith('6') || num.startsWith('2')) return true;

  const t = (acc.type || acc.account_sub_type || '').toLowerCase();
  const c = (acc.class_type || acc.account_type || '').toLowerCase();
  if (t === 'expense' || c === 'expense' || c === 'expenses') return true;
  if (c === 'assets' && !num.startsWith('5') && !num.startsWith('3') && !num.startsWith('4')) return true;
  return false;
}

export function isExpenseAccount(acc: Partial<AccountDetail>): boolean {
  return isPurchaseExpenseOrAssetAccount(acc);
}

// 1. Preset: International Standard (IFRS / US GAAP - 4-Digit)
export const COA_PRESET_INTERNATIONAL_IFRS: AccountDetail[] = [
  // Current Assets (1000 - 1499)
  {
    id: 'ifrs-1010',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '1010',
    account_name: 'Cash On Hand & Petty Cash Vault',
    description: 'Physical cash on hand and petty cash till fund',
    class_id: 1,
    sub_class4_id: 1010,
    account_type: 'ASSET',
    account_sub_type: 'CASH',
    type: 'Cash',
    class_type: 'Assets',
    currency_id: 'USD',
    balance_first_cur: 24500.00,
    balance_sec_cur: 24500.00 * LBP_RATE,
    checking_account: true,
    is_active: true
  },
  {
    id: 'ifrs-1020',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '1020',
    account_name: 'Operating Commercial Bank Account',
    description: 'Primary commercial checking and wire account',
    class_id: 1,
    sub_class4_id: 1020,
    account_type: 'ASSET',
    account_sub_type: 'BANK',
    type: 'Bank',
    class_type: 'Assets',
    currency_id: 'USD',
    balance_first_cur: 185400.00,
    balance_sec_cur: 185400.00 * LBP_RATE,
    checking_account: true,
    is_active: true
  },
  {
    id: 'ifrs-1030',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '1030',
    account_name: 'Payroll & Clearing Bank Account',
    description: 'Secondary clearing account dedicated to salary disbursement',
    class_id: 1,
    sub_class4_id: 1030,
    account_type: 'ASSET',
    account_sub_type: 'BANK',
    type: 'Bank',
    class_type: 'Assets',
    currency_id: 'USD',
    balance_first_cur: 42000.00,
    balance_sec_cur: 42000.00 * LBP_RATE,
    checking_account: true,
    is_active: true
  },
  {
    id: 'ifrs-1100',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '1100',
    account_name: 'Employee Advances & Operational Custody',
    description: 'Staff travel advances, operational imprest funds, and custody receivables',
    class_id: 1,
    sub_class4_id: 1100,
    account_type: 'ASSET',
    account_sub_type: 'EMPLOYEE',
    type: 'Employee',
    class_type: 'Assets',
    currency_id: 'USD',
    balance_first_cur: 3500.00,
    balance_sec_cur: 3500.00 * LBP_RATE,
    checking_account: true,
    is_active: true
  },
  {
    id: 'ifrs-1200',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '1200',
    account_name: 'Accounts Receivable (Trade Debtors)',
    description: 'Commercial customer invoice receivables control ledger',
    class_id: 1,
    sub_class4_id: 1200,
    account_type: 'ASSET',
    account_sub_type: 'CUSTOMER',
    type: 'Customer',
    class_type: 'Assets',
    currency_id: 'USD',
    balance_first_cur: 92400.00,
    balance_sec_cur: 92400.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'ifrs-1300',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '1300',
    account_name: 'Merchandise & Raw Material Inventory',
    description: 'Raw agricultural crops, packaging containers, and pressing supplies',
    class_id: 1,
    sub_class4_id: 1300,
    account_type: 'ASSET',
    account_sub_type: 'OTHERS',
    type: 'Other',
    class_type: 'Assets',
    currency_id: 'USD',
    balance_first_cur: 64000.00,
    balance_sec_cur: 64000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'ifrs-1400',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '1400',
    account_name: 'Prepaid Expenses & Deferred Assets',
    description: 'Prepaid insurance, lease deposits, and advance retainer contracts',
    class_id: 1,
    sub_class4_id: 1400,
    account_type: 'ASSET',
    account_sub_type: 'OTHERS',
    type: 'Other',
    class_type: 'Assets',
    currency_id: 'USD',
    balance_first_cur: 8500.00,
    balance_sec_cur: 8500.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'ifrs-1600',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '1600',
    account_name: 'Input VAT / Tax Recoverable',
    description: 'Input value-added tax on commercial purchases and operational overhead',
    class_id: 1,
    sub_class4_id: 1600,
    account_type: 'ASSET',
    account_sub_type: 'OTHERS',
    type: 'Other',
    class_type: 'Assets',
    currency_id: 'USD',
    balance_first_cur: 6200.00,
    balance_sec_cur: 6200.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },

  // Non-Current Assets (1500 - 1999)
  {
    id: 'ifrs-1500',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '1500',
    account_name: 'Industrial Machinery & Mill Press Equipment',
    description: 'Continuous centrifuge decanters, stainless steel tanks, and bottlers',
    class_id: 1,
    sub_class4_id: 1500,
    account_type: 'ASSET',
    account_sub_type: 'OTHERS',
    type: 'Other',
    class_type: 'Assets',
    currency_id: 'USD',
    balance_first_cur: 320000.00,
    balance_sec_cur: 320000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },

  // Liabilities (2000 - 2999)
  {
    id: 'ifrs-2010',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '2010',
    account_name: 'Accounts Payable (Trade Creditors)',
    description: 'Trade supplier bills, raw material farmers, and packaging vendors',
    class_id: 2,
    sub_class4_id: 2010,
    account_type: 'LIABILITY',
    account_sub_type: 'SUPPLIER',
    type: 'Supplier',
    class_type: 'Liabilities',
    currency_id: 'USD',
    balance_first_cur: 71200.00,
    balance_sec_cur: 71200.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'ifrs-2020',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '2020',
    account_name: 'Accrued Operating Expenses & Payroll Payable',
    description: 'Accrued wages, social security dues, and unbilled utility liabilities',
    class_id: 2,
    sub_class4_id: 2020,
    account_type: 'LIABILITY',
    account_sub_type: 'OTHERS',
    type: 'Other',
    class_type: 'Liabilities',
    currency_id: 'USD',
    balance_first_cur: 14800.00,
    balance_sec_cur: 14800.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'ifrs-2100',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '2100',
    account_name: 'Output VAT / Sales Tax Payable',
    description: 'Collected sales tax owed to the state ministry of finance',
    class_id: 2,
    sub_class4_id: 2100,
    account_type: 'LIABILITY',
    account_sub_type: 'OTHERS',
    type: 'Other',
    class_type: 'Liabilities',
    currency_id: 'USD',
    balance_first_cur: 9800.00,
    balance_sec_cur: 9800.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'ifrs-2200',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '2200',
    account_name: 'Short-Term Notes & Revolving Bank Credit',
    description: 'Short-term credit facility and seasonal harvesting bank loans',
    class_id: 2,
    sub_class4_id: 2200,
    account_type: 'LIABILITY',
    account_sub_type: 'BANK',
    type: 'Bank',
    class_type: 'Liabilities',
    currency_id: 'USD',
    balance_first_cur: 50000.00,
    balance_sec_cur: 50000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },

  // Equity (3000 - 3999)
  {
    id: 'ifrs-3010',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '3010',
    account_name: 'Common Stock / Share Capital',
    description: 'Founding shareholders authorized, issued, and paid-up capital',
    class_id: 3,
    sub_class4_id: 3010,
    account_type: 'EQUITY',
    account_sub_type: 'OTHERS',
    type: 'Other',
    class_type: 'Equity',
    currency_id: 'USD',
    balance_first_cur: 400000.00,
    balance_sec_cur: 400000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'ifrs-3100',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '3100',
    account_name: 'Retained Earnings (Accumulated Reserves)',
    description: 'Cumulative prior years retained operational earnings',
    class_id: 3,
    sub_class4_id: 3100,
    account_type: 'EQUITY',
    account_sub_type: 'OTHERS',
    type: 'Other',
    class_type: 'Equity',
    currency_id: 'USD',
    balance_first_cur: 182300.00,
    balance_sec_cur: 182300.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },

  // Revenue (4000 - 4999)
  {
    id: 'ifrs-4010',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '4010',
    account_name: 'Wholesale & Export Commercial Revenue',
    description: 'Bulk extra virgin olive oil distribution and export shipments',
    class_id: 4,
    sub_class4_id: 4010,
    account_type: 'REVENUE',
    account_sub_type: 'OTHERS',
    type: 'Other',
    class_type: 'Revenue',
    currency_id: 'USD',
    balance_first_cur: 540000.00,
    balance_sec_cur: 540000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'ifrs-4020',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '4020',
    account_name: 'Retail Store & Direct Consumer Sales',
    description: 'Boutique and showroom point-of-sale bottle receipts',
    class_id: 4,
    sub_class4_id: 4020,
    account_type: 'REVENUE',
    account_sub_type: 'OTHERS',
    type: 'Other',
    class_type: 'Revenue',
    currency_id: 'USD',
    balance_first_cur: 115000.00,
    balance_sec_cur: 115000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },

  // Expenses & Cost of Sales (5000 - 6999)
  {
    id: 'ifrs-5010',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '5010',
    account_name: 'Cost of Goods Sold - Raw Crop Procurement',
    description: 'Purchases of raw olive harvest crop from cooperative farms',
    class_id: 5,
    sub_class4_id: 5010,
    account_type: 'EXPENSE',
    account_sub_type: 'EXPENSE',
    type: 'Expense',
    class_type: 'Expense',
    currency_id: 'USD',
    balance_first_cur: 215000.00,
    balance_sec_cur: 215000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'ifrs-5020',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '5020',
    account_name: 'Packaging, Glass Bottles & Industrial Tins',
    description: 'Glass bottles, corks, metal tins, labels, and cardboard cartons',
    class_id: 5,
    sub_class4_id: 5020,
    account_type: 'EXPENSE',
    account_sub_type: 'EXPENSE',
    type: 'Expense',
    class_type: 'Expense',
    currency_id: 'USD',
    balance_first_cur: 38000.00,
    balance_sec_cur: 38000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'ifrs-6010',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '6010',
    account_name: 'Salaries, Wages & Technical Engineering',
    description: 'Monthly payroll, technical operators, and executive compensation',
    class_id: 5,
    sub_class4_id: 6010,
    account_type: 'EXPENSE',
    account_sub_type: 'EXPENSE',
    type: 'Expense',
    class_type: 'Expense',
    currency_id: 'USD',
    balance_first_cur: 68000.00,
    balance_sec_cur: 68000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'ifrs-6020',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '6020',
    account_name: 'Repairs, Plant Maintenance & Hydraulic Servicing',
    description: 'Centrifuge repairs, press bearing replacements, and hydraulic oil',
    class_id: 5,
    sub_class4_id: 6020,
    account_type: 'EXPENSE',
    account_sub_type: 'EXPENSE',
    type: 'Expense',
    class_type: 'Expense',
    currency_id: 'USD',
    balance_first_cur: 16400.00,
    balance_sec_cur: 16400.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'ifrs-6030',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '6030',
    account_name: 'Electric Power, Generator Fuel & Utilities',
    description: 'EDL public electricity grid supply and heavy diesel generator fuel',
    class_id: 5,
    sub_class4_id: 6030,
    account_type: 'EXPENSE',
    account_sub_type: 'EXPENSE',
    type: 'Expense',
    class_type: 'Expense',
    currency_id: 'USD',
    balance_first_cur: 21000.00,
    balance_sec_cur: 21000.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'ifrs-6040',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '6040',
    account_name: 'Freight, Logistics & Fleet Transport',
    description: 'Fleet delivery trucks, diesel fuel, and customs forwarding fees',
    class_id: 5,
    sub_class4_id: 6040,
    account_type: 'EXPENSE',
    account_sub_type: 'EXPENSE',
    type: 'Expense',
    class_type: 'Expense',
    currency_id: 'USD',
    balance_first_cur: 12500.00,
    balance_sec_cur: 12500.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'ifrs-6050',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '6050',
    account_name: 'Marketing, Advertising & Trade Shows',
    description: 'Brand packaging design, digital advertising, and exhibition stands',
    class_id: 5,
    sub_class4_id: 6050,
    account_type: 'EXPENSE',
    account_sub_type: 'EXPENSE',
    type: 'Expense',
    class_type: 'Expense',
    currency_id: 'USD',
    balance_first_cur: 9500.00,
    balance_sec_cur: 9500.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  },
  {
    id: 'ifrs-6060',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '6060',
    account_name: 'Bank Charges, Commissions & Processing Fees',
    description: 'Bank wire transfer fees, letter of credit processing, and POS fees',
    class_id: 5,
    sub_class4_id: 6060,
    account_type: 'EXPENSE',
    account_sub_type: 'EXPENSE',
    type: 'Expense',
    class_type: 'Expense',
    currency_id: 'USD',
    balance_first_cur: 3800.00,
    balance_sec_cur: 3800.00 * LBP_RATE,
    checking_account: false,
    is_active: true
  }
];

// 2. Preset: Custom / Blank (Top-Level Classes Only)
export const COA_PRESET_CUSTOM_BLANK: AccountDetail[] = [
  {
    id: 'blank-1000',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '1000',
    account_name: 'General Assets Control Account',
    description: 'Top-level master control account for all cash, bank, and physical assets',
    class_id: 1,
    sub_class4_id: 1000,
    account_type: 'ASSET',
    account_sub_type: 'CASH',
    type: 'Cash',
    class_type: 'Assets',
    currency_id: 'USD',
    balance_first_cur: 0,
    balance_sec_cur: 0,
    checking_account: true,
    is_active: true
  },
  {
    id: 'blank-2000',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '2000',
    account_name: 'General Liabilities Control Account',
    description: 'Top-level master control account for supplier debts and financial obligations',
    class_id: 2,
    sub_class4_id: 2000,
    account_type: 'LIABILITY',
    account_sub_type: 'SUPPLIER',
    type: 'Supplier',
    class_type: 'Liabilities',
    currency_id: 'USD',
    balance_first_cur: 0,
    balance_sec_cur: 0,
    checking_account: false,
    is_active: true
  },
  {
    id: 'blank-3000',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '3000',
    account_name: 'General Shareholders Equity Control Account',
    description: 'Top-level master control account for capital, equity reserves, and surplus',
    class_id: 3,
    sub_class4_id: 3000,
    account_type: 'EQUITY',
    account_sub_type: 'OTHERS',
    type: 'Other',
    class_type: 'Equity',
    currency_id: 'USD',
    balance_first_cur: 0,
    balance_sec_cur: 0,
    checking_account: false,
    is_active: true
  },
  {
    id: 'blank-4000',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '4000',
    account_name: 'General Revenue & Sales Control Account',
    description: 'Top-level master control account for commercial and operating revenues',
    class_id: 4,
    sub_class4_id: 4000,
    account_type: 'REVENUE',
    account_sub_type: 'OTHERS',
    type: 'Other',
    class_type: 'Revenue',
    currency_id: 'USD',
    balance_first_cur: 0,
    balance_sec_cur: 0,
    checking_account: false,
    is_active: true
  },
  {
    id: 'blank-5000',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    account_number: '5000',
    account_name: 'General Operating & Overhead Expense Control',
    description: 'Top-level master control account for operational expenditures and overhead',
    class_id: 5,
    sub_class4_id: 5000,
    account_type: 'EXPENSE',
    account_sub_type: 'EXPENSE',
    type: 'Expense',
    class_type: 'Expense',
    currency_id: 'USD',
    balance_first_cur: 0,
    balance_sec_cur: 0,
    checking_account: false,
    is_active: true
  }
];

// 3. Preset Metadata Registry
export const COA_PRESET_TEMPLATES: Record<CoaPresetId, CoaPresetMetadata> = {
  lebanese_pca: {
    id: 'lebanese_pca',
    name: 'Lebanese PCA (Plan Comptable Général)',
    codeFormat: '5-Digit (e.g. 53000, 51210, 40110, 61110)',
    region: 'Lebanon & Levant',
    description: 'Standard Lebanese 5-digit Chart of Accounts across classes 1-7 with Class 4 third-party sub-accounts and Class 5 liquidity.'
  },
  international_ifrs: {
    id: 'international_ifrs',
    name: 'International Standard (IFRS / US GAAP)',
    codeFormat: '4-Digit (e.g. 1010, 1020, 1200, 2010, 5010)',
    region: 'Global / International',
    description: 'Standard international 4-digit Chart of Accounts organized by Assets (1000s), Liabilities (2000s), Equity (3000s), Revenue (4000s), and Expenses (5000s-6000s).'
  },
  custom_blank: {
    id: 'custom_blank',
    name: 'Custom / Blank (Top-Level Classes Only)',
    codeFormat: 'Top-Level Classes (1000 - 5000)',
    region: 'Universal Clean Slate',
    description: 'Minimalist blank slate preloading only top-level master classes (Assets, Liabilities, Equity, Revenue, Expense) for full enterprise customization.'
  }
};

const STORAGE_COA_PRESET_KEY = 'vanguard_accounting_coa_preset_id';

export function getCoaPreset(id: CoaPresetId): AccountDetail[] {
  if (id === 'international_ifrs') {
    return COA_PRESET_INTERNATIONAL_IFRS.map(normalizeAccount);
  }
  if (id === 'custom_blank') {
    return COA_PRESET_CUSTOM_BLANK.map(normalizeAccount);
  }
  return INITIAL_ACCOUNT_DETAILS.map(normalizeAccount);
}

export function getActiveCoaPresetId(): CoaPresetId {
  if (typeof window === 'undefined') return 'lebanese_pca';
  try {
    const saved = localStorage.getItem(STORAGE_COA_PRESET_KEY) as CoaPresetId;
    if (saved && COA_PRESET_TEMPLATES[saved]) return saved;
    return 'lebanese_pca';
  } catch (e) {
    return 'lebanese_pca';
  }
}

export function setActiveCoaPresetId(id: CoaPresetId): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_COA_PRESET_KEY, id);
  } catch (e) {}
}

export function applyCoaPreset(id: CoaPresetId): AccountDetail[] {
  const presetAccounts = getCoaPreset(id);
  setActiveCoaPresetId(id);
  saveLocalAccounts(presetAccounts);
  return presetAccounts;
}

