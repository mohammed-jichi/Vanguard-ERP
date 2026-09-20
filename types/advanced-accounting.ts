// ============================================================
// VANGUARD ERP: ADVANCED ACCOUNTING, TAX SPLIT & ALLOCATIONS TYPES
// ============================================================

export interface SystemTaxConfiguration {
  id: string;
  tax_code: string;
  tax_name: string;
  tax_rate: number;
  is_active: boolean;
  enable_rounding_up: boolean;
  tax1_account_id?: string;
  tax2_account_id?: string;
  tax3_account_id?: string;
  created_at?: string;
}

export interface CompanyDepartment {
  id: string;
  code: string;
  name: string;
  cost_center_code?: string;
  is_active: boolean;
  created_at?: string;
}

export interface ChartOfAccountRecord {
  id: string;
  code: string;
  name: string;
  type: string;
  currency?: string;
  normal_balance?: string;
  balance: number;
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
}

export interface JournalVoucherRecord {
  id: string;
  voucher_number: string;
  voucher_date: string;
  reference_no?: string;
  narration: string;
  is_posted: boolean;
  created_at?: string;
  lines?: JournalEntryLineRecord[];
}

export interface JournalEntryLineRecord {
  id: string;
  voucher_id: string;
  account_id: string;
  department_id?: string;
  description: string;
  debit: number;
  credit: number;
  created_at?: string;
}

export type PrepaidAllocationStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface GLPrepaidAllocationRecord {
  id: string;
  origin_voucher_id: string;
  prepaid_asset_account_id: string;
  expense_target_account_id: string;
  total_amount: number;
  monthly_installment: number;
  total_months: number;
  remaining_months: number;
  start_date: string;
  status: PrepaidAllocationStatus;
  created_at?: string;
}

export interface CalculateTaxOptions {
  baseAmount: number;
  taxRate: number;
  applyRounding?: boolean;
}

export interface CreatePrepaidAllocationInput {
  originVoucherId: string;
  prepaidAssetAccountId: string;
  expenseTargetAccountId: string;
  totalAmount: number;
  totalMonths: number;
  startDate?: string;
}
