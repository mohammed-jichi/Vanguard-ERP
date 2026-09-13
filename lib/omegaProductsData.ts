// Authentic Omega ERP Products & Services Master Data, Models, & Types
// Cloned 100% authentically from Omega ERP (cms.omegasoftware.ca)

export interface ProductPriceVariation {
  id: number;
  level: number;
  priceLL: number;
  beforeTaxLL: number;
  qty: number;
  profitPct: number;
  priceUSD: number;
}

export interface ProductStockRecord {
  branchId: number;
  branchName: string;
  warehouseId: number;
  warehouseName: string;
  locationId: number;
  locationName: string;
  qtyOH: number;
  reorderLevel: number;
  maxStock: number;
  reservedQty: number;
  availableQty: number;
}

export interface ProductAssemblyItem {
  id: number;
  rawMaterialId: number;
  rawMaterialCode: string;
  rawMaterialName: string;
  qtyNeeded: number;
  unit: string;
  unitCostLL: number;
  totalCostLL: number;
}

export interface ProductIncludedItem {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  qty: number;
  discountPct: number;
  sellingPriceLL: number;
}

export interface ProductMovementRecord {
  id: number;
  date: string;
  type: 'Purchase' | 'Sale' | 'Adjustment' | 'Transfer' | 'Assembly';
  reference: string;
  qtyChange: number;
  balanceAfter: number;
  unit: string;
  location: string;
  user: string;
}

export interface ProductPriceLogRecord {
  id: number;
  date: string;
  oldCostLL: number;
  newCostLL: number;
  oldPriceLL: number;
  newPriceLL: number;
  changedBy: string;
  reason: string;
}

export interface ProductAuditLogRecord {
  id: number;
  timestamp: string;
  action: string;
  field: string;
  oldValue: string;
  newValue: string;
  user: string;
}

export interface ProductMonthlySales {
  month: string;
  monthIndex: number;
  qtyThisYear: number;
  salesThisYearLL: number;
  qtyLastYear: number;
  salesLastYearLL: number;
}

export interface AuthenticProductRecord {
  id: number;
  description: string;
  code: string;
  otherDescription: string;
  itemComment: string;
  secondLangDescription: string;
  secondLangItemComment: string;
  internalNote: string;
  
  // Hierarchy
  categoryId: number;
  categoryName: string;
  divisionId: number;
  divisionName: string;
  groupId: number;
  groupName: string;

  // Logistics & Locations
  sellingFunction: string;
  defaultLocationId: number;
  defaultLocationName: string;
  logicalWarehouseId: number;
  logicalWarehouseName: string;
  mainSupplierId: number;
  mainSupplierName: string;
  otherSupplierId?: number;
  otherSupplierName?: string;
  lastSupplierName: string;
  itemBrand: string;
  itemLeadTime: string;
  source?: string;

  // Unit Format
  buyingFormat: string;
  inventoryFormat: string;
  usageFormat: string;
  qtyInBuyingFormat: number;
  qtyInInventoryFormat: number;
  packingProduction: string;
  qtyInPackingFormat: number;

  // Cost
  unitCostLL: number;
  averageCostLL: number;
  unitCostUSD: number;
  averageCostUSD: number;
  additionalCostLL: number;
  markupPct: number;
  recommendedPriceLL: number;

  // Selling Prices
  sellingPrice1LL: number;
  beforeTax1LL: number;
  profit1Pct: number;
  sellingPrice1USD: number;

  sellingPrice2LL: number;
  beforeTax2LL: number;
  qtyPrice2: number;
  profit2Pct: number;
  sellingPrice2USD: number;

  sellingPrice3LL: number;
  beforeTax3LL: number;
  qtyPrice3: number;
  profit3Pct: number;
  sellingPrice3USD: number;

  sellingPrice4LL: number;
  beforeTax4LL: number;
  qtyPrice4: number;
  profit4Pct: number;
  sellingPrice4USD: number;

  secondCurrencyRate: number;

  // Barcodes
  barcode: string;
  alternativeBarcode2: string;
  alternativeBarcode3: string;
  applySp2Qty2: boolean;
  rfidt1: string;
  rfidt2: string;

  // Status & Counts
  qtyOH: number;
  unit: string;
  sellingPrice: number;
  cost: number;
  function: string;
  updatedAt: string;
  isDiscontinued: boolean;

  // Stock
  stockRecords: ProductStockRecord[];

  // Media
  imageUrl: string;
  videoUrl: string;

  // Assembly & Bundles
  assemblyCalculationMethod: 'Automatic' | 'Fixed';
  assemblyItems: ProductAssemblyItem[];
  includedItems: ProductIncludedItem[];

  // History & Audit
  movements: ProductMovementRecord[];
  priceLogs: ProductPriceLogRecord[];
  auditLogs: ProductAuditLogRecord[];

  // Performance
  salesPerformance: ProductMonthlySales[];

  // More Accounts & Taxes
  assetAccount: string;
  expenseAccount: string;
  revenueAccount: string;
  stockVariationAccount: string;
  tax1: boolean;
  tax2: boolean;
  tax3: boolean;
  tax4: boolean;
  tax5: boolean;
  tax6: boolean;
  autoDiscount: number;

  // Specifications & Advanced Tracking (Omega ERP More Filters)
  hasSerialNumber?: boolean;
  serialNumber?: string;
  hasIngredients?: boolean;
  ingredients?: string;
  hasColors?: boolean;
  color?: string;
  hasSizes?: boolean;
  size?: string;
  isService?: boolean;
  isConsignment?: boolean;
  reorderLevel?: number;
  isMasterItem?: boolean;
  hasExpiry?: boolean;
  expiryDate?: string;

  // Floor, Zone, and Aisle Location Specs (Image 2)
  floor?: string;
  zone?: string;
  aisle?: string;
  moreBarcodes?: Array<{ id: number; barcode: string; note?: string }>;
}

// Hierarchy Master Options
export const OMEGA_PRODUCT_CATEGORIES = [
  { id: 2, name: 'مفرق' },
  { id: 3, name: 'جملة' },
  { id: 4, name: 'عروض' },
  { id: 6, name: 'Raw Materials' }
];

export const OMEGA_SELLING_FUNCTIONS = [
  { id: 1, name: 'Revenue' },
  { id: 2, name: 'Expense' },
  { id: 3, name: 'Raw Material' },
  { id: 4, name: 'Internal Transfer' }
];

export const OMEGA_LOGICAL_WAREHOUSES = [
  { id: 1, name: 'Main Store' },
  { id: 2, name: 'Showroom Store' },
  { id: 3, name: 'Kitchen / Factory' },
  { id: 4, name: 'Raw Materials Store' }
];

export const OMEGA_ITEM_BRANDS = [
  { id: 1, name: 'Alfa' },
  { id: 2, name: 'Altaghziah' },
  { id: 3, name: 'Amour' },
  { id: 4, name: 'Bihar' },
  { id: 5, name: 'Clatchy' },
  { id: 6, name: 'Crispy' },
  { id: 7, name: 'Dano' },
  { id: 8, name: 'Domo' },
  { id: 9, name: 'Everyday' },
  { id: 10, name: 'Iceberg' },
  { id: 11, name: 'Kaval Tenayel' },
  { id: 12, name: 'Kiri' },
  { id: 13, name: 'Klio' },
  { id: 14, name: 'Koubeissi' },
  { id: 15, name: 'Lipton' },
  { id: 16, name: 'Mia' },
  { id: 17, name: 'Nestle' },
  { id: 18, name: 'New Park' },
  { id: 19, name: 'Nureen' },
  { id: 20, name: 'nutella' },
  { id: 21, name: 'Orient Crown' },
  { id: 22, name: 'Picon' },
  { id: 23, name: 'Prime line' },
  { id: 24, name: 'Puck' },
  { id: 25, name: 'Saliba' },
  { id: 26, name: 'Sweet Fooz' },
  { id: 27, name: 'Tatra' },
  { id: 28, name: 'Teba' },
  { id: 29, name: 'Tora Bika' },
  { id: 30, name: 'Uno' },
  { id: 31, name: 'أليشان' },
  { id: 32, name: 'افران الصفا' },
  { id: 33, name: 'الأمين' },
  { id: 34, name: 'الشرق' },
  { id: 35, name: 'المنى' },
  { id: 36, name: 'تغذية' },
  { id: 37, name: 'راس الحصان' },
  { id: 38, name: 'زيت و زيتون الجنوب' },
  { id: 39, name: 'سما فوودز' },
  { id: 40, name: 'كريستال' },
  { id: 41, name: 'نينا' }
];

export const ALL_ITEM_BRANDS_LIST = OMEGA_ITEM_BRANDS.map((b) => b.name);

export const OMEGA_SOURCES = [
  { id: 1, name: 'Local' },
  { id: 2, name: 'Vanguard Market place' }
];

export const ALL_SOURCES_LIST = OMEGA_SOURCES.map((s) => s.name);

// Initial Authentic Products matching Screenshot 1 exactly
export const INITIAL_OMEGA_PRODUCTS: AuthenticProductRecord[] = [
  {
    id: 15,
    description: 'خل ابيض 250مل',
    code: 'CWV250MLB103',
    otherDescription: 'COMMERCIAL WHITE VENIGAR',
    itemComment: '',
    secondLangDescription: '',
    secondLangItemComment: '',
    internalNote: '',
    categoryId: 2,
    categoryName: 'مفرق',
    divisionId: 5,
    divisionName: 'مقطرات ومدبسات مفرق',
    groupId: 14,
    groupName: 'مقطرات مفرق 250مل',
    sellingFunction: 'Revenue',
    defaultLocationId: 12,
    defaultLocationName: 'Showroom',
    logicalWarehouseId: 1,
    logicalWarehouseName: 'Main Store',
    mainSupplierId: 5,
    mainSupplierName: 'SOOL',
    lastSupplierName: 'SOOL',
    itemBrand: 'زيت و زيتون الجنوب',
    itemLeadTime: '2 Days',
    source: 'Local',
    buyingFormat: 'BOT',
    inventoryFormat: 'BOT',
    usageFormat: 'BOT',
    qtyInBuyingFormat: 1,
    qtyInInventoryFormat: 1,
    packingProduction: 'Standard Bottle',
    qtyInPackingFormat: 1,
    unitCostLL: 26676.72,
    averageCostLL: 26676.72,
    unitCostUSD: 0.296408,
    averageCostUSD: 0.296408,
    additionalCostLL: 0,
    markupPct: 30,
    recommendedPriceLL: 34679.74,
    sellingPrice1LL: 45000,
    beforeTax1LL: 45000,
    profit1Pct: 68.69,
    sellingPrice1USD: 0.5,
    sellingPrice2LL: 45000,
    beforeTax2LL: 45000,
    qtyPrice2: 1,
    profit2Pct: 68.69,
    sellingPrice2USD: 0.5,
    sellingPrice3LL: 45000,
    beforeTax3LL: 45000,
    qtyPrice3: 1,
    profit3Pct: 68.69,
    sellingPrice3USD: 0.5,
    sellingPrice4LL: 45000,
    beforeTax4LL: 45000,
    qtyPrice4: 1,
    profit4Pct: 68.69,
    sellingPrice4USD: 0.5,
    secondCurrencyRate: 90000,
    barcode: '5281234123481',
    alternativeBarcode2: '',
    alternativeBarcode3: '',
    applySp2Qty2: false,
    rfidt1: '',
    rfidt2: '',
    qtyOH: 0.0,
    unit: 'BOT',
    sellingPrice: 45000,
    cost: 26676.72,
    function: 'Revenue',
    updatedAt: '21 Jul, 2026',
    isDiscontinued: false,
    stockRecords: [
      { branchId: 1, branchName: 'Zeit w zaytoun ljanoub', warehouseId: 1, warehouseName: 'Main Store', locationId: 12, locationName: 'Showroom', qtyOH: 0, reorderLevel: 24, maxStock: 120, reservedQty: 0, availableQty: 0 },
      { branchId: 1, branchName: 'Zeit w zaytoun ljanoub', warehouseId: 2, warehouseName: 'Secondary Depot', locationId: 13, locationName: 'Zone A', qtyOH: 0, reorderLevel: 12, maxStock: 60, reservedQty: 0, availableQty: 0 }
    ],
    imageUrl: '',
    videoUrl: '',
    assemblyCalculationMethod: 'Automatic',
    assemblyItems: [
      { id: 1, rawMaterialId: 45, rawMaterialCode: 'BOT-250ML', rawMaterialName: 'Glass Bottle 250ml', qtyNeeded: 1, unit: 'BOT', unitCostLL: 12000, totalCostLL: 12000 },
      { id: 2, rawMaterialId: 46, rawMaterialCode: 'CAP-STD', rawMaterialName: 'Bottle Cap Std', qtyNeeded: 1, unit: 'PCS', unitCostLL: 3500, totalCostLL: 3500 },
      { id: 3, rawMaterialId: 47, rawMaterialCode: 'VIN-BULK', rawMaterialName: 'White Vinegar Bulk', qtyNeeded: 0.25, unit: 'L', unitCostLL: 44706.88, totalCostLL: 11176.72 }
    ],
    includedItems: [],
    movements: [
      { id: 101, date: '21 Jul, 2026', type: 'Adjustment', reference: 'ADJ-2026-001', qtyChange: 24, balanceAfter: 24, unit: 'BOT', location: 'Showroom', user: 'Admin' },
      { id: 102, date: '01 Aug, 2026', type: 'Sale', reference: 'INV-4890', qtyChange: -24, balanceAfter: 0, unit: 'BOT', location: 'Showroom', user: 'POS Kassem' }
    ],
    priceLogs: [
      { id: 201, date: '21 Jul, 2026', oldCostLL: 25000, newCostLL: 26676.72, oldPriceLL: 40000, newPriceLL: 45000, changedBy: 'Admin', reason: 'Supplier Price Adjustment' }
    ],
    auditLogs: [
      { id: 301, timestamp: '21 Jul, 2026 14:22', action: 'Update', field: 'Selling Price 1 LL', oldValue: '40000', newValue: '45000', user: 'Admin' },
      { id: 302, timestamp: '21 Jul, 2026 14:22', action: 'Update', field: 'Cost LL', oldValue: '25000', newValue: '26676.72', user: 'Admin' }
    ],
    salesPerformance: [
      { month: 'Jan', monthIndex: 1, qtyThisYear: 120, salesThisYearLL: 5400000, qtyLastYear: 95, salesLastYearLL: 3800000 },
      { month: 'Feb', monthIndex: 2, qtyThisYear: 145, salesThisYearLL: 6525000, qtyLastYear: 110, salesLastYearLL: 4400000 },
      { month: 'Mar', monthIndex: 3, qtyThisYear: 180, salesThisYearLL: 8100000, qtyLastYear: 130, salesLastYearLL: 5200000 },
      { month: 'Apr', monthIndex: 4, qtyThisYear: 210, salesThisYearLL: 9450000, qtyLastYear: 160, salesLastYearLL: 6400000 },
      { month: 'May', monthIndex: 5, qtyThisYear: 195, salesThisYearLL: 8775000, qtyLastYear: 175, salesLastYearLL: 7000000 },
      { month: 'Jun', monthIndex: 6, qtyThisYear: 230, salesThisYearLL: 10350000, qtyLastYear: 190, salesLastYearLL: 7600000 },
      { month: 'Jul', monthIndex: 7, qtyThisYear: 250, salesThisYearLL: 11250000, qtyLastYear: 205, salesLastYearLL: 8200000 },
      { month: 'Aug', monthIndex: 8, qtyThisYear: 270, salesThisYearLL: 12150000, qtyLastYear: 220, salesLastYearLL: 8800000 },
      { month: 'Sep', monthIndex: 9, qtyThisYear: 160, salesThisYearLL: 7200000, qtyLastYear: 180, salesLastYearLL: 7200000 },
      { month: 'Oct', monthIndex: 10, qtyThisYear: 140, salesThisYearLL: 6300000, qtyLastYear: 150, salesLastYearLL: 6000000 },
      { month: 'Nov', monthIndex: 11, qtyThisYear: 130, salesThisYearLL: 5850000, qtyLastYear: 125, salesLastYearLL: 5000000 },
      { month: 'Dec', monthIndex: 12, qtyThisYear: 190, salesThisYearLL: 8550000, qtyLastYear: 170, salesLastYearLL: 6800000 }
    ],
    assetAccount: '120101',
    expenseAccount: '510101',
    revenueAccount: '410101',
    stockVariationAccount: '510301',
    tax1: false,
    tax2: false,
    tax3: false,
    tax4: false,
    tax5: false,
    tax6: false,
    autoDiscount: 0,
    hasIngredients: true,
    ingredients: 'White Distilled Vinegar 5%, Filtered Water',
    hasColors: true,
    color: 'Crystal Clear',
    hasSizes: true,
    size: '250ml',
    reorderLevel: 24,
    hasExpiry: true,
    expiryDate: '2028-12-31'
  },
  {
    id: 17,
    description: 'خل تفاح 250مل',
    code: 'CACV250MLB103',
    otherDescription: 'COMMERCIAL APPLE CIDER VINEGAR',
    itemComment: '',
    secondLangDescription: '',
    secondLangItemComment: '',
    internalNote: '',
    categoryId: 2,
    categoryName: 'مفرق',
    divisionId: 5,
    divisionName: 'مقطرات ومدبسات مفرق',
    groupId: 14,
    groupName: 'مقطرات مفرق 250مل',
    sellingFunction: 'Revenue',
    defaultLocationId: 12,
    defaultLocationName: 'Showroom',
    logicalWarehouseId: 1,
    logicalWarehouseName: 'Main Store',
    mainSupplierId: 5,
    mainSupplierName: 'SOOL',
    lastSupplierName: 'SOOL',
    itemBrand: 'زيت و زيتون الجنوب',
    itemLeadTime: '2 Days',
    source: 'Local',
    buyingFormat: 'BOT',
    inventoryFormat: 'BOT',
    usageFormat: 'BOT',
    qtyInBuyingFormat: 1,
    qtyInInventoryFormat: 1,
    packingProduction: 'Standard Bottle',
    qtyInPackingFormat: 1,
    unitCostLL: 27170.61,
    averageCostLL: 27170.61,
    unitCostUSD: 0.301895,
    averageCostUSD: 0.301895,
    additionalCostLL: 0,
    markupPct: 30,
    recommendedPriceLL: 35321.79,
    sellingPrice1LL: 45000,
    beforeTax1LL: 45000,
    profit1Pct: 65.62,
    sellingPrice1USD: 0.5,
    sellingPrice2LL: 45000,
    beforeTax2LL: 45000,
    qtyPrice2: 1,
    profit2Pct: 65.62,
    sellingPrice2USD: 0.5,
    sellingPrice3LL: 45000,
    beforeTax3LL: 45000,
    qtyPrice3: 1,
    profit3Pct: 65.62,
    sellingPrice3USD: 0.5,
    sellingPrice4LL: 45000,
    beforeTax4LL: 45000,
    qtyPrice4: 1,
    profit4Pct: 65.62,
    sellingPrice4USD: 0.5,
    secondCurrencyRate: 90000,
    barcode: '5281234123498',
    alternativeBarcode2: '',
    alternativeBarcode3: '',
    applySp2Qty2: false,
    rfidt1: '',
    rfidt2: '',
    qtyOH: 0.0,
    unit: 'BOT',
    sellingPrice: 45000,
    cost: 27170.61,
    function: 'Revenue',
    updatedAt: '21 Jul, 2026',
    isDiscontinued: false,
    stockRecords: [
      { branchId: 1, branchName: 'Zeit w zaytoun ljanoub', warehouseId: 1, warehouseName: 'Main Store', locationId: 12, locationName: 'Showroom', qtyOH: 0, reorderLevel: 24, maxStock: 120, reservedQty: 0, availableQty: 0 }
    ],
    imageUrl: '',
    videoUrl: '',
    assemblyCalculationMethod: 'Automatic',
    assemblyItems: [],
    includedItems: [],
    movements: [],
    priceLogs: [],
    auditLogs: [],
    salesPerformance: [],
    assetAccount: '120101',
    expenseAccount: '510101',
    revenueAccount: '410101',
    stockVariationAccount: '510301',
    tax1: false,
    tax2: false,
    tax3: false,
    tax4: false,
    tax5: false,
    tax6: false,
    autoDiscount: 0,
    hasIngredients: true,
    ingredients: 'Pure Apple Cider Ferment 5% Acidity',
    hasColors: true,
    color: 'Golden Amber',
    hasSizes: true,
    size: '250ml',
    reorderLevel: 12,
    hasExpiry: true,
    expiryDate: '2027-06-30'
  },
  {
    id: 18,
    description: 'خل تفاح بلدي 250مل',
    code: 'OACV250MLB103',
    otherDescription: 'ORGANIC APPLE CIDER VINEGAR',
    itemComment: '',
    secondLangDescription: '',
    secondLangItemComment: '',
    internalNote: '',
    categoryId: 2,
    categoryName: 'مفرق',
    divisionId: 5,
    divisionName: 'مقطرات ومدبسات مفرق',
    groupId: 14,
    groupName: 'مقطرات مفرق 250مل',
    sellingFunction: 'Revenue',
    defaultLocationId: 12,
    defaultLocationName: 'Showroom',
    logicalWarehouseId: 1,
    logicalWarehouseName: 'Main Store',
    mainSupplierId: 5,
    mainSupplierName: 'SOOL',
    lastSupplierName: 'SOOL',
    itemBrand: 'سما فوودز',
    itemLeadTime: '2 Days',
    source: 'Vanguard Market place',
    buyingFormat: 'BOT',
    inventoryFormat: 'BOT',
    usageFormat: 'BOT',
    qtyInBuyingFormat: 1,
    qtyInInventoryFormat: 1,
    packingProduction: 'Standard Bottle',
    qtyInPackingFormat: 1,
    unitCostLL: 77162.40,
    averageCostLL: 77162.40,
    unitCostUSD: 0.85736,
    averageCostUSD: 0.85736,
    additionalCostLL: 0,
    markupPct: 30,
    recommendedPriceLL: 100311.12,
    sellingPrice1LL: 100000,
    beforeTax1LL: 100000,
    profit1Pct: 29.59,
    sellingPrice1USD: 1.11,
    sellingPrice2LL: 100000,
    beforeTax2LL: 100000,
    qtyPrice2: 1,
    profit2Pct: 29.59,
    sellingPrice2USD: 1.11,
    sellingPrice3LL: 100000,
    beforeTax3LL: 100000,
    qtyPrice3: 1,
    profit3Pct: 29.59,
    sellingPrice3USD: 1.11,
    sellingPrice4LL: 100000,
    beforeTax4LL: 100000,
    qtyPrice4: 1,
    profit4Pct: 29.59,
    sellingPrice4USD: 1.11,
    secondCurrencyRate: 90000,
    barcode: '5281234123504',
    alternativeBarcode2: '',
    alternativeBarcode3: '',
    applySp2Qty2: false,
    rfidt1: '',
    rfidt2: '',
    qtyOH: 0.0,
    unit: 'BOT',
    sellingPrice: 100000,
    cost: 77162.40,
    function: 'Revenue',
    updatedAt: '21 Jul, 2026',
    isDiscontinued: false,
    stockRecords: [],
    imageUrl: '',
    videoUrl: '',
    assemblyCalculationMethod: 'Automatic',
    assemblyItems: [],
    includedItems: [],
    movements: [],
    priceLogs: [],
    auditLogs: [],
    salesPerformance: [],
    assetAccount: '120101',
    expenseAccount: '510101',
    revenueAccount: '410101',
    stockVariationAccount: '510301',
    tax1: false,
    tax2: false,
    tax3: false,
    tax4: false,
    tax5: false,
    tax6: false,
    autoDiscount: 0,
    hasIngredients: true,
    ingredients: 'Organic Baladi Apples Cold Ferment',
    hasSizes: true,
    size: '250ml',
    reorderLevel: 0
  },
  {
    id: 19,
    description: 'خل حصرم 250مل',
    code: 'CSGV250MLB103',
    otherDescription: 'COMMERCIAL SOUR GRAPE VINEGAR',
    itemComment: '',
    secondLangDescription: '',
    secondLangItemComment: '',
    internalNote: '',
    categoryId: 2,
    categoryName: 'مفرق',
    divisionId: 5,
    divisionName: 'مقطرات ومدبسات مفرق',
    groupId: 14,
    groupName: 'مقطرات مفرق 250مل',
    sellingFunction: 'Revenue',
    defaultLocationId: 12,
    defaultLocationName: 'Showroom',
    logicalWarehouseId: 1,
    logicalWarehouseName: 'Main Store',
    mainSupplierId: 5,
    mainSupplierName: 'SOOL',
    lastSupplierName: 'SOOL',
    itemBrand: 'زيت و زيتون الجنوب',
    itemLeadTime: '2 Days',
    source: 'Local',
    buyingFormat: 'BOT',
    inventoryFormat: 'BOT',
    usageFormat: 'BOT',
    qtyInBuyingFormat: 1,
    qtyInInventoryFormat: 1,
    packingProduction: 'Standard Bottle',
    qtyInPackingFormat: 1,
    unitCostLL: 27170.61,
    averageCostLL: 27170.61,
    unitCostUSD: 0.301895,
    averageCostUSD: 0.301895,
    additionalCostLL: 0,
    markupPct: 30,
    recommendedPriceLL: 35321.79,
    sellingPrice1LL: 45000,
    beforeTax1LL: 45000,
    profit1Pct: 65.62,
    sellingPrice1USD: 0.5,
    sellingPrice2LL: 45000,
    beforeTax2LL: 45000,
    qtyPrice2: 1,
    profit2Pct: 65.62,
    sellingPrice2USD: 0.5,
    sellingPrice3LL: 45000,
    beforeTax3LL: 45000,
    qtyPrice3: 1,
    profit3Pct: 65.62,
    sellingPrice3USD: 0.5,
    sellingPrice4LL: 45000,
    beforeTax4LL: 45000,
    qtyPrice4: 1,
    profit4Pct: 65.62,
    sellingPrice4USD: 0.5,
    secondCurrencyRate: 90000,
    barcode: '5281234123511',
    alternativeBarcode2: '',
    alternativeBarcode3: '',
    applySp2Qty2: false,
    rfidt1: '',
    rfidt2: '',
    qtyOH: 0.0,
    unit: 'BOT',
    sellingPrice: 45000,
    cost: 27170.61,
    function: 'Revenue',
    updatedAt: '21 Jul, 2026',
    isDiscontinued: true,
    hasExpiry: true,
    expiryDate: '2026-08-31',
    stockRecords: [],
    imageUrl: '',
    videoUrl: '',
    assemblyCalculationMethod: 'Automatic',
    assemblyItems: [],
    includedItems: [],
    movements: [],
    priceLogs: [],
    auditLogs: [],
    salesPerformance: [],
    assetAccount: '120101',
    expenseAccount: '510101',
    revenueAccount: '410101',
    stockVariationAccount: '510301',
    tax1: false,
    tax2: false,
    tax3: false,
    tax4: false,
    tax5: false,
    tax6: false,
    autoDiscount: 0
  },
  {
    id: 20,
    description: 'خل عنب 250مل',
    code: 'CGV250MLB103',
    otherDescription: 'COMMERCIAL GRAPE VINEGAR',
    itemComment: '',
    secondLangDescription: '',
    secondLangItemComment: '',
    internalNote: '',
    categoryId: 2,
    categoryName: 'مفرق',
    divisionId: 5,
    divisionName: 'مقطرات ومدبسات مفرق',
    groupId: 14,
    groupName: 'مقطرات مفرق 250مل',
    sellingFunction: 'Master Item',
    defaultLocationId: 12,
    defaultLocationName: 'Showroom',
    logicalWarehouseId: 1,
    logicalWarehouseName: 'Main Store',
    mainSupplierId: 5,
    mainSupplierName: 'SOOL',
    lastSupplierName: 'SOOL',
    itemBrand: 'Alfa',
    itemLeadTime: '2 Days',
    source: 'Vanguard Market place',
    buyingFormat: 'BOT',
    inventoryFormat: 'BOT',
    usageFormat: 'BOT',
    qtyInBuyingFormat: 1,
    qtyInInventoryFormat: 1,
    packingProduction: 'Standard Bottle',
    qtyInPackingFormat: 1,
    unitCostLL: 27170.61,
    averageCostLL: 27170.61,
    unitCostUSD: 0.301895,
    averageCostUSD: 0.301895,
    additionalCostLL: 0,
    markupPct: 30,
    recommendedPriceLL: 35321.79,
    sellingPrice1LL: 45000,
    beforeTax1LL: 45000,
    profit1Pct: 65.62,
    sellingPrice1USD: 0.5,
    sellingPrice2LL: 45000,
    beforeTax2LL: 45000,
    qtyPrice2: 1,
    profit2Pct: 65.62,
    sellingPrice2USD: 0.5,
    sellingPrice3LL: 45000,
    beforeTax3LL: 45000,
    qtyPrice3: 1,
    profit3Pct: 65.62,
    sellingPrice3USD: 0.5,
    sellingPrice4LL: 45000,
    beforeTax4LL: 45000,
    qtyPrice4: 1,
    profit4Pct: 65.62,
    sellingPrice4USD: 0.5,
    secondCurrencyRate: 90000,
    barcode: '5281234123528',
    alternativeBarcode2: '',
    alternativeBarcode3: '',
    applySp2Qty2: false,
    rfidt1: '',
    rfidt2: '',
    qtyOH: 0.0,
    unit: 'BOT',
    sellingPrice: 45000,
    cost: 27170.61,
    function: 'Master Item',
    updatedAt: '21 Jul, 2026',
    isDiscontinued: false,
    stockRecords: [],
    imageUrl: '',
    videoUrl: '',
    assemblyCalculationMethod: 'Automatic',
    assemblyItems: [],
    includedItems: [],
    movements: [],
    priceLogs: [],
    auditLogs: [],
    salesPerformance: [],
    assetAccount: '120101',
    expenseAccount: '510101',
    revenueAccount: '410101',
    stockVariationAccount: '510301',
    tax1: false,
    tax2: false,
    tax3: false,
    tax4: false,
    tax5: false,
    tax6: false,
    autoDiscount: 0,
    isMasterItem: true,
    hasColors: true,
    color: 'Dark Burgundy',
    hasSizes: true,
    size: '250ml'
  },
  {
    id: 21,
    description: 'خل عنب بلدي 250مل',
    code: 'OGV250MLB103',
    otherDescription: 'ORGANIC GRAPE VINEGAR',
    itemComment: '',
    secondLangDescription: '',
    secondLangItemComment: '',
    internalNote: '',
    categoryId: 2,
    categoryName: 'مفرق',
    divisionId: 5,
    divisionName: 'مقطرات ومدبسات مفرق',
    groupId: 14,
    groupName: 'مقطرات مفرق 250مل',
    sellingFunction: 'Revenue',
    defaultLocationId: 12,
    defaultLocationName: 'Showroom',
    logicalWarehouseId: 1,
    logicalWarehouseName: 'Main Store',
    mainSupplierId: 5,
    mainSupplierName: 'SOOL',
    lastSupplierName: 'SOOL',
    itemBrand: 'المنى',
    itemLeadTime: '2 Days',
    source: 'Consignment',
    buyingFormat: 'BOT',
    inventoryFormat: 'BOT',
    usageFormat: 'BOT',
    qtyInBuyingFormat: 1,
    qtyInInventoryFormat: 1,
    packingProduction: 'Standard Bottle',
    qtyInPackingFormat: 1,
    unitCostLL: 77162.40,
    averageCostLL: 77162.40,
    unitCostUSD: 0.85736,
    averageCostUSD: 0.85736,
    additionalCostLL: 0,
    markupPct: 30,
    recommendedPriceLL: 100311.12,
    sellingPrice1LL: 100000,
    beforeTax1LL: 100000,
    profit1Pct: 29.59,
    sellingPrice1USD: 1.11,
    sellingPrice2LL: 100000,
    beforeTax2LL: 100000,
    qtyPrice2: 1,
    profit2Pct: 29.59,
    sellingPrice2USD: 1.11,
    sellingPrice3LL: 100000,
    beforeTax3LL: 100000,
    qtyPrice3: 1,
    profit3Pct: 29.59,
    sellingPrice3USD: 1.11,
    sellingPrice4LL: 100000,
    beforeTax4LL: 100000,
    qtyPrice4: 1,
    profit4Pct: 29.59,
    sellingPrice4USD: 1.11,
    secondCurrencyRate: 90000,
    barcode: '5281234123535',
    alternativeBarcode2: '',
    alternativeBarcode3: '',
    applySp2Qty2: false,
    rfidt1: '',
    rfidt2: '',
    qtyOH: 0.0,
    unit: 'BOT',
    sellingPrice: 100000,
    cost: 77162.40,
    function: 'Consignment',
    updatedAt: '21 Jul, 2026',
    isDiscontinued: false,
    stockRecords: [],
    imageUrl: '',
    videoUrl: '',
    assemblyCalculationMethod: 'Automatic',
    assemblyItems: [],
    includedItems: [],
    movements: [],
    priceLogs: [],
    auditLogs: [],
    salesPerformance: [],
    assetAccount: '120101',
    expenseAccount: '510101',
    revenueAccount: '410101',
    stockVariationAccount: '510301',
    tax1: false,
    tax2: false,
    tax3: false,
    tax4: false,
    tax5: false,
    tax6: false,
    autoDiscount: 0,
    isConsignment: true,
    hasIngredients: true,
    ingredients: 'Organic Baladi Grapes Pressed Ferment',
    hasExpiry: true,
    expiryDate: '2027-09-01'
  },
  {
    id: 22,
    description: 'دبس رمان 250 مل',
    code: 'PGM250MLB103',
    otherDescription: 'POMEGRANATE MOLASSES 250ML',
    itemComment: '',
    secondLangDescription: '',
    secondLangItemComment: '',
    internalNote: '',
    categoryId: 2,
    categoryName: 'مفرق',
    divisionId: 5,
    divisionName: 'مقطرات ومدبسات مفرق',
    groupId: 14,
    groupName: 'مقطرات مفرق 250مل',
    sellingFunction: 'Revenue',
    defaultLocationId: 12,
    defaultLocationName: 'Showroom',
    logicalWarehouseId: 0,
    logicalWarehouseName: '',
    mainSupplierId: 5,
    mainSupplierName: 'SOOL',
    lastSupplierName: 'SOOL',
    itemBrand: 'زيت و زيتون الجنوب',
    itemLeadTime: '2 Days',
    source: 'Local',
    buyingFormat: 'BOT',
    inventoryFormat: 'BOT',
    usageFormat: 'BOT',
    qtyInBuyingFormat: 1,
    qtyInInventoryFormat: 1,
    packingProduction: 'Standard Bottle',
    qtyInPackingFormat: 1,
    unitCostLL: 38828.11,
    averageCostLL: 38828.11,
    unitCostUSD: 0.43142,
    averageCostUSD: 0.43142,
    additionalCostLL: 0,
    markupPct: 30,
    recommendedPriceLL: 50476.54,
    sellingPrice1LL: 60000,
    beforeTax1LL: 60000,
    profit1Pct: 54.53,
    sellingPrice1USD: 0.67,
    sellingPrice2LL: 60000,
    beforeTax2LL: 60000,
    qtyPrice2: 1,
    profit2Pct: 54.53,
    sellingPrice2USD: 0.67,
    sellingPrice3LL: 60000,
    beforeTax3LL: 60000,
    qtyPrice3: 1,
    profit3Pct: 54.53,
    sellingPrice3USD: 0.67,
    sellingPrice4LL: 60000,
    beforeTax4LL: 60000,
    qtyPrice4: 1,
    profit4Pct: 54.53,
    sellingPrice4USD: 0.67,
    secondCurrencyRate: 90000,
    barcode: '5281234123542',
    alternativeBarcode2: '',
    alternativeBarcode3: '',
    applySp2Qty2: false,
    rfidt1: '',
    rfidt2: '',
    qtyOH: 0.0,
    unit: 'BOT',
    sellingPrice: 60000,
    cost: 38828.11,
    function: 'Revenue',
    updatedAt: '01 Aug, 2026',
    isDiscontinued: false,
    stockRecords: [],
    imageUrl: '',
    videoUrl: '',
    assemblyCalculationMethod: 'Automatic',
    assemblyItems: [],
    includedItems: [],
    movements: [],
    priceLogs: [],
    auditLogs: [],
    salesPerformance: [],
    assetAccount: '120101',
    expenseAccount: '510101',
    revenueAccount: '410101',
    stockVariationAccount: '510301',
    tax1: false,
    tax2: false,
    tax3: false,
    tax4: false,
    tax5: false,
    tax6: false,
    autoDiscount: 0,
    hasColors: true,
    color: 'Deep Pomegranate'
  },
  {
    id: 23,
    description: 'ماء زهر 250مل',
    code: 'COBW250MLB103',
    otherDescription: 'ORANGE BLOSSOM WATER 250ML',
    itemComment: '',
    secondLangDescription: '',
    secondLangItemComment: '',
    internalNote: '',
    categoryId: 2,
    categoryName: 'مفرق',
    divisionId: 5,
    divisionName: 'مقطرات ومدبسات مفرق',
    groupId: 14,
    groupName: 'مقطرات مفرق 250مل',
    sellingFunction: 'Revenue',
    defaultLocationId: 0,
    defaultLocationName: '',
    logicalWarehouseId: 1,
    logicalWarehouseName: 'Main Store',
    mainSupplierId: 5,
    mainSupplierName: 'SOOL',
    lastSupplierName: 'SOOL',
    itemBrand: 'زيت و زيتون الجنوب',
    itemLeadTime: '2 Days',
    source: 'Local',
    buyingFormat: 'BOT',
    inventoryFormat: 'BOT',
    usageFormat: 'BOT',
    qtyInBuyingFormat: 1,
    qtyInInventoryFormat: 1,
    packingProduction: 'Standard Bottle',
    qtyInPackingFormat: 1,
    unitCostLL: 26035.81,
    averageCostLL: 26035.81,
    unitCostUSD: 0.28928,
    averageCostUSD: 0.28928,
    additionalCostLL: 0,
    markupPct: 30,
    recommendedPriceLL: 33846.55,
    sellingPrice1LL: 50000,
    beforeTax1LL: 50000,
    profit1Pct: 92.04,
    sellingPrice1USD: 0.56,
    sellingPrice2LL: 50000,
    beforeTax2LL: 50000,
    qtyPrice2: 1,
    profit2Pct: 92.04,
    sellingPrice2USD: 0.56,
    sellingPrice3LL: 50000,
    beforeTax3LL: 50000,
    qtyPrice3: 1,
    profit3Pct: 92.04,
    sellingPrice3USD: 0.56,
    sellingPrice4LL: 50000,
    beforeTax4LL: 50000,
    qtyPrice4: 1,
    profit4Pct: 92.04,
    sellingPrice4USD: 0.56,
    secondCurrencyRate: 90000,
    barcode: '5281234123559',
    alternativeBarcode2: '',
    alternativeBarcode3: '',
    applySp2Qty2: false,
    rfidt1: '',
    rfidt2: '',
    qtyOH: 0.0,
    unit: 'BOT',
    sellingPrice: 50000,
    cost: 26035.81,
    function: 'Revenue',
    updatedAt: '21 Jul, 2026',
    isDiscontinued: false,
    stockRecords: [],
    imageUrl: '',
    videoUrl: '',
    assemblyCalculationMethod: 'Automatic',
    assemblyItems: [],
    includedItems: [],
    movements: [],
    priceLogs: [],
    auditLogs: [],
    salesPerformance: [],
    assetAccount: '120101',
    expenseAccount: '510101',
    revenueAccount: '410101',
    stockVariationAccount: '510301',
    tax1: false,
    tax2: false,
    tax3: false,
    tax4: false,
    tax5: false,
    tax6: false,
    autoDiscount: 0,
    hasSerialNumber: true,
    serialNumber: 'SN-VNG-2026-901'
  },
  {
    id: 24,
    description: 'ماء ورد 250مل',
    code: 'CARW250GB103',
    otherDescription: 'ROSE WATER 250ML',
    itemComment: '',
    secondLangDescription: '',
    secondLangItemComment: '',
    internalNote: '',
    categoryId: 2,
    categoryName: 'مفرق',
    divisionId: 5,
    divisionName: 'مقطرات ومدبسات مفرق',
    groupId: 14,
    groupName: 'مقطرات مفرق 250مل',
    sellingFunction: 'Service',
    defaultLocationId: 12,
    defaultLocationName: 'Showroom',
    logicalWarehouseId: 1,
    logicalWarehouseName: 'Main Store',
    mainSupplierId: 5,
    mainSupplierName: 'SOOL',
    lastSupplierName: 'SOOL',
    itemBrand: 'تغذية',
    itemLeadTime: '2 Days',
    source: 'Vanguard Market place',
    buyingFormat: 'BOT',
    inventoryFormat: 'BOT',
    usageFormat: 'BOT',
    qtyInBuyingFormat: 1,
    qtyInInventoryFormat: 1,
    packingProduction: 'Standard Bottle',
    qtyInPackingFormat: 1,
    unitCostLL: 25860.24,
    averageCostLL: 25860.24,
    unitCostUSD: 0.28733,
    averageCostUSD: 0.28733,
    additionalCostLL: 0,
    markupPct: 30,
    recommendedPriceLL: 33618.31,
    sellingPrice1LL: 50000,
    beforeTax1LL: 50000,
    profit1Pct: 93.34,
    sellingPrice1USD: 0.56,
    sellingPrice2LL: 50000,
    beforeTax2LL: 50000,
    qtyPrice2: 1,
    profit2Pct: 93.34,
    sellingPrice2USD: 0.56,
    sellingPrice3LL: 50000,
    beforeTax3LL: 50000,
    qtyPrice3: 1,
    profit3Pct: 93.34,
    sellingPrice3USD: 0.56,
    sellingPrice4LL: 50000,
    beforeTax4LL: 50000,
    qtyPrice4: 1,
    profit4Pct: 93.34,
    sellingPrice4USD: 0.56,
    secondCurrencyRate: 90000,
    barcode: '5281234123566',
    alternativeBarcode2: '',
    alternativeBarcode3: '',
    applySp2Qty2: false,
    rfidt1: '',
    rfidt2: '',
    qtyOH: 0.0,
    unit: 'BOT',
    sellingPrice: 50000,
    cost: 25860.24,
    function: 'Revenue',
    updatedAt: '21 Jul, 2026',
    isDiscontinued: false,
    stockRecords: [],
    imageUrl: '',
    videoUrl: '',
    assemblyCalculationMethod: 'Automatic',
    assemblyItems: [],
    includedItems: [],
    movements: [],
    priceLogs: [],
    auditLogs: [],
    salesPerformance: [],
    assetAccount: '120101',
    expenseAccount: '510101',
    revenueAccount: '410101',
    stockVariationAccount: '510301',
    tax1: false,
    tax2: false,
    tax3: false,
    tax4: false,
    tax5: false,
    tax6: false,
    autoDiscount: 0,
    isService: true
  },
  // Additional sample items for other groups
  {
    id: 25,
    description: 'مقطرات غالون 4 ليتر',
    code: 'DIST4LGL101',
    otherDescription: 'DISTILLATES GALLON 4L',
    itemComment: '',
    secondLangDescription: '',
    secondLangItemComment: '',
    internalNote: '',
    categoryId: 2,
    categoryName: 'مفرق',
    divisionId: 5,
    divisionName: 'مقطرات ومدبسات مفرق',
    groupId: 15,
    groupName: 'مقطرات ومدبسات غالون',
    sellingFunction: 'Revenue',
    defaultLocationId: 12,
    defaultLocationName: 'Showroom',
    logicalWarehouseId: 1,
    logicalWarehouseName: 'Main Store',
    mainSupplierId: 5,
    mainSupplierName: 'SOOL',
    lastSupplierName: 'SOOL',
    itemBrand: 'راس الحصان',
    itemLeadTime: '3 Days',
    source: 'Local',
    buyingFormat: 'GAL',
    inventoryFormat: 'GAL',
    usageFormat: 'GAL',
    qtyInBuyingFormat: 1,
    qtyInInventoryFormat: 1,
    packingProduction: 'Gallon 4L',
    qtyInPackingFormat: 1,
    unitCostLL: 0,
    averageCostLL: 0,
    unitCostUSD: 0,
    averageCostUSD: 0,
    additionalCostLL: 0,
    markupPct: 30,
    recommendedPriceLL: 234000,
    sellingPrice1LL: 250000,
    beforeTax1LL: 250000,
    profit1Pct: 38.89,
    sellingPrice1USD: 2.78,
    sellingPrice2LL: 250000,
    beforeTax2LL: 250000,
    qtyPrice2: 1,
    profit2Pct: 38.89,
    sellingPrice2USD: 2.78,
    sellingPrice3LL: 250000,
    beforeTax3LL: 250000,
    qtyPrice3: 1,
    profit3Pct: 38.89,
    sellingPrice3USD: 2.78,
    sellingPrice4LL: 250000,
    beforeTax4LL: 250000,
    qtyPrice4: 1,
    profit4Pct: 38.89,
    sellingPrice4USD: 2.78,
    secondCurrencyRate: 90000,
    barcode: '5281234123573',
    alternativeBarcode2: '',
    alternativeBarcode3: '',
    applySp2Qty2: false,
    rfidt1: '',
    rfidt2: '',
    qtyOH: 12.0,
    unit: 'GAL',
    sellingPrice: 250000,
    cost: 0,
    function: 'Revenue',
    updatedAt: '25 Jul, 2026',
    isDiscontinued: false,
    stockRecords: [],
    imageUrl: '',
    videoUrl: '',
    assemblyCalculationMethod: 'Automatic',
    assemblyItems: [],
    includedItems: [],
    movements: [],
    priceLogs: [],
    auditLogs: [],
    salesPerformance: [],
    assetAccount: '120101',
    expenseAccount: '510101',
    revenueAccount: '410101',
    stockVariationAccount: '510301',
    tax1: false,
    tax2: false,
    tax3: false,
    tax4: false,
    tax5: false,
    tax6: false,
    autoDiscount: 0,
    reorderLevel: 0
  },
  {
    id: 26,
    description: 'زيت زيتون بكر ممتاز 1 ليتر',
    code: 'EVOO1LB101',
    otherDescription: 'EXTRA VIRGIN OLIVE OIL 1L',
    itemComment: 'Cold Pressed First Harvest',
    secondLangDescription: 'Extra Virgin Olive Oil 1L',
    secondLangItemComment: '',
    internalNote: 'Top Seller Quality Grade A',
    categoryId: 2,
    categoryName: 'مفرق',
    divisionId: 10,
    divisionName: 'زيوت مفرق',
    groupId: 25,
    groupName: 'زيت زيتون مفرق',
    sellingFunction: 'Revenue',
    defaultLocationId: 12,
    defaultLocationName: 'Showroom',
    logicalWarehouseId: 1,
    logicalWarehouseName: 'Main Store',
    mainSupplierId: 5,
    mainSupplierName: 'SOOL',
    lastSupplierName: 'SOOL',
    itemBrand: 'زيت و زيتون الجنوب',
    itemLeadTime: '1 Day',
    source: 'Local',
    buyingFormat: 'BOT',
    inventoryFormat: 'BOT',
    usageFormat: 'BOT',
    qtyInBuyingFormat: 1,
    qtyInInventoryFormat: 1,
    packingProduction: 'Bottle 1L',
    qtyInPackingFormat: 1,
    unitCostLL: 720000,
    averageCostLL: 720000,
    unitCostUSD: 8.0,
    averageCostUSD: 8.0,
    additionalCostLL: 0,
    markupPct: 35,
    recommendedPriceLL: 972000,
    sellingPrice1LL: 0,
    beforeTax1LL: 0,
    profit1Pct: 0,
    sellingPrice1USD: 0,
    sellingPrice2LL: 1050000,
    beforeTax2LL: 1050000,
    qtyPrice2: 1,
    profit2Pct: 45.83,
    sellingPrice2USD: 11.67,
    sellingPrice3LL: 1050000,
    beforeTax3LL: 1050000,
    qtyPrice3: 1,
    profit3Pct: 45.83,
    sellingPrice3USD: 11.67,
    sellingPrice4LL: 1050000,
    beforeTax4LL: 1050000,
    qtyPrice4: 1,
    profit4Pct: 45.83,
    sellingPrice4USD: 11.67,
    secondCurrencyRate: 90000,
    barcode: '5281234999011',
    alternativeBarcode2: '',
    alternativeBarcode3: '',
    applySp2Qty2: false,
    rfidt1: '',
    rfidt2: '',
    qtyOH: 45.0,
    unit: 'BOT',
    sellingPrice: 0,
    cost: 720000,
    function: 'Revenue',
    updatedAt: '05 Aug, 2026',
    isDiscontinued: false,
    stockRecords: [],
    imageUrl: '',
    videoUrl: '',
    assemblyCalculationMethod: 'Automatic',
    assemblyItems: [],
    includedItems: [],
    movements: [],
    priceLogs: [],
    auditLogs: [],
    salesPerformance: [],
    assetAccount: '120101',
    expenseAccount: '510101',
    revenueAccount: '410101',
    stockVariationAccount: '510301',
    tax1: false,
    tax2: false,
    tax3: false,
    tax4: false,
    tax5: false,
    tax6: false,
    autoDiscount: 0
  }
];
