/**
 * Vanguard ERP - POS Shift Management & Main Reading (X-Report / Z-Report) Service
 * Southern Olive and Oil Products S.A.R.L. (منتوجات زيت وزيتون الجنوب ش.م.م)
 *
 * Persisted in:
 * - Supabase tenants.feature_flags.pos_shifts & pos_cash_movements
 * - LocalStorage fallback keys:
 *     - 'vanguard_pos_active_shift_v1'
 *     - 'vanguard_pos_shift_history_v1'
 *     - 'vanguard_pos_cash_movements_v1'
 */

import { supabase } from '@/lib/supabaseClient';
import { peekNextDocNumber, commitNextDocNumber, cleanDocumentNumber } from '@/lib/utils/documentSequence';
import { calculateMainReadingSummary } from '@/lib/engine/erpCalculationEngine';

export { calculateMainReadingSummary };

export const POS_EXCHANGE_RATE_LBP = 89500;

export const ACTIVE_SHIFT_KEY = 'vanguard_pos_active_shift_v1';
export const SHIFT_HISTORY_KEY = 'vanguard_pos_shift_history_v1';
export const CASH_MOVEMENTS_KEY = 'vanguard_pos_cash_movements_v1';
export const SHIFT_UPDATED_EVENT = 'vanguard_pos_shift_updated';
export const CASH_MOVEMENTS_UPDATED_EVENT = 'vanguard_pos_cash_movements_updated';

export type CashMovementType = 'PAID_IN' | 'PAID_OUT';

export interface ReasonCategoryConfig {
  code: 'OPENING_FLOAT' | 'PETTY_EXPENSE' | 'DELIVERY_EXPENSE' | 'CASH_DROP' | 'OTHER';
  labelEn: string;
  labelAr: string;
  defaultType: CashMovementType;
  targetAccountId: string;
  targetAccountNumber: string;
  targetAccountName: string;
  targetAccountNameAr: string;
}

export const REASON_CATEGORIES: ReasonCategoryConfig[] = [
  {
    code: 'OPENING_FLOAT',
    labelEn: 'Opening Float (إيداع فراطة أول النهار)',
    labelAr: 'إيداع فراطة أول النهار - الخزينة الرئيسية',
    defaultType: 'PAID_IN',
    targetAccountId: 'acc-53000',
    targetAccountNumber: '53000',
    targetAccountName: 'Main Safe / الصندوق الرئيسي',
    targetAccountNameAr: 'الصندوق - الخزينة الرئيسية'
  },
  {
    code: 'PETTY_EXPENSE',
    labelEn: 'General & Petty Cash Expenses (ضيافة ومصاريف نثرية)',
    labelAr: 'ضيافة ومصاريف نثرية وإدارية',
    defaultType: 'PAID_OUT',
    targetAccountId: 'acc-61500',
    targetAccountNumber: '61500',
    targetAccountName: 'General & Petty Cash Expenses / مصاريف نثرية',
    targetAccountNameAr: 'مصاريف نثرية وضيافة المحل'
  },
  {
    code: 'DELIVERY_EXPENSE',
    labelEn: 'Delivery & Dispatch Expense (مصاريف توصيل وشحن)',
    labelAr: 'مصاريف توصيل وسائقين ومحروقات',
    defaultType: 'PAID_OUT',
    targetAccountId: 'acc-61300',
    targetAccountNumber: '61300',
    targetAccountName: 'Delivery & Dispatch Expense / مصاريف توصيل وشحن',
    targetAccountNameAr: 'مصاريف نقل وشحن وتوصيل الطلبات'
  },
  {
    code: 'CASH_DROP',
    labelEn: 'Main Safe Transfer / Cash Drop (تحويل للصندوق الرئيسي)',
    labelAr: 'تحويل وسحب نقدية للخزينة الرئيسية',
    defaultType: 'PAID_OUT',
    targetAccountId: 'acc-53000',
    targetAccountNumber: '53000',
    targetAccountName: 'Main Safe Transfer / تحويل للصندوق الرئيسي',
    targetAccountNameAr: 'الصندوق - الخزينة الرئيسية'
  },
  {
    code: 'OTHER',
    labelEn: 'Miscellaneous Cash Movement (متفرقات الصندوق)',
    labelAr: 'حساب متفرقات الصندوق',
    defaultType: 'PAID_OUT',
    targetAccountId: 'acc-61800',
    targetAccountNumber: '61800',
    targetAccountName: 'Miscellaneous Cash Account / متفرقات الصندوق',
    targetAccountNameAr: 'حساب متفرقات وتسويات الصندوق'
  }
];

export interface PosShift {
  id: string; // e.g. 'SH-20261014-44'
  shiftNumber: number; // e.g. 44
  branch: string;
  workstation: string;
  cashierName: string;
  openedAt: string;
  closedAt: string | null;
  openingCashUsd: number;
  openingCashLbp: number;
  closingCashUsd?: number;
  closingCashLbp?: number;
  actualCountedUsd?: number;
  actualCountedLbp?: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
  summary?: MainReadingSummary;
}

export interface CashMovement {
  id: string;
  movementNo: string; // e.g. 'PI-00101' for Paid In, 'PO-00101' for Paid Out
  branchId: string;
  shiftId: string;
  userId?: string;
  cashierName: string;
  movementType: 'PAID_IN' | 'PAID_OUT';
  type?: 'PAID_IN' | 'PAID_OUT' | 'in' | 'out'; // for backward compatibility
  currencyCode: 'USD' | 'LBP' | 'EUR' | 'GBP';
  amount: number;
  amountUsd: number;
  amountLbp: number;
  exchangeRate: number;
  reasonCategory: 'OPENING_FLOAT' | 'PETTY_EXPENSE' | 'DELIVERY_EXPENSE' | 'CASH_DROP' | 'OTHER' | string;
  category?: string; // for backward compatibility
  targetAccountId: string;
  targetAccountNumber?: string;
  targetAccountName: string;
  notes: string;
  journalEntryId?: string;
  createdAt: string;
  timestamp?: string; // for backward compatibility
  isVoided?: boolean;
  voidReason?: string;
  voidedAt?: string;
  date?: string;
  status?: string;
  closedInZReport?: boolean;
  shiftClosed?: boolean;
  isReconciledOrClosed?: boolean;
  closedShiftId?: string;
  createdAtIso?: string;
}

export interface TenderCollection {
  method: string;
  label: string;
  usd: number;
  lbp: number;
  count: number;
}

export interface DivisionBreakdown {
  division: string;
  amountUsd: number;
  itemCount: number;
  percentage: number;
}

export interface MainReadingSummary {
  readingType: 'X' | 'Z';
  generatedAt: string;
  shiftId: string;
  shiftNumber: number;
  branch: string;
  workstation: string;
  cashierName: string;
  openedAt: string;
  closedAt: string | null;

  // 1. Gross & Net Sales
  grossSalesUsd: number;
  discountsUsd: number;
  taxUsd: number;
  netSalesUsd: number;
  invoiceCount: number;

  // Invoice Range Summary
  firstInvoiceNo: string;
  lastInvoiceNo: string;
  invoiceRangeText: string;

  // Sales by Transaction Type
  salesByTransactionType: {
    localUsd: number;
    internationalUsd: number;
    onlineUsd: number;
  };

  // Settlement Mode Breakdown
  settlementMode: {
    cashSalesUsd: number;
    creditSalesUsd: number;
    cardSalesUsd: number;
  };

  workingDate?: string;

  // 2. Returns / Credit Notes
  returnsCreditNotesUsd: number;
  creditNoteCount: number;
  finalTurnoverUsd: number; // netSalesUsd - returnsCreditNotesUsd

  // 3. Collections by Payment Method (تفصيل المقبوضات)
  collectionsByTender: TenderCollection[];

  // 4. Customer Receipts (سندات القبض)
  customerReceiptsTotalUsd: number;
  customerReceiptsTotalLbp: number;
  customerReceiptsCount: number;
  customerReceiptsList: Array<{
    id: string;
    customerName: string;
    method: string;
    amountUsd: number;
    date: string;
  }>;

  // 5. Paid In / Paid Out Summary
  paidInTotalUsd: number;
  paidInTotalLbp: number;
  paidOutTotalUsd: number;
  paidOutTotalLbp: number;
  paidInOutList: CashMovement[];

  // 6. Expected Drawer Balance Formula (الرصيد المتوقع بالصندوق)
  openingFloatUsd: number;
  openingFloatLbp: number;
  cashSalesUsd: number;
  cashSalesLbp: number;
  cashCustomerReceiptsUsd: number;
  cashCustomerReceiptsLbp: number;
  cashRefundsUsd: number;
  cashRefundsLbp: number;
  expectedCashUsd: number;
  expectedCashLbp: number;

  // 7. Cash Reconciliation (Overage / Shortage)
  actualCountedUsd: number;
  actualCountedLbp: number;
  varianceUsd: number;
  varianceLbp: number;
  reconciliationStatus: 'PENDING' | 'BALANCED' | 'SHORTAGE' | 'OVERAGE';

  // 8. Category / Division Breakdown
  divisionBreakdown: DivisionBreakdown[];
}

function resolveTenantId(tenantId?: string): string {
  if (tenantId && tenantId !== '1300' && !tenantId.startsWith('comp-')) {
    return tenantId;
  }
  return '00000000-0000-0000-0000-000000000001';
}

export function getDefaultShift(): PosShift {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  return {
    id: `SH-${dateStr}-44`,
    shiftNumber: 44,
    branch: 'Southern Olive and Oil Products S.A.R.L.',
    workstation: 'POS-01 (Main Counter)',
    cashierName: 'Active Cashier',
    openedAt: new Date(today.setHours(8, 0, 0, 0)).toISOString(),
    closedAt: null,
    openingCashUsd: 0.0,
    openingCashLbp: 0,
    status: 'OPEN',
    notes: 'Morning commercial operations shift'
  };
}

/**
 * Retrieves the currently active shift from localStorage or initial fallback
 */
export function getActiveShift(): PosShift {
  if (typeof window === 'undefined') return getDefaultShift();
  try {
    const raw = localStorage.getItem(ACTIVE_SHIFT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.status === 'OPEN') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading active shift from localStorage:', e);
  }
  const fallback = getDefaultShift();
  return fallback;
}

/**
 * Persists active shift to localStorage, custom event, and Supabase feature_flags
 */
export async function saveActiveShift(shift: PosShift, tenantId?: string): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ACTIVE_SHIFT_KEY, JSON.stringify(shift));
      window.dispatchEvent(new CustomEvent(SHIFT_UPDATED_EVENT, { detail: shift }));
    } catch (e) {
      console.warn('Error saving active shift to localStorage:', e);
    }
  }

  // Dual persist to Supabase feature_flags.pos_shifts
  try {
    const targetTenantId = resolveTenantId(tenantId);
    const { data: tenantData } = await supabase
      .from('tenants')
      .select('feature_flags')
      .eq('id', targetTenantId)
      .maybeSingle();

    const currentFlags = (tenantData?.feature_flags as Record<string, any>) || {};
    await supabase
      .from('tenants')
      .update({
        feature_flags: {
          ...currentFlags,
          active_pos_shift: shift
        }
      })
      .eq('id', targetTenantId);
  } catch (err) {
    // Non-blocking fallback
  }
}

/**
 * Generates next sequential movement voucher number in unified 7-digit format (6002601, 6002602...)
 */
export function generateNextMovementNumber(movementType?: 'PAID_IN' | 'PAID_OUT'): string {
  const movements = getCashMovements();
  return peekNextDocNumber('CASH_VOUCHER', movements);
}

/**
 * Automatically creates and persists double-entry journal entry for POS Cash Movement
 */
export async function createJournalEntryForCashMovement(
  movement: CashMovement,
  tenantId?: string
): Promise<string> {
  const isPaidOut = movement.movementType === 'PAID_OUT';
  const jvId = `jv-pos-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const jvNumber = `JV-${movement.movementNo}`;
  const jvDate = movement.createdAt ? movement.createdAt.split('T')[0] : new Date().toISOString().split('T')[0];
  const posCashAccountId = 'acc-53100';
  const posCashAccountNo = '53100';
  const posCashAccountName = 'POS Cash Drawer - Branch Main / صندوق الكاشير الفرعي';

  const amountUsd = movement.amountUsd;
  const amountNative = movement.amount;

  const lines: any[] = isPaidOut
    ? [
        // PAID_OUT: Debit Selected Counter Account (e.g. Petty Cash), Credit POS Cash Drawer
        {
          id: `line-${Date.now()}-1`,
          line_number: 1,
          account_id: movement.targetAccountId || 'acc-61500',
          account_number: movement.targetAccountNumber || '61500',
          account_name: movement.targetAccountName || 'General & Petty Cash Expenses',
          description: movement.notes || 'Petty cash disbursement',
          amount_debit: amountUsd,
          amount_credit: 0,
          currency_rate: movement.exchangeRate,
          amount_native: amountNative
        },
        {
          id: `line-${Date.now()}-2`,
          line_number: 2,
          account_id: posCashAccountId,
          account_number: posCashAccountNo,
          account_name: posCashAccountName,
          description: `Disbursement from POS drawer (${movement.movementNo})`,
          amount_debit: 0,
          amount_credit: amountUsd,
          currency_rate: movement.exchangeRate,
          amount_native: amountNative
        }
      ]
    : [
        // PAID_IN: Debit POS Cash Drawer, Credit Main Safe / Counter Account
        {
          id: `line-${Date.now()}-1`,
          line_number: 1,
          account_id: posCashAccountId,
          account_number: posCashAccountNo,
          account_name: posCashAccountName,
          description: `Receipt into POS drawer (${movement.movementNo})`,
          amount_debit: amountUsd,
          amount_credit: 0,
          currency_rate: movement.exchangeRate,
          amount_native: amountNative
        },
        {
          id: `line-${Date.now()}-2`,
          line_number: 2,
          account_id: movement.targetAccountId || 'acc-53000',
          account_number: movement.targetAccountNumber || '53000',
          account_name: movement.targetAccountName || 'Main Safe / الصندوق الرئيسي',
          description: movement.notes || 'Cash drawer deposit',
          amount_debit: 0,
          amount_credit: amountUsd,
          currency_rate: movement.exchangeRate,
          amount_native: amountNative
        }
      ];

  const jv = {
    id: jvId,
    tenant_id: resolveTenantId(tenantId),
    jv_number: jvNumber,
    date_of_jv: jvDate,
    jv_type: isPaidOut ? 'PV' : 'RV',
    currency_id: movement.currencyCode === 'LBP' ? 'LBP' : 'USD',
    doc_ref_number: movement.movementNo,
    description: `[POS Cash Movement] ${isPaidOut ? 'Paid Out (صرف نقدي)' : 'Paid In (قبض نقدي)'} - ${movement.notes} (${movement.movementNo})`,
    payee_or_recipient: movement.cashierName,
    created_by: movement.cashierName,
    total_debit: amountUsd,
    total_credit: amountUsd,
    is_posted: true,
    status: 'POSTED',
    created_at: movement.createdAt,
    lines
  };

  // 1. Sync to local storage vanguard_accounting_jvs_data
  if (typeof window !== 'undefined') {
    try {
      const STORAGE_JVS_KEY = 'vanguard_accounting_jvs_data';
      const existingRaw = localStorage.getItem(STORAGE_JVS_KEY);
      const jvs = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem(STORAGE_JVS_KEY, JSON.stringify([jv, ...jvs]));
      window.dispatchEvent(new CustomEvent('vanguard_accounting_sync', {
        detail: { type: 'VOUCHER_SAVED', data: jv }
      }));
    } catch (e) {
      console.warn('Error saving JV to localStorage:', e);
    }
  }

  // 2. Dual persist to backend API if reachable
  try {
    fetch('/api/accounting/vouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voucher: jv,
        lines,
        postImmediately: true,
        user: movement.cashierName
      })
    }).catch(() => {});
  } catch {}

  return jvId;
}

/**
 * Returns all recorded cash movements (Paid In / Paid Out), normalized
 */
export function getCashMovements(): CashMovement[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CASH_MOVEMENTS_KEY);
    if (raw) {
      const parsed: any[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out legacy demo seed rows from localStorage
        const DEMO_SEEDS = ['6002601', '6002602', '6002603'];
        const cleanList = parsed.filter((item: any) =>
          !DEMO_SEEDS.includes(String(item.id || '')) &&
          !DEMO_SEEDS.includes(String(item.movementNo || '')) &&
          item.notes !== 'Initial morning drawer float' &&
          item.notes !== 'Van #4 fuel receipt - Coral Station' &&
          item.notes !== 'Cardboard tape & packing markers for factory store'
        );
        return cleanList.map((item, idx) => {
          const mType: 'PAID_IN' | 'PAID_OUT' =
            item.movementType ||
            (item.type === 'in' || item.type === 'PAID_IN' || String(item.type || '').toUpperCase().includes('IN')
              ? 'PAID_IN'
              : 'PAID_OUT');
          const isUsd = (item.paymentType && item.paymentType.includes('USD')) || item.currencyCode === 'USD';
          const amtUsd = Number(item.amountUsd ?? (isUsd ? item.amount : 0) ?? 0);
          const amtLbp = Number(item.amountLbp ?? (!isUsd ? item.amount : 0) ?? 0);
          const code =
            item.movementNo ||
            `6${(2601 + idx).toString().padStart(6, '0')}`;
          const cat = item.reasonCategory || (mType === 'PAID_IN' ? 'OPENING_FLOAT' : 'PETTY_EXPENSE');
          const catConfig = REASON_CATEGORIES.find((c) => c.code === cat);

          return {
            id: item.id || `PIO-${Date.now()}-${idx}`,
            movementNo: code,
            branchId: item.branchId || 'Southern Olive and Oil Products S.A.R.L.',
            shiftId: item.shiftId || '',
            userId: item.userId,
            byUser: item.byUser || item.cashierName,
            paidToUser: item.paidToUser,
            paymentType: item.paymentType || (isUsd ? 'CASH USD' : 'CASH'),
            description: item.description || item.category || item.notes,
            cashierName: item.cashierName || 'Active Cashier',
            movementType: mType,
            type: mType,
            currencyCode: item.currencyCode || (isUsd ? 'USD' : 'LBP'),
            amount: Number(item.amount || (isUsd ? amtUsd : amtLbp)),
            amountUsd: amtUsd,
            amountLbp: amtLbp,
            exchangeRate: Number(item.exchangeRate || POS_EXCHANGE_RATE_LBP),
            reasonCategory: cat,
            category: item.category || catConfig?.labelEn || cat,
            targetAccountId: item.targetAccountId || catConfig?.targetAccountId || 'acc-53000',
            targetAccountNumber: item.targetAccountNumber || catConfig?.targetAccountNumber || '53000',
            targetAccountName: item.targetAccountName || catConfig?.targetAccountName || 'Main Safe',
            notes: item.notes || (mType === 'PAID_IN' ? 'Cash Deposit' : 'Cash Disbursement'),
            journalEntryId: item.journalEntryId,
            createdAt: item.createdAt || new Date().toISOString(),
            createdAtIso: item.createdAtIso || item.createdAt || new Date().toISOString(),
            isReconciledOrClosed: Boolean(item.isReconciledOrClosed || item.closedInZReport || item.shiftClosed),
            closedShiftId: item.closedShiftId,
            closedInZReport: Boolean(item.closedInZReport || item.isReconciledOrClosed),
            shiftClosed: Boolean(item.shiftClosed || item.isReconciledOrClosed),
            timestamp: item.timestamp || item.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isVoided: Boolean(item.isVoided),
            voidReason: item.voidReason,
            voidedAt: item.voidedAt
          };
        });
      }
    }
  } catch (e) {
    console.warn('Error reading cash movements from localStorage:', e);
  }

  return [];
}

export function saveCashMovements(movements: CashMovement[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CASH_MOVEMENTS_KEY, JSON.stringify(movements));
    window.dispatchEvent(new CustomEvent(CASH_MOVEMENTS_UPDATED_EVENT, { detail: movements }));
  } catch (e) {
    console.warn('Error saving cash movements:', e);
  }
}

/**
 * Appends and persists a cash movement (Paid In / Paid Out) with GL Journal Entry
 */
export async function recordCashMovement(
  movement: Partial<CashMovement> & {
    amount: number;
    notes: string;
    movementType?: 'PAID_IN' | 'PAID_OUT';
  },
  tenantId?: string
): Promise<CashMovement> {
  const current = getCashMovements();
  const mType: 'PAID_IN' | 'PAID_OUT' =
    movement.movementType ||
    (movement.type === 'in' || movement.type === 'PAID_IN' ? 'PAID_IN' : 'PAID_OUT');

  const currCode = movement.currencyCode || 'USD';
  const exRate = movement.exchangeRate || POS_EXCHANGE_RATE_LBP;
  const rawAmt = Number(movement.amount || 0);

  let amtUsd = 0;
  let amtLbp = 0;
  if (currCode === 'LBP') {
    amtLbp = rawAmt;
    amtUsd = Number((rawAmt / exRate).toFixed(2));
  } else {
    amtUsd = rawAmt;
    amtLbp = Math.round(rawAmt * exRate);
  }

  const movNo = movement.movementNo || generateNextMovementNumber(mType);
  commitNextDocNumber('CASH_VOUCHER', movNo, tenantId);
  const nowIso = new Date().toISOString();
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Map category & target account
  const catCode = movement.reasonCategory || (mType === 'PAID_IN' ? 'OPENING_FLOAT' : 'PETTY_EXPENSE');
  const catConfig = REASON_CATEGORIES.find((c) => c.code === catCode);

  const targetAccId = movement.targetAccountId || catConfig?.targetAccountId || 'acc-53000';
  const targetAccNo = movement.targetAccountNumber || catConfig?.targetAccountNumber || '53000';
  const targetAccName = movement.targetAccountName || catConfig?.targetAccountName || 'Main Safe';

  const newRecord: CashMovement = {
    id: movement.id || `PIO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    movementNo: movNo,
    branchId: movement.branchId || 'Southern Olive and Oil Products S.A.R.L.',
    shiftId: movement.shiftId || getActiveShift().id,
    userId: movement.userId,
    cashierName: movement.cashierName || 'Active Cashier',
    movementType: mType,
    type: mType,
    currencyCode: currCode,
    amount: rawAmt,
    amountUsd: amtUsd,
    amountLbp: amtLbp,
    exchangeRate: exRate,
    reasonCategory: catCode,
    category: movement.category || catConfig?.labelEn || catCode,
    targetAccountId: targetAccId,
    targetAccountNumber: targetAccNo,
    targetAccountName: targetAccName,
    notes: movement.notes.trim(),
    createdAt: nowIso,
    createdAtIso: nowIso,
    timestamp: timeStr,
    isVoided: false,
    isReconciledOrClosed: false,
    closedInZReport: false,
    shiftClosed: false
  };

  // Generate double-entry journal entry
  try {
    const jvId = await createJournalEntryForCashMovement(newRecord, tenantId);
    newRecord.journalEntryId = jvId;
  } catch (e) {
    console.warn('Failed to auto-generate GL journal voucher:', e);
  }

  const updated = [newRecord, ...current];
  saveCashMovements(updated);

  // Sync to Supabase
  try {
    const targetTenantId = resolveTenantId(tenantId);
    supabase.from('tenants').select('feature_flags').eq('id', targetTenantId).maybeSingle().then(({ data }) => {
      const flags = (data?.feature_flags as Record<string, any>) || {};
      supabase.from('tenants').update({
        feature_flags: {
          ...flags,
          recent_cash_movements: updated.slice(0, 50)
        }
      }).eq('id', targetTenantId);
    });
  } catch {}

  return newRecord;
}

/**
 * Voids an existing cash movement and updates its linked GL Journal Entry
 */
export async function voidCashMovement(
  id: string,
  voidReason: string = 'Voided by user',
  tenantId?: string
): Promise<boolean> {
  const current = getCashMovements();
  const target = current.find((m) => m.id === id || m.movementNo === id);
  if (!target) return false;

  target.isVoided = true;
  target.voidReason = voidReason;
  target.voidedAt = new Date().toISOString();

  // If there was a journal voucher, update it to Void
  if (target.journalEntryId && typeof window !== 'undefined') {
    try {
      const STORAGE_JVS_KEY = 'vanguard_accounting_jvs_data';
      const existingRaw = localStorage.getItem(STORAGE_JVS_KEY);
      if (existingRaw) {
        const jvs = JSON.parse(existingRaw);
        const jvIdx = jvs.findIndex((j: any) => j.id === target.journalEntryId || j.jv_number === `JV-${target.movementNo}`);
        if (jvIdx >= 0) {
          jvs[jvIdx].status = 'Void';
          localStorage.setItem(STORAGE_JVS_KEY, JSON.stringify(jvs));
          window.dispatchEvent(new CustomEvent('vanguard_accounting_sync', {
            detail: { type: 'VOUCHER_SAVED', data: jvs[jvIdx] }
          }));
        }
      }
    } catch {}
  }

  saveCashMovements([...current]);
  return true;
}

/**
 * Returns shift history
 */
export function getShiftHistory(): PosShift[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SHIFT_HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading shift history:', e);
  }
  return [];
}

/**
 * Robust date parser and normalizer converting any date format
 * ('2026-10-15', '15 Oct, 2026', '10/15/2026', '05-Sep-2026', ISO strings)
 * into YYYY-MM-DD in local time.
 */
export function normalizeDateToYMD(dateVal: any): string | null {
  if (!dateVal) return null;
  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();
    // Fast match for YYYY-MM-DD
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (ymdMatch) {
      const y = ymdMatch[1];
      const m = ymdMatch[2].padStart(2, '0');
      const d = ymdMatch[3].padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    // Match DD-MMM-YYYY or DD MMM, YYYY or standard Date formats
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  } else if (typeof dateVal === 'number') {
    const parsed = new Date(dateVal);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  } else if (dateVal instanceof Date) {
    if (!isNaN(dateVal.getTime())) {
      const y = dateVal.getFullYear();
      const m = String(dateVal.getMonth() + 1).padStart(2, '0');
      const d = String(dateVal.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  return null;
}

/**
 * Compares two date values by normalizing them both to YYYY-MM-DD in local time.
 */
export function isSameWorkingDay(recordDateOrTimestamp: any, activeWorkingDate: any): boolean {
  if (!recordDateOrTimestamp || !activeWorkingDate) return false;
  const recYMD = normalizeDateToYMD(recordDateOrTimestamp);
  const targetYMD = normalizeDateToYMD(activeWorkingDate);
  if (!recYMD || !targetYMD) return false;
  return recYMD === targetYMD;
}

/**
 * Checks if a given date string or ISO timestamp matches the target working date.
 */
export function isDateMatching(dateValue: any, targetDate: string): boolean {
  return isSameWorkingDay(dateValue, targetDate);
}

/**
 * Evaluates whether an item (cash movement, invoice, receipt, credit note) belongs
 * to the currently active shift session boundaries.
 */
export function isRecordInActiveShiftSession(
  record: any,
  activeShift?: PosShift | { id?: string; shiftNumber?: number; openedAt?: string; closedAt?: string | null },
  activeWorkingDate?: string
): boolean {
  if (!record) return false;
  if (record.isVoided === true) return false;
  if (record.isReconciledOrClosed === true || record.closedInZReport === true || record.shiftClosed === true) return false;

  const statusStr = String(record.status || '').toUpperCase();
  if (statusStr === 'VOID' || statusStr === 'ARCHIVED' || statusStr === 'DRAFT' || statusStr === 'HOLD' || statusStr === 'UNPOSTED') {
    return false;
  }

  const shift = activeShift || getActiveShift();
  if (!shift) return true;

  // 1. If record was sealed by a closed shift, exclude it
  if (record.closedShiftId && record.closedShiftId === shift.id) {
    return false;
  }

  // 2. Strict Shift ID check: if record has a shiftId that does not match this active shift, exclude it
  if (record.shiftId && shift.id) {
    if (String(record.shiftId).trim().toLowerCase() !== String(shift.id).trim().toLowerCase()) {
      return false;
    }
  }

  // 3. Strict Shift Number check
  if (record.shiftNumber !== undefined && shift.shiftNumber !== undefined) {
    if (Number(record.shiftNumber) !== Number(shift.shiftNumber)) {
      return false;
    }
  }

  // 4. Session OpenedAt boundary: any record created before the active shift opened is strictly excluded
  if (shift.openedAt) {
    const rawTime = record.createdAtIso || record.createdAt || record.timestamp || record.date;
    if (rawTime) {
      const recTime = new Date(rawTime).getTime();
      const shiftOpenTime = new Date(shift.openedAt).getTime();
      // Allow 2000ms grace period for clock skew during shift initialization
      if (!isNaN(recTime) && !isNaN(shiftOpenTime) && recTime < (shiftOpenTime - 2000)) {
        return false;
      }
    }
  }

  // 5. Calendar date matching (if activeWorkingDate is specified)
  if (activeWorkingDate) {
    const rawTime = record.createdAtIso || record.createdAt || record.timestamp || record.date;
    if (rawTime && !isSameWorkingDay(rawTime, activeWorkingDate)) {
      return false;
    }
  }

  return true;
}

/**
 * Evaluates whether an invoice qualifies for the current shift/working-date Main Reading
 */
export function isInvoicePostedToday(inv: any, activeWorkingDate: string, activeShift?: any): boolean {
  if (!inv) return false;
  const statusStr = String(inv.status || '').toUpperCase();
  const isPosted =
    statusStr === 'POSTED' ||
    inv.is_posted === true ||
    inv.posted === true ||
    (statusStr !== 'DRAFT' && statusStr !== 'HOLD' && statusStr !== 'UNPOSTED' && statusStr !== 'VOID' && inv.grandTotal !== undefined);
  if (!isPosted) return false;

  return isRecordInActiveShiftSession(inv, activeShift, activeWorkingDate);
}

/**
 * Evaluates whether a customer receipt qualifies for the current shift/working-date Main Reading
 */
export function isReceiptPostedToday(rct: any, activeWorkingDate: string, activeShift?: any): boolean {
  if (!rct || rct.isVoided === true) return false;
  return isRecordInActiveShiftSession(rct, activeShift, activeWorkingDate);
}

/**
 * Evaluates whether a cash movement qualifies for the current shift/working-date Main Reading
 */
export function isCashMovementToday(m: any, activeWorkingDate: string, activeShift?: any): boolean {
  if (!m || m.isVoided === true) return false;
  return isRecordInActiveShiftSession(m, activeShift, activeWorkingDate);
}

/**
 * Formats a cash movement cleanly for display in the itemized log table
 */
export function formatMovementDisplay(m: any) {
  let by = m.byUser || m.cashierName || 'Cashier';
  let paidTo = m.paidToUser || '—';
  let pType = m.paymentType || (m.currencyCode === 'USD' ? 'CASH USD' : 'CASH');
  let desc = m.description || m.category || m.notes || '—';

  // Extract bracketed metadata if embedded in legacy note string
  if (desc && desc.includes('[By:')) {
    const match = desc.match(/^(.*?)\s*\[By:\s*([^,\]]+)?(?:,\s*Paid To:\s*([^,\]]+))?(?:,\s*Type:\s*([^\]]+))?\]/);
    if (match) {
      desc = match[1].trim() || m.category || '—';
      if (!m.byUser && match[2]) by = match[2].trim();
      if (!m.paidToUser && match[3]) paidTo = match[3].trim();
      if (!m.paymentType && match[4]) pType = match[4].trim();
    }
  }

  const pTypeStr = String(m.movementType || m.type || '').toUpperCase();
  const isPaidIn = pTypeStr === 'PAID_IN' || pTypeStr === 'IN' || pTypeStr.includes('IN');

  const methodUpper = String(pType).toUpperCase();
  const isUsd = methodUpper.includes('USD') || m.currencyCode === 'USD' || (!methodUpper.includes('LBP') && Number(m.amountUsd || m.amount || 0) < 10000);

  const amtUsd = Number(m.amountUsd ?? (isUsd ? m.amount : 0) ?? 0);
  const amtLbp = Number(m.amountLbp ?? (!isUsd ? m.amount : 0) ?? 0);

  const amountStr = isUsd
    ? `${isPaidIn ? '+' : '-'}$${(Number(amtUsd) || 0).toFixed(2)} USD`
    : `${isPaidIn ? '+' : '-'}${amtLbp.toLocaleString()} LBP`;

  return {
    time: m.timestamp || m.time || (m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
    type: isPaidIn ? 'PAID IN' : 'PAID OUT',
    typeDisplay: isPaidIn ? 'Paid In' : 'Paid Out',
    isPaidIn,
    by,
    paidTo,
    paymentType: pType,
    description: desc,
    amountStr,
    isUsd
  };
}

/**
 * Ensures that if the active shift has an openedAt timestamp, any older unarchived
 * movements from prior shifts or timestamps in localStorage are marked as closed.
 */
export function sanitizeStalePreShiftMovements(shift?: PosShift): void {
  if (typeof window === 'undefined') return;
  const activeShift = shift || getActiveShift();
  if (!activeShift || !activeShift.openedAt) return;

  const openTime = new Date(activeShift.openedAt).getTime();
  if (isNaN(openTime)) return;

  try {
    const raw = localStorage.getItem(CASH_MOVEMENTS_KEY);
    if (!raw) return;
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) return;

    let hasChanges = false;
    list.forEach((m: any) => {
      const isPriorShift = m.shiftId && m.shiftId !== activeShift.id;
      const mTime = new Date(m.createdAtIso || m.createdAt || m.timestamp || m.date).getTime();
      const isPriorTime = !isNaN(mTime) && mTime < openTime - 2000;

      if ((isPriorShift || isPriorTime) && !m.isReconciledOrClosed && !m.closedInZReport) {
        m.isReconciledOrClosed = true;
        m.closedInZReport = true;
        m.shiftClosed = true;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      localStorage.setItem(CASH_MOVEMENTS_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.warn('Error sanitizing stale movements:', e);
  }
}

/**
 * Closes an active shift and generates a fresh session (Z-Report closing)
 */
export async function closeShiftSession(
  shift: PosShift,
  actualCountedUsd: number,
  actualCountedLbp: number,
  summary: MainReadingSummary,
  tenantId?: string,
  includedInvoices?: any[],
  includedPaidInOut?: any[],
  includedReceipts?: any[]
): Promise<{ closedShift: PosShift; newShift: PosShift; closedInvoiceIds: string[] }> {
  const closeTimeIso = new Date().toISOString();
  const closeTimeMs = new Date(closeTimeIso).getTime();

  const closedShift: PosShift = {
    ...shift,
    closedAt: closeTimeIso,
    status: 'CLOSED',
    closingCashUsd: actualCountedUsd,
    closingCashLbp: actualCountedLbp,
    actualCountedUsd,
    actualCountedLbp,
    summary
  };

  // 1. Add to history
  const history = getShiftHistory();
  const updatedHistory = [closedShift, ...history];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SHIFT_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch {}
  }

  // 2. Permanently seal all invoices for this shift or up to close timestamp
  const closedInvoiceIds: string[] = [];
  const invoiceIds = new Set((includedInvoices || []).map((i) => i.id || i.invoiceNumber));

  if (typeof window !== 'undefined') {
    try {
      const storageKeys = ['vanguard_invoices_directory', 'vanguard_pos_invoices', 'vanguard_sales_invoices'];
      storageKeys.forEach((key) => {
        const raw = localStorage.getItem(key);
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            list.forEach((i: any) => {
              const iTime = new Date(i.createdAtIso || i.createdAt || i.timestamp || i.date).getTime();
              const isThisShift = i.shiftId === shift.id || invoiceIds.has(i.id) || invoiceIds.has(i.invoiceNumber);
              const isPriorUnclosed = !i.shiftId && !isNaN(iTime) && iTime <= closeTimeMs;
              if (isThisShift || isPriorUnclosed) {
                i.isReconciledOrClosed = true;
                i.closedInZReport = true;
                i.shiftClosed = true;
                i.closedShiftId = shift.id;
                if (i.id && !closedInvoiceIds.includes(i.id)) closedInvoiceIds.push(i.id);
                if (i.invoiceNumber && !closedInvoiceIds.includes(i.invoiceNumber)) {
                  closedInvoiceIds.push(i.invoiceNumber);
                }
              }
            });
            localStorage.setItem(key, JSON.stringify(list));
          }
        }
      });
    } catch (e) {
      console.warn('Error archiving invoices on shift close:', e);
    }
  }

  // 3. Permanently seal all cash movements for this shift or prior
  try {
    const currentM = getCashMovements();
    const movementIds = new Set((includedPaidInOut || []).map((m) => m.id || m.movementNo));
    currentM.forEach((m) => {
      const dateVal = m.createdAtIso || m.createdAt || (m as any).timestamp || (m as any).date || '';
      const mTime = dateVal ? new Date(dateVal).getTime() : NaN;
      const isThisShift = m.shiftId === shift.id || movementIds.has(m.id) || movementIds.has(m.movementNo);
      const isPriorUnclosed = !m.shiftId && !isNaN(mTime) && mTime <= closeTimeMs;
      if (isThisShift || isPriorUnclosed) {
        m.isReconciledOrClosed = true;
        m.closedInZReport = true;
        m.shiftClosed = true;
        m.closedShiftId = shift.id;
      }
    });
    saveCashMovements(currentM);
  } catch (e) {
    console.warn('Error sealing cash movements on shift close:', e);
  }

  // 4. Permanently seal all customer receipts for this shift or prior
  try {
    const { getCustomerReceipts, saveCustomerReceipts } = await import('@/lib/customerSalesService');
    const currentR = getCustomerReceipts();
    const receiptIds = new Set((includedReceipts || []).map((r) => r.id || r.receiptNo));
    currentR.forEach((r) => {
      const dateVal = (r as any).createdAtIso || r.createdAt || (r as any).timestamp || (r as any).date || '';
      const rTime = dateVal ? new Date(dateVal).getTime() : NaN;
      const isThisShift = r.shiftId === shift.id || receiptIds.has(r.id) || receiptIds.has(r.receiptNo);
      const isPriorUnclosed = !r.shiftId && !isNaN(rTime) && rTime <= closeTimeMs;
      if (isThisShift || isPriorUnclosed) {
        r.isReconciledOrClosed = true;
        r.closedInZReport = true;
        r.shiftClosed = true;
        r.closedShiftId = shift.id;
      }
    });
    saveCustomerReceipts(currentR);
  } catch (e) {
    console.warn('Error sealing customer receipts on shift close:', e);
  }

  // 5. Permanently seal all credit notes for this shift or prior
  try {
    const { getCreditNotes, saveCreditNotes } = await import('@/lib/customerSalesService');
    const currentCrn = getCreditNotes();
    currentCrn.forEach((crn) => {
      const dateVal = (crn as any).createdAtIso || crn.createdAt || (crn as any).timestamp || crn.date || '';
      const crnTime = dateVal ? new Date(dateVal).getTime() : NaN;
      const isThisShift = crn.shiftId === shift.id;
      const isPriorUnclosed = !crn.shiftId && !isNaN(crnTime) && crnTime <= closeTimeMs;
      if (isThisShift || isPriorUnclosed) {
        crn.isReconciledOrClosed = true;
        crn.closedInZReport = true;
        crn.shiftClosed = true;
        crn.closedShiftId = shift.id;
      }
    });
    saveCreditNotes(currentCrn);
  } catch (e) {
    console.warn('Error sealing credit notes on shift close:', e);
  }

  // 6. Create clean fresh next shift session
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  const nextShiftNumber = shift.shiftNumber + 1;
  const newShiftOpenedAt = new Date().toISOString();
  const nextOpeningUsd = actualCountedUsd > 0 ? actualCountedUsd : 0.0;
  const nextOpeningLbp = actualCountedLbp > 0 ? actualCountedLbp : 0.0;

  const newShift: PosShift = {
    id: `SH-${dateStr}-${nextShiftNumber}`,
    shiftNumber: nextShiftNumber,
    branch: shift.branch,
    workstation: shift.workstation,
    cashierName: shift.cashierName,
    openedAt: newShiftOpenedAt,
    closedAt: null,
    openingCashUsd: nextOpeningUsd,
    openingCashLbp: nextOpeningLbp,
    status: 'OPEN',
    notes: `Shift #${nextShiftNumber} opened after Z-Report for Shift #${shift.shiftNumber}`
  };

  await saveActiveShift(newShift, tenantId);

  // Record opening float movement for new shift if float > 0
  if (nextOpeningUsd > 0 || nextOpeningLbp > 0) {
    await recordCashMovement({
      shiftId: newShift.id,
      movementType: 'PAID_IN',
      type: 'PAID_IN',
      amount: newShift.openingCashUsd,
      amountUsd: newShift.openingCashUsd,
      amountLbp: newShift.openingCashLbp,
      reasonCategory: 'OPENING_FLOAT',
      category: 'Opening Float',
      targetAccountId: 'acc-53000',
      targetAccountNumber: '53000',
      targetAccountName: 'Main Safe / الصندوق الرئيسي',
      notes: `Opening cash balance carried over from Shift #${shift.shiftNumber}`,
      createdAtIso: newShiftOpenedAt,
      isReconciledOrClosed: false
    }, tenantId);
  }

  return { closedShift, newShift, closedInvoiceIds };
}

/**
 * Live Aggregation Engine for Main Reading (X-Reading & Z-Reading)
 */
export function computeMainReadingSummary({
  readingType,
  shift,
  invoices,
  paidInOutList,
  customerReceipts,
  openingFloatUsd,
  openingFloatLbp,
  actualCountedUsd,
  actualCountedLbp,
  exchangeRate = POS_EXCHANGE_RATE_LBP,
  workingDate
}: {
  readingType: 'X' | 'Z';
  shift: PosShift;
  invoices: any[];
  paidInOutList: any[];
  customerReceipts: any[];
  openingFloatUsd: number;
  openingFloatLbp: number;
  actualCountedUsd?: number | null;
  actualCountedLbp?: number | null;
  exchangeRate?: number;
  workingDate?: string;
}): MainReadingSummary {
  return calculateMainReadingSummary({
    readingType,
    shift,
    invoices,
    paidInOutList,
    customerReceipts,
    openingFloatUsd,
    openingFloatLbp,
    actualCountedUsd,
    actualCountedLbp,
    exchangeRate,
    activeWorkingDate: workingDate
  }) as unknown as MainReadingSummary;
}
