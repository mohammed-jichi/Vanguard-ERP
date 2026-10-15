/**
 * Vanguard ERP - Customer Financials, Receipts, Aging, and Special Pricing Service
 * Southern Olive and Oil Products S.A.R.L. (منتوجات زيت وزيتون الجنوب ش.م.م)
 * Facility: [1300-01] Main
 */

import { supabase } from '@/lib/supabaseClient';
import { POS_EXCHANGE_RATE_LBP, getActiveShift, recordCashMovement } from '@/lib/posShiftService';
import { peekNextDocNumber, commitNextDocNumber, cleanDocumentNumber } from '@/lib/utils/documentSequence';

export const CUSTOMER_RECEIPTS_KEY = 'vanguard_customer_receipts_v1';
export const CUSTOMER_SPECIAL_PRICES_KEY = 'vanguard_customer_special_prices_v1';
export const RECURRING_TEMPLATES_KEY = 'vanguard_recurring_templates_v1';

export const CUSTOMER_RECEIPTS_UPDATED_EVENT = 'vanguard_customer_receipts_updated';
export const CUSTOMER_PRICING_UPDATED_EVENT = 'vanguard_customer_pricing_updated';
export const RECURRING_TEMPLATES_UPDATED_EVENT = 'vanguard_recurring_templates_updated';

function resolveTenantId(tenantId?: string): string {
  if (tenantId && tenantId !== '1300' && !tenantId.startsWith('comp-')) {
    return tenantId;
  }
  return '00000000-0000-0000-0000-000000000001';
}

// =============================================================================
// 1. CUSTOMER RECEIPTS (سندات قبض الزبائن)
// =============================================================================

export interface ReceiptInvoiceAllocation {
  invoiceId: string;
  invoiceNo: string;
  invoiceDate?: string;
  totalInvoiceAmountUsd: number;
  previousBalanceDueUsd: number;
  allocatedAmountUsd: number;
  remainingBalanceDueUsd: number;
}

export interface CustomerReceipt {
  id: string;
  receiptNo: string; // e.g., 'RV-00501'
  branchId: string;
  shiftId: string;
  customerId: string;
  customerName: string;
  paymentMethod: string; // 'CASH USD' | 'CASH LBP' | 'BANK TRANSFER' | 'CHECK' | 'CARD'
  currencyCode: 'USD' | 'LBP' | 'EUR' | 'GBP';
  amountReceived: number;
  amountReceivedUsd: number;
  amountReceivedLbp: number;
  discountGiven: number; // Settlement discount / حسم تعجيل دفع
  exchangeRate: number;
  notes: string;
  allocations: ReceiptInvoiceAllocation[];
  journalEntryId?: string;
  cashierName?: string;
  createdAt: string;
  date?: string;
  status?: string;
  isVoided?: boolean;
  closedInZReport?: boolean;
  shiftClosed?: boolean;
}

export function generateNextReceiptNumber(): string {
  const receipts = getCustomerReceipts();
  return peekNextDocNumber('CUSTOMER_RECEIPT', receipts);
}

export function getCustomerReceipts(): CustomerReceipt[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOMER_RECEIPTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading customer receipts from localStorage:', e);
  }

  // Seed default receipts
  const defaults: CustomerReceipt[] = [
    {
      id: '5002601',
      receiptNo: '5002601',
      branchId: 'Southern Olive and Oil Products S.A.R.L.',
      shiftId: 'SH-20261014-44',
      customerId: 'CUST-002',
      customerName: 'Beirut Gourmet Market',
      paymentMethod: 'CASH USD',
      currencyCode: 'USD',
      amountReceived: 450.0,
      amountReceivedUsd: 450.0,
      amountReceivedLbp: 450.0 * POS_EXCHANGE_RATE_LBP,
      discountGiven: 10.0,
      exchangeRate: POS_EXCHANGE_RATE_LBP,
      notes: 'Settlement for Invoice 0002602 (partial settlement)',
      allocations: [
        {
          invoiceId: '0002602',
          invoiceNo: '0002602',
          totalInvoiceAmountUsd: 850.0,
          previousBalanceDueUsd: 850.0,
          allocatedAmountUsd: 450.0,
          remainingBalanceDueUsd: 400.0
        }
      ],
      journalEntryId: 'jv-rct-seed-01',
      cashierName: 'Active Cashier',
      createdAt: new Date().toISOString(),
      isVoided: false
    },
    {
      id: '5002602',
      receiptNo: '5002602',
      branchId: 'Southern Olive and Oil Products S.A.R.L.',
      shiftId: 'SH-20261014-44',
      customerId: 'CUST-003',
      customerName: 'Phoenicia Hotels S.A.L',
      paymentMethod: 'BANK TRANSFER',
      currencyCode: 'USD',
      amountReceived: 1200.0,
      amountReceivedUsd: 1200.0,
      amountReceivedLbp: 1200.0 * POS_EXCHANGE_RATE_LBP,
      discountGiven: 0,
      exchangeRate: POS_EXCHANGE_RATE_LBP,
      notes: 'Wire transfer settle 0002601 in full',
      allocations: [
        {
          invoiceId: '0002601',
          invoiceNo: '0002601',
          totalInvoiceAmountUsd: 1200.0,
          previousBalanceDueUsd: 1200.0,
          allocatedAmountUsd: 1200.0,
          remainingBalanceDueUsd: 0
        }
      ],
      journalEntryId: 'jv-rct-seed-02',
      cashierName: 'Active Cashier',
      createdAt: new Date().toISOString(),
      isVoided: false
    }
  ];
  saveCustomerReceipts(defaults);
  return defaults;
}

export function saveCustomerReceipts(list: CustomerReceipt[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOMER_RECEIPTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(CUSTOMER_RECEIPTS_UPDATED_EVENT, { detail: list }));
  } catch (e) {
    console.warn('Error saving customer receipts:', e);
  }
}

/**
 * Creates double-entry journal entry for Customer Receipt
 */
export async function createJournalEntryForReceipt(
  receipt: CustomerReceipt,
  tenantId?: string
): Promise<string> {
  const jvId = `jv-rct-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const jvNumber = `JV-${receipt.receiptNo}`;
  const jvDate = receipt.createdAt ? receipt.createdAt.split('T')[0] : new Date().toISOString().split('T')[0];

  const isCash = receipt.paymentMethod.toUpperCase().includes('CASH');
  const debitAccountId = isCash ? 'acc-53100' : 'acc-51210';
  const debitAccountNo = isCash ? '53100' : '51210';
  const debitAccountName = isCash
    ? 'POS Cash Drawer - Branch Main / صندوق الكاشير الفرعي'
    : 'Commercial Bank Accounts (BLOM/Audi/BOB)';

  const customerAccountId = 'acc-41100';
  const customerAccountNo = '41100';
  const customerAccountName = `Trade Customers / ذمم الزبائن (${receipt.customerName})`;

  const totalCreditUsd = receipt.amountReceivedUsd + (receipt.discountGiven || 0);

  const lines: any[] = [
    // 1. Debit: Cash / Bank
    {
      id: `line-${Date.now()}-1`,
      line_number: 1,
      account_id: debitAccountId,
      account_number: debitAccountNo,
      account_name: debitAccountName,
      description: `Collection from ${receipt.customerName} (${receipt.receiptNo})`,
      amount_debit: receipt.amountReceivedUsd,
      amount_credit: 0,
      currency_rate: receipt.exchangeRate,
      amount_native: receipt.amountReceived
    }
  ];

  // 2. Debit: Discount Allowed (if any)
  if (receipt.discountGiven > 0) {
    lines.push({
      id: `line-${Date.now()}-2`,
      line_number: 2,
      account_id: 'acc-65200',
      account_number: '65200',
      account_name: 'Cash Discounts Allowed / حسم ممنوح للزبائن',
      description: `Settlement discount for ${receipt.customerName} (${receipt.receiptNo})`,
      amount_debit: receipt.discountGiven,
      amount_credit: 0,
      currency_rate: receipt.exchangeRate,
      amount_native: receipt.discountGiven
    });
  }

  // 3. Credit: Customer AR
  lines.push({
    id: `line-${Date.now()}-3`,
    line_number: lines.length + 1,
    account_id: customerAccountId,
    account_number: customerAccountNo,
    account_name: customerAccountName,
    description: receipt.notes || `Payment settlement on account (${receipt.receiptNo})`,
    amount_debit: 0,
    amount_credit: totalCreditUsd,
    currency_rate: receipt.exchangeRate,
    amount_native: totalCreditUsd
  });

  const jv = {
    id: jvId,
    tenant_id: resolveTenantId(tenantId),
    jv_number: jvNumber,
    date_of_jv: jvDate,
    jv_type: 'RV',
    currency_id: receipt.currencyCode === 'LBP' ? 'LBP' : 'USD',
    doc_ref_number: receipt.receiptNo,
    description: `[Customer Receipt] ${receipt.customerName} - ${receipt.notes} (${receipt.receiptNo})`,
    payee_or_recipient: receipt.customerName,
    created_by: receipt.cashierName || 'Cashier',
    total_debit: totalCreditUsd,
    total_credit: totalCreditUsd,
    is_posted: true,
    status: 'POSTED',
    created_at: receipt.createdAt,
    lines
  };

  // Sync to local storage
  if (typeof window !== 'undefined') {
    try {
      const STORAGE_JVS_KEY = 'vanguard_accounting_jvs_data';
      const raw = localStorage.getItem(STORAGE_JVS_KEY);
      const jvs = raw ? JSON.parse(raw) : [];
      localStorage.setItem(STORAGE_JVS_KEY, JSON.stringify([jv, ...jvs]));
      window.dispatchEvent(new CustomEvent('vanguard_accounting_sync', {
        detail: { type: 'VOUCHER_SAVED', data: jv }
      }));
    } catch {}
  }

  // Dual persist to API if available
  try {
    fetch('/api/accounting/vouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voucher: jv,
        lines,
        postImmediately: true,
        user: receipt.cashierName
      })
    }).catch(() => {});
  } catch {}

  return jvId;
}

export async function recordCustomerReceipt(
  receiptData: Omit<CustomerReceipt, 'id' | 'receiptNo' | 'createdAt'> & { receiptNo?: string },
  tenantId?: string
): Promise<CustomerReceipt> {
  const current = getCustomerReceipts();
  const nextNo = receiptData.receiptNo || generateNextReceiptNumber();
  commitNextDocNumber('CUSTOMER_RECEIPT', nextNo, tenantId);
  const nowIso = new Date().toISOString();

  const newReceipt: CustomerReceipt = {
    ...receiptData,
    id: nextNo,
    receiptNo: nextNo,
    createdAt: nowIso,
    isVoided: false
  };

  // Create Accounting Journal Entry
  try {
    const jvId = await createJournalEntryForReceipt(newReceipt, tenantId);
    newReceipt.journalEntryId = jvId;
  } catch (err) {
    console.warn('Failed to auto-create journal entry for customer receipt:', err);
  }

  const updated = [newReceipt, ...current];
  saveCustomerReceipts(updated);

  // Sync with Supabase feature flags
  try {
    const targetTenantId = resolveTenantId(tenantId);
    supabase.from('tenants').select('feature_flags').eq('id', targetTenantId).maybeSingle().then(({ data }) => {
      const flags = (data?.feature_flags as Record<string, any>) || {};
      supabase.from('tenants').update({
        feature_flags: {
          ...flags,
          recent_customer_receipts: updated.slice(0, 50)
        }
      }).eq('id', targetTenantId);
    });
  } catch {}

  return newReceipt;
}

// =============================================================================
// 2. CUSTOMER AGED ENGINE (أعمار الذمم والديون)
// =============================================================================

export interface AgingBucket {
  current30: number; // 0 - 30 days
  days31to60: number; // 31 - 60 days
  days61to90: number; // 61 - 90 days
  over90: number; // > 90 days
  totalDue: number;
}

export interface CustomerAgingRow {
  customerId: string;
  customerName: string;
  creditLimit: number;
  buckets: AgingBucket;
  unpaidInvoices: Array<{
    invoiceId: string;
    invoiceNo: string;
    date: string;
    daysOld: number;
    grandTotal: number;
    amountPaid: number;
    balanceDue: number;
  }>;
}

export function calculateCustomerAging(
  invoices: any[],
  filterCustomerId?: string
): CustomerAgingRow[] {
  const now = new Date().getTime();
  const customerMap = new Map<string, CustomerAgingRow>();

  // Process invoices
  invoices.forEach((inv) => {
    // Only look at posted invoices
    if (inv.status?.toLowerCase() === 'draft' || inv.docType === 'CREDIT_NOTE') return;

    const cId = inv.customerId || 'CUST-001';
    const cName = inv.customerName || 'Miscellaneous Customer';
    if (filterCustomerId && filterCustomerId !== 'ALL' && cId !== filterCustomerId) return;

    const gTotal = Number(inv.grandTotal || 0);
    const paid = Number(inv.amount_paid || inv.paidAmount || (inv.payments && inv.payments.reduce((s: number, p: any) => s + Number(p.amount || 0), 0)) || 0);
    const due = Math.max(0, gTotal - paid);

    if (due <= 0.01) return; // invoice is settled

    // Calculate days old
    const invDateStr = inv.date || inv.invoiceDate || inv.createdAt;
    const invDate = new Date(invDateStr).getTime();
    const diffDays = Math.max(0, Math.floor((now - (isNaN(invDate) ? now : invDate)) / (1000 * 60 * 60 * 24)));

    if (!customerMap.has(cId)) {
      customerMap.set(cId, {
        customerId: cId,
        customerName: cName,
        creditLimit: 5000.0,
        buckets: {
          current30: 0,
          days31to60: 0,
          days61to90: 0,
          over90: 0,
          totalDue: 0
        },
        unpaidInvoices: []
      });
    }

    const row = customerMap.get(cId)!;
    row.buckets.totalDue += due;

    if (diffDays <= 30) {
      row.buckets.current30 += due;
    } else if (diffDays <= 60) {
      row.buckets.days31to60 += due;
    } else if (diffDays <= 90) {
      row.buckets.days61to90 += due;
    } else {
      row.buckets.over90 += due;
    }

    row.unpaidInvoices.push({
      invoiceId: inv.id || inv.invoiceNumber,
      invoiceNo: inv.invoiceNumber || inv.id,
      date: inv.date || new Date().toISOString().split('T')[0],
      daysOld: diffDays,
      grandTotal: gTotal,
      amountPaid: paid,
      balanceDue: due
    });
  });

  // Sort by total debt descending
  return Array.from(customerMap.values()).sort((a, b) => b.buckets.totalDue - a.buckets.totalDue);
}

// =============================================================================
// 3. CUSTOMER SPECIAL PRICING & PRICE WATERFALL (أسعار خاصة للزبائن)
// =============================================================================

export interface CustomerSpecialPrice {
  id: string;
  customerId: string;
  customerName: string;
  itemId?: string;
  itemCode: string;
  itemName: string;
  unit: string;
  currencyCode: 'USD';
  specialPrice: number;
  discountPercent?: number;
  validFrom?: string;
  validTo?: string;
  updatedAt: string;
}

export function getCustomerSpecialPrices(): CustomerSpecialPrice[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOMER_SPECIAL_PRICES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading customer special prices from localStorage:', e);
  }

  // Default seed special prices for premier accounts
  const defaults: CustomerSpecialPrice[] = [
    {
      id: 'sp-01',
      customerId: 'CUST-002',
      customerName: 'Beirut Gourmet Market',
      itemCode: 'EVOO-16L',
      itemName: 'Extra Virgin Olive Oil 16L Tin',
      unit: 'TIN',
      currencyCode: 'USD',
      specialPrice: 110.00, // Standard is 115.00
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sp-02',
      customerId: 'CUST-002',
      customerName: 'Beirut Gourmet Market',
      itemCode: 'EVOO-1L-BOT',
      itemName: 'Extra Virgin Olive Oil 1L Glass Bottle',
      unit: 'BOT',
      currencyCode: 'USD',
      specialPrice: 8.50, // Standard is 9.50
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sp-03',
      customerId: 'CUST-003',
      customerName: 'Phoenicia Hotels S.A.L',
      itemCode: 'EVOO-16L',
      itemName: 'Extra Virgin Olive Oil 16L Tin',
      unit: 'TIN',
      currencyCode: 'USD',
      specialPrice: 105.00, // VIP rate
      updatedAt: new Date().toISOString()
    }
  ];
  saveCustomerSpecialPrices(defaults);
  return defaults;
}

export function saveCustomerSpecialPrices(list: CustomerSpecialPrice[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOMER_SPECIAL_PRICES_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(CUSTOMER_PRICING_UPDATED_EVENT, { detail: list }));
  } catch (e) {
    console.warn('Error saving customer special prices:', e);
  }
}

/**
 * Strict 3-Priority Price Waterfall Resolver:
 * Priority 1: Customer Special Negotiated Contract Price
 * Priority 2: Customer Price Tier (Wholesale / Retail / Selling Price 2)
 * Priority 3: Default Branch Price
 */
export function resolveItemPriceWaterfall({
  customerId,
  itemCode,
  standardPrice,
  customerPriceTier,
  tierMultiplier = 1
}: {
  customerId?: string;
  itemCode: string;
  standardPrice: number;
  customerPriceTier?: 'Retail' | 'Wholesale' | 'VIP' | string;
  tierMultiplier?: number;
}): { resolvedPrice: number; source: 'SPECIAL_PRICE' | 'TIER' | 'STANDARD' } {
  if (customerId) {
    const specialPrices = getCustomerSpecialPrices();
    const match = specialPrices.find(
      (sp) => sp.customerId === customerId && sp.itemCode.toLowerCase() === itemCode.toLowerCase()
    );
    if (match && match.specialPrice > 0) {
      return { resolvedPrice: match.specialPrice, source: 'SPECIAL_PRICE' };
    }
  }

  // Priority 2: Wholesale / Tier Pricing
  if (customerPriceTier?.toLowerCase().includes('wholesale') || customerPriceTier === 'VIP') {
    const wholesaleDiscountRate = 0.90; // 10% wholesale tier discount
    return { resolvedPrice: Number((standardPrice * wholesaleDiscountRate).toFixed(2)), source: 'TIER' };
  }

  // Priority 3: Standard POS Branch Price
  return { resolvedPrice: Number((standardPrice * tierMultiplier).toFixed(2)), source: 'STANDARD' };
}

// =============================================================================
// 4. RECURRING INVOICE TEMPLATES (الفواتير المتكررة)
// =============================================================================

export interface RecurringInvoiceTemplate {
  id: string;
  branchId: string;
  name: string;
  frequency: 'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'On-Demand';
  customerId: string;
  customerName: string;
  currency: string;
  transactionType: string;
  deliveredBy: string;
  salesman: string;
  useLivePrice: boolean; // true = resolve price waterfall on load; false = lock template price
  notes?: string;
  createdAt: string;
  items: Array<{
    id: string;
    code: string;
    name: string;
    unit: string;
    qty: number;
    unitPrice: number;
    total: number;
  }>;
}

export function getRecurringTemplates(): RecurringInvoiceTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECURRING_TEMPLATES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading recurring templates from localStorage:', e);
  }

  const defaults: RecurringInvoiceTemplate[] = [
    {
      id: 'REC-TPL-01',
      branchId: 'Southern Olive and Oil Products S.A.R.L.',
      name: 'Weekly Commercial Restock - Beirut Gourmet',
      frequency: 'Weekly',
      customerId: 'CUST-002',
      customerName: 'Beirut Gourmet Market',
      currency: 'USD',
      transactionType: 'Credit (On Account)',
      deliveredBy: 'Van #4 - Tripoli & Coast',
      salesman: 'Sami Nader',
      useLivePrice: true,
      notes: 'Standard weekly order of premium extra virgin olive oil bottles and tins',
      createdAt: new Date().toISOString(),
      items: [
        { id: '1', code: 'EVOO-16L', name: 'Extra Virgin Olive Oil 16L Tin', unit: 'TIN', qty: 4, unitPrice: 115.00, total: 460.00 },
        { id: '2', code: 'EVOO-1L-BOT', name: 'Extra Virgin Olive Oil 1L Glass Bottle', unit: 'BOT', qty: 24, unitPrice: 9.50, total: 228.00 },
        { id: '3', code: 'CWV250MLB103', name: 'White Vinegar 250ml', unit: 'BOT', qty: 12, unitPrice: 0.50, total: 6.00 }
      ]
    },
    {
      id: 'REC-TPL-02',
      branchId: 'Southern Olive and Oil Products S.A.R.L.',
      name: 'Monthly Hotel Kitchen Olive Oil Supply',
      frequency: 'Monthly',
      customerId: 'CUST-003',
      customerName: 'Phoenicia Hotels S.A.L',
      currency: 'USD',
      transactionType: 'Credit (On Account)',
      deliveredBy: 'Direct Plant Dispatch',
      salesman: 'Salim Daou',
      useLivePrice: true,
      notes: 'Industrial kitchen batch supply',
      createdAt: new Date().toISOString(),
      items: [
        { id: '1', code: 'EVOO-16L', name: 'Extra Virgin Olive Oil 16L Tin', unit: 'TIN', qty: 15, unitPrice: 110.00, total: 1650.00 },
        { id: '4', code: 'OO-SOAP-BAR', name: 'Natural Olive Oil Laurel Soap (Carton)', unit: 'CARTON', qty: 5, unitPrice: 18.00, total: 90.00 }
      ]
    }
  ];
  saveRecurringTemplates(defaults);
  return defaults;
}

export function saveRecurringTemplates(list: RecurringInvoiceTemplate[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RECURRING_TEMPLATES_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(RECURRING_TEMPLATES_UPDATED_EVENT, { detail: list }));
  } catch (e) {
    console.warn('Error saving recurring templates:', e);
  }
}

// ============================================================================
// 4. CREDIT NOTE & SALES RETURNS (إشعار دائن / مرتجع مبيعات)
// ============================================================================

export interface CreditNoteItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  qty: number;
  unitPrice: number;
  total: number;
  location?: string;
  costPrice?: number;
}

export interface CreditNoteRecord {
  id: string;
  invoiceNumber: string; // e.g. CRN-2026-0001
  parentInvoiceNo?: string;
  docType: 'CREDIT_NOTE';
  doc_type?: 'CREDIT_NOTE';
  date: string;
  customerId: string;
  customerName: string;
  customerAddress?: string;
  settlementMethod: 'CASH_REFUND' | 'ON_ACCOUNT';
  reason: string;
  notes?: string;
  branch?: string;
  currency: string;
  exchangeRate?: number;
  items: CreditNoteItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  status: 'Posted' | 'Draft';
  posted: boolean;
  is_posted: boolean;
  createdAt: string;
}

export const CREDIT_NOTES_KEY = 'vanguard_credit_notes_v1';
export const CREDIT_NOTES_UPDATED_EVENT = 'vanguard_credit_notes_updated';

export function getCreditNotes(): CreditNoteRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CREDIT_NOTES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading credit notes from localStorage:', e);
  }

  const defaults: CreditNoteRecord[] = [
    {
      id: '4002601',
      invoiceNumber: '4002601',
      parentInvoiceNo: '0002602',
      docType: 'CREDIT_NOTE',
      doc_type: 'CREDIT_NOTE',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      customerId: 'CUST-002',
      customerName: 'Beirut Gourmet Market',
      customerAddress: 'Hamra Main Street, Beirut',
      settlementMethod: 'ON_ACCOUNT',
      reason: 'Damaged Goods in Transit (Dent on tin)',
      notes: 'Customer reported dented tin upon truck arrival. Credited to account.',
      branch: 'Southern Olive and Oil Products S.A.R.L. - Facility [1300-01] Main',
      currency: 'USD',
      exchangeRate: 89500,
      items: [
        {
          id: 'item-crn-1',
          code: 'EVOO-16L',
          name: 'Extra Virgin Olive Oil 16L Tin',
          unit: 'TIN',
          qty: 1,
          unitPrice: 115.00,
          total: 115.00,
          location: 'Main Store',
          costPrice: 75.00
        }
      ],
      subtotal: 115.00,
      tax: 0,
      grandTotal: 115.00,
      status: 'Posted',
      posted: true,
      is_posted: true,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ];
  saveCreditNotes(defaults);
  return defaults;
}

export function saveCreditNotes(list: CreditNoteRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CREDIT_NOTES_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(CREDIT_NOTES_UPDATED_EVENT, { detail: list }));
  } catch (e) {
    console.warn('Error saving credit notes:', e);
  }
}

/**
 * Creates double-entry journal entry for Credit Note (Sales Return)
 * Reverse Revenue: Debit Sales Returns (4100/70200) + Debit VAT Output (2150/44200) | Credit Cash Drawer (53100) or AR (41100)
 * Perpetual Inventory: Debit Inventory (31100) | Credit COGS (60100)
 */
export async function createJournalEntryForCreditNote(
  crn: CreditNoteRecord,
  tenantId?: string
): Promise<string> {
  const jvId = `jv-crn-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const jvNumber = `JV-${crn.invoiceNumber}`;
  const jvDate = crn.date || new Date().toISOString().split('T')[0];
  const rate = crn.exchangeRate || 89500;

  // 1. Sales Return (Debit)
  const lines: any[] = [
    {
      id: `line-${Date.now()}-1`,
      line_number: 1,
      account_id: 'acc-70200',
      account_number: '70200',
      account_name: 'Sales Returns & Allowances / مردودات ومسموحات المبيعات',
      description: `Sales Return: ${crn.customerName} (${crn.invoiceNumber})`,
      amount_debit: crn.subtotal,
      amount_credit: 0,
      currency_rate: rate,
      amount_native: crn.currency === 'LBP' ? crn.subtotal * rate : crn.subtotal
    }
  ];

  // 2. VAT Output Reversal (Debit) if tax > 0
  if (crn.tax > 0) {
    lines.push({
      id: `line-${Date.now()}-2`,
      line_number: lines.length + 1,
      account_id: 'acc-44200',
      account_number: '44200',
      account_name: 'VAT Output / الضريبة على القيمة المضافة المحصلة (11%)',
      description: `VAT Reversal on Return (${crn.invoiceNumber})`,
      amount_debit: crn.tax,
      amount_credit: 0,
      currency_rate: rate,
      amount_native: crn.currency === 'LBP' ? crn.tax * rate : crn.tax
    });
  }

  // 3. Settlement Credit: Cash Drawer or Customer AR
  const isCash = crn.settlementMethod === 'CASH_REFUND';
  const creditAccountId = isCash ? 'acc-53100' : 'acc-41100';
  const creditAccountNo = isCash ? '53100' : '41100';
  const creditAccountName = isCash
    ? 'POS Cash Drawer - Branch Main / صندوق الكاشير الفرعي'
    : `Trade Customers / ذمم الزبائن (${crn.customerName})`;

  lines.push({
    id: `line-${Date.now()}-3`,
    line_number: lines.length + 1,
    account_id: creditAccountId,
    account_number: creditAccountNo,
    account_name: creditAccountName,
    description: isCash
      ? `Cash refund from register for CRN #${crn.invoiceNumber}`
      : `Credit balance reduction for ${crn.customerName} on CRN #${crn.invoiceNumber}`,
    amount_debit: 0,
    amount_credit: crn.grandTotal,
    currency_rate: rate,
    amount_native: crn.currency === 'LBP' ? crn.grandTotal * rate : crn.grandTotal
  });

  // 4. Perpetual Inventory Reversal (Debit Inventory, Credit COGS)
  const estimatedCogs = Number((crn.subtotal * 0.65).toFixed(2));
  if (estimatedCogs > 0) {
    lines.push({
      id: `line-${Date.now()}-4`,
      line_number: lines.length + 1,
      account_id: 'acc-31100',
      account_number: '31100',
      account_name: 'Finished Goods Inventory / مخزون البضائع الجاهزة',
      description: `Restock returned goods from CRN #${crn.invoiceNumber}`,
      amount_debit: estimatedCogs,
      amount_credit: 0,
      currency_rate: rate,
      amount_native: crn.currency === 'LBP' ? estimatedCogs * rate : estimatedCogs
    });
    lines.push({
      id: `line-${Date.now()}-5`,
      line_number: lines.length + 1,
      account_id: 'acc-60100',
      account_number: '60100',
      account_name: 'Cost of Goods Sold (COGS) / تكلفة المبيعات',
      description: `COGS Reversal on Return CRN #${crn.invoiceNumber}`,
      amount_debit: 0,
      amount_credit: estimatedCogs,
      currency_rate: rate,
      amount_native: crn.currency === 'LBP' ? estimatedCogs * rate : estimatedCogs
    });
  }

  const jvEntry = {
    id: jvId,
    entry_number: jvNumber,
    date: jvDate,
    reference: crn.invoiceNumber,
    description: `Credit Note / Return: ${crn.customerName} (${crn.reason || 'Customer Return'})`,
    branch_id: crn.branch || 'Southern Olive and Oil Products S.A.R.L. - Facility [1300-01] Main',
    status: 'POSTED',
    created_at: new Date().toISOString(),
    lines
  };

  try {
    const raw = localStorage.getItem('vanguard_journal_entries_v1');
    const entries = raw ? JSON.parse(raw) : [];
    entries.unshift(jvEntry);
    localStorage.setItem('vanguard_journal_entries_v1', JSON.stringify(entries));
    window.dispatchEvent(new CustomEvent('journal_entries_updated', { detail: entries }));
  } catch (e) {
    console.warn('Error saving credit note journal entry to localStorage:', e);
  }

  // Supabase dual-persistence
  try {
    const targetTenantId = (tenantId && tenantId !== '1300' && !tenantId.startsWith('comp-'))
      ? tenantId
      : '00000000-0000-0000-0000-000000000001';
    await supabase.from('journal_entries').insert([{
      tenant_id: targetTenantId,
      entry_number: jvNumber,
      date: jvDate,
      reference: crn.invoiceNumber,
      description: jvEntry.description,
      status: 'POSTED',
      created_at: new Date().toISOString()
    }]);
  } catch (err) {
    console.warn('Notice writing journal entry to Supabase:', err);
  }

  return jvNumber;
}

/**
 * Posts a Credit Note:
 * 1. Saves to credit notes store and syncs to invoices directory with docType: 'CREDIT_NOTE'
 * 2. Restocks inventory (+qty / IN_RETURN)
 * 3. Records cash payout if CASH_REFUND (deducting from shift drawer balance)
 * 4. Deducts open debt / applies to parent invoice if ON_ACCOUNT
 * 5. Generates double-entry reverse GL entry
 */
export async function postCreditNote(
  crn: CreditNoteRecord,
  tenantId?: string
): Promise<{ success: boolean; jvNumber: string }> {
  // Advance document sequence
  commitNextDocNumber('CREDIT_NOTE', crn.invoiceNumber, tenantId);

  // 1. Save to credit notes store
  const existingCrns = getCreditNotes();
  const updatedCrns = [crn, ...existingCrns.filter(c => c.id !== crn.id && c.invoiceNumber !== crn.invoiceNumber)];
  saveCreditNotes(updatedCrns);

  // 2. Register in vanguard_sales_invoices_directory
  try {
    const rawInvs = localStorage.getItem('vanguard_sales_invoices_directory');
    const invs = rawInvs ? JSON.parse(rawInvs) : [];
    const invRecord = {
      ...crn,
      docType: 'CREDIT_NOTE',
      doc_type: 'CREDIT_NOTE',
      parent_invoice_id: crn.parentInvoiceNo,
      parentInvoiceNo: crn.parentInvoiceNo,
      transactionType: 'Credit Note',
      status: 'Posted',
      posted: true,
      is_posted: true
    };
    const newInvs = [invRecord, ...invs.filter((i: any) => i.id !== crn.id && i.invoiceNumber !== crn.invoiceNumber)];
    localStorage.setItem('vanguard_sales_invoices_directory', JSON.stringify(newInvs));
    window.dispatchEvent(new CustomEvent('vanguard_invoices_directory_updated', { detail: newInvs }));
  } catch (e) {
    console.warn('Error syncing CRN with invoices directory:', e);
  }

  // 3. Inventory Return (+qty / IN_RETURN)
  try {
    const targetTenantId = (tenantId && tenantId !== '1300' && !tenantId.startsWith('comp-'))
      ? tenantId
      : '00000000-0000-0000-0000-000000000001';

    const stockTxns = crn.items.map((it) => ({
      tenant_id: targetTenantId,
      item_id: (it as any).sku || it.code || it.id,
      transaction_type: 'IN_RETURN',
      quantity: Math.abs(it.qty),
      reference_number: crn.invoiceNumber,
      branch_id: crn.branch || 'BRANCH-01',
      location: it.location || 'Main Store',
      created_at: new Date().toISOString()
    }));
    await supabase.from('stock_transactions').insert(stockTxns);
  } catch (err) {
    console.warn('Notice inserting stock return transactions:', err);
  }

  // 4. Drawer Balance & Cash Movement if CASH_REFUND
  if (crn.settlementMethod === 'CASH_REFUND') {
    try {
      const activeShift = getActiveShift();
      recordCashMovement({
        shiftId: activeShift.id,
        type: 'PAID_OUT',
        movementType: 'PAID_OUT',
        amount: crn.grandTotal,
        category: 'Sales Return / Refund',
        amountUsd: crn.grandTotal,
        amountLbp: crn.grandTotal * POS_EXCHANGE_RATE_LBP,
        currencyCode: (crn.currency as 'USD' | 'LBP' | 'EUR' | 'GBP') || 'USD',
        exchangeRate: crn.exchangeRate || POS_EXCHANGE_RATE_LBP,
        targetAccountId: 'acc-70200',
        targetAccountName: 'Sales Returns & Allowances / مردودات ومسموحات المبيعات',
        notes: `Cash refund for Credit Note #${crn.invoiceNumber} (${crn.customerName})`
      }, tenantId);
    } catch (e) {
      console.warn('Error recording cash movement for credit note refund:', e);
    }
  }

  // 5. Customer Balance deduction if ON_ACCOUNT
  if (crn.settlementMethod === 'ON_ACCOUNT' && crn.parentInvoiceNo) {
    try {
      const rawInvs = localStorage.getItem('vanguard_sales_invoices_directory');
      if (rawInvs) {
        const invs = JSON.parse(rawInvs);
        const updated = invs.map((inv: any) => {
          if (inv.invoiceNumber === crn.parentInvoiceNo || inv.id === crn.parentInvoiceNo) {
            const currentDue = inv.balanceDue !== undefined ? inv.balanceDue : (inv.grandTotal || inv.total || 0);
            return {
              ...inv,
              balanceDue: Math.max(0, currentDue - crn.grandTotal)
            };
          }
          return inv;
        });
        localStorage.setItem('vanguard_sales_invoices_directory', JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('Error updating parent invoice balance:', e);
    }
  }

  // 6. Automatic reverse GL journal entry
  const jvNumber = await createJournalEntryForCreditNote(crn, tenantId);

  return { success: true, jvNumber };
}

