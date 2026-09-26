'use client';
import { useLanguage } from '@/lib/LanguageContext';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  Printer,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2,
  Save,
  RotateCcw,
  Check,
  Download,
  Upload,
  Calendar,
  ChevronDown,
  ChevronRight,
  Edit2,
  Eraser,
  RefreshCw,
  Eye,
  ArrowLeft,
  Info,
  ExternalLink
} from 'lucide-react';
import SearchInventoryItemsModal, { SelectedTransferItemPayload } from '@/components/SearchInventoryItemsModal';
import { OMEGA_INVENTORY_ITEMS, AuthenticInventoryItem } from '@/lib/omegaInventoryCatalog';

// ============================================================================
// AUTHENTIC OMEGA SEED DATA & INTERFACES
// ============================================================================

export interface IngredientItem {
  id: string;
  productId: number;
  code: string;
  description: string;
  qty: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  isMain?: boolean;
}

export interface SingleAssemblyRecord {
  id: number;
  prodId: number;
  date: string;
  branchId: number;
  branchName: string;
  locationId: number;
  locationName: string;
  assembledBy: string;
  productId: number;
  productCode: string;
  productDescription: string;
  qty: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  sellingPrice: number;
  remark?: string;
  posted: number; // -1 = posted, 0 = draft
  expiryDate?: string;
  ingredients: IngredientItem[];
}

export interface MultipleAssemblyItem {
  id: string;
  prodId?: number;
  productId: number;
  code: string;
  description: string;
  qty: number;
  unit: string;
  locationId: number;
  locationName: string;
  date: string;
  expiryDate?: string;
  unitCost: number;
}

export interface MultipleAssemblyRecord {
  id: number;
  multipleProdId: number;
  name: string;
  branchId: number;
  branchName: string;
  locationId: number;
  locationName: string;
  assembledBy: string;
  date: string;
  remark?: string;
  posted: number; // -1 = posted, 0 = draft
  items: MultipleAssemblyItem[];
}

const AUTHENTIC_BRANCHES = [
  { id: 1, name: 'Zeit w zaytoun ljanoub' },
  { id: 2, name: 'Choueifat Main Facility' }
];

const AUTHENTIC_LOCATIONS = [
  { id: 1, name: 'Main Store' },
  { id: 2, name: 'Showroom' },
  { id: 3, name: 'Delivery' },
  { id: 4, name: 'Manufacture Warehouse' }
];

// Initial Single Production Vouchers from Live Omega ERP
const INITIAL_SINGLE_ASSEMBLIES: SingleAssemblyRecord[] = [
  {
    id: 7,
    prodId: 7,
    date: '2026-07-09',
    branchId: 1,
    branchName: 'Zeit w zaytoun ljanoub',
    locationId: 2,
    locationName: 'Showroom',
    assembledBy: 'Mohammed Jichi',
    productId: 1095,
    productCode: 'PGO230GJAR505',
    productDescription: 'Pickled Local Green Olives Jar 230g',
    qty: 12,
    unit: 'JAR',
    unitCost: 70460,
    totalCost: 845520,
    sellingPrice: 125000,
    remark: 'Production run batch #2026-07',
    posted: -1,
    expiryDate: '1970-01-01',
    ingredients: [
      {
        id: 'ing-7-1',
        productId: 265,
        code: 'PGO11KGWS',
        description: 'Local Green Olives Bulk First Grade',
        qty: 2.76,
        unit: 'KG',
        unitCost: 252000,
        totalCost: 695520
      },
      {
        id: 'ing-7-2',
        productId: 901,
        code: 'JAR230G-EMPTY',
        description: 'Empty Glass Jar 230g',
        qty: 12,
        unit: 'UNIT',
        unitCost: 8500,
        totalCost: 102000
      },
      {
        id: 'ing-7-3',
        productId: 902,
        code: 'CAP-JAR-230G',
        description: 'Metal Jar Lid 230g',
        qty: 12,
        unit: 'UNIT',
        unitCost: 2500,
        totalCost: 30000
      },
      {
        id: 'ing-7-4',
        productId: 903,
        code: 'LBL-OLIVE-230G',
        description: 'Adhesive Label Local Olives 230g',
        qty: 12,
        unit: 'UNIT',
        unitCost: 1500,
        totalCost: 18000
      }
    ]
  },
  {
    id: 6,
    prodId: 6,
    date: '2026-07-09',
    branchId: 1,
    branchName: 'Zeit w zaytoun ljanoub',
    locationId: 1,
    locationName: 'Main Store',
    assembledBy: 'Mohammed Jichi',
    productId: 1095,
    productCode: 'PGO230GJAR505',
    productDescription: 'Pickled Local Green Olives Jar 230g',
    qty: 1,
    unit: 'JAR',
    unitCost: 70460,
    totalCost: 70460,
    sellingPrice: 125000,
    remark: 'Sample assembly for quality check',
    posted: -1,
    expiryDate: '1970-01-01',
    ingredients: [
      {
        id: 'ing-6-1',
        productId: 265,
        code: 'PGO11KGWS',
        description: 'Local Green Olives Bulk First Grade',
        qty: 0.23,
        unit: 'KG',
        unitCost: 252000,
        totalCost: 57960
      },
      {
        id: 'ing-6-2',
        productId: 901,
        code: 'JAR230G-EMPTY',
        description: 'Empty Glass Jar 230g',
        qty: 1,
        unit: 'UNIT',
        unitCost: 8500,
        totalCost: 8500
      },
      {
        id: 'ing-6-3',
        productId: 902,
        code: 'CAP-JAR-230G',
        description: 'Metal Jar Lid 230g',
        qty: 1,
        unit: 'UNIT',
        unitCost: 2500,
        totalCost: 2500
      },
      {
        id: 'ing-6-4',
        productId: 903,
        code: 'LBL-OLIVE-230G',
        description: 'Adhesive Label Local Olives 230g',
        qty: 1,
        unit: 'UNIT',
        unitCost: 1500,
        totalCost: 1500
      }
    ]
  },
  {
    id: 5,
    prodId: 5,
    date: '2026-07-09',
    branchId: 1,
    branchName: 'Zeit w zaytoun ljanoub',
    locationId: 1,
    locationName: 'Main Store',
    assembledBy: 'Mohammed Jichi',
    productId: 1094,
    productCode: 'STF230GJAR506',
    productDescription: 'مرطبان زيتون اخضر محشي اريزونا 230غ',
    qty: 13,
    unit: 'JAR',
    unitCost: 82000,
    totalCost: 1066000,
    sellingPrice: 120000,
    remark: 'Stuffed green olive jars',
    posted: -1,
    expiryDate: '2028-07-31',
    ingredients: [
      {
        id: 'ing-5-1',
        productId: 266,
        code: 'SGO11KGWS',
        description: 'زيتون محشي اريزونا جملة',
        qty: 3.12,
        unit: 'KG',
        unitCost: 280000,
        totalCost: 873600
      },
      {
        id: 'ing-5-2',
        productId: 901,
        code: 'JAR230G-EMPTY',
        description: 'Empty Glass Jar 230g',
        qty: 13,
        unit: 'UNIT',
        unitCost: 8500,
        totalCost: 110500
      },
      {
        id: 'ing-5-3',
        productId: 902,
        code: 'CAP-JAR-230G',
        description: 'Metal Jar Lid 230g',
        qty: 13,
        unit: 'UNIT',
        unitCost: 2500,
        totalCost: 32500
      }
    ]
  },
  {
    id: 4,
    prodId: 4,
    date: '2026-07-09',
    branchId: 1,
    branchName: 'Zeit w zaytoun ljanoub',
    locationId: 2,
    locationName: 'Showroom',
    assembledBy: 'Mohammed Jichi',
    productId: 1093,
    productCode: 'PKC210GJAR507',
    productDescription: 'مرطبان خيار زهرة حبة كاملة 210غ',
    qty: 12,
    unit: 'JAR',
    unitCost: 48000,
    totalCost: 576000,
    sellingPrice: 75000,
    remark: 'Pickled baby cucumbers',
    posted: -1,
    expiryDate: '1970-01-01',
    ingredients: [
      {
        id: 'ing-4-1',
        productId: 270,
        code: 'CUC-RAW-KG',
        description: 'خيار زهرة طازج بلدي',
        qty: 2.6,
        unit: 'KG',
        unitCost: 140000,
        totalCost: 364000
      },
      {
        id: 'ing-4-2',
        productId: 905,
        code: 'JAR210G-EMPTY',
        description: 'مرطبان زجاج مضلع 210غ',
        qty: 12,
        unit: 'UNIT',
        unitCost: 8200,
        totalCost: 98400
      },
      {
        id: 'ing-4-3',
        productId: 906,
        code: 'BRINE-SOL-L',
        description: 'محلول ملحي وخل متبل',
        qty: 2.5,
        unit: 'L',
        unitCost: 45440,
        totalCost: 113600
      }
    ]
  },
  {
    id: 3,
    prodId: 3,
    date: '2026-07-08',
    branchId: 1,
    branchName: 'Zeit w zaytoun ljanoub',
    locationId: 2,
    locationName: 'Showroom',
    assembledBy: 'Mohammed Jichi',
    productId: 1092,
    productCode: 'RCE500GBAG508',
    productDescription: '0.5 kg Camolino أرز مصري',
    qty: 1,
    unit: 'BAG',
    unitCost: 28500,
    totalCost: 28500,
    sellingPrice: 40000,
    remark: 'Test packaging',
    posted: -1,
    expiryDate: '1970-01-01',
    ingredients: [
      {
        id: 'ing-3-1',
        productId: 280,
        code: 'RCE-BULK-KG',
        description: 'أرز مصري كامولينو شوال جملة',
        qty: 0.5,
        unit: 'KG',
        unitCost: 52000,
        totalCost: 26000
      },
      {
        id: 'ing-3-2',
        productId: 910,
        code: 'BAG-500G-PLAS',
        description: 'كيس شفاف تفريغ هواء 500غ',
        qty: 1,
        unit: 'UNIT',
        unitCost: 2500,
        totalCost: 2500
      }
    ]
  },
  {
    id: 2,
    prodId: 2,
    date: '2026-07-08',
    branchId: 1,
    branchName: 'Zeit w zaytoun ljanoub',
    locationId: 2,
    locationName: 'Showroom',
    assembledBy: 'Mohammed Jichi',
    productId: 1092,
    productCode: 'RCE500GBAG508',
    productDescription: '0.5 kg Camolino أرز مصري',
    qty: 50,
    unit: 'BAG',
    unitCost: 28500,
    totalCost: 1425000,
    sellingPrice: 40000,
    remark: 'Retail shelf packaging',
    posted: -1,
    expiryDate: '1970-01-01',
    ingredients: [
      {
        id: 'ing-2-1',
        productId: 280,
        code: 'RCE-BULK-KG',
        description: 'أرز مصري كامولينو شوال جملة',
        qty: 25,
        unit: 'KG',
        unitCost: 52000,
        totalCost: 1300000
      },
      {
        id: 'ing-2-2',
        productId: 910,
        code: 'BAG-500G-PLAS',
        description: 'كيس شفاف تفريغ هواء 500غ',
        qty: 50,
        unit: 'UNIT',
        unitCost: 2500,
        totalCost: 125000
      }
    ]
  },
  {
    id: 1,
    prodId: 1,
    date: '2025-12-10',
    branchId: 1,
    branchName: 'Zeit w zaytoun ljanoub',
    locationId: 1,
    locationName: 'Main Store',
    assembledBy: 'Mohammed Jichi',
    productId: 45,
    productCode: 'ART300G*12BOX',
    productDescription: 'صندوق زعتر أحمر حلبي 300غ*12',
    qty: 20,
    unit: 'BOX',
    unitCost: 1354800,
    totalCost: 27096000,
    sellingPrice: 1710000,
    remark: 'Box packing for export',
    posted: -1,
    expiryDate: '1970-01-01',
    ingredients: [
      {
        id: 'ing-1-1',
        productId: 155,
        code: 'ART1KGWS',
        description: 'زعتر أحمر حلبي جملة',
        qty: 72,
        unit: 'KG',
        unitCost: 360000,
        totalCost: 25920000
      },
      {
        id: 'ing-1-2',
        productId: 170,
        code: 'BOX-CART-12',
        description: 'كرتونة شحن وتغليف 12 عبوة',
        qty: 20,
        unit: 'UNIT',
        unitCost: 35000,
        totalCost: 700000
      },
      {
        id: 'ing-1-3',
        productId: 915,
        code: 'POUCH-300G',
        description: 'اكياس الومنيوم عازلة 300غ',
        qty: 240,
        unit: 'UNIT',
        unitCost: 1983,
        totalCost: 476000
      }
    ]
  }
];

// Initial Multiple Production Records from Live Omega ERP
const INITIAL_MULTIPLE_ASSEMBLIES: MultipleAssemblyRecord[] = [
  {
    id: 8,
    multipleProdId: 1,
    name: 'MULTIPLE PRODUCTION 1',
    branchId: 1,
    branchName: 'Zeit w zaytoun ljanoub',
    locationId: 2,
    locationName: 'Showroom',
    assembledBy: 'Mohammed Jichi',
    date: '2026-07-09',
    remark: 'Summer retail shelf replenishment run',
    posted: -1,
    items: [
      {
        id: 'mult-1-1',
        prodId: 9,
        productId: 1097,
        code: 'CSC210GJAR507',
        description: 'مرطبان خيار مشرح/مقطع 210غ',
        qty: 11,
        unit: 'JAR',
        locationId: 2,
        locationName: 'Showroom',
        date: '2026-07-09',
        expiryDate: '2028-07-31',
        unitCost: 51135
      },
      {
        id: 'mult-1-2',
        prodId: 10,
        productId: 1098,
        code: 'TPR375GJAR507',
        description: 'مرطبان رب بندورة 375غ',
        qty: 12,
        unit: 'JAR',
        locationId: 2,
        locationName: 'Showroom',
        date: '2026-07-09',
        expiryDate: '2028-07-31',
        unitCost: 70119
      },
      {
        id: 'mult-1-3',
        prodId: 11,
        productId: 1099,
        code: 'MKD450GJAR509',
        description: 'مرطبان مكدوس باذنجان بالجوز 450غ',
        qty: 6,
        unit: 'JAR',
        locationId: 2,
        locationName: 'Showroom',
        date: '2026-07-09',
        expiryDate: '2028-07-31',
        unitCost: 115000
      },
      {
        id: 'mult-1-4',
        prodId: 12,
        productId: 1100,
        code: 'POM500MLBOT',
        description: 'قنينة دبس رمان جبلي طبيعي 500مل',
        qty: 8,
        unit: 'BOT',
        locationId: 2,
        locationName: 'Showroom',
        date: '2026-07-09',
        expiryDate: '2028-07-31',
        unitCost: 145000
      },
      {
        id: 'mult-1-5',
        prodId: 13,
        productId: 1101,
        code: 'TRN650GJAR',
        description: 'مرطبان كبيس لفت بلدي احمر 650غ',
        qty: 10,
        unit: 'JAR',
        locationId: 2,
        locationName: 'Showroom',
        date: '2026-07-09',
        expiryDate: '2028-07-31',
        unitCost: 58000
      },
      {
        id: 'mult-1-6',
        prodId: 14,
        productId: 509,
        code: 'OST350GJAR509',
        description: 'زعتر بلدي جنوبي 350غ',
        qty: 15,
        unit: 'JAR',
        locationId: 2,
        locationName: 'Showroom',
        date: '2026-07-09',
        expiryDate: '2028-07-31',
        unitCost: 95000
      },
      {
        id: 'mult-1-7',
        prodId: 15,
        productId: 512,
        code: 'ONT1000G*12',
        description: 'زعتر أخضر دفي 1000غ*12',
        qty: 5,
        unit: 'BOX',
        locationId: 2,
        locationName: 'Showroom',
        date: '2026-07-09',
        expiryDate: '2028-07-31',
        unitCost: 210000
      },
      {
        id: 'mult-1-8',
        prodId: 16,
        productId: 601,
        code: 'EVOO500ML',
        description: 'زيت زيتون بكر ممتاز قنينة زجاج 500مل',
        qty: 24,
        unit: 'BOT',
        locationId: 2,
        locationName: 'Showroom',
        date: '2026-07-09',
        expiryDate: '2028-07-31',
        unitCost: 320000
      },
      {
        id: 'mult-1-9',
        prodId: 17,
        productId: 701,
        code: 'SOAP-LAUR-OLV',
        description: 'صابون بلدي غار وزيت زيتون قالب',
        qty: 30,
        unit: 'PIECE',
        locationId: 2,
        locationName: 'Showroom',
        date: '2026-07-09',
        expiryDate: '2028-07-31',
        unitCost: 45000
      },
      {
        id: 'mult-1-10',
        prodId: 18,
        productId: 1105,
        code: 'HPEP350GJAR',
        description: 'مرطبان مخلل فليفلة حارة بلدية 350غ',
        qty: 12,
        unit: 'JAR',
        locationId: 2,
        locationName: 'Showroom',
        date: '2026-07-09',
        expiryDate: '2028-07-31',
        unitCost: 62000
      },
      {
        id: 'mult-1-11',
        prodId: 19,
        productId: 801,
        code: 'HALAWA-PIST-400G',
        description: 'حلاوة طحينية فاخرة بالفستق الحلبي 400غ',
        qty: 10,
        unit: 'BOX',
        locationId: 2,
        locationName: 'Showroom',
        date: '2026-07-09',
        expiryDate: '2028-07-31',
        unitCost: 125000
      }
    ]
  }
];

export default function ItemAssemblyView() {
  const { t } = useLanguage();
  // Mode: 'single' | 'multiple'
  const [activeMode, setActiveMode] = useState<'single' | 'multiple'>('single');
  const [viewType, setViewType] = useState<'basedonrecipe' | 'itemproducedlocally'>('basedonrecipe');

  // Single Assembly State
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [assemblyDate, setAssemblyDate] = useState<string>('2026-09-11');
  const [assembledBy] = useState<string>('Mohammed Jichi');
  
  // Selected finished item
  const [selectedItem, setSelectedItem] = useState<AuthenticInventoryItem | null>(null);
  const [itemSearchText, setItemSearchText] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState<string>('');
  const [remark, setRemark] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');

  // Ingredients table state
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [ingredientSearchText, setIngredientSearchText] = useState<string>('');

  // Multiple Item Assembly State
  const [multiBranchId, setMultiBranchId] = useState<number | null>(null);
  const [multiLocationId, setMultiLocationId] = useState<number | null>(null);
  const [multiAssemblyName, setMultiAssemblyName] = useState<string>('MULTIPLE ITEM ASSEMBLY 2');
  const [multiAssemblyDate, setMultiAssemblyDate] = useState<string>('2026-09-11');
  const [multiRemark, setMultiRemark] = useState<string>('');
  const [multiSearchText, setMultiSearchText] = useState<string>('');
  const [multiItems, setMultiItems] = useState<MultipleAssemblyItem[]>([]);
  const [multiPosted, setMultiPosted] = useState<boolean>(false);

  // Section Collapses
  const [infoSectionOpen, setInfoSectionOpen] = useState<boolean>(true);
  const [detailsSectionOpen, setDetailsSectionOpen] = useState<boolean>(true);
  const [multiInfoSectionOpen, setMultiInfoSectionOpen] = useState<boolean>(true);
  const [multiDetailsSectionOpen, setMultiDetailsSectionOpen] = useState<boolean>(true);

  // Modals
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [searchModalTarget, setSearchModalTarget] = useState<'finished_item' | 'ingredient' | 'multiple_item'>('finished_item');
  const [searchInitialTerm, setSearchInitialTerm] = useState<string>('');

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [isMultiPreviewModalOpen, setIsMultiPreviewModalOpen] = useState<boolean>(false);
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState<boolean>(false);
  const [isImportCsvModalOpen, setIsImportCsvModalOpen] = useState<boolean>(false);
  const [isPrintReportView, setIsPrintReportView] = useState<boolean>(false);
  const [reportVoucher, setReportVoucher] = useState<SingleAssemblyRecord | null>(null);

  // Records state
  const [singleRecords, setSingleRecords] = useState<SingleAssemblyRecord[]>(INITIAL_SINGLE_ASSEMBLIES);
  const [multipleRecords, setMultipleRecords] = useState<MultipleAssemblyRecord[]>(INITIAL_MULTIPLE_ASSEMBLIES);
  const [currentLoadedVoucherId, setCurrentLoadedVoucherId] = useState<number | null>(null);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ==========================================================================
  // LOCKING RULES IMPLEMENTATION
  // ==========================================================================
  // Single Assembly:
  // "Previwe/Action/Location/Assemled By/Item Assembly Date/Item/Unit, are locked until choosing Branch"
  const isSingleBranchLocked = !selectedBranchId;
  const isSingleLocationLocked = isSingleBranchLocked || !selectedLocationId;

  // Multiple Assembly:
  // "Enter Multiple Item Assembly, Location/Multiple Item Assembly Name*/Assembled By/Item Assembly Date/Assemble Items Search bar Import CVS are locked upon choosing Branch and Location."
  const isMultiBranchLocked = !multiBranchId;
  const isMultiLocationLocked = isMultiBranchLocked || !multiLocationId;

  // ==========================================================================
  // INGREDIENTS GENERATOR (BASED ON CHOSEN FINISHED ITEM & QUANTITY)
  // ==========================================================================
  const generateIngredientsForItem = (item: AuthenticInventoryItem, targetQty: number) => {
    const q = targetQty > 0 ? targetQty : 1;
    const itemDesc = item.description || '';
    const baseCode = item.code || 'CODE';

    // Tailored recipes based on authentic food products
    if (itemDesc.includes('زعتر')) {
      return [
        {
          id: `gen-ing-${Date.now()}-1`,
          productId: 155,
          code: 'RAW-ZAATAR-WS',
          description: 'زعتر بلدي خام مجفف درجة أولى جملة',
          qty: parseFloat((q * 3.6).toFixed(2)),
          unit: 'KG',
          unitCost: 180000,
          totalCost: Math.round(q * 3.6 * 180000),
          isMain: true
        },
        {
          id: `gen-ing-${Date.now()}-2`,
          productId: 156,
          code: 'RAW-SESAME-ROAST',
          description: 'سمسم محمص بلدي ممتاز',
          qty: parseFloat((q * 1.8).toFixed(2)),
          unit: 'KG',
          unitCost: 220000,
          totalCost: Math.round(q * 1.8 * 220000)
        },
        {
          id: `gen-ing-${Date.now()}-3`,
          productId: 157,
          code: 'RAW-SUMAC-PURE',
          description: 'سماق بلدي حامض نقي',
          qty: parseFloat((q * 0.6).toFixed(2)),
          unit: 'KG',
          unitCost: 310000,
          totalCost: Math.round(q * 0.6 * 310000)
        },
        {
          id: `gen-ing-${Date.now()}-4`,
          productId: 901,
          code: 'PKG-JAR-GLASS',
          description: 'مرطبان زجاجي معقم مع الغطاء والملصق',
          qty: q,
          unit: 'UNIT',
          unitCost: 12500,
          totalCost: q * 12500
        }
      ];
    } else if (itemDesc.includes('زيتون')) {
      return [
        {
          id: `gen-ing-${Date.now()}-1`,
          productId: 265,
          code: 'RAW-OLV-BULK',
          description: 'زيتون أخضر بلدي أول شوال خام',
          qty: parseFloat((q * 0.25).toFixed(2)),
          unit: 'KG',
          unitCost: 252000,
          totalCost: Math.round(q * 0.25 * 252000),
          isMain: true
        },
        {
          id: `gen-ing-${Date.now()}-2`,
          productId: 901,
          code: 'JAR230G-EMPTY',
          description: 'مرطبان زجاج 230غ مع الغطاء',
          qty: q,
          unit: 'UNIT',
          unitCost: 11000,
          totalCost: q * 11000
        },
        {
          id: `gen-ing-${Date.now()}-3`,
          productId: 903,
          code: 'LBL-OLV-230',
          description: 'ملصق لاصق وتغليف حماية',
          qty: q,
          unit: 'UNIT',
          unitCost: 1500,
          totalCost: q * 1500
        }
      ];
    } else if (itemDesc.includes('زيت')) {
      return [
        {
          id: `gen-ing-${Date.now()}-1`,
          productId: 601,
          code: 'BULK-EVOO-L',
          description: 'زيت زيتون معصرة بكر ممتاز نخب أول (خام)',
          qty: parseFloat((q * 0.5).toFixed(2)),
          unit: 'L',
          unitCost: 580000,
          totalCost: Math.round(q * 0.5 * 580000),
          isMain: true
        },
        {
          id: `gen-ing-${Date.now()}-2`,
          productId: 908,
          code: 'BOT500ML-DARK',
          description: 'قنينة زجاج عاتم 500مل مع سدادة سكب',
          qty: q,
          unit: 'UNIT',
          unitCost: 24000,
          totalCost: q * 24000
        },
        {
          id: `gen-ing-${Date.now()}-3`,
          productId: 909,
          code: 'CAPSULE-SHRINK',
          description: 'كبسولة حرارية للغطاء والملصق',
          qty: q,
          unit: 'UNIT',
          unitCost: 3500,
          totalCost: q * 3500
        }
      ];
    } else {
      // General formulation
      return [
        {
          id: `gen-ing-${Date.now()}-1`,
          productId: 888,
          code: `${baseCode}-RAW-1`,
          description: `المكون الأساسي لـ ${itemDesc}`,
          qty: parseFloat((q * 1.05).toFixed(2)),
          unit: item.unit || 'KG',
          unitCost: 85000,
          totalCost: Math.round(q * 1.05 * 85000),
          isMain: true
        },
        {
          id: `gen-ing-${Date.now()}-2`,
          productId: 999,
          code: 'PKG-STANDARD',
          description: 'مواد التعبئة والتغليف واللصاقات الفنية',
          qty: q,
          unit: 'UNIT',
          unitCost: 9500,
          totalCost: q * 9500
        }
      ];
    }
  };

  // Recalculate ingredients costs when target quantity changes
  const handleApplyNewQuantity = (newQty: number) => {
    if (newQty < 0) return;
    setQuantity(newQty);
    if (selectedItem) {
      const generated = generateIngredientsForItem(selectedItem, newQty);
      setIngredients(generated);
      showToast(`Updated ingredients recipe for quantity: ${newQty}`, 'info');
    }
  };

  // Total ingredients cost
  const totalAssemblyCost = useMemo(() => {
    return ingredients.reduce((sum, ing) => sum + (ing.totalCost || 0), 0);
  }, [ingredients]);

  // Handle item selection from SearchInventoryItemsModal
  const handleSelectFinishedItem = (payloads: SelectedTransferItemPayload[]) => {
    if (!payloads || payloads.length === 0) return;
    const chosen = payloads[0];

    // Find full item from catalog or build item
    const catalogItem: AuthenticInventoryItem = OMEGA_INVENTORY_ITEMS.find(
      (it: AuthenticInventoryItem) => it.code === chosen.code || it.description === chosen.description
    ) || {
      id: Math.floor(Math.random() * 10000),
      code: chosen.code,
      description: chosen.description,
      barcode: chosen.barcode || '',
      qtyOH: chosen.qtyOnHand || 0,
      unit: chosen.unit || 'Piece',
      unitCostUsd: chosen.unitCostUsd || 1.2,
      avgCostUsd: chosen.avgCostUsd || 1.2,
      categoryId: 2,
      categoryName: 'General'
    };

    setSelectedItem(catalogItem);
    setItemSearchText(catalogItem.description);
    setUnit(catalogItem.unit || 'Piece');
    
    const initialQty = chosen.qtyTransfered && chosen.qtyTransfered > 0 ? chosen.qtyTransfered : 1;
    setQuantity(initialQty);

    // Auto-generate recipe ingredients
    const initialIngredients = generateIngredientsForItem(catalogItem, initialQty);
    setIngredients(initialIngredients);

    setIsSearchModalOpen(false);
    showToast(`Loaded "${catalogItem.description}" and generated formulation ingredients.`);
  };

  // Handle adding ingredients from modal
  const handleAddIngredientsFromModal = (payloads: SelectedTransferItemPayload[]) => {
    if (!payloads || payloads.length === 0) return;

    const newIngs: IngredientItem[] = payloads.map((p, idx) => {
      const qty = p.qtyTransfered && p.qtyTransfered > 0 ? p.qtyTransfered : 1;
      const unitCost = p.unitCostUsd ? Math.round(p.unitCostUsd * 89500) : 50000;
      return {
        id: `ing-manual-${Date.now()}-${idx}`,
        productId: Math.floor(Math.random() * 90000),
        code: p.code,
        description: p.description,
        qty: qty,
        unit: p.unit || 'KG',
        unitCost: unitCost,
        totalCost: qty * unitCost
      };
    });

    setIngredients((prev) => [...prev, ...newIngs]);
    setIsSearchModalOpen(false);
    showToast(`Added ${newIngs.length} ingredient(s) to formulation table.`);
  };

  // Handle adding items to Multiple Item Assembly from modal
  const handleAddMultipleItemsFromModal = (payloads: SelectedTransferItemPayload[]) => {
    if (!payloads || payloads.length === 0) return;

    const locObj = AUTHENTIC_LOCATIONS.find((l) => l.id === multiLocationId);
    const locName = locObj ? locObj.name : 'Showroom';

    const newItems: MultipleAssemblyItem[] = payloads.map((p, idx) => {
      const q = p.qtyTransfered && p.qtyTransfered > 0 ? p.qtyTransfered : 1;
      const uCost = p.unitCostUsd ? Math.round(p.unitCostUsd * 89500) : 75000;
      return {
        id: `mult-it-${Date.now()}-${idx}`,
        productId: Math.floor(Math.random() * 90000),
        code: p.code,
        description: p.description,
        qty: q,
        unit: p.unit || 'JAR',
        locationId: multiLocationId || 2,
        locationName: locName,
        date: multiAssemblyDate,
        expiryDate: '2028-07-31',
        unitCost: uCost
      };
    });

    setMultiItems((prev) => [...prev, ...newItems]);
    setIsSearchModalOpen(false);
    showToast(`Added ${newItems.length} item(s) to Multiple Item Assembly table.`);
  };

  // Open Search Inventory Items Modal with specific target
  const triggerSearchModal = (target: 'finished_item' | 'ingredient' | 'multiple_item', query: string = '') => {
    setSearchModalTarget(target);
    setSearchInitialTerm(query);
    setIsSearchModalOpen(true);
  };

  // Save Single Item Assembly
  const handleSaveSingleAssembly = (andPost: boolean = false) => {
    if (!selectedBranchId) {
      showToast('Please select a branch first!', 'error');
      return;
    }
    if (!selectedLocationId) {
      showToast('Please select a location first!', 'error');
      return;
    }
    if (!selectedItem) {
      showToast('Please select an item to assemble!', 'error');
      return;
    }
    if (quantity <= 0) {
      showToast('Quantity must be greater than 0!', 'error');
      return;
    }

    const branchObj = AUTHENTIC_BRANCHES.find((b) => b.id === selectedBranchId);
    const locObj = AUTHENTIC_LOCATIONS.find((l) => l.id === selectedLocationId);

    const newId = currentLoadedVoucherId || (singleRecords.length > 0 ? Math.max(...singleRecords.map((r) => r.id)) + 1 : 1);

    const newRecord: SingleAssemblyRecord = {
      id: newId,
      prodId: newId,
      date: assemblyDate,
      branchId: selectedBranchId,
      branchName: branchObj ? branchObj.name : '',
      locationId: selectedLocationId,
      locationName: locObj ? locObj.name : '',
      assembledBy: assembledBy,
      productId: selectedItem.id,
      productCode: selectedItem.code,
      productDescription: selectedItem.description,
      qty: quantity,
      unit: unit || 'Piece',
      unitCost: quantity > 0 ? Math.round(totalAssemblyCost / quantity) : 0,
      totalCost: totalAssemblyCost,
      sellingPrice: selectedItem.unitCostUsd ? Math.round(selectedItem.unitCostUsd * 89500 * 1.25) : 120000,
      remark: remark,
      posted: andPost ? -1 : 0,
      expiryDate: expiryDate || '1970-01-01',
      ingredients: [...ingredients]
    };

    setSingleRecords((prev) => {
      const exists = prev.some((r) => r.id === newId);
      if (exists) {
        return prev.map((r) => (r.id === newId ? newRecord : r));
      }
      return [newRecord, ...prev];
    });

    setCurrentLoadedVoucherId(newId);
    showToast(
      andPost
        ? `Item Assembly #${newId} saved and posted successfully!`
        : `Item Assembly #${newId} saved as draft.`
    );
  };

  // Reset Single Assembly Form
  const handleClearSingleForm = () => {
    setCurrentLoadedVoucherId(null);
    setSelectedItem(null);
    setItemSearchText('');
    setQuantity(0);
    setUnit('');
    setRemark('');
    setExpiryDate('');
    setIngredients([]);
    showToast('Item Assembly workstation cleared for new entry.', 'info');
  };

  // Load an existing single assembly into form
  const handleLoadSingleVoucher = (record: SingleAssemblyRecord) => {
    setCurrentLoadedVoucherId(record.id);
    setSelectedBranchId(record.branchId);
    setSelectedLocationId(record.locationId);
    setAssemblyDate(record.date);
    setItemSearchText(record.productDescription);
    setSelectedItem({
      id: record.productId,
      code: record.productCode,
      description: record.productDescription,
      barcode: '',
      qtyOH: 0,
      unit: record.unit,
      unitCostUsd: record.unitCost / 89500,
      avgCostUsd: record.unitCost / 89500,
      categoryId: 2,
      categoryName: 'General'
    });
    setQuantity(record.qty);
    setUnit(record.unit);
    setRemark(record.remark || '');
    setExpiryDate(record.expiryDate || '');
    setIngredients([...record.ingredients]);
    setIsPreviewModalOpen(false);
    showToast(`Loaded Item Assembly #${record.id} (${record.productDescription}) into workstation.`);
  };

  // Save Multiple Item Assembly
  const handleSaveMultipleAssembly = (andPost: boolean = false) => {
    if (!multiBranchId) {
      showToast('Please select a branch first!', 'error');
      return;
    }
    if (!multiLocationId) {
      showToast('Please select a location first!', 'error');
      return;
    }
    if (!multiAssemblyName.trim()) {
      showToast('Please enter a Multiple Item Assembly Name!', 'error');
      return;
    }
    if (multiItems.length === 0) {
      showToast('Please add at least one item to assemble!', 'error');
      return;
    }

    const branchObj = AUTHENTIC_BRANCHES.find((b) => b.id === multiBranchId);
    const locObj = AUTHENTIC_LOCATIONS.find((l) => l.id === multiLocationId);

    const newId = multipleRecords.length > 0 ? Math.max(...multipleRecords.map((r) => r.id)) + 1 : 1;

    const newRecord: MultipleAssemblyRecord = {
      id: newId,
      multipleProdId: newId,
      name: multiAssemblyName,
      branchId: multiBranchId,
      branchName: branchObj ? branchObj.name : '',
      locationId: multiLocationId,
      locationName: locObj ? locObj.name : '',
      assembledBy: 'Mohammed Jichi',
      date: multiAssemblyDate,
      remark: multiRemark,
      posted: andPost ? -1 : 0,
      items: [...multiItems]
    };

    setMultipleRecords((prev) => [newRecord, ...prev]);
    setMultiPosted(andPost);
    showToast(
      andPost
        ? `Multiple Item Assembly "${multiAssemblyName}" saved and posted successfully!`
        : `Multiple Item Assembly "${multiAssemblyName}" saved.`
    );
  };

  // Load a Multiple Item Assembly into view
  const handleLoadMultipleVoucher = (record: MultipleAssemblyRecord) => {
    setMultiBranchId(record.branchId);
    setMultiLocationId(record.locationId);
    setMultiAssemblyName(record.name);
    setMultiAssemblyDate(record.date);
    setMultiRemark(record.remark || '');
    setMultiItems([...record.items]);
    setMultiPosted(record.posted === -1);
    setIsMultiPreviewModalOpen(false);
    showToast(`Loaded Multiple Assembly "${record.name}" into table.`);
  };

  // Clear Multiple Item Assembly Form
  const handleClearMultipleForm = () => {
    setMultiItems([]);
    setMultiRemark('');
    setMultiPosted(false);
    setMultiAssemblyName(`MULTIPLE ITEM ASSEMBLY ${multipleRecords.length + 2}`);
    showToast('Multiple Item Assembly table cleared.', 'info');
  };

  // Toggle Printable Report Document View
  const handleOpenPrintReport = () => {
    if (selectedItem) {
      const branchObj = AUTHENTIC_BRANCHES.find((b) => b.id === selectedBranchId);
      const locObj = AUTHENTIC_LOCATIONS.find((l) => l.id === selectedLocationId);
      setReportVoucher({
        id: currentLoadedVoucherId || 101,
        prodId: currentLoadedVoucherId || 101,
        date: assemblyDate,
        branchId: selectedBranchId || 1,
        branchName: branchObj ? branchObj.name : 'Zeit w zaytoun ljanoub',
        locationId: selectedLocationId || 1,
        locationName: locObj ? locObj.name : 'Main Store',
        assembledBy: assembledBy,
        productId: selectedItem.id,
        productCode: selectedItem.code,
        productDescription: selectedItem.description,
        qty: quantity,
        unit: unit || 'Piece',
        unitCost: quantity > 0 ? Math.round(totalAssemblyCost / quantity) : 0,
        totalCost: totalAssemblyCost,
        sellingPrice: 125000,
        posted: -1,
        ingredients: [...ingredients]
      });
      setIsPrintReportView(true);
    } else if (singleRecords.length > 0) {
      setReportVoucher(singleRecords[0]);
      setIsPrintReportView(true);
    } else {
      showToast('No assembly data available to print.', 'info');
    }
  };

  // ==========================================================================
  // RENDER: FULL-PAGE PRINTABLE DOCUMENT VIEW (MATCHING OMEGA EXACTLY)
  // ==========================================================================
  if (isPrintReportView && reportVoucher) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 flex flex-col items-center">
        {/* Top Print Toolbar */}
        <div className="w-full max-w-4xl flex items-center justify-between mb-4 bg-white p-3 rounded-lg border border-slate-300 shadow-xs print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>{t('print', 'Print')}</span>
            </button>
            <button
              onClick={() => setIsPrintReportView(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('back', 'Back')}</span>
            </button>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Item Assembly Sheet • #{reportVoucher.id}
          </span>
        </div>

        {/* Printable Sheet */}
        <div className="w-full max-w-4xl bg-white p-10 rounded-xl shadow-lg border border-slate-200 print:border-none print:shadow-none font-sans text-slate-900">
          <div className="text-center border-b border-slate-300 pb-4 mb-6">
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
              {t('item_assembly_sheet', 'Item Assembly Sheet')}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {t('zeit_w_zaytoun_production_formulation', 'Zeit w Zaytoun • Production & Formulation Registry')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <p className="text-slate-500">
                <span className="font-bold text-slate-700">{t('assembly_id', 'Assembly ID:')} </span> #{reportVoucher.id}
              </p>
              <p className="text-slate-500 mt-1">
                <span className="font-bold text-slate-700">{t('assembly_date', 'Assembly Date:')} </span> {reportVoucher.date}
              </p>
              <p className="text-slate-500 mt-1">
                <span className="font-bold text-slate-700">{t('branch', 'Branch:')} </span> {reportVoucher.branchName}
              </p>
              <p className="text-slate-500 mt-1">
                <span className="font-bold text-slate-700">{t('location', 'Location:')} </span> {reportVoucher.locationName}
              </p>
            </div>
            <div>
              <p className="text-slate-500">
                <span className="font-bold text-slate-700">{t('assembled_by', 'Assembled By:')} </span> {reportVoucher.assembledBy}
              </p>
              <p className="text-slate-500 mt-1">
                <span className="font-bold text-slate-700">{t('finished_item', 'Finished Item:')} </span>
                <span className="font-black text-slate-900">{reportVoucher.productDescription}</span>
              </p>
              <p className="text-slate-500 mt-1">
                <span className="font-bold text-slate-700">{t('assembled_quantity', 'Assembled Quantity:')} </span>
                <span className="font-bold text-emerald-800">{reportVoucher.qty} {reportVoucher.unit}</span>
              </p>
              <p className="text-slate-500 mt-1">
                <span className="font-bold text-slate-700">{t('status', 'Status:')} </span>
                <span className="font-bold text-emerald-800">
                  {reportVoucher.posted === -1 ? 'Posted / Completed' : 'Draft'}
                </span>
              </p>
            </div>
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            {t('formulation_ingredients_raw_materials', 'Formulation Ingredients / Raw Materials Consumed')}
          </h3>
          <table className="w-full text-xs text-left border-collapse border border-slate-300 mb-6">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <th className="py-2 px-3 border-r border-slate-300">{t('description', 'Description')}</th>
                <th className="py-2 px-3 text-right border-r border-slate-300">{t('qty', 'Qty')}</th>
                <th className="py-2 px-3 border-r border-slate-300">{t('unit', 'Unit')}</th>
                <th className="py-2 px-3 text-right border-r border-slate-300">Unit Cost (LBP)</th>
                <th className="py-2 px-3 text-right">Total Cost (LBP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reportVoucher.ingredients.map((ing) => (
                <tr key={ing.id} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 border-r border-slate-200 font-medium">{ing.description}</td>
                  <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-bold">{ing.qty}</td>
                  <td className="py-2 px-3 border-r border-slate-200 text-slate-600">{ing.unit}</td>
                  <td className="py-2 px-3 border-r border-slate-200 text-right font-mono">
                    {ing.unitCost.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                    {ing.totalCost.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-800 font-bold bg-slate-50">
                <td colSpan={4} className="py-2.5 px-3 text-right">{t('total_production_cost', 'Total Production Cost:')}</td>
                <td className="py-2.5 px-3 text-right font-mono text-emerald-800 text-sm">
                  {reportVoucher.totalCost.toLocaleString()} LBP
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-12 text-center text-xs">
            <div className="border-t border-slate-400 pt-2">
              <p className="font-semibold text-slate-800">{t('assembled_by', 'Assembled By')}</p>
              <p className="text-slate-500 mt-1">{reportVoucher.assembledBy}</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p className="font-semibold text-slate-800">{t('production_supervisor', 'Production Supervisor')}</p>
              <p className="text-slate-500 mt-1">{t('signature', 'Signature')}</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p className="font-semibold text-slate-800">{t('quality_control_approval', 'Quality Control / Approval')}</p>
              <p className="text-slate-500 mt-1">{t('signature', 'Signature')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER: MAIN ITEM ASSEMBLY WORKSTATION
  // ==========================================================================
  return (
    <div className="flex flex-col min-h-screen bg-background text-slate-800 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border animate-fade-in ${
            toastType === 'error'
              ? 'bg-red-700 text-white border-red-500'
              : toastType === 'info'
              ? 'bg-primary text-white border-blue-400'
              : 'bg-emerald-600 text-white border-emerald-400'
          }`}
        >
          {toastType === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-red-200" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          )}
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HEADER SECTION (MATCHING SCREENSHOT) */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            {activeMode === 'single' ? 'Item Assembly' : 'Multiple Item Assembly'}
          </h1>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <span className="hover:text-blue-600 cursor-pointer">{t('home', 'Home')}</span>
            <span>/</span>
            {activeMode === 'multiple' ? (
              <>
                <span
                  onClick={() => setActiveMode('single')}
                  className="hover:text-blue-600 cursor-pointer"
                >
                  {t('item_assembly', 'Item Assembly')}
                </span>
                <span>/</span>
                <span className="text-slate-800 font-semibold">{t('multiple_item_assembly', 'Multiple Item Assembly')}</span>
              </>
            ) : (
              <span className="text-slate-800 font-semibold">{t('item_assembly', 'Item Assembly')}</span>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              showToast('Opening video tutorial for Item Assembly...', 'info');
            }}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t('watch_tutorial', 'Watch Tutorial')}</span>
          </a>
        </div>
      </div>

      {/* TOP CONTROL & ACTION TOOLBAR (MATCHING SCREENSHOT) */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        {activeMode === 'single' ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left Controls: Branch & Mode Dropdowns */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Branch Selector */}
              <div className="w-64">
                <div className="relative">
                  <select
                    value={selectedBranchId || ''}
                    onChange={(e) => {
                      const bId = e.target.value ? parseInt(e.target.value) : null;
                      setSelectedBranchId(bId);
                      setSelectedLocationId(null);
                      if (bId) {
                        showToast('Branch selected. Station controls unlocked.', 'success');
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  >
                    <option value="">{t('select_branch', 'Select branch')}</option>
                    {AUTHENTIC_BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* View Selector (Based on Included Items / Usage) */}
              <div className="w-60">
                <select
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  <option value="basedonrecipe">{t('based_on_included_items', 'Based on Included Items')}</option>
                  <option value="itemproducedlocally">{t('based_on_usage', 'Based on Usage')}</option>
                </select>
              </div>

              {/* + Multiple Item Assembly Green Button */}
              <button
                onClick={() => {
                  setActiveMode('multiple');
                  setMultiBranchId(selectedBranchId);
                  setMultiLocationId(selectedLocationId);
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('multiple_item_assembly', 'Multiple Item Assembly')}</span>
              </button>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Preview Button (Locked until choosing branch) */}
              <button
                disabled={isSingleBranchLocked}
                onClick={() => setIsPreviewModalOpen(true)}
                title={isSingleBranchLocked ? 'Choose branch first to unlock Preview' : 'Preview saved assemblies'}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition shadow-xs ${
                  isSingleBranchLocked
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                    : 'bg-primary hover:bg-primary/90 text-white cursor-pointer'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t('preview', 'Preview')}</span>
              </button>

              {/* + New Button */}
              <button
                onClick={handleClearSingleForm}
                className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('new', 'New')}</span>
              </button>

              {/* Actions Dropdown (Locked until choosing branch) */}
              <div className="relative group">
                <button
                  disabled={isSingleBranchLocked}
                  title={isSingleBranchLocked ? 'Choose branch first to unlock Actions' : 'Actions menu'}
                  className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition shadow-xs ${
                    isSingleBranchLocked
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                      : 'bg-primary hover:bg-primary/90 text-white cursor-pointer'
                  }`}
                >
                  <span>{t('actions', 'Actions')}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {!isSingleBranchLocked && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-xl py-1 z-40 hidden group-hover:block text-xs font-medium text-slate-700">
                    <button
                      onClick={handleOpenPrintReport}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t('print_production_sheet', 'Print Production Sheet')}</span>
                    </button>
                    <button
                      onClick={() => showToast('Stored to recurring templates.', 'info')}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('store_as_recurring', 'Store as Recurring')}</span>
                    </button>
                    <button
                      onClick={() => showToast('Recalled recurring assembly.', 'info')}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{t('recall_recurring', 'Recall Recurring')}</span>
                    </button>
                    <button
                      onClick={() => showToast('Transfer initiated to requisition.', 'info')}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                      <span>{t('transfer_to_requisition', 'Transfer to Requisition')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* MULTIPLE ITEM ASSEMBLY TOP TOOLBAR */
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveMode('single')}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('single_item_assembly', 'Single Item Assembly')}</span>
              </button>

              <button
                onClick={handleClearMultipleForm}
                disabled={isMultiBranchLocked}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition ${
                  isMultiBranchLocked
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 text-white cursor-pointer'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>{t('clear', 'Clear')}</span>
              </button>

              <button
                onClick={() => setIsMultiPreviewModalOpen(true)}
                disabled={isMultiBranchLocked}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition ${
                  isMultiBranchLocked
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 text-white cursor-pointer'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t('preview', 'Preview')}</span>
              </button>

              <button
                onClick={() => showToast('Generating multiple production report...', 'info')}
                disabled={isMultiBranchLocked || multiItems.length === 0}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition ${
                  isMultiBranchLocked || multiItems.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 text-white cursor-pointer'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('print', 'Print')}</span>
              </button>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              {multiPosted ? (
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  {t('posted', 'POSTED')}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
                  {t('draft', 'DRAFT')}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* DOTTED DIVIDER LINE */}
      <div className="border-t border-dotted border-slate-300 mx-6 my-3"></div>

      {/* =====================================================================
          VIEWPORT A: SINGLE ITEM ASSEMBLY (BASED ON INCLUDED ITEMS)
          ===================================================================== */}
      {activeMode === 'single' && (
        <div className="flex-1 px-6 pb-8 space-y-4">
          {/* CARD 1: ITEM ASSEMBLY BASED ON INCLUDED ITEMS */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            {/* Card Header (Collapsible) */}
            <div
              onClick={() => setInfoSectionOpen(!infoSectionOpen)}
              className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100"
            >
              <h2 className="text-xs font-bold text-slate-800 tracking-wide">
                {t('item_assembly_based_on_included_items', 'Item Assembly Based on Included Items')}
              </h2>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform ${
                  infoSectionOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </div>

            {/* Card Body */}
            {infoSectionOpen && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* LEFT COLUMN (4 Cols): Location, Assembled By, Item Assembly Date */}
                <div className="md:col-span-4 space-y-3 md:border-r md:border-dotted md:border-slate-300 md:pr-6">
                  {/* Location Field + Quick Add Button */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('location', 'Location*')}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <select
                        disabled={isSingleBranchLocked}
                        value={selectedLocationId || ''}
                        onChange={(e) => {
                          const locId = e.target.value ? parseInt(e.target.value) : null;
                          setSelectedLocationId(locId);
                        }}
                        className={`flex-1 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium ${
                          isSingleBranchLocked ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'bg-white'
                        }`}
                      >
                        <option value="">{t('select_location', 'Select location')}</option>
                        {AUTHENTIC_LOCATIONS.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={isSingleBranchLocked}
                        onClick={() => setIsAddLocationModalOpen(true)}
                        title={isSingleBranchLocked ? 'Select branch first' : 'Add new location'}
                        className={`p-1.5 rounded transition ${
                          isSingleBranchLocked
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-primary hover:bg-primary/90 text-white cursor-pointer'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Assembled By (Locked / Read-Only Mohammed Jichi) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('assembled_by', 'Assembled By')}
                    </label>
                    <input
                      type="text"
                      disabled
                      value={assembledBy}
                      className="w-full bg-slate-100 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-600 font-medium cursor-not-allowed"
                    />
                  </div>

                  {/* Item Assembly Date (Locked until choosing branch) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('item_assembly_date', 'Item Assembly Date')}
                    </label>
                    <input
                      type="date"
                      disabled={isSingleBranchLocked}
                      value={assemblyDate}
                      onChange={(e) => setAssemblyDate(e.target.value)}
                      className={`w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium ${
                        isSingleBranchLocked ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'bg-white'
                      }`}
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN (8 Cols): Item Search, Quantity, Unit, Remark */}
                <div className="md:col-span-8 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* Item Search Input with Search Icon Button */}
                    <div className="md:col-span-6">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {t('item', 'Item')}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="search"
                          placeholder={t('search_item', 'search item...')}
                          disabled={isSingleBranchLocked}
                          value={itemSearchText}
                          onChange={(e) => setItemSearchText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              triggerSearchModal('finished_item', itemSearchText);
                            }
                          }}
                          className={`flex-1 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium ${
                            isSingleBranchLocked ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'bg-white'
                          }`}
                        />
                        <button
                          type="button"
                          disabled={isSingleBranchLocked}
                          onClick={() => triggerSearchModal('finished_item', itemSearchText)}
                          title={isSingleBranchLocked ? 'Choose branch first' : 'Search inventory items'}
                          className={`p-2 rounded text-white transition ${
                            isSingleBranchLocked
                              ? 'bg-slate-300 cursor-not-allowed opacity-60'
                              : 'bg-primary hover:bg-primary/90 cursor-pointer'
                          }`}
                        >
                          <Search className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Quantity + Refresh/Sync Button */}
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {t('quantity', 'Quantity')}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          disabled={isSingleBranchLocked}
                          value={quantity}
                          onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleApplyNewQuantity(quantity);
                            }
                          }}
                          className={`w-full border border-slate-300 rounded px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                            isSingleBranchLocked ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'bg-white'
                          }`}
                        />
                        <button
                          type="button"
                          disabled={isSingleBranchLocked || !selectedItem}
                          onClick={() => handleApplyNewQuantity(quantity)}
                          title={t('recalculate_ingredients_for_quantity', 'Recalculate ingredients for quantity')}
                          className={`p-1.5 rounded transition ${
                            isSingleBranchLocked || !selectedItem
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-primary hover:bg-primary/90 text-white cursor-pointer'
                          }`}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Unit (Read-only, locked until choosing branch and selecting item) */}
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {t('unit', 'Unit')}
                      </label>
                      <input
                        type="text"
                        disabled
                        value={unit}
                        placeholder={t('unit', 'Unit')}
                        className="w-full bg-slate-100 border border-slate-200 rounded px-3 py-1.5 text-xs font-medium text-slate-700 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Remark Textarea */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('remark', 'Remark')}
                    </label>
                    <textarea
                      rows={2}
                      disabled={isSingleBranchLocked}
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      placeholder={t('add_assembly_notes_or_batch_details', 'Add assembly notes or batch details...')}
                      className={`w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        isSingleBranchLocked ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'bg-white'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CARD 2: ITEM ASSEMBLY DETAILS (INGREDIENTS / FORMULATION TABLE) */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            {/* Card Header */}
            <div
              onClick={() => setDetailsSectionOpen(!detailsSectionOpen)}
              className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100"
            >
              <h2 className="text-xs font-bold text-slate-800 tracking-wide">
                {t('item_assembly_details', 'Item Assembly Details')}
              </h2>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform ${
                  detailsSectionOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </div>

            {/* Card Body */}
            {detailsSectionOpen && (
              <div className="p-4 space-y-4">
                {/* Search Ingredients Input Bar */}
                <div className="max-w-md flex items-center gap-1.5">
                  <input
                    type="search"
                    disabled={isSingleBranchLocked || !selectedItem}
                    value={ingredientSearchText}
                    onChange={(e) => setIngredientSearchText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        triggerSearchModal('ingredient', ingredientSearchText);
                      }
                    }}
                    placeholder={t('search_ingredients', 'Search ingredients...')}
                    className={`flex-1 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isSingleBranchLocked || !selectedItem
                        ? 'bg-slate-100 cursor-not-allowed opacity-60'
                        : 'bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    disabled={isSingleBranchLocked || !selectedItem}
                    onClick={() => triggerSearchModal('ingredient', ingredientSearchText)}
                    title={t('search_extra_ingredients_to_add', 'Search extra ingredients to add')}
                    className={`p-2 rounded text-white transition ${
                      isSingleBranchLocked || !selectedItem
                        ? 'bg-slate-300 cursor-not-allowed opacity-60'
                        : 'bg-primary hover:bg-primary/90 cursor-pointer'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Formulation Table */}
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="py-2.5 px-3">{t('description', 'Description')}</th>
                        <th className="py-2.5 px-3 text-right">{t('qty', 'Qty')}</th>
                        <th className="py-2.5 px-3">{t('unit', 'Unit')}</th>
                        <th className="py-2.5 px-3 text-right">{t('cost', 'Cost')}</th>
                        <th className="py-2.5 px-3 text-right">{t('total_cost', 'Total Cost')}</th>
                        <th className="py-2.5 px-2 text-center w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ingredients.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                            {t('no_ingredients_selected_choose_a', 'No ingredients selected. Choose a finished item above or search ingredients to formulate.')}
                          </td>
                        </tr>
                      ) : (
                        ingredients.map((ing, idx) => (
                          <tr key={ing.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3 font-medium text-slate-800">
                              {ing.description}
                              {ing.isMain && (
                                <span className="ml-2 text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                                  {t('primary_ingredient', 'Primary Ingredient')}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <input
                                type="number"
                                step="0.01"
                                value={ing.qty}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setIngredients((prev) =>
                                    prev.map((item, i) =>
                                      i === idx
                                        ? { ...item, qty: val, totalCost: val * item.unitCost }
                                        : item
                                    )
                                  );
                                }}
                                className="w-24 text-right font-mono font-bold border border-slate-200 rounded px-2 py-0.5 text-xs focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 font-mono">{ing.unit}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                              {ing.unitCost.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              {ing.totalCost.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setIngredients((prev) => prev.filter((_, i) => i !== idx))
                                }
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                title={t('remove_ingredient', 'Remove ingredient')}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Row: Total & Save Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="text-xs text-slate-500">
                    {ingredients.length > 0 && (
                      <span>{ingredients.length} active formulation raw materials.</span>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Total */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-700">{t('total', 'Total')}</span>
                      <span className="text-sm font-bold font-mono text-slate-900 bg-slate-50 px-3 py-1 rounded border border-slate-200">
                        {totalAssemblyCost.toLocaleString()} LBP
                      </span>
                    </div>

                    {/* Action Buttons (Save & Save and Post) */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isSingleBranchLocked || !selectedItem || quantity <= 0}
                        onClick={() => handleSaveSingleAssembly(false)}
                        className={`px-4 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                          isSingleBranchLocked || !selectedItem || quantity <= 0
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                            : 'bg-amber-600 hover:bg-amber-600 text-white'
                        }`}
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{t('save', 'Save')}</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSingleBranchLocked || !selectedItem || quantity <= 0}
                        onClick={() => handleSaveSingleAssembly(true)}
                        className={`px-4 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                          isSingleBranchLocked || !selectedItem || quantity <= 0
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        }`}
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{t('save_and_post', 'Save And Post')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEWPORT B: MULTIPLE ITEM ASSEMBLY
          ===================================================================== */}
      {activeMode === 'multiple' && (
        <div className="flex-1 px-6 pb-8 space-y-4">
          {/* CARD 1: MULTIPLE ITEM ASSEMBLY INFO */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            {/* Card Header */}
            <div
              onClick={() => setMultiInfoSectionOpen(!multiInfoSectionOpen)}
              className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100"
            >
              <h2 className="text-xs font-bold text-slate-800 tracking-wide">
                {t('multiple_item_assembly_info', 'Multiple Item Assembly Info')}
              </h2>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform ${
                  multiInfoSectionOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </div>

            {/* Card Body */}
            {multiInfoSectionOpen && (
              <div className="p-4 space-y-4">
                {/* Row 1: Branch & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('branch', 'Branch*')}
                    </label>
                    <select
                      value={multiBranchId || ''}
                      onChange={(e) => {
                        const bId = e.target.value ? parseInt(e.target.value) : null;
                        setMultiBranchId(bId);
                        setMultiLocationId(null);
                        if (bId) showToast('Branch chosen. Location field unlocked.', 'info');
                      }}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    >
                      <option value="">{t('select_branch', 'Select branch')}</option>
                      {AUTHENTIC_BRANCHES.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('location', 'Location*')}
                    </label>
                    <select
                      disabled={isMultiBranchLocked}
                      value={multiLocationId || ''}
                      onChange={(e) => {
                        const lId = e.target.value ? parseInt(e.target.value) : null;
                        setMultiLocationId(lId);
                        if (lId) showToast('Location chosen. Multiple Assembly controls unlocked.', 'success');
                      }}
                      className={`w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium ${
                        isMultiBranchLocked ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'bg-white'
                      }`}
                    >
                      <option value="">{t('select_location', 'Select location')}</option>
                      {AUTHENTIC_LOCATIONS.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Multiple Item Assembly Name*, Assembled By, Item Assembly Date */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Multiple Item Assembly Name* (Locked upon choosing Branch and Location) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('multiple_item_assembly_name', 'Multiple Item Assembly Name*')}
                    </label>
                    <input
                      type="text"
                      disabled={isMultiLocationLocked}
                      value={multiAssemblyName}
                      onChange={(e) => setMultiAssemblyName(e.target.value)}
                      placeholder={t('eg_multiple_item_assembly_2', 'e.g. MULTIPLE ITEM ASSEMBLY 2')}
                      className={`w-full border border-slate-300 rounded px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        isMultiLocationLocked ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'bg-white'
                      }`}
                    />
                  </div>

                  {/* Assembled By (Locked upon choosing Branch and Location) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('assembled_by', 'Assembled By')}
                    </label>
                    <input
                      type="text"
                      disabled={isMultiLocationLocked}
                      readOnly
                      value="Mohammed Jichi"
                      className={`w-full border border-slate-300 rounded px-3 py-1.5 text-xs font-medium text-slate-700 ${
                        isMultiLocationLocked ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'bg-slate-50'
                      }`}
                    />
                  </div>

                  {/* Item Assembly Date (Locked upon choosing Branch and Location) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('item_assembly_date', 'Item Assembly Date')}
                    </label>
                    <input
                      type="date"
                      disabled={isMultiLocationLocked}
                      value={multiAssemblyDate}
                      onChange={(e) => setMultiAssemblyDate(e.target.value)}
                      className={`w-full border border-slate-300 rounded px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        isMultiLocationLocked ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'bg-white'
                      }`}
                    />
                  </div>
                </div>

                {/* Row 3: Remark */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('remark', 'Remark')}
                  </label>
                  <input
                    type="text"
                    disabled={isMultiLocationLocked}
                    value={multiRemark}
                    onChange={(e) => setMultiRemark(e.target.value)}
                    placeholder={t('general_batch_remark_or_production', 'General batch remark or production reason...')}
                    className={`w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isMultiLocationLocked ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'bg-white'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* CARD 2: MULTIPLE ITEM ASSEMBLY TABLE */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            {/* Card Header */}
            <div
              onClick={() => setMultiDetailsSectionOpen(!multiDetailsSectionOpen)}
              className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100"
            >
              <h2 className="text-xs font-bold text-slate-800 tracking-wide">
                {t('multiple_item_assembly', 'Multiple Item Assembly')}
              </h2>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform ${
                  multiDetailsSectionOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </div>

            {/* Card Body */}
            {multiDetailsSectionOpen && (
              <div className="p-4 space-y-4">
                {/* Search Bar & Import CSV (Locked upon choosing Branch and Location) */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div className="w-80 flex items-center gap-1.5">
                    <input
                      type="search"
                      disabled={isMultiLocationLocked}
                      value={multiSearchText}
                      onChange={(e) => setMultiSearchText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          triggerSearchModal('multiple_item', multiSearchText);
                        }
                      }}
                      placeholder={t('assemble_items', 'Assemble Items ...')}
                      className={`w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        isMultiLocationLocked ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'bg-white'
                      }`}
                    />
                    <button
                      type="button"
                      disabled={isMultiLocationLocked}
                      onClick={() => triggerSearchModal('multiple_item', multiSearchText)}
                      title={t('search_inventory_items_to_add', 'Search inventory items to add')}
                      className={`p-2 rounded text-white transition ${
                        isMultiLocationLocked
                          ? 'bg-slate-300 cursor-not-allowed opacity-60'
                          : 'bg-primary hover:bg-primary/90 cursor-pointer'
                      }`}
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <button
                      type="button"
                      disabled={isMultiLocationLocked}
                      onClick={() => setIsImportCsvModalOpen(true)}
                      className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition ${
                        isMultiLocationLocked
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                          : 'bg-primary hover:bg-primary/90 text-white cursor-pointer shadow-xs'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t('import_csv', 'Import CSV')}</span>
                    </button>
                  </div>
                </div>

                {/* Multiple Assembly Table */}
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                        {multiPosted && <th className="py-2.5 px-3">#</th>}
                        <th className="py-2.5 px-3">{t('description', 'Description')}</th>
                        <th className="py-2.5 px-3 text-right">{t('qty', 'Qty')}</th>
                        <th className="py-2.5 px-3">{t('unit', 'Unit')}</th>
                        <th className="py-2.5 px-3">{t('location', 'Location')}</th>
                        <th className="py-2.5 px-3">{t('date', 'Date')}</th>
                        <th className="py-2.5 px-3">{t('expiry_date', 'Expiry Date')}</th>
                        <th className="py-2.5 px-2 text-center w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {multiItems.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                            {t('no_items_added_to_assembly_search_items', 'No items added to assembly. Search items or import CSV above to assemble in bulk.')}
                          </td>
                        </tr>
                      ) : (
                        multiItems.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                            {multiPosted && (
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-500">
                                {item.prodId || idx + 1}
                              </td>
                            )}
                            <td className="py-2.5 px-3 font-medium text-slate-800">
                              {item.description}
                              <div className="text-[10px] text-slate-400 font-mono">Code: {item.code}</div>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <input
                                type="number"
                                step="1"
                                min="1"
                                value={item.qty}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 1;
                                  setMultiItems((prev) =>
                                    prev.map((it, i) => (i === idx ? { ...it, qty: val } : it))
                                  );
                                }}
                                className="w-20 text-right font-mono font-bold border border-slate-200 rounded px-2 py-0.5 text-xs focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 font-mono">{item.unit}</td>
                            <td className="py-2.5 px-3 text-slate-700">{item.locationName}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">{item.date}</td>
                            <td className="py-2.5 px-3">
                              <input
                                type="date"
                                value={item.expiryDate || '2028-07-31'}
                                onChange={(e) => {
                                  const exp = e.target.value;
                                  setMultiItems((prev) =>
                                    prev.map((it, i) => (i === idx ? { ...it, expiryDate: exp } : it))
                                  );
                                }}
                                className="border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700"
                              />
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setMultiItems((prev) => prev.filter((_, i) => i !== idx))
                                }
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                title={t('remove_item', 'Remove item')}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-500">
                    {multiItems.length} item(s) in bulk assembly list.
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isMultiLocationLocked || multiItems.length === 0}
                      onClick={() => handleSaveMultipleAssembly(false)}
                      className={`px-4 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                        isMultiLocationLocked || multiItems.length === 0
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                          : 'bg-amber-600 hover:bg-amber-600 text-white'
                      }`}
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{t('save', 'Save')}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isMultiLocationLocked || multiItems.length === 0}
                      onClick={() => handleSaveMultipleAssembly(true)}
                      className={`px-4 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                        isMultiLocationLocked || multiItems.length === 0
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      }`}
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{t('save_and_post', 'Save And Post')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL 1: SEARCH INVENTORY ITEMS MODAL (SAME AS REORDER GUIDE)
          ====================================================================== */}
      <SearchInventoryItemsModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        initialSearch={searchInitialTerm}
        onAddItems={(payloads) => {
          if (searchModalTarget === 'finished_item') {
            handleSelectFinishedItem(payloads);
          } else if (searchModalTarget === 'ingredient') {
            handleAddIngredientsFromModal(payloads);
          } else if (searchModalTarget === 'multiple_item') {
            handleAddMultipleItemsFromModal(payloads);
          }
        }}
      />

      {/* ======================================================================
          MODAL 2: PREVIEW SINGLE PRODUCTIONS MODAL
          ====================================================================== */}
      {isPreviewModalOpen && (
        <PreviewSingleProductionsModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          records={singleRecords}
          onOpenRecord={handleLoadSingleVoucher}
          onDeleteRecord={(id) => {
            setSingleRecords((prev) => prev.filter((r) => r.id !== id));
            showToast(`Assembly record #${id} deleted.`, 'info');
          }}
          onPostRecord={(id) => {
            setSingleRecords((prev) =>
              prev.map((r) => (r.id === id ? { ...r, posted: -1 } : r))
            );
            showToast(`Assembly record #${id} posted.`, 'success');
          }}
        />
      )}

      {/* ======================================================================
          MODAL 3: PREVIEW MULTIPLE PRODUCTIONS MODAL
          ====================================================================== */}
      {isMultiPreviewModalOpen && (
        <PreviewMultipleProductionsModal
          isOpen={isMultiPreviewModalOpen}
          onClose={() => setIsMultiPreviewModalOpen(false)}
          records={multipleRecords}
          onOpenRecord={handleLoadMultipleVoucher}
          onDeleteRecord={(id) => {
            setMultipleRecords((prev) => prev.filter((r) => r.id !== id));
            showToast(`Multiple Assembly #${id} deleted.`, 'info');
          }}
        />
      )}

      {/* ======================================================================
          MODAL 4: ADD LOCATION MODAL
          ====================================================================== */}
      {isAddLocationModalOpen && (
        <AddLocationModal
          isOpen={isAddLocationModalOpen}
          onClose={() => setIsAddLocationModalOpen(false)}
          onAddLocation={(name) => {
            const newId = AUTHENTIC_LOCATIONS.length + 1;
            AUTHENTIC_LOCATIONS.push({ id: newId, name });
            setSelectedLocationId(newId);
            setIsAddLocationModalOpen(false);
            showToast(`Added and selected new location: ${name}`, 'success');
          }}
        />
      )}

      {/* ======================================================================
          MODAL 5: IMPORT CSV MODAL
          ====================================================================== */}
      {isImportCsvModalOpen && (
        <ImportCsvModal
          isOpen={isImportCsvModalOpen}
          onClose={() => setIsImportCsvModalOpen(false)}
          onImport={(imported) => {
            const locObj = AUTHENTIC_LOCATIONS.find((l) => l.id === multiLocationId);
            const locName = locObj ? locObj.name : 'Showroom';
            const mapped: MultipleAssemblyItem[] = imported.map((imp, idx) => ({
              id: `csv-it-${Date.now()}-${idx}`,
              productId: Math.floor(Math.random() * 90000),
              code: imp.code || `CSV-ITEM-${idx + 1}`,
              description: imp.description || `Imported Item ${idx + 1}`,
              qty: imp.qty || 10,
              unit: imp.unit || 'JAR',
              locationId: multiLocationId || 2,
              locationName: locName,
              date: multiAssemblyDate,
              expiryDate: '2028-07-31',
              unitCost: 65000
            }));
            setMultiItems((prev) => [...prev, ...mapped]);
            setIsImportCsvModalOpen(false);
            showToast(`Imported ${mapped.length} item(s) from CSV.`);
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// SUB-MODAL 1: PREVIEW SINGLE PRODUCTIONS MODAL
// ============================================================================
function PreviewSingleProductionsModal({
isOpen,
  onClose,
  records,
  onOpenRecord,
  onDeleteRecord,
  onPostRecord
}: {
  isOpen: boolean;
  onClose: () => void;
  records: SingleAssemblyRecord[];
  onOpenRecord: (record: SingleAssemblyRecord) => void;
  onDeleteRecord: (id: number) => void;
  onPostRecord: (id: number) => void;
}) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'POSTED' | 'DRAFT'>('ALL');

  if (!isOpen) return null;

  const filtered = records.filter((r) => {
    const matchSearch =
      r.productDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toString().includes(searchTerm);
    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'POSTED' && r.posted === -1) ||
      (statusFilter === 'DRAFT' && r.posted !== -1);
    return matchSearch && matchStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-in font-sans">
        {/* Modal Header */}
        <div className="bg-primary text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-200" />
            <h2 className="text-sm font-bold tracking-wide">
              Preview Item Assembly Records (Live Omega Data)
            </h2>
          </div>
          <button onClick={onClose} className="text-white hover:opacity-75 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder={t('search_by_id_item_name_code', 'Search by ID, item name, code...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-semibold">{t('status', 'Status:')}</span>
            <div className="flex rounded border border-slate-300 overflow-hidden text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 font-medium ${
                  statusFilter === 'ALL' ? 'bg-primary text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {t('all', 'All')}
              </button>
              <button
                onClick={() => setStatusFilter('POSTED')}
                className={`px-3 py-1 font-medium ${
                  statusFilter === 'POSTED' ? 'bg-primary text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {t('posted', 'Posted')}
              </button>
              <button
                onClick={() => setStatusFilter('DRAFT')}
                className={`px-3 py-1 font-medium ${
                  statusFilter === 'DRAFT' ? 'bg-primary text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {t('draft', 'Draft')}
              </button>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-2.5 px-3">{t('id', 'ID')}</th>
                <th className="py-2.5 px-3">{t('date', 'Date')}</th>
                <th className="py-2.5 px-3">{t('branch', 'Branch')}</th>
                <th className="py-2.5 px-3">{t('location', 'Location')}</th>
                <th className="py-2.5 px-3">{t('assembled_item', 'Assembled Item')}</th>
                <th className="py-2.5 px-3 text-right">{t('qty', 'Qty')}</th>
                <th className="py-2.5 px-3 text-right">{t('total_cost', 'Total Cost')}</th>
                <th className="py-2.5 px-3 text-center">{t('status', 'Status')}</th>
                <th className="py-2.5 px-3 text-right">{t('actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                    {t('no_matching_item_assembly_records_found', 'No matching item assembly records found.')}
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">#{rec.id}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{rec.date}</td>
                    <td className="py-2.5 px-3 text-slate-700">{rec.branchName}</td>
                    <td className="py-2.5 px-3 text-slate-700">{rec.locationName}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {rec.productDescription}
                      <span className="text-[10px] text-slate-400 font-mono ml-2">({rec.productCode})</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                      {rec.qty} {rec.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                      {rec.totalCost.toLocaleString()} LBP
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {rec.posted === -1 ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                          {t('posted', 'POSTED')}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300">
                          {t('draft', 'DRAFT')}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenRecord(rec)}
                          className="px-2 py-1 bg-primary hover:bg-primary/90 text-white rounded text-[11px] font-bold"
                          title={t('open_in_workstation', 'Open in workstation')}
                        >
                          {t('open', 'Open')}
                        </button>
                        {rec.posted !== -1 && (
                          <button
                            type="button"
                            onClick={() => onPostRecord(rec.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold"
                            title={t('post_assembly', 'Post assembly')}
                          >
                            {t('post', 'Post')}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteRecord(rec.id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title={t('delete_record', 'Delete record')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filtered.length} of {records.length} records.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded cursor-pointer"
          >
            {t('close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-MODAL 2: PREVIEW MULTIPLE PRODUCTIONS MODAL
// ============================================================================
function PreviewMultipleProductionsModal({
isOpen,
  onClose,
  records,
  onOpenRecord,
  onDeleteRecord
}: {
  isOpen: boolean;
  onClose: () => void;
  records: MultipleAssemblyRecord[];
  onOpenRecord: (record: MultipleAssemblyRecord) => void;
  onDeleteRecord: (id: number) => void;
}) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden animate-scale-in font-sans">
        <div className="bg-primary text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-200" />
            <h2 className="text-sm font-bold tracking-wide">
              Preview Multiple Item Assembly (Omega Live Data)
            </h2>
          </div>
          <button onClick={onClose} className="text-white hover:opacity-75 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-2.5 px-3">{t('id', 'ID')}</th>
                <th className="py-2.5 px-3">{t('multiple_assembly_name', 'Multiple Assembly Name')}</th>
                <th className="py-2.5 px-3">{t('date', 'Date')}</th>
                <th className="py-2.5 px-3">{t('branch', 'Branch')}</th>
                <th className="py-2.5 px-3">{t('location', 'Location')}</th>
                <th className="py-2.5 px-3 text-center">{t('items_count', 'Items Count')}</th>
                <th className="py-2.5 px-3 text-center">{t('status', 'Status')}</th>
                <th className="py-2.5 px-3 text-right">{t('actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700">#{r.id}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{r.name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{r.date}</td>
                  <td className="py-2.5 px-3 text-slate-700">{r.branchName}</td>
                  <td className="py-2.5 px-3 text-slate-700">{r.locationName}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                    {r.items.length} items
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                      {t('posted', 'POSTED')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenRecord(r)}
                        className="px-2 py-1 bg-primary hover:bg-primary/90 text-white rounded text-[11px] font-bold cursor-pointer"
                      >
                        {t('load_items', 'Load Items')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteRecord(r.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs cursor-pointer"
          >
            {t('close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-MODAL 3: ADD LOCATION MODAL
// ============================================================================
function AddLocationModal({
isOpen,
  onClose,
  onAddLocation
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddLocation: (name: string) => void;
}) {
  const { t } = useLanguage();
  const [locationName, setLocationName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden animate-scale-in font-sans">
        <div className="bg-primary text-white px-5 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">{t('add_location', 'Add Location')}</h2>
          <button onClick={onClose} className="text-white hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('location_description', 'Location Description*')}
            </label>
            <input
              type="text"
              placeholder={t('eg_packing_room_cold_store_2', 'e.g. Packing Room / Cold Store 2')}
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded"
            >
              {t('cancel', 'Cancel')}
            </button>
            <button
              onClick={() => {
                if (locationName.trim()) {
                  onAddLocation(locationName.trim());
                }
              }}
              disabled={!locationName.trim()}
              className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded disabled:opacity-50"
            >
              {t('save_location', 'Save Location')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-MODAL 4: IMPORT CSV MODAL
// ============================================================================
function ImportCsvModal({
isOpen,
  onClose,
  onImport
}: {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: any[]) => void;
}) {
  const { t } = useLanguage();
  const [csvText, setCsvText] = useState('');

  if (!isOpen) return null;

  const handleParseCsv = () => {
    if (!csvText.trim()) {
      // Mock default CSV import items
      onImport([
        { code: 'ART300G*12', description: 'صندوق زعتر أحمر حلبي 300غ*12', qty: 25, unit: 'BOX' },
        { code: 'OST600GJAR', description: 'زعتر بلدي جنوبي 600غ', qty: 40, unit: 'JAR' },
        { code: 'EVOO-1L-CAN', description: 'زيت زيتون بكر ممتاز تنكة 1 ليتر', qty: 20, unit: 'CAN' }
      ]);
      return;
    }

    const lines = csvText.trim().split('\n');
    const parsed = lines.slice(1).map((line, idx) => {
      const parts = line.split(',');
      return {
        code: parts[0]?.trim() || `ITM-${idx + 1}`,
        description: parts[1]?.trim() || `Item ${idx + 1}`,
        qty: parseFloat(parts[2]?.trim()) || 1,
        unit: parts[3]?.trim() || 'JAR'
      };
    });

    onImport(parsed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden animate-scale-in font-sans">
        <div className="bg-primary text-white px-5 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">{t('import_csv_multiple_item_assembly', 'Import CSV - Multiple Item Assembly')}</h2>
          <button onClick={onClose} className="text-white hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-600">
            Paste CSV data below or click &quot;Import Sample Data&quot;. Required columns: <code>{t('codedescriptionqtyunit', 'Code,Description,Qty,Unit')}</code>
          </p>
          <textarea
            rows={5}
            placeholder="Code,Description,Qty,Unit&#10;ART300G*12,صندوق زعتر أحمر حلبي 300غ*12,25,BOX&#10;OST600GJAR,زعتر بلدي جنوبي 600غ,40,JAR"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full border border-slate-300 rounded p-2.5 font-mono text-xs focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => {
                setCsvText(
                  'Code,Description,Qty,Unit\nART300G*12,صندوق زعتر أحمر حلبي 300غ*12,25,BOX\nOST600GJAR,زعتر بلدي جنوبي 600غ,40,JAR\nEVOO-1L-CAN,زيت زيتون بكر ممتاز تنكة 1 ليتر,20,CAN'
                );
              }}
              className="text-blue-600 hover:underline font-semibold"
            >
              {t('load_sample_template', 'Load Sample Template')}
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                onClick={handleParseCsv}
                className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white font-bold rounded"
              >
                {t('import_items', 'Import Items')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
