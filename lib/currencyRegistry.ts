/**
 * Vanguard ERP - Global ISO 4217 Currency Matrix
 * 
 * Provides an extensive catalog of official ISO 4217 currencies
 * with symbols, native names, country flags, and standard reference rates.
 */

export interface ISOCurrency {
  code: string;
  name: string;
  symbol: string;
  flag?: string;
  nativeName?: string;
  popular?: boolean;
}

export const GLOBAL_ISO_CURRENCIES: ISOCurrency[] = [
  // Major Enterprise Currencies
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', nativeName: 'United States Dollar', popular: true },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', nativeName: 'Euro', popular: true },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', nativeName: 'Pound Sterling', popular: true },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', flag: '🇱🇧', nativeName: 'الليرة اللبنانية', popular: true },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', flag: '🇸🇦', nativeName: 'الريال السعودي', popular: true },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', nativeName: 'الدرهم الإماراتي', popular: true },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', flag: '🇶🇦', nativeName: 'الريال القطري', popular: true },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼', nativeName: 'الدينار الكويتي', popular: true },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', flag: '🇧🇭', nativeName: 'الدينار البحريني', popular: true },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', flag: '🇴🇲', nativeName: 'الريال العماني', popular: true },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.أ', flag: '🇯🇴', nativeName: 'الدينار الأردني', popular: true },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م', flag: '🇪🇬', nativeName: 'الجنيه المصري', popular: true },
  { code: 'IQD', name: 'Iraqi Dinar', symbol: 'د.ع', flag: '🇮🇶', nativeName: 'الدينار العراقي', popular: true },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', nativeName: 'Türk Lirası', popular: true },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦', nativeName: 'Dollar canadien', popular: true },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'AU$', flag: '🇦🇺', nativeName: 'Australian Dollar', popular: true },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', nativeName: 'Schweizer Franken', popular: true },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', nativeName: '日本円', popular: true },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', nativeName: '人民币', popular: true },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', nativeName: 'भारतीय रुपया' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', nativeName: 'Real brasileiro' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦', nativeName: 'South African Rand' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', flag: '🇲🇽', nativeName: 'Peso mexicano' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', nativeName: 'Singapore Dollar' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿', nativeName: 'New Zealand Dollar' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪', nativeName: 'Svensk krona' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴', nativeName: 'Norsk krone' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰', nativeName: 'Dansk krone' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱', nativeName: 'Polski złoty' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', nativeName: 'Ringgit Malaysia' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', nativeName: 'บาทไทย' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷', nativeName: '대한민국 원' }
];

export const DEFAULT_BASE_CURRENCY = 'USD';
export const DEFAULT_SECONDARY_CURRENCY = 'LBP';

/**
 * Get metadata for any ISO currency code (case-insensitive)
 */
export function getCurrencyMeta(code?: string): ISOCurrency {
  if (!code) {
    return GLOBAL_ISO_CURRENCIES[0]; // USD
  }
  const upper = code.trim().toUpperCase();
  const found = GLOBAL_ISO_CURRENCIES.find(c => c.code === upper);
  if (found) return found;

  return {
    code: upper,
    name: `${upper} Currency`,
    symbol: upper,
    flag: '🌐'
  };
}

/**
 * Filter ISO currencies by keyword (code, English name, or native name)
 */
export function searchCurrencies(query: string): ISOCurrency[] {
  if (!query || !query.trim()) {
    return GLOBAL_ISO_CURRENCIES;
  }
  const q = query.toLowerCase().trim();
  return GLOBAL_ISO_CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(q) ||
    c.name.toLowerCase().includes(q) ||
    (c.nativeName && c.nativeName.toLowerCase().includes(q))
  );
}
