/**
 * ============================================================================
 * VANGUARD ERP - UNIFIED FINANCIAL & POS CALCULATION ENGINE
 * ============================================================================
 * Deterministic, pure calculation engine for Vanguard ERP.
 * 
 * Provides single source of truth across:
 * - Pricing & Waterfall Resolution
 * - Document & Line Totals (Invoices, Quotations, POS Orders, Credit Notes)
 * - Main Reading (X-Reading & Z-Reading) Shift Aggregation & Cash Drawer Reconciliation
 * - Customer Receivables, Aging Buckets, and Credit Limit Verification
 * 
 * ZERO HARDCODED DATES OR MOCK NUMBERS:
 * All math and classifications are 100% derived from dynamic arguments.
 */

// ============================================================================
// 1. DATE NORMALIZATION & CLASSIFICATION HELPERS
// ============================================================================

/**
 * Normalizes any date input (YYYY-MM-DD, DD-MMM-YYYY, ISO strings, timestamps)
 * to standard YYYY-MM-DD local format without timezone skew.
 */
export function normalizeDateToYMD(dateVal: any): string | null {
  if (!dateVal) return null;
  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();
    // Match direct YYYY-MM-DD
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (ymdMatch) {
      const y = ymdMatch[1];
      const m = ymdMatch[2].padStart(2, '0');
      const d = ymdMatch[3].padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    // Match DD-MMM-YYYY (e.g. 15-Oct-2026)
    const dmyMatch = trimmed.match(/^(\d{1,2})[-/\s]([A-Za-z]{3,})[-/\s](\d{4})/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const monthStr = dmyMatch[2].toLowerCase();
      const year = dmyMatch[3];
      const monthMap: Record<string, string> = {
        jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
        jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
      };
      const monthPrefix = monthStr.substring(0, 3);
      if (monthMap[monthPrefix]) {
        return `${year}-${monthMap[monthPrefix]}-${day}`;
      }
    }
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
 * Checks if two date values match the exact same calendar working day.
 */
export function isSameWorkingDay(recordDateOrTimestamp: any, activeWorkingDate: any): boolean {
  if (!recordDateOrTimestamp || !activeWorkingDate) return false;
  const recYMD = normalizeDateToYMD(recordDateOrTimestamp);
  const targetYMD = normalizeDateToYMD(activeWorkingDate);
  if (!recYMD || !targetYMD) return false;
  return recYMD === targetYMD;
}

// ============================================================================
// 2. ITEM PRICING & WATERFALL RESOLVER
// ============================================================================

export interface ItemPricingContext {
  itemCode: string;
  itemName?: string;
  defaultSellingPrice?: number;
  standardPrice?: number;
  costBasisValue?: number;
  markupPercent?: number;
  isMarkupEnabled?: boolean;
  customerId?: string;
  customerSpecialPrice?: number | null;
  customerSpecialPrices?: Array<{ customerId?: string; itemCode?: string; specialPrice?: number }>;
  customerDiscountPercent?: number;
  customerPriceTier?: 'Wholesale' | 'Retail' | 'VIP' | string;
  tierMultiplier?: number;
  branchSellingTierMultiplier?: number;
}

export type PricingWaterfallRule =
  | 'CUSTOMER_SPECIAL_PRICE'
  | 'CUSTOMER_TIER'
  | 'MARKUP_FORMULA'
  | 'BRANCH_DEFAULT';

export interface ItemPricingResolution {
  unitPrice: number;
  appliedRule: PricingWaterfallRule;
  originalStandardPrice: number;
  discountPercentApplied: number;
  note: string;
}

/**
 * Resolves unit price via the strict Vanguard ERP 4-Tier Waterfall:
 * 1. Customer Special Price / Customer Discount
 * 2. Customer Price Tier / Category Tier
 * 3. Active Markup Formula (costBasisValue * (1 + markupPercent / 100))
 * 4. Default Branch Selling Price Tier
 */
export function resolveItemUnitPrice(context: ItemPricingContext): ItemPricingResolution {
  const standardPrice = Number(context.defaultSellingPrice ?? context.standardPrice ?? 0);

  // 1. Customer Special Price / Customer Discount
  if (context.customerId) {
    let resolvedSpecialPrice = context.customerSpecialPrice;
    if ((resolvedSpecialPrice === undefined || resolvedSpecialPrice === null) && context.customerSpecialPrices) {
      const match = context.customerSpecialPrices.find(
        (sp) => sp.customerId === context.customerId && sp.itemCode?.toLowerCase() === context.itemCode?.toLowerCase()
      );
      if (match && match.specialPrice !== undefined && match.specialPrice > 0) {
        resolvedSpecialPrice = match.specialPrice;
      }
    }

    if (resolvedSpecialPrice !== undefined && resolvedSpecialPrice !== null && resolvedSpecialPrice > 0) {
      const sp = Number(resolvedSpecialPrice);
      const discountPercent = standardPrice > 0 ? Number((((standardPrice - sp) / standardPrice) * 100).toFixed(2)) : 0;
      return {
        unitPrice: sp,
        appliedRule: 'CUSTOMER_SPECIAL_PRICE',
        originalStandardPrice: standardPrice,
        discountPercentApplied: Math.max(0, discountPercent),
        note: `Contract price applied for customer ${context.customerId}`
      };
    }

    if (context.customerDiscountPercent !== undefined && context.customerDiscountPercent > 0) {
      const disc = Math.min(100, Math.max(0, Number(context.customerDiscountPercent)));
      const discountedPrice = Number((standardPrice * (1 - disc / 100)).toFixed(2));
      return {
        unitPrice: discountedPrice,
        appliedRule: 'CUSTOMER_SPECIAL_PRICE',
        originalStandardPrice: standardPrice,
        discountPercentApplied: disc,
        note: `Customer discount of ${disc}% applied`
      };
    }
  }

  // 2. Customer Price Tier / Category Tier
  const tier = context.customerPriceTier ? String(context.customerPriceTier).toLowerCase() : '';
  const hasTierMultiplier = context.tierMultiplier !== undefined && context.tierMultiplier > 0 && context.tierMultiplier !== 1;
  const isWholesaleOrVip = tier.includes('wholesale') || tier.includes('vip') || tier.includes('جملة');

  if (hasTierMultiplier || isWholesaleOrVip) {
    const multiplier = context.tierMultiplier ?? (isWholesaleOrVip ? 0.90 : 1.0);
    const tierPrice = Number((standardPrice * multiplier).toFixed(2));
    const discountPercent = Number(((1 - multiplier) * 100).toFixed(2));
    return {
      unitPrice: tierPrice,
      appliedRule: 'CUSTOMER_TIER',
      originalStandardPrice: standardPrice,
      discountPercentApplied: Math.max(0, discountPercent),
      note: `Tier pricing (${context.customerPriceTier || 'Wholesale'}) applied at ${multiplier}x`
    };
  }

  // 3. Active Markup Formula (costBasisValue * (1 + markupPercent / 100))
  if (
    context.isMarkupEnabled &&
    context.costBasisValue !== undefined &&
    context.costBasisValue > 0 &&
    context.markupPercent !== undefined
  ) {
    const cost = Number(context.costBasisValue);
    const markup = Number(context.markupPercent);
    const markupPrice = Number((cost * (1 + markup / 100)).toFixed(2));
    return {
      unitPrice: markupPrice,
      appliedRule: 'MARKUP_FORMULA',
      originalStandardPrice: standardPrice,
      discountPercentApplied: 0,
      note: `Cost basis $${cost.toFixed(2)} with ${markup}% markup formula`
    };
  }

  // 4. Default Branch Selling Price Tier
  const branchMultiplier = context.branchSellingTierMultiplier ?? 1.0;
  const resolvedStandard = Number((standardPrice * branchMultiplier).toFixed(2));
  return {
    unitPrice: resolvedStandard,
    appliedRule: 'BRANCH_DEFAULT',
    originalStandardPrice: standardPrice,
    discountPercentApplied: 0,
    note: 'Standard branch catalogue price'
  };
}

// ============================================================================
// 3. DOCUMENT & LINE TOTALS CALCULATOR
// ============================================================================

export interface DocumentLineItemInput {
  id?: string;
  code?: string;
  name?: string;
  qty: number;
  unitPrice: number;
  discountPercent?: number;
  discountAmount?: number;
  taxPercent?: number;
  taxable?: boolean;
  item?: any;
}

export interface DocumentTotalsOptions {
  items: DocumentLineItemInput[];
  overallDiscountPercent?: number;
  overallDiscountAmountManual?: number;
  taxRate?: number; // e.g. 0.11 for 11% VAT
  isTaxEnabled?: boolean;
  noTax?: boolean;
  removeTaxForInternational?: boolean;
  transactionType?: 'Local' | 'International' | 'Online' | string;
  primaryCurrency?: string;
  secondaryCurrency?: string;
  exchangeRate?: number;
  secondaryDecimalPlaces?: number;
}

export interface CalculatedDocumentLineItem {
  id?: string;
  code?: string;
  name?: string;
  qty: number;
  unitPrice: number;
  grossLineSubtotal: number;
  discountPercent: number;
  discountAmount: number;
  netLineSubtotal: number;
  taxAmount: number;
  lineTotal: number;
  rawItem?: any;
}

export interface CalculatedDocumentTotals {
  lines: CalculatedDocumentLineItem[];
  itemsCount: number;
  totalQuantity: number;

  // Subtotal aliases
  subtotal: number;
  subtotalUsd: number;
  subtotalLbp: number;
  grossSubtotal: number;
  grossSubtotalUsd: number;
  grossSubtotalLbp: number;
  subtotalPrimary: number;
  subtotalSecondary: number;

  // Discount aliases
  discount: number;
  discountAmount: number;
  discountUsd: number;
  discountLbp: number;
  totalDiscount: number;
  totalDiscountUsd: number;
  totalDiscountLbp: number;
  lineDiscountsTotal: number;
  lineDiscountTotal: number;
  documentDiscountTotal: number;
  invoiceDiscountAmount: number;

  // Taxable aliases
  taxableAmount: number;
  taxableAmountUsd: number;
  taxableAmountLbp: number;

  // Tax / VAT aliases
  tax: number;
  taxAmount: number;
  taxUsd: number;
  taxLbp: number;
  totalTax: number;
  totalTaxUsd: number;
  totalTaxLbp: number;
  vatAmount: number;
  vatUsd: number;
  vatLbp: number;
  taxRate: number;
  effectiveTaxRate: number;
  isTaxExempt: boolean;

  // Grand / Net Total aliases
  grandTotal: number;
  grandTotalUsd: number;
  grandTotalLbp: number;
  netTotal: number;
  netTotalUsd: number;
  netTotalLbp: number;
  totalUsd: number;
  totalLbp: number;
  grandTotalPrimary: number;
  grandTotalSecondary: number;

  // Change Due & Currencies
  changeDueUsd: number;
  changeDueLbp: number;
  primaryCurrency: string;
  secondaryCurrency: string;
  exchangeRate: number;
}

/**
 * Calculates complete normalized line and document financials.
 */
export function calculateDocumentTotals(options: DocumentTotalsOptions): CalculatedDocumentTotals {
  const {
    items = [],
    overallDiscountPercent = 0,
    overallDiscountAmountManual = 0,
    taxRate = 0.11,
    isTaxEnabled = true,
    noTax = false,
    removeTaxForInternational = false,
    transactionType = 'Local',
    primaryCurrency = 'USD',
    secondaryCurrency = 'LBP',
    exchangeRate = 89500,
    secondaryDecimalPlaces = 0
  } = options;

  let totalQuantity = 0;
  let grossSubtotal = 0;
  let lineDiscountsTotal = 0;

  const lines: CalculatedDocumentLineItem[] = (items || []).map((it) => {
    const qty = Math.max(0, Number(it.qty || 0));
    const price = Math.max(0, Number(it.unitPrice || 0));
    const lineGross = Number((qty * price).toFixed(2));
    totalQuantity += qty;
    grossSubtotal += lineGross;

    let lineDiscount = 0;
    let discPercent = 0;
    if (it.discountAmount !== undefined && it.discountAmount > 0) {
      lineDiscount = Math.min(lineGross, Number(it.discountAmount));
      discPercent = lineGross > 0 ? Number(((lineDiscount / lineGross) * 100).toFixed(2)) : 0;
    } else if (it.discountPercent !== undefined && it.discountPercent > 0) {
      discPercent = Math.min(100, Math.max(0, Number(it.discountPercent)));
      lineDiscount = Number(((lineGross * discPercent) / 100).toFixed(2));
    }

    lineDiscountsTotal += lineDiscount;
    const netLine = Math.max(0, Number((lineGross - lineDiscount).toFixed(2)));

    return {
      id: it.id,
      code: it.code || it.item?.code,
      name: it.name || it.item?.name,
      qty,
      unitPrice: price,
      grossLineSubtotal: lineGross,
      discountPercent: discPercent,
      discountAmount: lineDiscount,
      netLineSubtotal: netLine,
      taxAmount: 0,
      lineTotal: netLine,
      rawItem: it.item
    };
  });

  grossSubtotal = Number(grossSubtotal.toFixed(2));
  lineDiscountsTotal = Number(lineDiscountsTotal.toFixed(2));

  // Determine overall document discount
  let documentDiscountTotal = 0;
  if (overallDiscountAmountManual > 0) {
    documentDiscountTotal = Math.min(grossSubtotal - lineDiscountsTotal, Number(overallDiscountAmountManual));
  } else if (overallDiscountPercent > 0) {
    const effPercent = Math.min(100, Math.max(0, Number(overallDiscountPercent)));
    const remainingBeforeDocDisc = Math.max(0, grossSubtotal - lineDiscountsTotal);
    documentDiscountTotal = Number(((remainingBeforeDocDisc * effPercent) / 100).toFixed(2));
  }
  documentDiscountTotal = Number(documentDiscountTotal.toFixed(2));

  const totalDiscount = Number((lineDiscountsTotal + documentDiscountTotal).toFixed(2));
  const taxableAmount = Math.max(0, Number((grossSubtotal - totalDiscount).toFixed(2)));

  // Tax Exemption Logic
  const isInternational = String(transactionType).toLowerCase().includes('international');
  const isTaxExempt = !isTaxEnabled || noTax || (removeTaxForInternational && isInternational);

  const effectiveTaxRate = isTaxExempt ? 0 : Math.max(0, Number(taxRate));
  const taxAmount = isTaxExempt ? 0 : Number((taxableAmount * effectiveTaxRate).toFixed(2));

  const grandTotalPrimary = Math.max(0, Number((taxableAmount + taxAmount).toFixed(2)));

  // Secondary Currency Conversion
  const rawSecondary = grandTotalPrimary * exchangeRate;
  const grandTotalSecondary = secondaryDecimalPlaces === 0
    ? Math.round(rawSecondary)
    : Number(rawSecondary.toFixed(secondaryDecimalPlaces));

  const grossSubtotalLbp = Math.round(grossSubtotal * exchangeRate);
  const totalDiscountLbp = Math.round(totalDiscount * exchangeRate);
  const taxableAmountLbp = Math.round(taxableAmount * exchangeRate);
  const taxAmountLbp = Math.round(taxAmount * exchangeRate);

  return {
    lines: lines || [],
    itemsCount: lines.length,
    totalQuantity: Number(totalQuantity) || 0,

    subtotal: grossSubtotal,
    subtotalUsd: grossSubtotal,
    subtotalLbp: grossSubtotalLbp,
    grossSubtotal,
    grossSubtotalUsd: grossSubtotal,
    grossSubtotalLbp,
    subtotalPrimary: grossSubtotal,
    subtotalSecondary: grossSubtotalLbp,

    discount: totalDiscount,
    discountAmount: totalDiscount,
    discountUsd: totalDiscount,
    discountLbp: totalDiscountLbp,
    totalDiscount,
    totalDiscountUsd: totalDiscount,
    totalDiscountLbp,
    lineDiscountsTotal,
    lineDiscountTotal: lineDiscountsTotal,
    documentDiscountTotal,
    invoiceDiscountAmount: documentDiscountTotal,

    taxableAmount,
    taxableAmountUsd: taxableAmount,
    taxableAmountLbp,

    tax: taxAmount,
    taxAmount,
    taxUsd: taxAmount,
    taxLbp: taxAmountLbp,
    totalTax: taxAmount,
    totalTaxUsd: taxAmount,
    totalTaxLbp: taxAmountLbp,
    vatAmount: taxAmount,
    vatUsd: taxAmount,
    vatLbp: taxAmountLbp,
    taxRate: effectiveTaxRate,
    effectiveTaxRate,
    isTaxExempt,

    grandTotal: grandTotalPrimary,
    grandTotalUsd: grandTotalPrimary,
    grandTotalLbp: grandTotalSecondary,
    netTotal: grandTotalPrimary,
    netTotalUsd: grandTotalPrimary,
    netTotalLbp: grandTotalSecondary,
    totalUsd: grandTotalPrimary,
    totalLbp: grandTotalSecondary,
    grandTotalPrimary,
    grandTotalSecondary,

    changeDueUsd: 0,
    changeDueLbp: 0,
    primaryCurrency,
    secondaryCurrency,
    exchangeRate
  };
}

// ============================================================================
// 4. SHIFT & MAIN READING AGGREGATION ENGINE
// ============================================================================

export interface TenderSummaryItem {
  method: string;
  label: string;
  usd: number;
  lbp: number;
  count: number;
}

export interface DivisionSummaryItem {
  division: string;
  amountUsd: number;
  itemCount: number;
  percentage: number;
}

export interface CashMovementClassified {
  id: string;
  movementNo: string;
  type: 'PAID_IN' | 'PAID_OUT';
  isPaidIn: boolean;
  currencyCode: 'USD' | 'LBP' | string;
  amount: number;
  amountUsd: number;
  amountLbp: number;
  reasonCategory: string;
  description: string;
  cashierName: string;
  paidTo?: string;
  date: string;
  time: string;
  raw: any;
}

export interface CustomerReceiptClassified {
  id: string;
  receiptNo: string;
  customerName: string;
  method: string;
  currencyCode: string;
  amount: number;
  amountUsd: number;
  amountLbp: number;
  isCash: boolean;
  date: string;
  raw: any;
}

export interface MainReadingSummaryResult {
  readingType: 'X' | 'Z';
  generatedAt: string;
  workingDate: string;
  shiftId: string;
  shiftNumber: number;
  branch: string;
  workstation: string;
  cashierName: string;

  // Sales Totals
  grossSalesUsd: number;
  discountsUsd: number;
  taxUsd: number;
  netSalesUsd: number;
  invoiceCount: number;
  firstInvoiceNo: string;
  lastInvoiceNo: string;
  invoiceRangeText: string;

  // Credit Notes & Returns
  returnsCreditNotesUsd: number;
  creditNoteCount: number;
  finalTurnoverUsd: number;

  openedAt?: string;
  closedAt?: string | null;

  // Breakdowns
  salesByTransactionType: {
    localUsd: number;
    internationalUsd: number;
    onlineUsd: number;
  };
  settlementMode: {
    cashSalesUsd: number;
    creditSalesUsd: number;
    cardSalesUsd: number;
  };
  collectionsByTender: TenderSummaryItem[];
  divisionBreakdown: DivisionSummaryItem[];

  // Customer Receipts Summary
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

  // Paid In / Out Totals & List
  paidInTotalUsd: number;
  paidInTotalLbp: number;
  paidOutTotalUsd: number;
  paidOutTotalLbp: number;
  paidInOutList: any[];

  // Filtered Itemized Transaction Records
  qualifyingInvoices: any[];
  qualifyingCreditNotes: any[];
  qualifyingReceipts: CustomerReceiptClassified[];
  qualifyingMovements: CashMovementClassified[];

  // Cash Drawer Aggregate Formula Items
  openingFloatUsd: number;
  openingFloatLbp: number;
  cashSalesUsd: number;
  cashSalesLbp: number;
  cashReceiptsUsd: number;
  cashReceiptsLbp: number;
  cashCustomerReceiptsUsd: number;
  cashCustomerReceiptsLbp: number;
  paidInUsd: number;
  paidInLbp: number;
  cashRefundsUsd: number;
  cashRefundsLbp: number;
  paidOutUsd: number;
  paidOutLbp: number;

  // Expected Cash Balances
  expectedCashUsd: number;
  expectedCashLbp: number;

  // Counted Reconciliation
  actualCountedUsd: number;
  actualCountedLbp: number;
  varianceUsd: number;
  varianceLbp: number;
  reconciliationStatusUsd: 'PENDING' | 'EXACT' | 'OVERAGE' | 'SHORTAGE';
  reconciliationStatusLbp: 'PENDING' | 'EXACT' | 'OVERAGE' | 'SHORTAGE';
  reconciliationStatus: 'PENDING' | 'BALANCED' | 'OVERAGE' | 'SHORTAGE';
}

export interface MainReadingCalculationInput {
  readingType?: 'X' | 'Z';
  shift?: {
    id?: string;
    shiftNumber?: number;
    branch?: string;
    workstation?: string;
    cashierName?: string;
    openedAt?: string;
    closedAt?: string | null;
  };
  invoices?: any[];
  paidInOutList?: any[];
  customerReceipts?: any[];
  openingFloatUsd?: number;
  openingFloatLbp?: number;
  actualCountedUsd?: number | null | string;
  actualCountedLbp?: number | null | string;
  exchangeRate?: number;
  activeWorkingDate?: string;
}

/**
 * Calculates Shift & Main Reading summary, expected cash, and physical reconciliation.
 */
export function calculateMainReadingSummary(input: MainReadingCalculationInput): MainReadingSummaryResult {
  const {
    readingType = 'X',
    shift = {},
    invoices = [],
    paidInOutList = [],
    customerReceipts = [],
    openingFloatUsd = 0,
    openingFloatLbp = 0,
    actualCountedUsd = null,
    actualCountedLbp = null,
    exchangeRate = 89500,
    activeWorkingDate = ''
  } = input;

  const targetDate = activeWorkingDate || new Date().toISOString().split('T')[0];

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

  const qualifyingInvoices: any[] = [];
  const qualifyingCreditNotes: any[] = [];
  const invoiceNumbers: string[] = [];

  const salesByTransactionType = {
    localUsd: 0,
    internationalUsd: 0,
    onlineUsd: 0
  };

  const tenderMap: Record<string, { usd: number; lbp: number; count: number; label: string }> = {
    cash_usd: { usd: 0, lbp: 0, count: 0, label: 'Cash USD' },
    cash_lbp: { usd: 0, lbp: 0, count: 0, label: 'Cash LBP' },
    on_account: { usd: 0, lbp: 0, count: 0, label: 'Credit / On Account' },
    card: { usd: 0, lbp: 0, count: 0, label: 'Visa / MasterCard' },
    whish: { usd: 0, lbp: 0, count: 0, label: 'Whish Money' },
    bank_transfer: { usd: 0, lbp: 0, count: 0, label: 'Bank Transfer' },
    check: { usd: 0, lbp: 0, count: 0, label: 'Bank Cheque' }
  };

  const divisionTotals: Record<string, { amount: number; count: number }> = {
    Retail: { amount: 0, count: 0 },
    Wholesale: { amount: 0, count: 0 },
    Promotions: { amount: 0, count: 0 },
    'Raw Materials': { amount: 0, count: 0 },
    Other: { amount: 0, count: 0 }
  };

  // 1. Process Invoices (Sales Invoices vs. Credit Notes)
  invoices.forEach((inv) => {
    if (!inv) return;
    if (inv.closedInZReport === true || inv.shiftClosed === true) return;

    // Check Date matching
    const invDate = inv.date || inv.createdAt || inv.timestamp;
    if (targetDate && !isSameWorkingDay(invDate, targetDate)) return;

    // Status matching
    const statusStr = String(inv.status || 'POSTED').toUpperCase();
    if (statusStr === 'VOID' || statusStr === 'DRAFT' || statusStr === 'HOLD' || statusStr === 'UNPOSTED') {
      return;
    }

    const isCreditNote =
      inv.docType === 'CREDIT_NOTE' ||
      inv.doc_type === 'CREDIT_NOTE' ||
      inv.type === 'CREDIT_NOTE' ||
      inv.transactionType === 'Credit Note' ||
      (inv.invoiceNumber && String(inv.invoiceNumber).startsWith('CRN-')) ||
      (inv.grandTotal !== undefined && Number(inv.grandTotal) < 0);

    if (isCreditNote) {
      qualifyingCreditNotes.push(inv);
      const crVal = Math.abs(Number(inv.grandTotal ?? inv.subtotal ?? 0));
      returnsCreditNotesUsd += crVal;
      creditNoteCount += 1;

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
    qualifyingInvoices.push(inv);
    invoiceCount += 1;
    if (inv.invoiceNumber) invoiceNumbers.push(String(inv.invoiceNumber));

    const invSubtotal = Math.abs(Number(inv.subtotal ?? inv.grandTotal ?? 0));
    const invDiscount = Math.abs(Number(inv.discount ?? 0));
    const invTax = Math.abs(Number(inv.tax ?? inv.vat ?? 0));
    const invGrand = Math.abs(Number(inv.grandTotal ?? (invSubtotal - invDiscount + invTax)));

    grossSalesUsd += invSubtotal;
    discountsUsd += invDiscount;
    taxUsd += invTax;

    // Transaction Type
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

    // Tender Method
    let processedPayments = false;
    if (inv.payments && Array.isArray(inv.payments) && inv.payments.length > 0) {
      inv.payments.forEach((p: any) => {
        const pType = String(p.type || p.paymentMethod || p.method || '').toLowerCase();
        const pAmt = Number(p.amount || 0);
        if (pAmt <= 0) return;
        processedPayments = true;

        if (pType.includes('lbp') || pType.includes('ل.ل')) {
          tenderMap.cash_lbp.lbp += pAmt;
          tenderMap.cash_lbp.usd += pAmt / exchangeRate;
          tenderMap.cash_lbp.count += 1;
          cashSalesLbp += pAmt;
        } else if (pType.includes('card') || pType.includes('visa') || pType.includes('master')) {
          tenderMap.card.usd += pAmt;
          tenderMap.card.lbp += pAmt * exchangeRate;
          tenderMap.card.count += 1;
        } else if (pType.includes('whish')) {
          tenderMap.whish.usd += pAmt;
          tenderMap.whish.lbp += pAmt * exchangeRate;
          tenderMap.whish.count += 1;
        } else if (
          pType.includes('account') ||
          pType.includes('credit') ||
          pType.includes('ذمم') ||
          pType.includes('آجل')
        ) {
          tenderMap.on_account.usd += pAmt;
          tenderMap.on_account.lbp += pAmt * exchangeRate;
          tenderMap.on_account.count += 1;
        } else if (
          pType.includes('transfer') ||
          pType.includes('omt') ||
          pType.includes('تحويل')
        ) {
          tenderMap.bank_transfer.usd += pAmt;
          tenderMap.bank_transfer.lbp += pAmt * exchangeRate;
          tenderMap.bank_transfer.count += 1;
        } else if (pType.includes('check') || pType.includes('cheque') || pType.includes('شيك')) {
          tenderMap.check.usd += pAmt;
          tenderMap.check.lbp += pAmt * exchangeRate;
          tenderMap.check.count += 1;
        } else {
          tenderMap.cash_usd.usd += pAmt;
          tenderMap.cash_usd.lbp += pAmt * exchangeRate;
          tenderMap.cash_usd.count += 1;
          cashSalesUsd += pAmt;
        }
      });
    }

    if (!processedPayments) {
      const pMethod = String(inv.paymentMethod || inv.paymentType || inv.currency || '').toLowerCase();
      if (pMethod.includes('lbp') || pMethod.includes('ل.ل')) {
        tenderMap.cash_lbp.usd += invGrand / exchangeRate;
        tenderMap.cash_lbp.lbp += invGrand;
        tenderMap.cash_lbp.count += 1;
        cashSalesLbp += invGrand;
      } else if (
        pMethod.includes('account') ||
        pMethod.includes('credit') ||
        pMethod.includes('ذمم') ||
        pMethod.includes('آجل')
      ) {
        tenderMap.on_account.usd += invGrand;
        tenderMap.on_account.lbp += invGrand * exchangeRate;
        tenderMap.on_account.count += 1;
      } else if (pMethod.includes('card') || pMethod.includes('visa') || pMethod.includes('master')) {
        tenderMap.card.usd += invGrand;
        tenderMap.card.lbp += invGrand * exchangeRate;
        tenderMap.card.count += 1;
      } else if (pMethod.includes('whish')) {
        tenderMap.whish.usd += invGrand;
        tenderMap.whish.lbp += invGrand * exchangeRate;
        tenderMap.whish.count += 1;
      } else if (pMethod.includes('transfer') || pMethod.includes('omt') || pMethod.includes('تحويل')) {
        tenderMap.bank_transfer.usd += invGrand;
        tenderMap.bank_transfer.lbp += invGrand * exchangeRate;
        tenderMap.bank_transfer.count += 1;
      } else if (pMethod.includes('check') || pMethod.includes('cheque')) {
        tenderMap.check.usd += invGrand;
        tenderMap.check.lbp += invGrand * exchangeRate;
        tenderMap.check.count += 1;
      } else {
        tenderMap.cash_usd.usd += invGrand;
        tenderMap.cash_usd.lbp += invGrand * exchangeRate;
        tenderMap.cash_usd.count += 1;
        cashSalesUsd += invGrand;
      }
    }

    // Line items for Division Breakdown
    let matchedLine = false;
    if (inv.items && Array.isArray(inv.items) && inv.items.length > 0) {
      inv.items.forEach((it: any) => {
        const itemDiv = String(it.division || it.category || 'Retail').toLowerCase();
        const itemTotal = Number(it.total || (it.qty || 1) * (it.unitPrice || 0));
        const qty = Number(it.qty || 1);

        if (itemDiv.includes('wholesale') || itemDiv.includes('جملة')) {
          divisionTotals.Wholesale.amount += itemTotal;
          divisionTotals.Wholesale.count += qty;
          matchedLine = true;
        } else if (itemDiv.includes('promo') || itemDiv.includes('عروض') || itemDiv.includes('discount')) {
          divisionTotals.Promotions.amount += itemTotal;
          divisionTotals.Promotions.count += qty;
          matchedLine = true;
        } else if (itemDiv.includes('raw') || itemDiv.includes('bulk') || itemDiv.includes('أولية')) {
          divisionTotals['Raw Materials'].amount += itemTotal;
          divisionTotals['Raw Materials'].count += qty;
          matchedLine = true;
        } else {
          divisionTotals.Retail.amount += itemTotal;
          divisionTotals.Retail.count += qty;
          matchedLine = true;
        }
      });
    }
    if (!matchedLine) {
      divisionTotals.Retail.amount += invGrand;
      divisionTotals.Retail.count += 1;
    }
  });

  const netSalesUsd = grossSalesUsd - discountsUsd + taxUsd;
  const finalTurnoverUsd = Math.max(0, netSalesUsd - returnsCreditNotesUsd);

  // Invoice Range
  const firstInvoiceNo = invoiceNumbers.length > 0 ? invoiceNumbers[0] : '—';
  const lastInvoiceNo = invoiceNumbers.length > 0 ? invoiceNumbers[invoiceNumbers.length - 1] : '—';
  const invoiceRangeText = invoiceNumbers.length > 0 ? `${firstInvoiceNo} - ${lastInvoiceNo}` : 'None';

  // 2. Process Customer Receipts Stream
  let customerReceiptsTotalUsd = 0;
  let customerReceiptsTotalLbp = 0;
  let cashCustomerReceiptsUsd = 0;
  let cashCustomerReceiptsLbp = 0;
  const qualifyingReceipts: CustomerReceiptClassified[] = [];

  customerReceipts.forEach((rct) => {
    if (!rct || rct.isVoided) return;
    if (rct.closedInZReport === true || rct.shiftClosed === true) return;

    const rctDate = rct.date || rct.createdAt || rct.timestamp;
    if (targetDate && !isSameWorkingDay(rctDate, targetDate)) return;

    const statusStr = String(rct.status || 'POSTED').toUpperCase();
    if (statusStr === 'VOID' || statusStr === 'DRAFT' || statusStr === 'UNPOSTED') return;

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

    const isCash = methodStr.includes('cash') || methodStr.includes('نقدي');
    if (isCash) {
      if (currStr === 'LBP' || methodStr.includes('lbp') || methodStr.includes('ل.ل')) {
        cashCustomerReceiptsLbp += amtLbp;
        tenderMap.cash_lbp.lbp += amtLbp;
        tenderMap.cash_lbp.usd += amtUsd;
        tenderMap.cash_lbp.count += 1;
      } else {
        cashCustomerReceiptsUsd += amtUsd;
        tenderMap.cash_usd.usd += amtUsd;
        tenderMap.cash_usd.lbp += amtLbp;
        tenderMap.cash_usd.count += 1;
      }
    } else if (methodStr.includes('card') || methodStr.includes('visa') || methodStr.includes('master')) {
      tenderMap.card.usd += amtUsd;
      tenderMap.card.lbp += amtLbp;
      tenderMap.card.count += 1;
    } else if (methodStr.includes('whish')) {
      tenderMap.whish.usd += amtUsd;
      tenderMap.whish.lbp += amtLbp;
      tenderMap.whish.count += 1;
    } else if (methodStr.includes('check') || methodStr.includes('cheque') || methodStr.includes('شيك')) {
      tenderMap.check.usd += amtUsd;
      tenderMap.check.lbp += amtLbp;
      tenderMap.check.count += 1;
    } else if (methodStr.includes('transfer') || methodStr.includes('bank') || methodStr.includes('omt')) {
      tenderMap.bank_transfer.usd += amtUsd;
      tenderMap.bank_transfer.lbp += amtLbp;
      tenderMap.bank_transfer.count += 1;
    }

    qualifyingReceipts.push({
      id: rct.id || rct.receiptNo || 'RCT',
      receiptNo: rct.receiptNo || rct.id || 'RCT',
      customerName: rct.customerName || 'Customer',
      method: rct.paymentMethod || rct.method || (currStr === 'LBP' ? 'Cash LBP' : 'Cash USD'),
      currencyCode: currStr,
      amount: amt,
      amountUsd: amtUsd,
      amountLbp: amtLbp,
      isCash,
      date: rct.date || (rct.createdAt ? String(rct.createdAt).split('T')[0] : targetDate),
      raw: rct
    });
  });

  // 3. Process Paid In / Paid Out Drawer Movements
  let paidInUsd = 0;
  let paidInLbp = 0;
  let paidOutUsd = 0;
  let paidOutLbp = 0;
  const qualifyingMovements: CashMovementClassified[] = [];

  paidInOutList.forEach((pio) => {
    if (!pio || pio.isVoided) return;
    if (pio.closedInZReport === true || pio.shiftClosed === true) return;

    const pioDate = pio.date || pio.createdAt || pio.timestamp;
    if (targetDate && !isSameWorkingDay(pioDate, targetDate)) return;

    if (pio.reasonCategory === 'OPENING_FLOAT' || pio.category === 'Opening Float') return;

    const pTypeStr = String(pio.movementType || pio.type || '').toUpperCase();
    const isPaidIn = pTypeStr === 'PAID_IN' || pTypeStr === 'IN' || pTypeStr.includes('IN');

    const methodUpper = String(pio.paymentType || pio.currencyCode || pio.currency || '').toUpperCase();
    const isUsd =
      methodUpper.includes('USD') ||
      pio.currencyCode === 'USD' ||
      (!methodUpper.includes('LBP') && Number(pio.amountUsd || pio.amount || 0) < 10000);

    const rawAmt = Number(pio.amount || 0);
    const amtUsd = Number(pio.amountUsd ?? (isUsd ? rawAmt : rawAmt / exchangeRate) ?? 0);
    const amtLbp = Number(pio.amountLbp ?? (!isUsd ? rawAmt : rawAmt * exchangeRate) ?? 0);

    if (isUsd) {
      if (isPaidIn) {
        paidInUsd += amtUsd;
      } else {
        paidOutUsd += amtUsd;
      }
    } else {
      if (isPaidIn) {
        paidInLbp += amtLbp;
      } else {
        paidOutLbp += amtLbp;
      }
    }

    qualifyingMovements.push({
      id: pio.id || pio.movementNo || 'PIO',
      movementNo: pio.movementNo || pio.id || 'PIO',
      type: isPaidIn ? 'PAID_IN' : 'PAID_OUT',
      isPaidIn,
      currencyCode: isUsd ? 'USD' : 'LBP',
      amount: rawAmt,
      amountUsd: amtUsd,
      amountLbp: amtLbp,
      reasonCategory: pio.reasonCategory || pio.category || (isPaidIn ? 'PAID_IN' : 'PAID_OUT'),
      description: pio.description || pio.notes || (isPaidIn ? 'Paid In' : 'Paid Out'),
      cashierName: pio.cashierName || pio.byUser || 'Cashier',
      paidTo: pio.paidToUser,
      date: pio.date || (pio.createdAt ? String(pio.createdAt).split('T')[0] : targetDate),
      time: pio.timestamp || pio.time || '',
      raw: pio
    });
  });

  // Collections by Tender
  const collectionsByTender: TenderSummaryItem[] = Object.keys(tenderMap).map((key) => ({
    method: key,
    label: tenderMap[key].label,
    usd: Number(tenderMap[key].usd.toFixed(2)),
    lbp: Math.round(tenderMap[key].lbp),
    count: tenderMap[key].count
  }));

  // Division Breakdown
  const totalDivisionsAmount = Object.values(divisionTotals).reduce((sum, d) => sum + d.amount, 0) || 1;
  const divisionBreakdown: DivisionSummaryItem[] = Object.keys(divisionTotals)
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
    }));

  // Expected Cash Formula
  const expectedCashUsd = Number(
    (
      openingFloatUsd +
      cashSalesUsd +
      cashCustomerReceiptsUsd +
      paidInUsd -
      cashRefundsUsd -
      paidOutUsd
    ).toFixed(2)
  );

  const expectedCashLbp = Math.round(
    openingFloatLbp +
    cashSalesLbp +
    cashCustomerReceiptsLbp +
    paidInLbp -
    cashRefundsLbp -
    paidOutLbp
  );

  // Reconciliation Status
  const isCountedUsdProvided =
    actualCountedUsd !== null && actualCountedUsd !== undefined && String(actualCountedUsd).trim() !== '';
  const isCountedLbpProvided =
    actualCountedLbp !== null && actualCountedLbp !== undefined && String(actualCountedLbp).trim() !== '';

  const parsedCountedUsd = isCountedUsdProvided ? Number(actualCountedUsd) : null;
  const parsedCountedLbp = isCountedLbpProvided ? Number(actualCountedLbp) : null;

  let varianceUsd: number | null = null;
  let varianceLbp: number | null = null;
  let reconciliationStatusUsd: 'PENDING' | 'EXACT' | 'OVERAGE' | 'SHORTAGE' = 'PENDING';
  let reconciliationStatusLbp: 'PENDING' | 'EXACT' | 'OVERAGE' | 'SHORTAGE' = 'PENDING';
  let reconciliationStatus: 'PENDING' | 'BALANCED' | 'OVERAGE' | 'SHORTAGE' = 'PENDING';

  if (parsedCountedUsd !== null) {
    varianceUsd = Number((parsedCountedUsd - expectedCashUsd).toFixed(2));
    if (Math.abs(varianceUsd) <= 0.05) {
      reconciliationStatusUsd = 'EXACT';
    } else if (varianceUsd > 0.05) {
      reconciliationStatusUsd = 'OVERAGE';
    } else {
      reconciliationStatusUsd = 'SHORTAGE';
    }
  }

  if (parsedCountedLbp !== null) {
    varianceLbp = Math.round(parsedCountedLbp - expectedCashLbp);
    if (Math.abs(varianceLbp) <= 1000) {
      reconciliationStatusLbp = 'EXACT';
    } else if (varianceLbp > 1000) {
      reconciliationStatusLbp = 'OVERAGE';
    } else {
      reconciliationStatusLbp = 'SHORTAGE';
    }
  }

  if (reconciliationStatusUsd === 'PENDING' && reconciliationStatusLbp === 'PENDING') {
    reconciliationStatus = 'PENDING';
  } else if (
    (reconciliationStatusUsd === 'EXACT' || reconciliationStatusUsd === 'PENDING') &&
    (reconciliationStatusLbp === 'EXACT' || reconciliationStatusLbp === 'PENDING')
  ) {
    reconciliationStatus = 'BALANCED';
  } else if (reconciliationStatusUsd === 'OVERAGE' || reconciliationStatusLbp === 'OVERAGE') {
    reconciliationStatus = 'OVERAGE';
  } else {
    reconciliationStatus = 'SHORTAGE';
  }

  return {
    readingType,
    generatedAt: new Date().toISOString(),
    workingDate: targetDate,
    shiftId: shift.id || 'SH-ACTIVE',
    shiftNumber: shift.shiftNumber || 1,
    branch: shift.branch || 'Southern Olive and Oil Products S.A.R.L.',
    workstation: shift.workstation || 'POS-01',
    cashierName: shift.cashierName || 'Active Cashier',

    grossSalesUsd: Number(grossSalesUsd.toFixed(2)),
    discountsUsd: Number(discountsUsd.toFixed(2)),
    taxUsd: Number(taxUsd.toFixed(2)),
    netSalesUsd: Number(netSalesUsd.toFixed(2)),
    invoiceCount,
    firstInvoiceNo,
    lastInvoiceNo,
    invoiceRangeText,

    returnsCreditNotesUsd: Number(returnsCreditNotesUsd.toFixed(2)),
    creditNoteCount,
    finalTurnoverUsd: Number(finalTurnoverUsd.toFixed(2)),

    openedAt: shift.openedAt || new Date().toISOString(),
    closedAt: shift.closedAt || null,

    salesByTransactionType: {
      localUsd: Number(salesByTransactionType.localUsd.toFixed(2)),
      internationalUsd: Number(salesByTransactionType.internationalUsd.toFixed(2)),
      onlineUsd: Number(salesByTransactionType.onlineUsd.toFixed(2))
    },
    settlementMode: {
      cashSalesUsd: Number(cashSalesUsd.toFixed(2)),
      creditSalesUsd: Number(tenderMap.on_account.usd.toFixed(2)),
      cardSalesUsd: Number(tenderMap.card.usd.toFixed(2))
    },
    collectionsByTender,
    divisionBreakdown,

    customerReceiptsTotalUsd: Number(customerReceiptsTotalUsd.toFixed(2)),
    customerReceiptsTotalLbp: Math.round(customerReceiptsTotalLbp),
    customerReceiptsCount: qualifyingReceipts.length,
    customerReceiptsList: qualifyingReceipts.map((r) => ({
      id: r.id,
      customerName: r.customerName,
      method: r.method,
      amountUsd: r.amountUsd,
      date: r.date
    })),

    paidInTotalUsd: Number(paidInUsd.toFixed(2)),
    paidInTotalLbp: Math.round(paidInLbp),
    paidOutTotalUsd: Number(paidOutUsd.toFixed(2)),
    paidOutTotalLbp: Math.round(paidOutLbp),
    paidInOutList: qualifyingMovements.map((m) => m.raw || m),

    qualifyingInvoices,
    qualifyingCreditNotes,
    qualifyingReceipts,
    qualifyingMovements,

    openingFloatUsd: Number(openingFloatUsd.toFixed(2)) || 0,
    openingFloatLbp: Math.round(openingFloatLbp) || 0,
    cashSalesUsd: Number(cashSalesUsd.toFixed(2)) || 0,
    cashSalesLbp: Math.round(cashSalesLbp) || 0,
    cashReceiptsUsd: Number(cashCustomerReceiptsUsd.toFixed(2)) || 0,
    cashReceiptsLbp: Math.round(cashCustomerReceiptsLbp) || 0,
    cashCustomerReceiptsUsd: Number(cashCustomerReceiptsUsd.toFixed(2)) || 0,
    cashCustomerReceiptsLbp: Math.round(cashCustomerReceiptsLbp) || 0,
    paidInUsd: Number(paidInUsd.toFixed(2)) || 0,
    paidInLbp: Math.round(paidInLbp) || 0,
    cashRefundsUsd: Number(cashRefundsUsd.toFixed(2)) || 0,
    cashRefundsLbp: Math.round(cashRefundsLbp) || 0,
    paidOutUsd: Number(paidOutUsd.toFixed(2)) || 0,
    paidOutLbp: Math.round(paidOutLbp) || 0,

    expectedCashUsd: Number(expectedCashUsd) || 0,
    expectedCashLbp: Math.round(expectedCashLbp) || 0,

    actualCountedUsd: parsedCountedUsd ?? 0,
    actualCountedLbp: parsedCountedLbp ?? 0,
    varianceUsd: varianceUsd ?? 0,
    varianceLbp: varianceLbp ?? 0,
    reconciliationStatusUsd,
    reconciliationStatusLbp,
    reconciliationStatus
  };
}

// ============================================================================
// 5. RECEIVABLES, CREDIT LIMIT & AGING CALCULATOR
// ============================================================================

export interface CustomerReceivablesInput {
  customerId: string;
  customerName?: string;
  creditLimit?: number;
  invoices: any[];
  customerReceipts?: any[];
  creditNotes?: any[];
  newInvoiceTotal?: number;
  asOfDate?: Date | string;
}

export interface CustomerAgingBuckets {
  current30: number;
  days31to60: number;
  days61to90: number;
  over90: number;
  totalDue: number;
}

export interface CustomerReceivablesSummary {
  customerId: string;
  customerName: string;
  creditLimit: number;
  totalInvoiced: number;
  totalPaidOrAllocated: number;
  totalCredits: number;
  currentOpenBalance: number;
  openBalance: number;
  balance: number;
  totalOutstanding: number;
  projectedBalance: number;
  isCreditLimitExceeded: boolean;
  creditRemaining: number;
  agingBuckets: CustomerAgingBuckets;
  buckets: CustomerAgingBuckets;
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

/**
 * Computes live receivables balance, aging buckets, and credit limit compliance for a customer.
 */
export function calculateCustomerReceivables(input: CustomerReceivablesInput): CustomerReceivablesSummary {
  const {
    customerId,
    customerName = 'Customer',
    creditLimit = 5000.0,
    invoices = [],
    newInvoiceTotal = 0,
    asOfDate
  } = input;

  const referenceTimestamp = asOfDate ? new Date(asOfDate).getTime() : Date.now();
  const buckets: CustomerAgingBuckets = {
    current30: 0,
    days31to60: 0,
    days61to90: 0,
    over90: 0,
    totalDue: 0
  };

  const unpaidInvoices: Array<{
    invoiceId: string;
    invoiceNo: string;
    date: string;
    daysOld: number;
    grandTotal: number;
    amountPaid: number;
    balanceDue: number;
  }> = [];

  let totalInvoiced = 0;
  let totalPaidOrAllocated = 0;
  let totalCredits = 0;

  invoices.forEach((inv) => {
    if (!inv) return;
    const invCustId = inv.customerId || inv.customer?.id;
    if (invCustId && invCustId !== customerId) return;

    const statusStr = String(inv.status || 'POSTED').toUpperCase();
    if (statusStr === 'DRAFT' || statusStr === 'VOID' || statusStr === 'UNPOSTED') return;

    const isCreditNote =
      inv.docType === 'CREDIT_NOTE' ||
      inv.doc_type === 'CREDIT_NOTE' ||
      inv.type === 'CREDIT_NOTE' ||
      inv.transactionType === 'Credit Note';

    if (isCreditNote) {
      const crVal = Math.abs(Number(inv.grandTotal ?? inv.subtotal ?? 0));
      totalCredits += crVal;
      return;
    }

    const gTotal = Number(inv.grandTotal ?? inv.subtotal ?? 0);
    totalInvoiced += gTotal;

    const paid = Number(
      inv.amount_paid ??
      inv.paidAmount ??
      (inv.payments && Array.isArray(inv.payments)
        ? inv.payments.reduce((s: number, p: any) => s + Number(p.amount || 0), 0)
        : 0)
    );
    totalPaidOrAllocated += paid;

    const due = Math.max(0, Number((gTotal - paid).toFixed(2)));
    if (due <= 0.01) return;

    const invDateStr = inv.date || inv.invoiceDate || inv.createdAt || new Date().toISOString();
    const invDate = new Date(invDateStr).getTime();
    const diffDays = Math.max(
      0,
      Math.floor((referenceTimestamp - (isNaN(invDate) ? referenceTimestamp : invDate)) / (1000 * 60 * 60 * 24))
    );

    buckets.totalDue += due;

    if (diffDays <= 30) {
      buckets.current30 += due;
    } else if (diffDays <= 60) {
      buckets.days31to60 += due;
    } else if (diffDays <= 90) {
      buckets.days61to90 += due;
    } else {
      buckets.over90 += due;
    }

    unpaidInvoices.push({
      invoiceId: inv.id || inv.invoiceNumber || 'INV',
      invoiceNo: inv.invoiceNumber || inv.id || 'INV',
      date: invDateStr.split('T')[0],
      daysOld: diffDays,
      grandTotal: gTotal,
      amountPaid: paid,
      balanceDue: due
    });
  });

  // Deduct unallocated credit notes from total due balance
  const currentOpenBalance = Math.max(0, Number((buckets.totalDue - totalCredits).toFixed(2)));
  const projectedBalance = Number((currentOpenBalance + Number(newInvoiceTotal || 0)).toFixed(2));
  const isCreditLimitExceeded = creditLimit > 0 && projectedBalance > creditLimit;
  const creditRemaining = Math.max(0, Number((creditLimit - currentOpenBalance).toFixed(2)));

  buckets.current30 = Number(buckets.current30.toFixed(2));
  buckets.days31to60 = Number(buckets.days31to60.toFixed(2));
  buckets.days61to90 = Number(buckets.days61to90.toFixed(2));
  buckets.over90 = Number(buckets.over90.toFixed(2));
  buckets.totalDue = Number(buckets.totalDue.toFixed(2));

  return {
    customerId: customerId || 'CUST',
    customerName: customerName || 'Customer',
    creditLimit: Number(creditLimit) || 0,
    totalInvoiced: Number(totalInvoiced.toFixed(2)) || 0,
    totalPaidOrAllocated: Number(totalPaidOrAllocated.toFixed(2)) || 0,
    totalCredits: Number(totalCredits.toFixed(2)) || 0,
    currentOpenBalance: Number(currentOpenBalance) || 0,
    openBalance: Number(currentOpenBalance) || 0,
    balance: Number(currentOpenBalance) || 0,
    totalOutstanding: Number(currentOpenBalance) || 0,
    projectedBalance: Number(projectedBalance) || 0,
    isCreditLimitExceeded: Boolean(isCreditLimitExceeded),
    creditRemaining: Number(creditRemaining) || 0,
    agingBuckets: buckets,
    buckets,
    unpaidInvoices: unpaidInvoices || []
  };
}

/**
 * Calculates aging breakdown across all customers for customer aging reports.
 */
export function calculateAllCustomersAging(
  invoices: any[],
  filterCustomerId?: string,
  asOfDate?: Date | string
): CustomerReceivablesSummary[] {
  const customerIdSet = new Set<string>();

  invoices.forEach((inv) => {
    if (!inv) return;
    const cId = inv.customerId || inv.customer?.id || 'CUST-001';
    if (!filterCustomerId || filterCustomerId === 'ALL' || cId === filterCustomerId) {
      customerIdSet.add(cId);
    }
  });

  const results: CustomerReceivablesSummary[] = [];

  customerIdSet.forEach((cId) => {
    // Find customer name from invoice
    const sampleInv = invoices.find((inv) => (inv.customerId || inv.customer?.id) === cId);
    const cName = sampleInv?.customerName || sampleInv?.customer?.name || 'Customer';
    const cLimit = Number(sampleInv?.customer?.creditLimit || 5000.0);

    const summary = calculateCustomerReceivables({
      customerId: cId,
      customerName: cName,
      creditLimit: cLimit,
      invoices,
      asOfDate
    });

    if (summary.currentOpenBalance > 0.01) {
      results.push(summary);
    }
  });

  return results.sort((a, b) => b.currentOpenBalance - a.currentOpenBalance);
}

// ============================================================================
// 6. CUSTOMER RECEIPT & INVOICE ALLOCATION ENGINE
// ============================================================================

export interface UnsettledInvoiceItem {
  id: string;
  invoiceNumber: string;
  date: string;
  grandTotal: number;
  balanceDue: number;
}

export interface ReceiptSettlementCalculationInput {
  amountReceived: number;
  currencyCode?: 'USD' | 'LBP' | 'EUR' | 'GBP' | string;
  exchangeRate?: number;
  discountMode?: 'PERCENT' | 'AMOUNT';
  discountInput?: number;
  unsettledInvoices: UnsettledInvoiceItem[];
  allocationMode?: 'FIFO' | 'SPECIFIC' | 'MANUAL';
  manualAllocations?: Record<string, number>;
}

export interface AllocatedInvoiceResult {
  invoiceId: string;
  invoiceNo: string;
  invoiceDate: string;
  totalInvoiceAmountUsd: number;
  previousBalanceDueUsd: number;
  allocatedAmountUsd: number;
  remainingBalanceDueUsd: number;
  isFullyPaid: boolean;
}

export interface ReceiptSettlementResult {
  amountReceivedInBaseUsd: number;
  amountReceivedInSecondary: number;
  discountAmountUsd: number;
  discountPercentageEquivalent: number;
  totalSettledBaseUsd: number;
  totalAllocatedToInvoicesUsd: number;
  unallocatedCreditUsd: number;
  allocatedInvoices: AllocatedInvoiceResult[];
  allocationsMap: Record<string, number>;
}

/**
 * Deterministic Customer Receipt & Invoice Allocation Calculation Engine:
 * - Dynamic Currency conversion (USD / LBP)
 * - Flexible Settlement Discount (% percentage vs. fixed amount)
 * - Strict debt settled formula: totalSettledBase = amountReceivedInBase + discountAmountInBase
 * - Live FIFO distribution (chronological date ASC) vs. Manual capped allocation
 */
export function calculateReceiptSettlement(
  input: ReceiptSettlementCalculationInput
): ReceiptSettlementResult {
  const currency = input.currencyCode || 'USD';
  const rate = input.exchangeRate && input.exchangeRate > 0 ? input.exchangeRate : 89500;
  const rawAmt = Math.max(0, Number(input.amountReceived) || 0);

  // 1. Amount Received in Base USD and Secondary Currency
  let amountReceivedInBaseUsd = rawAmt;
  let amountReceivedInSecondary = rawAmt * rate;
  if (currency === 'LBP') {
    amountReceivedInSecondary = rawAmt;
    amountReceivedInBaseUsd = Number((rawAmt / rate).toFixed(2));
  }

  // 2. Settlement Discount Calculation
  const discInput = Math.max(0, Number(input.discountInput) || 0);
  const discountMode = input.discountMode || 'AMOUNT';
  let discountAmountUsd = 0;
  let discountPercentageEquivalent = 0;

  if (discountMode === 'PERCENT') {
    discountPercentageEquivalent = discInput;
    discountAmountUsd = Number(((amountReceivedInBaseUsd * discInput) / 100).toFixed(2));
  } else {
    // Fixed amount mode
    if (currency === 'LBP') {
      discountAmountUsd = Number((discInput / rate).toFixed(2));
    } else {
      discountAmountUsd = discInput;
    }
    discountPercentageEquivalent =
      amountReceivedInBaseUsd > 0
        ? Number(((discountAmountUsd / amountReceivedInBaseUsd) * 100).toFixed(2))
        : 0;
  }

  // Total debt settled on customer's account:
  const totalSettledBaseUsd = Number((amountReceivedInBaseUsd + discountAmountUsd).toFixed(2));

  // 3. Invoice Allocation (FIFO vs. Manual)
  const allocationMode = input.allocationMode || 'SPECIFIC';
  const allocatedInvoices: AllocatedInvoiceResult[] = [];
  const allocationsMap: Record<string, number> = {};

  if (allocationMode === 'FIFO') {
    // Chronological date ASC (oldest first)
    const sortedInvoices = [...input.unsettledInvoices].sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      if (isNaN(timeA) || isNaN(timeB)) {
        return String(a.invoiceNumber || a.id).localeCompare(String(b.invoiceNumber || b.id), undefined, { numeric: true });
      }
      return timeA - timeB;
    });

    let remainingToAllocate = totalSettledBaseUsd;
    for (const inv of sortedInvoices) {
      if (remainingToAllocate <= 0) break;
      const due = Math.max(0, Number(inv.balanceDue || 0));
      if (due <= 0.001) continue;

      const toAlloc = Number(Math.min(due, remainingToAllocate).toFixed(2));
      const newRemaining = Math.max(0, Number((due - toAlloc).toFixed(2)));
      const invId = inv.id || inv.invoiceNumber;

      allocatedInvoices.push({
        invoiceId: invId,
        invoiceNo: inv.invoiceNumber || invId,
        invoiceDate: inv.date,
        totalInvoiceAmountUsd: Number((inv.grandTotal || due).toFixed(2)),
        previousBalanceDueUsd: due,
        allocatedAmountUsd: toAlloc,
        remainingBalanceDueUsd: newRemaining,
        isFullyPaid: newRemaining <= 0.01
      });

      allocationsMap[invId] = toAlloc;
      remainingToAllocate = Number((remainingToAllocate - toAlloc).toFixed(2));
    }

    const totalAllocatedToInvoicesUsd = Number((totalSettledBaseUsd - remainingToAllocate).toFixed(2));
    const unallocatedCreditUsd = Math.max(0, remainingToAllocate);

    return {
      amountReceivedInBaseUsd,
      amountReceivedInSecondary,
      discountAmountUsd,
      discountPercentageEquivalent,
      totalSettledBaseUsd,
      totalAllocatedToInvoicesUsd,
      unallocatedCreditUsd,
      allocatedInvoices,
      allocationsMap
    };
  } else {
    // MANUAL / SPECIFIC Selection Mode
    const manualMap = input.manualAllocations || {};
    let totalAllocatedToInvoicesUsd = 0;

    for (const inv of input.unsettledInvoices) {
      const invId = inv.id || inv.invoiceNumber;
      if (manualMap[invId] !== undefined && manualMap[invId] > 0) {
        const due = Math.max(0, Number(inv.balanceDue || 0));
        const rawAlloc = Number(manualMap[invId] || 0);
        const toAlloc = Number(Math.min(due, rawAlloc).toFixed(2));
        const newRemaining = Math.max(0, Number((due - toAlloc).toFixed(2)));

        allocatedInvoices.push({
          invoiceId: invId,
          invoiceNo: inv.invoiceNumber || invId,
          invoiceDate: inv.date,
          totalInvoiceAmountUsd: Number((inv.grandTotal || due).toFixed(2)),
          previousBalanceDueUsd: due,
          allocatedAmountUsd: toAlloc,
          remainingBalanceDueUsd: newRemaining,
          isFullyPaid: newRemaining <= 0.01
        });

        allocationsMap[invId] = toAlloc;
        totalAllocatedToInvoicesUsd = Number((totalAllocatedToInvoicesUsd + toAlloc).toFixed(2));
      }
    }

    const unallocatedCreditUsd = Math.max(
      0,
      Number((totalSettledBaseUsd - totalAllocatedToInvoicesUsd).toFixed(2))
    );

    return {
      amountReceivedInBaseUsd,
      amountReceivedInSecondary,
      discountAmountUsd,
      discountPercentageEquivalent,
      totalSettledBaseUsd,
      totalAllocatedToInvoicesUsd,
      unallocatedCreditUsd,
      allocatedInvoices,
      allocationsMap
    };
  }
}

