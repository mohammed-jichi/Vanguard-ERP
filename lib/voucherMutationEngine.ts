// ==============================================================================
// Vanguard ERP: Generic Voucher & Ledger Mutation Engine
// Provides modular, type-safe voucher mutation builders, balance validators,
// and double-entry accounting resolvers for all current and upcoming voucher modules
// (Journal Vouchers, Payment Vouchers, Receipt Vouchers, Contra Vouchers, etc.)
// ==============================================================================

import { AccountDetail, LBP_RATE } from './accountingData';

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

export interface GenericVoucherLineInput {
  id?: string;
  line_number?: number;
  account_id: string;
  account_number?: string;
  account_name?: string;
  description?: string;
  department_id?: number;
  department_name?: string;
  amount_debit: number;
  amount_credit: number;
  currency_rate?: number;
  amount_native?: number;
  reference_id?: string;
}

export interface GenericVoucherInput {
  id?: string;
  tenant_id?: string;
  voucher_number?: string;
  jv_number?: string;
  voucher_type?: VoucherType;
  jv_type?: VoucherType;
  date?: string;
  date_of_jv?: string;
  currency_id?: 'USD' | 'LBP' | string;
  doc_ref_number?: string;
  description: string;
  internal_remark?: string;
  department?: string;
  sub_department?: string;
  payee_or_recipient?: string;
  payment_method?: 'CASH' | 'CHEQUE' | 'WIRE' | 'CARD' | 'OTHER' | string;
  reference_number?: string;
  supporting_doc_url?: string;
  created_by?: string;
  lines: GenericVoucherLineInput[];
  postImmediately?: boolean;
}

export interface PaymentVoucherMutationInput {
  id?: string;
  voucherNumber?: string;
  payToAccountId: string;
  fromAccountId: string;
  amount: number;
  currency?: 'USD' | 'LBP' | string;
  date?: string;
  description: string;
  internalNote?: string;
  referenceNumber?: string;
  department?: string;
  paymentMethod?: 'CASH' | 'CHEQUE' | 'WIRE' | 'CARD' | 'OTHER';
  supportingDocUrl?: string;
  postImmediately?: boolean;
  user?: string;
}

export interface ReceiptVoucherItemInput {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency?: 'USD' | 'LBP';
  description?: string;
  checkNumber?: string;
  department?: string;
}

export interface ReceiptVoucherMutationInput {
  id?: string;
  voucherNumber?: string;
  items: ReceiptVoucherItemInput[];
  currency?: 'USD' | 'LBP' | string;
  date?: string;
  description?: string;
  department?: string;
  postImmediately?: boolean;
  user?: string;
}

export interface ContraVoucherMutationInput {
  id?: string;
  voucherNumber?: string;
  fromAccountId: string; // Source bank/cash account
  toAccountId: string;   // Destination bank/cash account
  amount: number;
  currency?: 'USD' | 'LBP' | string;
  date?: string;
  description: string;
  referenceNumber?: string;
  department?: string;
  postImmediately?: boolean;
  user?: string;
}

/**
 * Normal balance rules in double-entry accounting:
 * - ASSET and EXPENSE accounts increase on DEBIT and decrease on CREDIT.
 * - LIABILITY, EQUITY, and REVENUE accounts increase on CREDIT and decrease on DEBIT.
 */
export function calculateAccountBalanceMutation(
  account: { account_type: string; balance_first_cur: number },
  debit: number,
  credit: number
): { newBalanceUsd: number; newBalanceLbp: number; netChangeUsd: number } {
  const isDebitNormal =
    account.account_type === 'ASSET' ||
    account.account_type === 'EXPENSE' ||
    account.account_type.toUpperCase() === 'ASSET' ||
    account.account_type.toUpperCase() === 'EXPENSE';

  const netChangeUsd = isDebitNormal ? debit - credit : credit - debit;
  const newBalanceUsd = Math.round((account.balance_first_cur + netChangeUsd) * 100) / 100;
  const newBalanceLbp = Math.round(newBalanceUsd * LBP_RATE);

  return { newBalanceUsd, newBalanceLbp, netChangeUsd };
}

/**
 * Validates that debit and credit totals match within floating point precision (0.005).
 */
export function validateVoucherBalance(lines: GenericVoucherLineInput[]): {
  isBalanced: boolean;
  totalDebit: number;
  totalCredit: number;
  difference: number;
} {
  let totalDebit = 0;
  let totalCredit = 0;

  for (const line of lines) {
    totalDebit += Number(line.amount_debit) || 0;
    totalCredit += Number(line.amount_credit) || 0;
  }

  totalDebit = Math.round(totalDebit * 100) / 100;
  totalCredit = Math.round(totalCredit * 100) / 100;
  const difference = Math.abs(Math.round((totalDebit - totalCredit) * 100) / 100);

  return {
    isBalanced: difference < 0.005,
    totalDebit,
    totalCredit,
    difference
  };
}

/**
 * Modular Line Builder: Payment Voucher (PV)
 * Double entry structure:
 * 1. DEBIT Pay-To Account (reduces Accounts Payable liability, or charges expense)
 * 2. CREDIT Disbursing Account (reduces Cash / Bank asset liquidity)
 */
export function buildPaymentVoucherLines(params: {
  payToAccount: { id: string; account_number: string; account_name: string };
  fromAccount: { id: string; account_number: string; account_name: string };
  amount: number;
  description: string;
  referenceNumber?: string;
  department?: string;
}): GenericVoucherLineInput[] {
  const amt = Math.round(Number(params.amount) * 100) / 100;
  const dept = params.department || 'Executive & Administration';

  return [
    {
      id: `line-${Date.now()}-1`,
      line_number: 1,
      account_id: params.payToAccount.id,
      account_number: params.payToAccount.account_number,
      account_name: params.payToAccount.account_name,
      description: params.description,
      department_name: dept,
      amount_debit: amt,
      amount_credit: 0,
      currency_rate: 1.0,
      amount_native: amt
    },
    {
      id: `line-${Date.now()}-2`,
      line_number: 2,
      account_id: params.fromAccount.id,
      account_number: params.fromAccount.account_number,
      account_name: params.fromAccount.account_name,
      description: `Disbursement from ${params.fromAccount.account_name}${
        params.referenceNumber ? ` - Ref: ${params.referenceNumber}` : ''
      }`,
      department_name: dept,
      amount_debit: 0,
      amount_credit: amt,
      currency_rate: 1.0,
      amount_native: amt
    }
  ];
}

/**
 * Modular Line Builder: Receipt Voucher (RV)
 * Double entry structure:
 * For each collected receipt item:
 * 1. DEBIT Cash / Bank Vault (increases Asset liquidity)
 * 2. CREDIT Customer / Client Account (reduces Accounts Receivable asset)
 */
export function buildReceiptVoucherLines(params: {
  items: Array<{
    fromAccount: { id: string; account_number: string; account_name: string };
    toAccount: { id: string; account_number: string; account_name: string };
    amount: number;
    description?: string;
    checkNumber?: string;
    department?: string;
  }>;
  generalDescription?: string;
}): GenericVoucherLineInput[] {
  const lines: GenericVoucherLineInput[] = [];
  let lineIdx = 1;

  for (const item of params.items) {
    const amt = Math.round(Number(item.amount) * 100) / 100;
    const dept = item.department || 'Commercial Sales & Retail';

    // Debit Cash / Bank Vault
    lines.push({
      id: `line-${Date.now()}-${lineIdx}`,
      line_number: lineIdx++,
      account_id: item.toAccount.id,
      account_number: item.toAccount.account_number,
      account_name: item.toAccount.account_name,
      description: item.description || `Collection into ${item.toAccount.account_name}`,
      department_name: dept,
      amount_debit: amt,
      amount_credit: 0,
      currency_rate: 1.0,
      amount_native: amt
    });

    // Credit Customer / Client
    lines.push({
      id: `line-${Date.now()}-${lineIdx}`,
      line_number: lineIdx++,
      account_id: item.fromAccount.id,
      account_number: item.fromAccount.account_number,
      account_name: item.fromAccount.account_name,
      description:
        item.description ||
        `Settlement from ${item.fromAccount.account_name}${
          item.checkNumber ? ` (Cheque #${item.checkNumber})` : ''
        }`,
      department_name: dept,
      amount_debit: 0,
      amount_credit: amt,
      currency_rate: 1.0,
      amount_native: amt
    });
  }

  return lines;
}

/**
 * Modular Line Builder: Contra Voucher (CV)
 * Double entry structure:
 * 1. DEBIT Destination Account (e.g. Petty Cash Vault)
 * 2. CREDIT Source Account (e.g. Bank Account)
 */
export function buildContraVoucherLines(params: {
  fromAccount: { id: string; account_number: string; account_name: string };
  toAccount: { id: string; account_number: string; account_name: string };
  amount: number;
  description: string;
  department?: string;
}): GenericVoucherLineInput[] {
  const amt = Math.round(Number(params.amount) * 100) / 100;
  const dept = params.department || 'Treasury & Finance';

  return [
    {
      id: `line-${Date.now()}-1`,
      line_number: 1,
      account_id: params.toAccount.id,
      account_number: params.toAccount.account_number,
      account_name: params.toAccount.account_name,
      description: `Fund transfer into ${params.toAccount.account_name}: ${params.description}`,
      department_name: dept,
      amount_debit: amt,
      amount_credit: 0,
      currency_rate: 1.0,
      amount_native: amt
    },
    {
      id: `line-${Date.now()}-2`,
      line_number: 2,
      account_id: params.fromAccount.id,
      account_number: params.fromAccount.account_number,
      account_name: params.fromAccount.account_name,
      description: `Fund withdrawal from ${params.fromAccount.account_name}: ${params.description}`,
      department_name: dept,
      amount_debit: 0,
      amount_credit: amt,
      currency_rate: 1.0,
      amount_native: amt
    }
  ];
}
