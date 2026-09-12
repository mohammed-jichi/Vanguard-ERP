/**
 * Live Suppliers and Lookup Datasets Scraped Directly from Omega ERP
 * Customer ID: 22901 (Southern Olive Oil Products S.A.R.L)
 */

export interface SupplierItem {
  ID: number;
  SUPPLIERID: number;
  BRAND_ID: number;
  BRANCHID: number;
  SUPPLIERNAME: string;
  CONTACTNAME: string | null;
  CONTACTTITLE: string | number | null;
  STREET: string | null;
  CITY: string | null;
  POSTALCODE: string | null;
  COUNTRY: string | number | null;
  COUNTRY_NAME: string;
  PHONENUMBER: string | null;
  MOBILE: string | null;
  FAXNUMBER: string | null;
  EMAILADDRESS: string | null;
  EMAILCC: string | null;
  BANKINFO: string | null;
  NOTES: string | null;
  PAYMENTTERMS: string | number | null;
  PAYMENTTYPE: number | null;
  MAINCURR: number | null;
  ACCOUNTNO: string | number | null;
  VATREGISTERED: number;
  VATNB?: string | null;
  GRADE: string | null;
  WEBSITE: string | null;
  NOTACTIVE: number;
  CREATED_AT: string;
  UPDATED_AT: string;
}

export interface CountryItem {
  ID: number;
  NAME: string;
  DIALING_CODE: string;
}

export interface CustTitleItem {
  ID: number;
  TITLEDESCRIPTION: string;
}

export interface CurrencyItem {
  ID: number;
  DESCRIPTION: string;
  SYMBOL: string;
  POS_RATE?: number | string;
  BACKOFFICE_RATE?: number | string;
  DECIMAL_NUMBER?: number | string;
}

export interface PaymentTermItem {
  ID: number;
  TERM_ID: number;
  PAYMENTTERM: string;
  DAYS: number;
}

export interface PaymentTypeItem {
  id: number;
  description: string;
}

export interface GradeItem {
  value: string;
  description: string;
}

export const INITIAL_OMEGA_SUPPLIERS: SupplierItem[] = [
  {
    ID: 14,
    SUPPLIERID: 14,
    BRAND_ID: 9606,
    BRANCHID: 1,
    SUPPLIERNAME: 'Safa Bakery',
    CONTACTNAME: 'Safa Bakery',
    CONTACTTITLE: null,
    STREET: null,
    CITY: null,
    POSTALCODE: null,
    COUNTRY: '115',
    COUNTRY_NAME: 'Lebanon',
    PHONENUMBER: null,
    MOBILE: null,
    FAXNUMBER: null,
    EMAILADDRESS: null,
    EMAILCC: null,
    BANKINFO: null,
    NOTES: null,
    PAYMENTTERMS: '0',
    PAYMENTTYPE: 1,
    MAINCURR: 2,
    ACCOUNTNO: null,
    VATREGISTERED: 0,
    VATNB: null,
    GRADE: null,
    WEBSITE: null,
    NOTACTIVE: 0,
    CREATED_AT: '2026-04-03 10:14:25',
    UPDATED_AT: '2026-04-03 10:14:25'
  },
  {
    ID: 13,
    SUPPLIERID: 13,
    BRAND_ID: 9606,
    BRANCHID: 1,
    SUPPLIERNAME: 'Sedi Hisham',
    CONTACTNAME: 'Abir',
    CONTACTTITLE: '2',
    STREET: null,
    CITY: null,
    POSTALCODE: null,
    COUNTRY: '115',
    COUNTRY_NAME: 'Lebanon',
    PHONENUMBER: null,
    MOBILE: null,
    FAXNUMBER: null,
    EMAILADDRESS: null,
    EMAILCC: null,
    BANKINFO: null,
    NOTES: null,
    PAYMENTTERMS: '0',
    PAYMENTTYPE: 1,
    MAINCURR: 2,
    ACCOUNTNO: null,
    VATREGISTERED: 0,
    VATNB: null,
    GRADE: null,
    WEBSITE: null,
    NOTACTIVE: 0,
    CREATED_AT: '2026-04-02 13:36:41',
    UPDATED_AT: '2026-04-02 13:36:41'
  },
  {
    ID: 12,
    SUPPLIERID: 12,
    BRAND_ID: 9606,
    BRANCHID: 1,
    SUPPLIERNAME: 'الضيعة',
    CONTACTNAME: null,
    CONTACTTITLE: '1',
    STREET: null,
    CITY: null,
    POSTALCODE: null,
    COUNTRY: '115',
    COUNTRY_NAME: 'Lebanon',
    PHONENUMBER: '70325417',
    MOBILE: null,
    FAXNUMBER: null,
    EMAILADDRESS: null,
    EMAILCC: null,
    BANKINFO: null,
    NOTES: null,
    PAYMENTTERMS: '0',
    PAYMENTTYPE: 1,
    MAINCURR: 2,
    ACCOUNTNO: null,
    VATREGISTERED: 0,
    VATNB: null,
    GRADE: null,
    WEBSITE: null,
    NOTACTIVE: 0,
    CREATED_AT: '2026-03-23 09:21:27',
    UPDATED_AT: '2026-03-23 09:21:27'
  },
  {
    ID: 11,
    SUPPLIERID: 11,
    BRAND_ID: 9606,
    BRANCHID: 1,
    SUPPLIERNAME: 'مؤسسة عبده للتجاره',
    CONTACTNAME: null,
    CONTACTTITLE: null,
    STREET: null,
    CITY: null,
    POSTALCODE: null,
    COUNTRY: '115',
    COUNTRY_NAME: 'Lebanon',
    PHONENUMBER: null,
    MOBILE: null,
    FAXNUMBER: null,
    EMAILADDRESS: null,
    EMAILCC: null,
    BANKINFO: null,
    NOTES: null,
    PAYMENTTERMS: '0',
    PAYMENTTYPE: 1,
    MAINCURR: 2,
    ACCOUNTNO: null,
    VATREGISTERED: 0,
    VATNB: null,
    GRADE: null,
    WEBSITE: null,
    NOTACTIVE: 0,
    CREATED_AT: '2026-02-19 12:05:14',
    UPDATED_AT: '2026-05-13 16:40:02'
  },
  {
    ID: 10,
    SUPPLIERID: 10,
    BRAND_ID: 9606,
    BRANCHID: 1,
    SUPPLIERNAME: 'Koubeissi Est.',
    CONTACTNAME: 'Koubeissi',
    CONTACTTITLE: null,
    STREET: null,
    CITY: null,
    POSTALCODE: null,
    COUNTRY: '115',
    COUNTRY_NAME: 'Lebanon',
    PHONENUMBER: '05434734',
    MOBILE: null,
    FAXNUMBER: null,
    EMAILADDRESS: null,
    EMAILCC: null,
    BANKINFO: null,
    NOTES: null,
    PAYMENTTERMS: '0',
    PAYMENTTYPE: 1,
    MAINCURR: 2,
    ACCOUNTNO: null,
    VATREGISTERED: 0,
    VATNB: null,
    GRADE: null,
    WEBSITE: null,
    NOTACTIVE: 0,
    CREATED_AT: '2026-02-09 11:22:15',
    UPDATED_AT: '2026-02-09 11:22:15'
  },
  {
    ID: 9,
    SUPPLIERID: 9,
    BRAND_ID: 9606,
    BRANCHID: 1,
    SUPPLIERNAME: 'Abbas & Hussein Dirani',
    CONTACTNAME: 'Abbas',
    CONTACTTITLE: null,
    STREET: null,
    CITY: null,
    POSTALCODE: null,
    COUNTRY: '115',
    COUNTRY_NAME: 'Lebanon',
    PHONENUMBER: null,
    MOBILE: null,
    FAXNUMBER: null,
    EMAILADDRESS: null,
    EMAILCC: null,
    BANKINFO: null,
    NOTES: null,
    PAYMENTTERMS: '0',
    PAYMENTTYPE: 1,
    MAINCURR: 2,
    ACCOUNTNO: null,
    VATREGISTERED: 0,
    VATNB: null,
    GRADE: null,
    WEBSITE: null,
    NOTACTIVE: 0,
    CREATED_AT: '2026-01-26 15:30:11',
    UPDATED_AT: '2026-01-26 15:30:11'
  },
  {
    ID: 8,
    SUPPLIERID: 8,
    BRAND_ID: 9606,
    BRANCHID: 1,
    SUPPLIERNAME: 'Abbas Dirani',
    CONTACTNAME: null,
    CONTACTTITLE: null,
    STREET: null,
    CITY: null,
    POSTALCODE: null,
    COUNTRY: '115',
    COUNTRY_NAME: 'Lebanon',
    PHONENUMBER: '76939604',
    MOBILE: null,
    FAXNUMBER: null,
    EMAILADDRESS: null,
    EMAILCC: null,
    BANKINFO: null,
    NOTES: null,
    PAYMENTTERMS: '0',
    PAYMENTTYPE: 1,
    MAINCURR: 2,
    ACCOUNTNO: null,
    VATREGISTERED: 0,
    VATNB: null,
    GRADE: null,
    WEBSITE: null,
    NOTACTIVE: 0,
    CREATED_AT: '2026-01-26 15:28:44',
    UPDATED_AT: '2026-01-26 15:28:44'
  },
  {
    ID: 7,
    SUPPLIERID: 7,
    BRAND_ID: 9606,
    BRANCHID: 1,
    SUPPLIERNAME: 'Clatchy',
    CONTACTNAME: null,
    CONTACTTITLE: null,
    STREET: null,
    CITY: null,
    POSTALCODE: null,
    COUNTRY: '115',
    COUNTRY_NAME: 'Lebanon',
    PHONENUMBER: null,
    MOBILE: null,
    FAXNUMBER: null,
    EMAILADDRESS: null,
    EMAILCC: null,
    BANKINFO: null,
    NOTES: null,
    PAYMENTTERMS: '0',
    PAYMENTTYPE: 1,
    MAINCURR: 2,
    ACCOUNTNO: null,
    VATREGISTERED: 0,
    VATNB: null,
    GRADE: null,
    WEBSITE: null,
    NOTACTIVE: 0,
    CREATED_AT: '2025-12-29 16:45:00',
    UPDATED_AT: '2025-12-29 16:45:00'
  },
  {
    ID: 6,
    SUPPLIERID: 6,
    BRAND_ID: 9606,
    BRANCHID: 1,
    SUPPLIERNAME: 'B GROUP',
    CONTACTNAME: null,
    CONTACTTITLE: null,
    STREET: null,
    CITY: null,
    POSTALCODE: null,
    COUNTRY: '115',
    COUNTRY_NAME: 'Lebanon',
    PHONENUMBER: null,
    MOBILE: null,
    FAXNUMBER: null,
    EMAILADDRESS: null,
    EMAILCC: null,
    BANKINFO: null,
    NOTES: null,
    PAYMENTTERMS: '0',
    PAYMENTTYPE: 1,
    MAINCURR: 2,
    ACCOUNTNO: null,
    VATREGISTERED: 0,
    VATNB: null,
    GRADE: null,
    WEBSITE: null,
    NOTACTIVE: 0,
    CREATED_AT: '2025-12-23 11:20:18',
    UPDATED_AT: '2025-12-23 11:20:18'
  },
  {
    ID: 5,
    SUPPLIERID: 5,
    BRAND_ID: 9606,
    BRANCHID: 1,
    SUPPLIERNAME: 'SOOL',
    CONTACTNAME: null,
    CONTACTTITLE: null,
    STREET: null,
    CITY: null,
    POSTALCODE: null,
    COUNTRY: '115',
    COUNTRY_NAME: 'Lebanon',
    PHONENUMBER: null,
    MOBILE: null,
    FAXNUMBER: null,
    EMAILADDRESS: null,
    EMAILCC: null,
    BANKINFO: null,
    NOTES: null,
    PAYMENTTERMS: '0',
    PAYMENTTYPE: 1,
    MAINCURR: 2,
    ACCOUNTNO: null,
    VATREGISTERED: 0,
    VATNB: null,
    GRADE: null,
    WEBSITE: null,
    NOTACTIVE: 0,
    CREATED_AT: '2025-12-15 14:02:10',
    UPDATED_AT: '2025-12-15 14:02:10'
  },
  {
    ID: 4,
    SUPPLIERID: 4,
    BRAND_ID: 9606,
    BRANCHID: 1,
    SUPPLIERNAME: 'Mrs Randa',
    CONTACTNAME: null,
    CONTACTTITLE: null,
    STREET: null,
    CITY: null,
    POSTALCODE: null,
    COUNTRY: '115',
    COUNTRY_NAME: 'Lebanon',
    PHONENUMBER: null,
    MOBILE: null,
    FAXNUMBER: null,
    EMAILADDRESS: null,
    EMAILCC: null,
    BANKINFO: null,
    NOTES: null,
    PAYMENTTERMS: '0',
    PAYMENTTYPE: 1,
    MAINCURR: 2,
    ACCOUNTNO: null,
    VATREGISTERED: 0,
    VATNB: null,
    GRADE: null,
    WEBSITE: null,
    NOTACTIVE: 0,
    CREATED_AT: '2025-12-12 17:15:30',
    UPDATED_AT: '2025-12-12 17:15:30'
  },
  {
    ID: 3,
    SUPPLIERID: 3,
    BRAND_ID: 9606,
    BRANCHID: 1,
    SUPPLIERNAME: 'C-Way Trading',
    CONTACTNAME: null,
    CONTACTTITLE: null,
    STREET: null,
    CITY: null,
    POSTALCODE: null,
    COUNTRY: '115',
    COUNTRY_NAME: 'Lebanon',
    PHONENUMBER: null,
    MOBILE: null,
    FAXNUMBER: null,
    EMAILADDRESS: null,
    EMAILCC: null,
    BANKINFO: null,
    NOTES: null,
    PAYMENTTERMS: '0',
    PAYMENTTYPE: 1,
    MAINCURR: 2,
    ACCOUNTNO: null,
    VATREGISTERED: 0,
    VATNB: null,
    GRADE: null,
    WEBSITE: null,
    NOTACTIVE: 0,
    CREATED_AT: '2025-12-11 09:44:12',
    UPDATED_AT: '2025-12-11 09:44:12'
  },
  {
    ID: 2,
    SUPPLIERID: 2,
    BRAND_ID: 9606,
    BRANCHID: 1,
    SUPPLIERNAME: 'Ezzeddin',
    CONTACTNAME: null,
    CONTACTTITLE: null,
    STREET: null,
    CITY: null,
    POSTALCODE: null,
    COUNTRY: '115',
    COUNTRY_NAME: 'Lebanon',
    PHONENUMBER: null,
    MOBILE: null,
    FAXNUMBER: null,
    EMAILADDRESS: null,
    EMAILCC: null,
    BANKINFO: null,
    NOTES: null,
    PAYMENTTERMS: '0',
    PAYMENTTYPE: 1,
    MAINCURR: 2,
    ACCOUNTNO: null,
    VATREGISTERED: 0,
    VATNB: null,
    GRADE: null,
    WEBSITE: null,
    NOTACTIVE: 0,
    CREATED_AT: '2025-12-10 13:50:00',
    UPDATED_AT: '2025-12-10 13:50:00'
  },
  {
    ID: 1,
    SUPPLIERID: 1,
    BRAND_ID: 9606,
    BRANCHID: 1,
    SUPPLIERNAME: 'Zahwe',
    CONTACTNAME: null,
    CONTACTTITLE: null,
    STREET: null,
    CITY: null,
    POSTALCODE: null,
    COUNTRY: '115',
    COUNTRY_NAME: 'Lebanon',
    PHONENUMBER: '+96170798854',
    MOBILE: null,
    FAXNUMBER: null,
    EMAILADDRESS: null,
    EMAILCC: null,
    BANKINFO: null,
    NOTES: null,
    PAYMENTTERMS: '0',
    PAYMENTTYPE: 1,
    MAINCURR: 2,
    ACCOUNTNO: null,
    VATREGISTERED: 0,
    VATNB: null,
    GRADE: null,
    WEBSITE: null,
    NOTACTIVE: 0,
    CREATED_AT: '2025-12-07 10:10:00',
    UPDATED_AT: '2025-12-07 10:10:00'
  }
];

export const OMEGA_COUNTRIES: CountryItem[] = [
  { ID: 115, NAME: 'Lebanon', DIALING_CODE: '+961' },
  { ID: 226, NAME: 'United States', DIALING_CODE: '+1' },
  { ID: 225, NAME: 'United Kingdom', DIALING_CODE: '+44' },
  { ID: 74, NAME: 'France', DIALING_CODE: '+33' },
  { ID: 81, NAME: 'Germany', DIALING_CODE: '+49' },
  { ID: 104, NAME: 'Italy', DIALING_CODE: '+39' },
  { ID: 198, NAME: 'Spain', DIALING_CODE: '+34' },
  { ID: 219, NAME: 'Turkey', DIALING_CODE: '+90' },
  { ID: 224, NAME: 'United Arab Emirates', DIALING_CODE: '+971' },
  { ID: 184, NAME: 'Saudi Arabia', DIALING_CODE: '+966' },
  { ID: 63, NAME: 'Egypt', DIALING_CODE: '+20' },
  { ID: 108, NAME: 'Jordan', DIALING_CODE: '+962' },
  { ID: 114, NAME: 'Kuwait', DIALING_CODE: '+965' },
  { ID: 174, NAME: 'Qatar', DIALING_CODE: '+974' },
  { ID: 158, NAME: 'Oman', DIALING_CODE: '+968' },
  { ID: 17, NAME: 'Bahrain', DIALING_CODE: '+973' },
  { ID: 102, NAME: 'Iraq', DIALING_CODE: '+964' },
  { ID: 209, NAME: 'Syria', DIALING_CODE: '+963' },
  { ID: 38, NAME: 'Canada', DIALING_CODE: '+1' },
  { ID: 13, NAME: 'Australia', DIALING_CODE: '+61' },
  { ID: 44, NAME: 'China', DIALING_CODE: '+86' }
];

export const OMEGA_CUST_TITLES: CustTitleItem[] = [
  { ID: 1, TITLEDESCRIPTION: 'Mr.' },
  { ID: 2, TITLEDESCRIPTION: 'Ms.' }
];

export const OMEGA_CURRENCIES: CurrencyItem[] = [
  { ID: 2, DESCRIPTION: 'USD', SYMBOL: '$', POS_RATE: 1, BACKOFFICE_RATE: 1, DECIMAL_NUMBER: 2 },
  { ID: 1, DESCRIPTION: 'LBP', SYMBOL: 'LL', POS_RATE: 89500, BACKOFFICE_RATE: 89500, DECIMAL_NUMBER: 0 },
  { ID: 4088, DESCRIPTION: 'EURO', SYMBOL: 'EU', POS_RATE: 1.08, BACKOFFICE_RATE: 1.08, DECIMAL_NUMBER: 2 },
  { ID: 4089, DESCRIPTION: 'Lebanese Pound', SYMBOL: 'L.B', POS_RATE: 89500, BACKOFFICE_RATE: 89500, DECIMAL_NUMBER: 0 }
];

export const OMEGA_PAYMENT_TERMS: PaymentTermItem[] = [
  { ID: 1, TERM_ID: 1, PAYMENTTERM: '7 Days', DAYS: 7 },
  { ID: 2, TERM_ID: 2, PAYMENTTERM: '14 Days', DAYS: 14 },
  { ID: 3, TERM_ID: 3, PAYMENTTERM: '30 Days', DAYS: 30 },
  { ID: 4, TERM_ID: 4, PAYMENTTERM: '60 Days', DAYS: 60 },
  { ID: 5, TERM_ID: 5, PAYMENTTERM: '90 Days', DAYS: 90 }
];

export const OMEGA_PAYMENT_TYPES: PaymentTypeItem[] = [
  { id: 1, description: 'Cash' },
  { id: 2, description: 'Credit Card' },
  { id: 3, description: 'Check' },
  { id: 4, description: 'Wire Transfer' }
];

export const OMEGA_GRADES: GradeItem[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  .split('')
  .map((letter) => ({ value: letter, description: letter }));
