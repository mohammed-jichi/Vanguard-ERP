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
  {
    ID: 1,
    MODEID: 1,
    BRAND_ID: 9606,
    BRANCHID: 1,
    MODEDESCRIPTION: 'MODE 1 (Standard / Morning)',
    TIMEOFDAY: '05:00',
    TIMEOFDAY1: '05:00',
    TIMEOFDAY2: '05:00',
    TIMEOFDAY3: '05:00',
    TIMEOFDAY4: '05:00',
    TIMEOFDAY5: '05:00',
    TIMEOFDAY6: '05:00'
  },
  {
    ID: 2,
    MODEID: 2,
    BRAND_ID: 9606,
    BRANCHID: 1,
    MODEDESCRIPTION: 'MODE 2 (Afternoon / Lunch)',
    TIMEOFDAY: '12:00',
    TIMEOFDAY1: '12:00',
    TIMEOFDAY2: '12:00',
    TIMEOFDAY3: '12:00',
    TIMEOFDAY4: '12:00',
    TIMEOFDAY5: '12:00',
    TIMEOFDAY6: '12:00'
  },
  {
    ID: 3,
    MODEID: 3,
    BRAND_ID: 9606,
    BRANCHID: 1,
    MODEDESCRIPTION: 'MODE 3 (Evening / Happy Hour)',
    TIMEOFDAY: '18:00',
    TIMEOFDAY1: '18:00',
    TIMEOFDAY2: '18:00',
    TIMEOFDAY3: '18:00',
    TIMEOFDAY4: '18:00',
    TIMEOFDAY5: '18:00',
    TIMEOFDAY6: '18:00',
    disableAll: false,
    disabledDays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    }
  },
  {
    ID: 4,
    MODEID: 4,
    BRAND_ID: 9606,
    BRANCHID: 1,
    MODEDESCRIPTION: 'MODE 4 (Night / Closing)',
    TIMEOFDAY: '23:59',
    TIMEOFDAY1: '23:59',
    TIMEOFDAY2: '23:59',
    TIMEOFDAY3: '23:59',
    TIMEOFDAY4: '23:59',
    TIMEOFDAY5: '23:59',
    TIMEOFDAY6: '23:59',
    disableAll: false,
    disabledDays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    }
  }
];
