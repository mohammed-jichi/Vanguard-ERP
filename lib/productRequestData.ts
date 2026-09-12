// Master Product Request Data Structures & Seed Data (Omega ERP 1:1 Match)

export interface ProductRequestLineItem {
  ID: number;
  ITEMID: number;
  ITEMCODE: string;
  ITEMDESCRIPTION: string;
  UNIT: string;
  QTYREQ: number;
  QTYAPP: number;
  QTYREC: number;
  QTYOH: number;
  COST: number;
  LOCID: number;
  LOCATIONDESCRIPTION: string;
  FROMBRANCHIDDETAILS: number;
  SUPPLIER: string;
  REMARK: string;
  checked?: boolean;
}

export interface ProductRequestHeader {
  ID: number;
  REQUESTNB: string;
  BRANCHID: number;
  TOBRANCH: string;
  FROMBRANCHID: number;
  FROMBRANCHNAME: string;
  FROMBRAND: number;
  LOCATIONID: number;
  LOCATIONDESCRIPTION: string;
  USERID: number;
  firstname: string;
  lastname: string;
  REQUESTEDBY: string;
  CURRENTDATE: string;
  DELIVERYDATE: string;
  REMARK: string;
  STATUS: 'Pending' | 'Approved' | 'Rejected' | 'Confirmed';
  CONVERTED: number;
  APPROVEDBY?: string;
  APPROVEDDATE?: string;
  REJECTREASON?: string;
  ITEMS_COUNT: number;
  TOTAL_QTY: number;
  items: ProductRequestLineItem[];
}

export interface RejectReasonRecord {
  ID: number;
  DESCRIPTION: string;
  BRAND_ID: number;
}

export interface InventorySearchItem {
  ITEMID: number;
  ITEMCODE: string;
  ITEMDESCRIPTION: string;
  UNIT: string;
  COST: number;
  QTYOH: number;
  CATEGORYID: number;
  CATEGORY: string;
  BARCODE: string;
  SUPPLIER: string;
  IS_BELOW_MIN?: boolean;
  IS_RECOMMENDED?: boolean;
  RECOMMENDED_QTY?: number;
}

export interface RecurringPRTemplate {
  TEMPLATEID: number;
  TEMPLATENAME: string;
  BRANCHID: number;
  LOCATIONID: number;
  REMARK: string;
  items: Array<{
    ITEMID: number;
    ITEMCODE: string;
    ITEMDESCRIPTION: string;
    UNIT: string;
    QTYREQ: number;
    COST: number;
    REMARK: string;
  }>;
}

// Branches matching authentic Omega setup
export const OMEGA_PR_BRANCHES = [
  { BRANCHID: 1, BARANCHNAME: 'Zeit w zaytoun ljanoub', CODE: 'ZWZ-01', BRAND_ID: 9606 },
  { BRANCHID: 2, BARANCHNAME: 'Central Kitchen', CODE: 'CK-01', BRAND_ID: 9606 },
  { BRANCHID: 3, BARANCHNAME: 'Warehouse Beirut', CODE: 'WH-01', BRAND_ID: 9606 },
  { BRANCHID: 4, BARANCHNAME: 'Downtown Express', CODE: 'DT-02', BRAND_ID: 9606 },
  { BRANCHID: 5, BARANCHNAME: 'Hamra Branch', CODE: 'HM-03', BRAND_ID: 9606 }
];

// Locations per branch
export const OMEGA_PR_LOCATIONS = [
  { LOCATIONID: 1, BRANCHID: 1, FORBRANCH: 1, LOCATIONDESCRIPTION: 'Main Kitchen' },
  { LOCATIONID: 2, BRANCHID: 1, FORBRANCH: 1, LOCATIONDESCRIPTION: 'Front Bar' },
  { LOCATIONID: 3, BRANCHID: 1, FORBRANCH: 1, LOCATIONDESCRIPTION: 'Cold Storage' },
  { LOCATIONID: 4, BRANCHID: 2, FORBRANCH: 2, LOCATIONDESCRIPTION: 'Central Prep Area' },
  { LOCATIONID: 5, BRANCHID: 2, FORBRANCH: 2, LOCATIONDESCRIPTION: 'Bakery Station' },
  { LOCATIONID: 6, BRANCHID: 2, FORBRANCH: 2, LOCATIONDESCRIPTION: 'Cold Room - Dairy' },
  { LOCATIONID: 7, BRANCHID: 2, FORBRANCH: 2, LOCATIONDESCRIPTION: 'Cold Room - Meat' },
  { LOCATIONID: 8, BRANCHID: 3, FORBRANCH: 3, LOCATIONDESCRIPTION: 'Dry Goods Warehouse' },
  { LOCATIONID: 9, BRANCHID: 3, FORBRANCH: 3, LOCATIONDESCRIPTION: 'Bulk Packaging Depot' },
  { LOCATIONID: 10, BRANCHID: 4, FORBRANCH: 4, LOCATIONDESCRIPTION: 'Downtown Service Counter' },
  { LOCATIONID: 11, BRANCHID: 4, FORBRANCH: 4, LOCATIONDESCRIPTION: 'Downtown Storage' },
  { LOCATIONID: 12, BRANCHID: 5, FORBRANCH: 5, LOCATIONDESCRIPTION: 'Hamra Service Line' },
  { LOCATIONID: 13, BRANCHID: 5, FORBRANCH: 5, LOCATIONDESCRIPTION: 'Hamra Dry Storage' }
];

// Predefined Reject Reasons matching Omega
export const INITIAL_REJECT_REASONS: RejectReasonRecord[] = [
  { ID: 1, DESCRIPTION: 'Cancelled', BRAND_ID: 9606 },
  { ID: 2, DESCRIPTION: 'Out of Stock at Central Warehouse', BRAND_ID: 9606 },
  { ID: 3, DESCRIPTION: 'Item Discontinued', BRAND_ID: 9606 },
  { ID: 4, DESCRIPTION: 'Budget Limit Exceeded for Branch', BRAND_ID: 9606 },
  { ID: 5, DESCRIPTION: 'Excessive Quantity Requested', BRAND_ID: 9606 },
  { ID: 6, DESCRIPTION: 'Duplicate Product Request', BRAND_ID: 9606 },
  { ID: 7, DESCRIPTION: 'Delivery Schedule Conflicts', BRAND_ID: 9606 }
];

// Master Catalog for Inventory Search & Product Recommendations
export const MASTER_INVENTORY_ITEMS: InventorySearchItem[] = [
  { ITEMID: 101, ITEMCODE: 'PRD-TOM-01', ITEMDESCRIPTION: 'Fresh Tomatoes Grade A', UNIT: 'KG', COST: 1.25, QTYOH: 420, CATEGORYID: 1, CATEGORY: 'Fresh Produce', BARCODE: '6281001001', SUPPLIER: 'AgriFresh Farms', IS_RECOMMENDED: true, RECOMMENDED_QTY: 50 },
  { ITEMID: 102, ITEMCODE: 'PRD-CUC-02', ITEMDESCRIPTION: 'Organic Cucumbers', UNIT: 'KG', COST: 0.95, QTYOH: 280, CATEGORYID: 1, CATEGORY: 'Fresh Produce', BARCODE: '6281001002', SUPPLIER: 'AgriFresh Farms', IS_BELOW_MIN: true, RECOMMENDED_QTY: 30 },
  { ITEMID: 103, ITEMCODE: 'DRY-ZTR-01', ITEMDESCRIPTION: 'Authentic Wild Zaatar Premium', UNIT: 'KG', COST: 8.50, QTYOH: 150, CATEGORYID: 2, CATEGORY: 'Herbs & Spices', BARCODE: '6281001003', SUPPLIER: 'Levant Spices Co', IS_RECOMMENDED: true, RECOMMENDED_QTY: 25 },
  { ITEMID: 104, ITEMCODE: 'OIL-OLV-01', ITEMDESCRIPTION: 'Extra Virgin Olive Oil 5L', UNIT: 'TIN', COST: 32.00, QTYOH: 85, CATEGORYID: 3, CATEGORY: 'Oils & Fats', BARCODE: '6281001004', SUPPLIER: 'Koura Mills', IS_RECOMMENDED: true, RECOMMENDED_QTY: 10 },
  { ITEMID: 105, ITEMCODE: 'DAI-LAB-01', ITEMDESCRIPTION: 'Fresh Cow Milk Labneh', UNIT: 'KG', COST: 4.20, QTYOH: 95, CATEGORYID: 4, CATEGORY: 'Dairy Products', BARCODE: '6281001005', SUPPLIER: 'Bekaa Dairy', IS_BELOW_MIN: true, RECOMMENDED_QTY: 40 },
  { ITEMID: 106, ITEMCODE: 'DAI-HAL-02', ITEMDESCRIPTION: 'Traditional Halloumi Cheese', UNIT: 'KG', COST: 7.80, QTYOH: 65, CATEGORYID: 4, CATEGORY: 'Dairy Products', BARCODE: '6281001006', SUPPLIER: 'Bekaa Dairy', IS_RECOMMENDED: true, RECOMMENDED_QTY: 20 },
  { ITEMID: 107, ITEMCODE: 'BAK-FLR-01', ITEMDESCRIPTION: 'Flour Type 00 Bakers Grade 25kg', UNIT: 'BAG', COST: 18.50, QTYOH: 310, CATEGORYID: 5, CATEGORY: 'Bakery & Flour', BARCODE: '6281001007', SUPPLIER: 'Crown Mills', IS_RECOMMENDED: true, RECOMMENDED_QTY: 15 },
  { ITEMID: 108, ITEMCODE: 'BAK-YST-02', ITEMDESCRIPTION: 'Active Dry Instant Yeast 500g', UNIT: 'PACK', COST: 2.10, QTYOH: 120, CATEGORYID: 5, CATEGORY: 'Bakery & Flour', BARCODE: '6281001008', SUPPLIER: 'Crown Mills' },
  { ITEMID: 109, ITEMCODE: 'MEA-CHK-01', ITEMDESCRIPTION: 'Boneless Fresh Chicken Breast', UNIT: 'KG', COST: 5.40, QTYOH: 180, CATEGORYID: 6, CATEGORY: 'Poultry & Meat', BARCODE: '6281001009', SUPPLIER: 'Tanmia Poultry', IS_RECOMMENDED: true, RECOMMENDED_QTY: 60 },
  { ITEMID: 110, ITEMCODE: 'MEA-BEEF-02', ITEMDESCRIPTION: 'Minced Beef Lean 85/15', UNIT: 'KG', COST: 11.50, QTYOH: 140, CATEGORYID: 6, CATEGORY: 'Poultry & Meat', BARCODE: '6281001010', SUPPLIER: 'Prime Butchery', IS_BELOW_MIN: true, RECOMMENDED_QTY: 35 },
  { ITEMID: 111, ITEMCODE: 'PKG-BOX-01', ITEMDESCRIPTION: 'Manousheh Eco Delivery Box 28cm', UNIT: 'BUNDLE', COST: 14.00, QTYOH: 220, CATEGORYID: 7, CATEGORY: 'Packaging Materials', BARCODE: '6281001011', SUPPLIER: 'EcoPack Levant', IS_RECOMMENDED: true, RECOMMENDED_QTY: 20 },
  { ITEMID: 112, ITEMCODE: 'PKG-BAG-02', ITEMDESCRIPTION: 'Kraft Paper Takeaway Bags Medium', UNIT: 'BUNDLE', COST: 9.50, QTYOH: 190, CATEGORYID: 7, CATEGORY: 'Packaging Materials', BARCODE: '6281001012', SUPPLIER: 'EcoPack Levant' },
  { ITEMID: 113, ITEMCODE: 'BEV-TEA-01', ITEMDESCRIPTION: 'English Breakfast Tea Bags 100s', UNIT: 'BOX', COST: 3.80, QTYOH: 75, CATEGORYID: 8, CATEGORY: 'Beverages', BARCODE: '6281001013', SUPPLIER: 'Global Foods' },
  { ITEMID: 114, ITEMCODE: 'BEV-COF-02', ITEMDESCRIPTION: 'Dark Roasted Espresso Beans 1kg', UNIT: 'KG', COST: 16.00, QTYOH: 90, CATEGORYID: 8, CATEGORY: 'Beverages', BARCODE: '6281001014', SUPPLIER: 'Café Najjar', IS_RECOMMENDED: true, RECOMMENDED_QTY: 12 },
  { ITEMID: 115, ITEMCODE: 'CND-OLV-01', ITEMDESCRIPTION: 'Kalamata Black Olives Pitted', UNIT: 'JAR', COST: 4.50, QTYOH: 110, CATEGORYID: 9, CATEGORY: 'Condiments & Pickles', BARCODE: '6281001015', SUPPLIER: 'Levant Harvest' },
  { ITEMID: 116, ITEMCODE: 'CND-PCK-02', ITEMDESCRIPTION: 'Wild Lebanese Cucumber Pickles 5kg', UNIT: 'TIN', COST: 12.00, QTYOH: 80, CATEGORYID: 9, CATEGORY: 'Condiments & Pickles', BARCODE: '6281001016', SUPPLIER: 'Levant Harvest', IS_BELOW_MIN: true, RECOMMENDED_QTY: 8 },
  { ITEMID: 117, ITEMCODE: 'PRD-MNT-03', ITEMDESCRIPTION: 'Fresh Garden Mint Leaves', UNIT: 'BUNCH', COST: 0.40, QTYOH: 340, CATEGORYID: 1, CATEGORY: 'Fresh Produce', BARCODE: '6281001017', SUPPLIER: 'AgriFresh Farms', IS_RECOMMENDED: true, RECOMMENDED_QTY: 40 },
  { ITEMID: 118, ITEMCODE: 'DAI-AKW-03', ITEMDESCRIPTION: 'Desalted Akkawi Cheese', UNIT: 'KG', COST: 6.90, QTYOH: 85, CATEGORYID: 4, CATEGORY: 'Dairy Products', BARCODE: '6281001018', SUPPLIER: 'Bekaa Dairy', IS_RECOMMENDED: true, RECOMMENDED_QTY: 25 },
  { ITEMID: 119, ITEMCODE: 'CLN-SAN-01', ITEMDESCRIPTION: 'Food Grade Surface Sanitizer 5L', UNIT: 'JUG', COST: 15.00, QTYOH: 45, CATEGORYID: 10, CATEGORY: 'Hygiene & Cleaning', BARCODE: '6281001019', SUPPLIER: 'CleanPro Hygiene' },
  { ITEMID: 120, ITEMCODE: 'PKG-GLV-01', ITEMDESCRIPTION: 'Nitrile Food Prep Gloves Size M', UNIT: 'BOX', COST: 6.50, QTYOH: 160, CATEGORYID: 7, CATEGORY: 'Packaging Materials', BARCODE: '6281001020', SUPPLIER: 'CleanPro Hygiene', IS_RECOMMENDED: true, RECOMMENDED_QTY: 15 }
];

// Initial Seed Product Requests with full item breakdown
export const INITIAL_PRODUCT_REQUESTS: ProductRequestHeader[] = [
  {
    ID: 1001,
    REQUESTNB: 'PR-1001',
    BRANCHID: 1,
    TOBRANCH: 'Zeit w zaytoun ljanoub',
    FROMBRANCHID: 2,
    FROMBRANCHNAME: 'Central Kitchen',
    FROMBRAND: 9606,
    LOCATIONID: 1,
    LOCATIONDESCRIPTION: 'Main Kitchen',
    USERID: 501,
    firstname: 'Mohammed',
    lastname: 'Jichi',
    REQUESTEDBY: 'Mohammed Jichi',
    CURRENTDATE: '2026-09-10',
    DELIVERYDATE: '2026-09-12 08:00',
    REMARK: 'Urgent morning restock for weekend rush',
    STATUS: 'Pending',
    CONVERTED: 0,
    ITEMS_COUNT: 4,
    TOTAL_QTY: 135,
    items: [
      {
        ID: 1,
        ITEMID: 101,
        ITEMCODE: 'PRD-TOM-01',
        ITEMDESCRIPTION: 'Fresh Tomatoes Grade A',
        UNIT: 'KG',
        QTYREQ: 50,
        QTYAPP: 50,
        QTYREC: 0,
        QTYOH: 420,
        COST: 1.25,
        LOCID: 4,
        LOCATIONDESCRIPTION: 'Central Prep Area',
        FROMBRANCHIDDETAILS: 2,
        SUPPLIER: 'AgriFresh Farms',
        REMARK: 'Firm ripe tomatoes only',
        checked: true
      },
      {
        ID: 2,
        ITEMID: 103,
        ITEMCODE: 'DRY-ZTR-01',
        ITEMDESCRIPTION: 'Authentic Wild Zaatar Premium',
        UNIT: 'KG',
        QTYREQ: 25,
        QTYAPP: 25,
        QTYREC: 0,
        QTYOH: 150,
        COST: 8.50,
        LOCID: 4,
        LOCATIONDESCRIPTION: 'Central Prep Area',
        FROMBRANCHIDDETAILS: 2,
        SUPPLIER: 'Levant Spices Co',
        REMARK: 'Original blend',
        checked: true
      },
      {
        ID: 3,
        ITEMID: 105,
        ITEMCODE: 'DAI-LAB-01',
        ITEMDESCRIPTION: 'Fresh Cow Milk Labneh',
        UNIT: 'KG',
        QTYREQ: 40,
        QTYAPP: 40,
        QTYREC: 0,
        QTYOH: 95,
        COST: 4.20,
        LOCID: 6,
        LOCATIONDESCRIPTION: 'Cold Room - Dairy',
        FROMBRANCHIDDETAILS: 2,
        SUPPLIER: 'Bekaa Dairy',
        REMARK: 'Cold storage transport',
        checked: true
      },
      {
        ID: 4,
        ITEMID: 106,
        ITEMCODE: 'DAI-HAL-02',
        ITEMDESCRIPTION: 'Traditional Halloumi Cheese',
        UNIT: 'KG',
        QTYREQ: 20,
        QTYAPP: 20,
        QTYREC: 0,
        QTYOH: 65,
        COST: 7.80,
        LOCID: 6,
        LOCATIONDESCRIPTION: 'Cold Room - Dairy',
        FROMBRANCHIDDETAILS: 2,
        SUPPLIER: 'Bekaa Dairy',
        REMARK: 'Vacuum sealed portions',
        checked: true
      }
    ]
  },
  {
    ID: 1002,
    REQUESTNB: 'PR-1002',
    BRANCHID: 4,
    TOBRANCH: 'Downtown Express',
    FROMBRANCHID: 2,
    FROMBRANCHNAME: 'Central Kitchen',
    FROMBRAND: 9606,
    LOCATIONID: 10,
    LOCATIONDESCRIPTION: 'Downtown Service Counter',
    USERID: 502,
    firstname: 'Rami',
    lastname: 'Khoury',
    REQUESTEDBY: 'Rami Khoury',
    CURRENTDATE: '2026-09-09',
    DELIVERYDATE: '2026-09-11 09:30',
    REMARK: 'Express station daily replenishment',
    STATUS: 'Approved',
    CONVERTED: 0,
    APPROVEDBY: 'Admin Operations',
    APPROVEDDATE: '2026-09-10 14:15',
    ITEMS_COUNT: 3,
    TOTAL_QTY: 85,
    items: [
      {
        ID: 5,
        ITEMID: 109,
        ITEMCODE: 'MEA-CHK-01',
        ITEMDESCRIPTION: 'Boneless Fresh Chicken Breast',
        UNIT: 'KG',
        QTYREQ: 50,
        QTYAPP: 50,
        QTYREC: 0,
        QTYOH: 180,
        COST: 5.40,
        LOCID: 7,
        LOCATIONDESCRIPTION: 'Cold Room - Meat',
        FROMBRANCHIDDETAILS: 2,
        SUPPLIER: 'Tanmia Poultry',
        REMARK: 'Pre-marinated if available',
        checked: true
      },
      {
        ID: 6,
        ITEMID: 114,
        ITEMCODE: 'BEV-COF-02',
        ITEMDESCRIPTION: 'Dark Roasted Espresso Beans 1kg',
        UNIT: 'KG',
        QTYREQ: 15,
        QTYAPP: 15,
        QTYREC: 0,
        QTYOH: 90,
        COST: 16.00,
        LOCID: 4,
        LOCATIONDESCRIPTION: 'Central Prep Area',
        FROMBRANCHIDDETAILS: 2,
        SUPPLIER: 'Café Najjar',
        REMARK: 'Fresh batch roasted this week',
        checked: true
      },
      {
        ID: 7,
        ITEMID: 118,
        ITEMCODE: 'DAI-AKW-03',
        ITEMDESCRIPTION: 'Desalted Akkawi Cheese',
        UNIT: 'KG',
        QTYREQ: 20,
        QTYAPP: 20,
        QTYREC: 0,
        QTYOH: 85,
        COST: 6.90,
        LOCID: 6,
        LOCATIONDESCRIPTION: 'Cold Room - Dairy',
        FROMBRANCHIDDETAILS: 2,
        SUPPLIER: 'Bekaa Dairy',
        REMARK: 'Drained and ready for service',
        checked: true
      }
    ]
  },
  {
    ID: 1003,
    REQUESTNB: 'PR-1003',
    BRANCHID: 5,
    TOBRANCH: 'Hamra Branch',
    FROMBRANCHID: 3,
    FROMBRANCHNAME: 'Warehouse Beirut',
    FROMBRAND: 9606,
    LOCATIONID: 13,
    LOCATIONDESCRIPTION: 'Hamra Dry Storage',
    USERID: 503,
    firstname: 'Zeina',
    lastname: 'Farhat',
    REQUESTEDBY: 'Zeina Farhat',
    CURRENTDATE: '2026-09-08',
    DELIVERYDATE: '2026-09-10 11:00',
    REMARK: 'Dry goods packaging replenishment',
    STATUS: 'Confirmed',
    CONVERTED: -1,
    APPROVEDBY: 'Logistics Lead',
    APPROVEDDATE: '2026-09-09 10:00',
    ITEMS_COUNT: 3,
    TOTAL_QTY: 55,
    items: [
      {
        ID: 8,
        ITEMID: 111,
        ITEMCODE: 'PKG-BOX-01',
        ITEMDESCRIPTION: 'Manousheh Eco Delivery Box 28cm',
        UNIT: 'BUNDLE',
        QTYREQ: 25,
        QTYAPP: 25,
        QTYREC: 25,
        QTYOH: 220,
        COST: 14.00,
        LOCID: 9,
        LOCATIONDESCRIPTION: 'Bulk Packaging Depot',
        FROMBRANCHIDDETAILS: 3,
        SUPPLIER: 'EcoPack Levant',
        REMARK: 'Standard logo print',
        checked: true
      },
      {
        ID: 9,
        ITEMID: 112,
        ITEMCODE: 'PKG-BAG-02',
        ITEMDESCRIPTION: 'Kraft Paper Takeaway Bags Medium',
        UNIT: 'BUNDLE',
        QTYREQ: 20,
        QTYAPP: 20,
        QTYREC: 20,
        QTYOH: 190,
        COST: 9.50,
        LOCID: 9,
        LOCATIONDESCRIPTION: 'Bulk Packaging Depot',
        FROMBRANCHIDDETAILS: 3,
        SUPPLIER: 'EcoPack Levant',
        REMARK: 'Bundles of 100',
        checked: true
      },
      {
        ID: 10,
        ITEMID: 120,
        ITEMCODE: 'PKG-GLV-01',
        ITEMDESCRIPTION: 'Nitrile Food Prep Gloves Size M',
        UNIT: 'BOX',
        QTYREQ: 10,
        QTYAPP: 10,
        QTYREC: 10,
        QTYOH: 160,
        COST: 6.50,
        LOCID: 9,
        LOCATIONDESCRIPTION: 'Bulk Packaging Depot',
        FROMBRANCHIDDETAILS: 3,
        SUPPLIER: 'CleanPro Hygiene',
        REMARK: 'Blue food contact approved',
        checked: true
      }
    ]
  },
  {
    ID: 1004,
    REQUESTNB: 'PR-1004',
    BRANCHID: 1,
    TOBRANCH: 'Zeit w zaytoun ljanoub',
    FROMBRANCHID: 3,
    FROMBRANCHNAME: 'Warehouse Beirut',
    FROMBRAND: 9606,
    LOCATIONID: 3,
    LOCATIONDESCRIPTION: 'Cold Storage',
    USERID: 501,
    firstname: 'Mohammed',
    lastname: 'Jichi',
    REQUESTEDBY: 'Mohammed Jichi',
    CURRENTDATE: '2026-09-07',
    DELIVERYDATE: '2026-09-09 15:00',
    REMARK: 'Specialty olive tins request',
    STATUS: 'Rejected',
    CONVERTED: 0,
    REJECTREASON: 'Out of Stock at Central Warehouse',
    ITEMS_COUNT: 2,
    TOTAL_QTY: 25,
    items: [
      {
        ID: 11,
        ITEMID: 104,
        ITEMCODE: 'OIL-OLV-01',
        ITEMDESCRIPTION: 'Extra Virgin Olive Oil 5L',
        UNIT: 'TIN',
        QTYREQ: 15,
        QTYAPP: 0,
        QTYREC: 0,
        QTYOH: 85,
        COST: 32.00,
        LOCID: 8,
        LOCATIONDESCRIPTION: 'Dry Goods Warehouse',
        FROMBRANCHIDDETAILS: 3,
        SUPPLIER: 'Koura Mills',
        REMARK: 'New harvest vintage',
        checked: false
      },
      {
        ID: 12,
        ITEMID: 115,
        ITEMCODE: 'CND-OLV-01',
        ITEMDESCRIPTION: 'Kalamata Black Olives Pitted',
        UNIT: 'JAR',
        QTYREQ: 10,
        QTYAPP: 0,
        QTYREC: 0,
        QTYOH: 110,
        COST: 4.50,
        LOCID: 8,
        LOCATIONDESCRIPTION: 'Dry Goods Warehouse',
        FROMBRANCHIDDETAILS: 3,
        SUPPLIER: 'Levant Harvest',
        REMARK: 'Pitted in brine',
        checked: false
      }
    ]
  },
  {
    ID: 1005,
    REQUESTNB: 'PR-1005',
    BRANCHID: 4,
    TOBRANCH: 'Downtown Express',
    FROMBRANCHID: 2,
    FROMBRANCHNAME: 'Central Kitchen',
    FROMBRAND: 9606,
    LOCATIONID: 10,
    LOCATIONDESCRIPTION: 'Downtown Service Counter',
    USERID: 502,
    firstname: 'Rami',
    lastname: 'Khoury',
    REQUESTEDBY: 'Rami Khoury',
    CURRENTDATE: '2026-09-11',
    DELIVERYDATE: '2026-09-13 07:30',
    REMARK: 'Weekend rush ingredients',
    STATUS: 'Pending',
    CONVERTED: 0,
    ITEMS_COUNT: 3,
    TOTAL_QTY: 90,
    items: [
      {
        ID: 13,
        ITEMID: 107,
        ITEMCODE: 'BAK-FLR-01',
        ITEMDESCRIPTION: 'Flour Type 00 Bakers Grade 25kg',
        UNIT: 'BAG',
        QTYREQ: 20,
        QTYAPP: 20,
        QTYREC: 0,
        QTYOH: 310,
        COST: 18.50,
        LOCID: 5,
        LOCATIONDESCRIPTION: 'Bakery Station',
        FROMBRANCHIDDETAILS: 2,
        SUPPLIER: 'Crown Mills',
        REMARK: 'Check expiry date',
        checked: true
      },
      {
        ID: 14,
        ITEMID: 110,
        ITEMCODE: 'MEA-BEEF-02',
        ITEMDESCRIPTION: 'Minced Beef Lean 85/15',
        UNIT: 'KG',
        QTYREQ: 30,
        QTYAPP: 30,
        QTYREC: 0,
        QTYOH: 140,
        COST: 11.50,
        LOCID: 7,
        LOCATIONDESCRIPTION: 'Cold Room - Meat',
        FROMBRANCHIDDETAILS: 2,
        SUPPLIER: 'Prime Butchery',
        REMARK: 'Double minced',
        checked: true
      },
      {
        ID: 15,
        ITEMID: 117,
        ITEMCODE: 'PRD-MNT-03',
        ITEMDESCRIPTION: 'Fresh Garden Mint Leaves',
        UNIT: 'BUNCH',
        QTYREQ: 40,
        QTYAPP: 40,
        QTYREC: 0,
        QTYOH: 340,
        COST: 0.40,
        LOCID: 4,
        LOCATIONDESCRIPTION: 'Central Prep Area',
        FROMBRANCHIDDETAILS: 2,
        SUPPLIER: 'AgriFresh Farms',
        REMARK: 'Crisp green bunches',
        checked: true
      }
    ]
  },
  {
    ID: 1006,
    REQUESTNB: 'PR-1006',
    BRANCHID: 5,
    TOBRANCH: 'Hamra Branch',
    FROMBRANCHID: 2,
    FROMBRANCHNAME: 'Central Kitchen',
    FROMBRAND: 9606,
    LOCATIONID: 12,
    LOCATIONDESCRIPTION: 'Hamra Service Line',
    USERID: 503,
    firstname: 'Zeina',
    lastname: 'Farhat',
    REQUESTEDBY: 'Zeina Farhat',
    CURRENTDATE: '2026-09-11',
    DELIVERYDATE: '2026-09-12 10:00',
    REMARK: 'Daily produce & cheese batch',
    STATUS: 'Pending',
    CONVERTED: 0,
    ITEMS_COUNT: 2,
    TOTAL_QTY: 50,
    items: [
      {
        ID: 16,
        ITEMID: 101,
        ITEMCODE: 'PRD-TOM-01',
        ITEMDESCRIPTION: 'Fresh Tomatoes Grade A',
        UNIT: 'KG',
        QTYREQ: 30,
        QTYAPP: 30,
        QTYREC: 0,
        QTYOH: 420,
        COST: 1.25,
        LOCID: 4,
        LOCATIONDESCRIPTION: 'Central Prep Area',
        FROMBRANCHIDDETAILS: 2,
        SUPPLIER: 'AgriFresh Farms',
        REMARK: 'Salad grade',
        checked: true
      },
      {
        ID: 17,
        ITEMID: 106,
        ITEMCODE: 'DAI-HAL-02',
        ITEMDESCRIPTION: 'Traditional Halloumi Cheese',
        UNIT: 'KG',
        QTYREQ: 20,
        QTYAPP: 20,
        QTYREC: 0,
        QTYOH: 65,
        COST: 7.80,
        LOCID: 6,
        LOCATIONDESCRIPTION: 'Cold Room - Dairy',
        FROMBRANCHIDDETAILS: 2,
        SUPPLIER: 'Bekaa Dairy',
        REMARK: 'Grill sliced',
        checked: true
      }
    ]
  }
];

export const INITIAL_PR_TEMPLATES: RecurringPRTemplate[] = [
  {
    TEMPLATEID: 1,
    TEMPLATENAME: 'Standard Monday Restock',
    BRANCHID: 1,
    LOCATIONID: 1,
    REMARK: 'Standard opening week produce and dairy kit',
    items: [
      { ITEMID: 101, ITEMCODE: 'PRD-TOM-01', ITEMDESCRIPTION: 'Fresh Tomatoes Grade A', UNIT: 'KG', QTYREQ: 40, COST: 1.25, REMARK: 'Standard stock' },
      { ITEMID: 103, ITEMCODE: 'DRY-ZTR-01', ITEMDESCRIPTION: 'Authentic Wild Zaatar Premium', UNIT: 'KG', QTYREQ: 15, COST: 8.50, REMARK: 'Weekly supply' },
      { ITEMID: 105, ITEMCODE: 'DAI-LAB-01', ITEMDESCRIPTION: 'Fresh Cow Milk Labneh', UNIT: 'KG', QTYREQ: 25, COST: 4.20, REMARK: 'Fresh Monday batch' }
    ]
  },
  {
    TEMPLATEID: 2,
    TEMPLATENAME: 'Weekend Mega Prep',
    BRANCHID: 1,
    LOCATIONID: 1,
    REMARK: 'High volume weekend preparation ingredients',
    items: [
      { ITEMID: 101, ITEMCODE: 'PRD-TOM-01', ITEMDESCRIPTION: 'Fresh Tomatoes Grade A', UNIT: 'KG', QTYREQ: 80, COST: 1.25, REMARK: 'Bulk crate' },
      { ITEMID: 107, ITEMCODE: 'BAK-FLR-01', ITEMDESCRIPTION: 'Flour Type 00 Bakers Grade 25kg', UNIT: 'BAG', QTYREQ: 25, COST: 18.50, REMARK: 'Baking station' },
      { ITEMID: 109, ITEMCODE: 'MEA-CHK-01', ITEMDESCRIPTION: 'Boneless Fresh Chicken Breast', UNIT: 'KG', QTYREQ: 60, COST: 5.40, REMARK: 'Marinated shawarma' }
    ]
  }
];

// Authentic Omega Product Request Reports Taxonomy
export const OMEGA_PR_REPORTS_LIST = [
  {
    REPORTID: 405,
    REPORTNAME: 'Qty requested by item',
    REPORTGROUP: '',
    MODULENAME: 'Product Request',
    CATEGORYNAME: 'Product Request Reports',
    GROUPNAME: 'Product Request Reports',
    SCREEN_CATEGORYNAME: 'Product Request Reports',
    SCREEN_GROUPNAME: 'Product Request Reports',
    REPORTFILENAME: '',
    REPORTFILENAME_RETAIL: '',
    SORTING: 1,
    hide: 0,
    customized: 0,
    allowed_range: null,
    screen_category_sorting: 1,
    screen_group_sorting: 1,
    recommended: 0,
    is_jasper: 1,
    linked_to: null,
    childs: [
      {
        REPORTID: 405,
        REPORTNAME: 'Qty requested by item',
        REPORTGROUP: '',
        MODULENAME: 'Product Request',
        CATEGORYNAME: 'Product Request Reports',
        GROUPNAME: 'Product Request Reports',
        SCREEN_CATEGORYNAME: 'Product Request Reports',
        SCREEN_GROUPNAME: 'Product Request Reports',
        REPORTFILENAME: '',
        REPORTFILENAME_RETAIL: '',
        SORTING: 1,
        hide: 0,
        customized: 0,
        allowed_range: null,
        screen_category_sorting: 1,
        screen_group_sorting: 1,
        recommended: 0,
        is_jasper: 1,
        linked_to: null,
        childs: [
          {
            REPORTID: 405,
            REPORTNAME: 'Qty requested by item',
            REPORTGROUP: '',
            MODULENAME: 'Product Request',
            CATEGORYNAME: 'Product Request Reports',
            GROUPNAME: 'Product Request Reports',
            SCREEN_CATEGORYNAME: 'Product Request Reports',
            SCREEN_GROUPNAME: 'Product Request Reports',
            SORTING: 1
          },
          {
            REPORTID: 406,
            REPORTNAME: 'Production Report',
            REPORTGROUP: '',
            MODULENAME: 'Product Request',
            CATEGORYNAME: 'Product Request Reports',
            GROUPNAME: 'Product Request Reports',
            SCREEN_CATEGORYNAME: 'Product Request Reports',
            SCREEN_GROUPNAME: 'Product Request Reports',
            SORTING: 2
          },
          {
            REPORTID: 407,
            REPORTNAME: 'Products Requested Details',
            REPORTGROUP: '',
            MODULENAME: 'Product Request',
            CATEGORYNAME: 'Product Request Reports',
            GROUPNAME: 'Product Request Reports',
            SCREEN_CATEGORYNAME: 'Product Request Reports',
            SCREEN_GROUPNAME: 'Product Request Reports',
            SORTING: 3
          },
          {
            REPORTID: 408,
            REPORTNAME: 'Items Requested by Group by Division',
            REPORTGROUP: '',
            MODULENAME: 'Product Request',
            CATEGORYNAME: 'Product Request Reports',
            GROUPNAME: 'Product Request Reports',
            SCREEN_CATEGORYNAME: 'Product Request Reports',
            SCREEN_GROUPNAME: 'Product Request Reports',
            SORTING: 4
          },
          {
            REPORTID: 409,
            REPORTNAME: 'Items Requested With Remark',
            REPORTGROUP: '',
            MODULENAME: 'Product Request',
            CATEGORYNAME: 'Product Request Reports',
            GROUPNAME: 'Product Request Reports',
            SCREEN_CATEGORYNAME: 'Product Request Reports',
            SCREEN_GROUPNAME: 'Product Request Reports',
            SORTING: 5
          }
        ]
      }
    ]
  }
];

// Authentic Item Groups for Report Filters (from Omega Live DB)
export const OMEGA_REPORT_GROUPS = [
  { ID: 0, GROUPNAME: 'All Groups', DIVISIONID: 0 },
  { ID: 65, GROUPNAME: '509 مرطبان', DIVISIONID: 40 },
  { ID: 75, GROUPNAME: 'Assembled Items Per 1', DIVISIONID: 48 },
  { ID: 70, GROUPNAME: 'Bottles', DIVISIONID: 42 },
  { ID: 77, GROUPNAME: 'CLASSIC-C/R', DIVISIONID: 33 },
  { ID: 78, GROUPNAME: 'CLASSIC-R/R', DIVISIONID: 33 },
  { ID: 71, GROUPNAME: 'Demijohn', DIVISIONID: 45 },
  { ID: 69, GROUPNAME: 'JAR', DIVISIONID: 41 },
  { ID: 73, GROUPNAME: 'Main materials', DIVISIONID: 47 },
  { ID: 76, GROUPNAME: 'Plastic Bottles', DIVISIONID: 49 },
  { ID: 74, GROUPNAME: 'Plastic Gallon', DIVISIONID: 49 },
  { ID: 72, GROUPNAME: 'SERVICES', DIVISIONID: 46 },
  { ID: 35, GROUPNAME: 'أجبان و ألبان', DIVISIONID: 27 },
  { ID: 49, GROUPNAME: 'بزورات مفرق', DIVISIONID: 34 },
  { ID: 27, GROUPNAME: 'بهارات غ', DIVISIONID: 24 },
  { ID: 6, GROUPNAME: 'تمور', DIVISIONID: 6 },
  { ID: 30, GROUPNAME: 'جبنة مطبوخة', DIVISIONID: 27 },
  { ID: 1, GROUPNAME: 'حبوب فلت', DIVISIONID: 6 },
  { ID: 59, GROUPNAME: 'حبوب مكيسة', DIVISIONID: 6 },
  { ID: 56, GROUPNAME: 'حلوى', DIVISIONID: 34 },
  { ID: 64, GROUPNAME: 'رف', DIVISIONID: 6 },
  { ID: 15, GROUPNAME: 'زيت اوكراني دوار الشمس جملة', DIVISIONID: 35 },
  { ID: 4, GROUPNAME: 'زيت اوكراني دوار الشمس مفرق', DIVISIONID: 33 },
  { ID: 40, GROUPNAME: 'زيت زيتون خضير جملة', DIVISIONID: 35 },
  { ID: 2, GROUPNAME: 'زيت زيتون خضير مفرق', DIVISIONID: 33 },
  { ID: 42, GROUPNAME: 'زيت زيتون فرجين جملة', DIVISIONID: 35 },
  { ID: 3, GROUPNAME: 'زيت زيتون فرجين مفرق', DIVISIONID: 33 },
  { ID: 41, GROUPNAME: 'زيت زيتون كورة جملة', DIVISIONID: 35 },
  { ID: 51, GROUPNAME: 'زيتون اخضر جملة', DIVISIONID: 18 },
  { ID: 7, GROUPNAME: 'زيتون اخضر مفرق', DIVISIONID: 7 },
  { ID: 50, GROUPNAME: 'زيتون اسود جملة', DIVISIONID: 18 },
  { ID: 44, GROUPNAME: 'زيتون اسود مفرق', DIVISIONID: 7 },
  { ID: 18, GROUPNAME: 'زيتون جملة', DIVISIONID: 18 },
  { ID: 57, GROUPNAME: 'عروض', DIVISIONID: 38 },
  { ID: 20, GROUPNAME: 'عسل جملة', DIVISIONID: 20 },
  { ID: 10, GROUPNAME: 'عسل مفرق', DIVISIONID: 10 },
  { ID: 25, GROUPNAME: 'علبة بهارات', DIVISIONID: 24 },
  { ID: 32, GROUPNAME: 'علبة صغيرة', DIVISIONID: 30 },
  { ID: 34, GROUPNAME: 'علبة صغيرة.', DIVISIONID: 31 },
  { ID: 31, GROUPNAME: 'علبة كبيرة', DIVISIONID: 30 },
  { ID: 33, GROUPNAME: 'علبة كبيرة.', DIVISIONID: 31 },
  { ID: 22, GROUPNAME: 'فواكه مجففه جملة', DIVISIONID: 22 },
  { ID: 11, GROUPNAME: 'فواكه مجففه مفرق', DIVISIONID: 11 },
  { ID: 38, GROUPNAME: 'قلوبات مفرق', DIVISIONID: 34 },
  { ID: 55, GROUPNAME: 'قلوبات ني', DIVISIONID: 34 },
  { ID: 19, GROUPNAME: 'كبيس ومخللات جملة', DIVISIONID: 19 },
  { ID: 8, GROUPNAME: 'كبيس ومخللات مفرق', DIVISIONID: 8 },
  { ID: 21, GROUPNAME: 'كيلو جملة', DIVISIONID: 21 },
  { ID: 66, GROUPNAME: 'كيلو مفرق', DIVISIONID: 39 },
  { ID: 48, GROUPNAME: 'مدبسات جملة', DIVISIONID: 16 },
  { ID: 43, GROUPNAME: 'مدبسات مفرق 509', DIVISIONID: 5 },
  { ID: 62, GROUPNAME: 'مدبسات مفرق 510', DIVISIONID: 5 },
  { ID: 58, GROUPNAME: 'مراطبين عروض', DIVISIONID: 38 },
  { ID: 23, GROUPNAME: 'مربيات جملة', DIVISIONID: 23 },
  { ID: 9, GROUPNAME: 'مربيات مفرق', DIVISIONID: 9 },
  { ID: 28, GROUPNAME: 'مرتديلا', DIVISIONID: 27 },
  { ID: 24, GROUPNAME: 'مرشة بهار', DIVISIONID: 24 },
  { ID: 68, GROUPNAME: 'مرطبان 507', DIVISIONID: 40 },
  { ID: 67, GROUPNAME: 'مرطبان 510', DIVISIONID: 40 },
  { ID: 46, GROUPNAME: 'معلبات أخرى', DIVISIONID: 6 },
  { ID: 63, GROUPNAME: 'مقطرات 1 ليتر', DIVISIONID: 5 },
  { ID: 47, GROUPNAME: 'مقطرات جملة', DIVISIONID: 16 },
  { ID: 5, GROUPNAME: 'مقطرات مفرق 250مل', DIVISIONID: 5 },
  { ID: 61, GROUPNAME: 'مقطرات مفرق 500مل', DIVISIONID: 5 },
  { ID: 60, GROUPNAME: 'مقطرات ومدبسات غالون', DIVISIONID: 5 },
  { ID: 52, GROUPNAME: 'مكعزلة بقر جملة', DIVISIONID: 37 },
  { ID: 39, GROUPNAME: 'مكعزلة بقر مفرق', DIVISIONID: 36 },
  { ID: 53, GROUPNAME: 'مكعزلة معزة جملة', DIVISIONID: 37 },
  { ID: 45, GROUPNAME: 'مكعزلة معزة مفرق', DIVISIONID: 36 },
  { ID: 17, GROUPNAME: 'مونة بلدية جملة', DIVISIONID: 17 }
];
