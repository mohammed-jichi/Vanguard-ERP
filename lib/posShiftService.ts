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
  saveActiveShift(fallback);
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
        if (cleanList.length !== parsed.length) {
          try {
            localStorage.setItem(CASH_MOVEMENTS_KEY, JSON.stringify(cleanList));
          } catch {}
        }
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
            shiftId: item.shiftId || 'SH-20261014-44',
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
    timestamp: timeStr,
    isVoided: false
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
 * Evaluates whether an invoice qualifies for the current shift/working-date Main Reading
 */
export function isInvoicePostedToday(inv: any, activeWorkingDate: string): boolean {
  if (!inv) return false;
  if (inv.closedInZReport === true || inv.shiftClosed === true) return false;

  const statusStr = String(inv.status || '').toUpperCase();
  const isPosted =
    statusStr === 'POSTED' ||
    inv.is_posted === true ||
    inv.posted === true ||
    (statusStr !== 'DRAFT' && statusStr !== 'HOLD' && statusStr !== 'UNPOSTED' && statusStr !== 'VOID' && inv.grandTotal !== undefined);
  if (!isPosted) return false;

  const matchesDate =
    isSameWorkingDay(inv.date, activeWorkingDate) ||
    isSameWorkingDay(inv.createdAt, activeWorkingDate) ||
    isSameWorkingDay(inv.timestamp, activeWorkingDate);

  return matchesDate;
}

/**
 * Evaluates whether a customer receipt qualifies for the current shift/working-date Main Reading
 */
export function isReceiptPostedToday(rct: any, activeWorkingDate: string): boolean {
  if (!rct || rct.isVoided === true) return false;
  if (rct.closedInZReport === true || rct.shiftClosed === true) return false;

  const statusStr = String(rct.status || 'POSTED').toUpperCase();
  if (statusStr === 'VOID' || statusStr === 'DRAFT' || statusStr === 'UNPOSTED') return false;

  const matchesDate =
    isSameWorkingDay(rct.date, activeWorkingDate) ||
    isSameWorkingDay(rct.createdAt, activeWorkingDate) ||
    isSameWorkingDay(rct.timestamp, activeWorkingDate);

  return matchesDate;
}

/**
 * Evaluates whether a cash movement qualifies for the current shift/working-date Main Reading
 */
export function isCashMovementToday(m: any, activeWorkingDate: string): boolean {
  if (!m || m.isVoided === true) return false;
  if (m.closedInZReport === true || m.shiftClosed === true) return false;

  const matchesDate =
    isSameWorkingDay(m.date, activeWorkingDate) ||
    isSameWorkingDay(m.createdAt, activeWorkingDate) ||
    isSameWorkingDay(m.timestamp, activeWorkingDate);

  return matchesDate;
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
    ? `${isPaidIn ? '+' : '-'}$${amtUsd.toFixed(2)} USD`
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
  const closedShift: PosShift = {
    ...shift,
    closedAt: new Date().toISOString(),
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

  // 2. Mark included transactions with closedInZReport: true
  const closedInvoiceIds: string[] = [];
  if (includedInvoices && includedInvoices.length > 0) {
    includedInvoices.forEach((inv) => {
      inv.closedInZReport = true;
      inv.shiftClosed = true;
      if (inv.id) closedInvoiceIds.push(inv.id);
      if (inv.invoiceNumber && !closedInvoiceIds.includes(inv.invoiceNumber)) {
        closedInvoiceIds.push(inv.invoiceNumber);
      }
    });

    if (typeof window !== 'undefined') {
      try {
        const storageKeys = ['vanguard_invoices_directory', 'vanguard_pos_invoices', 'vanguard_sales_invoices'];
        storageKeys.forEach((key) => {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              list.forEach((i: any) => {
                if (closedInvoiceIds.includes(i.id) || closedInvoiceIds.includes(i.invoiceNumber)) {
                  i.closedInZReport = true;
                  i.shiftClosed = true;
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
  }

  // Mark included cash movements
  if (includedPaidInOut && includedPaidInOut.length > 0) {
    const currentM = getCashMovements();
    const movementIds = includedPaidInOut.map((m) => m.id || m.movementNo);
    currentM.forEach((m) => {
      if (movementIds.includes(m.id) || movementIds.includes(m.movementNo)) {
        m.closedInZReport = true;
        m.shiftClosed = true;
      }
    });
    saveCashMovements(currentM);
  }

  // Mark included customer receipts
  if (includedReceipts && includedReceipts.length > 0) {
    try {
      const { getCustomerReceipts, saveCustomerReceipts } = await import('@/lib/customerSalesService');
      const currentR = getCustomerReceipts();
      const receiptIds = includedReceipts.map((r) => r.id || r.receiptNo);
      currentR.forEach((r) => {
        if (receiptIds.includes(r.id) || receiptIds.includes(r.receiptNo)) {
          r.closedInZReport = true;
          r.shiftClosed = true;
        }
      });
      saveCustomerReceipts(currentR);
    } catch {}
  }

  // 3. Create fresh next shift session
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  const nextShiftNumber = shift.shiftNumber + 1;
  const newShift: PosShift = {
    id: `SH-${dateStr}-${nextShiftNumber}`,
    shiftNumber: nextShiftNumber,
    branch: shift.branch,
    workstation: shift.workstation,
    cashierName: shift.cashierName,
    openedAt: new Date().toISOString(),
    closedAt: null,
    openingCashUsd: actualCountedUsd > 0 ? actualCountedUsd : 200.0,
    openingCashLbp: actualCountedLbp > 0 ? actualCountedLbp : 200.0 * POS_EXCHANGE_RATE_LBP,
    status: 'OPEN',
    notes: `Shift #${nextShiftNumber} opened after Z-Report for Shift #${shift.shiftNumber}`
  };

  await saveActiveShift(newShift, tenantId);

  // Record opening float movement for new shift
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
    notes: `Opening cash balance carried over from Shift #${shift.shiftNumber}`
  }, tenantId);

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
  let grossSalesUsd = 0;
  let discountsUsd = 0;
  let taxUsd = 0;
  let returnsCreditNotesUsd = 0;
  let creditNoteCount = 0;
  let invoiceCount = 0;

  let cashSalesUsd = 0;
  let cashSalesLbp = 0;
  let cashRefundsUsd = 0;
  let cashRefundsLbp = 0;

  const salesByTransactionType = {
    localUsd: 0,
    internationalUsd: 0,
    onlineUsd: 0
  };

  const tenderMap: Record<string, { usd: number; lbp: number; count: number; label: string }> = {
    'cash_usd': { usd: 0, lbp: 0, count: 0, label: 'Cash USD' },
    'cash_lbp': { usd: 0, lbp: 0, count: 0, label: 'Cash LBP' },
    'on_account': { usd: 0, lbp: 0, count: 0, label: 'Credit / On Account' },
    'card': { usd: 0, lbp: 0, count: 0, label: 'Visa / MasterCard' },
    'bank_transfer': { usd: 0, lbp: 0, count: 0, label: 'Bank Transfer / Whish' },
    'check': { usd: 0, lbp: 0, count: 0, label: 'Bank Cheque' }
  };

  const divisionTotals: Record<string, { amount: number; count: number }> = {
    'Retail': { amount: 0, count: 0 },
    'Wholesale': { amount: 0, count: 0 },
    'Promotions': { amount: 0, count: 0 },
    'Raw Materials': { amount: 0, count: 0 },
    'Other': { amount: 0, count: 0 }
  };

  // 1. Process Invoices (Sales Invoices vs. Credit Notes)
  invoices.forEach((inv) => {
    const isCreditNote =
      inv.docType === 'CREDIT_NOTE' ||
      inv.type === 'CREDIT_NOTE' ||
      inv.transactionType === 'Credit Note' ||
      (inv.invoiceNumber && String(inv.invoiceNumber).startsWith('CRN-')) ||
      (inv.grandTotal !== undefined && inv.grandTotal < 0);

    if (isCreditNote) {
      const crVal = Math.abs(Number(inv.grandTotal || inv.subtotal || 0));
      returnsCreditNotesUsd += crVal;
      creditNoteCount += 1;

      // Detect if refund was paid out in cash from drawer
      let wasCashRefund = false;
      if (inv.payments && Array.isArray(inv.payments) && inv.payments.length > 0) {
        inv.payments.forEach((p: any) => {
          const pType = String(p.type || p.paymentMethod || '').toLowerCase();
          if (pType.includes('cash') || pType.includes('نقدي')) {
            wasCashRefund = true;
            const amt = Math.abs(Number(p.amount || 0));
            if (pType.includes('lbp') || pType.includes('ل.ل')) {
              cashRefundsLbp += amt;
            } else {
              cashRefundsUsd += amt;
            }
          }
        });
      }
      if (!wasCashRefund) {
        const refundMethod = String(
          inv.paymentMethod || inv.paymentType || inv.settlementMethod || inv.refundMethod || ''
        ).toLowerCase();
        if (refundMethod.includes('cash') || refundMethod.includes('نقدي')) {
          if (refundMethod.includes('lbp') || refundMethod.includes('ل.ل')) {
            cashRefundsLbp += crVal * exchangeRate;
          } else {
            cashRefundsUsd += crVal;
          }
        }
      }
      return;
    }

    // Normal Sales Invoice
    invoiceCount += 1;
    const invSubtotal = Math.abs(Number(inv.subtotal || inv.grandTotal || 0));
    const invDiscount = Math.abs(Number(inv.discount || 0));
    const invTax = Math.abs(Number(inv.tax || inv.vat || 0));
    const invGrand = Math.abs(Number(inv.grandTotal || (invSubtotal - invDiscount + invTax)));

    grossSalesUsd += invSubtotal;
    discountsUsd += invDiscount;
    taxUsd += invTax;

    // Transaction Type breakdown (Local, International, Online)
    const txType = String(inv.transactionType || '').toLowerCase();
    const channel = String(inv.salesChannel || '').toLowerCase();
    if (txType.includes('international') || channel.includes('international') || channel.includes('export')) {
      salesByTransactionType.internationalUsd += invGrand;
    } else if (
      txType.includes('online') ||
      channel.includes('online') ||
      channel.includes('e-com') ||
      channel.includes('delivery')
    ) {
      salesByTransactionType.onlineUsd += invGrand;
    } else {
      salesByTransactionType.localUsd += invGrand;
    }

    // Payment / Tender method breakdown
    let processedPayments = false;
    if (inv.payments && Array.isArray(inv.payments) && inv.payments.length > 0) {
      inv.payments.forEach((p: any) => {
        const pType = String(p.type || p.paymentMethod || p.method || '').toLowerCase();
        const pAmt = Number(p.amount || 0);
        if (pAmt <= 0) return;
        processedPayments = true;

        if (pType.includes('lbp') || pType.includes('ل.ل')) {
          tenderMap['cash_lbp'].lbp += pAmt;
          tenderMap['cash_lbp'].usd += pAmt / exchangeRate;
          tenderMap['cash_lbp'].count += 1;
          cashSalesLbp += pAmt;
        } else if (pType.includes('card') || pType.includes('visa') || pType.includes('master')) {
          tenderMap['card'].usd += pAmt;
          tenderMap['card'].lbp += pAmt * exchangeRate;
          tenderMap['card'].count += 1;
        } else if (
          pType.includes('account') ||
          pType.includes('credit') ||
          pType.includes('ذمم') ||
          pType.includes('آجل')
        ) {
          tenderMap['on_account'].usd += pAmt;
          tenderMap['on_account'].lbp += pAmt * exchangeRate;
          tenderMap['on_account'].count += 1;
        } else if (
          pType.includes('transfer') ||
          pType.includes('whish') ||
          pType.includes('omt') ||
          pType.includes('تحويل')
        ) {
          tenderMap['bank_transfer'].usd += pAmt;
          tenderMap['bank_transfer'].lbp += pAmt * exchangeRate;
          tenderMap['bank_transfer'].count += 1;
        } else if (pType.includes('check') || pType.includes('cheque') || pType.includes('شيك')) {
          tenderMap['check'].usd += pAmt;
          tenderMap['check'].lbp += pAmt * exchangeRate;
          tenderMap['check'].count += 1;
        } else {
          // Default to Cash USD
          tenderMap['cash_usd'].usd += pAmt;
          tenderMap['cash_usd'].lbp += pAmt * exchangeRate;
          tenderMap['cash_usd'].count += 1;
          cashSalesUsd += pAmt;
        }
      });
    }

    if (!processedPayments) {
      const pMethod = String(inv.paymentMethod || inv.paymentType || inv.currency || '').toLowerCase();
      if (pMethod.includes('lbp') || pMethod.includes('ل.ل')) {
        tenderMap['cash_lbp'].usd += invGrand / exchangeRate;
        tenderMap['cash_lbp'].lbp += invGrand;
        tenderMap['cash_lbp'].count += 1;
        cashSalesLbp += invGrand;
      } else if (
        pMethod.includes('account') ||
        pMethod.includes('credit') ||
        pMethod.includes('ذمم') ||
        pMethod.includes('آجل')
      ) {
        tenderMap['on_account'].usd += invGrand;
        tenderMap['on_account'].lbp += invGrand * exchangeRate;
        tenderMap['on_account'].count += 1;
      } else if (pMethod.includes('card') || pMethod.includes('visa') || pMethod.includes('master')) {
        tenderMap['card'].usd += invGrand;
        tenderMap['card'].lbp += invGrand * exchangeRate;
        tenderMap['card'].count += 1;
      } else if (pMethod.includes('transfer') || pMethod.includes('whish') || pMethod.includes('omt')) {
        tenderMap['bank_transfer'].usd += invGrand;
        tenderMap['bank_transfer'].lbp += invGrand * exchangeRate;
        tenderMap['bank_transfer'].count += 1;
      } else if (pMethod.includes('check') || pMethod.includes('cheque')) {
        tenderMap['check'].usd += invGrand;
        tenderMap['check'].lbp += invGrand * exchangeRate;
        tenderMap['check'].count += 1;
      } else {
        tenderMap['cash_usd'].usd += invGrand;
        tenderMap['cash_usd'].lbp += invGrand * exchangeRate;
        tenderMap['cash_usd'].count += 1;
        cashSalesUsd += invGrand;
      }
    }

    // Line items for Division / Department breakdown
    let matchedLine = false;
    if (inv.items && Array.isArray(inv.items) && inv.items.length > 0) {
      inv.items.forEach((it: any) => {
        const itemDiv = String(it.division || it.category || 'Retail').toLowerCase();
        const itemTotal = Number(it.total || (it.qty || 1) * (it.unitPrice || 0));
        const qty = Number(it.qty || 1);

        if (itemDiv.includes('wholesale') || itemDiv.includes('جملة')) {
          divisionTotals['Wholesale'].amount += itemTotal;
          divisionTotals['Wholesale'].count += qty;
          matchedLine = true;
        } else if (itemDiv.includes('promo') || itemDiv.includes('عروض') || itemDiv.includes('discount')) {
          divisionTotals['Promotions'].amount += itemTotal;
          divisionTotals['Promotions'].count += qty;
          matchedLine = true;
        } else if (itemDiv.includes('raw') || itemDiv.includes('bulk') || itemDiv.includes('أولية')) {
          divisionTotals['Raw Materials'].amount += itemTotal;
          divisionTotals['Raw Materials'].count += qty;
          matchedLine = true;
        } else {
          divisionTotals['Retail'].amount += itemTotal;
          divisionTotals['Retail'].count += qty;
          matchedLine = true;
        }
      });
    }
    if (!matchedLine) {
      divisionTotals['Retail'].amount += invGrand;
      divisionTotals['Retail'].count += 1;
    }
  });

  const netSalesUsd = grossSalesUsd - discountsUsd + taxUsd;
  const finalTurnoverUsd = Math.max(0, netSalesUsd - returnsCreditNotesUsd);

  // 2. Process Customer Receipts Stream
  let customerReceiptsTotalUsd = 0;
  let customerReceiptsTotalLbp = 0;
  let cashCustomerReceiptsUsd = 0;
  let cashCustomerReceiptsLbp = 0;
  const receiptsList: Array<{ id: string; customerName: string; method: string; amountUsd: number; date: string }> = [];

  customerReceipts.forEach((rct) => {
    if (rct.isVoided) return;
    const amt = Number(rct.amountReceivedUsd ?? rct.amountReceived ?? rct.amount ?? 0);
    if (amt <= 0) return;

    const methodStr = String(rct.paymentMethod || rct.method || rct.paymentType || 'CASH USD').toLowerCase();
    const currStr = String(rct.currencyCode || rct.currency || (methodStr.includes('lbp') ? 'LBP' : 'USD')).toUpperCase();

    let amtUsd = amt;
    let amtLbp = amt * exchangeRate;
    if (currStr === 'LBP') {
      amtLbp = amt;
      amtUsd = Number((amt / exchangeRate).toFixed(2));
    }

    customerReceiptsTotalUsd += amtUsd;
    customerReceiptsTotalLbp += amtLbp;

    if (methodStr.includes('cash') || methodStr.includes('نقدي')) {
      if (currStr === 'LBP' || methodStr.includes('lbp') || methodStr.includes('ل.ل')) {
        cashCustomerReceiptsLbp += amtLbp;
        tenderMap['cash_lbp'].lbp += amtLbp;
        tenderMap['cash_lbp'].usd += amtUsd;
        tenderMap['cash_lbp'].count += 1;
      } else {
        cashCustomerReceiptsUsd += amtUsd;
        tenderMap['cash_usd'].usd += amtUsd;
        tenderMap['cash_usd'].lbp += amtLbp;
        tenderMap['cash_usd'].count += 1;
      }
    } else if (methodStr.includes('card') || methodStr.includes('visa') || methodStr.includes('master')) {
      tenderMap['card'].usd += amtUsd;
      tenderMap['card'].lbp += amtLbp;
      tenderMap['card'].count += 1;
    } else if (methodStr.includes('check') || methodStr.includes('cheque') || methodStr.includes('شيك')) {
      tenderMap['check'].usd += amtUsd;
      tenderMap['check'].lbp += amtLbp;
      tenderMap['check'].count += 1;
    } else if (methodStr.includes('transfer') || methodStr.includes('whish') || methodStr.includes('omt')) {
      tenderMap['bank_transfer'].usd += amtUsd;
      tenderMap['bank_transfer'].lbp += amtLbp;
      tenderMap['bank_transfer'].count += 1;
    }

    receiptsList.push({
      id: rct.id || rct.receiptNo || `RCT-${Math.floor(Math.random() * 10000)}`,
      customerName: rct.customerName || 'Customer',
      method: rct.paymentMethod || rct.method || (currStr === 'LBP' ? 'Cash LBP' : 'Cash USD'),
      amountUsd: amtUsd,
      date: rct.date || (rct.createdAt ? String(rct.createdAt).split('T')[0] : new Date().toISOString().split('T')[0])
    });
  });

  // Collections by Tender array
  const collectionsByTender: TenderCollection[] = Object.keys(tenderMap).map((key) => ({
    method: key,
    label: tenderMap[key].label,
    usd: Number(tenderMap[key].usd.toFixed(2)),
    lbp: Math.round(tenderMap[key].lbp),
    count: tenderMap[key].count
  }));

  // 3. Process Paid In / Paid Out Drawer Movements
  let paidInTotalUsd = 0;
  let paidInTotalLbp = 0;
  let paidOutTotalUsd = 0;
  let paidOutTotalLbp = 0;

  paidInOutList.forEach((pio) => {
    if (pio.isVoided) return;
    if (pio.reasonCategory === 'OPENING_FLOAT' || pio.category === 'Opening Float') return;

    const pTypeStr = String(pio.movementType || pio.type || '').toUpperCase();
    const isPaidIn = pTypeStr === 'PAID_IN' || pTypeStr === 'IN' || pTypeStr.includes('IN');

    const methodUpper = String(pio.paymentType || pio.currencyCode || pio.currency || '').toUpperCase();
    const isUsd =
      methodUpper.includes('USD') ||
      pio.currencyCode === 'USD' ||
      (!methodUpper.includes('LBP') && Number(pio.amountUsd || pio.amount || 0) < 10000);

    if (isUsd) {
      const amtUsd = Number(pio.amountUsd ?? pio.amount ?? 0);
      if (isPaidIn) {
        paidInTotalUsd += amtUsd;
      } else {
        paidOutTotalUsd += amtUsd;
      }
    } else {
      const amtLbp = Number(pio.amountLbp ?? pio.amount ?? 0);
      if (isPaidIn) {
        paidInTotalLbp += amtLbp;
      } else {
        paidOutTotalLbp += amtLbp;
      }
    }
  });

  // 4. Expected Drawer Cash Calculations
  const expectedCashUsd = Number(
    (
      openingFloatUsd +
      cashSalesUsd +
      cashCustomerReceiptsUsd +
      paidInTotalUsd -
      cashRefundsUsd -
      paidOutTotalUsd
    ).toFixed(2)
  );

  const expectedCashLbp = Math.round(
    openingFloatLbp +
      cashSalesLbp +
      cashCustomerReceiptsLbp +
      paidInTotalLbp -
      cashRefundsLbp -
      paidOutTotalLbp
  );

  // 5. Physical Count & Reconciliation Variance
  const hasCountedUsd =
    actualCountedUsd !== undefined && actualCountedUsd !== null && !isNaN(actualCountedUsd);
  const hasCountedLbp =
    actualCountedLbp !== undefined && actualCountedLbp !== null && !isNaN(actualCountedLbp);

  let varianceUsd = 0;
  let varianceLbp = 0;
  let reconciliationStatus: 'PENDING' | 'BALANCED' | 'SHORTAGE' | 'OVERAGE' = 'PENDING';

  if (hasCountedUsd || hasCountedLbp) {
    const countUsd = hasCountedUsd ? (actualCountedUsd as number) : 0;
    const countLbp = hasCountedLbp ? (actualCountedLbp as number) : 0;
    varianceUsd = Number((countUsd - expectedCashUsd).toFixed(2));
    varianceLbp = Math.round(countLbp - expectedCashLbp);

    if (Math.abs(varianceUsd) <= 0.05 && Math.abs(varianceLbp) <= 1000) {
      reconciliationStatus = 'BALANCED';
    } else if (varianceUsd > 0.05 || varianceLbp > 1000) {
      reconciliationStatus = 'OVERAGE';
    } else {
      reconciliationStatus = 'SHORTAGE';
    }
  }

  // 6. Division Breakdown
  const totalDivisionsAmount = Object.values(divisionTotals).reduce((sum, d) => sum + d.amount, 0) || 1;
  const divisionBreakdown: DivisionBreakdown[] = Object.keys(divisionTotals)
    .filter(
      (k) =>
        divisionTotals[k].amount > 0 ||
        divisionTotals[k].count > 0 ||
        k === 'Retail' ||
        k === 'Wholesale'
    )
    .map((k) => ({
      division: k,
      amountUsd: Number(divisionTotals[k].amount.toFixed(2)),
      itemCount: divisionTotals[k].count,
      percentage: Number(((divisionTotals[k].amount / totalDivisionsAmount) * 100).toFixed(1))
    }))
    .sort((a, b) => b.amountUsd - a.amountUsd);

  // 7. Invoice Range Summary
  const standardInvoices = invoices.filter(
    (inv) =>
      inv.docType !== 'CREDIT_NOTE' &&
      inv.type !== 'CREDIT_NOTE' &&
      inv.transactionType !== 'Credit Note' &&
      !String(inv.invoiceNumber || '').startsWith('CRN-') &&
      (inv.grandTotal === undefined || inv.grandTotal >= 0)
  );
  const sortedInvoices = [...standardInvoices].sort((a, b) =>
    String(a.invoiceNumber || a.id || '').localeCompare(
      String(b.invoiceNumber || b.id || ''),
      undefined,
      { numeric: true }
    )
  );
  const firstInvoiceNo = sortedInvoices[0]?.invoiceNumber || sortedInvoices[0]?.id || '';
  const lastInvoiceNo =
    sortedInvoices[sortedInvoices.length - 1]?.invoiceNumber ||
    sortedInvoices[sortedInvoices.length - 1]?.id ||
    '';
  const invoiceRangeText =
    sortedInvoices.length > 0
      ? `From #${firstInvoiceNo} to #${lastInvoiceNo} (Count: ${sortedInvoices.length})`
      : 'No Invoices';

  const settlementMode = {
    cashSalesUsd: Number(cashSalesUsd.toFixed(2)),
    creditSalesUsd: Number((tenderMap['on_account'].usd || 0).toFixed(2)),
    cardSalesUsd: Number((tenderMap['card'].usd || 0).toFixed(2))
  };

  return {
    readingType,
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    shiftId: shift.id,
    shiftNumber: shift.shiftNumber,
    branch: shift.branch,
    workstation: shift.workstation,
    cashierName: shift.cashierName,
    openedAt: shift.openedAt,
    closedAt: readingType === 'Z' ? new Date().toISOString() : shift.closedAt,
    workingDate,

    firstInvoiceNo,
    lastInvoiceNo,
    invoiceRangeText,

    grossSalesUsd: Number(grossSalesUsd.toFixed(2)),
    discountsUsd: Number(discountsUsd.toFixed(2)),
    taxUsd: Number(taxUsd.toFixed(2)),
    netSalesUsd: Number(netSalesUsd.toFixed(2)),
    invoiceCount,

    salesByTransactionType: {
      localUsd: Number(salesByTransactionType.localUsd.toFixed(2)),
      internationalUsd: Number(salesByTransactionType.internationalUsd.toFixed(2)),
      onlineUsd: Number(salesByTransactionType.onlineUsd.toFixed(2))
    },

    settlementMode,

    returnsCreditNotesUsd: Number(returnsCreditNotesUsd.toFixed(2)),
    creditNoteCount,
    finalTurnoverUsd: Number(finalTurnoverUsd.toFixed(2)),

    collectionsByTender,

    customerReceiptsTotalUsd: Number(customerReceiptsTotalUsd.toFixed(2)),
    customerReceiptsTotalLbp: Math.round(customerReceiptsTotalLbp),
    customerReceiptsCount: receiptsList.length,
    customerReceiptsList: receiptsList,

    paidInTotalUsd: Number(paidInTotalUsd.toFixed(2)),
    paidInTotalLbp: Math.round(paidInTotalLbp),
    paidOutTotalUsd: Number(paidOutTotalUsd.toFixed(2)),
    paidOutTotalLbp: Math.round(paidOutTotalLbp),
    paidInOutList: paidInOutList as CashMovement[],

    openingFloatUsd: Number(openingFloatUsd.toFixed(2)),
    openingFloatLbp: Math.round(openingFloatLbp),
    cashSalesUsd: Number(cashSalesUsd.toFixed(2)),
    cashSalesLbp: Math.round(cashSalesLbp),
    cashCustomerReceiptsUsd: Number(cashCustomerReceiptsUsd.toFixed(2)),
    cashCustomerReceiptsLbp: Math.round(cashCustomerReceiptsLbp),
    cashRefundsUsd: Number(cashRefundsUsd.toFixed(2)),
    cashRefundsLbp: Math.round(cashRefundsLbp),
    expectedCashUsd,
    expectedCashLbp,

    actualCountedUsd: Number((actualCountedUsd || 0).toFixed(2)),
    actualCountedLbp: Math.round(actualCountedLbp || 0),
    varianceUsd,
    varianceLbp,
    reconciliationStatus,

    divisionBreakdown
  };
}
