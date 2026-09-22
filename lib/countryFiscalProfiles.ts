/**
 * Vanguard ERP - Multi-Jurisdiction Country Fiscal Profiles & Chart of Accounts Mapping
 * 
 * Auto-binds national fiscal laws, tax identification labels, VAT rates,
 * and accounting standard seed templates:
 * - Lebanon -> Plan Comptable Général Libanais (PCGL), VAT 11%, MOF & CR labels.
 * - International / Other -> Standard IFRS Dual-Currency Chart of Accounts.
 */

export interface CountryFiscalProfile {
  name: string;
  code: string;
  flag: string;
  currency: 'USD' | 'LBP' | 'AED' | 'SAR' | 'QAR' | 'KWD' | 'EGP' | 'JOD' | 'EUR' | 'GBP' | string;
  currencySymbol: string;
  financialSeedTemplate: 'lebanese_pca' | 'international_ifrs';
  financialTemplateName: string;
  vatPercentage: number;
  vatName: string;
  taxIdLabel: string;
  crNumberLabel: string;
  taxIdPlaceholder: string;
  crNumberPlaceholder: string;
  accountingStandard: string;
  chartOfAccountsFormat: string;
  regulatoryBody: string;
  description: string;
}

export const LEBANON_FISCAL_PROFILE: CountryFiscalProfile = {
  name: 'Lebanon',
  code: 'LB',
  flag: '🇱🇧',
  currency: 'USD',
  currencySymbol: '$ / ل.ل',
  financialSeedTemplate: 'lebanese_pca',
  financialTemplateName: 'Plan Comptable Général Libanais (PCGL)',
  vatPercentage: 11,
  vatName: 'VAT 11% (TVA Libanaise)',
  taxIdLabel: 'Tax ID Number (MOF / الرقم المالي - وزارة المالية)',
  crNumberLabel: 'Commercial Registration (CR / السجل التجاري)',
  taxIdPlaceholder: 'e.g. MOF-7489201',
  crNumberPlaceholder: 'e.g. CR-104928-LB',
  accountingStandard: 'Plan Comptable Général Libanais (Decree 4256/81)',
  chartOfAccountsFormat: 'Classes 1–7 • 5-Digit Structure (e.g. 53000, 51210, 40110)',
  regulatoryBody: 'Ministry of Finance (وزارة المالية) & Commercial Court Register',
  description: 'Lebanese national accounting standard with dual-currency valuation (USD & LBP), unified Class 4 third-party sub-ledgers, and Class 5 liquidities.'
};

export const INTERNATIONAL_DEFAULT_PROFILE: CountryFiscalProfile = {
  name: 'International (Global)',
  code: 'INT',
  flag: '🌐',
  currency: 'USD',
  currencySymbol: '$',
  financialSeedTemplate: 'international_ifrs',
  financialTemplateName: 'Standard IFRS Dual-Currency Chart of Accounts',
  vatPercentage: 15,
  vatName: 'Standard International VAT / Sales Tax',
  taxIdLabel: 'Tax Identification Number (TIN / VAT ID)',
  crNumberLabel: 'Company Registration Number (CRN / Legal Entity ID)',
  taxIdPlaceholder: 'e.g. TIN-99281034-INT',
  crNumberPlaceholder: 'e.g. CRN-8829104',
  accountingStandard: 'International Financial Reporting Standards (IFRS / US GAAP)',
  chartOfAccountsFormat: '4-Digit Standard: Assets (1000s), Liab (2000s), Equity (3000s), Rev (4000s), Exp (5000s-6000s)',
  regulatoryBody: 'International Accounting Standards Board (IASB) / National Registry',
  description: 'Global standard dual-currency IFRS chart of accounts organized cleanly into Assets, Liabilities, Equity, Revenue, and Expense classes.'
};

export const COUNTRY_FISCAL_PROFILES: CountryFiscalProfile[] = [
  LEBANON_FISCAL_PROFILE,
  {
    name: 'United Arab Emirates',
    code: 'AE',
    flag: '🇦🇪',
    currency: 'AED',
    currencySymbol: 'AED / د.إ',
    financialSeedTemplate: 'international_ifrs',
    financialTemplateName: 'Standard IFRS Dual-Currency Chart of Accounts',
    vatPercentage: 5,
    vatName: 'UAE Federal Tax Authority VAT 5%',
    taxIdLabel: 'Tax Registration Number (TRN / الرقم الضريبي)',
    crNumberLabel: 'Commercial License / Trade License (رخصة تجارية)',
    taxIdPlaceholder: 'e.g. 100-2938-4829-00003',
    crNumberPlaceholder: 'e.g. DED-782910',
    accountingStandard: 'IFRS compliant with UAE Corporate Tax & FTA VAT',
    chartOfAccountsFormat: '4-Digit Standard IFRS with FTA VAT Accounts',
    regulatoryBody: 'UAE Federal Tax Authority (FTA) & Economic Department (DED)',
    description: 'UAE enterprise configuration with standard 5% VAT and Federal Corporate Tax compliance.'
  },
  {
    name: 'Saudi Arabia',
    code: 'SA',
    flag: '🇸🇦',
    currency: 'SAR',
    currencySymbol: 'SAR / ر.س',
    financialSeedTemplate: 'international_ifrs',
    financialTemplateName: 'Standard IFRS Dual-Currency Chart of Accounts',
    vatPercentage: 15,
    vatName: 'ZATCA VAT 15% (ضريبة القيمة المضافة)',
    taxIdLabel: 'ZATCA Tax ID / VAT Number (الرقم الضريبي للمنشأة)',
    crNumberLabel: 'Commercial Registration (السجل التجاري - وزارة التجارة)',
    taxIdPlaceholder: 'e.g. 300982736100003',
    crNumberPlaceholder: 'e.g. CR-1010892019',
    accountingStandard: 'SOCPA / IFRS with ZATCA Phase 2 Fatoora Integration',
    chartOfAccountsFormat: '4-Digit Standard IFRS with ZATCA Tax Structure',
    regulatoryBody: 'Zakat, Tax and Customs Authority (ZATCA / هيئة الزكاة والضريبة والجمارك)',
    description: 'Saudi Arabia corporate structure aligned with ZATCA e-invoicing and SOCPA/IFRS accounting.'
  },
  {
    name: 'Qatar',
    code: 'QA',
    flag: '🇶🇦',
    currency: 'QAR',
    currencySymbol: 'QAR / ر.ق',
    financialSeedTemplate: 'international_ifrs',
    financialTemplateName: 'Standard IFRS Dual-Currency Chart of Accounts',
    vatPercentage: 0,
    vatName: 'General Tax Authority (GTA - Zero Rated)',
    taxIdLabel: 'Tax Identification Number (TIN / الرقم الضريبي)',
    crNumberLabel: 'Commercial Registration (السجل التجاري - وزارة التجارة والصناعة)',
    taxIdPlaceholder: 'e.g. 000-0982-192',
    crNumberPlaceholder: 'e.g. CR-182901',
    accountingStandard: 'Qatar Financial Markets / IFRS',
    chartOfAccountsFormat: '4-Digit Standard IFRS Structure',
    regulatoryBody: 'General Tax Authority (GTA) & Ministry of Commerce and Industry (MOCI)',
    description: 'Qatar corporate profile configured for IFRS dual-currency reporting.'
  },
  {
    name: 'Kuwait',
    code: 'KW',
    flag: '🇰🇼',
    currency: 'KWD',
    currencySymbol: 'KWD / د.ك',
    financialSeedTemplate: 'international_ifrs',
    financialTemplateName: 'Standard IFRS Dual-Currency Chart of Accounts',
    vatPercentage: 0,
    vatName: 'Kuwait Ministry of Finance Corporate Tax',
    taxIdLabel: 'Tax Card Number (رقم البطاقة الضريبية - وزارة المالية)',
    crNumberLabel: 'Commercial Registration (السجل التجاري)',
    taxIdPlaceholder: 'e.g. KW-TC-882910',
    crNumberPlaceholder: 'e.g. CR-92810',
    accountingStandard: 'Kuwait Standard IFRS',
    chartOfAccountsFormat: '4-Digit Standard IFRS Structure',
    regulatoryBody: 'Kuwait Ministry of Finance (MOF) & Ministry of Commerce',
    description: 'Kuwait corporate setup adhering to IFRS standards.'
  },
  {
    name: 'Jordan',
    code: 'JO',
    flag: '🇯🇴',
    currency: 'JOD',
    currencySymbol: 'JOD / د.أ',
    financialSeedTemplate: 'international_ifrs',
    financialTemplateName: 'Standard IFRS Dual-Currency Chart of Accounts',
    vatPercentage: 16,
    vatName: 'General Sales Tax 16% (ضريبة المبيعات العامة)',
    taxIdLabel: 'Sales Tax Identification Number (الرقم الضريبي - دائرة ضريبة الدخل والمبيعات)',
    crNumberLabel: 'National Company Registration (الرقم الوطني للمنشأة / السجل التجاري)',
    taxIdPlaceholder: 'e.g. ISTD-2910293',
    crNumberPlaceholder: 'e.g. CR-192019',
    accountingStandard: 'Jordanian CPA / IFRS Standards',
    chartOfAccountsFormat: '4-Digit Standard IFRS with Sales Tax Ledger',
    regulatoryBody: 'Income and Sales Tax Department (ISTD)',
    description: 'Jordanian corporate configuration supporting 16% GST and dual-currency valuation.'
  },
  {
    name: 'Egypt',
    code: 'EG',
    flag: '🇪🇬',
    currency: 'EGP',
    currencySymbol: 'EGP / ج.م',
    financialSeedTemplate: 'international_ifrs',
    financialTemplateName: 'Standard IFRS Dual-Currency Chart of Accounts',
    vatPercentage: 14,
    vatName: 'Egyptian VAT 14% (مصلحة الضرائب المصرية)',
    taxIdLabel: 'Tax Registration Number (رقم التسجيل الضريبي - مصلحة الضرائب)',
    crNumberLabel: 'Commercial Registration (السجل التجاري)',
    taxIdPlaceholder: 'e.g. ETA-982-192-819',
    crNumberPlaceholder: 'e.g. CR-28190',
    accountingStandard: 'Egyptian Accounting Standards (EAS / IFRS aligned)',
    chartOfAccountsFormat: '4-Digit Standard IFRS Structure with ETA VAT',
    regulatoryBody: 'Egyptian Tax Authority (ETA) & Commercial Registry Authority',
    description: 'Egyptian enterprise profile aligned with ETA electronic tax compliance and 14% VAT.'
  },
  {
    name: 'Iraq',
    code: 'IQ',
    flag: '🇮🇶',
    currency: 'USD',
    currencySymbol: '$ / د.ع',
    financialSeedTemplate: 'international_ifrs',
    financialTemplateName: 'Standard IFRS Dual-Currency Chart of Accounts',
    vatPercentage: 0,
    vatName: 'General Commission for Taxes (GCT)',
    taxIdLabel: 'Tax Identification Number (الرقم التعريفي الضريبي)',
    crNumberLabel: 'Registrar of Companies Registration Number (شهادة تسجيل الشركة)',
    taxIdPlaceholder: 'e.g. IQ-GCT-882910',
    crNumberPlaceholder: 'e.g. ROC-19201',
    accountingStandard: 'Unified Accounting System (IFRS Dual-Currency)',
    chartOfAccountsFormat: '4-Digit Standard IFRS Structure',
    regulatoryBody: 'General Commission for Taxes (GCT) & Ministry of Trade',
    description: 'Iraqi corporate profile configured with USD/IQD dual currency.'
  },
  {
    name: 'United States',
    code: 'US',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
    financialSeedTemplate: 'international_ifrs',
    financialTemplateName: 'Standard IFRS Dual-Currency Chart of Accounts',
    vatPercentage: 8,
    vatName: 'State & Local Sales Tax (Average 8%)',
    taxIdLabel: 'Federal Employer Identification Number (IRS EIN / FEIN)',
    crNumberLabel: 'State Business Entity / SOS Charter Number',
    taxIdPlaceholder: 'e.g. 12-3456789',
    crNumberPlaceholder: 'e.g. DE-SOS-9821092',
    accountingStandard: 'US GAAP / IFRS Standard',
    chartOfAccountsFormat: '4-Digit Standard: 1000s Assets, 2000s Liab, 3000s Equity, 4000s Rev, 5000s-6000s Exp',
    regulatoryBody: 'Internal Revenue Service (IRS) & State Department of State',
    description: 'US corporate configuration conforming to GAAP / IFRS 4-digit chart of accounts.'
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    flag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£',
    financialSeedTemplate: 'international_ifrs',
    financialTemplateName: 'Standard IFRS Dual-Currency Chart of Accounts',
    vatPercentage: 20,
    vatName: 'HMRC Standard VAT 20%',
    taxIdLabel: 'HMRC VAT Registration Number (VRN / UTR)',
    crNumberLabel: 'Companies House Registration Number (CRN)',
    taxIdPlaceholder: 'e.g. GB 123 4567 89',
    crNumberPlaceholder: 'e.g. 09821034',
    accountingStandard: 'UK FRS 102 / International IFRS',
    chartOfAccountsFormat: '4-Digit Standard IFRS Structure with HMRC VAT Codes',
    regulatoryBody: 'HM Revenue & Customs (HMRC) & Companies House',
    description: 'UK enterprise setup with 20% VAT and Making Tax Digital (MTD) compliance.'
  },
  {
    name: 'France',
    code: 'FR',
    flag: '🇫🇷',
    currency: 'EUR',
    currencySymbol: '€',
    financialSeedTemplate: 'international_ifrs',
    financialTemplateName: 'Standard IFRS Dual-Currency Chart of Accounts',
    vatPercentage: 20,
    vatName: 'TVA Française Taux Normal 20%',
    taxIdLabel: 'Numéro de TVA Intracommunautaire (FR TVA)',
    crNumberLabel: 'Numéro SIRET / Immatriculation RCS',
    taxIdPlaceholder: 'e.g. FR 32 123456789',
    crNumberPlaceholder: 'e.g. 123 456 789 00012',
    accountingStandard: 'Normes IFRS / Plan Comptable Français Adapté',
    chartOfAccountsFormat: '4-Digit Standard IFRS Structure with French TVA',
    regulatoryBody: 'Direction Générale des Finances Publiques (DGFiP) & Greffe du Tribunal',
    description: 'French fiscal profile aligned with European TVA and IFRS financial reporting.'
  },
  {
    name: 'Germany',
    code: 'DE',
    flag: '🇩🇪',
    currency: 'EUR',
    currencySymbol: '€',
    financialSeedTemplate: 'international_ifrs',
    financialTemplateName: 'Standard IFRS Dual-Currency Chart of Accounts',
    vatPercentage: 19,
    vatName: 'Umsatzsteuer (MwSt 19%)',
    taxIdLabel: 'Umsatzsteuer-Identifikationsnummer (USt-IdNr.)',
    crNumberLabel: 'Handelsregisternummer (HRB / HRA)',
    taxIdPlaceholder: 'e.g. DE 123456789',
    crNumberPlaceholder: 'e.g. HRB 98210 B',
    accountingStandard: 'HGB / International IFRS Standard',
    chartOfAccountsFormat: '4-Digit Standard IFRS Structure',
    regulatoryBody: 'Bundeszentralamt für Steuern (BZSt) & Amtsgericht',
    description: 'German enterprise profile aligned with German USt standards and IFRS.'
  },
  {
    name: 'Canada',
    code: 'CA',
    flag: '🇨🇦',
    currency: 'USD',
    currencySymbol: '$',
    financialSeedTemplate: 'international_ifrs',
    financialTemplateName: 'Standard IFRS Dual-Currency Chart of Accounts',
    vatPercentage: 13,
    vatName: 'CRA GST/HST (Harmonized Sales Tax 13%)',
    taxIdLabel: 'CRA Business Number & GST/HST Account (BN)',
    crNumberLabel: 'Federal / Provincial Corporation Number',
    taxIdPlaceholder: 'e.g. 123456789 RT 0001',
    crNumberPlaceholder: 'e.g. Corp-9821034',
    accountingStandard: 'Canadian GAAP / IFRS Standard',
    chartOfAccountsFormat: '4-Digit Standard IFRS Structure',
    regulatoryBody: 'Canada Revenue Agency (CRA) & Corporations Canada',
    description: 'Canadian business structure with GST/HST tracking and IFRS financial reporting.'
  },
  {
    name: 'Cyprus',
    code: 'CY',
    flag: '🇨🇾',
    currency: 'EUR',
    currencySymbol: '€',
    financialSeedTemplate: 'international_ifrs',
    financialTemplateName: 'Standard IFRS Dual-Currency Chart of Accounts',
    vatPercentage: 19,
    vatName: 'Cyprus VAT 19% (Τμήμα Φορολογίας)',
    taxIdLabel: 'Tax Identification Code (TIC / VAT Number)',
    crNumberLabel: 'Department of Registrar HE Number (Αριθμός Μητρώου Εταιρείας)',
    taxIdPlaceholder: 'e.g. CY 10293847 A',
    crNumberPlaceholder: 'e.g. HE 982102',
    accountingStandard: 'International Financial Reporting Standards (IFRS EU)',
    chartOfAccountsFormat: '4-Digit Standard IFRS Structure with EU VAT',
    regulatoryBody: 'Cyprus Tax Department & Department of Registrar of Companies',
    description: 'Cyprus holding and trading enterprise configuration with IFRS reporting.'
  },
  {
    name: 'Turkey',
    code: 'TR',
    flag: '🇹🇷',
    currency: 'USD',
    currencySymbol: '$ / ₺',
    financialSeedTemplate: 'international_ifrs',
    financialTemplateName: 'Standard IFRS Dual-Currency Chart of Accounts',
    vatPercentage: 20,
    vatName: 'Katma Değer Vergisi (KDV 20%)',
    taxIdLabel: 'Vergi Kimlik Numarası (VKN / Tax Number)',
    crNumberLabel: 'Ticaret Sicil Numarası / MERSİS No',
    taxIdPlaceholder: 'e.g. 1234567890',
    crNumberPlaceholder: 'e.g. MERSIS: 012345678900001',
    accountingStandard: 'Turkish Financial Reporting Standards (TFRS / IFRS)',
    chartOfAccountsFormat: '4-Digit Standard IFRS Structure with KDV',
    regulatoryBody: 'Gelir İdaresi Başkanlığı (GİB) & Ticaret Sicil Müdürlüğü',
    description: 'Turkish enterprise profile adhering to TFRS/IFRS with dual currency.'
  },
  INTERNATIONAL_DEFAULT_PROFILE
];

/**
 * Resolve country fiscal profile by country name, code, or alias
 * Defaults strictly to Lebanon if country is "Lebanon" or empty
 */
export function getCountryFiscalProfile(countryNameOrCode?: string): CountryFiscalProfile {
  if (!countryNameOrCode) {
    return LEBANON_FISCAL_PROFILE;
  }

  const clean = countryNameOrCode.trim().toLowerCase();

  // If Lebanon or Levant alias, strictly return PCGL
  if (
    clean === 'lebanon' ||
    clean === 'lb' ||
    clean === 'lbn' ||
    clean === 'لبنان' ||
    clean.includes('leban')
  ) {
    return LEBANON_FISCAL_PROFILE;
  }

  // Exact match search across catalog
  const found = COUNTRY_FISCAL_PROFILES.find(p =>
    p.name.toLowerCase() === clean ||
    p.code.toLowerCase() === clean ||
    clean.includes(p.name.toLowerCase())
  );

  if (found) {
    return found;
  }

  // Fallback to International IFRS for any other country
  return {
    ...INTERNATIONAL_DEFAULT_PROFILE,
    name: countryNameOrCode.trim()
  };
}

/**
 * Returns whether a given country uses the Lebanese PCGL standard or IFRS
 */
export function isLebaneseFiscalStandard(countryName?: string): boolean {
  if (!countryName) return true;
  const lower = countryName.toLowerCase().trim();
  return lower === 'lebanon' || lower === 'lb' || lower === 'lbn' || lower === 'لبنان';
}
