'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Info,
  Search,
  Filter,
  X,
  Plus,
  Save,
  RotateCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ArrowRightCircle,
  Ban,
  History,
  Trash2,
  Check,
  FolderOpen,
  LineChart,
  Table as TableIcon,
  Send,
  Sliders,
  CheckCircle2,
  Mail,
  FileText,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

// ============================================================================
// OMEGA LIVE CATALOG & SEED DATA
// ============================================================================

interface ReorderProduct {
  id: number;
  code: string;
  description: string;
  supplierId: number;
  supplierName: string;
  categoryId: number;
  categoryName: string;
  groupId: number;
  groupName: string;
  unit: string;
  qtyOH: number;
  minStock: number;
  maxStock: number;
  leadTimeDays: number;
  unitCost: number;
  recommendedQty: number;
  isExcluded?: boolean;
}

const SEED_SUPPLIERS = [
  { id: 0, name: 'All Suppliers' },
  { id: 5, name: 'SOOL' },
  { id: 1, name: 'Zahwe' },
  { id: 12, name: 'الضيعة' },
  { id: 11, name: 'مؤسسة عبده للتجارة' },
  { id: 9, name: 'Abbas & Hussein Dirani' },
  { id: 8, name: 'Abbas Dirani' },
  { id: 6, name: 'B GROUP' },
  { id: 3, name: 'C-Way Trading' },
  { id: 7, name: 'Clatchy' },
  { id: 2, name: 'Ezzeddin' },
  { id: 10, name: 'Koubeissi Est.' },
  { id: 4, name: 'Mrs Randa' },
  { id: 14, name: 'Safa Bakery' },
  { id: 13, name: 'Sedi Hisham' }
];

const SEED_BRANCHES = [
  { id: 1, name: 'Zeit w zaytoun ljanoub' },
  { id: 2, name: 'Choueifat Main Facility' },
  { id: 0, name: 'All Branches' }
];

const SEED_CATEGORIES = [
  { id: 0, name: 'All Categories' },
  { id: 2, name: 'مفرق' },
  { id: 3, name: 'جملة' },
  { id: 4, name: 'عروض' },
  { id: 5, name: 'Raw Materials' }
];

const SEED_GROUPS: Record<number, string[]> = {
  2: [
    'All Groups',
    'مرطبان',
    'كيلو مفرق',
    'محمصة مفرق',
    'زيوت مفرق',
    'مجففات',
    'براد',
    'بهارات مفرق',
    'فواكه مجففة مفرق',
    'عسل مفرق',
    'مربيات مفرق',
    'مونة بلدية مفرق',
    'معطرات ومدبسات مفرق'
  ],
  3: [
    'All Groups',
    'زيوت جملة',
    'تنك 16 ليتر جملة',
    'حبوب فلت جملة',
    'كرتون زجاج جملة'
  ],
  4: [
    'All Groups',
    'عروض العيد',
    'عروض باقات المونة',
    'عروض زيت الزيتون التوفيرية'
  ],
  5: [
    'All Groups',
    'تنك معدني خام',
    'قوارير زجاج ماراسكا',
    'أغطية وسدادات فلين',
    'كرتون تعبئة ومطبوعات'
  ]
};

const INITIAL_PRODUCTS: ReorderProduct[] = [
  {
    id: 2,
    code: 'لبنة بلدية',
    description: 'لبنة بلدية طازجة في زيت الزيتون',
    supplierId: 12,
    supplierName: 'الضيعة',
    categoryId: 2,
    categoryName: 'مفرق',
    groupId: 35,
    groupName: 'براد',
    unit: 'JAR',
    qtyOH: 0,
    minStock: 15,
    maxStock: 40,
    leadTimeDays: 2,
    unitCost: 292500,
    recommendedQty: 25
  },
  {
    id: 3,
    code: 'EVOO17.5L16KGR',
    description: 'تنكة زيت زيتون خضير بلدي 17.5 ليتر (16 كيلو)',
    supplierId: 5,
    supplierName: 'SOOL',
    categoryId: 2,
    categoryName: 'مفرق',
    groupId: 2,
    groupName: 'زيوت مفرق',
    unit: 'TIN',
    qtyOH: -11,
    minStock: 20,
    maxStock: 60,
    leadTimeDays: 5,
    unitCost: 7654500,
    recommendedQty: 31
  },
  {
    id: 4,
    code: 'EVOO8.75L8KG',
    description: 'نصف تنكة زيت زيتون خضير بلدي 8.5 ليتر (8 كيلو)',
    supplierId: 5,
    supplierName: 'SOOL',
    categoryId: 2,
    categoryName: 'مفرق',
    groupId: 2,
    groupName: 'زيوت مفرق',
    unit: 'TIN',
    qtyOH: -15,
    minStock: 25,
    maxStock: 75,
    leadTimeDays: 4,
    unitCost: 4010625,
    recommendedQty: 40
  },
  {
    id: 5,
    code: 'EVOO1KGR',
    description: 'زيت زيتون خضير بلدي 1 ليتر قزاز',
    supplierId: 5,
    supplierName: 'SOOL',
    categoryId: 2,
    categoryName: 'مفرق',
    groupId: 2,
    groupName: 'زيوت مفرق',
    unit: 'BTL',
    qtyOH: -126.92,
    minStock: 100,
    maxStock: 300,
    leadTimeDays: 3,
    unitCost: 489500,
    recommendedQty: 226
  },
  {
    id: 6,
    code: 'EVOO250MLDEMIJOHN100',
    description: 'الفية زيت زيتون خضير بلدي 250 مل',
    supplierId: 5,
    supplierName: 'SOOL',
    categoryId: 2,
    categoryName: 'مفرق',
    groupId: 2,
    groupName: 'زيوت مفرق',
    unit: 'BTL',
    qtyOH: -6,
    minStock: 30,
    maxStock: 90,
    leadTimeDays: 3,
    unitCost: 160335,
    recommendedQty: 36
  },
  {
    id: 7,
    code: 'EVOO500MLDEMIJOHN104',
    description: 'الفية زيت زيتون خضير بلدي 500 مل',
    supplierId: 1,
    supplierName: 'Zahwe',
    categoryId: 2,
    categoryName: 'مفرق',
    groupId: 2,
    groupName: 'زيوت مفرق',
    unit: 'BTL',
    qtyOH: -7,
    minStock: 40,
    maxStock: 120,
    leadTimeDays: 4,
    unitCost: 253260,
    recommendedQty: 47
  },
  {
    id: 8,
    code: 'EVOO750MLDEMIJOHN105',
    description: 'الفية زيت زيتون خضير بلدي 750 مل',
    supplierId: 5,
    supplierName: 'SOOL',
    categoryId: 2,
    categoryName: 'مفرق',
    groupId: 2,
    groupName: 'زيوت مفرق',
    unit: 'BTL',
    qtyOH: -2,
    minStock: 25,
    maxStock: 80,
    leadTimeDays: 3,
    unitCost: 525600,
    recommendedQty: 27
  },
  {
    id: 9,
    code: 'EVOO1500MLDEMIJOHN15',
    description: 'الفية زيت زيتون خضير بلدي 1500 مل',
    supplierId: 5,
    supplierName: 'SOOL',
    categoryId: 2,
    categoryName: 'مفرق',
    groupId: 2,
    groupName: 'زيوت مفرق',
    unit: 'BTL',
    qtyOH: 0,
    minStock: 15,
    maxStock: 50,
    leadTimeDays: 4,
    unitCost: 1080000,
    recommendedQty: 15
  },
  {
    id: 10,
    code: 'EVOO2850MLDEMIJOHN30',
    description: 'الفية زيت زيتون خضير بلدي 2850 مل',
    supplierId: 5,
    supplierName: 'SOOL',
    categoryId: 2,
    categoryName: 'مفرق',
    groupId: 2,
    groupName: 'زيوت مفرق',
    unit: 'BTL',
    qtyOH: -6,
    minStock: 15,
    maxStock: 45,
    leadTimeDays: 4,
    unitCost: 1606312,
    recommendedQty: 21
  },
  {
    id: 11,
    code: 'VOO17.5L16KGR',
    description: 'تنكة زيت زيتون فرجن بلدي 17.5 ليتر(16 كيلو)',
    supplierId: 5,
    supplierName: 'SOOL',
    categoryId: 3,
    categoryName: 'جملة',
    groupId: 3,
    groupName: 'تنك 16 ليتر جملة',
    unit: 'TIN',
    qtyOH: -79,
    minStock: 50,
    maxStock: 150,
    leadTimeDays: 6,
    unitCost: 5125230,
    recommendedQty: 129
  },
  {
    id: 15,
    code: 'CWV250MLB103',
    description: 'خل ابيض 250مل',
    supplierId: 5,
    supplierName: 'SOOL',
    categoryId: 2,
    categoryName: 'مفرق',
    groupId: 5,
    groupName: 'معطرات ومدبسات مفرق',
    unit: 'BTL',
    qtyOH: 0,
    minStock: 48,
    maxStock: 144,
    leadTimeDays: 2,
    unitCost: 26676,
    recommendedQty: 48
  },
  {
    id: 16,
    code: 'CWV500MLB106',
    description: 'خل ابيض 500مل',
    supplierId: 5,
    supplierName: 'SOOL',
    categoryId: 2,
    categoryName: 'مفرق',
    groupId: 61,
    groupName: 'معطرات ومدبسات مفرق',
    unit: 'BTL',
    qtyOH: -6,
    minStock: 36,
    maxStock: 108,
    leadTimeDays: 2,
    unitCost: 45692,
    recommendedQty: 42
  },
  {
    id: 17,
    code: 'CARW250GB103',
    description: 'ماء ورد 250مل',
    supplierId: 5,
    supplierName: 'SOOL',
    categoryId: 2,
    categoryName: 'مفرق',
    groupId: 5,
    groupName: 'معطرات ومدبسات مفرق',
    unit: 'BTL',
    qtyOH: 0,
    minStock: 30,
    maxStock: 90,
    leadTimeDays: 2,
    unitCost: 25860,
    recommendedQty: 30
  },
  {
    id: 18,
    code: 'CARW500GB106',
    description: 'ماء ورد 500مل',
    supplierId: 5,
    supplierName: 'SOOL',
    categoryId: 2,
    categoryName: 'مفرق',
    groupId: 61,
    groupName: 'معطرات ومدبسات مفرق',
    unit: 'BTL',
    qtyOH: -5,
    minStock: 24,
    maxStock: 72,
    leadTimeDays: 2,
    unitCost: 43744,
    recommendedQty: 29
  },
  {
    id: 19,
    code: 'COBW250MLB103',
    description: 'ماء زهر 250مل',
    supplierId: 5,
    supplierName: 'SOOL',
    categoryId: 2,
    categoryName: 'مفرق',
    groupId: 5,
    groupName: 'معطرات ومدبسات مفرق',
    unit: 'BTL',
    qtyOH: 0,
    minStock: 36,
    maxStock: 100,
    leadTimeDays: 2,
    unitCost: 26035,
    recommendedQty: 36
  }
];

interface CartItem {
  product: ReorderProduct;
  qtyToOrder: number;
}

interface SavedReorder {
  id: number;
  reorderId: number;
  date: string;
  branchName: string;
  branchId?: number;
  supplierName: string;
  quotationStatus: number;
  quotationDate: string | null;
  poStatus: number;
  poDate: string | null;
  items: CartItem[];
}

// Robust date string to timestamp parser supporting DD-MMM-YYYY and YYYY-MM-DD
const parseDateToTimestamp = (dateStr: string): number => {
  if (!dateStr) return 0;
  // If ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
  }
  // If DD-MMM-YYYY (e.g. 10-Jul-2026, 08-Jul-2026, 25-Jun-2026)
  const match = dateStr.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (match) {
    const d = parseInt(match[1], 10);
    const mStr = match[2].toLowerCase();
    const y = parseInt(match[3], 10);
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const m = months[mStr] !== undefined ? months[mStr] : 0;
    return new Date(y, m, d, 0, 0, 0, 0).getTime();
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime())
    ? 0
    : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0).getTime();
};

const INITIAL_SAVED_REORDERS: SavedReorder[] = [
  {
    id: 72,
    reorderId: 24,
    date: '10-Jul-2026',
    branchName: 'Zeit w zaytoun ljanoub',
    branchId: 1,
    supplierName: 'SOOL',
    quotationStatus: 0,
    quotationDate: null,
    poStatus: 1,
    poDate: '10-Jul-2026',
    items: []
  },
  {
    id: 71,
    reorderId: 23,
    date: '08-Jul-2026',
    branchName: 'Zeit w zaytoun ljanoub',
    branchId: 1,
    supplierName: 'SOOL',
    quotationStatus: 0,
    quotationDate: null,
    poStatus: 1,
    poDate: '08-Jul-2026',
    items: []
  },
  {
    id: 70,
    reorderId: 22,
    date: '25-Jun-2026',
    branchName: 'Zeit w zaytoun ljanoub',
    branchId: 1,
    supplierName: 'Zahwe',
    quotationStatus: 1,
    quotationDate: '25-Jun-2026',
    poStatus: 0,
    poDate: null,
    items: []
  }
];

export default function ReorderGuideView() {
  // Top Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(0);
  const [selectedBranchId, setSelectedBranchId] = useState<number>(1);
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedSupplierId, setAppliedSupplierId] = useState<number>(0);
  const [appliedBranchId, setAppliedBranchId] = useState<number>(1);

  // Recommendation Options
  const [minStockEnabled, setMinStockEnabled] = useState(true);
  const [salesHistoryEnabled, setSalesHistoryEnabled] = useState(false);
  const [salesHistoryDuration, setSalesHistoryDuration] = useState('1 month');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Carousel & Hierarchy Tabs
  const [hideCarousel, setHideCarousel] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(2); // Default to مفرق
  const [selectedGroupName, setSelectedGroupName] = useState<string>('All Groups');

  // Products & Order quantities
  const [products, setProducts] = useState<ReorderProduct[]>(INITIAL_PRODUCTS);
  const [orderQuantities, setOrderQuantities] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    INITIAL_PRODUCTS.forEach((p) => {
      initial[p.id] = p.recommendedQty;
    });
    return initial;
  });
  const [selectedProductIds, setSelectedProductIds] = useState<Record<number, boolean>>({});
  const [showCategoryGroupHeader, setShowCategoryGroupHeader] = useState<boolean>(true);

  // Shopping Cart State
  const [cartItems, setCartItems] = useState<Record<number, CartItem>>({});
  const [currentReorderId, setCurrentReorderId] = useState<number | null>(null);
  const [savedReorders, setSavedReorders] = useState<SavedReorder[]>(INITIAL_SAVED_REORDERS);

  // Modals States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyProduct, setHistoryProduct] = useState<ReorderProduct | null>(null);
  const [historyActiveTab, setHistoryActiveTab] = useState<'dashboard' | 'grid'>('dashboard');
  const [isMaxStockModalOpen, setIsMaxStockModalOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [selectedPOSupplierId, setSelectedPOSupplierId] = useState<number | null>(null);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [quotationSupplierName, setQuotationSupplierName] = useState('');

  // Settings State
  const [showProductCode, setShowProductCode] = useState(false);
  const [hideGroupHeader, setHideGroupHeader] = useState(false);
  const [updateRecommendedQtyForFuture, setUpdateRecommendedQtyForFuture] = useState(false);
  const [defaultQuantity, setDefaultQuantity] = useState<number>(10);

  // Toast Notice State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Preview Modal Filters
  const [previewBranchId, setPreviewBranchId] = useState<number>(0); // 0 = All Branches
  const [previewFromDate, setPreviewFromDate] = useState<string>('');
  const [previewToDate, setPreviewToDate] = useState<string>('');
  const [previewExpandedRow, setPreviewExpandedRow] = useState<number | null>(null);

  // Applied Preview Filter State
  const [appliedPreviewFilters, setAppliedPreviewFilters] = useState<{
    branchId: number;
    fromDate: string;
    toDate: string;
  }>({
    branchId: 0,
    fromDate: '',
    toDate: ''
  });

  const handleApplyPreviewFilter = () => {
    setAppliedPreviewFilters({
      branchId: previewBranchId,
      fromDate: previewFromDate,
      toDate: previewToDate
    });
    showToast('Filters applied to shopping carts');
  };

  const handleClearPreviewFilter = () => {
    setPreviewBranchId(0);
    setPreviewFromDate('');
    setPreviewToDate('');
    setAppliedPreviewFilters({
      branchId: 0,
      fromDate: '',
      toDate: ''
    });
    showToast('Filters cleared. Showing all shopping carts.');
  };

  const filteredSavedReorders = useMemo(() => {
    return savedReorders.filter((row) => {
      // 1. Branch filter
      if (appliedPreviewFilters.branchId !== 0) {
        const branchObj = SEED_BRANCHES.find((b) => b.id === appliedPreviewFilters.branchId);
        if (branchObj && row.branchName !== branchObj.name && row.branchId !== appliedPreviewFilters.branchId) {
          return false;
        }
      }

      // 2. Date parsing & range check
      const rowTs = parseDateToTimestamp(row.date);

      if (appliedPreviewFilters.fromDate) {
        const fromTs = parseDateToTimestamp(appliedPreviewFilters.fromDate);
        if (fromTs > 0 && rowTs < fromTs) {
          return false;
        }
      }

      if (appliedPreviewFilters.toDate) {
        const toTs = parseDateToTimestamp(appliedPreviewFilters.toDate);
        if (toTs > 0 && rowTs > (toTs + 86399999)) {
          return false;
        }
      }

      return true;
    });
  }, [savedReorders, appliedPreviewFilters]);

  // Quotation Email Form
  const [emailTo, setEmailTo] = useState('supplier@omega-levant.com');
  const [emailFrom, setEmailFrom] = useState('orders@vanguard.com');
  const [emailCc, setEmailCc] = useState('');
  const [emailBcc, setEmailBcc] = useState('');
  const [emailSubject, setEmailSubject] = useState('Quotation Request - Vanguard ERP Reorder Guide');
  const [emailMessage, setEmailMessage] = useState(
    'Dear Supplier,\n\nPlease find our requested quotation for the replenishment items in our shopping cart attached.\nKindly confirm availability and current prices at your earliest convenience.\n\nBest regards,\nVanguard Purchasing Department'
  );
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  // Carousel Scroll Refs
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const groupScrollRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, offset: number) => {
    if (ref.current) {
      ref.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Filter Items
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Excluded
      if (p.isExcluded) return false;

      // Search Query
      if (appliedSearch.trim()) {
        const query = appliedSearch.toLowerCase().trim();
        const matchCode = p.code.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query);
        if (!matchCode && !matchDesc) return false;
      }

      // Supplier
      if (appliedSupplierId !== 0 && p.supplierId !== appliedSupplierId) {
        return false;
      }

      // Category
      if (selectedCategoryId !== 0 && p.categoryId !== selectedCategoryId) {
        return false;
      }

      // Group
      if (selectedGroupName !== 'All Groups' && p.groupName !== selectedGroupName) {
        return false;
      }

      return true;
    });
  }, [products, appliedSearch, appliedSupplierId, selectedCategoryId, selectedGroupName]);

  // Group filtered items by Supplier and Group for display
  const groupedProducts = useMemo(() => {
    const map: Record<string, ReorderProduct[]> = {};
    filteredProducts.forEach((p) => {
      const groupKey = p.groupName || 'General';
      if (!map[groupKey]) map[groupKey] = [];
      map[groupKey].push(p);
    });
    return map;
  }, [filteredProducts]);

  // Cart Items grouped by Supplier
  const cartGroupedBySupplier = useMemo(() => {
    const map: Record<number, { supplierName: string; items: CartItem[]; subtotal: number }> = {};
    Object.values(cartItems).forEach((item) => {
      const sId = item.product.supplierId;
      if (!map[sId]) {
        map[sId] = {
          supplierName: item.product.supplierName,
          items: [],
          subtotal: 0
        };
      }
      map[sId].items.push(item);
      map[sId].subtotal += item.qtyToOrder * item.product.unitCost;
    });
    return map;
  }, [cartItems]);

  const cartTotalBeforeTax = useMemo(() => {
    return Object.values(cartItems).reduce(
      (sum, item) => sum + item.qtyToOrder * item.product.unitCost,
      0
    );
  }, [cartItems]);

  // Handlers
  const handleApplyFilter = () => {
    setAppliedSearch(searchQuery);
    setAppliedSupplierId(selectedSupplierId);
    setAppliedBranchId(selectedBranchId);
    showToast('Filters applied successfully');
  };

  const handleClearFilter = () => {
    setSearchQuery('');
    setSelectedSupplierId(0);
    setSelectedBranchId(1);
    setAppliedSearch('');
    setAppliedSupplierId(0);
    setAppliedBranchId(1);
    setSelectedCategoryId(2);
    setSelectedGroupName('All Groups');
    showToast('Filters cleared');
  };

  const handleGeneratePlan = () => {
    setIsGeneratingPlan(true);
    setTimeout(() => {
      setProducts((prev) =>
        prev.map((p) => {
          let rec = p.recommendedQty;
          if (minStockEnabled && p.qtyOH < p.minStock) {
            rec = Math.max(p.maxStock - p.qtyOH, p.minStock);
          }
          if (salesHistoryEnabled) {
            const factor =
              salesHistoryDuration === '1 year'
                ? 1.5
                : salesHistoryDuration === '6 month'
                ? 1.3
                : salesHistoryDuration === '3 month'
                ? 1.15
                : 1.0;
            rec = Math.round(rec * factor);
          }
          return { ...p, recommendedQty: rec };
        })
      );
      setIsGeneratingPlan(false);
      showToast('Reorder Plan generated based on chosen criteria');
    }, 600);
  };

  const handleUpdateQty = (productId: number, delta: number) => {
    setOrderQuantities((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleSetQtyDirect = (productId: number, val: number) => {
    setOrderQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, isNaN(val) ? 0 : val)
    }));
  };

  const handleToggleSelectAll = (checked: boolean) => {
    const updated: Record<number, boolean> = {};
    if (checked) {
      filteredProducts.forEach((p) => {
        updated[p.id] = true;
      });
    }
    setSelectedProductIds(updated);
  };

  const handleToggleSelectItem = (productId: number) => {
    setSelectedProductIds((prev) => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleAddToCart = (product: ReorderProduct) => {
    const qty = orderQuantities[product.id] || product.recommendedQty || 1;
    if (qty <= 0) {
      showToast('Please enter a valid Quantity to Order');
      return;
    }
    setCartItems((prev) => ({
      ...prev,
      [product.id]: {
        product,
        qtyToOrder: (prev[product.id]?.qtyToOrder || 0) + qty
      }
    }));
    showToast(`Added ${qty} ${product.unit} of "${product.description}" to cart`);
  };

  const handleAddAllSelectedToCart = () => {
    const selectedIds = Object.keys(selectedProductIds)
      .filter((k) => selectedProductIds[Number(k)])
      .map(Number);

    if (selectedIds.length === 0) {
      showToast('Please select products using the checkboxes first');
      return;
    }

    let addedCount = 0;
    setCartItems((prev) => {
      const next = { ...prev };
      selectedIds.forEach((id) => {
        const prod = products.find((p) => p.id === id);
        if (prod) {
          const qty = orderQuantities[id] || prod.recommendedQty || 1;
          next[id] = {
            product: prod,
            qtyToOrder: (next[id]?.qtyToOrder || 0) + qty
          };
          addedCount++;
        }
      });
      return next;
    });

    setSelectedProductIds({});
    showToast(`Added ${addedCount} selected items to Shopping Cart`);
  };

  const handleUpdateCartItemQty = (productId: number, delta: number) => {
    setCartItems((prev) => {
      const existing = prev[productId];
      if (!existing) return prev;
      const nextQty = existing.qtyToOrder + delta;
      if (nextQty <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return {
        ...prev,
        [productId]: { ...existing, qtyToOrder: nextQty }
      };
    });
  };

  const handleRemoveCartItem = (productId: number) => {
    setCartItems((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const handleRemoveSupplierFromCart = (supplierId: number) => {
    setCartItems((prev) => {
      const copy: Record<number, CartItem> = {};
      Object.entries(prev).forEach(([key, val]) => {
        if (val.product.supplierId !== supplierId) {
          copy[Number(key)] = val;
        }
      });
      return copy;
    });
    showToast('Removed supplier section from cart');
  };

  const handleStartNewReorder = () => {
    setCartItems({});
    setCurrentReorderId(null);
    showToast('New Reorder Guide session initiated. Cart reset.');
  };

  const handleSaveCart = () => {
    if (Object.keys(cartItems).length === 0) {
      showToast('Cannot save an empty shopping cart');
      return;
    }
    const newId = (savedReorders[0]?.reorderId || 24) + 1;
    const newRecord: SavedReorder = {
      id: 70 + newId,
      reorderId: newId,
      date: '10-Sep-2026',
      branchName: 'Zeit w zaytoun ljanoub',
      supplierName: Object.values(cartGroupedBySupplier)[0]?.supplierName || 'Multiple Suppliers',
      quotationStatus: 0,
      quotationDate: null,
      poStatus: 0,
      poDate: null,
      items: Object.values(cartItems)
    };

    setSavedReorders((prev) => [newRecord, ...prev]);
    setCurrentReorderId(newId);
    showToast(`Shopping Cart saved successfully! Reference ID: #${newId}`);
  };

  const handleExcludeProduct = (productId: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isExcluded: true } : p))
    );
    showToast('Product excluded from future recommendation calculations');
  };

  const handleOpenHistory = (product: ReorderProduct) => {
    setHistoryProduct(product);
    setIsHistoryOpen(true);
  };

  const handleOpenPO = (supplierId: number) => {
    setSelectedPOSupplierId(supplierId);
    setIsPOModalOpen(true);
  };

  const handleConfirmCreatePO = () => {
    setIsPOModalOpen(false);
    showToast(`Purchase Order created successfully for ${SEED_SUPPLIERS.find(s => s.id === selectedPOSupplierId)?.name || 'Supplier'}! Committed to PO records.`);
  };

  const handleOpenQuotation = (supplierName: string) => {
    setQuotationSupplierName(supplierName);
    setEmailSubject(`Quotation Request for ${supplierName} - Vanguard ERP`);
    setIsQuotationModalOpen(true);
  };

  const handleSendQuotationEmail = () => {
    setIsQuotationModalOpen(false);
    showToast(`Quotation request sent to ${emailTo} successfully!`);
  };

  const handleSaveSettings = () => {
    setIsSettingsOpen(false);
    showToast('Reorder Guide Settings saved successfully');
  };

  const availableGroups = useMemo(() => {
    return SEED_GROUPS[selectedCategoryId] || ['All Groups'];
  }, [selectedCategoryId]);

  const allSelected = useMemo(() => {
    if (filteredProducts.length === 0) return false;
    return filteredProducts.every((p) => selectedProductIds[p.id]);
  }, [filteredProducts, selectedProductIds]);

  return (
    <div className="w-full bg-[#f8f9fa] min-h-screen text-[#333] font-sans pb-16 pt-2">
      {/* GLOBAL NOTIFICATION TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#195a96] text-white px-5 py-3 rounded-lg shadow-2xl animate-fade-in border border-blue-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span className="text-sm font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="px-4 max-w-[1720px] mx-auto space-y-2">
        {/* =========================================================================
            1. PAGE TITLE & HELP TOOLTIP
            ========================================================================= */}
        <div className="flex items-center gap-2 mb-2 relative group">
          <h1 className="text-[20px] font-bold text-[#333] flex items-center gap-2">
            <span>Reorder Guide</span>
            <div className="relative cursor-pointer inline-flex items-center text-slate-500 hover:text-[#195a96]">
              <Info className="w-4 h-4" />
              <div className="absolute left-6 top-0 hidden group-hover:block z-50 w-80 p-3 bg-white text-slate-700 text-xs rounded-lg shadow-xl border border-slate-200 leading-relaxed pointer-events-none">
                The Reorder Guide helps you restock your inventory by recommending optimal reorder quantities based on minimum stock levels, sales history, or a combination of both.
                <br /><br />
                Items without sales history are not recommended. Review recommendations, add to cart, and create purchase orders or request quotations directly from suppliers.
              </div>
            </div>
          </h1>
        </div>

        {/* =========================================================================
            2. TOP CONTROLS & FILTER ROW (Screenshot Row 1)
            ========================================================================= */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 w-full">
          {/* Search Box */}
          <div className="flex-1 min-w-[280px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for product description, code or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                className="w-full h-[34px] px-3 pr-8 text-xs bg-white border border-[#ccc] rounded focus:outline-none focus:border-[#337ab7] text-[#555] shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Supplier Dropdown */}
          <div className="w-full lg:w-[260px]">
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
              className="w-full h-[34px] px-2 text-xs bg-white border border-[#ccc] rounded focus:outline-none focus:border-[#337ab7] text-[#555]"
            >
              {SEED_SUPPLIERS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Dropdown */}
          <div className="w-full lg:w-[260px]">
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(Number(e.target.value))}
              className="w-full h-[34px] px-2 text-xs bg-white border border-[#ccc] rounded focus:outline-none focus:border-[#337ab7] text-[#555]"
            >
              {SEED_BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter & Clear Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleApplyFilter}
              className="h-[34px] px-4 bg-[#337ab7] hover:bg-[#286090] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
            <button
              onClick={handleClearFilter}
              title="Clear Filters"
              className="h-[34px] w-[34px] bg-[#a94442] hover:bg-[#843534] text-white text-xs rounded flex items-center justify-center transition shadow-sm cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            3. ACTION BUTTONS ROW (+ New, Preview, Save, Actions ▾)
            ========================================================================= */}
        <div className="flex items-center gap-1.5 pt-1">
          {/* + New Button */}
          <button
            onClick={handleStartNewReorder}
            className="h-[34px] px-3.5 bg-[#5cb85c] hover:bg-[#449d44] text-white text-xs font-bold rounded flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>

          {/* Preview Button */}
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="h-[34px] px-3.5 bg-[#337ab7] hover:bg-[#286090] text-white text-xs font-bold rounded flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveCart}
            className="h-[34px] px-3.5 bg-[#337ab7] hover:bg-[#286090] text-white text-xs font-bold rounded flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          {/* Actions Dropdown Button */}
          <div className="relative group/actions">
            <button
              type="button"
              className="h-[34px] px-3.5 bg-[#337ab7] hover:bg-[#286090] text-white text-xs font-bold rounded flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <span>Actions</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-xl py-1 hidden group-hover/actions:block z-50">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-[#337ab7]" />
                <span>Settings</span>
              </button>
              <button
                onClick={() => setHideCarousel(!hideCarousel)}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
              >
                <span>{hideCarousel ? 'Show Categories Tab' : 'Hide Categories Tab'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. RECOMMENDED QTY TO ORDER OPTIONS ROW (Screenshot Row 3)
            ========================================================================= */}
        <div className="flex flex-wrap items-center gap-4 py-2 text-xs text-[#333] font-medium">
          <span className="font-bold text-slate-700">Recommended Qty to order based on:</span>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={minStockEnabled}
              onChange={(e) => setMinStockEnabled(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-[#337ab7] focus:ring-0"
            />
            <span className="font-semibold">Minimum Stock</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={salesHistoryEnabled}
              onChange={(e) => setSalesHistoryEnabled(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-[#337ab7] focus:ring-0"
            />
            <span className="font-semibold">Based on Sales History</span>
          </label>

          {salesHistoryEnabled && (
            <div className="flex items-center gap-2.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 animate-fade-in">
              <span>(</span>
              {(['1 month', '3 month', '6 month', '1 year'] as const).map((dur) => (
                <label key={dur} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="duration"
                    value={dur}
                    checked={salesHistoryDuration === dur}
                    onChange={(e) => setSalesHistoryDuration(e.target.value)}
                    className="text-[#337ab7]"
                  />
                  <span className="capitalize">{dur}</span>
                </label>
              ))}
              <span>)</span>
            </div>
          )}

          <button
            onClick={handleGeneratePlan}
            disabled={isGeneratingPlan}
            className="h-[32px] px-3.5 bg-[#337ab7] hover:bg-[#286090] text-white text-xs font-bold rounded flex items-center gap-1.5 transition shadow-sm cursor-pointer ml-auto sm:ml-0"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isGeneratingPlan ? 'animate-spin' : ''}`} />
            <span>Generate Reorder Plan</span>
          </button>
        </div>

        {/* =========================================================================
            5. TWO-LEVEL CAROUSEL TABS (Screenshot Rows 4 & 5)
            ========================================================================= */}
        {!hideCarousel && (
          <div className="space-y-1.5 bg-white p-2 rounded-lg border border-[#e0e0e0] shadow-2xs">
            {/* Level 1: Categories Carousel */}
            <div className="relative flex items-center">
              <button
                onClick={() => scrollContainer(categoryScrollRef, -120)}
                className="w-6 h-7 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded flex items-center justify-center text-slate-600 shrink-0 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div
                ref={categoryScrollRef}
                className="flex items-center gap-1 overflow-x-auto no-scrollbar mx-1 scroll-smooth"
              >
                {SEED_CATEGORIES.map((cat) => {
                  const isActive = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setSelectedGroupName('All Groups');
                      }}
                      className={`px-4 py-1.5 text-xs font-bold whitespace-nowrap rounded transition cursor-pointer border ${
                        isActive
                          ? 'bg-amber-50 text-amber-900 border-b-2 border-b-amber-500 border-amber-200 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => scrollContainer(categoryScrollRef, 120)}
                className="w-6 h-7 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded flex items-center justify-center text-slate-600 shrink-0 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Level 2: Subcategories / Groups Carousel */}
            <div className="relative flex items-center pt-0.5 border-t border-slate-100">
              <button
                onClick={() => scrollContainer(groupScrollRef, -120)}
                className="w-6 h-7 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded flex items-center justify-center text-slate-600 shrink-0 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div
                ref={groupScrollRef}
                className="flex items-center gap-1 overflow-x-auto no-scrollbar mx-1 scroll-smooth"
              >
                {availableGroups.map((grp) => {
                  const isActive = selectedGroupName === grp;
                  return (
                    <button
                      key={grp}
                      onClick={() => setSelectedGroupName(grp)}
                      className={`px-3 py-1 text-[11px] font-semibold whitespace-nowrap rounded transition cursor-pointer border ${
                        isActive
                          ? 'bg-[#195a96] text-white border-[#195a96] shadow-2xs'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {grp}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => scrollContainer(groupScrollRef, 120)}
                className="w-6 h-7 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded flex items-center justify-center text-slate-600 shrink-0 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            6. MAIN SPLIT PANELS (RECOMMENDATIONS LEFT & SHOPPING CART RIGHT)
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-1">
          {/* LEFT PANEL: RECOMMENDATION FOR BRANCH (6 cols) */}
          <div className="lg:col-span-6 bg-white border border-[#d2d6de] rounded-sm shadow-2xs overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-[#d3dcef] px-3 py-2 flex items-center justify-between border-b border-[#cbd5e1]">
              <span className="text-xs font-bold text-slate-800">
                Recommandation for branch: {SEED_BRANCHES.find(b => b.id === appliedBranchId)?.name || 'Zeit w zaytoun ljanoub'}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMaxStockModalOpen(true)}
                  className="text-[11px] text-[#337ab7] hover:underline font-semibold cursor-pointer"
                >
                  Update Max Stock
                </button>
                <button
                  onClick={handleAddAllSelectedToCart}
                  title="Add selected items to cart"
                  className="w-6 h-6 bg-[#337ab7] hover:bg-[#286090] text-white rounded-full flex items-center justify-center transition shadow-2xs cursor-pointer"
                >
                  <ArrowRightCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#f4f5f7] border-b border-slate-200 text-slate-700 font-bold sticky top-0 z-10">
                  <tr>
                    <th className="py-2 px-2.5 w-8">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => handleToggleSelectAll(e.target.checked)}
                        className="rounded text-[#337ab7]"
                        title="Select All"
                      />
                    </th>
                    <th className="py-2 px-2">Product Description</th>
                    <th className="py-2 px-2 w-16 text-right">Qty OH</th>
                    <th className="py-2 px-2 w-14">Unit</th>
                    <th className="py-2 px-2 w-28 text-red-600 font-bold">QTY to Order</th>
                    <th className="py-2 px-2 w-32">Supplier</th>
                    <th className="py-2 px-2 w-20 text-right">
                      <button
                        onClick={() => setShowCategoryGroupHeader(!showCategoryGroupHeader)}
                        className="text-slate-500 hover:text-slate-800"
                        title="Toggle Group Headers"
                      >
                        {showCategoryGroupHeader ? (
                          <ChevronDown className="w-4 h-4 inline" />
                        ) : (
                          <ChevronUp className="w-4 h-4 inline" />
                        )}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.keys(groupedProducts).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        No recommended items found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    Object.entries(groupedProducts).map(([groupName, groupItems]) => (
                      <React.Fragment key={groupName}>
                        {/* Group Header Banner */}
                        {showCategoryGroupHeader && !hideGroupHeader && (
                          <tr className="bg-slate-100 font-bold text-slate-800 text-[11px]">
                            <td colSpan={7} className="py-1 px-2.5">
                              <span className="text-[#195a96] mr-1">📁</span> {groupName} ({groupItems.length} items)
                            </td>
                          </tr>
                        )}

                        {/* Product Rows */}
                        {groupItems.map((prod) => {
                          const isChecked = !!selectedProductIds[prod.id];
                          const qtyVal = orderQuantities[prod.id] ?? prod.recommendedQty;

                          return (
                            <tr key={prod.id} className="hover:bg-blue-50/50 transition">
                              <td className="py-1.5 px-2.5">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleSelectItem(prod.id)}
                                  className="rounded text-[#337ab7]"
                                />
                              </td>
                              <td className="py-1.5 px-2 font-medium text-slate-900">
                                <div>{prod.description}</div>
                                {showProductCode && (
                                  <div className="text-[10px] text-slate-400 font-mono">{prod.code}</div>
                                )}
                              </td>
                              <td
                                className={`py-1.5 px-2 text-right font-mono font-semibold ${
                                  prod.qtyOH < 0 ? 'text-red-600' : 'text-slate-700'
                                }`}
                              >
                                {prod.qtyOH}
                              </td>
                              <td className="py-1.5 px-2 text-slate-600 text-[11px]">{prod.unit}</td>
                              <td className="py-1.5 px-2">
                                <div className="flex items-center border border-slate-300 rounded overflow-hidden w-24">
                                  <button
                                    onClick={() => handleUpdateQty(prod.id, -1)}
                                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border-r border-slate-300"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    value={qtyVal}
                                    onChange={(e) => handleSetQtyDirect(prod.id, parseInt(e.target.value) || 0)}
                                    className="w-full text-center text-red-600 font-bold text-xs focus:outline-none py-0.5"
                                  />
                                  <button
                                    onClick={() => handleUpdateQty(prod.id, 1)}
                                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border-l border-slate-300"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="py-1.5 px-2 text-slate-600 text-[11px] truncate max-w-[120px]">
                                {prod.supplierName}
                              </td>
                              <td className="py-1.5 px-2 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleExcludeProduct(prod.id)}
                                    title="Exclude Item from calculation"
                                    className="p-1 text-slate-400 hover:text-red-600 transition"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenHistory(prod)}
                                    title="View Purchase History & Performance"
                                    className="p-1 text-slate-400 hover:text-[#337ab7] transition"
                                  >
                                    <History className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleAddToCart(prod)}
                                    title="Add to Shopping Cart"
                                    className="p-1 text-[#337ab7] hover:text-[#286090] transition"
                                  >
                                    <ArrowRightCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT PANEL: SHOPPING CART (6 cols) */}
          <div className="lg:col-span-6 bg-white border border-[#d2d6de] rounded-sm shadow-2xs overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-[#d3dcef] px-3 py-2 flex items-center justify-between border-b border-[#cbd5e1]">
              <span className="text-xs font-bold text-slate-800">Shopping Cart</span>
              {cartTotalBeforeTax > 0 && (
                <span className="text-xs font-bold text-slate-900">
                  Total Before Tax: {cartTotalBeforeTax.toLocaleString()} LBP
                </span>
              )}
            </div>

            {/* Body */}
            <div className="p-2 flex-1 flex flex-col justify-between max-h-[580px] overflow-y-auto">
              {Object.keys(cartItems).length === 0 ? (
                /* Empty Cart State (Matching Screenshot) */
                <div className="border border-slate-200 rounded overflow-hidden">
                  <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 border-b border-slate-200">
                    No items added yet
                  </div>
                  <div className="p-4 text-xs text-slate-600 bg-white">
                    Select products to create a purchase order or a quotation
                  </div>
                </div>
              ) : (
                /* Populated Cart Grouped by Supplier */
                <div className="space-y-3">
                  {Object.entries(cartGroupedBySupplier).map(([supplierIdStr, supplierData]) => {
                    const sId = Number(supplierIdStr);
                    return (
                      <div
                        key={sId}
                        className="border border-[#cbd5e1] rounded bg-white shadow-2xs overflow-hidden"
                      >
                        {/* Supplier Section Header */}
                        <div className="bg-[#eef2f8] px-3 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#cbd5e1]">
                          <span className="font-bold text-xs text-slate-900">
                            {supplierData.supplierName}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-700">
                              Subtotal: {supplierData.subtotal.toLocaleString()} LBP
                            </span>
                            <button
                              onClick={() => handleOpenPO(sId)}
                              className="px-2.5 py-1 bg-[#337ab7] hover:bg-[#286090] text-white text-[11px] font-bold rounded shadow-2xs transition"
                            >
                              Create PO
                            </button>
                            <button
                              onClick={() => handleOpenQuotation(supplierData.supplierName)}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded shadow-2xs transition"
                            >
                              Request Quotation
                            </button>
                            <button
                              onClick={() => handleRemoveSupplierFromCart(sId)}
                              title="Delete section"
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Items in Supplier Section */}
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-[#f8fafc] text-slate-600 font-semibold border-b border-slate-100">
                            <tr>
                              <th className="py-1.5 px-2">Product Description</th>
                              {showProductCode && <th className="py-1.5 px-2">Code</th>}
                              <th className="py-1.5 px-2 w-24 text-center text-red-600">QTY</th>
                              <th className="py-1.5 px-2 w-16">Unit</th>
                              <th className="py-1.5 px-2 w-20 text-right">Cost/Unit</th>
                              <th className="py-1.5 px-2 w-24">Group</th>
                              <th className="py-1.5 px-2 w-8"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {supplierData.items.map((cartItem) => (
                              <tr key={cartItem.product.id} className="hover:bg-slate-50">
                                <td className="py-1.5 px-2 font-medium text-slate-800">
                                  {cartItem.product.description}
                                </td>
                                {showProductCode && (
                                  <td className="py-1.5 px-2 font-mono text-[10px] text-slate-400">
                                    {cartItem.product.code}
                                  </td>
                                )}
                                <td className="py-1.5 px-2">
                                  <div className="flex items-center border border-slate-300 rounded overflow-hidden mx-auto w-20">
                                    <button
                                      onClick={() => handleUpdateCartItemQty(cartItem.product.id, -1)}
                                      className="px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border-r border-slate-300 text-[11px]"
                                    >
                                      -
                                    </button>
                                    <span className="w-full text-center font-bold text-red-600 text-xs py-0.5">
                                      {cartItem.qtyToOrder}
                                    </span>
                                    <button
                                      onClick={() => handleUpdateCartItemQty(cartItem.product.id, 1)}
                                      className="px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border-l border-slate-300 text-[11px]"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                <td className="py-1.5 px-2 text-slate-500 text-[11px]">
                                  {cartItem.product.unit}
                                </td>
                                <td className="py-1.5 px-2 text-right font-mono text-[11px] text-slate-700">
                                  {cartItem.product.unitCost.toLocaleString()}
                                </td>
                                <td className="py-1.5 px-2 text-slate-500 text-[11px]">
                                  {cartItem.product.groupName}
                                </td>
                                <td className="py-1.5 px-2 text-right">
                                  <button
                                    onClick={() => handleRemoveCartItem(cartItem.product.id)}
                                    className="text-red-500 hover:text-red-700"
                                    title="Remove item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Action inside Cart */}
              {Object.keys(cartItems).length > 0 && (
                <div className="pt-3 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={handleSaveCart}
                    className="px-4 py-2 bg-[#337ab7] hover:bg-[#286090] text-white text-xs font-bold rounded flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Cart</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          7. MODAL: SETTINGS MODAL (Reorder Guide Settings)
          ========================================================================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95">
            <div className="bg-[#f5f5f5] px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Reorder Guide Settings</h2>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3.5 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showProductCode}
                  onChange={(e) => setShowProductCode(e.target.checked)}
                  className="rounded text-[#337ab7]"
                />
                <span className="font-semibold">Show Product Code</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideGroupHeader}
                  onChange={(e) => setHideGroupHeader(e.target.checked)}
                  className="rounded text-[#337ab7]"
                />
                <span className="font-semibold">Hide Group Header</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={updateRecommendedQtyForFuture}
                  onChange={(e) => setUpdateRecommendedQtyForFuture(e.target.checked)}
                  className="rounded text-[#337ab7]"
                />
                <span className="font-semibold">Update the product's recommended quantity for future orders</span>
              </label>

              <div className="pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-800 mb-1">
                  Default Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={defaultQuantity}
                  onChange={(e) => setDefaultQuantity(parseInt(e.target.value) || 1)}
                  className="w-full h-8 px-2 text-xs border border-slate-300 rounded focus:border-[#337ab7]"
                />
                <p className="text-[11px] text-slate-400 italic mt-1">
                  (In Case No Min-Max Set and No Previous Sales, Purchase)
                </p>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-1.5 bg-[#337ab7] hover:bg-[#286090] text-white rounded font-bold text-xs shadow-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          8. MODAL: PREVIEW SHOPPING CARTS (previewReordersModal)
          ========================================================================= */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95">
            <div className="bg-[#f5f5f5] px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Preview Shopping Carts</h2>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              {/* Filter Controls Bar with Filter & Clear buttons */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  {/* Branch selector */}
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Branch</label>
                    <select
                      value={previewBranchId}
                      onChange={(e) => setPreviewBranchId(Number(e.target.value))}
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-[#337ab7]"
                    >
                      <option value={0}>All Branches</option>
                      {SEED_BRANCHES.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* From Date */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">From Date</label>
                    <input
                      type="date"
                      value={previewFromDate}
                      onChange={(e) => setPreviewFromDate(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleApplyPreviewFilter();
                      }}
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-[#337ab7]"
                    />
                  </div>

                  {/* To Date */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">To Date</label>
                    <input
                      type="date"
                      value={previewToDate}
                      onChange={(e) => setPreviewToDate(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleApplyPreviewFilter();
                      }}
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-[#337ab7]"
                    />
                  </div>

                  {/* Filter & Clear Action Buttons */}
                  <div className="sm:col-span-2 flex items-center gap-1.5 justify-end">
                    <button
                      type="button"
                      onClick={handleApplyPreviewFilter}
                      className="h-8 px-3 bg-[#195a96] hover:bg-[#134472] text-white text-xs font-bold rounded flex items-center justify-center gap-1 shadow-2xs transition cursor-pointer flex-1"
                      title="Apply Filters"
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>Filter</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClearPreviewFilter}
                      className="h-8 px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded flex items-center justify-center gap-1 transition cursor-pointer"
                      title="Clear / Reset Filters"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                {/* Filter Active Summary Badge */}
                {(appliedPreviewFilters.fromDate || appliedPreviewFilters.toDate || appliedPreviewFilters.branchId !== 0) && (
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-700">Filter Applied:</span>
                      {appliedPreviewFilters.fromDate && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono">
                          From: {appliedPreviewFilters.fromDate}
                        </span>
                      )}
                      {appliedPreviewFilters.toDate && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono">
                          To: {appliedPreviewFilters.toDate}
                        </span>
                      )}
                      {appliedPreviewFilters.branchId !== 0 && (
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                          {SEED_BRANCHES.find((b) => b.id === appliedPreviewFilters.branchId)?.name || 'Branch'}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-slate-700 font-mono">
                      {filteredSavedReorders.length} of {savedReorders.length} carts
                    </span>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto max-h-72 border border-slate-200 rounded">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f4f5f7] text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-2.5 w-16">ID</th>
                      <th className="py-2 px-2 w-28">Date</th>
                      <th className="py-2 px-2">Branch</th>
                      <th className="py-2 px-2 text-right w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSavedReorders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            <AlertCircle className="w-5 h-5 text-slate-400" />
                            <p className="font-semibold text-xs text-slate-700">No shopping carts found matching your filter criteria</p>
                            <p className="text-[11px] text-slate-400">Try selecting a different date range or clearing filters.</p>
                            <button
                              type="button"
                              onClick={handleClearPreviewFilter}
                              className="mt-1 text-blue-600 hover:text-blue-800 hover:underline text-xs font-semibold cursor-pointer"
                            >
                              Reset Filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredSavedReorders.map((row) => {
                        const isExpanded = previewExpandedRow === row.id;
                        const isOpen = row.reorderId === currentReorderId;
                        return (
                          <React.Fragment key={row.id}>
                            <tr className={isOpen ? 'bg-emerald-50/60 font-semibold' : 'hover:bg-slate-50'}>
                              <td className="py-2 px-2.5 font-mono">
                                #{row.reorderId}
                                {isOpen && (
                                  <span className="ml-1 text-[10px] text-emerald-600 font-bold">
                                    [Open]
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-2 font-mono text-slate-600">{row.date}</td>
                              <td className="py-2 px-2 text-slate-800">{row.branchName}</td>
                              <td className="py-2 px-2 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() =>
                                      setPreviewExpandedRow(isExpanded ? null : row.id)
                                    }
                                    className="p-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 text-[10px]"
                                    title="Details"
                                  >
                                    {isExpanded ? '-' : '+'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setCurrentReorderId(row.reorderId);
                                      setIsPreviewOpen(false);
                                      showToast(`Cart #${row.reorderId} loaded into workstation`);
                                    }}
                                    className="px-2 py-0.5 bg-[#337ab7] hover:bg-[#286090] text-white rounded text-[10px] font-semibold"
                                    title="Load Cart"
                                  >
                                    Open
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-slate-50 text-[11px]">
                                <td colSpan={4} className="p-2 border-b border-slate-200">
                                  <div className="space-y-1">
                                    <div className="font-bold text-slate-700">
                                      Supplier: {row.supplierName}
                                    </div>
                                    <div className="text-slate-500">
                                      Quotation Request:{' '}
                                      {row.quotationStatus === 1
                                        ? `Requested on ${row.quotationDate}`
                                        : 'Not Requested'}
                                    </div>
                                    <div className="text-slate-500">
                                      Purchase Order:{' '}
                                      {row.poStatus === 1
                                        ? `Created on ${row.poDate}`
                                        : 'Not Created'}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          9. MODAL: ITEM HISTORY & PERFORMANCE (itemHistoryModal)
          ========================================================================= */}
      {isHistoryOpen && historyProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95">
            <div className="bg-[#f5f5f5] px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  {historyProduct.description}
                </h2>
                <p className="text-[11px] text-slate-500 font-semibold">Performance & Procurement History</p>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4 text-xs">
              {/* Toolbar with Tabs */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-600">Branch:</span>
                  <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Zeit w zaytoun ljanoub
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setHistoryActiveTab('dashboard')}
                    className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition ${
                      historyActiveTab === 'dashboard'
                        ? 'bg-[#337ab7] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <LineChart className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => setHistoryActiveTab('grid')}
                    className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition ${
                      historyActiveTab === 'grid'
                        ? 'bg-[#337ab7] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Data Grid</span>
                  </button>
                </div>
              </div>

              {/* 4 Stat KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-center">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Lead Time</span>
                  <span className="text-base font-black text-slate-800">{historyProduct.leadTimeDays} Days</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-center">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Max Level</span>
                  <span className="text-base font-black text-slate-800">{historyProduct.maxStock}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-center">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Min Level</span>
                  <span className="text-base font-black text-slate-800">{historyProduct.minStock}</span>
                </div>
                <div className="p-2.5 bg-blue-50 rounded border border-blue-200 text-center">
                  <span className="block text-[10px] text-[#195a96] font-bold uppercase">Recommended</span>
                  <span className="text-base font-black text-[#195a96]">{historyProduct.recommendedQty}</span>
                </div>
              </div>

              {/* Tab 1: Dashboard Chart & Summary */}
              {historyActiveTab === 'dashboard' ? (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs">Purchase Per Month (Historical)</h4>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="text-slate-400 text-[10px]">June 2026</div>
                      <div className="font-bold text-slate-800">45 {historyProduct.unit}</div>
                      <div className="text-slate-500 text-[10px]">{(45 * historyProduct.unitCost).toLocaleString()} LBP</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="text-slate-400 text-[10px]">July 2026</div>
                      <div className="font-bold text-slate-800">60 {historyProduct.unit}</div>
                      <div className="text-slate-500 text-[10px]">{(60 * historyProduct.unitCost).toLocaleString()} LBP</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="text-slate-400 text-[10px]">August 2026</div>
                      <div className="font-bold text-slate-800">30 {historyProduct.unit}</div>
                      <div className="text-slate-500 text-[10px]">{(30 * historyProduct.unitCost).toLocaleString()} LBP</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded border border-blue-200">
                      <div className="text-blue-600 text-[10px] font-bold">Sept 2026 (Est.)</div>
                      <div className="font-bold text-blue-900">{historyProduct.recommendedQty} {historyProduct.unit}</div>
                      <div className="text-blue-700 text-[10px]">{(historyProduct.recommendedQty * historyProduct.unitCost).toLocaleString()} LBP</div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Tab 2: Data Grid Table */
                <div className="overflow-x-auto max-h-56 border border-slate-200 rounded">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#f4f5f7] text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-2">Month</th>
                        <th className="py-2 px-2 text-center">Qty Purchased</th>
                        <th className="py-2 px-2">Unit</th>
                        <th className="py-2 px-2 text-right">Total Amount (LBP)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2 px-2 font-medium">June 2026</td>
                        <td className="py-2 px-2 text-center font-mono">45.00</td>
                        <td className="py-2 px-2 text-slate-500">{historyProduct.unit}</td>
                        <td className="py-2 px-2 text-right font-mono font-bold">{(45 * historyProduct.unitCost).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 font-medium">July 2026</td>
                        <td className="py-2 px-2 text-center font-mono">60.00</td>
                        <td className="py-2 px-2 text-slate-500">{historyProduct.unit}</td>
                        <td className="py-2 px-2 text-right font-mono font-bold">{(60 * historyProduct.unitCost).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 font-medium">August 2026</td>
                        <td className="py-2 px-2 text-center font-mono">30.00</td>
                        <td className="py-2 px-2 text-slate-500">{historyProduct.unit}</td>
                        <td className="py-2 px-2 text-right font-mono font-bold">{(30 * historyProduct.unitCost).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          10. MODAL: CREATE PURCHASE ORDER (poInfoModal)
          ========================================================================= */}
      {isPOModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95">
            <div className="bg-[#f5f5f5] px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Create Purchase Order</h2>
              <button
                onClick={() => setIsPOModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Supplier</label>
                <input
                  type="text"
                  disabled
                  value={SEED_SUPPLIERS.find(s => s.id === selectedPOSupplierId)?.name || 'Selected Supplier'}
                  className="w-full h-8 px-2 bg-slate-100 border border-slate-300 rounded font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Receiving Branch</label>
                <select className="w-full h-8 px-2 border border-slate-300 rounded text-xs">
                  <option>Zeit w zaytoun ljanoub</option>
                  <option>Choueifat Main Facility</option>
                </select>
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-100 rounded text-[11px] text-blue-900 leading-relaxed">
                This will create a new PO document populated with all items from this supplier in your Shopping Cart.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setIsPOModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCreatePO}
                  className="px-4 py-1.5 bg-[#337ab7] hover:bg-[#286090] text-white rounded font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Create PO Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          11. MODAL: REQUEST QUOTATION EMAIL (sendQuotationEmail)
          ========================================================================= */}
      {isQuotationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95">
            <div className="bg-[#f5f5f5] px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">
                Request Quotation Email ({quotationSupplierName})
              </h2>
              <button
                onClick={() => setIsQuotationModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700">To Email*</label>
                  <div className="flex gap-2 text-[11px] text-[#337ab7]">
                    <button type="button" onClick={() => setShowCc(!showCc)} className="hover:underline">
                      Cc
                    </button>
                    <button type="button" onClick={() => setShowBcc(!showBcc)} className="hover:underline">
                      Bcc
                    </button>
                  </div>
                </div>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full h-8 px-2 border border-slate-300 rounded focus:border-[#337ab7]"
                />
              </div>

              {showCc && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cc</label>
                  <input
                    type="email"
                    value={emailCc}
                    onChange={(e) => setEmailCc(e.target.value)}
                    placeholder="finance@vanguard.com"
                    className="w-full h-8 px-2 border border-slate-300 rounded focus:border-[#337ab7]"
                  />
                </div>
              )}

              {showBcc && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bcc</label>
                  <input
                    type="email"
                    value={emailBcc}
                    onChange={(e) => setEmailBcc(e.target.value)}
                    placeholder="audit@vanguard.com"
                    className="w-full h-8 px-2 border border-slate-300 rounded focus:border-[#337ab7]"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">From</label>
                <input
                  type="text"
                  value={emailFrom}
                  onChange={(e) => setEmailFrom(e.target.value)}
                  className="w-full h-8 px-2 border border-slate-300 rounded focus:border-[#337ab7]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full h-8 px-2 border border-slate-300 rounded focus:border-[#337ab7]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message</label>
                <textarea
                  rows={5}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:border-[#337ab7] text-xs font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsQuotationModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendQuotationEmail}
                  className="px-4 py-1.5 bg-[#337ab7] hover:bg-[#286090] text-white rounded font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Quotation Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          12. MODAL: UPDATE ITEM'S MAX STOCK (itemStockModal)
          ========================================================================= */}
      {isMaxStockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95">
            <div className="bg-[#f5f5f5] px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Update Item's Max Stock</h2>
              <button
                onClick={() => setIsMaxStockModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <p className="text-slate-600 text-xs">
                Adjust the Maximum Stock Thresholds for items in Zeit w zaytoun ljanoub to fine-tune automatic reorder calculation:
              </p>
              <div className="overflow-x-auto max-h-64 border border-slate-200 rounded">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f4f5f7] text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-2">Description</th>
                      <th className="py-2 px-2 text-right w-20">Min</th>
                      <th className="py-2 px-2 text-right w-24">Max</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.slice(0, 6).map((p) => (
                      <tr key={p.id}>
                        <td className="py-1.5 px-2 font-medium">{p.description}</td>
                        <td className="py-1.5 px-2 text-right text-slate-500">{p.minStock}</td>
                        <td className="py-1.5 px-2 text-right">
                          <input
                            type="number"
                            defaultValue={p.maxStock}
                            className="w-16 h-6 px-1 text-right text-xs border border-slate-300 rounded"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsMaxStockModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsMaxStockModalOpen(false);
                    showToast('Max Stock limits updated successfully');
                  }}
                  className="px-4 py-1.5 bg-[#337ab7] hover:bg-[#286090] text-white rounded font-bold text-xs shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          13. FOOTER (Matching Omega ERP)
          ========================================================================= */}
      <footer className="mt-12 text-center text-xs text-slate-400 py-4 border-t border-slate-200">
        © 2026 Omega Software All rights reserved. | Privacy Policy | Terms and Conditions | Support | Feedback
      </footer>
    </div>
  );
}
