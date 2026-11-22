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
  createdAt?: string;
  createdBy?: string;
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
  createdAt?: string;
  createdBy?: string;
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
  receivedAt?: string;
  remark: string;
  createdAt?: string;
  createdBy?: string;
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

export interface InventorySourceRecord {
  id: string;
  sourceId: string;
  name: string;
  description: string;
  type: 'LOCAL' | 'MARKETPLACE';
}

export type { DeliveryProviderRecord, DeliveryProviderClassification } from '@/lib/deliveryProviders';


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
  { id: 'SUP-13', name: 'Al-Dayaa', contactPerson: 'Al-Dayaa', phone: '+961 70 325 417', grade: 'A', country: 'Lebanon', notes: '', balanceUsd: 0, balanceLbp: 0, createdAt: '2026-03-23', updatedAt: '2026-03-23' },
  { id: 'SUP-14', name: 'Abdo Trading Est.', contactPerson: 'Abdo Trading', phone: '+961 7 725 330', grade: 'A', country: 'Lebanon', notes: '', balanceUsd: 0, balanceLbp: 0, createdAt: '2026-02-19', updatedAt: '2026-05-13' }
];

export const INITIAL_DEPARTMENTS: DepartmentRecord[] = [
  { id: 'DEP-01', description: 'Cold Press Operations & Extraction', itemsCount: 12, menuType: 'Production' },
  { id: 'DEP-02', description: 'Bottling, Labelling & Packaging Line', itemsCount: 18, menuType: 'Packaging' },
  { id: 'DEP-03', description: 'Wholesale & Export Distribution', itemsCount: 24, menuType: 'Commercial' },
  { id: 'DEP-04', description: 'Boutique POS Retail & Direct Sales', itemsCount: 15, menuType: 'Retail' }
];

export const INITIAL_BRANDS: InventoryBrandRecord[] = [
  { id: 'BRD-01', brandId: 'BRD-ALF', name: 'Alfa', manufacturer: 'Alfa Products', country: 'Lebanon' },
  { id: 'BRD-02', brandId: 'BRD-ALT', name: 'Altaghziah', manufacturer: 'Altaghziah Industry', country: 'Lebanon' },
  { id: 'BRD-03', brandId: 'BRD-AMO', name: 'Amour', manufacturer: 'Amour Foods', country: 'Lebanon' },
  { id: 'BRD-04', brandId: 'BRD-BIH', name: 'Bihar', manufacturer: 'Bihar Spices', country: 'Lebanon' },
  { id: 'BRD-05', brandId: 'BRD-CLA', name: 'Clatchy', manufacturer: 'Clatchy Packaging', country: 'Lebanon' },
  { id: 'BRD-06', brandId: 'BRD-CRI', name: 'Crispy', manufacturer: 'Crispy Snacks', country: 'Lebanon' },
  { id: 'BRD-07', brandId: 'BRD-DAN', name: 'Dano', manufacturer: 'Dano Dairy', country: 'Lebanon' },
  { id: 'BRD-08', brandId: 'BRD-DOM', name: 'Domo', manufacturer: 'Domo Foods', country: 'Lebanon' },
  { id: 'BRD-09', brandId: 'BRD-EVE', name: 'Everyday', manufacturer: 'Everyday Consumer Goods', country: 'Lebanon' },
  { id: 'BRD-10', brandId: 'BRD-ICE', name: 'Iceberg', manufacturer: 'Iceberg Cold Chain', country: 'Lebanon' },
  { id: 'BRD-11', brandId: 'BRD-KAV', name: 'Kaval Tenayel', manufacturer: 'Kaval Tenayel Dairy', country: 'Lebanon' },
  { id: 'BRD-12', brandId: 'BRD-KIR', name: 'Kiri', manufacturer: 'Bel Group', country: 'France' },
  { id: 'BRD-13', brandId: 'BRD-KLI', name: 'Klio', manufacturer: 'Klio Oils', country: 'Lebanon' },
  { id: 'BRD-14', brandId: 'BRD-KOU', name: 'Koubeissi', manufacturer: 'Koubeissi Est.', country: 'Lebanon' },
  { id: 'BRD-15', brandId: 'BRD-LIP', name: 'Lipton', manufacturer: 'Lipton Unilever', country: 'International' },
  { id: 'BRD-16', brandId: 'BRD-MIA', name: 'Mia', manufacturer: 'Mia Products', country: 'Lebanon' },
  { id: 'BRD-17', brandId: 'BRD-NES', name: 'Nestle', manufacturer: 'Nestle S.A.', country: 'Switzerland' },
  { id: 'BRD-18', brandId: 'BRD-NEW', name: 'New Park', manufacturer: 'New Park Confectionery', country: 'Lebanon' },
  { id: 'BRD-19', brandId: 'BRD-NUR', name: 'Nureen', manufacturer: 'Nureen Food Industries', country: 'Lebanon' },
  { id: 'BRD-20', brandId: 'BRD-NUT', name: 'nutella', manufacturer: 'Ferrero', country: 'Italy' },
  { id: 'BRD-21', brandId: 'BRD-ORI', name: 'Orient Crown', manufacturer: 'Orient Crown Trading', country: 'Lebanon' },
  { id: 'BRD-22', brandId: 'BRD-PIC', name: 'Picon', manufacturer: 'Bel Group', country: 'France' },
  { id: 'BRD-23', brandId: 'BRD-PRI', name: 'Prime line', manufacturer: 'Prime Line Products', country: 'Lebanon' },
  { id: 'BRD-24', brandId: 'BRD-PUC', name: 'Puck', manufacturer: 'Arla Foods', country: 'Denmark' },
  { id: 'BRD-25', brandId: 'BRD-SAL', name: 'Saliba', manufacturer: 'Saliba Mills', country: 'Lebanon' },
  { id: 'BRD-26', brandId: 'BRD-SWE', name: 'Sweet Fooz', manufacturer: 'Sweet Fooz Confectionery', country: 'Lebanon' },
  { id: 'BRD-27', brandId: 'BRD-TAT', name: 'Tatra', manufacturer: 'Tatra Dairy', country: 'Lebanon' },
  { id: 'BRD-28', brandId: 'BRD-TEB', name: 'Teba', manufacturer: 'Teba Products', country: 'Lebanon' },
  { id: 'BRD-29', brandId: 'BRD-TOR', name: 'Tora Bika', manufacturer: 'Mayora', country: 'Indonesia' },
  { id: 'BRD-30', brandId: 'BRD-UNO', name: 'Uno', manufacturer: 'Uno Snacks', country: 'Lebanon' },
  { id: 'BRD-31', brandId: 'BRD-ALI', name: 'Alishan', manufacturer: 'Alishan Foods', country: 'Lebanon' },
  { id: 'BRD-32', brandId: 'BRD-SAF', name: 'Safa Bakery', manufacturer: 'Safa Bakery', country: 'Lebanon' },
  { id: 'BRD-33', brandId: 'BRD-AME', name: 'Al-Amin', manufacturer: 'Al-Amin Mills', country: 'Lebanon' },
  { id: 'BRD-34', brandId: 'BRD-SHA', name: 'Al-Sharq', manufacturer: 'Al-Sharq Products', country: 'Lebanon' },
  { id: 'BRD-35', brandId: 'BRD-MUN', name: 'Al-Mona', manufacturer: 'Al-Mona Foods', country: 'Lebanon' },
  { id: 'BRD-36', brandId: 'BRD-TAG', name: 'Taghziah', manufacturer: 'Taghziah Meat & Poultry', country: 'Lebanon' },
  { id: 'BRD-37', brandId: 'BRD-HIS', name: 'Ras Al-Hossan', manufacturer: 'Ras Al-Hossan Mills', country: 'Lebanon' },
  { id: 'BRD-38', brandId: 'BRD-ZAY', name: 'Southern Olive Oil', manufacturer: 'Southern Olive Oil Products S.A.R.L', country: 'Lebanon' },
  { id: 'BRD-39', brandId: 'BRD-SAM', name: 'Sama Foods', manufacturer: 'Sama Foods Co.', country: 'Lebanon' },
  { id: 'BRD-40', brandId: 'BRD-CRY', name: 'Crystal', manufacturer: 'Crystal Ghee & Oils', country: 'Lebanon' },
  { id: 'BRD-41', brandId: 'BRD-NIN', name: 'Nina', manufacturer: 'Nina Food Products', country: 'Lebanon' }
];

export const INITIAL_SOURCES: InventorySourceRecord[] = [
  { id: 'SRC-01', sourceId: 'SRC-LOC', name: 'Local', description: 'Domestic local production and suppliers', type: 'LOCAL' },
  { id: 'SRC-02', sourceId: 'SRC-VMP', name: 'Vanguard Market place', description: 'Vanguard integrated B2B marketplace and exchange', type: 'MARKETPLACE' }
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

// Live data only: hydrated from Supabase (tenant-scoped, is_posted where applicable); no static demo rows.
export const INITIAL_SALES: SalesRecord[] = [];

// Live data only: hydrated from Supabase (tenant-scoped, is_posted where applicable); no static demo rows.
export const INITIAL_QUOTATIONS: QuotationRecord[] = [];

// Live data only: hydrated from Supabase (tenant-scoped, is_posted where applicable); no static demo rows.
export const INITIAL_DELIVERIES: DeliveryRecord[] = [];

// Live data only: hydrated from Supabase (tenant-scoped, is_posted where applicable); no static demo rows.
export const INITIAL_PURCHASES: PurchaseRecord[] = [];

// Live data only: hydrated from Supabase (tenant-scoped, is_posted where applicable); no static demo rows.
export const INITIAL_PURCHASE_ORDERS: PurchaseOrderRecord[] = [];

// Live data only: hydrated from Supabase (tenant-scoped, is_posted where applicable); no static demo rows.
export const INITIAL_REORDER_GUIDE: ReorderGuideRecord[] = [];

// Live data only: hydrated from Supabase (tenant-scoped, is_posted where applicable); no static demo rows.
export const INITIAL_TRANSFERS: TransferRecord[] = [];

// Live data only: hydrated from Supabase (tenant-scoped, is_posted where applicable); no static demo rows.
export const INITIAL_LOST_GOODS: LostGoodsRecord[] = [];

// Live data only: hydrated from Supabase (tenant-scoped, is_posted where applicable); no static demo rows.
export const INITIAL_ASSEMBLIES: AssemblyRecord[] = [];

// Live data only: hydrated from Supabase (tenant-scoped, is_posted where applicable); no static demo rows.
export const INITIAL_ADJUSTMENTS: AdjustmentRecord[] = [];

// Live data only: hydrated from Supabase (tenant-scoped, is_posted where applicable); no static demo rows.
export const INITIAL_PRODUCT_REQUESTS: ProductRequestRecord[] = [];

// Live data only: hydrated from Supabase (tenant-scoped, is_posted where applicable); no static demo rows.
export const INITIAL_MANAGE_REQUESTS: ManageProductRequestRecord[] = [];

// Live data only: hydrated from Supabase (tenant-scoped, is_posted where applicable); no static demo rows.
export const INITIAL_REQUEST_PREP: ProductReqPrepRecord[] = [];

// Live data only: hydrated from Supabase (tenant-scoped, is_posted where applicable); no static demo rows.
export const INITIAL_RECEIVING_GOODS: ReceivingGoodsRecord[] = [];

export const INITIAL_REJECT_REASONS: RejectReasonRecord[] = [
  { id: 'RR-01', code: 'STOCK-RESERVED', description: 'Stock allocated for confirmed export contract', active: true },
  { id: 'RR-02', code: 'MIN-THRESH', description: 'Request exceeds central safety stock minimum threshold', active: true },
  { id: 'RR-03', code: 'LOG-CAP', description: 'Transport vehicle maximum weight capacity reached for today', active: true },
  { id: 'RR-04', code: 'QUALITY-HOLD', description: 'Batch currently quarantined pending acidity lab clearance', active: true }
];

// Live data only: hydrated from Supabase (tenant-scoped, is_posted where applicable); no static demo rows.
export const INITIAL_EVENTS: EventRecord[] = [];

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

import { DEFAULT_UNIFIED_DELIVERY_PROVIDERS, type DeliveryProviderRecord } from '@/lib/deliveryProviders';
export const INITIAL_DELIVERY_PROVIDERS: DeliveryProviderRecord[] = DEFAULT_UNIFIED_DELIVERY_PROVIDERS;


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
