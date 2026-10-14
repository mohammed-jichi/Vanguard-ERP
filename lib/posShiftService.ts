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

export const POS_EXCHANGE_RATE_LBP = 89500;

export const ACTIVE_SHIFT_KEY = 'vanguard_pos_active_shift_v1';
export const SHIFT_HISTORY_KEY = 'vanguard_pos_shift_history_v1';
export const CASH_MOVEMENTS_KEY = 'vanguard_pos_cash_movements_v1';
export const SHIFT_UPDATED_EVENT = 'vanguard_pos_shift_updated';

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
  shiftId: string;
  type: 'PAID_IN' | 'PAID_OUT';
  category: string;
  amountUsd: number;
  amountLbp: number;
  notes: string;
  timestamp: string;
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

  // Sales by Transaction Type
  salesByTransactionType: {
    localUsd: number;
    internationalUsd: number;
    onlineUsd: number;
  };

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
  reconciliationStatus: 'BALANCED' | 'SHORTAGE' | 'OVERAGE';

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
    openingCashUsd: 200.0,
    openingCashLbp: 200.0 * POS_EXCHANGE_RATE_LBP,
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
 * Returns all recorded cash movements (Paid In / Paid Out)
 */
export function getCashMovements(): CashMovement[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CASH_MOVEMENTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading cash movements from localStorage:', e);
  }
  // Initial default seed movements
  const defaults: CashMovement[] = [
    {
      id: 'PIO-01',
      shiftId: 'SH-20261014-44',
      type: 'PAID_IN',
      category: 'Opening Float',
      amountUsd: 200.0,
      amountLbp: 200.0 * POS_EXCHANGE_RATE_LBP,
      notes: 'Initial morning drawer float',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 'PIO-02',
      shiftId: 'SH-20261014-44',
      type: 'PAID_OUT',
      category: 'Delivery Driver Fuel',
      amountUsd: 25.0,
      amountLbp: 25.0 * POS_EXCHANGE_RATE_LBP,
      notes: 'Van #4 fuel receipt',
      timestamp: '11:30 AM'
    },
    {
      id: 'PIO-03',
      shiftId: 'SH-20261014-44',
      type: 'PAID_OUT',
      category: 'Packaging Supplies',
      amountUsd: 15.0,
      amountLbp: 15.0 * POS_EXCHANGE_RATE_LBP,
      notes: 'Cardboard tape & packing markers',
      timestamp: '02:15 PM'
    }
  ];
  saveCashMovements(defaults);
  return defaults;
}

export function saveCashMovements(movements: CashMovement[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CASH_MOVEMENTS_KEY, JSON.stringify(movements));
  } catch (e) {
    console.warn('Error saving cash movements:', e);
  }
}

/**
 * Appends a cash movement (Paid In / Paid Out)
 */
export function recordCashMovement(
  movement: Omit<CashMovement, 'id' | 'timestamp'>,
  tenantId?: string
): CashMovement {
  const current = getCashMovements();
  const newRecord: CashMovement = {
    ...movement,
    id: `PIO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
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
 * Closes an active shift and generates a fresh session (Z-Report closing)
 */
export async function closeShiftSession(
  shift: PosShift,
  actualCountedUsd: number,
  actualCountedLbp: number,
  summary: MainReadingSummary,
  tenantId?: string
): Promise<{ closedShift: PosShift; newShift: PosShift }> {
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

  // 2. Create fresh next shift session
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
  recordCashMovement({
    shiftId: newShift.id,
    type: 'PAID_IN',
    category: 'Opening Float',
    amountUsd: newShift.openingCashUsd,
    amountLbp: newShift.openingCashLbp,
    notes: `Opening cash balance carried over from Shift #${shift.shiftNumber}`
  }, tenantId);

  return { closedShift, newShift };
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
  exchangeRate = POS_EXCHANGE_RATE_LBP
}: {
  readingType: 'X' | 'Z';
  shift: PosShift;
  invoices: any[];
  paidInOutList: any[];
  customerReceipts: any[];
  openingFloatUsd: number;
  openingFloatLbp: number;
  actualCountedUsd: number;
  actualCountedLbp: number;
  exchangeRate?: number;
}): MainReadingSummary {
  // Filter invoices for active shift or today
  // Standard invoices vs Credit notes
  let grossSalesUsd = 0;
  let discountsUsd = 0;
  let taxUsd = 0;
  let returnsCreditNotesUsd = 0;
  let creditNoteCount = 0;
  let invoiceCount = 0;

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

  let cashRefundsUsd = 0;
  let cashRefundsLbp = 0;

  invoices.forEach((inv) => {
    const isCreditNote =
      inv.transactionType === 'Credit Note' ||
      (inv.invoiceNumber && inv.invoiceNumber.startsWith('CRN-')) ||
      inv.grandTotal < 0;

    if (isCreditNote) {
      const crVal = Math.abs(inv.grandTotal || inv.subtotal || 0);
      returnsCreditNotesUsd += crVal;
      creditNoteCount += 1;

      // If credit note was refunded via cash
      if (inv.payments && Array.isArray(inv.payments)) {
        inv.payments.forEach((p: any) => {
          const typeStr = (p.type || '').toLowerCase();
          if (typeStr.includes('cash')) {
            const amt = Math.abs(p.amount || 0);
            if (typeStr.includes('lbp')) {
              cashRefundsLbp += amt;
            } else {
              cashRefundsUsd += amt;
            }
          }
        });
      }
      return;
    }

    // Normal Invoices
    invoiceCount += 1;
    const invSubtotal = Math.abs(inv.subtotal || 0);
    const invDiscount = Math.abs(inv.discount || 0);
    const invTax = Math.abs(inv.tax || 0);
    const invGrand = Math.abs(inv.grandTotal || invSubtotal - invDiscount + invTax);

    grossSalesUsd += invSubtotal;
    discountsUsd += invDiscount;
    taxUsd += invTax;

    // Transaction Type breakdown
    const txType = (inv.transactionType || '').toLowerCase();
    const channel = (inv.salesChannel || '').toLowerCase();
    if (txType.includes('international') || channel.includes('international') || channel.includes('export')) {
      salesByTransactionType.internationalUsd += invGrand;
    } else if (txType.includes('online') || channel.includes('online') || channel.includes('e-com')) {
      salesByTransactionType.onlineUsd += invGrand;
    } else {
      salesByTransactionType.localUsd += invGrand;
    }

    // Process payments / tender
    if (inv.payments && Array.isArray(inv.payments) && inv.payments.length > 0) {
      inv.payments.forEach((p: any) => {
        const pType = (p.type || '').toLowerCase();
        const pAmt = Number(p.amount || 0);
        if (pType.includes('lbp')) {
          tenderMap['cash_lbp'].lbp += pAmt;
          tenderMap['cash_lbp'].usd += pAmt / exchangeRate;
          tenderMap['cash_lbp'].count += 1;
        } else if (pType.includes('card') || pType.includes('visa') || pType.includes('master')) {
          tenderMap['card'].usd += pAmt;
          tenderMap['card'].lbp += pAmt * exchangeRate;
          tenderMap['card'].count += 1;
        } else if (pType.includes('account') || pType.includes('credit')) {
          tenderMap['on_account'].usd += pAmt;
          tenderMap['on_account'].lbp += pAmt * exchangeRate;
          tenderMap['on_account'].count += 1;
        } else if (pType.includes('transfer') || pType.includes('whish') || pType.includes('omt')) {
          tenderMap['bank_transfer'].usd += pAmt;
          tenderMap['bank_transfer'].lbp += pAmt * exchangeRate;
          tenderMap['bank_transfer'].count += 1;
        } else if (pType.includes('check') || pType.includes('cheque')) {
          tenderMap['check'].usd += pAmt;
          tenderMap['check'].lbp += pAmt * exchangeRate;
          tenderMap['check'].count += 1;
        } else {
          // Default to Cash USD
          tenderMap['cash_usd'].usd += pAmt;
          tenderMap['cash_usd'].lbp += pAmt * exchangeRate;
          tenderMap['cash_usd'].count += 1;
        }
      });
    } else {
      // Single payment method on invoice header
      const pMethod = (inv.transactionType || inv.currency || '').toLowerCase();
      if (pMethod.includes('lbp')) {
        tenderMap['cash_lbp'].usd += invGrand;
        tenderMap['cash_lbp'].lbp += invGrand * exchangeRate;
        tenderMap['cash_lbp'].count += 1;
      } else if (pMethod.includes('account') || pMethod.includes('credit')) {
        tenderMap['on_account'].usd += invGrand;
        tenderMap['on_account'].lbp += invGrand * exchangeRate;
        tenderMap['on_account'].count += 1;
      } else {
        tenderMap['cash_usd'].usd += invGrand;
        tenderMap['cash_usd'].lbp += invGrand * exchangeRate;
        tenderMap['cash_usd'].count += 1;
      }
    }

    // Process line items for Division / Department Breakdown
    if (inv.items && Array.isArray(inv.items)) {
      inv.items.forEach((it: any) => {
        const itemDiv = it.division || it.category || 'Retail';
        const itemTotal = Number(it.total || (it.qty || 1) * (it.unitPrice || 0));
        let matched = false;
        for (const divKey of Object.keys(divisionTotals)) {
          if (itemDiv.toLowerCase().includes(divKey.toLowerCase())) {
            divisionTotals[divKey].amount += itemTotal;
            divisionTotals[divKey].count += (it.qty || 1);
            matched = true;
            break;
          }
        }
        if (!matched) {
          divisionTotals['Other'].amount += itemTotal;
          divisionTotals['Other'].count += (it.qty || 1);
        }
      });
    }
  });

  const netSalesUsd = grossSalesUsd - discountsUsd + taxUsd;
  const finalTurnoverUsd = Math.max(0, netSalesUsd - returnsCreditNotesUsd);

  // Collections array
  const collectionsByTender: TenderCollection[] = Object.keys(tenderMap).map((key) => ({
    method: key,
    label: tenderMap[key].label,
    usd: Number(tenderMap[key].usd.toFixed(2)),
    lbp: Math.round(tenderMap[key].lbp),
    count: tenderMap[key].count
  }));

  // Customer Receipts calculations
  let customerReceiptsTotalUsd = 0;
  let customerReceiptsTotalLbp = 0;
  let cashCustomerReceiptsUsd = 0;
  let cashCustomerReceiptsLbp = 0;
  const receiptsList: Array<{ id: string; customerName: string; method: string; amountUsd: number; date: string }> = [];

  customerReceipts.forEach((rct) => {
    const amt = Number(rct.amount || 0);
    const methodStr = (rct.method || '').toLowerCase();
    customerReceiptsTotalUsd += amt;
    customerReceiptsTotalLbp += amt * exchangeRate;

    if (methodStr.includes('cash')) {
      if (methodStr.includes('lbp')) {
        cashCustomerReceiptsLbp += amt * exchangeRate;
      } else {
        cashCustomerReceiptsUsd += amt;
      }
    }

    receiptsList.push({
      id: rct.id || `RCT-${Math.floor(Math.random() * 10000)}`,
      customerName: rct.customerName || 'Customer',
      method: rct.method || 'Cash USD',
      amountUsd: amt,
      date: rct.date || new Date().toISOString().split('T')[0]
    });
  });

  // Paid In / Paid Out calculations
  let paidInTotalUsd = 0;
  let paidInTotalLbp = 0;
  let paidOutTotalUsd = 0;
  let paidOutTotalLbp = 0;

  paidInOutList.forEach((pio) => {
    const amtUsd = Number(pio.amountUsd || pio.amount || 0);
    const amtLbp = Number(pio.amountLbp || amtUsd * exchangeRate);
    const pType = (pio.type || '').toUpperCase();

    // Ignore opening float in regular paid in total if it was already in opening float
    if (pType === 'PAID_IN' || pType === 'IN') {
      if (pio.category !== 'Opening Float') {
        paidInTotalUsd += amtUsd;
        paidInTotalLbp += amtLbp;
      }
    } else {
      paidOutTotalUsd += amtUsd;
      paidOutTotalLbp += amtLbp;
    }
  });

  // Cash Sales collected in Cash USD and Cash LBP
  const cashSalesUsd = tenderMap['cash_usd'].usd;
  const cashSalesLbp = tenderMap['cash_lbp'].lbp;

  // Expected Drawer Cash Formula:
  // Expected Cash = Opening Float + Cash Sales + Cash Customer Receipts + Paid In - Cash Refunds - Paid Out
  const expectedCashUsd = Number(
    (openingFloatUsd + cashSalesUsd + cashCustomerReceiptsUsd + paidInTotalUsd - cashRefundsUsd - paidOutTotalUsd).toFixed(2)
  );

  const expectedCashLbp = Math.round(
    openingFloatLbp + cashSalesLbp + cashCustomerReceiptsLbp + paidInTotalLbp - cashRefundsLbp - paidOutTotalLbp
  );

  // Reconciliation Variance:
  // Variance = Actual Counted Cash - Expected Cash
  const varianceUsd = Number((actualCountedUsd - expectedCashUsd).toFixed(2));
  const varianceLbp = Math.round(actualCountedLbp - expectedCashLbp);

  let reconciliationStatus: 'BALANCED' | 'SHORTAGE' | 'OVERAGE' = 'BALANCED';
  if (varianceUsd > 0.05 || varianceLbp > 1000) {
    reconciliationStatus = 'OVERAGE';
  } else if (varianceUsd < -0.05 || varianceLbp < -1000) {
    reconciliationStatus = 'SHORTAGE';
  }

  // Division Breakdown calculations
  const totalDivisionsAmount = Object.values(divisionTotals).reduce((sum, d) => sum + d.amount, 0) || 1;
  const divisionBreakdown: DivisionBreakdown[] = Object.keys(divisionTotals)
    .filter((k) => divisionTotals[k].amount > 0 || divisionTotals[k].count > 0 || k === 'Retail' || k === 'Wholesale')
    .map((k) => ({
      division: k,
      amountUsd: Number(divisionTotals[k].amount.toFixed(2)),
      itemCount: divisionTotals[k].count,
      percentage: Number(((divisionTotals[k].amount / totalDivisionsAmount) * 100).toFixed(1))
    }))
    .sort((a, b) => b.amountUsd - a.amountUsd);

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

    actualCountedUsd: Number(actualCountedUsd.toFixed(2)),
    actualCountedLbp: Math.round(actualCountedLbp),
    varianceUsd,
    varianceLbp,
    reconciliationStatus,

    divisionBreakdown
  };
}
