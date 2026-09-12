'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings,
  X,
  Printer,
  Download,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  BarChart2,
  TrendingUp,
  RefreshCw,
  Menu,
  Calendar
} from 'lucide-react';
import DatePickerInput from '@/components/DatePickerInput';

export interface ReportItem {
  id: number;
  name: string;
  category: string;
  subgroup?: string;
  isLink?: boolean;
  linkUrl?: string;
  columns?: string[];
}

export const SUPPLIER_OPTIONS = [
  'All Suppliers',
  'Abbas & Hussein Dirani',
  'Abbas Dirani',
  'B GROUP',
  'C-Way Trading',
  'Clatchy',
  'Ezzeddine',
  'Koubeissi East.',
  'Mrs Randa',
  'Safa Bakery',
  'Sedi Hisham',
  'SOUTH',
  'Zahwe',
  'The village',
  'Abdo Trading Establishment'
];

export const CATEGORY_OPTIONS = [
  'All Categories',
  'Raw Materials',
  'جملة',
  'عروض',
  'مفرق',
  'مواد اولية'
];

export const DIVISION_OPTIONS = [
  'All Divisions',
  'Assembled Items',
  'Bottles',
  'Demijohns',
  'Jars',
  'Main Materials',
  'Plastic',
  'SERVICES',
  'Sprout',
  'براد',
  'بهارات مفرق',
  'زيتون جملة',
  'زيتون مفرق',
  'زيوت جملة',
  'زيوت مفرق',
  'عروض',
  'عسل جملة',
  'عسل مفرق',
  'فواكه مجففه جملة',
  'فواكه مجففه مفرق',
  'كبيس ومخللات جملة',
  'كبيس ومخللات مفرق',
  'كيلو جملة',
  'كيلو مفرق',
  'مجففات',
  'محمصة مفرق',
  'مربيات جملة',
  'مربيات مفرق',
  'مرطبان',
  'مقرمشات',
  'مقطرات ومدبسات جملة',
  'مقطرات ومدبسات مفرق',
  'مكعزلة جملة',
  'مكعزلة مفرق',
  'مونة بلدية جملة',
  'مونة بلدية مفرق'
];

export const GROUP_OPTIONS = [
  'All Groups',
  '509 مرطبان',
  'Assembled Items Per 1',
  'Bottles',
  'CLASSIC-C/R',
  'CLASSIC-R/R',
  'Demijohn',
  'JAR',
  'Main materials',
  'Plastic Bottles',
  'Plastic Gallon',
  'SERVICES',
  'أجبان و ألبان',
  'بزورات مفرق',
  'بهارات غ',
  'تمور',
  'جبنة مطبوخة',
  'حبوب فلت',
  'حبوب مكيسة',
  'حلوى',
  'رف',
  'زيت اوكراني دوار الشمس جملة',
  'زيت اوكراني دوار الشمس مفرق',
  'زيت زيتون خضير جملة',
  'زيت زيتون خضير مفرق',
  'زيت زيتون فرجين جملة',
  'زيت زيتون فرجين مفرق',
  'زيت زيتون كورة جملة',
  'زيتون اخضر جملة',
  'زيتون اخضر مفرق',
  'زيتون اسود جملة',
  'زيتون اسود مفرق',
  'زيتون جملة',
  'عروض',
  'عسل جملة',
  'عسل مفرق',
  'علبة بهارات',
  'علبة صغيرة',
  'علبة صغيرة.',
  'علبة كبيرة',
  'علبة كبيرة.',
  'فواكه مجففه جملة',
  'فواكه مجففه مفرق',
  'قلوبات مفرق',
  'قلوبات ني',
  'كبيس ومخللات جملة',
  'كبيس ومخللات مفرق',
  'كيلو جملة',
  'كيلو مفرق',
  'مدبسات جملة',
  'مدبسات مفرق 509',
  'مدبسات مفرق 510',
  'مراطبين عروض',
  'مربيات جملة',
  'مربيات مفرق',
  'مرتديلا',
  'مرشة بهار',
  'مرطبان 507',
  'مرطبان 510',
  'معلبات أخرى',
  'مقطرات 1 ليتر',
  'مقطرات جملة',
  'مقطرات مفرق 250مل',
  'مقطرات مفرق 500مل',
  'مقطرات ومدبسات غالون',
  'مكعزلة بقر جملة',
  'مكعزلة بقر مفرق',
  'مكعزلة معزة جملة',
  'مكعزلة معزة مفرق',
  'مونة بلدية جملة'
];

export const ALL_REPORTS_TREE: {
  category: string;
  items?: ReportItem[];
  subgroups?: {
    name: string;
    items: ReportItem[];
  }[];
}[] = [
  {
    category: 'Recently Viewed',
    items: []
  },
  {
    category: 'Recommended',
    items: [
      { id: 47, name: 'Purchase With all Details', category: 'Recommended' },
      { id: 105, name: 'Wastage Report', category: 'Recommended' },
      { id: 1, name: 'Inventory report', category: 'Recommended' },
      { id: 12, name: 'Stock Transaction History', category: 'Recommended' },
      { id: 222, name: 'Transactions Summary', category: 'Recommended' }
    ]
  },
  {
    category: 'Inventory',
    items: [
      { id: 1, name: 'Inventory report', category: 'Inventory' },
      { id: 101, name: 'Inventory report Summary', category: 'Inventory' },
      { id: 102, name: 'Inventory report by supplier', category: 'Inventory' },
      { id: 103, name: 'Inventory Report By Color and Size', category: 'Inventory' },
      { id: 104, name: 'Inventory report based on selling price', category: 'Inventory' },
      { id: 106, name: 'Stock Movement', category: 'Inventory' },
      { id: 107, name: 'Stock Movement By Supplier', category: 'Inventory' },
      { id: 108, name: 'Inventory report for expiry', category: 'Inventory' },
      { id: 109, name: 'Inventory History', category: 'Inventory' },
      { id: 110, name: 'Inventory history by category by location', category: 'Inventory' },
      { id: 111, name: 'Inventory History Summary', category: 'Inventory' },
      { id: 112, name: 'Overstock Report', category: 'Inventory' }
    ]
  },
  {
    category: 'Purchases',
    items: [
      { id: 60, name: 'Purchase by supplier by item(original and landing cost)', category: 'Purchases' },
      { id: 374, name: 'Purchase by location by category', category: 'Purchases' },
      { id: 370, name: 'Purchase Master Report For All Branches', category: 'Purchases' },
      { id: 294, name: 'Consolidated Purchase Summary By Invoice By Supplier', category: 'Purchases' },
      { id: 218, name: 'Purchase Report From Supplier By Cat. Including Tax', category: 'Purchases' },
      { id: 217, name: 'Purchase Report By Category By Divisions', category: 'Purchases' },
      { id: 212, name: 'Purchase order with all details', category: 'Purchases' },
      { id: 62, name: 'List of remarks by items', category: 'Purchases' },
      { id: 61, name: 'Purchase Report', category: 'Purchases' },
      { id: 47, name: 'Purchase With all Details', category: 'Purchases' },
      { id: 59, name: 'Purchase by month', category: 'Purchases' },
      { id: 58, name: 'Purchase items cost', category: 'Purchases' },
      { id: 55, name: 'Purchase Summary by invoice by supplier', category: 'Purchases' },
      { id: 54, name: 'Purchase Summary by invoice', category: 'Purchases' },
      { id: 53, name: 'Purchase Summary by supplier', category: 'Purchases' },
      { id: 52, name: 'Purchase details by supplier', category: 'Purchases' },
      { id: 51, name: 'Purchase details by date', category: 'Purchases' },
      { id: 50, name: 'Purchase by category', category: 'Purchases' },
      { id: 49, name: 'Purchase by item by supplier', category: 'Purchases' },
      { id: 48, name: 'Purchase by item by location', category: 'Purchases' },
      { id: 306, name: 'Supplier Discount', category: 'Purchases' },
      { id: 283, name: 'Purchased Serial Number', category: 'Purchases' }
    ]
  },
  {
    category: 'Sales',
    items: [
      {
        id: 720,
        name: 'Sales Reports',
        category: 'Sales',
        isLink: true,
        linkUrl: '/backoffice/reportview'
      },
      { id: 721, name: 'Profit by Item', category: 'Sales' },
      { id: 722, name: 'Sales By Driver Report', category: 'Sales' }
    ]
  },
  {
    category: 'Stock Movement',
    items: [],
    subgroups: [
      {
        name: 'Consumptions',
        items: [
          { id: 12, name: 'Stock Transaction History', category: 'Stock Movement', subgroup: 'Consumptions' },
          { id: 93, name: 'Sales vs quantity received', category: 'Stock Movement', subgroup: 'Consumptions' },
          { id: 222, name: 'Transactions Summary', category: 'Stock Movement', subgroup: 'Consumptions' },
          { id: 223, name: 'Item Consumption Based on Production and Wastage', category: 'Stock Movement', subgroup: 'Consumptions' },
          { id: 293, name: 'Product Purchase/Sales By Color', category: 'Stock Movement', subgroup: 'Consumptions' }
        ]
      },
      {
        name: 'Cost Variations',
        items: [
          { id: 86, name: 'Average cost variarion (Crosstab)', category: 'Stock Movement', subgroup: 'Cost Variations' },
          { id: 87, name: 'Average cost variation summary group by supplier', category: 'Stock Movement', subgroup: 'Cost Variations' },
          { id: 88, name: 'Average cost variation summary by item', category: 'Stock Movement', subgroup: 'Cost Variations' },
          { id: 220, name: 'Unit Cost Variation', category: 'Stock Movement', subgroup: 'Cost Variations' },
          { id: 384, name: 'Inventory Items Price Variation', category: 'Stock Movement', subgroup: 'Cost Variations' }
        ]
      }
    ]
  },
  {
    category: 'Transactions',
    items: [],
    subgroups: [
      {
        name: 'Requisitions',
        items: [
          { id: 63, name: 'Requisition Summary', category: 'Transactions', subgroup: 'Requisitions' },
          { id: 64, name: 'Requisitions By Item', category: 'Transactions', subgroup: 'Requisitions' },
          { id: 65, name: 'Requisitions By Location', category: 'Transactions', subgroup: 'Requisitions' },
          { id: 66, name: 'Grouped By Location By Item', category: 'Transactions', subgroup: 'Requisitions' },
          { id: 67, name: 'Summary By Group', category: 'Transactions', subgroup: 'Requisitions' },
          { id: 68, name: 'Summary to Location By Group', category: 'Transactions', subgroup: 'Requisitions' },
          { id: 69, name: 'Summary By Group W/O Items', category: 'Transactions', subgroup: 'Requisitions' },
          { id: 70, name: 'Summary By Category By Location', category: 'Transactions', subgroup: 'Requisitions' },
          { id: 71, name: 'Requisitions to Location', category: 'Transactions', subgroup: 'Requisitions' },
          { id: 72, name: 'Requisitions From Location', category: 'Transactions', subgroup: 'Requisitions' },
          { id: 287, name: 'Transfered Serial Numbers', category: 'Transactions', subgroup: 'Requisitions' },
          { id: 304, name: 'Transfer Report By Item By Date', category: 'Transactions', subgroup: 'Requisitions' }
        ]
      },
      {
        name: 'Wastage',
        items: [
          { id: 105, name: 'Wastage Report', category: 'Transactions', subgroup: 'Wastage' },
          { id: 284, name: 'Wastage by Serial Number', category: 'Transactions', subgroup: 'Wastage' }
        ]
      },
      {
        name: 'Adjustments',
        items: [
          { id: 160, name: 'Inventory Adjustments', category: 'Transactions', subgroup: 'Adjustments' },
          { id: 303, name: 'Not Adjusted Items', category: 'Transactions', subgroup: 'Adjustments' }
        ]
      },
      {
        name: 'Production',
        items: [
          { id: 162, name: 'Inventory Production', category: 'Transactions', subgroup: 'Production' },
          { id: 295, name: 'Inventory Production Summary By Date', category: 'Transactions', subgroup: 'Production' }
        ]
      }
    ]
  },
  {
    category: 'Reordering',
    items: [
      { id: 84, name: 'Reorder suggestion', category: 'Reordering' }
    ]
  },
  {
    category: 'Input Forms',
    items: [
      { id: 701, name: 'Inventory Worksheet', category: 'Input Forms' },
      { id: 702, name: 'Wastage Sheet', category: 'Input Forms' },
      { id: 703, name: 'Production Sheet', category: 'Input Forms' }
    ]
  },
  {
    category: 'Lists',
    items: [],
    subgroups: [
      {
        name: 'Logs',
        items: [
          { id: 9, name: 'User Log Report', category: 'Lists', subgroup: 'Logs' }
        ]
      },
      {
        name: 'List Reports',
        items: [
          { id: 29, name: 'Programming Summary', category: 'Lists', subgroup: 'List Reports' },
          { id: 30, name: 'List of Suppliers', category: 'Lists', subgroup: 'List Reports' },
          { id: 31, name: 'Inventory Items Ingredients', category: 'Lists', subgroup: 'List Reports' },
          { id: 378, name: 'Items Link Between Brands', category: 'Lists', subgroup: 'List Reports' },
          { id: 298, name: 'List of Inventory Items - PLU For Scale', category: 'Lists', subgroup: 'List Reports' },
          { id: 300, name: 'List of Included Items', category: 'Lists', subgroup: 'List Reports' },
          { id: 302, name: 'List of Newly Created Inventory Items', category: 'Lists', subgroup: 'List Reports' },
          { id: 436, name: 'Warehouse Report', category: 'Lists', subgroup: 'List Reports' }
        ]
      }
    ]
  }
];

export default function AuthenticVanguardInventoryReports() {
  // Sidebar selection
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(
    ALL_REPORTS_TREE.find((c) => c.category === 'Recommended')?.items?.[0] || null
  );

  // Search reports in sidebar
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [searchReportsPanelOpen, setSearchReportsPanelOpen] = useState(true);

  // Accordion open/close per category
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
    'Recently Viewed': false,
    'Recommended': false,
    'Inventory': true,
    'Purchases': false,
    'Sales': false,
    'Stock Movement': false,
    'Transactions': false,
    'Reordering': false,
    'Input Forms': false,
    'Lists': false
  });

  // Accordion open/close per subgroup
  const [expandedSubgroups, setExpandedSubgroups] = useState<{ [key: string]: boolean }>({
    'Consumptions': true,
    'Cost Variations': true,
    'Requisitions': true,
    'Wastage': true,
    'Adjustments': true,
    'Production': true,
    'Logs': true,
    'List Reports': true
  });

  // Toolbar settings modal
  const [toolbarSettingsOpen, setToolbarSettingsOpen] = useState(false);
  const [toolbarCategories, setToolbarCategories] = useState<string[]>(['Sales', 'Input Forms', 'Lists']);

  // Report Builder Modal
  const [reportBuilderOpen, setReportBuilderOpen] = useState(false);

  // Active category dropdown in top toolbar
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Date Presets Engine (Audio 1)
  const [timeRange, setTimeRange] = useState<string>('Today');
  const [startDate, setStartDate] = useState<string>('07-Sep-2026');
  const [endDate, setEndDate] = useState<string>('07-Sep-2026');
  const [presetDisplayLabel, setPresetDisplayLabel] = useState<string>('Sep 07, 2026');

  // Universal Filter Controls
  const [selectedBranch, setSelectedBranch] = useState<string>('0');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('All Suppliers');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All Categories');
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>('All Divisions');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('All Groups');
  const [searchItemQuery, setSearchItemQuery] = useState<string>('');
  const [searchCustomer, setSearchCustomer] = useState<string>('');
  const [selectedDriver, setSelectedDriver] = useState<string>('All Drivers');

  // Purchase Report Checkboxes
  const [groupByDate, setGroupByDate] = useState<boolean>(false);
  const [showUnposted, setShowUnposted] = useState<boolean>(false);
  const [removeGrouping, setRemoveGrouping] = useState<boolean>(false);
  const [showTaxes, setShowTaxes] = useState<boolean>(false);
  const [purchaseReportType, setPurchaseReportType] = useState<string>('All');
  const [purBatchNo, setPurBatchNo] = useState<string>('0');
  const [purInvoicePosted, setPurInvoicePosted] = useState<'posted' | 'not_posted'>('posted');
  const [purGroupByPaymentTerm, setPurGroupByPaymentTerm] = useState<boolean>(false);
  const [purIncludeDetails, setPurIncludeDetails] = useState<boolean>(false);

  // Live Inventory Report Checkboxes (Image 1 previous)
  const [invRemoveGrouping, setInvRemoveGrouping] = useState<boolean>(true);
  const [hideIfQtyOHZero, setHideIfQtyOHZero] = useState<boolean>(true);
  const [showZeroQty, setShowZeroQty] = useState<boolean>(false);
  const [showPositiveQty, setShowPositiveQty] = useState<boolean>(false);
  const [showNegativeQty, setShowNegativeQty] = useState<boolean>(false);
  const [hideNegativeQty, setHideNegativeQty] = useState<boolean>(false);
  const [hideCost, setHideCost] = useState<boolean>(true);

  // Price Level Dropdown (Image 5 previous)
  const [priceLevel, setPriceLevel] = useState<string>('SP1');
  const [priceLevelDropdownOpen, setPriceLevelDropdownOpen] = useState<boolean>(false);
  const [priceLevelSearch, setPriceLevelSearch] = useState<string>('');

  // Stock Movement & Stock Movement By Supplier Checkboxes (Image 1 & 2)
  const [smRemoveGrouping, setSmRemoveGrouping] = useState<boolean>(true);
  const [smHideIfQtyOHZero, setSmHideIfQtyOHZero] = useState<boolean>(true);
  const [smBasedOnTransactionCost, setSmBasedOnTransactionCost] = useState<boolean>(false);
  const [smShowWastageDetails, setSmShowWastageDetails] = useState<boolean>(true);
  const [smUseUnitCost, setSmUseUnitCost] = useState<boolean>(false);
  const [smShowPurchaseAndTransfer, setSmShowPurchaseAndTransfer] = useState<boolean>(false);
  const [smByCategory, setSmByCategory] = useState<boolean>(false);
  const [smByCategoryAndGroups, setSmByCategoryAndGroups] = useState<boolean>(false);

  // Inventory History Controls (Image 4)
  const [histRemoveGrouping, setHistRemoveGrouping] = useState<boolean>(true);
  const [histHideIfQtyOHZero, setHistHideIfQtyOHZero] = useState<boolean>(true);
  const [histBasedOnTransactionCost, setHistBasedOnTransactionCost] = useState<boolean>(false);
  const [histFormat, setHistFormat] = useState<'summary' | 'detail'>('summary');

  // Inventory History By Category By Location Controls (Image 5)
  const [catLocHideIfQtyOHZero, setCatLocHideIfQtyOHZero] = useState<boolean>(true);
  const [catLocBasedOnTransactionCost, setCatLocBasedOnTransactionCost] = useState<boolean>(false);

  // Inventory History Summary Controls (Image 1)
  const [histSummHideZero, setHistSummHideZero] = useState<boolean>(false);
  const [histSummBasedOnTransactionCost, setHistSummBasedOnTransactionCost] = useState<boolean>(false);
  const [histSummFormat, setHistSummFormat] = useState<'summary' | 'detail'>('summary');

  // Wastage Report Controls (Audio 2 & 3)
  const [wastagePosting, setWastagePosting] = useState<'all' | 'posted' | 'not_posted'>('all');
  const [sortByEmployee, setSortByEmployee] = useState<boolean>(false);
  const [isListView, setIsListView] = useState<boolean>(true);

  // Currency & Rate states
  const [useSecondCurrency, setUseSecondCurrency] = useState<boolean>(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'LBP' | 'USD'>('LBP');
  const [interBrand, setInterBrand] = useState<boolean>(false);

  const activeCurrency = useSecondCurrency || selectedCurrency === 'USD' ? 'USD' : 'LBP';
  const currSymbol = activeCurrency === 'USD' ? '$' : 'LBP';
  const currText = activeCurrency === 'USD' ? 'USD' : 'LBP';
  const fxRate = 89500;
  const formatMoney = (lbp: number) => {
    if (activeCurrency === 'USD') {
      return '$' + (lbp / fxRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return lbp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const showBranchCol = selectedBranch === '0' || selectedBranch === 'all' || selectedBranch === 'All Branches';
  // Execution & View States
  const [hasFiltered, setHasFiltered] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Determine active report profile
  const repName = selectedReport?.name || '';
  const repId = selectedReport?.id || 0;

  const isStockTransactionHistory = repId === 12 || repName === 'Stock Transaction History';
  const isTransactionsSummary = repId === 222 || repName === 'Transactions Summary';
  const isWastageReport = repId === 105 || repName.toLowerCase().includes('wastage');
  const isPurchaseCategory = selectedReport?.category === 'Purchases' || repName.toLowerCase().startsWith('purchase') || repName.includes('Purchase');
  
  // All 22 Purchases Reports exact flags
  const isPurBySupplierByItem = repId === 60 || repName === 'Purchase by supplier by item(original and landing cost)';
  const isPurByLocationByCat = repId === 374 || repName === 'Purchase by location by category';
  const isPurMasterAllBranches = repId === 370 || repName === 'Purchase Master Report For All Branches';
  const isPurConsolidatedSummary = repId === 294 || repName === 'Consolidated Purchase Summary By Invoice By Supplier';
  const isPurReportFromSupplierByCatTax = repId === 218 || repName === 'Purchase Report From Supplier By Cat. Including Tax';
  const isPurReportByCatByDiv = repId === 217 || repName === 'Purchase Report By Category By Divisions';
  const isPurOrderWithAllDetails = repId === 212 || repName === 'Purchase order with all details';
  const isPurListOfRemarksByItems = repId === 62 || repName === 'List of remarks by items';
  const isPurReportMain = repId === 61 || repName === 'Purchase Report';
  const isPurWithAllDetails = repId === 47 || repName === 'Purchase With all Details';
  const isPurByMonth = repId === 59 || repName === 'Purchase by month';
  const isPurItemsCost = repId === 58 || repName === 'Purchase items cost';
  const isPurSummaryByInvoiceBySupplier = repId === 55 || repName === 'Purchase Summary by invoice by supplier';
  const isPurSummaryByInvoice = repId === 54 || repName === 'Purchase Summary by invoice';
  const isPurSummaryBySupplier = repId === 53 || repName === 'Purchase Summary by supplier';
  const isPurDetailsBySupplier = repId === 52 || repName.trim() === 'Purchase details by supplier';
  const isPurDetailsByDate = repId === 51 || repName === 'Purchase details by date';
  const isPurByCategory = repId === 50 || repName === 'Purchase by category';
  const isPurByItemBySupplier = repId === 49 || repName === 'Purchase by item by supplier';
  const isPurByItemByLocation = repId === 48 || repName === 'Purchase by item by location';
  const isPurSupplierDiscount = repId === 306 || repName === 'Supplier Discount';
  const isPurPurchasedSerialNumber = repId === 283 || repName === 'Purchased Serial Number';

  const isAnyPurchaseReport = selectedReport?.category === 'Purchases' || (
    isPurBySupplierByItem ||
    isPurByLocationByCat ||
    isPurMasterAllBranches ||
    isPurConsolidatedSummary ||
    isPurReportFromSupplierByCatTax ||
    isPurReportByCatByDiv ||
    isPurOrderWithAllDetails ||
    isPurListOfRemarksByItems ||
    isPurReportMain ||
    isPurWithAllDetails ||
    isPurByMonth ||
    isPurItemsCost ||
    isPurSummaryByInvoiceBySupplier ||
    isPurSummaryByInvoice ||
    isPurSummaryBySupplier ||
    isPurDetailsBySupplier ||
    isPurDetailsByDate ||
    isPurByCategory ||
    isPurByItemBySupplier ||
    isPurByItemByLocation ||
    isPurSupplierDiscount ||
    isPurPurchasedSerialNumber
  );

  const isPurchaseWithDetails = isPurWithAllDetails;

  const isInventoryReportMain = repId === 1 || repName === 'Inventory report';
  const isInventoryReportSummary = repId === 101 || repId === 3 || repName === 'Inventory report Summary';
  const isInventoryReportBySupplier = repId === 102 || repId === 2 || repName === 'Inventory report by supplier';
  const isInventoryReportByColorSize = repId === 103 || repId === 292 || repName === 'Inventory Report By Color and Size';
  const isInventoryReportByPrice = repId === 104 || repId === 81 || repName === 'Inventory report based on selling price';

  const isStockMovement = repId === 106 || repId === 78 || repName === 'Stock Movement';
  const isStockMovementBySupplier = repId === 107 || repId === 381 || repName === 'Stock Movement By Supplier';

  // Sub-reports dedicated profiles
  const isReorderSuggestion = repId === 84 || repName.toLowerCase().includes('reorder');
  const isInventoryWorksheet = repId === 701 || repName.toLowerCase().includes('inventory worksheet');
  const isUserLogReport = repId === 9 || repName.toLowerCase().includes('user log');
  const isRequisitionReport = [63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 287, 304].includes(repId) || repName.toLowerCase().includes('requisition') || repName.toLowerCase().includes('transfer');
  const isProductionReport = [162, 295, 703].includes(repId) || repName.toLowerCase().includes('production');
  const isAdjustmentReport = [160, 303].includes(repId) || repName.toLowerCase().includes('adjustment');
  const isListOfSuppliers = [30, 802].includes(repId) || repName === 'List of Suppliers';
  const isInventoryReportExpiry = repId === 108 || repId === 80 || repName === 'Inventory report for expiry';
  const isInventoryHistory = repId === 109 || repId === 4 || repName === 'Inventory History';
  const isInventoryHistoryCatLoc = repId === 110 || repId === 79 || repName === 'Inventory history by category by location';
  const isInventoryHistorySummary = repId === 111 || repId === 413 || repName === 'Inventory History Summary';
  const isOverstockReport = repId === 112 || repId === 307 || repName === 'Overstock Report';
  const isProfitByItem = repId === 721 || repName.toLowerCase().includes('profit by item') || repName.toLowerCase().includes('profit by items');
  const isSalesByDriver = repId === 722 || repName.toLowerCase().includes('sales by driver');

  // Live stock reports that have NO date filters
  const isLiveStockReport = isInventoryReportMain || isInventoryReportSummary || isInventoryReportBySupplier || isInventoryReportByColorSize || isInventoryReportByPrice || isOverstockReport || isPurByMonth;

  // Date filter availability
  const showDateFilterRow = !isLiveStockReport;

  // Category availability (Image 1 & 2: Stock Transaction History and Transactions Summary do NOT show Category)
  const showCategoryFilter = !isStockTransactionHistory && !isTransactionsSummary && !isProfitByItem && !isSalesByDriver;

  // Division & Group availability (Image 1 & 2: do NOT show Division and Group)
  const showDivisionAndGroup = !isStockTransactionHistory && !isTransactionsSummary && !isProfitByItem && !isSalesByDriver;

  // Inventory Item search availability (Image 2: Transactions Summary does NOT show Inventory Item)
  const showInventoryItemInput = !isTransactionsSummary && !isProfitByItem && !isSalesByDriver;

  // Supplier Name dropdown availability
  const showSupplierFilter = isPurchaseWithDetails || isInventoryReportBySupplier;

  // Price Level dropdown (Inventory report based on selling price)
  const showPriceLevelFilter = isInventoryReportByPrice;

  // Handle Preset Date Change (Audio 1)
  const handleTimeRangeChange = (preset: string) => {
    setTimeRange(preset);
    const today = new Date(2026, 8, 7); // Sep 07, 2026

    const formatDate = (d: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
    };

    switch (preset) {
      case 'Today':
        setPresetDisplayLabel(formatDate(today));
        setStartDate('07-Sep-2026');
        setEndDate('07-Sep-2026');
        break;
      case 'Yesterday': {
        const yest = new Date(today);
        yest.setDate(yest.getDate() - 1);
        setPresetDisplayLabel(formatDate(yest));
        setStartDate('06-Sep-2026');
        setEndDate('06-Sep-2026');
        break;
      }
      case 'This Month':
        setPresetDisplayLabel('Sep 01, 2026 - Sep 30, 2026');
        setStartDate('01-Sep-2026');
        setEndDate('30-Sep-2026');
        break;
      case 'Last Month':
        setPresetDisplayLabel('Aug 01, 2026 - Aug 31, 2026');
        setStartDate('01-Aug-2026');
        setEndDate('31-Aug-2026');
        break;
      case '1st Quarter':
        setPresetDisplayLabel('Jan 01, 2026 - Mar 31, 2026');
        setStartDate('01-Jan-2026');
        setEndDate('31-Mar-2026');
        break;
      case '2nd Quarter':
        setPresetDisplayLabel('Apr 01, 2026 - Jun 30, 2026');
        setStartDate('01-Apr-2026');
        setEndDate('30-Jun-2026');
        break;
      case '3rd Quarter':
        setPresetDisplayLabel('Jul 01, 2026 - Sep 30, 2026');
        setStartDate('01-Jul-2026');
        setEndDate('30-Sep-2026');
        break;
      case '4th Quarter':
        setPresetDisplayLabel('Oct 01, 2026 - Dec 31, 2026');
        setStartDate('01-Oct-2026');
        setEndDate('31-Dec-2026');
        break;
      case 'This Year':
        setPresetDisplayLabel('Jan 01, 2026 - Dec 31, 2026');
        setStartDate('01-Jan-2026');
        setEndDate('31-Dec-2026');
        break;
      case 'Last Year':
        setPresetDisplayLabel('Jan 01, 2025 - Dec 31, 2025');
        setStartDate('01-Jan-2025');
        setEndDate('31-Dec-2025');
        break;
      case 'Date Range':
        setStartDate('01-Jan-2026');
        setEndDate('07-Sep-2026');
        break;
      default:
        setPresetDisplayLabel(formatDate(today));
    }
  };

  // Total pages calculation
  const totalPages = useMemo(() => {
    if (isWastageReport) return 8;
    if (isInventoryReportMain) return 14;
    if (isStockMovement) return 16;
    if (isStockMovementBySupplier) return 10;
    if (isInventoryReportExpiry) return 5;
    if (isInventoryHistory) return 12;
    if (isInventoryHistoryCatLoc) return 9;
    if (isStockTransactionHistory) return 12;
    if (isTransactionsSummary) return 6;
    if (isProfitByItem) return 4;
    if (isSalesByDriver) return 3;
    if (showTaxes) return 60;
    if (removeGrouping) return 30;
    return 37;
  }, [
    isWastageReport,
    isInventoryReportMain,
    isStockMovement,
    isStockMovementBySupplier,
    isInventoryReportExpiry,
    isInventoryHistory,
    isInventoryHistoryCatLoc,
    isStockTransactionHistory,
    isTransactionsSummary,
    isProfitByItem,
    isSalesByDriver,
    showTaxes,
    removeGrouping
  ]);

  // Handle Filter Report
  const handleFilterReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasFiltered(true);
      setCurrentPage(1);
    }, 350);
  };

  // Handle Reset Filters
  const handleResetFilters = () => {
    setHasFiltered(false);
    handleTimeRangeChange('Today');
    setSelectedBranch('0');
    setSelectedLocation(isStockTransactionHistory || isInventoryHistoryCatLoc ? 'select' : 'all');
    if (isOverstockReport) setSelectedBranch('southern');
    setHistSummHideZero(false);
    setHistSummBasedOnTransactionCost(false);
    setHistSummFormat('summary');
    setPurchaseReportType('All');
    setPurBatchNo('0');
    setPurInvoicePosted('posted');
    setPurGroupByPaymentTerm(false);
    setPurIncludeDetails(false);
    setSelectedSupplier('All Suppliers');
    setSelectedCategoryFilter('All Categories');
    setSelectedDivisionFilter('All Divisions');
    setSelectedGroupFilter('All Groups');
    setSearchItemQuery('');
    setSearchCustomer('');
    setSelectedDriver('All Drivers');
    setGroupByDate(false);
    setShowUnposted(false);
    setRemoveGrouping(false);
    setShowTaxes(false);
    setInvRemoveGrouping(true);
    setHideIfQtyOHZero(true);
    setShowZeroQty(false);
    setShowPositiveQty(false);
    setShowNegativeQty(false);
    setHideNegativeQty(false);
    setHideCost(true);
    setPriceLevel('SP1');
    setSmRemoveGrouping(true);
    setSmHideIfQtyOHZero(true);
    setSmBasedOnTransactionCost(false);
    setSmShowWastageDetails(true);
    setSmUseUnitCost(false);
    setSmShowPurchaseAndTransfer(false);
    setSmByCategory(false);
    setSmByCategoryAndGroups(false);
    setHistRemoveGrouping(true);
    setHistHideIfQtyOHZero(true);
    setHistBasedOnTransactionCost(false);
    setHistFormat('summary');
    setCatLocHideIfQtyOHZero(true);
    setCatLocBasedOnTransactionCost(false);
    setWastagePosting('all');
    setSortByEmployee(false);
    setIsListView(true);
    setCurrentPage(1);
  };

  const toggleCategory = (catName: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  const toggleSubgroup = (subName: string) => {
    setExpandedSubgroups((prev) => ({
      ...prev,
      [subName]: !prev[subName]
    }));
  };

  const handleSelectReport = (rep: ReportItem) => {
    if (rep.isLink && rep.linkUrl) {
      window.open(rep.linkUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setSelectedReport(rep);
    setActiveDropdown(null);
    setHasFiltered(true);
    setCurrentPage(1);
    handleTimeRangeChange('Today');
    if (rep.name === 'Profit by Item' || rep.name === 'Profit By Items' || rep.name === 'Sales By Driver Report' || rep.id === 721 || rep.id === 722) {
      setSelectedBranch('0');
      setSelectedDriver('All Drivers');
      setSearchCustomer('');
    }
    if (rep.id === 12 || rep.name === 'Stock Transaction History' || rep.id === 110 || rep.name === 'Inventory history by category by location') {
      setSelectedLocation('select');
    } else {
      setSelectedLocation('all');
    }
    if (rep.category === 'Purchases') {
      setSelectedBranch('0');
      setSelectedLocation('all');
      setSelectedSupplier('All Suppliers');
      setSelectedCategoryFilter('All Categories');
      setSelectedDivisionFilter('All Divisions');
      setSelectedGroupFilter('All Groups');
      setSearchItemQuery('');
      setPurBatchNo('0');
      setPurInvoicePosted('posted');
      setPurGroupByPaymentTerm(false);
      setPurIncludeDetails(false);
      setPurchaseReportType('All');
      setGroupByDate(false);
      setShowUnposted(false);
      setRemoveGrouping(false);
      setShowTaxes(false);
    } else if (rep.id === 112 || rep.name === 'Overstock Report' || rep.id === 307) {
      setSelectedBranch('southern');
    } else {
      setSelectedBranch('zeit');
    }
  };

  const handleToggleToolbarCategory = (cat: string) => {
    if (toolbarCategories.includes(cat)) {
      setToolbarCategories(toolbarCategories.filter((c) => c !== cat));
    } else {
      if (toolbarCategories.length < 8) {
        setToolbarCategories([...toolbarCategories, cat]);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const filename = `${(selectedReport?.name || 'Report').replace(/\s+/g, '_')}_${startDate}.csv`;
    let headerRow: string[] = [];
    let rows: string[][] = [];

    if (isPurchaseWithDetails) {
      headerRow = [
        'Supplier',
        'Branch',
        'Invoice Date',
        'Invoice #',
        'Invoice Type',
        'Location',
        'Item Description',
        'Item Code',
        'Quantity',
        'Unit',
        'Unit Cost (LBP)',
        'Net (LBP)',
        'Tax (LBP)',
        'Total (LBP)'
      ];
      rows = [
        ['SOOL', 'Zeit w zaytoun ljanoub', '02-Jan-26', '677', 'Purchase Invoice', 'Choueifat Main Facility', 'Extra Virgin Olive Oil 1L', 'EVOO1L', '120.00', 'BTL', '450000.0', '54,000,000.00', '0.00', '54,000,000.00'],
        ['SOOL', 'Zeit w zaytoun ljanoub', '02-Jan-26', '677', 'Purchase Invoice', 'Choueifat Main Facility', 'Extra Virgin Olive Oil 5L Tin', 'EVOO5L', '40.00', 'TIN', '2100000.0', '84,000,000.00', '0.00', '84,000,000.00'],
        ['Zahwe', 'Zeit w zaytoun ljanoub', '02-Jan-26', '678', 'Purchase Invoice', 'Choueifat Main Facility', 'Green Cracked Olives Jar 1kg', 'GCO1K', '60.00', 'JAR', '180000.0', '10,800,000.00', '0.00', '10,800,000.00'],
        ['Zahwe', 'Zeit w zaytoun ljanoub', '02-Jan-26', '678', 'Purchase Invoice', 'Choueifat Main Facility', 'Black Olives Jar 1kg', 'BCO1K', '50.00', 'JAR', '190000.0', '9,500,000.00', '0.00', '9,500,000.00'],
        ['Koura Olive Growers Syndicate', 'Zeit w zaytoun ljanoub', '03-Jan-26', '679', 'Purchase Invoice', 'Choueifat Main Facility', 'Virgin Olive Oil 16L Tin', 'VOO16L', '25.00', 'TIN', '6200000.0', '155,000,000.00', '0.00', '155,000,000.00']
      ];
    } else {
      headerRow = [
        'Item Description',
        'Item Code',
        'Qty On Hand',
        'Unit',
        'Unit Cost (LBP)',
        'Total Cost (LBP)',
        'Last Transaction Date',
        'Days Without Movement',
        'Branch',
        'Location',
        'Supplier',
        'Category',
        'Division'
      ];
      rows = [
        ['زعتر بلدي جودي', 'OST1KGR', '13.48', 'KG', '900000.0', '12,132,000.00', '24-May-26', '43', 'Zeit w zaytoun ljanoub', 'Choueifat Main Facility', 'Zahwe', 'مفرق', 'كيلو مفرق'],
        ['زعتر ساقس', 'MTB1KGR', '9.51', 'KG', '270000.0', '2,567,700.00', '24-May-26', '43', 'Zeit w zaytoun ljanoub', 'Choueifat Main Facility', 'Zahwe', 'مفرق', 'كيلو مفرق']
      ];
    }

    const csvContent = '\uFEFF' + [
      headerRow.map(h => `"${h}"`).join(','),
      ...rows.map(r => r.map(c => `"${c}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-[#edf3f9] text-[#0f172a] font-sans">
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 10mm 12mm 10mm 12mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 8.5pt !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .printable-report-area {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
          }
          .custom-report-table th, .custom-report-table td {
            font-size: 8pt !important;
            padding: 4px 6px !important;
            border-color: #000000 !important;
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR: TITLE + BREADCRUMBS + ACTION TOOLBAR                  */}
      {/* ========================================================================= */}
      <div className="px-6 py-3.5 bg-white border-b border-[#dbe5f2] flex items-center justify-between shadow-2xs shrink-0 print:hidden">
        <div>
          <h1 className="text-xl font-black text-[#0f172a] tracking-tight">Inventory Reports</h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <Link href="/backoffice/dashboard" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-700">Inventory Reports</span>
          </div>
        </div>

        {/* Toolbar categories + Buttons */}
        <div className="flex items-center gap-2 relative">
          {toolbarCategories.includes('Sales') && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'Sales' ? null : 'Sales')}
                className="bg-[#2a3649] hover:bg-[#1e2736] text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <span>Sales</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
              </button>
              {activeDropdown === 'Sales' && (
                <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30 text-xs animate-in fade-in-50 duration-100">
                  {[
                    { id: 71, name: 'Daily Sales Report' },
                    { id: 72, name: 'Sales by Item' },
                    { id: 73, name: 'Sales by Category' },
                    { id: 74, name: 'Sales Comparative' },
                    { id: 75, name: 'Cash Closing Summary' },
                    { id: 76, name: 'Daily Delivery' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelectReport({ id: r.id, name: r.name, category: 'Sales' })}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-[#eef5ff] hover:text-[#0d6efd] font-medium transition-colors"
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {toolbarCategories.includes('Input Forms') && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'Input Forms' ? null : 'Input Forms')}
                className="bg-[#2a3649] hover:bg-[#1e2736] text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <span>Input Forms</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
              </button>
              {activeDropdown === 'Input Forms' && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30 text-xs animate-in fade-in-50 duration-100">
                  {[
                    { id: 701, name: 'Inventory Worksheet' },
                    { id: 702, name: 'Wastage Sheet' },
                    { id: 703, name: 'Production Sheet' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelectReport({ id: r.id, name: r.name, category: 'Input Forms' })}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-[#eef5ff] hover:text-[#0d6efd] font-medium transition-colors"
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {toolbarCategories.includes('Lists') && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'Lists' ? null : 'Lists')}
                className="bg-[#2a3649] hover:bg-[#1e2736] text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <span>Lists</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
              </button>
              {activeDropdown === 'Lists' && (
                <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30 text-xs animate-in fade-in-50 duration-100 max-h-72 overflow-y-auto">
                  <div className="px-3.5 py-1 text-[11px] font-bold text-slate-900 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    Logs
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectReport({ id: 9, name: 'User Log Report', category: 'Lists', subgroup: 'Logs' })}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-[#eef5ff] hover:text-[#0d6efd] font-medium transition-colors"
                  >
                    User Log Report
                  </button>

                  <div className="px-3.5 py-1 text-[11px] font-bold text-slate-900 uppercase tracking-wider bg-slate-50 border-y border-slate-100 mt-1">
                    List Reports
                  </div>
                  {[
                    { id: 801, name: 'Programming Summary' },
                    { id: 802, name: 'List of Suppliers' },
                    { id: 803, name: 'Inventory Items Ingredients' },
                    { id: 804, name: 'Items Link Between Brands' },
                    { id: 805, name: 'List of Inventory Items - PLU For Scale' },
                    { id: 806, name: 'List of Included Items' },
                    { id: 807, name: 'List of Newly Created Inventory Items' },
                    { id: 808, name: 'Warehouse Report' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelectReport({ id: r.id, name: r.name, category: 'Lists' })}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-[#eef5ff] hover:text-[#0d6efd] font-medium transition-colors"
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reports Builder */}
          <button
            type="button"
            onClick={() => setReportBuilderOpen(true)}
            className="bg-[#2a3649] hover:bg-[#1e2736] text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5 text-slate-300" />
            <span>Reports Builder</span>
          </button>

          {/* Settings Gear */}
          <button
            type="button"
            onClick={() => setToolbarSettingsOpen(true)}
            className="bg-[#2a3649] hover:bg-[#1e2736] text-white p-1.5 rounded-md shadow-2xs transition-colors cursor-pointer"
            title="Toolbar Settings"
          >
            <Settings className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN LAYOUT: LEFT REPORT NAV PANEL + RIGHT FILTERS & REPORT CANVAS    */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        
        {/* LEFT NAV PANEL: SEARCH + ACCORDIONS */}
        <div className="w-64 bg-white rounded-[20px] border border-[#dbe5f2] shadow-[0_18px_40px_rgba(15,23,42,0.05)] flex flex-col shrink-0 overflow-hidden print:hidden">
          
          {/* Header button: Search Reports toggle */}
          <div className="p-3 border-b border-[#eef2f7]">
            <button
              type="button"
              onClick={() => setSearchReportsPanelOpen(!searchReportsPanelOpen)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <Menu className="w-4 h-4 text-slate-500" />
              <span>Search Reports</span>
            </button>

            {searchReportsPanelOpen && (
              <div className="relative mt-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={reportSearchQuery}
                  onChange={(e) => setReportSearchQuery(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#dbe5f2] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            )}
          </div>

          {/* Filtered report list (if searching) */}
          {reportSearchQuery.trim() ? (
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {ALL_REPORTS_TREE.flatMap((cat) => [
                ...(cat.items || []),
                ...(cat.subgroups?.flatMap((sg) => sg.items) || [])
              ])
                .filter((r) => r.name.toLowerCase().includes(reportSearchQuery.toLowerCase()))
                .map((rep) => (
                  <button
                    key={`search-${rep.id}-${rep.name}`}
                    type="button"
                    onClick={() => handleSelectReport(rep)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-between ${
                      selectedReport?.id === rep.id
                        ? 'bg-[#eef5ff] text-[#0d6efd] font-bold shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`truncate ${rep.isLink || rep.name === 'Sales Reports' ? 'underline font-semibold text-slate-800' : ''}`}>
                      {rep.name}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-normal">{rep.category}</span>
                  </button>
                ))}
            </div>
          ) : (
            /* Regular Category Accordion */
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
              {ALL_REPORTS_TREE.map((categoryGroup) => {
                const isExpanded = expandedCategories[categoryGroup.category];
                const hasItems = (categoryGroup.items && categoryGroup.items.length > 0) || (categoryGroup.subgroups && categoryGroup.subgroups.length > 0);

                return (
                  <div key={categoryGroup.category} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleCategory(categoryGroup.category)}
                      className="w-full flex items-center justify-between px-2 py-1 text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer select-none"
                    >
                      <span className="tracking-tight">{categoryGroup.category}</span>
                      {hasItems && (
                        isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )
                      )}
                    </button>

                    {isExpanded && hasItems && (
                      <div className="pl-2 space-y-0.5 pt-0.5">
                        {categoryGroup.items?.map((item) => {
                          const isSelected = selectedReport?.id === item.id;
                          const isUnderlined = item.isLink || item.name === 'Sales Reports';
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelectReport(item)}
                              className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md font-medium transition-colors cursor-pointer truncate ${
                                isSelected
                                  ? 'bg-[#eef5ff] text-[#0d6efd] font-semibold'
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              <span className={isUnderlined ? 'underline font-semibold text-slate-800 hover:text-blue-600' : ''}>
                                {item.name}
                              </span>
                            </button>
                          );
                        })}

                        {categoryGroup.subgroups?.map((sub) => {
                          const isSubExpanded = expandedSubgroups[sub.name];
                          return (
                            <div key={sub.name} className="pt-1">
                              <button
                                type="button"
                                onClick={() => toggleSubgroup(sub.name)}
                                className="w-full flex items-center justify-between px-2.5 py-1 text-xs font-bold text-slate-800 hover:text-blue-600 cursor-pointer"
                              >
                                <span className="tracking-tight">{sub.name}</span>
                                {isSubExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-[#1e3a8a] stroke-[2.5]" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-[#1e3a8a] stroke-[2.5]" />
                                )}
                              </button>
                              {isSubExpanded && (
                                <div className="pl-3 space-y-0.5 pt-0.5">
                                  {sub.items.map((subItem) => {
                                    const isSubSelected = selectedReport?.id === subItem.id;
                                    return (
                                      <button
                                        key={subItem.id}
                                        type="button"
                                        onClick={() => handleSelectReport(subItem)}
                                        className={`w-full text-left px-2 py-1 text-xs rounded-md transition-colors cursor-pointer truncate ${
                                          isSubSelected
                                            ? 'bg-[#eef5ff] text-[#0d6efd] font-semibold'
                                            : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                      >
                                        {subItem.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        <div className="border-b border-[#eef2f7] pt-2 mb-2" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT CONTAINER: DYNAMIC FILTERS CARD + REPORT CANVAS */}
        <div className="flex-1 flex flex-col gap-5 overflow-y-auto custom-scrollbar print:overflow-visible print:w-full">
          
          {/* ===================================================================== */}
          {/* UPPER CARD: DYNAMIC FILTERS PANEL PER REPORT (IMAGES 1-10 MATCH)       */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-[20px] border border-[#dbe5f2] shadow-[0_18px_40px_rgba(15,23,42,0.05)] p-6 shrink-0 print:hidden">
            
            {/* Header: "Filters" left, exact report title right (Exact Pictures 1-10) */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#eef2f7]">
              <h2 className="text-sm font-black text-[#1e293b] tracking-tight uppercase">
                Filters
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                {selectedReport ? selectedReport.name : 'Purchase With all Details'}
              </span>
            </div>

            {/* Controls Layout */}
            <div className="space-y-4">
              
              {/* DATE ROW 1: RENDERED IF REPORT USES DATES */}
              {showDateFilterRow && (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  
                  {/* Case A: Expiry Report - "As At Date" side-by-side with date input (Image 3) */}
                  {isInventoryReportExpiry ? (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">As At Date</label>
                      <div className="flex items-center gap-3">
                        <div className="w-48">
                          <select
                            value={timeRange}
                            onChange={(e) => handleTimeRangeChange(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            <option value="Today">Today</option>
                            <option value="Yesterday">Yesterday</option>
                            <option value="Date Range">Choose Date</option>
                          </select>
                        </div>
                        <div className="w-52">
                          <input
                            type="text"
                            readOnly
                            disabled
                            value={presetDisplayLabel}
                            className="w-full bg-[#edf2f7] border border-[#cbd5e1] rounded-lg px-3 py-2 text-xs font-medium text-slate-700 cursor-not-allowed shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>
                  ) : isInventoryHistory || isInventoryHistoryCatLoc ? (
                    /* Case B: History Reports - "Date" label side-by-side with date input (Image 4 & 5) */
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Date</label>
                      <div className="flex items-center gap-3">
                        <div className="w-48">
                          <select
                            value={timeRange}
                            onChange={(e) => handleTimeRangeChange(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            <option value="Today">Today</option>
                            <option value="Yesterday">Yesterday</option>
                            <option value="Date Range">Choose Date</option>
                          </select>
                        </div>
                        <div className="w-52">
                          <input
                            type="text"
                            readOnly
                            disabled
                            value={presetDisplayLabel}
                            className="w-full bg-[#edf2f7] border border-[#cbd5e1] rounded-lg px-3 py-2 text-xs font-medium text-slate-700 cursor-not-allowed shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>
                  ) : isStockMovement || isStockMovementBySupplier ? (
                    /* Case C: Stock Movement Reports - Date dropdown stacked above input (Image 1 & 2) */
                    <div className="flex flex-col gap-2">
                      <div className="w-52">
                        <select
                          value={timeRange}
                          onChange={(e) => handleTimeRangeChange(e.target.value)}
                          className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                        >
                          <option value="Today">Today</option>
                          <option value="Yesterday">Yesterday</option>
                          <option value="This Month">This Month</option>
                          <option value="Last Month">Last Month</option>
                          <option value="1st Quarter">1st Quarter</option>
                          <option value="2nd Quarter">2nd Quarter</option>
                          <option value="3rd Quarter">3rd Quarter</option>
                          <option value="4th Quarter">4th Quarter</option>
                          <option value="This Year">This Year</option>
                          <option value="Last Year">Last Year</option>
                          <option value="Date Range">Date Range</option>
                        </select>
                      </div>
                      <div className="w-52">
                        <input
                          type="text"
                          readOnly
                          disabled
                          value={presetDisplayLabel}
                          className="w-full bg-[#edf2f7] border border-[#cbd5e1] rounded-lg px-3 py-2 text-xs font-medium text-slate-700 cursor-not-allowed shadow-2xs"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Case D: Purchase Reports, Wastage, Sales, etc. - Exact stacked Date Presets & Buttons */
                    <div className="flex flex-col gap-2 w-72">
                      <select
                        value={timeRange}
                        onChange={(e) => handleTimeRangeChange(e.target.value)}
                        className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                      >
                        <option value="Today">Today</option>
                        <option value="Yesterday">Yesterday</option>
                        <option value="This Month">This Month</option>
                        <option value="Last Month">Last Month</option>
                        <option value="1st Quarter">1st Quarter</option>
                        <option value="2nd Quarter">2nd Quarter</option>
                        <option value="3rd Quarter">3rd Quarter</option>
                        <option value="4th Quarter">4th Quarter</option>
                        <option value="This Year">This Year</option>
                        <option value="Last Year">Last Year</option>
                        <option value="Date Range">Date Range</option>
                      </select>

                      {timeRange === 'Date Range' ? (
                        <div className="flex items-center gap-2">
                          <DatePickerInput
                            value={startDate}
                            onChange={setStartDate}
                            className="flex-1"
                            inputWidth="w-full"
                          />
                          <span className="text-slate-400 text-xs">-</span>
                          <DatePickerInput
                            value={endDate}
                            onChange={setEndDate}
                            className="flex-1"
                            inputWidth="w-full"
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          readOnly
                          disabled
                          value={presetDisplayLabel}
                          className="w-full bg-[#eaedf1] border border-[#cbd5e1] rounded-lg px-3 py-2 text-xs font-medium text-slate-700 cursor-not-allowed shadow-2xs"
                        />
                      )}
                    </div>
                  )}

                  {/* Filter & Reset Buttons stacked on the right */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      id="runReportClick"
                      onClick={handleFilterReport}
                      className="w-48 bg-[#2f3b52] hover:bg-[#1e2736] text-white font-bold text-xs py-2 px-6 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>Filter Report</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="w-48 bg-[#58292b] hover:bg-[#431e20] text-white font-bold text-xs py-2 px-6 rounded-lg shadow-xs transition-colors text-center cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* PURCHASES SECTION DEDICATED REPORT FILTERS (EXACT SCREENSHOTS) */}
              {/* ------------------------------------------------------------- */}
              {isAnyPurchaseReport ? (
                <>
                  {/* 1. Purchase by supplier by item(original and landing cost) - Screenshot 1: No extra rows */}

                  {/* 2. Purchase by location by category - Screenshot 2: Branch, Location, Category */}
                  {isPurByLocationByCat && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Branch</label>
                        <select
                          value={selectedBranch}
                          onChange={(e) => setSelectedBranch(e.target.value)}
                          className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                        >
                          <option value="0">All Branches</option>
                          <option value="southern">Southern Olive Oil Products S.A.R.L</option>
                          <option value="zeit">Zeit w zaytoun ljanoub</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Location</label>
                        <select
                          value={selectedLocation}
                          onChange={(e) => setSelectedLocation(e.target.value)}
                          className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                        >
                          <option value="all">All Locations</option>
                          <option value="choueifat">Choueifat Main Facility</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Category</label>
                        <select
                          value={selectedCategoryFilter}
                          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                          className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                        >
                          {CATEGORY_OPTIONS.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* 3. Purchase Master Report For All Branches - Screenshot 3: Branch */}
                  {isPurMasterAllBranches && (
                    <div className="w-full md:w-1/3 text-xs">
                      <label className="block font-bold text-slate-700 mb-1">Branch</label>
                      <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                      >
                        <option value="0">All Branches</option>
                        <option value="southern">Southern Olive Oil Products S.A.R.L</option>
                        <option value="zeit">Zeit w zaytoun ljanoub</option>
                      </select>
                    </div>
                  )}

                  {/* 4. Consolidated Purchase Summary By Invoice By Supplier - Screenshot 4: Branch, Supplier Name */}
                  {isPurConsolidatedSummary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs w-full md:w-2/3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Branch</label>
                        <select
                          value={selectedBranch}
                          onChange={(e) => setSelectedBranch(e.target.value)}
                          className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                        >
                          <option value="0">All Branches</option>
                          <option value="southern">Southern Olive Oil Products S.A.R.L</option>
                          <option value="zeit">Zeit w zaytoun ljanoub</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Supplier Name</label>
                        <select
                          value={selectedSupplier}
                          onChange={(e) => setSelectedSupplier(e.target.value)}
                          className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                        >
                          {SUPPLIER_OPTIONS.map((sup) => (
                            <option key={sup} value={sup}>{sup}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* 5. Purchase Report From Supplier By Cat. Including Tax - Screenshot 5: No extra rows */}

                  {/* 6. Purchase Report By Category By Divisions - Screenshot 19: Category */}
                  {isPurReportByCatByDiv && (
                    <div className="w-72 text-xs">
                      <label className="block font-bold text-slate-700 mb-1">Category</label>
                      <select
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                        className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                      >
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 7. Purchase order with all details - Screenshot 20: Branch, Loc, Cat / Div, Grp, Item / Supplier */}
                  {isPurOrderWithAllDetails && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Branch</label>
                          <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            <option value="0">All Branches</option>
                            <option value="southern">Southern Olive Oil Products S.A.R.L</option>
                            <option value="zeit">Zeit w zaytoun ljanoub</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Location</label>
                          <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            <option value="all">All Locations</option>
                            <option value="choueifat">Choueifat Main Facility</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Category</label>
                          <select
                            value={selectedCategoryFilter}
                            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            {CATEGORY_OPTIONS.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Division</label>
                          <select
                            value={selectedDivisionFilter}
                            onChange={(e) => setSelectedDivisionFilter(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            {DIVISION_OPTIONS.map((div) => (
                              <option key={div} value={div}>{div}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Group</label>
                          <select
                            value={selectedGroupFilter}
                            onChange={(e) => setSelectedGroupFilter(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            {GROUP_OPTIONS.map((grp) => (
                              <option key={grp} value={grp}>{grp}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Inventory Item</label>
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              placeholder="Search Item..."
                              value={searchItemQuery}
                              onChange={(e) => setSearchItemQuery(e.target.value)}
                              className="w-full bg-white border border-[#cbd5e1] rounded-lg pl-9 pr-3 py-2 font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Supplier Name</label>
                          <select
                            value={selectedSupplier}
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            {SUPPLIER_OPTIONS.map((sup) => (
                              <option key={sup} value={sup}>{sup}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 8. List of remarks by items - Screenshot 21: No extra rows */}

                  {/* 9. Purchase Report - Screenshot 22: Branch, Loc, Cat / Div, Grp, Item / Purchase Report, Supplier / Checkboxes */}
                  {isPurReportMain && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Branch</label>
                          <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            <option value="0">All Branches</option>
                            <option value="southern">Southern Olive Oil Products S.A.R.L</option>
                            <option value="zeit">Zeit w zaytoun ljanoub</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Location</label>
                          <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            <option value="all">All Locations</option>
                            <option value="choueifat">Choueifat Main Facility</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Category</label>
                          <select
                            value={selectedCategoryFilter}
                            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            {CATEGORY_OPTIONS.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Division</label>
                          <select
                            value={selectedDivisionFilter}
                            onChange={(e) => setSelectedDivisionFilter(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            {DIVISION_OPTIONS.map((div) => (
                              <option key={div} value={div}>{div}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Group</label>
                          <select
                            value={selectedGroupFilter}
                            onChange={(e) => setSelectedGroupFilter(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            {GROUP_OPTIONS.map((grp) => (
                              <option key={grp} value={grp}>{grp}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Inventory Item</label>
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              placeholder="Search Item..."
                              value={searchItemQuery}
                              onChange={(e) => setSearchItemQuery(e.target.value)}
                              className="w-full bg-white border border-[#cbd5e1] rounded-lg pl-9 pr-3 py-2 font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Purchase Report</label>
                          <select
                            value={purchaseReportType}
                            onChange={(e) => setPurchaseReportType(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            <option value="All">All</option>
                            <option value="Invoiced">Invoiced</option>
                            <option value="Not Invoiced">Not Invoiced</option>
                            <option value="Local">Local</option>
                            <option value="Imported">Imported</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Supplier Name</label>
                          <select
                            value={selectedSupplier}
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            {SUPPLIER_OPTIONS.map((sup) => (
                              <option key={sup} value={sup}>{sup}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2 pt-1 text-xs text-slate-700 font-medium">
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={groupByDate}
                              onChange={(e) => setGroupByDate(e.target.checked)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                            />
                            <span>Group by date</span>
                          </label>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={showUnposted}
                              onChange={(e) => setShowUnposted(e.target.checked)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                            />
                            <span>Show unposted</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 10. Purchase With all Details - Screenshot 23: Branch, Loc, Cat / Div, Grp, Item / Supplier / 4 Checkboxes */}
                  {isPurWithAllDetails && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Branch</label>
                          <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            <option value="0">All Branches</option>
                            <option value="southern">Southern Olive Oil Products S.A.R.L</option>
                            <option value="zeit">Zeit w zaytoun ljanoub</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Location</label>
                          <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            <option value="all">All Locations</option>
                            <option value="choueifat">Choueifat Main Facility</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Category</label>
                          <select
                            value={selectedCategoryFilter}
                            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            {CATEGORY_OPTIONS.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Division</label>
                          <select
                            value={selectedDivisionFilter}
                            onChange={(e) => setSelectedDivisionFilter(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            {DIVISION_OPTIONS.map((div) => (
                              <option key={div} value={div}>{div}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Group</label>
                          <select
                            value={selectedGroupFilter}
                            onChange={(e) => setSelectedGroupFilter(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            {GROUP_OPTIONS.map((grp) => (
                              <option key={grp} value={grp}>{grp}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Inventory Item</label>
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              placeholder="Search Item..."
                              value={searchItemQuery}
                              onChange={(e) => setSearchItemQuery(e.target.value)}
                              className="w-full bg-white border border-[#cbd5e1] rounded-lg pl-9 pr-3 py-2 font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Supplier Name</label>
                          <select
                            value={selectedSupplier}
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            {SUPPLIER_OPTIONS.map((sup) => (
                              <option key={sup} value={sup}>{sup}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2 pt-1 text-xs text-slate-700 font-medium">
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={groupByDate}
                              onChange={(e) => setGroupByDate(e.target.checked)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                            />
                            <span>Group by date</span>
                          </label>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={showUnposted}
                              onChange={(e) => setShowUnposted(e.target.checked)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                            />
                            <span>Show unposted</span>
                          </label>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={removeGrouping}
                              onChange={(e) => {
                                setRemoveGrouping(e.target.checked);
                                setCurrentPage(1);
                              }}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                            />
                            <span>Remove Grouping</span>
                          </label>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={showTaxes}
                              onChange={(e) => {
                                setShowTaxes(e.target.checked);
                                setCurrentPage(1);
                              }}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                            />
                            <span>Show Taxes</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 11. Purchase by month - Screenshot 14: Category, Div, Grp + Filter & Reset buttons right / Inventory Item */}
                  {isPurByMonth && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Category</label>
                            <select
                              value={selectedCategoryFilter}
                              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                              className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                            >
                              {CATEGORY_OPTIONS.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Division</label>
                            <select
                              value={selectedDivisionFilter}
                              onChange={(e) => setSelectedDivisionFilter(e.target.value)}
                              className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                            >
                              {DIVISION_OPTIONS.map((div) => (
                                <option key={div} value={div}>{div}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Group</label>
                            <select
                              value={selectedGroupFilter}
                              onChange={(e) => setSelectedGroupFilter(e.target.value)}
                              className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                            >
                              {GROUP_OPTIONS.map((grp) => (
                                <option key={grp} value={grp}>{grp}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            type="button"
                            id="runReportClick"
                            onClick={handleFilterReport}
                            className="w-48 bg-[#2f3b52] hover:bg-[#1e2736] text-white font-bold text-xs py-2 px-6 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                            <span>Filter Report</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="w-48 bg-[#58292b] hover:bg-[#431e20] text-white font-bold text-xs py-2 px-6 rounded-lg shadow-xs transition-colors text-center cursor-pointer"
                          >
                            Reset Filters
                          </button>
                        </div>
                      </div>
                      <div className="w-full md:w-1/3 text-xs">
                        <label className="block font-bold text-slate-700 mb-1">Inventory Item</label>
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Search Item..."
                            value={searchItemQuery}
                            onChange={(e) => setSearchItemQuery(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg pl-9 pr-3 py-2 font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 12. Purchase items cost - Screenshot 15: No extra rows */}

                  {/* 13. Purchase Summary by invoice by supplier - Screenshot 16: Branch, Batch No. / Radios */}
                  {isPurSummaryByInvoiceBySupplier && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs w-full md:w-2/3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Branch</label>
                          <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            <option value="0">All Branches</option>
                            <option value="southern">Southern Olive Oil Products S.A.R.L</option>
                            <option value="zeit">Zeit w zaytoun ljanoub</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Batch No.</label>
                          <select
                            value={purBatchNo}
                            onChange={(e) => setPurBatchNo(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-xs text-slate-700 font-medium">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="radio"
                            name="pur_posted_status"
                            checked={purInvoicePosted === 'posted'}
                            onChange={() => setPurInvoicePosted('posted')}
                            className="text-blue-600"
                          />
                          <span>Posted Only</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="radio"
                            name="pur_posted_status"
                            checked={purInvoicePosted === 'not_posted'}
                            onChange={() => setPurInvoicePosted('not_posted')}
                            className="text-blue-600"
                          />
                          <span>Not Posted Only</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* 14. Purchase Summary by invoice - Screenshot 17: Branch */}
                  {isPurSummaryByInvoice && (
                    <div className="w-full md:w-1/3 text-xs">
                      <label className="block font-bold text-slate-700 mb-1">Branch</label>
                      <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                      >
                        <option value="0">Main Branch (الفرع الرئيسي)</option>
                      </select>
                    </div>
                  )}

                  {/* 15. Purchase Summary by supplier - Screenshot 18: Branch + [ ] Group by Payment Term */}
                  {isPurSummaryBySupplier && (
                    <div className="flex flex-wrap items-center gap-6 text-xs">
                      <div className="w-full md:w-1/3">
                        <label className="block font-bold text-slate-700 mb-1">Branch</label>
                        <select
                          value={selectedBranch}
                          onChange={(e) => setSelectedBranch(e.target.value)}
                          className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                        >
                          <option value="0">Main Branch (الفرع الرئيسي)</option>
                        </select>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer select-none pt-4 text-slate-700 font-medium">
                        <input
                          type="checkbox"
                          checked={purGroupByPaymentTerm}
                          onChange={(e) => setPurGroupByPaymentTerm(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <span>Group by Payment Term</span>
                      </label>
                    </div>
                  )}

                  {/* 16. Purchase details by supplier - Screenshot 10: Batch No. */}
                  {isPurDetailsBySupplier && (
                    <div className="w-full md:w-1/3 text-xs">
                      <label className="block font-bold text-slate-700 mb-1">Batch No.</label>
                      <select
                        value={purBatchNo}
                        onChange={(e) => setPurBatchNo(e.target.value)}
                        className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                      >
                        <option value="0">0</option>
                        <option value="1">1</option>
                      </select>
                    </div>
                  )}

                  {/* 17. Purchase details by date - Screenshot 11: No extra rows */}

                  {/* 18. Purchase by category - Screenshot 12: Branch, Category */}
                  {isPurByCategory && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs w-full md:w-2/3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Branch</label>
                        <select
                          value={selectedBranch}
                          onChange={(e) => setSelectedBranch(e.target.value)}
                          className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                        >
                          <option value="0">All Branches</option>
                          <option value="southern">Southern Olive Oil Products S.A.R.L</option>
                          <option value="zeit">Zeit w zaytoun ljanoub</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Category</label>
                        <select
                          value={selectedCategoryFilter}
                          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                          className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                        >
                          {CATEGORY_OPTIONS.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* 19. Purchase by item by supplier - Screenshot 6/13: Supplier Name */}
                  {isPurByItemBySupplier && (
                    <div className="w-full md:w-1/3 text-xs">
                      <label className="block font-bold text-slate-700 mb-1">Supplier Name</label>
                      <select
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                        className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                      >
                        {SUPPLIER_OPTIONS.map((sup) => (
                          <option key={sup} value={sup}>{sup}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 20. Purchase by item by location - Screenshot 7: Branch, Loc + Include Details / Inventory Item */}
                  {isPurByItemByLocation && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-6 text-xs">
                        <div className="w-full md:w-1/3">
                          <label className="block font-bold text-slate-700 mb-1">Branch</label>
                          <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            <option value="0">All Branches</option>
                            <option value="southern">Southern Olive Oil Products S.A.R.L</option>
                            <option value="zeit">Zeit w zaytoun ljanoub</option>
                          </select>
                        </div>
                        <div className="w-full md:w-1/3">
                          <label className="block font-bold text-slate-700 mb-1">Location</label>
                          <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            <option value="all">All Locations</option>
                            <option value="choueifat">Choueifat Main Facility</option>
                          </select>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer select-none pt-4 text-slate-700 font-medium">
                          <input
                            type="checkbox"
                            checked={purIncludeDetails}
                            onChange={(e) => setPurIncludeDetails(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                          />
                          <span>Include Details</span>
                        </label>
                      </div>
                      <div className="w-full md:w-1/3 text-xs">
                        <label className="block font-bold text-slate-700 mb-1">Inventory Item</label>
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Search Item..."
                            value={searchItemQuery}
                            onChange={(e) => setSearchItemQuery(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg pl-9 pr-3 py-2 font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 21. Supplier Discount - Screenshot 8: No extra rows */}

                  {/* 22. Purchased Serial Number - Screenshot 9: Branch */}
                  {isPurPurchasedSerialNumber && (
                    <div className="w-full md:w-1/3 text-xs">
                      <label className="block font-bold text-slate-700 mb-1">Branch</label>
                      <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                      >
                        <option value="0">All Branches</option>
                        <option value="southern">Southern Olive Oil Products S.A.R.L</option>
                        <option value="zeit">Zeit w zaytoun ljanoub</option>
                      </select>
                    </div>
                  )}
                </>
              ) : (
                /* ------------------------------------------------------------- */
                /* NON-PURCHASES REPORTS (SALES, INVENTORY, HISTORY, WASTAGE)   */
                /* ------------------------------------------------------------- */
                <>
                  {/* ROW 2: Branch, Location, Category */}
                  {isProfitByItem ? (
                    /* Profit by Item: Branch only */
                    <div className="w-full md:w-1/3 text-xs">
                      <label className="block font-bold text-slate-700 mb-1">Branch</label>
                      <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                      >
                        <option value="0">All Branches</option>
                        <option value="southern">Southern Olive Oil Products S.A.R.L</option>
                        <option value="zeit">Zeit w zaytoun ljanoub</option>
                      </select>
                    </div>
                  ) : isSalesByDriver ? (
                    /* Sales By Driver Report: Branch & Driver */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs w-full md:w-2/3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Branch</label>
                        <select
                          value={selectedBranch}
                          onChange={(e) => setSelectedBranch(e.target.value)}
                          className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                        >
                          <option value="0">All Branches</option>
                          <option value="southern">Southern Olive Oil Products S.A.R.L</option>
                          <option value="zeit">Zeit w zaytoun ljanoub</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Driver</label>
                        <select
                          value={selectedDriver}
                          onChange={(e) => setSelectedDriver(e.target.value)}
                          className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                        >
                          <option value="All Drivers">All Drivers</option>
                          <option value="Driver 1">Driver 1</option>
                          <option value="Driver 2">Driver 2</option>
                          <option value="Ahmad Dirani">Ahmad Dirani</option>
                          <option value="Hussein Dirani">Hussein Dirani</option>
                          <option value="Ali Zahwe">Ali Zahwe</option>
                        </select>
                      </div>
                    </div>
                  ) : isInventoryHistorySummary ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Category</label>
                        <div className="flex items-center gap-1.5 bg-white border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 shadow-2xs">
                          <span className="bg-[#eef2f7] text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded">Select category</span>
                          <select
                            value={selectedCategoryFilter}
                            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                            className="flex-1 bg-transparent font-medium text-slate-800 text-xs focus:outline-none"
                          >
                            {CATEGORY_OPTIONS.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Division</label>
                        <select
                          value={selectedDivisionFilter}
                          onChange={(e) => setSelectedDivisionFilter(e.target.value)}
                          className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                        >
                          {DIVISION_OPTIONS.map((div) => (
                            <option key={div} value={div}>{div}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Group</label>
                        <select
                          value={selectedGroupFilter}
                          onChange={(e) => setSelectedGroupFilter(e.target.value)}
                          className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                        >
                          {GROUP_OPTIONS.map((grp) => (
                            <option key={grp} value={grp}>{grp}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Branch</label>
                          <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            <option value="1">00001 - Main Branch (الفرع الرئيسي)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Location</label>
                          <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                          >
                            {isStockTransactionHistory || isInventoryHistoryCatLoc ? (
                              <>
                                <option value="select">Select location</option>
                                <option value="all">All Locations</option>
                                <option value="choueifat">Choueifat Main Facility</option>
                              </>
                            ) : (
                              <>
                                <option value="all">All Locations</option>
                                <option value="choueifat">Choueifat Main Facility</option>
                              </>
                            )}
                          </select>
                        </div>

                        {showCategoryFilter ? (
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              {isStockMovement || isStockMovementBySupplier ? 'Inventory Category' : 'Category'}
                            </label>
                            <select
                              value={selectedCategoryFilter}
                              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                              className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                            >
                              {isStockMovement || isStockMovementBySupplier ? (
                                <>
                                  <option value="All Inventory Categories">All Inventory Categories</option>
                                  {CATEGORY_OPTIONS.filter(c => c !== 'All Categories').map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </>
                              ) : (
                                CATEGORY_OPTIONS.map((cat) => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))
                              )}
                            </select>
                          </div>
                        ) : isStockTransactionHistory ? (
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Inventory Item</label>
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type="text"
                                placeholder="Search Item..."
                                value={searchItemQuery}
                                onChange={(e) => setSearchItemQuery(e.target.value)}
                                className="w-full bg-white border border-[#cbd5e1] rounded-lg pl-9 pr-3 py-2 font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* If Date filter row is hidden (Live Inventory Reports), place Filter and Reset buttons here! */}
                      {!showDateFilterRow && (
                        <div className="flex items-center gap-2.5 pt-4">
                          <button
                            type="button"
                            id="runReportClick"
                            onClick={handleFilterReport}
                            className="bg-[#2f3b52] hover:bg-[#1e2736] text-white font-bold text-xs py-2 px-7 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                            <span>Filter Report</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="bg-[#58292b] hover:bg-[#431e20] text-white font-bold text-xs py-2 px-6 rounded-lg shadow-xs transition-colors cursor-pointer"
                          >
                            Reset Filters
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ROW 3: Division, Group, Inventory Item */}
                  {isProfitByItem ? (
                    <div className="w-full md:w-1/3 text-xs">
                      <label className="block font-bold text-slate-700 mb-1">Customer</label>
                      <input
                        type="text"
                        placeholder="Search Customer..."
                        value={searchCustomer}
                        onChange={(e) => setSearchCustomer(e.target.value)}
                        className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                      />
                    </div>
                  ) : isSalesByDriver ? (
                    null
                  ) : isInventoryHistorySummary ? (
                    <div className="w-full md:w-1/3 text-xs">
                      <label className="block font-bold text-slate-700 mb-1">Inventory Item</label>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search Item..."
                          value={searchItemQuery}
                          onChange={(e) => setSearchItemQuery(e.target.value)}
                          className="w-full bg-white border border-[#cbd5e1] rounded-lg pl-9 pr-3 py-2 font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                        />
                      </div>
                    </div>
                  ) : showDivisionAndGroup && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          {isStockMovement || isStockMovementBySupplier ? 'Inventory Division' : 'Division'}
                        </label>
                        <select
                          value={selectedDivisionFilter}
                          onChange={(e) => setSelectedDivisionFilter(e.target.value)}
                          className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                        >
                          {isStockMovement || isStockMovementBySupplier ? (
                            <>
                              <option value="All Inventory Divisions">All Inventory Divisions</option>
                              {DIVISION_OPTIONS.filter(d => d !== 'All Divisions').map((div) => (
                                <option key={div} value={div}>{div}</option>
                              ))}
                            </>
                          ) : (
                            DIVISION_OPTIONS.map((div) => (
                              <option key={div} value={div}>{div}</option>
                            ))
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          {isStockMovement || isStockMovementBySupplier ? 'Inventory Group' : 'Group'}
                        </label>
                        <select
                          value={selectedGroupFilter}
                          onChange={(e) => setSelectedGroupFilter(e.target.value)}
                          className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                        >
                          {isStockMovement || isStockMovementBySupplier ? (
                            <>
                              <option value="All Inventory Groups">All Inventory Groups</option>
                              {GROUP_OPTIONS.filter(g => g !== 'All Groups').map((grp) => (
                                <option key={grp} value={grp}>{grp}</option>
                              ))}
                            </>
                          ) : (
                            GROUP_OPTIONS.map((grp) => (
                              <option key={grp} value={grp}>{grp}</option>
                            ))
                          )}
                        </select>
                      </div>

                      {showInventoryItemInput && (
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Inventory Item</label>
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              placeholder="Search Item..."
                              value={searchItemQuery}
                              onChange={(e) => setSearchItemQuery(e.target.value)}
                              className="w-full bg-white border border-[#cbd5e1] rounded-lg pl-9 pr-3 py-2 font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ROW 4: Supplier Name OR Price Level */}
                  {showSupplierFilter && isInventoryReportBySupplier && (
                    <div className="w-full md:w-1/3 text-xs">
                      <label className="block font-bold text-slate-700 mb-1">Supplier Name</label>
                      <select
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                        className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                      >
                        {SUPPLIER_OPTIONS.map((sup) => (
                          <option key={sup} value={sup}>{sup}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {showPriceLevelFilter && (
                    <div className="w-full md:w-1/4 text-xs relative">
                      <label className="block font-bold text-slate-700 mb-1">Price Level</label>
                      <button
                        type="button"
                        onClick={() => setPriceLevelDropdownOpen(!priceLevelDropdownOpen)}
                        className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 font-medium text-slate-800 text-left flex items-center justify-between shadow-2xs"
                      >
                        <span>{priceLevel}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      {priceLevelDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-blue-400 rounded-lg shadow-xl z-30 p-2 text-xs space-y-1 animate-in fade-in-50 duration-100">
                          <input
                            type="text"
                            placeholder="Search..."
                            value={priceLevelSearch}
                            onChange={(e) => setPriceLevelSearch(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs mb-1 focus:outline-none focus:border-blue-500"
                            autoFocus
                          />
                          {['SP1', 'SP2', 'SP3', 'SP4']
                            .filter(sp => sp.toLowerCase().includes(priceLevelSearch.toLowerCase()))
                            .map((sp) => (
                              <button
                                key={sp}
                                type="button"
                                onClick={() => {
                                  setPriceLevel(sp);
                                  setPriceLevelDropdownOpen(false);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded transition-colors ${priceLevel === sp ? 'bg-[#0d6efd] text-white font-bold' : 'hover:bg-slate-100 text-slate-800'}`}
                              >
                                {sp}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ROW 5: REPORT-SPECIFIC CHECKBOXES & TOGGLES (NON-PURCHASES) */}
              {isAnyPurchaseReport || isProfitByItem || isSalesByDriver ? (
                null
              ) : isStockMovement ? (
                /* Image 1: Stock Movement 4-row checkboxes */
                <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs text-slate-700 font-medium">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={smRemoveGrouping}
                        onChange={(e) => setSmRemoveGrouping(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Remove Grouping</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={smHideIfQtyOHZero}
                        onChange={(e) => setSmHideIfQtyOHZero(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Hide If QtyOH Zero</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={smBasedOnTransactionCost}
                        onChange={(e) => setSmBasedOnTransactionCost(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Based On Transaction Cost</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={smShowWastageDetails}
                        onChange={(e) => setSmShowWastageDetails(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Show Wastage Details</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={smUseUnitCost}
                        onChange={(e) => setSmUseUnitCost(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Use Unit Cost</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={smShowPurchaseAndTransfer}
                        onChange={(e) => setSmShowPurchaseAndTransfer(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Show Purchase and Transfer</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={smByCategory}
                        onChange={(e) => setSmByCategory(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>By Category</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={smByCategoryAndGroups}
                        onChange={(e) => setSmByCategoryAndGroups(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>By Category and Groups</span>
                    </label>
                  </div>
                </div>
              ) : isStockMovementBySupplier ? (
                /* Image 2: Stock Movement By Supplier 2-row checkboxes */
                <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs text-slate-700 font-medium">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={smHideIfQtyOHZero}
                        onChange={(e) => setSmHideIfQtyOHZero(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Hide If QtyOH Zero</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={smShowWastageDetails}
                        onChange={(e) => setSmShowWastageDetails(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Show Wastage Details</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={smUseUnitCost}
                        onChange={(e) => setSmUseUnitCost(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Use Unit Cost</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={smShowPurchaseAndTransfer}
                        onChange={(e) => setSmShowPurchaseAndTransfer(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Show Purchase and Transfer</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={smByCategory}
                        onChange={(e) => setSmByCategory(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>By Category</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={smByCategoryAndGroups}
                        onChange={(e) => setSmByCategoryAndGroups(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>By Category and Groups</span>
                    </label>
                  </div>
                </div>
              ) : isInventoryReportExpiry ? (
                /* Image 3: No checkboxes for Expiry Report */
                null
              ) : isInventoryHistory ? (
                /* Image 4: Inventory History Checkboxes & Radios */
                <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs text-slate-700 font-medium">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={histRemoveGrouping}
                        onChange={(e) => setHistRemoveGrouping(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Remove Grouping</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-8">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={histHideIfQtyOHZero}
                        onChange={(e) => setHistHideIfQtyOHZero(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Hide If QtyOH Zero</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={histBasedOnTransactionCost}
                        onChange={(e) => setHistBasedOnTransactionCost(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Based On Transaction Cost</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-6 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="hist_format"
                        checked={histFormat === 'summary'}
                        onChange={() => setHistFormat('summary')}
                        className="text-blue-600"
                      />
                      <span>Summary</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="hist_format"
                        checked={histFormat === 'detail'}
                        onChange={() => setHistFormat('detail')}
                        className="text-blue-600"
                      />
                      <span>Detail</span>
                    </label>
                  </div>
                </div>
              ) : isInventoryHistoryCatLoc ? (
                /* Image 5: Inventory history by category by location Checkboxes */
                <div className="pt-2 border-t border-slate-100 flex items-center gap-8 text-xs text-slate-700 font-medium">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={catLocHideIfQtyOHZero}
                      onChange={(e) => setCatLocHideIfQtyOHZero(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>Hide If QtyOH Zero</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={catLocBasedOnTransactionCost}
                      onChange={(e) => setCatLocBasedOnTransactionCost(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>Based On Transaction Cost</span>
                  </label>
                </div>
              ) : isInventoryHistorySummary ? (
                /* Image 1: Inventory History Summary Checkboxes & Radios */
                <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs text-slate-700 font-medium">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={histSummHideZero}
                        onChange={(e) => setHistSummHideZero(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Hide Items with 0 Qty on Hand</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={histSummBasedOnTransactionCost}
                        onChange={(e) => setHistSummBasedOnTransactionCost(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Based On Transaction Cost</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-6 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="hist_summ_format"
                        checked={histSummFormat === 'summary'}
                        onChange={() => setHistSummFormat('summary')}
                        className="text-blue-600"
                      />
                      <span>Summary</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="hist_summ_format"
                        checked={histSummFormat === 'detail'}
                        onChange={() => setHistSummFormat('detail')}
                        className="text-blue-600"
                      />
                      <span>Detail</span>
                    </label>
                  </div>
                </div>
              ) : isOverstockReport ? (
                /* Image 2: Overstock Report has NO checkboxes */
                null
              ) : isPurchaseWithDetails ? (
                /* Purchase With all Details Checkboxes */
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-6 text-xs text-slate-700 font-medium">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={groupByDate}
                      onChange={(e) => setGroupByDate(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>Group by date</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showUnposted}
                      onChange={(e) => setShowUnposted(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>Show unposted</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={removeGrouping}
                      onChange={(e) => {
                        setRemoveGrouping(e.target.checked);
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>Remove Grouping</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showTaxes}
                      onChange={(e) => {
                        setShowTaxes(e.target.checked);
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>Show Taxes</span>
                  </label>
                </div>
              ) : isInventoryReportMain ? (
                /* Live Inventory Report 3-row checkboxes */
                <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs text-slate-700 font-medium">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={invRemoveGrouping}
                        onChange={(e) => setInvRemoveGrouping(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Remove Grouping</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hideIfQtyOHZero}
                        onChange={(e) => setHideIfQtyOHZero(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Hide If QtyOH Zero</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showZeroQty}
                        onChange={(e) => setShowZeroQty(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Show Zero Qty</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showPositiveQty}
                        onChange={(e) => setShowPositiveQty(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Show Positive Qty</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showNegativeQty}
                        onChange={(e) => setShowNegativeQty(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Show Negative Qty</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hideNegativeQty}
                        onChange={(e) => setHideNegativeQty(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Hide Negative Qty</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hideCost}
                        onChange={(e) => setHideCost(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Hide Cost</span>
                    </label>
                  </div>
                </div>
              ) : isInventoryReportSummary || isInventoryReportBySupplier ? (
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-700 font-medium">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hideIfQtyOHZero}
                      onChange={(e) => setHideIfQtyOHZero(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>Hide If QtyOH Zero</span>
                  </label>
                </div>
              ) : isInventoryReportByColorSize ? (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-8 text-xs text-slate-700 font-medium">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showPositiveQty}
                      onChange={(e) => setShowPositiveQty(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>Show Positive Qty</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showNegativeQty}
                      onChange={(e) => setShowNegativeQty(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>Show Negative Qty</span>
                  </label>
                </div>
              ) : isWastageReport ? (
                /* Audio 2 & 3: Wastage Report Options */
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800">Posting:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="wastage_posted"
                        checked={wastagePosting === 'all'}
                        onChange={() => setWastagePosting('all')}
                        className="text-blue-600"
                      />
                      <span>All</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="wastage_posted"
                        checked={wastagePosting === 'posted'}
                        onChange={() => setWastagePosting('posted')}
                        className="text-blue-600"
                      />
                      <span>Posted only</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="wastage_posted"
                        checked={wastagePosting === 'not_posted'}
                        onChange={() => setWastagePosting('not_posted')}
                        className="text-blue-600"
                      />
                      <span>Not posted only</span>
                    </label>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sortByEmployee}
                      onChange={(e) => setSortByEmployee(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300"
                    />
                    <span className="font-bold text-slate-800">Sort by employee</span>
                  </label>

                  {!sortByEmployee && (
                    <div className="flex items-center gap-3 animate-in fade-in duration-150 pl-2 border-l border-slate-200">
                      <span className="font-bold text-slate-800">View Format:</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="wastage_view"
                          checked={isListView}
                          onChange={() => setIsListView(true)}
                          className="text-blue-600"
                        />
                        <span>List view</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="wastage_view"
                          checked={!isListView}
                          onChange={() => setIsListView(false)}
                          className="text-blue-600"
                        />
                        <span>Not list view</span>
                      </label>
                    </div>
                  )}
                </div>
              ) : null}

            </div>
          </div>

          {/* ===================================================================== */}
          {/* LOWER CARD: REPORT CANVAS (EMPTY WATERMARK GRAPH UNTIL FILTER CLICKED)  */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-[20px] border border-[#dbe5f2] shadow-[0_18px_40px_rgba(15,23,42,0.05)] flex-1 flex flex-col min-h-[460px] relative overflow-hidden print:border-none print:shadow-none print:rounded-none">
            
            {/* Header: Title left, Zoom & Print / Export right */}
            <div className="px-6 py-3.5 border-b border-[#eef2f7] flex items-center justify-between shrink-0 bg-white z-10 print:hidden">
              <h2 className="text-xs font-bold text-[#1e293b]">
                {selectedReport ? selectedReport.name : 'Inventory report'}
              </h2>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(z + 10, 150))}
                  className="bg-[#246d3e] hover:bg-[#1a512e] text-white p-1.5 rounded-md shadow-2xs transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(z - 10, 70))}
                  className="bg-[#246d3e] hover:bg-[#1a512e] text-white p-1.5 rounded-md shadow-2xs transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-[#2a3649] hover:bg-[#1e2736] text-white font-bold text-xs py-1.5 px-3 rounded-md shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="bg-[#2a3649] hover:bg-[#1e2736] text-white font-bold text-xs py-1.5 px-3 rounded-md shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report</span>
                </button>

                {/* Currency Switcher (Dynamic header & rate shifter) */}
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-300 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => { setSelectedCurrency('LBP'); setUseSecondCurrency(false); }}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${activeCurrency === 'LBP' ? 'bg-[#24344d] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                    title="View amounts in Lebanese Pounds (LBP)"
                  >
                    LBP
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedCurrency('USD'); setUseSecondCurrency(true); }}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${activeCurrency === 'USD' ? 'bg-[#24344d] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                    title="View amounts in US Dollars (USD $ at 89,500 LBP)"
                  >
                    USD ($)
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative overflow-auto p-6 flex flex-col justify-between">
              
              {!hasFiltered ? (
                /* EXACT REAL WATERMARK GRAPH & DOUBLE CHEVRONS BEFORE RUNNING REPORT */
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0">
                  {/* Subtle Watermark Chart Silhouette matching pictures 1-10 */}
                  <svg
                    className="w-full h-full max-h-[380px] text-[#2b4c7e]/[0.08]"
                    viewBox="0 0 1000 400"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Ghost Bar Chart */}
                    <rect x="310" y="240" width="18" height="120" rx="3" fill="currentColor" opacity="0.4" />
                    <rect x="336" y="200" width="18" height="160" rx="3" fill="currentColor" opacity="0.6" />
                    <rect x="362" y="225" width="18" height="135" rx="3" fill="currentColor" opacity="0.5" />
                    <rect x="388" y="160" width="18" height="200" rx="3" fill="currentColor" opacity="0.9" />
                    <rect x="414" y="270" width="18" height="90" rx="3" fill="currentColor" opacity="0.3" />

                    {/* Ghost Line Chart with circular nodes */}
                    <path
                      d="M 430 310 L 470 340 L 540 180 L 630 330 L 700 280 L 750 360 L 880 200 L 980 320"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      fill="none"
                      opacity="0.7"
                    />
                    <circle cx="470" cy="340" r="4.5" fill="currentColor" opacity="0.6" />
                    <circle cx="540" cy="180" r="4.5" fill="currentColor" opacity="0.8" />
                    <circle cx="630" cy="330" r="4.5" fill="currentColor" opacity="0.6" />
                    <circle cx="700" cy="280" r="4.5" fill="currentColor" opacity="0.8" />
                    <circle cx="750" cy="360" r="4.5" fill="currentColor" opacity="0.5" />
                    <circle cx="880" cy="200" r="4.5" fill="currentColor" opacity="0.9" />
                  </svg>

                  {/* Double Blue Chevron at bottom-right corner matching pictures 1-10 */}
                  <div className="absolute right-6 bottom-6 text-[#2563eb] opacity-85">
                    <ChevronsUp className="w-8 h-8" />
                  </div>
                </div>
              ) : (
                /* POPULATED REPORT DATA TABLE (VISIBLE ONLY AFTER FILTER REPORT CLICKED) */
                <div
                  className="printable-report-area space-y-6 animate-in fade-in-50 duration-200 z-10 w-full"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
                >
                  {/* Report Printed Header */}
                  <div className="flex items-start justify-between border-b border-slate-300 pb-4">
                    <div>
                      <div className="text-xl font-black text-slate-900 tracking-tight">SOUTHERN OLIVE OIL PRODUCTS S.A.L.</div>
                      <div className="text-xs text-slate-600 font-semibold mt-0.5">Vanguard ERP Enterprise • Financial & Inventory Division</div>
                      <div className="text-xs text-slate-500 mt-1">Branch: Zeit w zaytoun ljanoub | Location: All Locations</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">{selectedReport?.name || 'Report'}</div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Period: {showDateFilterRow ? (timeRange === 'Date Range' ? `${startDate} to ${endDate}` : presetDisplayLabel) : 'Live Stock on Hand'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Printed on: 07-Sep-2026 13:30:00 • Page {currentPage} of {totalPages}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Table Content based on Report Type */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                    {isPurchaseWithDetails ? (
                      /* 1. Purchase With all Details */
                      <table className="w-full text-left text-xs custom-report-table">
                        <thead className="bg-[#24344d] text-white text-[11px] uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Supplier</th>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Inv #</th>
                            <th className="py-2.5 px-3">Location</th>
                            {showBranchCol && <th className="py-2.5 px-3">Branch</th>}
                            <th className="py-2.5 px-3">Item Description</th>
                            <th className="py-2.5 px-3 text-right">Qty</th>
                            <th className="py-2.5 px-3">Unit</th>
                            <th className="py-2.5 px-3 text-right">Unit Cost ({currSymbol})</th>
                            <th className="py-2.5 px-3 text-right">Net ({currSymbol})</th>
                            {showTaxes && <th className="py-2.5 px-3 text-right">Tax ({currSymbol})</th>}
                            <th className="py-2.5 px-3 text-right">Total ({currSymbol})</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium text-slate-700 bg-white">
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">SOOL</td>
                            <td className="py-2 px-3 font-mono">02-Jan-26</td>
                            <td className="py-2 px-3 font-semibold text-blue-600 font-mono">677</td>
                            <td className="py-2 px-3">Choueifat Main Facility</td>
                            {showBranchCol && <td className="py-2 px-3 text-slate-600">Zeit w zaytoun ljanoub</td>}
                            <td className="py-2 px-3 font-bold text-slate-900">زعتر بلدي جودي</td>
                            <td className="py-2 px-3 text-right font-mono font-bold">120.00</td>
                            <td className="py-2 px-3">KG</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(900000)}</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(108000000)}</td>
                            {showTaxes && <td className="py-2.5 px-3 text-right font-mono">{formatMoney(0)}</td>}
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatMoney(108000000)}</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">SOOL</td>
                            <td className="py-2 px-3 font-mono">03-Jan-26</td>
                            <td className="py-2 px-3 font-semibold text-blue-600 font-mono">678</td>
                            <td className="py-2 px-3">Choueifat Main Facility</td>
                            {showBranchCol && <td className="py-2 px-3 text-slate-600">Zeit w zaytoun ljanoub</td>}
                            <td className="py-2 px-3 font-bold text-slate-900">زيت زيتون بكر ممتاز 1 لتر</td>
                            <td className="py-2 px-3 text-right font-mono font-bold">140.00</td>
                            <td className="py-2 px-3">BTL</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(450000)}</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(63000000)}</td>
                            {showTaxes && <td className="py-2.5 px-3 text-right font-mono">{formatMoney(0)}</td>}
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatMoney(63000000)}</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">SOOL</td>
                            <td className="py-2 px-3 font-mono">05-Jan-26</td>
                            <td className="py-2 px-3 font-semibold text-blue-600 font-mono">679</td>
                            <td className="py-2 px-3">Choueifat Main Facility</td>
                            {showBranchCol && <td className="py-2 px-3 text-slate-600">Zeit w zaytoun ljanoub</td>}
                            <td className="py-2 px-3 font-bold text-slate-900">زيت زيتون بلدي تنكة 16 لتر</td>
                            <td className="py-2 px-3 text-right font-mono font-bold">35.00</td>
                            <td className="py-2 px-3">TIN</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(4065714)}</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(142300000)}</td>
                            {showTaxes && <td className="py-2.5 px-3 text-right font-mono">{formatMoney(0)}</td>}
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatMoney(142300000)}</td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-slate-100 font-bold text-slate-900 text-xs border-t-2 border-slate-300">
                          <tr>
                            <td colSpan={showBranchCol ? 6 : 5} className="py-2.5 px-3 text-right">Page Total:</td>
                            <td className="py-2.5 px-3 text-right font-black font-mono">295.00</td>
                            <td colSpan={2}></td>
                            <td className="py-2.5 px-3 text-right font-black font-mono">{formatMoney(313300000)}</td>
                            {showTaxes && <td className="py-2.5 px-3 text-right font-black font-mono">{formatMoney(0)}</td>}
                            <td className="py-2.5 px-3 text-right font-black text-blue-900 font-mono">{formatMoney(313300000)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    ) : isProfitByItem ? (
                      /* 2. Profit by Item Table */
                      <table className="w-full text-left text-xs custom-report-table">
                        <thead className="bg-[#24344d] text-white text-[11px] uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Item Description</th>
                            <th className="py-2.5 px-3">Item Code</th>
                            <th className="py-2.5 px-3 text-right">Qty Sold</th>
                            <th className="py-2.5 px-3">Unit</th>
                            <th className="py-2.5 px-3 text-right">Selling Price ({currSymbol})</th>
                            <th className="py-2.5 px-3 text-right">Cost ({currSymbol})</th>
                            <th className="py-2.5 px-3 text-right">Profit ({currSymbol})</th>
                            <th className="py-2.5 px-3 text-right">Profit Margin (%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium text-slate-700 bg-white">
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">Extra Virgin Olive Oil 1L Glass Bottle</td>
                            <td className="py-2 px-3 font-mono text-slate-600">EVOO-01</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">140.00</td>
                            <td className="py-2 px-3">BTL</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(650000)}</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(450000)}</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700 font-mono">{formatMoney(28000000)}</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700 font-mono">30.77%</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">Extra Virgin Olive Oil 5L Premium Tin</td>
                            <td className="py-2 px-3 font-mono text-slate-600">EVOO-05</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">45.00</td>
                            <td className="py-2 px-3">TIN</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(2950000)}</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(2100000)}</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700 font-mono">{formatMoney(38250000)}</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700 font-mono">28.81%</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">Green Cracked Olives Jar 1kg</td>
                            <td className="py-2 px-3 font-mono text-slate-600">OLV-GR-01</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">80.00</td>
                            <td className="py-2 px-3">JAR</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(280000)}</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(180000)}</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700 font-mono">{formatMoney(8000000)}</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700 font-mono">35.71%</td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-slate-100 font-bold text-slate-900 text-xs border-t-2 border-slate-300">
                          <tr>
                            <td colSpan={2} className="py-2.5 px-3 text-right">Total:</td>
                            <td className="py-2.5 px-3 text-right font-black font-mono">265.00</td>
                            <td colSpan={3}></td>
                            <td className="py-2.5 px-3 text-right font-black text-emerald-800 font-mono">{formatMoney(74250000)}</td>
                            <td className="py-2.5 px-3 text-right font-black text-emerald-800 font-mono">31.42%</td>
                          </tr>
                        </tfoot>
                      </table>
                    ) : isSalesByDriver ? (
                      /* 3. Sales By Driver Table */
                      <table className="w-full text-left text-xs custom-report-table">
                        <thead className="bg-[#24344d] text-white text-[11px] uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Driver</th>
                            <th className="py-2.5 px-3">Invoice #</th>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Customer</th>
                            {showBranchCol && <th className="py-2.5 px-3">Branch</th>}
                            <th className="py-2.5 px-3">Payment Method</th>
                            <th className="py-2.5 px-3 text-right">Total Sales ({currSymbol})</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium text-slate-700 bg-white">
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">Ahmad Dirani</td>
                            <td className="py-2 px-3 font-semibold text-blue-600 font-mono">INV-2026-1041</td>
                            <td className="py-2 px-3 font-mono">07-Sep-2026</td>
                            <td className="py-2 px-3 font-semibold text-slate-800">Supermarket Al-Nour</td>
                            {showBranchCol && <td className="py-2 px-3 text-slate-600">Zeit w zaytoun ljanoub</td>}
                            <td className="py-2 px-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Cash</span></td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatMoney(45500000)}</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">Ahmad Dirani</td>
                            <td className="py-2 px-3 font-semibold text-blue-600 font-mono">INV-2026-1042</td>
                            <td className="py-2 px-3 font-mono">07-Sep-2026</td>
                            <td className="py-2 px-3 font-semibold text-slate-800">Safa Bakery</td>
                            {showBranchCol && <td className="py-2 px-3 text-slate-600">Zeit w zaytoun ljanoub</td>}
                            <td className="py-2 px-3"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">Credit</span></td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatMoney(32200000)}</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">Hussein Dirani</td>
                            <td className="py-2 px-3 font-semibold text-blue-600 font-mono">INV-2026-1043</td>
                            <td className="py-2 px-3 font-mono">07-Sep-2026</td>
                            <td className="py-2 px-3 font-semibold text-slate-800">B GROUP Wholesale</td>
                            {showBranchCol && <td className="py-2 px-3 text-slate-600">Southern Olive Oil Products S.A.R.L</td>}
                            <td className="py-2 px-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Cash</span></td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatMoney(78000000)}</td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-slate-100 font-bold text-slate-900 text-xs border-t-2 border-slate-300">
                          <tr>
                            <td colSpan={showBranchCol ? 6 : 5} className="py-2.5 px-3 text-right">Total Driver Sales:</td>
                            <td className="py-2.5 px-3 text-right font-black text-blue-900 font-mono">{formatMoney(155700000)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    ) : isStockTransactionHistory ? (
                      /* 4. Stock Transaction History Table */
                      <table className="w-full text-left text-xs custom-report-table">
                        <thead className="bg-[#24344d] text-white text-[11px] uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Date & Time</th>
                            <th className="py-2.5 px-3">Trans Type</th>
                            <th className="py-2.5 px-3">Ref #</th>
                            <th className="py-2.5 px-3">Location</th>
                            {showBranchCol && <th className="py-2.5 px-3">Branch</th>}
                            <th className="py-2.5 px-3">Item Description</th>
                            <th className="py-2.5 px-3">Item Code</th>
                            <th className="py-2.5 px-3 text-right">Qty In</th>
                            <th className="py-2.5 px-3 text-right">Qty Out</th>
                            <th className="py-2.5 px-3 text-right">Balance</th>
                            <th className="py-2.5 px-3">Unit</th>
                            <th className="py-2.5 px-3 text-right">Unit Cost ({currSymbol})</th>
                            <th className="py-2.5 px-3 text-right">Valuation ({currSymbol})</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium text-slate-700 bg-white">
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-slate-600">07-Sep-2026 09:15</td>
                            <td className="py-2 px-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Purchase In</span></td>
                            <td className="py-2 px-3 font-semibold text-blue-600 font-mono">PO-2026-881</td>
                            <td className="py-2 px-3">Choueifat Main Facility</td>
                            {showBranchCol && <td className="py-2 px-3 text-slate-600">Zeit w zaytoun ljanoub</td>}
                            <td className="py-2 px-3 font-bold text-slate-900">زيت زيتون بكر ممتاز 1 لتر</td>
                            <td className="py-2 px-3 font-mono text-slate-600">EVOO-01</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700 font-mono">+120.00</td>
                            <td className="py-2 px-3 text-right text-slate-400 font-mono">-</td>
                            <td className="py-2 px-3 text-right font-bold font-mono">142.00</td>
                            <td className="py-2 px-3">BTL</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(450000)}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatMoney(63900000)}</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-slate-600">07-Sep-2026 11:30</td>
                            <td className="py-2 px-3"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">Sales Out</span></td>
                            <td className="py-2 px-3 font-semibold text-blue-600 font-mono">INV-2026-1041</td>
                            <td className="py-2 px-3">Choueifat Main Facility</td>
                            {showBranchCol && <td className="py-2 px-3 text-slate-600">Zeit w zaytoun ljanoub</td>}
                            <td className="py-2 px-3 font-bold text-slate-900">زيت زيتون بكر ممتاز 1 لتر</td>
                            <td className="py-2 px-3 font-mono text-slate-600">EVOO-01</td>
                            <td className="py-2 px-3 text-right text-slate-400 font-mono">-</td>
                            <td className="py-2 px-3 text-right font-bold text-rose-700 font-mono">-15.00</td>
                            <td className="py-2 px-3 text-right font-bold font-mono">127.00</td>
                            <td className="py-2 px-3">BTL</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(450000)}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatMoney(57150000)}</td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-slate-100 font-bold text-slate-900 text-xs border-t-2 border-slate-300">
                          <tr>
                            <td colSpan={showBranchCol ? 7 : 6} className="py-2.5 px-3 text-right">Summary Totals:</td>
                            <td className="py-2.5 px-3 text-right font-black text-emerald-800 font-mono">+120.00</td>
                            <td className="py-2.5 px-3 text-right font-black text-rose-800 font-mono">-15.00</td>
                            <td className="py-2.5 px-3 text-right font-black text-slate-900 font-mono">Net +105.00</td>
                            <td colSpan={2}></td>
                            <td className="py-2.5 px-3 text-right font-black text-blue-900 font-mono">{formatMoney(121050000)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    ) : isWastageReport ? (
                      /* 5. Wastage Report Table */
                      <table className="w-full text-left text-xs custom-report-table">
                        <thead className="bg-[#24344d] text-white text-[11px] uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Wastage Ref #</th>
                            <th className="py-2.5 px-3">Location</th>
                            {showBranchCol && <th className="py-2.5 px-3">Branch</th>}
                            <th className="py-2.5 px-3">Item Description</th>
                            <th className="py-2.5 px-3">Item Code</th>
                            <th className="py-2.5 px-3">Wastage Reason</th>
                            <th className="py-2.5 px-3 text-right">Qty Wasted</th>
                            <th className="py-2.5 px-3">Unit</th>
                            <th className="py-2.5 px-3 text-right">Unit Cost ({currSymbol})</th>
                            <th className="py-2.5 px-3 text-right">Total Loss ({currSymbol})</th>
                            <th className="py-2.5 px-3">Audited By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium text-slate-700 bg-white">
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-slate-600">07-Sep-2026</td>
                            <td className="py-2 px-3 font-semibold text-blue-600 font-mono">WST-2026-088</td>
                            <td className="py-2 px-3">Choueifat Main Facility</td>
                            {showBranchCol && <td className="py-2 px-3 text-slate-600">Zeit w zaytoun ljanoub</td>}
                            <td className="py-2 px-3 font-bold text-slate-900">زيتون أخضر بلدي مكبوس 1 كغ</td>
                            <td className="py-2 px-3 font-mono text-slate-600">OLV-GR-01</td>
                            <td className="py-2 px-3"><span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">Glass Jar Cracked</span></td>
                            <td className="py-2 px-3 text-right font-bold text-rose-700 font-mono">2.00</td>
                            <td className="py-2 px-3">JAR</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(180000)}</td>
                            <td className="py-2 px-3 text-right font-bold text-rose-900 font-mono">{formatMoney(360000)}</td>
                            <td className="py-2 px-3 text-slate-700">Ahmad Dirani</td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-slate-100 font-bold text-slate-900 text-xs border-t-2 border-slate-300">
                          <tr>
                            <td colSpan={showBranchCol ? 7 : 6} className="py-2.5 px-3 text-right">Total Wastage Loss:</td>
                            <td className="py-2.5 px-3 text-right font-black text-rose-800 font-mono">2.00</td>
                            <td colSpan={2}></td>
                            <td className="py-2.5 px-3 text-right font-black text-rose-900 font-mono">{formatMoney(360000)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    ) : isTransactionsSummary ? (
                      /* 6. Transactions Summary Table */
                      <table className="w-full text-left text-xs custom-report-table">
                        <thead className="bg-[#24344d] text-white text-[11px] uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Transaction Category</th>
                            <th className="py-2.5 px-3 text-center">Records Count</th>
                            <th className="py-2.5 px-3 text-right">Total Inflow Qty</th>
                            <th className="py-2.5 px-3 text-right">Total Outflow Qty</th>
                            <th className="py-2.5 px-3 text-right">Net Movement</th>
                            <th className="py-2.5 px-3 text-right">Total Financial Impact ({currSymbol})</th>
                            {showBranchCol && <th className="py-2.5 px-3">Branch</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium text-slate-700 bg-white">
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">Purchases & Inward Shipments</td>
                            <td className="py-2 px-3 text-center font-mono">24</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700 font-mono">+1,240.00</td>
                            <td className="py-2 px-3 text-right text-slate-400 font-mono">0.00</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-800 font-mono">+1,240.00</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatMoney(313300000)}</td>
                            {showBranchCol && <td className="py-2 px-3">All Branches</td>}
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">Commercial Sales Dispatches</td>
                            <td className="py-2 px-3 text-center font-mono">48</td>
                            <td className="py-2 px-3 text-right text-slate-400 font-mono">0.00</td>
                            <td className="py-2 px-3 text-right font-bold text-rose-700 font-mono">-680.00</td>
                            <td className="py-2 px-3 text-right font-bold text-rose-800 font-mono">-680.00</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatMoney(217100000)}</td>
                            {showBranchCol && <td className="py-2 px-3">All Branches</td>}
                          </tr>
                        </tbody>
                        <tfoot className="bg-slate-100 font-bold text-slate-900 text-xs border-t-2 border-slate-300">
                          <tr>
                            <td className="py-2.5 px-3 font-bold">Summary Totals:</td>
                            <td className="py-2.5 px-3 text-center font-black">72</td>
                            <td className="py-2.5 px-3 text-right font-black text-emerald-800 font-mono">+1,240.00</td>
                            <td className="py-2.5 px-3 text-right font-black text-rose-800 font-mono">-680.00</td>
                            <td className="py-2.5 px-3 text-right font-black text-blue-900 font-mono">+560.00</td>
                            <td className="py-2.5 px-3 text-right font-black text-blue-950 font-mono">{formatMoney(530400000)}</td>
                            {showBranchCol && <td></td>}
                          </tr>
                        </tfoot>
                      </table>
                    ) : isReorderSuggestion ? (
                      /* 7. Reorder Suggestion Table (#84) */
                      <table className="w-full text-left text-xs custom-report-table">
                        <thead className="bg-[#24344d] text-white text-[11px] uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Item Code</th>
                            <th className="py-2.5 px-3">Item Description</th>
                            <th className="py-2.5 px-3">Unit</th>
                            <th className="py-2.5 px-3 text-right">Current Qty</th>
                            <th className="py-2.5 px-3 text-right">Min Qty</th>
                            <th className="py-2.5 px-3 text-right">Max Qty</th>
                            <th className="py-2.5 px-3 text-right">Reorder Point</th>
                            <th className="py-2.5 px-3 text-right">Suggested Order Qty</th>
                            <th className="py-2.5 px-3">Preferred Supplier</th>
                            <th className="py-2.5 px-3 text-right">Unit Cost ({currSymbol})</th>
                            <th className="py-2.5 px-3 text-right">Est. Total Cost ({currSymbol})</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium text-slate-700 bg-white">
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-slate-600">EVOO-16</td>
                            <td className="py-2 px-3 font-bold text-slate-900">زيت زيتون بلدي تنكة 16 لتر</td>
                            <td className="py-2 px-3">TIN</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-amber-600">8.00</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-500">20.00</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-500">60.00</td>
                            <td className="py-2 px-3 text-right font-mono font-semibold text-rose-600">15.00</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">40.00</td>
                            <td className="py-2 px-3 font-semibold text-slate-800">SOOL</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(6500000)}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatMoney(260000000)}</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-slate-600">OLV-GR-01</td>
                            <td className="py-2 px-3 font-bold text-slate-900">زيتون أخضر بلدي مكبوس 1 كغ</td>
                            <td className="py-2 px-3">JAR</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-rose-600">5.00</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-500">25.00</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-500">100.00</td>
                            <td className="py-2 px-3 text-right font-mono font-semibold text-rose-600">30.00</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">75.00</td>
                            <td className="py-2 px-3 font-semibold text-slate-800">SOOL</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(180000)}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatMoney(13500000)}</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-slate-600">OST1KGR</td>
                            <td className="py-2 px-3 font-bold text-slate-900">زعتر بلدي جودي</td>
                            <td className="py-2 px-3">KG</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-amber-600">12.00</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-500">30.00</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-500">120.00</td>
                            <td className="py-2 px-3 text-right font-mono font-semibold text-rose-600">25.00</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">80.00</td>
                            <td className="py-2 px-3 font-semibold text-slate-800">SOOL</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(900000)}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatMoney(72000000)}</td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-slate-100 font-bold text-slate-900 text-xs border-t-2 border-slate-300">
                          <tr>
                            <td colSpan={7} className="py-2.5 px-3 text-right">Total Reorder Suggestion:</td>
                            <td className="py-2.5 px-3 text-right font-black text-blue-900 font-mono">195.00</td>
                            <td colSpan={2}></td>
                            <td className="py-2.5 px-3 text-right font-black text-emerald-800 font-mono">{formatMoney(345500000)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    ) : isInventoryWorksheet ? (
                      /* 8. Inventory Worksheet Table (#701) */
                      <table className="w-full text-left text-xs custom-report-table">
                        <thead className="bg-[#24344d] text-white text-[11px] uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Item Code</th>
                            <th className="py-2.5 px-3">Item Description</th>
                            <th className="py-2.5 px-3">Unit</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3">Division</th>
                            <th className="py-2.5 px-3 text-right">System Qty</th>
                            <th className="py-2.5 px-3 text-right bg-blue-950/20">Physical Count</th>
                            <th className="py-2.5 px-3 text-right">Variance Qty</th>
                            <th className="py-2.5 px-3 text-right">Variance Cost ({currSymbol})</th>
                            <th className="py-2.5 px-3 text-center">Audit Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium text-slate-700 bg-white">
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-slate-600">OST1KGR</td>
                            <td className="py-2 px-3 font-bold text-slate-900">زعتر بلدي جودي</td>
                            <td className="py-2 px-3">KG</td>
                            <td className="py-2 px-3">مفرق</td>
                            <td className="py-2 px-3">كيلو مفرق</td>
                            <td className="py-2 px-3 text-right font-mono font-bold">13.48</td>
                            <td className="py-2 px-3 text-right font-mono font-bold bg-blue-50/50">13.00</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-rose-600">-0.48</td>
                            <td className="py-2 px-3 text-right font-mono text-rose-700">{formatMoney(-432000)}</td>
                            <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">Deficit</span></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-slate-600">MTB1KGR</td>
                            <td className="py-2 px-3 font-bold text-slate-900">زعتر ساقس</td>
                            <td className="py-2 px-3">KG</td>
                            <td className="py-2 px-3">مفرق</td>
                            <td className="py-2 px-3">كيلو مفرق</td>
                            <td className="py-2 px-3 text-right font-mono font-bold">9.51</td>
                            <td className="py-2 px-3 text-right font-mono font-bold bg-blue-50/50">10.00</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">+0.49</td>
                            <td className="py-2 px-3 text-right font-mono text-emerald-700">{formatMoney(132300)}</td>
                            <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Surplus</span></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-slate-600">EVOO-01</td>
                            <td className="py-2 px-3 font-bold text-slate-900">زيت زيتون بكر ممتاز 1 لتر</td>
                            <td className="py-2 px-3">BTL</td>
                            <td className="py-2 px-3">مفرق</td>
                            <td className="py-2 px-3">زيوت مفرق</td>
                            <td className="py-2 px-3 text-right font-mono font-bold">142.00</td>
                            <td className="py-2 px-3 text-right font-mono font-bold bg-blue-50/50">142.00</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-500">0.00</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-500">{formatMoney(0)}</td>
                            <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">Matched</span></td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-slate-100 font-bold text-slate-900 text-xs border-t-2 border-slate-300">
                          <tr>
                            <td colSpan={5} className="py-2.5 px-3 text-right">Audit Sheet Totals:</td>
                            <td className="py-2.5 px-3 text-right font-black font-mono">164.99</td>
                            <td className="py-2.5 px-3 text-right font-black font-mono">165.00</td>
                            <td className="py-2.5 px-3 text-right font-black font-mono text-blue-900">+0.01</td>
                            <td className="py-2.5 px-3 text-right font-black font-mono text-rose-700">{formatMoney(-299700)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    ) : isUserLogReport ? (
                      /* 9. User Log Report Table (#9) */
                      <table className="w-full text-left text-xs custom-report-table">
                        <thead className="bg-[#24344d] text-white text-[11px] uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Timestamp</th>
                            <th className="py-2.5 px-3">User</th>
                            <th className="py-2.5 px-3">Action</th>
                            <th className="py-2.5 px-3">Module</th>
                            <th className="py-2.5 px-3">Voucher Ref #</th>
                            <th className="py-2.5 px-3">Location / Branch</th>
                            <th className="py-2.5 px-3">Details / Audit Payload</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium text-slate-700 bg-white">
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-slate-600">07-Sep-2026 13:20:15</td>
                            <td className="py-2 px-3 font-bold text-slate-900">Mohammed Jichi</td>
                            <td className="py-2 px-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Post Invoice</span></td>
                            <td className="py-2 px-3 font-semibold text-slate-800">Commercial Sales</td>
                            <td className="py-2 px-3 font-semibold text-blue-600 font-mono">INV-2026-1044</td>
                            <td className="py-2 px-3">Zeit w zaytoun ljanoub</td>
                            <td className="py-2 px-3 text-slate-600">Posted dispatch to Koubeissi East for {formatMoney(61400000)}</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-slate-600">07-Sep-2026 12:45:00</td>
                            <td className="py-2 px-3 font-bold text-slate-900">Ahmad Dirani</td>
                            <td className="py-2 px-3"><span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">Record Wastage</span></td>
                            <td className="py-2 px-3 font-semibold text-slate-800">Lost Goods</td>
                            <td className="py-2 px-3 font-semibold text-blue-600 font-mono">WST-2026-088</td>
                            <td className="py-2 px-3">Choueifat Main Facility</td>
                            <td className="py-2 px-3 text-slate-600">Cracked glass jar recorded for OLV-GR-01 (Qty: 2)</td>
                          </tr>
                        </tbody>
                      </table>
                    ) : isRequisitionReport ? (
                      /* 10. Requisition & Transfers Summary Table (#63, #64, etc.) */
                      <table className="w-full text-left text-xs custom-report-table">
                        <thead className="bg-[#24344d] text-white text-[11px] uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Requisition #</th>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">{interBrand ? 'From Brand' : 'From Branch'}</th>
                            <th className="py-2.5 px-3">{interBrand ? 'To Brand' : 'To Branch'}</th>
                            <th className="py-2.5 px-3">From Location</th>
                            <th className="py-2.5 px-3">To Location</th>
                            <th className="py-2.5 px-3 text-center">Items Count</th>
                            <th className="py-2.5 px-3 text-right">Total Qty</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium text-slate-700 bg-white">
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-semibold text-blue-600 font-mono">REQ-2026-301</td>
                            <td className="py-2 px-3 font-mono text-slate-600">07-Sep-2026</td>
                            <td className="py-2 px-3 font-bold text-slate-900">Zeit w zaytoun ljanoub</td>
                            <td className="py-2 px-3 font-bold text-slate-900">Sidon Packaging Center</td>
                            <td className="py-2 px-3">Choueifat Main Facility</td>
                            <td className="py-2 px-3">Secondary Hub</td>
                            <td className="py-2 px-3 text-center font-mono">6</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">140.00</td>
                            <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Received</span></td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-semibold text-blue-600 font-mono">REQ-2026-302</td>
                            <td className="py-2 px-3 font-mono text-slate-600">06-Sep-2026</td>
                            <td className="py-2 px-3 font-bold text-slate-900">Zeit w zaytoun ljanoub</td>
                            <td className="py-2 px-3 font-bold text-slate-900">Beirut Gourmet Depot</td>
                            <td className="py-2 px-3">Choueifat Main Facility</td>
                            <td className="py-2 px-3">Dispatch Floor</td>
                            <td className="py-2 px-3 text-center font-mono">3</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">75.00</td>
                            <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">Pending Transit</span></td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-slate-100 font-bold text-slate-900 text-xs border-t-2 border-slate-300">
                          <tr>
                            <td colSpan={6} className="py-2.5 px-3 text-right">Total Transferred:</td>
                            <td className="py-2.5 px-3 text-center font-black">9</td>
                            <td className="py-2.5 px-3 text-right font-black font-mono text-blue-900">215.00</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    ) : isProductionReport ? (
                      /* 11. Production & Assemblies Table (#162, #295) */
                      <table className="w-full text-left text-xs custom-report-table">
                        <thead className="bg-[#24344d] text-white text-[11px] uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Batch #</th>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Finished Product</th>
                            <th className="py-2.5 px-3 text-right">Output Qty</th>
                            <th className="py-2.5 px-3">Unit</th>
                            <th className="py-2.5 px-3 text-right">Raw Material Cost ({currSymbol})</th>
                            <th className="py-2.5 px-3 text-right">Labor & Overhead ({currSymbol})</th>
                            <th className="py-2.5 px-3 text-right">Total Production Cost ({currSymbol})</th>
                            <th className="py-2.5 px-3 text-center">Batch Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium text-slate-700 bg-white">
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-semibold text-blue-600 font-mono">PRD-2026-052</td>
                            <td className="py-2 px-3 font-mono text-slate-600">07-Sep-2026</td>
                            <td className="py-2 px-3 font-bold text-slate-900">Extra Virgin Olive Oil 1L (Bottling Batch)</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">500.00</td>
                            <td className="py-2 px-3">BTL</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(195000000)}</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(30000000)}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatMoney(225000000)}</td>
                            <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Completed</span></td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-slate-100 font-bold text-slate-900 text-xs border-t-2 border-slate-300">
                          <tr>
                            <td colSpan={3} className="py-2.5 px-3 text-right">Total Production Output:</td>
                            <td className="py-2.5 px-3 text-right font-black font-mono">500.00</td>
                            <td></td>
                            <td className="py-2.5 px-3 text-right font-black font-mono">{formatMoney(195000000)}</td>
                            <td className="py-2.5 px-3 text-right font-black font-mono">{formatMoney(30000000)}</td>
                            <td className="py-2.5 px-3 text-right font-black text-blue-950 font-mono">{formatMoney(225000000)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    ) : isAdjustmentReport ? (
                      /* 12. Inventory Adjustments Table (#160) */
                      <table className="w-full text-left text-xs custom-report-table">
                        <thead className="bg-[#24344d] text-white text-[11px] uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Adjustment #</th>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Location</th>
                            <th className="py-2.5 px-3">Item Description</th>
                            <th className="py-2.5 px-3">Item Code</th>
                            <th className="py-2.5 px-3 text-center">Type</th>
                            <th className="py-2.5 px-3 text-right">Qty Adjusted</th>
                            <th className="py-2.5 px-3 text-right">Unit Cost ({currSymbol})</th>
                            <th className="py-2.5 px-3 text-right">Total Valuation Impact ({currSymbol})</th>
                            <th className="py-2.5 px-3">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium text-slate-700 bg-white">
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-semibold text-blue-600 font-mono">ADJ-2026-019</td>
                            <td className="py-2 px-3 font-mono text-slate-600">07-Sep-2026</td>
                            <td className="py-2 px-3">Choueifat Main Facility</td>
                            <td className="py-2 px-3 font-bold text-slate-900">زعتر بلدي جودي</td>
                            <td className="py-2 px-3 font-mono text-slate-600">OST1KGR</td>
                            <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">Decrease</span></td>
                            <td className="py-2 px-3 text-right font-bold text-rose-700 font-mono">-0.48 KG</td>
                            <td className="py-2 px-3 text-right font-mono">{formatMoney(900000)}</td>
                            <td className="py-2 px-3 text-right font-bold text-rose-900 font-mono">{formatMoney(-432000)}</td>
                            <td className="py-2 px-3 text-slate-700">Physical Stock Count Reconciliation</td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-slate-100 font-bold text-slate-900 text-xs border-t-2 border-slate-300">
                          <tr>
                            <td colSpan={6} className="py-2.5 px-3 text-right">Net Adjustment Impact:</td>
                            <td className="py-2.5 px-3 text-right font-black font-mono text-rose-800">-0.48</td>
                            <td></td>
                            <td className="py-2.5 px-3 text-right font-black font-mono text-rose-900">{formatMoney(-432000)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    ) : isListOfSuppliers ? (
                      /* 13. List of Suppliers Table (#30) */
                      <table className="w-full text-left text-xs custom-report-table">
                        <thead className="bg-[#24344d] text-white text-[11px] uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Supplier ID</th>
                            <th className="py-2.5 px-3">Supplier Name</th>
                            <th className="py-2.5 px-3">Contact Person</th>
                            <th className="py-2.5 px-3">Phone</th>
                            <th className="py-2.5 px-3">Email</th>
                            <th className="py-2.5 px-3">Currency</th>
                            <th className="py-2.5 px-3">Payment Terms</th>
                            <th className="py-2.5 px-3 text-right">Outstanding Balance ({currSymbol})</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium text-slate-700 bg-white">
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono font-bold text-blue-600">SUP-001</td>
                            <td className="py-2 px-3 font-bold text-slate-900">SOOL - Southern Olive Oil Labs</td>
                            <td className="py-2 px-3">Hassan Dirani</td>
                            <td className="py-2 px-3 font-mono">+961 7 720 001</td>
                            <td className="py-2 px-3 text-blue-600">procurement@sool-lebanon.com</td>
                            <td className="py-2 px-3 font-bold">USD</td>
                            <td className="py-2 px-3">Net 30 Days</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatMoney(158000000)}</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono font-bold text-blue-600">SUP-002</td>
                            <td className="py-2 px-3 font-bold text-slate-900">Mediterranean Harvest S.A.L</td>
                            <td className="py-2 px-3">Karim Chahine</td>
                            <td className="py-2 px-3 font-mono">+961 1 880 234</td>
                            <td className="py-2 px-3 text-blue-600">contact@med-harvest.com</td>
                            <td className="py-2 px-3 font-bold">USD</td>
                            <td className="py-2 px-3">Cash on Delivery</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700 font-mono">{formatMoney(0)}</td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-slate-100 font-bold text-slate-900 text-xs border-t-2 border-slate-300">
                          <tr>
                            <td colSpan={7} className="py-2.5 px-3 text-right">Total Supplier Payables:</td>
                            <td className="py-2.5 px-3 text-right font-black font-mono text-blue-900">{formatMoney(158000000)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    ) : (
                      /* 14. Live Inventory / Stock Movement / History Reports (#1, #106, etc.) */
                      <table className="w-full text-left text-xs custom-report-table">
                        <thead className="bg-[#24344d] text-white text-[11px] uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Item Description</th>
                            <th className="py-2.5 px-3">Item Code</th>
                            <th className="py-2.5 px-3 text-right">Qty On Hand</th>
                            <th className="py-2.5 px-3">Unit</th>
                            {!hideCost && <th className="py-2.5 px-3 text-right">Unit Cost ({currSymbol})</th>}
                            {!hideCost && <th className="py-2.5 px-3 text-right">Total Cost ({currSymbol})</th>}
                            {showBranchCol && <th className="py-2.5 px-3">Branch</th>}
                            <th className="py-2.5 px-3">Location</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3">Division</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium text-slate-700 bg-white">
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">زعتر بلدي جودي</td>
                            <td className="py-2 px-3 font-mono text-slate-600">OST1KGR</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700 font-mono">13.48</td>
                            <td className="py-2 px-3">KG</td>
                            {!hideCost && <td className="py-2 px-3 text-right font-mono">{formatMoney(900000)}</td>}
                            {!hideCost && <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatMoney(12132000)}</td>}
                            {showBranchCol && <td className="py-2 px-3">Zeit w zaytoun ljanoub</td>}
                            <td className="py-2 px-3">Choueifat Main Facility</td>
                            <td className="py-2 px-3">مفرق</td>
                            <td className="py-2 px-3">كيلو مفرق</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">زعتر ساقس</td>
                            <td className="py-2 px-3 font-mono text-slate-600">MTB1KGR</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700 font-mono">9.51</td>
                            <td className="py-2 px-3">KG</td>
                            {!hideCost && <td className="py-2 px-3 text-right font-mono">{formatMoney(270000)}</td>}
                            {!hideCost && <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatMoney(2567700)}</td>}
                            {showBranchCol && <td className="py-2 px-3">Zeit w zaytoun ljanoub</td>}
                            <td className="py-2 px-3">Choueifat Main Facility</td>
                            <td className="py-2 px-3">مفرق</td>
                            <td className="py-2 px-3">كيلو مفرق</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">زيت زيتون بكر ممتاز 1 لتر</td>
                            <td className="py-2 px-3 font-mono text-slate-600">EVOO-01</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700 font-mono">142.00</td>
                            <td className="py-2 px-3">BTL</td>
                            {!hideCost && <td className="py-2 px-3 text-right font-mono">{formatMoney(450000)}</td>}
                            {!hideCost && <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatMoney(63900000)}</td>}
                            {showBranchCol && <td className="py-2 px-3">Zeit w zaytoun ljanoub</td>}
                            <td className="py-2 px-3">Choueifat Main Facility</td>
                            <td className="py-2 px-3">مفرق</td>
                            <td className="py-2 px-3">زيوت مفرق</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">زيت زيتون بلدي تنكة 16 لتر</td>
                            <td className="py-2 px-3 font-mono text-slate-600">EVOO-16</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700 font-mono">38.00</td>
                            <td className="py-2 px-3">TIN</td>
                            {!hideCost && <td className="py-2 px-3 text-right font-mono">{formatMoney(6500000)}</td>}
                            {!hideCost && <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatMoney(247000000)}</td>}
                            {showBranchCol && <td className="py-2 px-3">Zeit w zaytoun ljanoub</td>}
                            <td className="py-2 px-3">Choueifat Main Facility</td>
                            <td className="py-2 px-3">جملة</td>
                            <td className="py-2 px-3">زيوت جملة</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">زيتون أخضر بلدي مكبوس 1 كغ</td>
                            <td className="py-2 px-3 font-mono text-slate-600">OLV-GR-01</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700 font-mono">65.00</td>
                            <td className="py-2 px-3">JAR</td>
                            {!hideCost && <td className="py-2 px-3 text-right font-mono">{formatMoney(180000)}</td>}
                            {!hideCost && <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">{formatMoney(11700000)}</td>}
                            {showBranchCol && <td className="py-2 px-3">Zeit w zaytoun ljanoub</td>}
                            <td className="py-2 px-3">Choueifat Main Facility</td>
                            <td className="py-2 px-3">مفرق</td>
                            <td className="py-2 px-3">زيتون مفرق</td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-slate-100 font-bold text-slate-900 text-xs border-t-2 border-slate-300">
                          <tr>
                            <td colSpan={2} className="py-2.5 px-3 text-right">Subtotal:</td>
                            <td className="py-2.5 px-3 text-right font-black text-emerald-800 font-mono">267.99</td>
                            <td colSpan={!hideCost ? 2 : 1}></td>
                            {!hideCost && <td className="py-2.5 px-3 text-right font-black text-blue-900 font-mono">{formatMoney(337299700)}</td>}
                            <td colSpan={showBranchCol ? 4 : 3}></td>
                          </tr>
                        </tfoot>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* REPORT FOOTER PAGINATION BAR (Matching User Specifications) */}
              {hasFiltered && (
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 print:hidden z-10 bg-white">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                      className="p-1.5 rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="First Page"
                    >
                      <ChevronsLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      className="p-1.5 rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <span className="px-3 font-semibold text-slate-800">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      className="p-1.5 rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Next Page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      className="p-1.5 rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Last Page"
                    >
                      <ChevronsRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-slate-500">
                    <span>
                      Total Records:{' '}
                      <strong className="text-slate-800">
                        {isPurchaseWithDetails ? (showTaxes ? '1,842' : '1,128') : '426'} items
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Status:{' '}
                      <strong className="text-emerald-600">Active Database Connection</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TOOLBAR SETTINGS MODAL                                                 */}
      {/* ========================================================================= */}
      {toolbarSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-600" />
                <span>Toolbar Categories Settings</span>
              </h3>
              <button
                type="button"
                onClick={() => setToolbarSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-500 leading-relaxed">
                Select the report modules you want pinned to the top quick-access toolbar (maximum 8 allowed).
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  'Sales',
                  'Input Forms',
                  'Lists',
                  'Purchases',
                  'Stock Movement',
                  'Transactions',
                  'Reordering',
                  'Inventory'
                ].map((cat) => {
                  const isChecked = toolbarCategories.includes(cat);
                  return (
                    <label
                      key={cat}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleToolbarCategory(cat)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>{cat}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setToolbarSettingsOpen(false)}
                className="bg-[#2a3649] hover:bg-[#1e2736] text-white text-xs font-bold px-5 py-2 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. REPORTS BUILDER MODAL - PERMANENT ACTIVATION                           */}
      {/* ========================================================================= */}
      {reportBuilderOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-800">Vanguard Report Builder</h3>
                  <div className="text-[11px] text-slate-500">Custom Dynamic Query & Report Engine</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReportBuilderOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* License Activation Strip */}
            <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Enterprise License: ACTIVE & AUTHORIZED</span>
              </div>
              <span className="text-[11px] font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                UNLOCKED
              </span>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500">Tenant / Company:</span>
                  <span className="font-bold text-slate-900">Southern Olive Oil Products S.A.L.</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500">Authorised By:</span>
                  <span className="font-bold text-blue-700">Vanguard ERP Systems Global</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500">Master License Key:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    VNG-LIC-2026-SOUTHERN-OLIVE-ULTIMATE-UNLIMITED-X992
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500">Expiration:</span>
                  <span className="font-bold text-emerald-700">Perpetual / Unlimited</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Select Report Template to Customize</label>
                <select className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs">
                  <option value="inv">Custom Inventory Balances with Multi-Currency Valuation</option>
                  <option value="purch">Custom Purchasing Analysis by Regional Syndicate</option>
                  <option value="wast">Custom Wastage Reconciliation by Employee & Cause</option>
                  <option value="sales">Custom Daily Sales Velocity vs Theoretical Target</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Export Format</label>
                  <select className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs">
                    <option value="csv">Standard UTF-8 CSV</option>
                    <option value="excel">Microsoft Excel (.xlsx)</option>
                    <option value="pdf">Print-Ready PDF</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Aggregation Granularity</label>
                  <select className="w-full bg-white border border-[#cbd5e1] rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs">
                    <option value="daily">Daily Aggregation</option>
                    <option value="monthly">Monthly Rollup</option>
                    <option value="quarterly">Quarterly Breakdown</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                All report modules unlocked and ready for design.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReportBuilderOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleExportCSV();
                    setReportBuilderOpen(false);
                  }}
                  className="bg-[#246d3e] hover:bg-[#1a512e] text-white text-xs font-bold px-5 py-2 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Build & Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}