// c:\Projects\Vanguard_ERP\app\backoffice\operations\operationsData.ts
// Authentic relational data schema & matrix mappings for Southern Olive Oil Products S.A.R.L

export interface CategoryRecord {
  id: string;
  name: string;
  linkedCategory: string;
  sorting: number;
  divisionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DivisionRecord {
  id: string;
  name: string;
  category: string;
  sorting: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupRecord {
  id: string;
  name: string;
  division: string;
  sorting: number;
  tax1: number;
  tax2: number;
  tax3: number;
  tax4: number;
  tax5: number;
  tax6: number;
  itemsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UnitRecord {
  id: string;
  name: string;
  description: string;
  remarks: string;
}

export interface LocationRecord {
  id: string;
  name: string;
  code: string;
  description: string;
  zone: string;
}

export interface SupplierRecord {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  grade: string;
  country: string;
  notes: string;
  balanceUsd: number;
  balanceLbp: number;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentRecord {
  id: string;
  description: string;
  itemsCount: number;
  menuType: string;
}

export interface ProductItemRecord {
  id: string;
  code: string;
  barcode: string;
  description: string;
  group: string;
  division: string;
  category: string;
  qtyOnHand: number;
  unit: string;
  sellingPriceSp: number; // USD
  sellingPriceLbp: number;
  cost: number; // USD
  costLbp: number;
  buyingFormat: string;
  function: string;
  brand: string;
  location: string;
  updatedAt: string;
}

export interface SalesRecord {
  id: string;
  invoiceNo: string;
  date: string;
  branch: string;
  customer: string;
  customerId: string;
  salesman: string;
  amountUsd: number;
  amountLbp: number;
  currency: 'USD' | 'LBP';
  discountPct: number;
  taxPct: number;
  status: 'PAID' | 'CREDIT' | 'PARTIAL' | 'VOID';
  posted: boolean;
  deliveryMethod: string;
}

export interface QuotationRecord {
  id: string;
  quotationNo: string;
  date: string;
  branch: string;
  customer: string;
  customerId: string;
  salesman: string;
  validUntil: string;
  totalUsd: number;
  totalLbp: number;
  discount: number;
  status: 'ACCEPTED' | 'PENDING' | 'EXPIRED' | 'REJECTED';
}

export interface DeliveryRecord {
  id: string;
  deliveryNoteNo: string;
  invoiceNo: string;
  customerName: string;
  customerId: string;
  companyName: string;
  branch: string;
  destination: string;
  invoiceDate: string;
  deliveryDate: string;
  status: 'DELIVERED' | 'DISPATCHED' | 'OUT_FOR_DELIVERY' | 'PENDING';
  totalUsd: number;
  totalLbp: number;
  qty: number;
  itemDescription: string;
  driverName: string;
  plateNo: string;
}

export interface PurchaseRecord {
  id: string;
  purchaseNo: string;
  date: string;
  supplier: string;
  contactName: string;
  invoiceRef: string;
  branch: string;
  code: string;
  description: string;
  qty: number;
  qtyReceived: number;
  unit: string;
  unitPriceUsd: number;
  amountUsd: number;
  amountLbp: number;
  deliveryDate: string;
  spUsd: number;
  taxDesc: string;
  taxRate: number;
  expiryDate: string;
  location: string;
  freightCostUsd: number;
  customsCostUsd: number;
  status: 'POSTED' | 'DRAFT' | 'VERIFIED';
}

export interface PurchaseOrderRecord {
  id: string;
  poNo: string;
  date: string;
  supplier: string;
  contactName: string;
  deliveryDue: string;
  branch: string;
  code: string;
  description: string;
  qtyOrdered: number;
  qtyReceived: number;
  unit: string;
  unitPriceUsd: number;
  totalUsd: number;
  approvalStatus: 'APPROVED' | 'PENDING_APPROVAL' | 'CANCELLED';
  receivingStatus: 'COMPLETED' | 'PARTIAL' | 'AWAITING';
}

export interface ReorderGuideRecord {
  id: string;
  code: string;
  description: string;
  qtyOnHand: number;
  minLevel: number;
  maxLevel: number;
  qtyToOrder: number;
  unit: string;
  buyingFormat: string;
  costUnitUsd: number;
  group: string;
  supplier: string;
  leadTimeDays: number;
}

export interface TransferRecord {
  id: string;
  reqNo: string;
  date: string;
  sourceLocation: string;
  destinationLocation: string;
  code: string;
  description: string;
  barcode: string;
  qtyTransfered: number;
  qtyReceived: number;
  unit: string;
  unitCostUsd: number;
  avgCostUsd: number;
  qtyOnHand: number;
  totalCostUsd: number;
  status: 'RECEIVED' | 'IN_TRANSIT' | 'PREPARING';
  posted: boolean;
}

export interface LostGoodsRecord {
  id: string;
  entryNo: string;
  date: string;
  location: string;
  code: string;
  description: string;
  qty: number;
  unit: string;
  unitCostUsd: number;
  totalCostUsd: number;
  avgCostUsd: number;
  reason: string;
  recordedBy: string;
}

export interface AssemblyRecord {
  id: string;
  assemblyNo: string;
  date: string;
  finishedCode: string;
  finishedDescription: string;
  batchNo: string;
  qtyProduced: number;
  unit: string;
  rawMaterials: Array<{
    itemCode: string;
    description: string;
    qty: number;
    unit: string;
    costUsd: number;
  }>;
  totalRawCostUsd: number;
  overheadCostUsd: number;
  totalProductionCostUsd: number;
  status: 'COMPLETED' | 'IN_PROGRESS';
}

export interface AdjustmentRecord {
  id: string;
  adjNo: string;
  date: string;
  branch: string;
  code: string;
  itemDescription: string;
  qoh: number;
  newQty: number;
  variance: number;
  varianceValueUsd: number;
  units: string;
  reason: string;
  auditor: string;
}

export interface ProductRequestRecord {
  id: string;
  prNo: string;
  date: string;
  requestedByBranch: string;
  destinationBranch: string;
  requestedBy: string;
  location: string;
  itemCode: string;
  description: string;
  qtyReq: number;
  qtyOh: number;
  costUsd: number;
  unit: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'PARTIAL';
  approvedBy: string;
  approvedDate: string;
  deliveryDate: string;
  remark: string;
}

export interface ManageProductRequestRecord {
  id: string;
  prNo: string;
  date: string;
  requestedByBranch: string;
  requestedFromBranch: string;
  requestedBy: string;
  itemCode: string;
  description: string;
  qtyReq: number;
  qtyApproved: number;
  qtyOh: number;
  status: 'PENDING_REVIEW' | 'ALLOCATED' | 'SUBSTITUTED';
  location: string;
  deliveryDate: string;
  remark: string;
}

export interface ProductReqPrepRecord {
  id: string;
  ticketNo: string;
  status: 'QUEUED' | 'PICKING' | 'PACKED' | 'DISPATCHED';
  itemCode: string;
  description: string;
  qtyReq: number;
  qtyOh: number;
  qtyApp: number;
  pickerName: string;
  processedPct: number;
}

export interface ReceivingGoodsRecord {
  id: string;
  prNo: string;
  requestedByBranch: string;
  requestedFromBranch: string;
  date: string;
  deliveryDate: string;
  requestedBy: string;
  toLocation: string;
  itemsSummary: string;
  confirmed: boolean;
  receivedBy: string;
  remark: string;
}

export interface RejectReasonRecord {
  id: string;
  code: string;
  description: string;
  active: boolean;
}

export interface EventRecord {
  id: string;
  eventId: string;
  eventName: string;
  customerName: string;
  company: string;
  eventType: string;
  venueName: string;
  status: 'CONFIRMED' | 'TENTATIVE' | 'COMPLETED' | 'CANCELLED';
  eventDate: string;
  attendees: number;
  totalBudgetUsd: number;
  branch: string;
}

export interface EventVenueRecord {
  id: string;
  venueId: string;
  venueName: string;
  city: string;
  location: string;
  contactName: string;
  phoneNumber: string;
  capacity: number;
  dailyRateUsd: number;
  amenities: string;
}

export interface EventResourceRecord {
  id: string;
  resourceId: string;
  name: string;
  description: string;
  type: 'EQUIPMENT' | 'PERSONNEL' | 'VEHICLE' | 'FURNITURE' | 'TASTING_KIT';
  availableQty: number;
  costUsd: number;
}

export interface EventTypeRecord {
  id: string;
  typeId: string;
  name: string;
  description: string;
  defaultDurationHours: number;
}

export interface LostGoodsReasonRecord {
  id: string;
  reasonId: string;
  wastageReason: string;
  category: 'PRESSING_RESIDUE' | 'BOTTLE_BREAKAGE' | 'SEAL_LEAK' | 'EXPIRED_SAMPLE' | 'GROVE_ROT';
  active: boolean;
}

export interface SizeGroupRecord {
  id: string;
  groupId: string;
  groupName: string;
  category: string;
}

export interface SizeRecord {
  id: string;
  sizeId: string;
  name: string;
  groupName: string;
  code: string;
}

export interface ColorRecord {
  id: string;
  colorId: string;
  colorDescription: string;
  hexCode: string;
}

export interface DiscountRecord {
  id: string;
  discountId: string;
  description: string;
  discountPct: number;
  startDate: string;
  endDate: string;
  branch: string;
  active: boolean;
}

export interface PaymentTypeRecord {
  id: string;
  paymentTypeId: string;
  name: string;
  type: 'CASH' | 'CREDIT_CARD' | 'WHISH_MONEY' | 'BANK_TRANSFER' | 'CHECK';
  accountNumber: string;
  sorting: number;
  currency: 'USD' | 'LBP';
  changeStatus: 'ALLOWED' | 'EXACT_ONLY';
}

export interface CurrencySetupRecord {
  id: string;
  currency: string;
  symbol: string;
  rateVsUsd: number;
  decimals: number;
  isMain: boolean;
}

export interface InventoryBrandRecord {
  id: string;
  brandId: string;
  name: string;
  manufacturer: string;
  country: string;
}

export interface DeliveryProviderRecord {
  id: string;
  providerId: string;
  name: string;
  providerType: 'INTERNAL_FLEET' | '3PL_EXPRESS' | 'REGIONAL_CARRIER';
  contactPerson: string;
  phone: string;
  active: boolean;
}

// ==========================================
// SEED DATA: SOUTHERN OLIVE OIL PRODUCTS S.A.R.L
// ==========================================

export const INITIAL_CATEGORIES: CategoryRecord[] = [
  { id: 'CAT-01', name: 'Olive Oils & Culinary Liquids', linkedCategory: 'Food & Gourmet Agro', sorting: 1, divisionsCount: 2, createdAt: '2024-01-10', updatedAt: '2026-09-01' },
  { id: 'CAT-02', name: 'Bottling & Packaging Consumables', linkedCategory: 'Industrial Supplies', sorting: 2, divisionsCount: 2, createdAt: '2024-01-12', updatedAt: '2026-08-28' },
  { id: 'CAT-03', name: 'Raw Harvest & Grove Produce', linkedCategory: 'Agricultural Intake', sorting: 3, divisionsCount: 1, createdAt: '2024-01-15', updatedAt: '2026-09-02' },
  { id: 'CAT-04', name: 'Olive By-Products & Organic Soap', linkedCategory: 'Personal Care & Biomass', sorting: 4, divisionsCount: 1, createdAt: '2024-02-01', updatedAt: '2026-09-03' }
];

export const INITIAL_DIVISIONS: DivisionRecord[] = [
  { id: 'DIV-01', name: 'Cold Pressed Premium Bottled', category: 'Olive Oils & Culinary Liquids', sorting: 1, createdAt: '2024-01-10', updatedAt: '2026-09-01' },
  { id: 'DIV-02', name: 'Bulk Silo & Commercial Tins', category: 'Olive Oils & Culinary Liquids', sorting: 2, createdAt: '2024-01-11', updatedAt: '2026-08-20' },
  { id: 'DIV-03', name: 'UV Dark Glassware & Closures', category: 'Bottling & Packaging Consumables', sorting: 1, createdAt: '2024-01-12', updatedAt: '2026-08-28' },
  { id: 'DIV-04', name: 'Sealed Tinplate & Jerry Cans', category: 'Bottling & Packaging Consumables', sorting: 2, createdAt: '2024-01-13', updatedAt: '2026-08-15' },
  { id: 'DIV-05', name: 'Raw Olives Intake Sorting', category: 'Raw Harvest & Grove Produce', sorting: 1, createdAt: '2024-01-15', updatedAt: '2026-09-02' },
  { id: 'DIV-06', name: 'Laurel & Olive Artisan Soaps', category: 'Olive By-Products & Organic Soap', sorting: 1, createdAt: '2024-02-01', updatedAt: '2026-09-03' }
];

export const INITIAL_GROUPS: GroupRecord[] = [
  { id: 'GRP-01', name: 'Extra Virgin Olive Oil (EVOO)', division: 'Cold Pressed Premium Bottled', sorting: 1, tax1: 0, tax2: 0, tax3: 0, tax4: 0, tax5: 0, tax6: 0, itemsCount: 4, createdAt: '2024-01-10', updatedAt: '2026-09-01' },
  { id: 'GRP-02', name: 'Virgin Olive Oil (VOO)', division: 'Bulk Silo & Commercial Tins', sorting: 2, tax1: 0, tax2: 0, tax3: 0, tax4: 0, tax5: 0, tax6: 0, itemsCount: 2, createdAt: '2024-01-11', updatedAt: '2026-08-20' },
  { id: 'GRP-03', name: 'Dark Marasca Glass Bottles', division: 'UV Dark Glassware & Closures', sorting: 1, tax1: 11, tax2: 0, tax3: 0, tax4: 0, tax5: 0, tax6: 0, itemsCount: 3, createdAt: '2024-01-12', updatedAt: '2026-08-28' },
  { id: 'GRP-04', name: 'Lithographed Metal Tins', division: 'Sealed Tinplate & Jerry Cans', sorting: 2, tax1: 11, tax2: 0, tax3: 0, tax4: 0, tax5: 0, tax6: 0, itemsCount: 2, createdAt: '2024-01-13', updatedAt: '2026-08-15' },
  { id: 'GRP-05', name: 'Fresh Green Harvest Olives', division: 'Raw Harvest & Grove Produce', sorting: 1, tax1: 0, tax2: 0, tax3: 0, tax4: 0, tax5: 0, tax6: 0, itemsCount: 2, createdAt: '2024-01-15', updatedAt: '2026-09-02' },
  { id: 'GRP-06', name: 'Artisan Olive Oil Soaps', division: 'Laurel & Olive Artisan Soaps', sorting: 1, tax1: 11, tax2: 0, tax3: 0, tax4: 0, tax5: 0, tax6: 0, itemsCount: 2, createdAt: '2024-02-01', updatedAt: '2026-09-03' }
];

export const INITIAL_UNITS: UnitRecord[] = [
  { id: 'UNT-01', name: '750ml Bottle', description: 'Dark UV Marasca Glass 750ml', remarks: 'Retail export standard' },
  { id: 'UNT-02', name: '500ml Bottle', description: 'Dorica UV Glass 500ml', remarks: 'Delicatessen gift standard' },
  { id: 'UNT-03', name: '16-Liter Tin', description: 'Lithographed Tin Can 16L with Seal Spout', remarks: 'Traditional household tin' },
  { id: 'UNT-04', name: '10-Liter Tin', description: 'Commercial catering format 10L', remarks: 'Foodservice tin' },
  { id: 'UNT-05', name: 'Kilogram (KG)', description: 'Metric Weight Kilograms', remarks: 'Raw olive intake and pomace weight' },
  { id: 'UNT-06', name: 'Liter (L)', description: 'Liquid Volume Liters', remarks: 'Holding tanks and mill yields' },
  { id: 'UNT-07', name: 'Carton (12x750ml)', description: 'Corrugated shipper carton of 12 bottles', remarks: 'Logistics master carton' },
  { id: 'UNT-08', name: 'Bar 150g', description: 'Handcrafted Olive Oil Soap Bar', remarks: 'Individual packaged bar' }
];

export const INITIAL_LOCATIONS: LocationRecord[] = [
  { id: 'LOC-01', code: 'MRJ-MILL-01', name: 'Marjeyoun Press Mill & Silos', description: 'Main extraction mill, 4x stainless holding tanks, centrifuge & decanters', zone: 'South Governorate' },
  { id: 'LOC-02', code: 'BEY-HUB-02', name: 'Beirut Central Distribution Depot', description: 'Finished goods temperature-controlled shipping & logistics warehouse', zone: 'Mount Lebanon' },
  { id: 'LOC-03', code: 'CHO-STORE-03', name: 'Choueifat POS Store Front & Showroom', description: 'Direct retail showroom, customer pickup & POS terminal', zone: 'Beirut Suburb' },
  { id: 'LOC-04', code: 'HAS-GROVE-04', name: 'Hasbaya Grove Intake Station', description: 'Farmer olive receiving, quality sorting conveyor and field scales', zone: 'Hasbaya District' }
];

export const INITIAL_SUPPLIERS: SupplierRecord[] = [
  { id: 'SUP-01', name: 'Abbas & Hussein Dirani', contactPerson: 'Abbas', phone: '+961 1 550 120', grade: 'A', country: 'Lebanon', notes: '', balanceUsd: 0, balanceLbp: 0, createdAt: '2026-01-26', updatedAt: '2026-01-26' },
  { id: 'SUP-02', name: 'Abbas Dirani', contactPerson: 'Abbas Dirani', phone: '+961 76 939 604', grade: 'A', country: 'Lebanon', notes: '', balanceUsd: 0, balanceLbp: 0, createdAt: '2026-01-26', updatedAt: '2026-01-26' },
  { id: 'SUP-03', name: 'B GROUP', contactPerson: 'B Group', phone: '+961 1 445 670', grade: 'A', country: 'Lebanon', notes: '', balanceUsd: 0, balanceLbp: 0, createdAt: '2025-12-23', updatedAt: '2025-12-23' },
  { id: 'SUP-04', name: 'C-Way Trading', contactPerson: 'C-Way', phone: '+961 1 689 201', grade: 'A', country: 'Lebanon', notes: '', balanceUsd: 0, balanceLbp: 0, createdAt: '2025-12-11', updatedAt: '2025-12-11' },
  { id: 'SUP-05', name: 'Clatchy', contactPerson: 'Clatchy', phone: '+961 1 432 890', grade: 'A', country: 'Lebanon', notes: '', balanceUsd: 0, balanceLbp: 0, createdAt: '2025-12-29', updatedAt: '2025-12-29' },
  { id: 'SUP-06', name: 'Ezzeddin', contactPerson: 'Ezzeddin', phone: '+961 7 740 555', grade: 'A', country: 'Lebanon', notes: '', balanceUsd: 0, balanceLbp: 0, createdAt: '2025-12-10', updatedAt: '2025-12-10' },
  { id: 'SUP-07', name: 'Koubeissi Est.', contactPerson: 'Koubeissi', phone: '+961 5 434 734', grade: 'A', country: 'Lebanon', notes: '', balanceUsd: 0, balanceLbp: 0, createdAt: '2026-02-09', updatedAt: '2026-02-09' },
  { id: 'SUP-08', name: 'Mrs Randa', contactPerson: 'Mrs Randa', phone: '+961 7 760 120', grade: 'A', country: 'Lebanon', notes: '', balanceUsd: 0, balanceLbp: 0, createdAt: '2025-12-12', updatedAt: '2025-12-12' },
  { id: 'SUP-09', name: 'Safa Bakery', contactPerson: 'Safa Bakery', phone: '+961 1 820 400', grade: 'A', country: 'Lebanon', notes: '', balanceUsd: 0, balanceLbp: 0, createdAt: '2026-04-03', updatedAt: '2026-04-03' },
  { id: 'SUP-10', name: 'Sedi Hisham', contactPerson: 'Abir', phone: '+961 1 300 200', grade: 'A', country: 'Lebanon', notes: '', balanceUsd: 0, balanceLbp: 0, createdAt: '2026-04-02', updatedAt: '2026-04-02' },
  { id: 'SUP-11', name: 'SOOL', contactPerson: 'Southern Olive Oil', phone: '+961 5 432 100', grade: 'A+', country: 'Lebanon', notes: '', balanceUsd: 4850.00, balanceLbp: 0, createdAt: '2025-12-15', updatedAt: '2025-12-15' },
  { id: 'SUP-12', name: 'Zahwe', contactPerson: 'Zahwe', phone: '+961 70 798 854', grade: 'A', country: 'Lebanon', notes: '', balanceUsd: 0, balanceLbp: 0, createdAt: '2025-12-07', updatedAt: '2025-12-07' },
  { id: 'SUP-13', name: 'الضيعة', contactPerson: 'الضيعة', phone: '+961 70 325 417', grade: 'A', country: 'Lebanon', notes: '', balanceUsd: 0, balanceLbp: 0, createdAt: '2026-03-23', updatedAt: '2026-03-23' },
  { id: 'SUP-14', name: 'مؤسسة عبده للتجارة', contactPerson: 'عبده للتجارة', phone: '+961 7 725 330', grade: 'A', country: 'Lebanon', notes: '', balanceUsd: 0, balanceLbp: 0, createdAt: '2026-02-19', updatedAt: '2026-05-13' }
];

export const INITIAL_DEPARTMENTS: DepartmentRecord[] = [
  { id: 'DEP-01', description: 'Cold Press Operations & Extraction', itemsCount: 12, menuType: 'Production' },
  { id: 'DEP-02', description: 'Bottling, Labelling & Packaging Line', itemsCount: 18, menuType: 'Packaging' },
  { id: 'DEP-03', description: 'Wholesale & Export Distribution', itemsCount: 24, menuType: 'Commercial' },
  { id: 'DEP-04', description: 'Boutique POS Retail & Direct Sales', itemsCount: 15, menuType: 'Retail' }
];

export const INITIAL_BRANDS: InventoryBrandRecord[] = [
  { id: 'BRD-01', brandId: 'BRD-SOG', name: 'Southern Olive Gold Reserve', manufacturer: 'Southern Olive Oil Products S.A.R.L', country: 'Lebanon' },
  { id: 'BRD-02', brandId: 'BRD-JAT', name: 'Jabal Amel Traditional', manufacturer: 'Southern Olive Oil Products S.A.R.L', country: 'Lebanon' },
  { id: 'BRD-03', brandId: 'BRD-ALJ', name: 'Al-Jalil Heritage Organic', manufacturer: 'Hasbaya Farmers Cooperative', country: 'Lebanon' }
];

export const INITIAL_SIZES_GROUPS: SizeGroupRecord[] = [
  { id: 'SZG-01', groupId: 'SZG-BTL', groupName: 'Glass Bottles Formats', category: 'Packaging' },
  { id: 'SZG-02', groupId: 'SZG-TIN', groupName: 'Sealed Tin Cans Formats', category: 'Packaging' },
  { id: 'SZG-03', groupId: 'SZG-MAS', groupName: 'Bulk Agricultural Weights', category: 'Raw Materials' }
];

export const INITIAL_SIZES: SizeRecord[] = [
  { id: 'SZ-01', sizeId: 'SZ-750M', name: '750ml Marasca', groupName: 'Glass Bottles Formats', code: '750M' },
  { id: 'SZ-02', sizeId: 'SZ-500D', name: '500ml Dorica', groupName: 'Glass Bottles Formats', code: '500D' },
  { id: 'SZ-03', sizeId: 'SZ-16L', name: '16 Liters Tin', groupName: 'Sealed Tin Cans Formats', code: '16LT' },
  { id: 'SZ-04', sizeId: 'SZ-10L', name: '10 Liters Tin', groupName: 'Sealed Tin Cans Formats', code: '10LT' },
  { id: 'SZ-05', sizeId: 'SZ-KG', name: 'Per Kilogram (KG)', groupName: 'Bulk Agricultural Weights', code: '1KG' }
];

export const INITIAL_COLORS: ColorRecord[] = [
  { id: 'COL-01', colorId: 'UV-EMERALD', colorDescription: 'UV Dark Emerald Green', hexCode: '#0c4a2b' },
  { id: 'COL-02', colorId: 'UV-AMBER', colorDescription: 'UV Antique Amber Brown', hexCode: '#5c3814' },
  { id: 'COL-03', colorId: 'LITHO-GOLD', colorDescription: 'Lithographed Gold Leaf', hexCode: '#d4af37' },
  { id: 'COL-04', colorId: 'SOAP-OLIVE', colorDescription: 'Natural Olive Drab', hexCode: '#556b2f' }
];

export const INITIAL_PRODUCTS: ProductItemRecord[] = [
  {
    id: 'ITEM-01',
    code: 'EVOO-B-750ML',
    barcode: '5280010920012',
    description: 'Extra Virgin Olive Oil (Cold Pressed) 750ml Dark Glass Bottle',
    group: 'Extra Virgin Olive Oil (EVOO)',
    division: 'Cold Pressed Premium Bottled',
    category: 'Olive Oils & Culinary Liquids',
    qtyOnHand: 1420,
    unit: '750ml Bottle',
    sellingPriceSp: 13.50,
    sellingPriceLbp: 1208250,
    cost: 7.80,
    costLbp: 698100,
    buyingFormat: 'Carton of 12',
    function: 'Finished Bottled Product',
    brand: 'Southern Olive Gold Reserve',
    location: 'Beirut Central Distribution Depot',
    updatedAt: '2026-09-05 16:40'
  },
  {
    id: 'ITEM-02',
    code: 'EVOO-B-500ML',
    barcode: '5280010920029',
    description: 'Extra Virgin Olive Oil (First Cold Extraction) 500ml Bottle',
    group: 'Extra Virgin Olive Oil (EVOO)',
    division: 'Cold Pressed Premium Bottled',
    category: 'Olive Oils & Culinary Liquids',
    qtyOnHand: 890,
    unit: '500ml Bottle',
    sellingPriceSp: 9.75,
    sellingPriceLbp: 872625,
    cost: 5.40,
    costLbp: 483300,
    buyingFormat: 'Carton of 12',
    function: 'Finished Bottled Product',
    brand: 'Southern Olive Gold Reserve',
    location: 'Beirut Central Distribution Depot',
    updatedAt: '2026-09-05 14:15'
  },
  {
    id: 'ITEM-03',
    code: 'EVOO-T-16L',
    barcode: '5280010920036',
    description: 'Extra Virgin Olive Oil Traditional Harvest 16-Liter Sealed Tin',
    group: 'Extra Virgin Olive Oil (EVOO)',
    division: 'Cold Pressed Premium Bottled',
    category: 'Olive Oils & Culinary Liquids',
    qtyOnHand: 345,
    unit: '16-Liter Tin',
    sellingPriceSp: 165.00,
    sellingPriceLbp: 14767500,
    cost: 98.00,
    costLbp: 8771000,
    buyingFormat: 'Single Tin',
    function: 'Finished Sealed Tin',
    brand: 'Jabal Amel Traditional',
    location: 'Marjeyoun Press Mill & Silos',
    updatedAt: '2026-09-04 18:20'
  },
  {
    id: 'ITEM-04',
    code: 'VOO-T-10L',
    barcode: '5280010920043',
    description: 'Virgin Olive Oil Pure Lebanese Blend 10-Liter Tin',
    group: 'Virgin Olive Oil (VOO)',
    division: 'Bulk Silo & Commercial Tins',
    category: 'Olive Oils & Culinary Liquids',
    qtyOnHand: 210,
    unit: '10-Liter Tin',
    sellingPriceSp: 85.00,
    sellingPriceLbp: 7607500,
    cost: 52.00,
    costLbp: 4654000,
    buyingFormat: 'Single Tin',
    function: 'Finished Sealed Tin',
    brand: 'Jabal Amel Traditional',
    location: 'Marjeyoun Press Mill & Silos',
    updatedAt: '2026-09-03 11:30'
  },
  {
    id: 'ITEM-05',
    code: 'PKG-BTL-750',
    barcode: '5280010990015',
    description: 'Dark UV Marasca Glass Empty Bottle 750ml with Cap',
    group: 'Dark Marasca Glass Bottles',
    division: 'UV Dark Glassware & Closures',
    category: 'Bottling & Packaging Consumables',
    qtyOnHand: 4800,
    unit: '750ml Bottle',
    sellingPriceSp: 1.20,
    sellingPriceLbp: 107400,
    cost: 0.62,
    costLbp: 55490,
    buyingFormat: 'Pallet of 1,200',
    function: 'Packaging Raw Material',
    brand: 'Mediterranean Glass Industries S.A.L',
    location: 'Marjeyoun Press Mill & Silos',
    updatedAt: '2026-09-01 10:00'
  },
  {
    id: 'ITEM-06',
    code: 'PKG-TIN-16L',
    barcode: '5280010990022',
    description: 'Food Grade Sealed Tinplate Container 16-Liter with Spout',
    group: 'Lithographed Metal Tins',
    division: 'Sealed Tinplate & Jerry Cans',
    category: 'Bottling & Packaging Consumables',
    qtyOnHand: 1120,
    unit: '16-Liter Tin',
    sellingPriceSp: 4.50,
    sellingPriceLbp: 402750,
    cost: 2.45,
    costLbp: 219275,
    buyingFormat: 'Carton of 25',
    function: 'Packaging Raw Material',
    brand: 'Levant Tinplate Packaging Co.',
    location: 'Marjeyoun Press Mill & Silos',
    updatedAt: '2026-09-02 09:15'
  },
  {
    id: 'ITEM-07',
    code: 'RAW-OLV-SOUR',
    barcode: '5280010980016',
    description: 'Raw Sourani Green Olives (Field Fresh Harvest)',
    group: 'Fresh Green Harvest Olives',
    division: 'Raw Harvest & Grove Produce',
    category: 'Raw Harvest & Grove Produce',
    qtyOnHand: 18500,
    unit: 'Kilogram (KG)',
    sellingPriceSp: 1.10,
    sellingPriceLbp: 98450,
    cost: 0.75,
    costLbp: 67125,
    buyingFormat: 'Plastic Crate 25kg',
    function: 'Harvest Agricultural Intake',
    brand: 'Al-Jalil Heritage Organic',
    location: 'Hasbaya Grove Intake Station',
    updatedAt: '2026-09-06 08:00'
  },
  {
    id: 'ITEM-08',
    code: 'SOAP-BAR-150G',
    barcode: '5280010970017',
    description: 'Pure Olive Oil & Laurel Aleppo-Style Soap Bar 150g',
    group: 'Artisan Olive Oil Soaps',
    division: 'Laurel & Olive Artisan Soaps',
    category: 'Olive By-Products & Organic Soap',
    qtyOnHand: 3200,
    unit: 'Bar 150g',
    sellingPriceSp: 3.00,
    sellingPriceLbp: 268500,
    cost: 1.15,
    costLbp: 102925,
    buyingFormat: 'Pack of 6',
    function: 'Finished Byproduct',
    brand: 'Jabal Amel Traditional',
    location: 'Choueifat POS Store Front & Showroom',
    updatedAt: '2026-09-04 15:45'
  }
];

export const INITIAL_SALES: SalesRecord[] = [
  {
    id: 'SL-901',
    invoiceNo: 'INV-2026-901',
    date: '2026-09-06 14:30',
    branch: 'Choueifat POS Store Front & Showroom',
    customer: 'Spinneys Hypermarket Hazmieh',
    customerId: 'CUST-0021',
    salesman: 'Jichi Mohammed',
    amountUsd: 3240.00,
    amountLbp: 289980000,
    currency: 'USD',
    discountPct: 5,
    taxPct: 0,
    status: 'PAID',
    posted: true,
    deliveryMethod: 'SuperSonic Fleet Van #B-310892'
  },
  {
    id: 'SL-902',
    invoiceNo: 'INV-2026-902',
    date: '2026-09-06 11:15',
    branch: 'Beirut Central Distribution Depot',
    customer: 'Al-Makhazen Bab Sharqi',
    customerId: 'CUST-0045',
    salesman: 'Karim Mansour',
    amountUsd: 1650.00,
    amountLbp: 147675000,
    currency: 'USD',
    discountPct: 0,
    taxPct: 0,
    status: 'CREDIT',
    posted: true,
    deliveryMethod: 'Customer Pickup'
  },
  {
    id: 'SL-903',
    invoiceNo: 'INV-2026-903',
    date: '2026-09-05 17:00',
    branch: 'Choueifat POS Store Front & Showroom',
    customer: 'Faysal Gourmet Market Dbayeh',
    customerId: 'CUST-0089',
    salesman: 'Jichi Mohammed',
    amountUsd: 980.00,
    amountLbp: 87710000,
    currency: 'USD',
    discountPct: 3,
    taxPct: 0,
    status: 'PAID',
    posted: true,
    deliveryMethod: 'SuperSonic Fleet Express'
  }
];

export const INITIAL_QUOTATIONS: QuotationRecord[] = [
  {
    id: 'QT-411',
    quotationNo: 'QUOT-2026-411',
    date: '2026-09-05',
    branch: 'Beirut Central Distribution Depot',
    customer: 'Le Bristol Hotel Beirut Catering',
    customerId: 'CUST-0112',
    salesman: 'Karim Mansour',
    validUntil: '2026-09-25',
    totalUsd: 4950.00,
    totalLbp: 443025000,
    discount: 8,
    status: 'PENDING'
  },
  {
    id: 'QT-412',
    quotationNo: 'QUOT-2026-412',
    date: '2026-09-04',
    branch: 'Beirut Central Distribution Depot',
    customer: 'Carrefour City Centre Beirut',
    customerId: 'CUST-0018',
    salesman: 'Jichi Mohammed',
    validUntil: '2026-09-30',
    totalUsd: 12800.00,
    totalLbp: 1145600000,
    discount: 10,
    status: 'ACCEPTED'
  }
];

export const INITIAL_DELIVERIES: DeliveryRecord[] = [
  {
    id: 'DEL-301',
    deliveryNoteNo: 'DN-2026-301',
    invoiceNo: 'INV-2026-901',
    customerName: 'Spinneys Hypermarket Hazmieh',
    customerId: 'CUST-0021',
    companyName: 'Spinneys Lebanon S.A.L',
    branch: 'Beirut Central Distribution Depot',
    destination: 'Hazmieh Highway Logistics Bay 4',
    invoiceDate: '2026-09-06',
    deliveryDate: '2026-09-06 16:30',
    status: 'DELIVERED',
    totalUsd: 3240.00,
    totalLbp: 289980000,
    qty: 240,
    itemDescription: 'EVOO 750ml Dark Glass Bottles (20 Cartons)',
    driverName: 'Tony Khoury',
    plateNo: 'B-310892'
  },
  {
    id: 'DEL-302',
    deliveryNoteNo: 'DN-2026-302',
    invoiceNo: 'INV-2026-903',
    customerName: 'Faysal Gourmet Market Dbayeh',
    customerId: 'CUST-0089',
    companyName: 'Faysal Gourmet Foods',
    branch: 'Choueifat POS Store Front & Showroom',
    destination: 'Dbayeh Marina Commercial Strip',
    invoiceDate: '2026-09-05',
    deliveryDate: '2026-09-06 18:00',
    status: 'OUT_FOR_DELIVERY',
    totalUsd: 980.00,
    totalLbp: 87710000,
    qty: 80,
    itemDescription: 'EVOO 500ml Bottled + Soap Bars',
    driverName: 'Walid Najm',
    plateNo: 'M-198421'
  }
];

export const INITIAL_PURCHASES: PurchaseRecord[] = [
  {
    id: 'PUR-801',
    purchaseNo: 'PUR-2026-801',
    date: '2026-09-03',
    supplier: 'Hasbaya & Marjeyoun Farmers Cooperative',
    contactName: 'Hajj Rida Abou Hamdan',
    invoiceRef: 'COOP-INV-9921',
    branch: 'Marjeyoun Press Mill & Silos',
    code: 'RAW-OLV-SOUR',
    description: 'Raw Sourani Green Olives Harvest Load',
    qty: 12500,
    qtyReceived: 12500,
    unit: 'Kilogram (KG)',
    unitPriceUsd: 0.75,
    amountUsd: 9375.00,
    amountLbp: 839062500,
    deliveryDate: '2026-09-03',
    spUsd: 1.10,
    taxDesc: 'Exempt Agro',
    taxRate: 0,
    expiryDate: '2026-09-10',
    location: 'Marjeyoun Press Mill & Silos',
    freightCostUsd: 180.00,
    customsCostUsd: 0,
    status: 'POSTED'
  },
  {
    id: 'PUR-802',
    purchaseNo: 'PUR-2026-802',
    date: '2026-08-28',
    supplier: 'Mediterranean Glass Industries S.A.L',
    contactName: 'Karim Haddad',
    invoiceRef: 'MED-77402',
    branch: 'Marjeyoun Press Mill & Silos',
    code: 'PKG-BTL-750',
    description: 'Dark UV Marasca Glass 750ml Bottles',
    qty: 5000,
    qtyReceived: 5000,
    unit: '750ml Bottle',
    unitPriceUsd: 0.62,
    amountUsd: 3100.00,
    amountLbp: 277450000,
    deliveryDate: '2026-08-28',
    spUsd: 1.20,
    taxDesc: 'VAT 11%',
    taxRate: 11,
    expiryDate: '2030-12-31',
    location: 'Marjeyoun Press Mill & Silos',
    freightCostUsd: 90.00,
    customsCostUsd: 0,
    status: 'POSTED'
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrderRecord[] = [
  {
    id: 'PO-601',
    poNo: 'PO-2026-601',
    date: '2026-09-04',
    supplier: 'Levant Tinplate Packaging Co.',
    contactName: 'Sami Salameh',
    deliveryDue: '2026-09-18',
    branch: 'Marjeyoun Press Mill & Silos',
    code: 'PKG-TIN-16L',
    description: 'Lithographed 16-Liter Food Grade Sealed Tins',
    qtyOrdered: 2000,
    qtyReceived: 0,
    unit: '16-Liter Tin',
    unitPriceUsd: 2.45,
    totalUsd: 4900.00,
    approvalStatus: 'APPROVED',
    receivingStatus: 'AWAITING'
  },
  {
    id: 'PO-602',
    poNo: 'PO-2026-602',
    date: '2026-09-02',
    supplier: 'Hasbaya & Marjeyoun Farmers Cooperative',
    contactName: 'Hajj Rida Abou Hamdan',
    deliveryDue: '2026-09-12',
    branch: 'Hasbaya Grove Intake Station',
    code: 'RAW-OLV-SOUR',
    description: 'Second Harvest Wave Sourani & Baladi Olives',
    qtyOrdered: 15000,
    qtyReceived: 0,
    unit: 'Kilogram (KG)',
    unitPriceUsd: 0.74,
    totalUsd: 11100.00,
    approvalStatus: 'APPROVED',
    receivingStatus: 'AWAITING'
  }
];

export const INITIAL_REORDER_GUIDE: ReorderGuideRecord[] = [
  {
    id: 'REO-01',
    code: 'PKG-TIN-16L',
    description: 'Food Grade Sealed Tin Container 16-Liter',
    qtyOnHand: 1120,
    minLevel: 1500,
    maxLevel: 4000,
    qtyToOrder: 2000,
    unit: '16-Liter Tin',
    buyingFormat: 'Carton of 25',
    costUnitUsd: 2.45,
    group: 'Lithographed Metal Tins',
    supplier: 'Levant Tinplate Packaging Co.',
    leadTimeDays: 7
  },
  {
    id: 'REO-02',
    code: 'EVOO-T-16L',
    description: 'Extra Virgin Olive Oil 16-Liter Sealed Tin',
    qtyOnHand: 345,
    minLevel: 400,
    maxLevel: 1000,
    qtyToOrder: 300,
    unit: '16-Liter Tin',
    buyingFormat: 'Single Tin',
    costUnitUsd: 98.00,
    group: 'Extra Virgin Olive Oil (EVOO)',
    supplier: 'Marjeyoun Press Mill In-House',
    leadTimeDays: 2
  },
  {
    id: 'REO-03',
    code: 'PKG-BTL-750',
    description: 'Dark UV Marasca Glass Empty Bottle 750ml',
    qtyOnHand: 4800,
    minLevel: 5000,
    maxLevel: 12000,
    qtyToOrder: 5000,
    unit: '750ml Bottle',
    buyingFormat: 'Pallet of 1,200',
    costUnitUsd: 0.62,
    group: 'Dark Marasca Glass Bottles',
    supplier: 'Mediterranean Glass Industries S.A.L',
    leadTimeDays: 5
  }
];

export const INITIAL_TRANSFERS: TransferRecord[] = [
  {
    id: 'TRN-201',
    reqNo: 'REQ-2026-201',
    date: '2026-09-05 14:00',
    sourceLocation: 'Marjeyoun Press Mill & Silos',
    destinationLocation: 'Beirut Central Distribution Depot',
    code: 'EVOO-B-750ML',
    description: 'Extra Virgin Olive Oil 750ml Dark Glass',
    barcode: '5280010920012',
    qtyTransfered: 600,
    qtyReceived: 600,
    unit: '750ml Bottle',
    unitCostUsd: 7.80,
    avgCostUsd: 7.80,
    qtyOnHand: 1420,
    totalCostUsd: 4680.00,
    status: 'RECEIVED',
    posted: true
  },
  {
    id: 'TRN-202',
    reqNo: 'REQ-2026-202',
    date: '2026-09-06 10:30',
    sourceLocation: 'Beirut Central Distribution Depot',
    destinationLocation: 'Choueifat POS Store Front & Showroom',
    code: 'SOAP-BAR-150G',
    description: 'Pure Olive Oil & Laurel Aleppo-Style Soap Bar',
    barcode: '5280010970017',
    qtyTransfered: 300,
    qtyReceived: 300,
    unit: 'Bar 150g',
    unitCostUsd: 1.15,
    avgCostUsd: 1.15,
    qtyOnHand: 3200,
    totalCostUsd: 345.00,
    status: 'RECEIVED',
    posted: true
  }
];

export const INITIAL_LOST_GOODS: LostGoodsRecord[] = [
  {
    id: 'LG-101',
    entryNo: 'WASTE-2026-101',
    date: '2026-09-04',
    location: 'Marjeyoun Press Mill & Silos',
    code: 'EVOO-T-16L',
    description: 'Extra Virgin Olive Oil 16-Liter Sealed Tin',
    qty: 2,
    unit: '16-Liter Tin',
    unitCostUsd: 98.00,
    totalCostUsd: 196.00,
    avgCostUsd: 98.00,
    reason: 'Puncture during forklift pallet restacking',
    recordedBy: 'Tony Khoury'
  },
  {
    id: 'LG-102',
    entryNo: 'WASTE-2026-102',
    date: '2026-09-02',
    location: 'Beirut Central Distribution Depot',
    code: 'PKG-BTL-750',
    description: 'Dark UV Marasca Glass 750ml Bottles',
    qty: 14,
    unit: '750ml Bottle',
    unitCostUsd: 0.62,
    totalCostUsd: 8.68,
    avgCostUsd: 0.62,
    reason: 'Glass crate cracked during road transport transit',
    recordedBy: 'Karim Mansour'
  }
];

export const INITIAL_ASSEMBLIES: AssemblyRecord[] = [
  {
    id: 'ASM-501',
    assemblyNo: 'PROD-2026-501',
    date: '2026-09-04',
    finishedCode: 'EVOO-B-750ML',
    finishedDescription: 'Extra Virgin Olive Oil (Cold Pressed) 750ml Dark Glass Bottle',
    batchNo: 'BATCH-2026-SEP-A',
    qtyProduced: 1200,
    unit: '750ml Bottle',
    rawMaterials: [
      { itemCode: 'RAW-OLV-SOUR', description: 'Raw Sourani Green Olives', qty: 4500, unit: 'KG', costUsd: 3375.00 },
      { itemCode: 'PKG-BTL-750', description: 'Dark UV Marasca Glass Empty Bottle', qty: 1200, unit: '750ml Bottle', costUsd: 744.00 }
    ],
    totalRawCostUsd: 4119.00,
    overheadCostUsd: 450.00,
    totalProductionCostUsd: 4569.00,
    status: 'COMPLETED'
  }
];

export const INITIAL_ADJUSTMENTS: AdjustmentRecord[] = [
  {
    id: 'ADJ-101',
    adjNo: 'ADJ-2026-101',
    date: '2026-09-04',
    branch: 'Marjeyoun Press Mill & Silos',
    code: 'EVOO-T-16L',
    itemDescription: 'Extra Virgin Olive Oil 16-Liter Sealed Tin',
    qoh: 347,
    newQty: 345,
    variance: -2,
    varianceValueUsd: -196.00,
    units: '16-Liter Tin',
    reason: 'Physical inventory audit variance (leakage)',
    auditor: 'Jichi Mohammed'
  },
  {
    id: 'ADJ-102',
    adjNo: 'ADJ-2026-102',
    date: '2026-09-01',
    branch: 'Beirut Central Distribution Depot',
    code: 'EVOO-B-750ML',
    itemDescription: 'Extra Virgin Olive Oil 750ml Dark Glass Bottle',
    qoh: 1418,
    newQty: 1420,
    variance: 2,
    varianceValueUsd: 15.60,
    units: '750ml Bottle',
    reason: 'Found miscounted carton in tasting display',
    auditor: 'Karim Mansour'
  }
];

export const INITIAL_PRODUCT_REQUESTS: ProductRequestRecord[] = [
  {
    id: 'PR-701',
    prNo: 'PR-2026-701',
    date: '2026-09-05',
    requestedByBranch: 'Choueifat POS Store Front & Showroom',
    destinationBranch: 'Beirut Central Distribution Depot',
    requestedBy: 'Fadi Haddad (Store Mgr)',
    location: 'Choueifat POS Store Front & Showroom',
    itemCode: 'EVOO-B-750ML',
    description: 'Extra Virgin Olive Oil 750ml Dark Glass',
    qtyReq: 120,
    qtyOh: 1420,
    costUsd: 7.80,
    unit: '750ml Bottle',
    status: 'APPROVED',
    approvedBy: 'Jichi Mohammed',
    approvedDate: '2026-09-05 16:00',
    deliveryDate: '2026-09-06',
    remark: 'Restock boutique weekend promotion shelf'
  },
  {
    id: 'PR-702',
    prNo: 'PR-2026-702',
    date: '2026-09-06',
    requestedByBranch: 'Choueifat POS Store Front & Showroom',
    destinationBranch: 'Marjeyoun Press Mill & Silos',
    requestedBy: 'Fadi Haddad (Store Mgr)',
    location: 'Choueifat POS Store Front & Showroom',
    itemCode: 'EVOO-T-16L',
    description: 'Extra Virgin Olive Oil 16-Liter Sealed Tin',
    qtyReq: 30,
    qtyOh: 345,
    costUsd: 98.00,
    unit: '16-Liter Tin',
    status: 'PENDING',
    approvedBy: 'Pending Review',
    approvedDate: '-',
    deliveryDate: '2026-09-08',
    remark: 'Bulk customer orders booked for next week'
  }
];

export const INITIAL_MANAGE_REQUESTS: ManageProductRequestRecord[] = [
  {
    id: 'MPR-01',
    prNo: 'PR-2026-701',
    date: '2026-09-05',
    requestedByBranch: 'Choueifat POS Store Front & Showroom',
    requestedFromBranch: 'Beirut Central Distribution Depot',
    requestedBy: 'Fadi Haddad',
    itemCode: 'EVOO-B-750ML',
    description: 'Extra Virgin Olive Oil 750ml Dark Glass',
    qtyReq: 120,
    qtyApproved: 120,
    qtyOh: 1420,
    status: 'ALLOCATED',
    location: 'Beirut Central Distribution Depot',
    deliveryDate: '2026-09-06',
    remark: 'Ready for van dispatch'
  }
];

export const INITIAL_REQUEST_PREP: ProductReqPrepRecord[] = [
  {
    id: 'PREP-01',
    ticketNo: 'PREP-701-1',
    status: 'PACKED',
    itemCode: 'EVOO-B-750ML',
    description: 'Extra Virgin Olive Oil 750ml Dark Glass (10 Cartons)',
    qtyReq: 120,
    qtyOh: 1420,
    qtyApp: 120,
    pickerName: 'Hassan Sleiman',
    processedPct: 100
  },
  {
    id: 'PREP-02',
    ticketNo: 'PREP-702-1',
    status: 'QUEUED',
    itemCode: 'EVOO-T-16L',
    description: 'Extra Virgin Olive Oil 16-Liter Sealed Tin (30 Tins)',
    qtyReq: 30,
    qtyOh: 345,
    qtyApp: 30,
    pickerName: 'Unassigned',
    processedPct: 0
  }
];

export const INITIAL_RECEIVING_GOODS: ReceivingGoodsRecord[] = [
  {
    id: 'RCV-01',
    prNo: 'PR-2026-701',
    requestedByBranch: 'Choueifat POS Store Front & Showroom',
    requestedFromBranch: 'Beirut Central Distribution Depot',
    date: '2026-09-06',
    deliveryDate: '2026-09-06 14:00',
    requestedBy: 'Fadi Haddad',
    toLocation: 'Choueifat POS Store Front & Showroom',
    itemsSummary: '120x EVOO 750ml Bottles',
    confirmed: true,
    receivedBy: 'Fadi Haddad',
    remark: 'Verified seal condition on all 10 cartons'
  }
];

export const INITIAL_REJECT_REASONS: RejectReasonRecord[] = [
  { id: 'RR-01', code: 'STOCK-RESERVED', description: 'Stock allocated for confirmed export contract', active: true },
  { id: 'RR-02', code: 'MIN-THRESH', description: 'Request exceeds central safety stock minimum threshold', active: true },
  { id: 'RR-03', code: 'LOG-CAP', description: 'Transport vehicle maximum weight capacity reached for today', active: true },
  { id: 'RR-04', code: 'QUALITY-HOLD', description: 'Batch currently quarantined pending acidity lab clearance', active: true }
];

export const INITIAL_EVENTS: EventRecord[] = [
  {
    id: 'EVT-01',
    eventId: 'EVT-2026-01',
    eventName: 'Annual Hasbaya Autumn Olive Harvest Tasting & Gala',
    customerName: 'Lebanese Agronomists & Chefs Syndicate',
    company: 'Syndicate of Lebanese Gastronomy',
    eventType: 'Tasting & Farm Tour',
    venueName: 'Marjeyoun Mill Heritage Courtyard',
    status: 'CONFIRMED',
    eventDate: '2026-10-15 11:00',
    attendees: 180,
    totalBudgetUsd: 5500.00,
    branch: 'Marjeyoun Press Mill & Silos'
  },
  {
    id: 'EVT-02',
    eventId: 'EVT-2026-02',
    eventName: 'Export Quality Masterclass & EVOO Acidity Testing Seminar',
    customerName: 'Beirut Chamber of Commerce Agricultural Council',
    company: 'CCIAB Export Division',
    eventType: 'Educational Seminar',
    venueName: 'Beirut Hub Training Auditorium',
    status: 'TENTATIVE',
    eventDate: '2026-10-28 10:00',
    attendees: 65,
    totalBudgetUsd: 2200.00,
    branch: 'Beirut Central Distribution Depot'
  }
];

export const INITIAL_EVENT_VENUES: EventVenueRecord[] = [
  {
    id: 'VN-01',
    venueId: 'VN-MRJ-COURT',
    venueName: 'Marjeyoun Mill Heritage Courtyard & Olive Terrace',
    city: 'Marjeyoun',
    location: 'Marjeyoun Mill Historic Site',
    contactName: 'Imad Jichi',
    phoneNumber: '+961 7 830 114',
    capacity: 250,
    dailyRateUsd: 650.00,
    amenities: 'Outdoor pergola, artisan stone mill display, rustic seating, sound system'
  },
  {
    id: 'VN-02',
    venueId: 'VN-BEY-AUD',
    venueName: 'Beirut Central Hub Conference & Tasting Room',
    city: 'Beirut',
    location: 'Hazmieh Highway Commercial Complex',
    contactName: 'Nour Atallah',
    phoneNumber: '+961 1 432 899',
    capacity: 80,
    dailyRateUsd: 350.00,
    amenities: 'Projector screens, sensory tasting booths, coffee station, climate control'
  }
];

export const INITIAL_EVENT_RESOURCES: EventResourceRecord[] = [
  { id: 'RES-01', resourceId: 'RES-GLS-COB', name: 'Cobalt Blue Professional Olive Tasting Glasses', description: 'Official IOC sensory evaluation tasting cups', type: 'TASTING_KIT', availableQty: 300, costUsd: 4.50 },
  { id: 'RES-02', resourceId: 'RES-AUDIO-SYS', name: 'Mobile PA Wireless Audio & Microphone Rig', description: 'Dual wireless mics and powered speakers', type: 'EQUIPMENT', availableQty: 3, costUsd: 120.00 },
  { id: 'RES-03', resourceId: 'RES-SOMM-STAFF', name: 'Certified Olive Oil Sommelier / Speaker', description: 'Licensed Mediterranean olive sensory panelist', type: 'PERSONNEL', availableQty: 2, costUsd: 250.00 }
];

export const INITIAL_EVENT_TYPES: EventTypeRecord[] = [
  { id: 'ET-01', typeId: 'ET-TASTE', name: 'Olive Oil Sensory Tasting & Sommelier Pairing', description: 'Educational tasting of cold pressed extra virgin profiles with regional pairings', defaultDurationHours: 3 },
  { id: 'ET-02', typeId: 'ET-PRESS-RUN', name: 'Live Harvest Pressing Demonstration Tour', description: 'Step-by-step mill tour demonstrating defoliation, washing, crushing and centrifugal extraction', defaultDurationHours: 4 },
  { id: 'ET-03', typeId: 'ET-SOAP-CRAFT', name: 'Artisan Olive Oil Soap Making Workshop', description: 'Traditional cold-process laurel and olive oil soap crafting workshop', defaultDurationHours: 2.5 }
];

export const INITIAL_LOST_GOODS_REASONS: LostGoodsReasonRecord[] = [
  { id: 'LGR-01', reasonId: 'LGR-PRESS-SED', wastageReason: 'Centrifuge & Decanter Tank Sediment Purge', category: 'PRESSING_RESIDUE', active: true },
  { id: 'LGR-02', reasonId: 'LGR-BTL-BRK', wastageReason: 'Glass Bottle Impact Breakage during Pallet Stacking', category: 'BOTTLE_BREAKAGE', active: true },
  { id: 'LGR-03', reasonId: 'LGR-TIN-LEAK', wastageReason: 'Tin Can Seam Micro-Leakage / Seal Failure', category: 'SEAL_LEAK', active: true },
  { id: 'LGR-04', reasonId: 'LGR-SAMP-EXP', wastageReason: 'Laboratory Retained Quality Samples Expired', category: 'EXPIRED_SAMPLE', active: true }
];

export const INITIAL_DISCOUNTS: DiscountRecord[] = [
  { id: 'DSC-01', discountId: 'DSC-WHOLE-10', description: 'Wholesale Pallet Tier Discount (Orders > 50 Cases)', discountPct: 10, startDate: '2026-01-01', endDate: '2026-12-31', branch: 'All Branches', active: true },
  { id: 'DSC-02', discountId: 'DSC-HARV-PROMO', description: 'Early Harvest Press Season Promotion', discountPct: 5, startDate: '2026-09-01', endDate: '2026-10-31', branch: 'Choueifat POS Store Front & Showroom', active: true },
  { id: 'DSC-03', discountId: 'DSC-EXPORT-VIP', description: 'Approved GCC & European Export Rebate', discountPct: 12, startDate: '2026-01-01', endDate: '2026-12-31', branch: 'Beirut Central Distribution Depot', active: true }
];

export const INITIAL_PAYMENT_TYPES: PaymentTypeRecord[] = [
  { id: 'PMT-01', paymentTypeId: 'CASH-USD', name: 'Cash US Dollar', type: 'CASH', accountNumber: '1010-CASH-USD', sorting: 1, currency: 'USD', changeStatus: 'ALLOWED' },
  { id: 'PMT-02', paymentTypeId: 'CASH-LBP', name: 'Cash Lebanese Pound (LBP)', type: 'CASH', accountNumber: '1020-CASH-LBP', sorting: 2, currency: 'LBP', changeStatus: 'ALLOWED' },
  { id: 'PMT-03', paymentTypeId: 'WHISH-PAY', name: 'Whish Money Digital Wallet', type: 'WHISH_MONEY', accountNumber: '1050-WHISH-FIN', sorting: 3, currency: 'USD', changeStatus: 'EXACT_ONLY' },
  { id: 'PMT-04', paymentTypeId: 'CC-VISA', name: 'Credit Card (Visa / Mastercard Fresh)', type: 'CREDIT_CARD', accountNumber: '1030-MERCHANT-BANK', sorting: 4, currency: 'USD', changeStatus: 'EXACT_ONLY' },
  { id: 'PMT-05', paymentTypeId: 'BANK-TRF', name: 'Commercial Bank Wire (Bank Audi Fresh)', type: 'BANK_TRANSFER', accountNumber: '1040-AUDI-USD-CORP', sorting: 5, currency: 'USD', changeStatus: 'EXACT_ONLY' }
];

export const INITIAL_CURRENCIES: CurrencySetupRecord[] = [
  { id: 'CUR-01', currency: 'USD', symbol: '$', rateVsUsd: 1.0, decimals: 2, isMain: true },
  { id: 'CUR-02', currency: 'LBP', symbol: 'L.L.', rateVsUsd: 89500.0, decimals: 0, isMain: false }
];

export const INITIAL_DELIVERY_PROVIDERS: DeliveryProviderRecord[] = [
  { id: 'DP-01', providerId: 'DP-SUPERSONIC', name: 'SuperSonic Fleet Management (Internal)', providerType: 'INTERNAL_FLEET', contactPerson: 'Tony Khoury (Lead Driver)', phone: '+961 71 332 901', active: true },
  { id: 'DP-02', providerId: 'DP-ARAMEX', name: 'Aramex Lebanon International Cargo', providerType: '3PL_EXPRESS', contactPerson: 'Karim Sadek', phone: '+961 1 543 210', active: true },
  { id: 'DP-03', providerId: 'DP-DHL', name: 'DHL Express Fresh Cargo Logistics', providerType: '3PL_EXPRESS', contactPerson: 'Rana Chemali', phone: '+961 1 738 900', active: true }
];

// Matrix connections representation showing relations between entities
export const MATRIX_GRAPH = [
  {
    layer: '1. Taxonomy & Product Master',
    nodes: [
      { id: 'CAT-01', title: 'Category: Olive Oils', connectionsTo: ['DIV-01', 'DIV-02'] },
      { id: 'DIV-01', title: 'Division: Cold Pressed', connectionsTo: ['GRP-01'] },
      { id: 'GRP-01', title: 'Group: Extra Virgin (EVOO)', connectionsTo: ['ITEM-01', 'ITEM-02', 'ITEM-03'] },
      { id: 'ITEM-01', title: 'Item: EVOO 750ml Bottle', connectionsTo: ['UNT-01', 'LOC-02', 'BRD-01', 'ASM-501', 'SL-901'] }
    ]
  },
  {
    layer: '2. Supply & Grove Procurement',
    nodes: [
      { id: 'SUP-01', title: 'Supplier: Farmers Coop', connectionsTo: ['PO-602', 'PUR-801'] },
      { id: 'PUR-801', title: 'Purchase: 12.5T Sourani Olives', connectionsTo: ['RAW-OLV-SOUR', 'LOC-01'] },
      { id: 'RAW-OLV-SOUR', title: 'Raw Intake: Sourani Harvest', connectionsTo: ['ASM-501'] }
    ]
  },
  {
    layer: '3. Production & Item Assembly',
    nodes: [
      { id: 'ASM-501', title: 'Assembly: Batch SEP-A', connectionsTo: ['ITEM-01', 'EVOO-T-16L', 'LG-101'] }
    ]
  },
  {
    layer: '4. Inter-Branch Logistics & Transfers',
    nodes: [
      { id: 'TRN-201', title: 'Transfer: Marjeyoun -> Beirut', connectionsTo: ['LOC-01', 'LOC-02', 'ITEM-01'] },
      { id: 'PR-701', title: 'Product Request: Choueifat POS', connectionsTo: ['LOC-03', 'LOC-02', 'RCV-01'] }
    ]
  },
  {
    layer: '5. Commercial Sales & Fulfillment',
    nodes: [
      { id: 'SL-901', title: 'Sales Invoice: Spinneys ($3,240)', connectionsTo: ['ITEM-01', 'DEL-301', 'PMT-01'] },
      { id: 'DEL-301', title: 'Delivery Note: Van B-310892', connectionsTo: ['DP-01', 'Spinneys Hazmieh'] }
    ]
  }
];
