/**
 * Omega ERP / Vanguard ERP - Zone Setup & Currency Setup Models & Live Seed Data
 * Section: Currency Setup (CurrSetupView) & Call Center Zone Setup (CallCenterZoneSetupView)
 * Branch: 00001 - Main Branch
 */

export interface OmegaBranchOption {
  BRANCHID: number;
  BARANCHNAME: string;
}

export const OMEGA_BRANCHES: OmegaBranchOption[] = [
  { BRANCHID: 1, BARANCHNAME: 'Main Branch' }
];

// ==========================================
// 1. CURRENCY SETUP
// ==========================================
export interface OmegaCurrency {
  ID: number;
  BRAND_ID: number;
  BRANCHID: number;
  DESCRIPTION: string;
  RATE: number;
  SYNBOL: string;
  ASYNBOL: string;
  DIGITNUMBER: number;
  BACKRATE: number;
  DECIMALNBRINV?: number | null;
  maincurrency: number; // 1 = Main, 2 = Second, 3 = Normal
}

export const INITIAL_CURRENCIES: OmegaCurrency[] = [
  {
    ID: 1,
    BRAND_ID: 9606,
    BRANCHID: 1,
    DESCRIPTION: 'LBP',
    RATE: 1,
    SYNBOL: 'LL',
    ASYNBOL: 'LL',
    DIGITNUMBER: 0,
    BACKRATE: 1,
    DECIMALNBRINV: 0,
    maincurrency: 1
  },
  {
    ID: 2,
    BRAND_ID: 9606,
    BRANCHID: 1,
    DESCRIPTION: 'USD',
    RATE: 90000,
    SYNBOL: '$',
    ASYNBOL: '$',
    DIGITNUMBER: 2,
    BACKRATE: 90000,
    DECIMALNBRINV: 0,
    maincurrency: 2
  },
  {
    ID: 4088,
    BRAND_ID: 9606,
    BRANCHID: 1,
    DESCRIPTION: 'EURO',
    RATE: 2000,
    SYNBOL: 'EU',
    ASYNBOL: 'EU',
    DIGITNUMBER: 2,
    BACKRATE: 2000,
    DECIMALNBRINV: 0,
    maincurrency: 3
  },
  {
    ID: 4089,
    BRAND_ID: 9606,
    BRANCHID: 1,
    DESCRIPTION: 'Lebanese Pound',
    RATE: 90000,
    SYNBOL: 'L.B',
    ASYNBOL: 'L.B.P',
    DIGITNUMBER: 0,
    BACKRATE: 90000,
    DECIMALNBRINV: null,
    maincurrency: 3
  }
];

// ==========================================
// 2. ZONE SETUP (CALL CENTER ZONE SETUP)
// ==========================================
export interface OmegaCity {
  id: number;
  name: string;
  country_id: number;
  checked?: boolean;
}

export interface OmegaLinkedCity {
  CITYID: number;
  name?: string;
}

export interface OmegaCallCenterZone {
  ID: number;
  ZONE: string;
  AREACODE: string;
  TOBRANCH: number;
  BARANCHNAME: string;
  PRINTERNAME: string;
  DELIVERYCHARGE: string;
  cities: OmegaLinkedCity[];
}

export const LEBANON_CITIES: OmegaCity[] = [
  { id: 1, name: 'Beirut', country_id: 115 },
  { id: 2, name: 'Achrafieh', country_id: 115 },
  { id: 3, name: 'Hamra', country_id: 115 },
  { id: 4, name: 'Verdun', country_id: 115 },
  { id: 5, name: 'Kfarchima', country_id: 115 },
  { id: 6, name: 'Choueifat', country_id: 115 },
  { id: 7, name: 'Hadath', country_id: 115 },
  { id: 8, name: 'Baabda', country_id: 115 },
  { id: 9, name: 'Saida', country_id: 115 },
  { id: 10, name: 'Ghazieh', country_id: 115 },
  { id: 11, name: 'Sarafand', country_id: 115 },
  { id: 12, name: 'Tyre', country_id: 115 },
  { id: 13, name: 'Nabatieh', country_id: 115 },
  { id: 14, name: 'Zahrani', country_id: 115 },
  { id: 15, name: 'Jounieh', country_id: 115 },
  { id: 16, name: 'Byblos', country_id: 115 },
  { id: 17, name: 'Zahle', country_id: 115 },
  { id: 18, name: 'Aley', country_id: 115 },
  { id: 19, name: 'Bhamdoun', country_id: 115 },
  { id: 20, name: 'Tripoli', country_id: 115 }
];

export const INITIAL_ZONES: OmegaCallCenterZone[] = [
  {
    ID: 1,
    ZONE: 'Beirut & Suburbs',
    AREACODE: '01',
    TOBRANCH: 1,
    BARANCHNAME: 'Main Branch',
    PRINTERNAME: 'Cashier Thermal',
    DELIVERYCHARGE: '3.00',
    cities: [
      { CITYID: 1, name: 'Beirut' },
      { CITYID: 2, name: 'Achrafieh' },
      { CITYID: 3, name: 'Hamra' },
      { CITYID: 4, name: 'Verdun' }
    ]
  },
  {
    ID: 2,
    ZONE: 'Mount Lebanon - South Suburbs',
    AREACODE: '05',
    TOBRANCH: 1,
    BARANCHNAME: 'Main Branch',
    PRINTERNAME: 'Kitchen Barcode',
    DELIVERYCHARGE: '2.00',
    cities: [
      { CITYID: 5, name: 'Kfarchima' },
      { CITYID: 6, name: 'Choueifat' },
      { CITYID: 7, name: 'Hadath' },
      { CITYID: 8, name: 'Baabda' }
    ]
  },
  {
    ID: 3,
    ZONE: 'South Lebanon - Saida & Coastal',
    AREACODE: '07',
    TOBRANCH: 1,
    BARANCHNAME: 'Main Branch',
    PRINTERNAME: 'Dispatch Printer',
    DELIVERYCHARGE: '4.00',
    cities: [
      { CITYID: 9, name: 'Saida' },
      { CITYID: 10, name: 'Ghazieh' },
      { CITYID: 11, name: 'Sarafand' }
    ]
  },
  {
    ID: 4,
    ZONE: 'South Lebanon - Tyre & Nabatieh',
    AREACODE: '07',
    TOBRANCH: 1,
    BARANCHNAME: 'Main Branch',
    PRINTERNAME: 'Main Dispatch',
    DELIVERYCHARGE: '5.00',
    cities: [
      { CITYID: 12, name: 'Tyre' },
      { CITYID: 13, name: 'Nabatieh' },
      { CITYID: 14, name: 'Zahrani' }
    ]
  }
];
