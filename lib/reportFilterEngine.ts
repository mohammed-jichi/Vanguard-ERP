/**
 * ============================================================================
 * VANGUARD ERP - UNIFIED REPORT FILTER ENGINE (GLOBAL PIPELINE)
 * ============================================================================
 * Centralized mock-filtering engine shared across all report templates.
 * Provides strict filter predicate normalizers with slug-to-canonical dictionaries:
 * - Tenders / Payment Methods (cash_reimbursement, whish_pay, store_credit_voucher, etc.)
 * - Reasons (Void reasons, Refund reasons, Hold reasons)
 * - Branches & Facilities
 * - Channels & Departments
 * - Date ranges & Timestamps
 * - Cashiers, Supervisors, and search keywords
 */

import { extractCurrencyFromFilter } from './currencyEngine';

export interface StandardFilterableRecord {
  id?: string | number;
  branch?: string;
  branch_id?: string;
  facility?: string;
  store?: string;
  payment_method?: string;
  tender?: string;
  paymentType?: string;
  paymentMode?: string;
  reason?: string;
  voidReason?: string;
  refundReason?: string;
  holdReason?: string;
  channel?: string;
  department?: string;
  departmentChannel?: string;
  invoice_type?: string;
  orderSource?: string;
  date?: string;
  timestamp?: string;
  orderDate?: string;
  eodDate?: string;
  server?: string;
  cashier?: string;
  supervisor?: string;
  authorizer?: string;
  status?: string;
  category?: string;
  [key: string]: any;
}

// ============================================================================
// 1. SLUG-TO-CANONICAL NORMALIZATION DICTIONARIES
// ============================================================================

export const TENDER_MAPPINGS: Record<string, string> = {
  // Generic Cash & Cash LBP / USD
  'cash': 'CASH',
  'cash_reimbursement': 'CASH',
  'cash_tender': 'CASH',
  'cash ($ / lbp)': 'CASH',
  'cash_lbp': 'CASH (LBP)',
  'cash lbp': 'CASH (LBP)',
  'cash_(lbp)': 'CASH (LBP)',
  'cash_usd': 'CASH (USD)',
  'cash usd': 'CASH (USD)',
  'cash_(usd)': 'CASH (USD)',
  'cash ($)': 'CASH (USD)',

  // Generic Card & Card LBP / USD
  'card': 'CARD',
  'credit_card': 'CARD',
  'credit card / visa pos': 'CARD',
  'visa': 'CARD',
  'mastercard': 'CARD',
  'visa_mastercard': 'CARD',
  'tap_payments': 'CARD',
  'card_lbp': 'CARD (LBP)',
  'card lbp': 'CARD (LBP)',
  'card_(lbp)': 'CARD (LBP)',
  'credit_card_lbp': 'CARD (LBP)',
  'credit card lbp': 'CARD (LBP)',
  'card_usd': 'CARD (USD)',
  'card usd': 'CARD (USD)',
  'card_(usd)': 'CARD (USD)',
  'credit_card_usd': 'CARD (USD)',
  'credit card usd': 'CARD (USD)',

  // EUR Tenders
  'cash_eur': 'CASH (EUR)',
  'cash eur': 'CASH (EUR)',
  'card_eur': 'CARD (EUR)',
  'card eur': 'CARD (EUR)',
  'credit_card_eur': 'CARD (EUR)',

  // GBP Tenders
  'cash_gbp': 'CASH (GBP)',
  'cash gbp': 'CASH (GBP)',
  'card_gbp': 'CARD (GBP)',
  'card gbp': 'CARD (GBP)',

  // Credit on Account (Customer Ledger Credit)
  'store_credit': 'ON ACC',
  'store_credit_voucher': 'ON ACC',
  'credit_note': 'ON ACC',
  'credit': 'ON ACC',
  'credit customer (on account)': 'ON ACC',
  'credit_sales': 'ON ACC',
  'credit_account': 'ON ACC',
  'credit on account': 'ON ACC',
  'credit_on_account': 'ON ACC',
  'on_acc': 'ON ACC',
  'on acc': 'ON ACC',
  'customer_ledger_credit': 'ON ACC',

  // Split / Mixed Tender
  'split': 'SPLIT',
  'mixed': 'SPLIT',
  'mixed_split': 'SPLIT',
  'mixed / split tender': 'SPLIT',
  'mixed_split_tender': 'SPLIT',
  'split_tender': 'SPLIT',
  'split payment': 'SPLIT',

  // Whish Money / E-Wallets
  'whish': 'WHISH',
  'whish_pay': 'WHISH',
  'whish money transfer': 'WHISH',
  'whish money / e-wallets': 'WHISH',
  'whish_money_e_wallets': 'WHISH',
  'e_wallet': 'WHISH',
  'e-wallet': 'WHISH',
  'e-wallets': 'WHISH',

  // Checks
  'check': 'CHECK',
  'cheque': 'CHECK',
  'bank_check': 'CHECK',
};

export const REASON_MAPPINGS: Record<string, string> = {
  // Refund Reasons
  'wrong_item': 'Wrong Item Scanned',
  'wrong_item_scanned': 'Wrong Item Scanned',
  'packaging_defect': 'Packaging Defect',
  'defect': 'Packaging Defect',
  'bottle_seal_defect': 'Packaging Defect',
  'quality_dissatisfaction': 'Quality Dissatisfaction',
  'quality': 'Quality Dissatisfaction',
  'customer_return': 'Customer Return',
  'return': 'Customer Return',
  'damaged_goods': 'Damaged Goods',
  'damaged': 'Damaged Goods',
  'expired_stock': 'Expired Stock',
  'expired': 'Expired Stock',

  // Void Reasons
  'count_error': 'Count Error',
  'quantity_error': 'Count Error',
  'item_exchange': 'Item Exchange',
  'exchange': 'Item Exchange',
  'barcode_error': 'Barcode Error',
  'barcode': 'Barcode Error',
  'customer_request': 'Customer Request',
  'changed_mind': 'Customer Request',
  'manager_discretion': 'Manager Discretion',
  'manager_override': 'Manager Discretion',
  'pricing_error': 'Pricing Error',

  // Hold Reasons
  'awaiting_payment': 'Awaiting Payment',
  'manager_review': 'Manager Review',
  'stock_check': 'Stock Verification',
  'customer_delay': 'Customer Delay',
};

export const BRANCH_MAPPINGS: Record<string, string> = {
  'main': 'Main Branch',
  'main_branch': 'Main Branch',
  'choueifat': 'Main Branch',
  'choueifat_facility': 'Main Branch',
  'beirut': 'Beirut Depot',
  'beirut_depot': 'Beirut Depot',
  'verdun': 'Beirut Depot',
  'sidon': 'Sidon Hub',
  'sidon_hub': 'Sidon Hub',
  'tripoli': 'Tripoli Northern Depot',
  'tripoli_depot': 'Tripoli Northern Depot',
};

export const CHANNEL_MAPPINGS: Record<string, string> = {
  'pos': 'POS',
  'pos_counter': 'POS',
  'local': 'Local',
  'local_dispatch': 'Local',
  'online': 'Online',
  'e_commerce': 'Online',
  'wholesale': 'Wholesale',
  'wholesale_depot': 'Wholesale',
  'inventory': 'Inventory',
  'training': 'Training',
};

/**
 * Normalizes a filter value using slug dictionaries and standard string casing.
 */
export function normalizeFilterToken(value?: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value).trim().toLowerCase();
  return str.replace(/[\s-]+/g, '_');
}

/**
 * Checks whether a filter dimension matches a row attribute.
 * Evaluates slug synonyms, substring inclusions, and canonical values.
 */
export function matchDimensionValue(
  dimension: 'tender' | 'reason' | 'branch' | 'channel',
  filterVal?: any,
  rowVal?: any
): boolean {
  if (!filterVal || filterVal === 'ALL' || filterVal === 'all') {
    return true;
  }
  if (!rowVal && rowVal !== 0) {
    return false;
  }

  const cleanFilter = String(filterVal).trim().toLowerCase();
  const cleanRow = String(rowVal).trim().toLowerCase();
  const filterSlug = normalizeFilterToken(filterVal);
  const rowSlug = normalizeFilterToken(rowVal);

  // 1. Direct or slug match
  if (cleanFilter === cleanRow || filterSlug === rowSlug) {
    return true;
  }

  // 2. Dictionary-based canonical resolution
  if (dimension === 'tender') {
    const canonicalFilter = TENDER_MAPPINGS[filterSlug] || TENDER_MAPPINGS[cleanFilter];
    const canonicalRow = TENDER_MAPPINGS[rowSlug] || TENDER_MAPPINGS[cleanRow];

    if (canonicalFilter && canonicalRow && canonicalFilter === canonicalRow) {
      return true;
    }

    // Dynamic currency guard: Prevent cross-currency mismatch across all currencies (USD, LBP, EUR, GBP, etc.)
    const filterCurr = extractCurrencyFromFilter(cleanFilter) || (canonicalFilter ? extractCurrencyFromFilter(canonicalFilter) : null);
    const rowCurr = extractCurrencyFromFilter(cleanRow) || (canonicalRow ? extractCurrencyFromFilter(canonicalRow) : null);

    if (filterCurr && rowCurr && filterCurr !== rowCurr) {
      return false;
    }

    // Generic CASH/CARD filter matches specific currency row
    if (canonicalFilter === 'CASH' && (canonicalRow?.startsWith('CASH') || cleanRow.includes('cash'))) {
      return true;
    }
    if (canonicalFilter === 'CARD' && (canonicalRow?.startsWith('CARD') || cleanRow.includes('card') || cleanRow.includes('visa'))) {
      return true;
    }

    if (canonicalFilter && cleanRow.toUpperCase().includes(canonicalFilter)) {
      return true;
    }
    if (canonicalRow && cleanFilter.toUpperCase().includes(canonicalRow)) {
      return true;
    }
  }

  if (dimension === 'reason') {
    const canonicalFilter = REASON_MAPPINGS[filterSlug] || REASON_MAPPINGS[cleanFilter];
    const canonicalRow = REASON_MAPPINGS[rowSlug] || REASON_MAPPINGS[cleanRow];

    if (canonicalFilter && canonicalRow && canonicalFilter === canonicalRow) {
      return true;
    }
    if (canonicalFilter && cleanRow.includes(canonicalFilter.toLowerCase())) {
      return true;
    }
    if (canonicalRow && cleanFilter.includes(canonicalRow.toLowerCase())) {
      return true;
    }
  }

  if (dimension === 'branch') {
    const canonicalFilter = BRANCH_MAPPINGS[filterSlug] || BRANCH_MAPPINGS[cleanFilter];
    const canonicalRow = BRANCH_MAPPINGS[rowSlug] || BRANCH_MAPPINGS[cleanRow];

    if (canonicalFilter && canonicalRow && canonicalFilter === canonicalRow) {
      return true;
    }
    if (canonicalFilter && cleanRow.includes(canonicalFilter.toLowerCase())) {
      return true;
    }
  }

  if (dimension === 'channel') {
    const canonicalFilter = CHANNEL_MAPPINGS[filterSlug] || CHANNEL_MAPPINGS[cleanFilter];
    const canonicalRow = CHANNEL_MAPPINGS[rowSlug] || CHANNEL_MAPPINGS[cleanRow];

    if (canonicalFilter && canonicalRow && canonicalFilter === canonicalRow) {
      return true;
    }
    if (canonicalFilter && cleanRow.toUpperCase().includes(canonicalFilter)) {
      return true;
    }
  }

  // 3. Bidirectional Substring fallback
  return cleanRow.includes(cleanFilter) || cleanFilter.includes(cleanRow);
}

/**
 * Normalizes dates across multiple formats into comparable timestamps or YYYY-MM-DD strings.
 */
export function normalizeDateValue(rawDate?: string): Date | null {
  if (!rawDate) return null;
  const trimmed = rawDate.trim();

  // Direct standard Date parsing
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d;
  }

  // Parse DD-MM-YYYY or DD/MM/YYYY
  const parts = trimmed.split(/[-/]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month - 1, day);
    }
  }

  return null;
}

function toDateComparableString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Primary Unified Mock Filter Engine
 * Applies active filter criteria dynamically across rows of any report.
 */
export function applyGlobalReportFilters<T extends Record<string, any>>(
  data: T[],
  filters?: Record<string, any>
): T[] {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }
  if (!filters || Object.keys(filters).length === 0) {
    return data;
  }

  // Extract filter dimensions with alias normalization
  const rawBranch =
    filters.branch ??
    filters.branch_id ??
    filters.facility ??
    filters.selectedBranch ??
    filters.store;

  const rawPaymentMethod =
    filters.payment_method ??
    filters.paymentMethod ??
    filters.paymentType ??
    filters.tender ??
    filters.paymentMode;

  const rawReason =
    filters.reason ??
    filters.voidReason ??
    filters.refundReason ??
    filters.holdReason;

  const rawChannel =
    filters.channel ??
    filters.department ??
    filters.departmentChannel ??
    filters.channelId ??
    filters.invoice_type ??
    filters.orderSource;

  const rawCashier =
    filters.serverCashier ??
    filters.cashier ??
    filters.server;

  const rawSupervisor =
    filters.supervisor ??
    filters.authorizer;

  const rawStatus =
    filters.status ??
    filters.orderStatus ??
    filters.customerStatus;

  const rawCategory =
    filters.category ??
    filters.customerCategory ??
    filters.group;

  const rawSearch =
    filters.search ??
    filters.searchQuery ??
    filters.keyword ??
    filters.customerSearch ??
    filters.itemSearch ??
    filters.productSearch;

  // Date Range extraction
  const fromDateObj = filters.fromDate ? normalizeDateValue(filters.fromDate) : null;
  const toDateObj = filters.toDate ? normalizeDateValue(filters.toDate) : null;
  const fromComparable = fromDateObj ? toDateComparableString(fromDateObj) : null;
  const toComparable = toDateObj ? toDateComparableString(toDateObj) : null;

  return data.filter((row) => {
    // 1. Branch / Facility Filter
    if (rawBranch && rawBranch !== 'ALL' && rawBranch !== 'all') {
      const rowBranch = row.branch ?? row.branch_id ?? row.facility ?? row.store;
      if (!matchDimensionValue('branch', rawBranch, rowBranch)) {
        return false;
      }
    }

    // 2. Payment Method / Tender Filter
    if (rawPaymentMethod && rawPaymentMethod !== 'ALL' && rawPaymentMethod !== 'all') {
      const rowTender =
        row.payment_method ??
        row.paymentMethod ??
        row.tender ??
        row.paymentType ??
        row.paymentMode;
      if (!matchDimensionValue('tender', rawPaymentMethod, rowTender)) {
        return false;
      }
    }

    // 2b. Direct Currency Filter
    const rawCurrency = filters.currency ?? filters.targetCurrency;
    if (rawCurrency && rawCurrency !== 'ALL' && rawCurrency !== 'all') {
      const rowCurr = String(row.currency || '').toUpperCase().trim();
      const targetCurr = String(rawCurrency).toUpperCase().trim();
      if (rowCurr && rowCurr !== targetCurr) {
        return false;
      }
    }

    // 3. Reason Filter (Void Reason, Refund Reason, Hold Reason)
    if (rawReason && rawReason !== 'ALL' && rawReason !== 'all') {
      const rowReason =
        row.reason ??
        row.voidReason ??
        row.refundReason ??
        row.holdReason;
      if (!matchDimensionValue('reason', rawReason, rowReason)) {
        return false;
      }
    }

    // 4. Channel / Department Filter
    if (rawChannel && rawChannel !== 'ALL' && rawChannel !== 'all') {
      const rowChannel =
        row.channel ??
        row.department ??
        row.departmentChannel ??
        row.invoice_type ??
        row.orderSource;
      if (!matchDimensionValue('channel', rawChannel, rowChannel)) {
        return false;
      }
    }

    // 5. Cashier / Server Filter
    if (rawCashier && rawCashier !== 'ALL' && rawCashier !== 'all') {
      const targetCashier = String(rawCashier).toLowerCase().trim();
      const rowCashier = String(
        row.server ?? row.cashier ?? row.serverCashier ?? ''
      ).toLowerCase();

      if (rowCashier && !rowCashier.includes(targetCashier) && !targetCashier.includes(rowCashier)) {
        return false;
      }
    }

    // 6. Supervisor / Authorizer Filter
    if (rawSupervisor && rawSupervisor !== 'ALL' && rawSupervisor !== 'all') {
      const targetSup = String(rawSupervisor).toLowerCase().trim();
      const rowSup = String(row.supervisor ?? row.authorizer ?? '').toLowerCase();

      if (rowSup && !rowSup.includes(targetSup) && !targetSup.includes(rowSup)) {
        return false;
      }
    }

    // 7. Status Filter
    if (rawStatus && rawStatus !== 'ALL' && rawStatus !== 'all') {
      const targetStatus = String(rawStatus).toLowerCase().trim();
      const rowStatus = String(row.status ?? row.orderStatus ?? '').toLowerCase();

      if (rowStatus && !rowStatus.includes(targetStatus)) {
        return false;
      }
    }

    // 8. Category / Group Filter
    if (rawCategory && rawCategory !== 'ALL' && rawCategory !== 'all') {
      const targetCategory = String(rawCategory).toLowerCase().trim();
      const rowCategory = String(row.category ?? row.customerCategory ?? row.group ?? '').toLowerCase();

      if (rowCategory && !rowCategory.includes(targetCategory)) {
        return false;
      }
    }

    // 9. Date Range Filter
    if (fromComparable || toComparable) {
      const rawRowDate = row.date ?? row.timestamp ?? row.orderDate ?? row.eodDate ?? row.created_at;
      if (rawRowDate) {
        const rowDateObj = normalizeDateValue(String(rawRowDate));
        if (rowDateObj) {
          const rowComp = toDateComparableString(rowDateObj);
          if (fromComparable && rowComp < fromComparable) return false;
          if (toComparable && rowComp > toComparable) return false;
        }
      }
    }

    // 10. Keyword / Search Query Filter across string fields
    if (rawSearch && String(rawSearch).trim() !== '') {
      const query = String(rawSearch).toLowerCase().trim();
      const searchableStrings = Object.values(row)
        .filter((val) => typeof val === 'string' || typeof val === 'number')
        .map((val) => String(val).toLowerCase());

      const matchesAnyField = searchableStrings.some((fieldStr) => fieldStr.includes(query));
      if (!matchesAnyField) return false;
    }

    return true;
  });
}

export default applyGlobalReportFilters;

