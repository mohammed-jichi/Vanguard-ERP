/**
 * lib/tenderPaymentEngine.ts
 * ============================================================================
 * Central Payment & Tender Reporting Engine for Vanguard ERP
 * 
 * Provides canonical payment methods, filter option generators,
 * and intelligent tender matching/normalization for sales audit reports.
 * ============================================================================
 */

import { TENDER_MAPPINGS, normalizeFilterToken } from './reportFilterEngine';
import { extractCurrencyFromFilter } from './currencyEngine';

export interface TenderPaymentOption {
  label: string;
  value: string;
  currency?: string;
  category?: 'cash' | 'card' | 'credit' | 'wallet' | 'split' | 'check';
}

export const CANONICAL_TENDER_PAYMENTS: TenderPaymentOption[] = [
  { label: 'Cash (All Currencies)', value: 'CASH', category: 'cash' },
  { label: 'Cash USD ($)', value: 'CASH_USD', currency: 'USD', category: 'cash' },
  { label: 'Cash LBP (LBP)', value: 'CASH_LBP', currency: 'LBP', category: 'cash' },
  { label: 'Cash EUR (€)', value: 'CASH_EUR', currency: 'EUR', category: 'cash' },
  { label: 'Card / Visa POS (All Currencies)', value: 'CARD', category: 'card' },
  { label: 'Card USD ($)', value: 'CARD_USD', currency: 'USD', category: 'card' },
  { label: 'Card LBP (LBP)', value: 'CARD_LBP', currency: 'LBP', category: 'card' },
  { label: 'Card EUR (€)', value: 'CARD_EUR', currency: 'EUR', category: 'card' },
  { label: 'Credit on Account', value: 'ON ACC', category: 'credit' },
  { label: 'Split / Mixed Tender', value: 'SPLIT', category: 'split' },
  { label: 'Whish Money / E-Wallets', value: 'WHISH', category: 'wallet' },
  { label: 'Bank Check', value: 'CHECK', category: 'check' },
];

/**
 * Returns options for Payment Method filter dropdowns.
 * Defaults to "All Methods" as the first option.
 */
export function getTenderPaymentOptions(allLabel: string = 'All Methods'): { label: string; value: string }[] {
  const options = CANONICAL_TENDER_PAYMENTS.map((t) => ({
    label: t.label,
    value: t.value,
  }));

  return [{ label: allLabel, value: 'ALL' }, ...options];
}

/**
 * Normalizes any tender string into a standardized token.
 */
export function normalizeTenderToken(input?: string): string {
  if (!input) return 'CASH';
  const clean = String(input).trim().toLowerCase();
  const slug = normalizeFilterToken(clean);
  if (TENDER_MAPPINGS[slug]) return TENDER_MAPPINGS[slug];
  if (TENDER_MAPPINGS[clean]) return TENDER_MAPPINGS[clean];
  return input.toUpperCase();
}

/**
 * Determines whether a record's payment tender matches an active filter value.
 * Supports cross-currency tenders and multi-tender matching.
 */
export function matchesPaymentFilter(recordPay: any, filterPay: any, recordCurrency?: string): boolean {
  if (!filterPay || filterPay === 'ALL' || filterPay === 'all') return true;
  const r = String(recordPay || '').toUpperCase().trim();
  const f = String(filterPay || '').toUpperCase().trim();
  if (r === f) return true;

  // Extract explicit currency from filter if any (USD, LBP, EUR, GBP, etc.)
  const filterCurr = extractCurrencyFromFilter(f);
  const recCurr = recordCurrency ? String(recordCurrency).toUpperCase().trim() : extractCurrencyFromFilter(r);

  // If filter specifies a currency (e.g. CASH_USD, CARD_EUR, or USD), ensure record currency matches
  if (filterCurr && recCurr && filterCurr !== recCurr) {
    return false;
  }

  // Cash tender
  if (f.includes('CASH')) {
    return r.includes('CASH');
  }

  // Card tender
  if (f.includes('CARD') || f.includes('CREDIT_CARD')) {
    return r.includes('CARD') || r.includes('VISA') || r.includes('MASTERCARD');
  }

  // Credit on Account / Customer Ledger Credit
  if (f === 'CREDIT_ACCOUNT' || f === 'CREDIT ON ACCOUNT' || f === 'ON ACC' || f === 'ON_ACC' || f === 'CREDIT') {
    return r.includes('ACC') || r.includes('CREDIT') || r.includes('ACCOUNT');
  }

  // Mixed / Split Tender
  if (f === 'SPLIT' || f === 'MIXED' || f === 'SPLIT TENDER' || f === 'MIXED / SPLIT TENDER') {
    return r.includes('SPLIT') || r.includes('MIXED');
  }

  // Whish Money / E-Wallets
  if (f === 'WHISH' || f === 'WISH' || f === 'E_WALLET' || f === 'E-WALLET' || f === 'WHISH MONEY / E-WALLETS' || f === 'WHISH PAY / WALLETS') {
    return r.includes('WHISH') || r.includes('WALLET');
  }

  // Checks
  if (f.includes('CHECK') || f.includes('CHEQUE')) {
    return r.includes('CHECK') || r.includes('CHEQUE');
  }

  // Pure Currency filter (e.g. 'USD', 'EUR', 'GBP', 'LBP')
  if (filterCurr && f === filterCurr) {
    return recCurr === filterCurr;
  }

  return r.includes(f) || f.includes(r);
}

/**
 * Alias for matchesPaymentFilter
 */
export const matchesTenderFilter = matchesPaymentFilter;
