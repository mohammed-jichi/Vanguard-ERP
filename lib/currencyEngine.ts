/**
 * ============================================================================
 * VANGUARD ERP — CENTRAL MULTI-CURRENCY & EXCHANGE RATE ENGINE
 * Scalable Architecture for Universal Monetary Valuation, Conversion & Display
 * ============================================================================
 */

export interface CurrencyMeta {
  code: string;
  symbol: string;
  name: string;
  rateToBase: number; // Rates relative to 1 USD base
  decimals: number;
  symbolPosition: 'prefix' | 'suffix';
}

/**
 * Primary System Currency Base
 */
export const BASE_CURRENCY = 'USD';

/**
 * Supported Currencies Configuration Matrix
 * Easily extensible for arbitrary global currencies without code refactoring.
 */
export const SUPPORTED_CURRENCIES: Record<string, CurrencyMeta> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rateToBase: 1.0,
    decimals: 2,
    symbolPosition: 'prefix',
  },
  LBP: {
    code: 'LBP',
    symbol: 'LBP',
    name: 'Lebanese Pound',
    rateToBase: 89500.0,
    decimals: 0,
    symbolPosition: 'suffix',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rateToBase: 0.92,
    decimals: 2,
    symbolPosition: 'prefix',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rateToBase: 0.78,
    decimals: 2,
    symbolPosition: 'prefix',
  },
};

/**
 * Universal Currency Conversion Utility
 * Converts an amount between any two currencies via the base currency (USD).
 *
 * @param amount - The numeric value to convert
 * @param fromCurrency - Source currency code (e.g., 'LBP', 'USD', 'EUR')
 * @param toCurrency - Target currency code (e.g., 'USD', 'LBP', 'EUR')
 * @param customRates - Optional overrides for live or custom exchange rates
 * @returns Converted numeric amount rounded to target currency precision
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string = 'LBP',
  toCurrency: string = 'LBP',
  customRates?: Record<string, number>
): number {
  const from = fromCurrency.toUpperCase().trim();
  const to = toCurrency.toUpperCase().trim();

  if (from === to || !amount || isNaN(amount)) {
    return amount || 0;
  }

  const fromMeta = SUPPORTED_CURRENCIES[from] || { rateToBase: 1, decimals: 2 };
  const toMeta = SUPPORTED_CURRENCIES[to] || { rateToBase: 1, decimals: 2 };

  const fromRate = customRates?.[from] ?? fromMeta.rateToBase;
  const toRate = customRates?.[to] ?? toMeta.rateToBase;

  // Convert source amount to USD base
  const amountInUsd = amount / fromRate;

  // Convert USD base to target currency
  const converted = amountInUsd * toRate;

  // Round according to target currency precision
  const decimals = toMeta.decimals ?? 2;
  const factor = Math.pow(10, decimals);
  return Math.round(converted * factor) / factor;
}

/**
 * Universal Currency Formatter
 * Formats monetary amounts with appropriate precision, symbols, and localized separators.
 *
 * @param amount - Numeric value to format
 * @param currencyCode - Target currency code (e.g. 'USD', 'LBP', 'EUR', 'GBP')
 * @param includeCodeSuffix - Whether to append the 3-letter currency code (default: true)
 */
export function formatCurrencyAmount(
  amount: number | string | null | undefined,
  currencyCode: string = 'LBP',
  includeCodeSuffix: boolean = true
): string {
  if (amount === null || amount === undefined || amount === '') {
    return '-';
  }

  const num = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/,/g, '')) || 0;
  const code = (currencyCode || 'LBP').toUpperCase().trim();
  const meta = SUPPORTED_CURRENCIES[code] || {
    code,
    symbol: code,
    decimals: 2,
    symbolPosition: 'suffix',
  };

  const isNeg = num < 0;
  const absVal = Math.abs(num);
  const formattedNum = absVal.toLocaleString(undefined, {
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
  });

  let coreStr = '';
  if (meta.symbolPosition === 'prefix') {
    coreStr = `${meta.symbol}${formattedNum}`;
  } else {
    coreStr = `${formattedNum} ${meta.symbol}`;
  }

  if (isNeg) {
    coreStr = `-${coreStr}`;
  }

  if (includeCodeSuffix && meta.symbol !== meta.code) {
    return `${coreStr} ${meta.code}`;
  }

  return coreStr;
}

/**
 * Extracts target currency code from filter inputs (e.g. 'CASH_USD' -> 'USD', 'Credit Card EUR' -> 'EUR')
 */
export function extractCurrencyFromFilter(filterValue?: string): string | null {
  if (!filterValue || typeof filterValue !== 'string') return null;
  const upper = filterValue.toUpperCase();

  for (const code of Object.keys(SUPPORTED_CURRENCIES)) {
    // Check word boundaries or underscores (e.g., CASH_USD, CARD (USD), USD)
    const regex = new RegExp(`(^|[_\\s(])${code}([)_\\s]|$)`, 'i');
    if (regex.test(upper)) {
      return code;
    }
  }

  return null;
}

/**
 * Returns exchange rate against Lebanese Pound (LBP) or base for table Rate column display.
 */
export function getExchangeRateForDisplay(currency: string): number {
  const code = (currency || 'LBP').toUpperCase().trim();
  if (code === 'LBP') {
    return SUPPORTED_CURRENCIES.USD.rateToBase; // Standard LBP market reference (89,500)
  }
  const meta = SUPPORTED_CURRENCIES[code];
  if (meta) {
    // For non-LBP currencies, show conversion rate to LBP
    return Math.round(SUPPORTED_CURRENCIES.LBP.rateToBase / meta.rateToBase);
  }
  return 89500;
}
