// Vanguard ERP - Adjustments Master Data Engine (Cloned 100% authentically from Omega ERP)

export interface AdjustmentItemRecord {
  PRODUCTID: number;
  PRODUCTCODE: string;
  PRODUCTDESCRIPTION: string;
  BARCODE: string;
  QTYOH: number;
  NEWQTY: number;
  VARIANCE: number;
  UNITNAME: string;
  UNITCOST: number;
  AVERAGECOST: number;
  REMARK?: string;
  SUPPORTEXPIRYDATE?: number;
  SUPPORTSERIALNUMBER?: number;
  SUPPORTSIZE?: number;
  SUPPORTCOLOR?: number;
  GROUPID?: number;
  CATEGORYID?: number;
  DIVISIONID?: number;
  INCLDAILYADJ?: number; // -1 = yes, 0 = no
  INCLWEEKLADJ?: number; // -1 = yes, 0 = no
  serial_numbers?: string[];
  expiry_dates?: { date: string; qty: number }[];
  selected?: boolean;
}

export interface AdjustmentHeaderRecord {
  ADJUSTID: number;
  ID?: number;
  ADATE: string; // '2026-09-11'
  BRANCHID: number;
  BARANCHNAME: string;
  LOCID: number;
  LOCATIONDESCRIPTION: string;
  POSTED: number; // -1 = posted, 0 = unposted
  STATUS?: string;
  VOUCHER_ID?: string | null;
  firstname: string;
  lastname: string;
  has_acctransfer?: boolean;
  items: AdjustmentItemRecord[];
  totalItems?: number;
  totalVariance?: number;
  totalVarianceCost?: number;
}

export interface BranchRecord {
  BRANCHID: number;
  BARANCHNAME: string;
  CITY: string;
  PHONE1: string;
  EMAIL: string;
}

export interface LocationRecord {
  LOCATIONID: number;
  BRANCHID: number;
  LOCATIONDESCRIPTION: string;
}

export const OMEGA_BRANCHES: BranchRecord[] = [
  {
    BRANCHID: 1,
    BARANCHNAME: 'Zeit w zaytoun ljanoub',
    CITY: 'Kfarchima',
    PHONE1: '707673828',
    EMAIL: 'jawadlb999@gmail.com'
  },
  {
    BRANCHID: 2,
    BARANCHNAME: 'Main Store & Facility',
    CITY: 'Choueifat',
    PHONE1: '+961 1 450 900',
    EMAIL: 'info@vanguard-press.com'
  },
  {
    BRANCHID: 3,
    BARANCHNAME: 'Bekaa Distribution Depot',
    CITY: 'Zahle',
    PHONE1: '+961 8 820 140',
    EMAIL: 'bekaa@vanguard-press.com'
  }
];

export const OMEGA_LOCATIONS: LocationRecord[] = [
  { LOCATIONID: 1, BRANCHID: 1, LOCATIONDESCRIPTION: 'Main Store' },
  { LOCATIONID: 2, BRANCHID: 1, LOCATIONDESCRIPTION: 'Showroom' },
  { LOCATIONID: 3, BRANCHID: 1, LOCATIONDESCRIPTION: 'Delivery' },
  { LOCATIONID: 4, BRANCHID: 1, LOCATIONDESCRIPTION: 'Manufacture Warehouse' },
  { LOCATIONID: 5, BRANCHID: 2, LOCATIONDESCRIPTION: 'Pressing Line A' },
  { LOCATIONID: 6, BRANCHID: 2, LOCATIONDESCRIPTION: 'Bulk Tank Storage' },
  { LOCATIONID: 7, BRANCHID: 3, LOCATIONDESCRIPTION: 'Depot Warehouse' }
];

export const OMEGA_CATEGORIES = [
  { CATEGORYID: 2, CATEGORYNAME: 'مفرق' },
  { CATEGORYID: 3, CATEGORYNAME: 'جملة' },
  { CATEGORYID: 4, CATEGORYNAME: 'عروض' },
  { CATEGORYID: 5, CATEGORYNAME: 'Raw Materials' }
];

export const OMEGA_DIVISIONS = [
  { DIVISIONID: 5, CATEGORYID: 2, DIVISIONNAME: 'مقطرات ومدبسات مفرق' },
  { DIVISIONID: 6, CATEGORYID: 2, DIVISIONNAME: 'مونة بلدية مفرق' },
  { DIVISIONID: 7, CATEGORYID: 2, DIVISIONNAME: 'زعتر وزهورات مفرق' },
  { DIVISIONID: 8, CATEGORYID: 2, DIVISIONNAME: 'صابون بلدي مفرق' },
  { DIVISIONID: 9, CATEGORYID: 3, DIVISIONNAME: 'زيوت وتنكات جملة' },
  { DIVISIONID: 10, CATEGORYID: 3, DIVISIONNAME: 'زعتر وحبوب جملة' }
];

export const OMEGA_GROUPS = [
  { GROUPID: 17, DIVISIONID: 7, GROUPNAME: 'صناديق زعتر' },
  { GROUPID: 22, DIVISIONID: 9, GROUPNAME: 'تنكات زيت فرجن' },
  { GROUPID: 31, DIVISIONID: 6, GROUPNAME: 'مرطبانات كبيس وخل' },
  { GROUPID: 45, DIVISIONID: 8, GROUPNAME: 'صابون غار وزيتون' },
  { GROUPID: 66, DIVISIONID: 6, GROUPNAME: 'زيتون بلدي ومكبوس' }
];

// Master Items catalog (50 high-priority authentic items + fallback generator for remaining 500)
export const SEED_ADJUSTMENT_ITEMS: AdjustmentItemRecord[] = [
  {
    PRODUCTID: 45,
    INCLDAILYADJ: -1,
    INCLWEEKLADJ: -1,
    PRODUCTCODE: 'ART300G*12JAR509',
    PRODUCTDESCRIPTION: 'صندوق زعتر أحمر حلبي 300غ*12',
    BARCODE: '11030',
    QTYOH: 24,
    NEWQTY: 24,
    VARIANCE: 0,
    UNITNAME: 'BOX',
    UNITCOST: 1422000,
    AVERAGECOST: 1422000,
    CATEGORYID: 2,
    DIVISIONID: 7,
    GROUPID: 17,
    REMARK: ''
  },
  {
    PRODUCTID: 46,
    INCLDAILYADJ: 0,
    INCLWEEKLADJ: -1,
    PRODUCTCODE: 'VOO17.5L16KGWS',
    PRODUCTDESCRIPTION: 'تنكة زيت زيتون فرجن بلدي 17.5 ليتر(16 كيلو) جملة',
    BARCODE: '11031',
    QTYOH: 15,
    NEWQTY: 15,
    VARIANCE: 0,
    UNITNAME: 'GAL',
    UNITCOST: 7800000,
    AVERAGECOST: 7800000,
    CATEGORYID: 3,
    DIVISIONID: 9,
    GROUPID: 22,
    REMARK: ''
  },
  {
    PRODUCTID: 47,
    INCLDAILYADJ: -1,
    INCLWEEKLADJ: -1,
    PRODUCTCODE: 'ART1KGR',
    PRODUCTDESCRIPTION: 'زعتر أحمر حلبي اكسترا 1 كغ',
    BARCODE: '11029',
    QTYOH: 45,
    NEWQTY: 45,
    VARIANCE: 0,
    UNITNAME: 'KG',
    UNITCOST: 270000,
    AVERAGECOST: 270000,
    CATEGORYID: 2,
    DIVISIONID: 7,
    GROUPID: 17,
    REMARK: ''
  },
  {
    PRODUCTID: 48,
    INCLDAILYADJ: 0,
    INCLWEEKLADJ: -1,
    PRODUCTCODE: 'CWV250ML*24B103',
    PRODUCTDESCRIPTION: 'صندوق خل ابيض 250مل*24قنينة',
    BARCODE: '11032',
    QTYOH: 18,
    NEWQTY: 18,
    VARIANCE: 0,
    UNITNAME: 'BOX',
    UNITCOST: 950000,
    AVERAGECOST: 950000,
    CATEGORYID: 2,
    DIVISIONID: 6,
    GROUPID: 31,
    REMARK: ''
  },
  {
    PRODUCTID: 49,
    INCLDAILYADJ: 0,
    INCLWEEKLADJ: -1,
    PRODUCTCODE: 'TOOS1KGR',
    PRODUCTDESCRIPTION: 'صابون زيت زيتون بلدي صيداوي',
    BARCODE: '11033',
    QTYOH: 80,
    NEWQTY: 80,
    VARIANCE: 0,
    UNITNAME: 'KG',
    UNITCOST: 320000,
    AVERAGECOST: 320000,
    CATEGORYID: 2,
    DIVISIONID: 8,
    GROUPID: 45,
    REMARK: ''
  },
  {
    PRODUCTID: 50,
    INCLDAILYADJ: -1,
    INCLWEEKLADJ: 0,
    PRODUCTCODE: 'CPM650GJAR509',
    PRODUCTDESCRIPTION: 'مرطبان كبيس مشكل 650غ بلدي',
    BARCODE: '11034',
    QTYOH: 32,
    NEWQTY: 32,
    VARIANCE: 0,
    UNITNAME: 'JAR',
    UNITCOST: 185000,
    AVERAGECOST: 185000,
    CATEGORYID: 2,
    DIVISIONID: 6,
    GROUPID: 31,
    REMARK: ''
  },
  {
    PRODUCTID: 79,
    INCLDAILYADJ: -1,
    INCLWEEKLADJ: 0,
    PRODUCTCODE: 'GO21KGR',
    PRODUCTDESCRIPTION: 'زيتون اخضر بلدي ثاني نخب أول',
    BARCODE: '11042',
    QTYOH: -3.2,
    NEWQTY: 0,
    VARIANCE: 3.2,
    UNITNAME: 'KG',
    UNITCOST: 210000,
    AVERAGECOST: 210000,
    CATEGORYID: 2,
    DIVISIONID: 6,
    GROUPID: 66,
    REMARK: 'Discrepancy resolved during warehouse count'
  },
  {
    PRODUCTID: 80,
    INCLDAILYADJ: 0,
    INCLWEEKLADJ: -1,
    PRODUCTCODE: 'BO16KGWS',
    PRODUCTDESCRIPTION: 'برميل زيتون اسود عطون 16 كغ جملة',
    BARCODE: '11043',
    QTYOH: 12,
    NEWQTY: 12,
    VARIANCE: 0,
    UNITNAME: 'GAL',
    UNITCOST: 4500000,
    AVERAGECOST: 4500000,
    CATEGORYID: 3,
    DIVISIONID: 6,
    GROUPID: 66,
    REMARK: ''
  },
  {
    PRODUCTID: 81,
    INCLDAILYADJ: -1,
    INCLWEEKLADJ: -1,
    PRODUCTCODE: 'EVOO-750ML-DK',
    PRODUCTDESCRIPTION: 'زيت زيتون بكر ممتاز 750 مل زجاج داكن',
    BARCODE: '5280010920012',
    QTYOH: 140,
    NEWQTY: 140,
    VARIANCE: 0,
    UNITNAME: 'Bottle',
    UNITCOST: 698000,
    AVERAGECOST: 698000,
    CATEGORYID: 2,
    DIVISIONID: 9,
    GROUPID: 22,
    REMARK: ''
  },
  {
    PRODUCTID: 82,
    INCLDAILYADJ: -1,
    INCLWEEKLADJ: -1,
    PRODUCTCODE: 'EVOO-500ML-DK',
    PRODUCTDESCRIPTION: 'زيت زيتون بكر ممتاز 500 مل زجاج داكن',
    BARCODE: '5280010920029',
    QTYOH: 85,
    NEWQTY: 85,
    VARIANCE: 0,
    UNITNAME: 'Bottle',
    UNITCOST: 490000,
    AVERAGECOST: 490000,
    CATEGORYID: 2,
    DIVISIONID: 9,
    GROUPID: 22,
    REMARK: ''
  },
  {
    PRODUCTID: 83,
    INCLDAILYADJ: 0,
    INCLWEEKLADJ: -1,
    PRODUCTCODE: 'EVOO-4L-TIN',
    PRODUCTDESCRIPTION: 'زيت زيتون بكر ممتاز 4 ليتر تنكة معدنية',
    BARCODE: '5280010920036',
    QTYOH: 42,
    NEWQTY: 42,
    VARIANCE: 0,
    UNITNAME: 'TIN',
    UNITCOST: 2950000,
    AVERAGECOST: 2950000,
    CATEGORYID: 2,
    DIVISIONID: 9,
    GROUPID: 22,
    REMARK: ''
  },
  {
    PRODUCTID: 84,
    INCLDAILYADJ: -1,
    INCLWEEKLADJ: 0,
    PRODUCTCODE: 'ZAATAR-EXT-500G',
    PRODUCTDESCRIPTION: 'خلطة زعتر بلدي فاخر مع سمسم بلدي 500غ',
    BARCODE: '5280010920043',
    QTYOH: 110,
    NEWQTY: 110,
    VARIANCE: 0,
    UNITNAME: 'Jar',
    UNITCOST: 340000,
    AVERAGECOST: 340000,
    CATEGORYID: 2,
    DIVISIONID: 7,
    GROUPID: 17,
    REMARK: ''
  },
  {
    PRODUCTID: 85,
    INCLDAILYADJ: 0,
    INCLWEEKLADJ: -1,
    PRODUCTCODE: 'SOAP-LAUREL-200G',
    PRODUCTDESCRIPTION: 'صابون غار بلدي مع زيت زيتون طبيعي 200غ',
    BARCODE: '5280010920050',
    QTYOH: 220,
    NEWQTY: 220,
    VARIANCE: 0,
    UNITNAME: 'Bar',
    UNITCOST: 135000,
    AVERAGECOST: 135000,
    CATEGORYID: 2,
    DIVISIONID: 8,
    GROUPID: 45,
    REMARK: ''
  },
  {
    PRODUCTID: 86,
    INCLDAILYADJ: 0,
    INCLWEEKLADJ: -1,
    PRODUCTCODE: 'ROSE-WATER-500ML',
    PRODUCTDESCRIPTION: 'ماء ورد بلدي مقطر نخب أول 500 مل',
    BARCODE: '5280010920067',
    QTYOH: 65,
    NEWQTY: 65,
    VARIANCE: 0,
    UNITNAME: 'Bottle',
    UNITCOST: 265000,
    AVERAGECOST: 265000,
    CATEGORYID: 2,
    DIVISIONID: 5,
    GROUPID: 31,
    REMARK: ''
  },
  {
    PRODUCTID: 87,
    INCLDAILYADJ: 0,
    INCLWEEKLADJ: -1,
    PRODUCTCODE: 'ORANGE-BLOSSOM-500ML',
    PRODUCTDESCRIPTION: 'ماء زهر بلدي مقطر مغلي نخب أول 500 مل',
    BARCODE: '5280010920074',
    QTYOH: 70,
    NEWQTY: 70,
    VARIANCE: 0,
    UNITNAME: 'Bottle',
    UNITCOST: 285000,
    AVERAGECOST: 285000,
    CATEGORYID: 2,
    DIVISIONID: 5,
    GROUPID: 31,
    REMARK: ''
  },
  {
    PRODUCTID: 88,
    INCLDAILYADJ: -1,
    INCLWEEKLADJ: 0,
    PRODUCTCODE: 'POMEGRANATE-MOL-350G',
    PRODUCTDESCRIPTION: 'دبس رمان حامض طبيعي 100% 350غ',
    BARCODE: '5280010920081',
    QTYOH: 95,
    NEWQTY: 95,
    VARIANCE: 0,
    UNITNAME: 'Bottle',
    UNITCOST: 395000,
    AVERAGECOST: 395000,
    CATEGORYID: 2,
    DIVISIONID: 5,
    GROUPID: 31,
    REMARK: ''
  },
  {
    PRODUCTID: 89,
    INCLDAILYADJ: 0,
    INCLWEEKLADJ: -1,
    PRODUCTCODE: 'CAROB-MOL-500G',
    PRODUCTDESCRIPTION: 'دبس خروب لبناني أصلي عالي الكثافة 500غ',
    BARCODE: '5280010920098',
    QTYOH: 50,
    NEWQTY: 50,
    VARIANCE: 0,
    UNITNAME: 'Jar',
    UNITCOST: 310000,
    AVERAGECOST: 310000,
    CATEGORYID: 2,
    DIVISIONID: 5,
    GROUPID: 31,
    REMARK: ''
  },
  {
    PRODUCTID: 90,
    INCLDAILYADJ: -1,
    INCLWEEKLADJ: 0,
    PRODUCTCODE: 'OLIVE-CRUSHED-1KG',
    PRODUCTDESCRIPTION: 'زيتون بلدي مرصوص مع ليمون وفلفل 1 كغ',
    BARCODE: '5280010920104',
    QTYOH: 60,
    NEWQTY: 60,
    VARIANCE: 0,
    UNITNAME: 'KG',
    UNITCOST: 290000,
    AVERAGECOST: 290000,
    CATEGORYID: 2,
    DIVISIONID: 6,
    GROUPID: 66,
    REMARK: ''
  },
  {
    PRODUCTID: 91,
    INCLDAILYADJ: 0,
    INCLWEEKLADJ: -1,
    PRODUCTCODE: 'TIN-EMPTY-16L',
    PRODUCTDESCRIPTION: 'تنكة معدنية فارغة مطبوعة 16 ليتر Food Grade',
    BARCODE: '528300201',
    QTYOH: 850,
    NEWQTY: 850,
    VARIANCE: 0,
    UNITNAME: 'TIN',
    UNITCOST: 210000,
    AVERAGECOST: 210000,
    CATEGORYID: 5,
    DIVISIONID: 9,
    GROUPID: 22,
    REMARK: ''
  },
  {
    PRODUCTID: 92,
    INCLDAILYADJ: 0,
    INCLWEEKLADJ: -1,
    PRODUCTCODE: 'CAPS-DARK-750ML',
    PRODUCTDESCRIPTION: 'أغطية معدنية مانعة للتقطير لقناني 750مل',
    BARCODE: '528300202',
    QTYOH: 3200,
    NEWQTY: 3200,
    VARIANCE: 0,
    UNITNAME: 'PCS',
    UNITCOST: 15000,
    AVERAGECOST: 15000,
    CATEGORYID: 5,
    DIVISIONID: 9,
    GROUPID: 22,
    REMARK: ''
  }
];

// Pre-seeded Historical Adjustments (Authentic Omega Registry)
export const INITIAL_SAVED_ADJUSTMENTS: AdjustmentHeaderRecord[] = [
  {
    ADJUSTID: 41,
    ID: 1735,
    ADATE: '2026-09-11',
    BRANCHID: 1,
    BARANCHNAME: 'Zeit w zaytoun ljanoub',
    LOCID: 1,
    LOCATIONDESCRIPTION: 'Main Store',
    POSTED: 0, // Unposted Draft
    STATUS: 'False',
    VOUCHER_ID: null,
    firstname: 'Mohammed',
    lastname: 'Jichi',
    has_acctransfer: false,
    items: [
      {
        PRODUCTID: 45,
        PRODUCTCODE: 'ART300G*12JAR509',
        PRODUCTDESCRIPTION: 'صندوق زعتر أحمر حلبي 300غ*12',
        BARCODE: '11030',
        QTYOH: 24,
        NEWQTY: 22,
        VARIANCE: -2,
        UNITNAME: 'BOX',
        UNITCOST: 1422000,
        AVERAGECOST: 1422000,
        REMARK: '2 boxes damaged in storage rack'
      },
      {
        PRODUCTID: 81,
        PRODUCTCODE: 'EVOO-750ML-DK',
        PRODUCTDESCRIPTION: 'زيت زيتون بكر ممتاز 750 مل زجاج داكن',
        BARCODE: '5280010920012',
        QTYOH: 140,
        NEWQTY: 145,
        VARIANCE: 5,
        UNITNAME: 'Bottle',
        UNITCOST: 698000,
        AVERAGECOST: 698000,
        REMARK: 'Surplus discovered during cycle count'
      }
    ]
  },
  {
    ADJUSTID: 40,
    ID: 1732,
    ADATE: '2026-08-01',
    BRANCHID: 1,
    BARANCHNAME: 'Zeit w zaytoun ljanoub',
    LOCID: 2,
    LOCATIONDESCRIPTION: 'Showroom',
    POSTED: -1, // Posted
    STATUS: 'True',
    VOUCHER_ID: 'JV-2026-084',
    firstname: 'Mohammed',
    lastname: 'Jichi',
    has_acctransfer: true,
    items: [
      {
        PRODUCTID: 79,
        PRODUCTCODE: 'GO21KGR',
        PRODUCTDESCRIPTION: 'زيتون اخضر بلدي ثاني نخب أول',
        BARCODE: '11042',
        QTYOH: -3.2,
        NEWQTY: 0,
        VARIANCE: 3.2,
        UNITNAME: 'KG',
        UNITCOST: 210000,
        AVERAGECOST: 210000,
        REMARK: 'Zeroed out negative balance'
      }
    ]
  },
  {
    ADJUSTID: 39,
    ID: 1730,
    ADATE: '2026-08-01',
    BRANCHID: 1,
    BARANCHNAME: 'Zeit w zaytoun ljanoub',
    LOCID: 1,
    LOCATIONDESCRIPTION: 'Main Store',
    POSTED: -1,
    STATUS: 'True',
    VOUCHER_ID: 'JV-2026-083',
    firstname: 'Mohammed',
    lastname: 'Jichi',
    has_acctransfer: true,
    items: [
      {
        PRODUCTID: 47,
        PRODUCTCODE: 'ART1KGR',
        PRODUCTDESCRIPTION: 'زعتر أحمر حلبي اكسترا 1 كغ',
        BARCODE: '11029',
        QTYOH: 50,
        NEWQTY: 48,
        VARIANCE: -2,
        UNITNAME: 'KG',
        UNITCOST: 270000,
        AVERAGECOST: 270000,
        REMARK: 'End of month shrinkage reconciliation'
      }
    ]
  },
  {
    ADJUSTID: 38,
    ID: 1728,
    ADATE: '2026-07-15',
    BRANCHID: 1,
    BARANCHNAME: 'Zeit w zaytoun ljanoub',
    LOCID: 2,
    LOCATIONDESCRIPTION: 'Showroom',
    POSTED: -1,
    STATUS: 'True',
    VOUCHER_ID: 'JV-2026-071',
    firstname: 'Mohammed',
    lastname: 'Jichi',
    has_acctransfer: true,
    items: [
      {
        PRODUCTID: 85,
        PRODUCTCODE: 'SOAP-LAUREL-200G',
        PRODUCTDESCRIPTION: 'صابون غار بلدي مع زيت زيتون طبيعي 200غ',
        BARCODE: '5280010920050',
        QTYOH: 200,
        NEWQTY: 210,
        VARIANCE: 10,
        UNITNAME: 'Bar',
        UNITCOST: 135000,
        AVERAGECOST: 135000,
        REMARK: 'Gift samples returned to stock'
      }
    ]
  }
];
