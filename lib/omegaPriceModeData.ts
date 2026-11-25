export interface OmegaPriceMode {
  ID: number;
  MODEID: number;
  BRAND_ID: number;
  BRANCHID: number;
  MODEDESCRIPTION: string;
  TIMEOFDAY: string;  // Monday
  TIMEOFDAY1: string; // Tuesday
  TIMEOFDAY2: string; // Wednesday
  TIMEOFDAY3: string; // Thursday
  TIMEOFDAY4: string; // Friday
  TIMEOFDAY5: string; // Saturday
  TIMEOFDAY6: string; // Sunday
  TIMEOFDAY7?: string;
  disableAll?: boolean;
  disabledDays?: {
    monday?: boolean;
    tuesday?: boolean;
    wednesday?: boolean;
    thursday?: boolean;
    friday?: boolean;
    saturday?: boolean;
    sunday?: boolean;
  };
}

export const INITIAL_PRICE_MODES: OmegaPriceMode[] = [
  { ID: 1, MODEID: 1, BRAND_ID: 0, BRANCHID: 1, MODEDESCRIPTION: 'Retail / \u0645\u0641\u0631\u0642', TIMEOFDAY: '00:00', TIMEOFDAY1: '00:00', TIMEOFDAY2: '00:00', TIMEOFDAY3: '00:00', TIMEOFDAY4: '00:00', TIMEOFDAY5: '00:00', TIMEOFDAY6: '00:00' },
  { ID: 2, MODEID: 2, BRAND_ID: 0, BRANCHID: 1, MODEDESCRIPTION: 'Wholesale / \u062c\u0645\u0644\u0629', TIMEOFDAY: '00:00', TIMEOFDAY1: '00:00', TIMEOFDAY2: '00:00', TIMEOFDAY3: '00:00', TIMEOFDAY4: '00:00', TIMEOFDAY5: '00:00', TIMEOFDAY6: '00:00' },
  { ID: 3, MODEID: 3, BRAND_ID: 0, BRANCHID: 1, MODEDESCRIPTION: 'Offers / \u0639\u0631\u0648\u0636', TIMEOFDAY: '00:00', TIMEOFDAY1: '00:00', TIMEOFDAY2: '00:00', TIMEOFDAY3: '00:00', TIMEOFDAY4: '00:00', TIMEOFDAY5: '00:00', TIMEOFDAY6: '00:00' },
  { ID: 4, MODEID: 4, BRAND_ID: 0, BRANCHID: 1, MODEDESCRIPTION: 'Export / VIP', TIMEOFDAY: '00:00', TIMEOFDAY1: '00:00', TIMEOFDAY2: '00:00', TIMEOFDAY3: '00:00', TIMEOFDAY4: '00:00', TIMEOFDAY5: '00:00', TIMEOFDAY6: '00:00' }
];
