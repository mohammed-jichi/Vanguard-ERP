'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  TrendingUp,
  ShoppingCart,
  Trash2,
  Sliders,
  Archive,
  Bell,
  RefreshCw,
  FileText,
  BarChart3,
  Layers,
  DollarSign,
  Info,
  X,
  Printer,
  ChevronDown,
  ChevronUp,
  Building2,
  Calendar,
  Box,
  Users,
  PieChart,
  CheckCircle2,
  AlertTriangle,
  Search,
  ArrowUpDown,
  Download,
  Menu,
  ExternalLink,
  ChevronRight,
  Package,
  Factory,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Filter,
  CreditCard,
  Monitor,
  CheckSquare,
  Clock,
  Send,
  UserCheck
} from 'lucide-react';
import ProductInsightsView from '@/components/ProductInsightsView';
import PurchasesView from '@/components/PurchasesView';
import SalesDashboard from '@/components/SalesDashboard';
import SalesTeamPerformanceView from '@/components/SalesTeamPerformanceView';
import CustomerInsightsView from '@/components/CustomerInsightsView';
import { useTenant } from '@/lib/TenantContext';
import { getBranchData, getAllBranchesList, ALL_BRANCHES_CONSOLIDATED, BranchInfo } from '@/lib/branchData';

// Types for Dialog Records
interface SalesRecord {
  id: number;
  REFERENCE: string;
  CUSTOMER: string;
  COMPANY: string;
  TOTAL: number;
  DATE: string;
  BARANCHNAME: string;
}

interface PurchaseRecord {
  id: number;
  INVOICENUMBER: string;
  SUPPLIERNAME: string;
  SUBTOTAL: number;
  PURCHASEDATE: string;
  BARANCHNAME: string;
}

interface WastageRecord {
  id: number;
  SER: string;
  COST: number;
  DDATE: string;
  BARANCHNAME: string;
  REASON: string;
}

interface VarianceRecord {
  SER: number;
  PRODUCT: string;
  VARIANCE: number;
  LOCATION: string;
  ADATE: string;
  BARANCHNAME: string;
}

interface StockRecord {
  CATEGORYNAME: string;
  AMOUNT: number;
  QTY: number;
}

function OperationsDashboardContent() {
  const { currentTenant } = useTenant();
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get('tab');

  // Filters matching Vanguard toolbar exact specs
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('9');
  const [showNegatives, setShowNegatives] = useState<boolean>(false);
  const [recalculating, setRecalculating] = useState<boolean>(false);
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);
  const [recalcToast, setRecalcToast] = useState<string | null>(null);

  // Dynamic Branch Resolution
  const currentBranchData: BranchInfo = useMemo(() => {
    return getBranchData(selectedBranch === '0' ? 'ALL' : selectedBranch);
  }, [selectedBranch]);

  const allBranchesList = useMemo(() => {
    return getAllBranchesList();
  }, []);

  // Active Tab: general (Stock Movements), comparative, cost, stock, product_insights, purchases_dash, sales_dash, sales_team, customer_insights
  const [activeTab, setActiveTab] = useState<string>(tabQuery || 'general');

  useEffect(() => {
    if (tabQuery) {
      setActiveTab(tabQuery);
    }
  }, [tabQuery]);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState<boolean>(false);
  const [expiryWarningDismissed, setExpiryWarningDismissed] = useState<boolean>(false);

  // Quantity Not Received Drawer State
  const [showQtyNotReceived, setShowQtyNotReceived] = useState<boolean>(false);
  const [qtyNotReceivedTab, setQtyNotReceivedTab] = useState<'requests' | 'transfers'>('requests');

  // Action Modals State
  const [activeActionModal, setActiveActionModal] = useState<'sync' | 'reorder' | 'checklist' | 'endOfMonth' | null>(null);
  const [syncBranch, setSyncBranch] = useState<string>('ALL');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isEndingMonth, setIsEndingMonth] = useState<boolean>(false);

  // Accordions in Stock Movements (#general)
  const [openAccordion, setOpenAccordion] = useState<{ [key: string]: boolean }>({
    transactions: true,
    purchase: true,
    wastage: true,
    production: true,
    adjustment: true,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordion(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Accordions in Comparative (#comparative)
  const [openComparativeAccordion, setOpenComparativeAccordion] = useState<{ [key: string]: boolean }>({
    salesCat: true,
    purchaseCat: true,
    purchaseMonth: true,
    wastageMonth: true
  });

  const toggleComparativeAccordion = (key: string) => {
    setOpenComparativeAccordion(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Accordions in Cost (#cost)
  const [openCostAccordion, setOpenCostAccordion] = useState<{ [key: string]: boolean }>({
    realCost: true,
    idealProfit: true
  });

  const toggleCostAccordion = (key: string) => {
    setOpenCostAccordion(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Accordions in Stock (#stock)
  const [openStockAccordion, setOpenStockAccordion] = useState<{ [key: string]: boolean }>({
    expired: true,
    outofstock: true,
    belowmin: true,
    categoryStock: true
  });

  const toggleStockAccordion = (key: string) => {
    setOpenStockAccordion(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Out of stock branch filter
  const [outOfStockBranchFilter, setOutOfStockBranchFilter] = useState<string>('0');
  const [expandedOutOfStockBranches, setExpandedOutOfStockBranches] = useState<{ [key: string]: boolean }>({
    'branch-1': true,
    'branch-2': true,
    'branch-3': true
  });

  // Modal Dialogs for the 5 Boxes' "i" marks
  const [activeModal, setActiveModal] = useState<'sales' | 'purchase' | 'wastage' | 'variance' | 'stock' | 'expiry' | null>(null);

  // Format Currency
  const formatCurrency = (amount: number) => {
    const val = amount * (selectedCurrency === 'USD' ? 1 : 89500);
    if (selectedCurrency === 'USD') {
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} L.L`;
  };

  // 1. Sales Dialog Records (Last 10 Transactions)
  const salesList: SalesRecord[] = [
    { id: 1, REFERENCE: 'INV-4000035', CUSTOMER: 'Abou Hamza', COMPANY: 'Abou Hamza Nuts & Oils', TOTAL: 23940000 / 89500, DATE: '2026-09-04', BARANCHNAME: '00001 - Main Branch' },
    { id: 2, REFERENCE: 'INV-4000036', CUSTOMER: 'George Haddad', COMPANY: 'Beirut Gourmet House', TOTAL: 18450000 / 89500, DATE: '2026-09-04', BARANCHNAME: '00001 - Main Branch' },
    { id: 3, REFERENCE: 'INV-4000037', CUSTOMER: 'Fadi Mroueh', COMPANY: 'Nabatieh Southern Hub', TOTAL: 34100000 / 89500, DATE: '2026-09-03', BARANCHNAME: '00001 - Main Branch' },
    { id: 4, REFERENCE: 'INV-4000038', CUSTOMER: 'Salim Kassir', COMPANY: 'Saida Wholesalers', TOTAL: 12500000 / 89500, DATE: '2026-09-03', BARANCHNAME: '00001 - Main Branch' },
    { id: 5, REFERENCE: 'INV-4000039', CUSTOMER: 'Karim Daher', COMPANY: 'Tyre Hospitality Stores', TOTAL: 9800000 / 89500, DATE: '2026-09-02', BARANCHNAME: '00001 - Main Branch' },
    { id: 6, REFERENCE: 'INV-4000040', CUSTOMER: 'Ziad Al-Amin', COMPANY: 'Al-Amin Superstores', TOTAL: 41200000 / 89500, DATE: '2026-09-02', BARANCHNAME: '00001 - Main Branch' },
    { id: 7, REFERENCE: 'INV-4000041', CUSTOMER: 'Hassan Srour', COMPANY: 'Choueifat Depot Direct', TOTAL: 15600000 / 89500, DATE: '2026-09-01', BARANCHNAME: '00001 - Main Branch' },
    { id: 8, REFERENCE: 'INV-4000042', CUSTOMER: 'Nabil Khoury', COMPANY: 'Khoury Food & Oils', TOTAL: 27800000 / 89500, DATE: '2026-08-31', BARANCHNAME: '00001 - Main Branch' },
    { id: 9, REFERENCE: 'INV-4000043', CUSTOMER: 'Samir Bazzi', COMPANY: 'Bint Jbeil Retailers', TOTAL: 8900000 / 89500, DATE: '2026-08-30', BARANCHNAME: '00001 - Main Branch' },
    { id: 10, REFERENCE: 'INV-4000044', CUSTOMER: 'Ahmad Chehab', COMPANY: 'Saida Wholesalers', TOTAL: 38200000 / 89500, DATE: '2026-08-29', BARANCHNAME: '00001 - Main Branch' },
  ];

  // 2. Purchase Dialog Records (Last 10 Transactions)
  const purchaseList: PurchaseRecord[] = [
    { id: 1, INVOICENUMBER: 'PO-9821', SUPPLIERNAME: 'Koura Olive Growers Syndicate', SUBTOTAL: 45000.00, PURCHASEDATE: '2026-09-04', BARANCHNAME: '00001 - Main Branch' },
    { id: 2, INVOICENUMBER: 'PO-9822', SUPPLIERNAME: 'Akkar Organic Farmers Guild', SUBTOTAL: 32500.00, PURCHASEDATE: '2026-09-03', BARANCHNAME: '00001 - Main Branch' },
    { id: 3, INVOICENUMBER: 'PO-9823', SUPPLIERNAME: 'Lebanon Glassworks S.A.L', SUBTOTAL: 18400.00, PURCHASEDATE: '2026-09-02', BARANCHNAME: '00001 - Main Branch' },
    { id: 4, INVOICENUMBER: 'PO-9824', SUPPLIERNAME: 'Italian Stainless Caps & Filters Co.', SUBTOTAL: 8900.00, PURCHASEDATE: '2026-08-30', BARANCHNAME: '00001 - Main Branch' },
    { id: 5, INVOICENUMBER: 'PO-9825', SUPPLIERNAME: 'Hasbaya Olive Tree Farms', SUBTOTAL: 27600.00, PURCHASEDATE: '2026-08-28', BARANCHNAME: '00001 - Main Branch' },
    { id: 6, INVOICENUMBER: 'PO-9826', SUPPLIERNAME: 'Marjeyoun Agricultural Supply', SUBTOTAL: 14200.00, PURCHASEDATE: '2026-08-26', BARANCHNAME: '00001 - Main Branch' },
    { id: 7, INVOICENUMBER: 'PO-9827', SUPPLIERNAME: 'Mediterranean Label Printing Press', SUBTOTAL: 6500.00, PURCHASEDATE: '2026-08-24', BARANCHNAME: '00001 - Main Branch' },
    { id: 8, INVOICENUMBER: 'PO-9828', SUPPLIERNAME: 'Tyre Bio-Agronomy Co.', SUBTOTAL: 11200.00, PURCHASEDATE: '2026-08-20', BARANCHNAME: '00001 - Main Branch' },
  ];

  // 3. Wastage Dialog Records (Last 10 Transactions)
  const wastageList: WastageRecord[] = [
    { id: 1, SER: 'WST-2026-089', COST: 1250.00, DDATE: '2026-09-02', BARANCHNAME: '00001 - Main Branch', REASON: 'Glass Bottle Breakage during conveyor boxing' },
    { id: 2, SER: 'WST-2026-088', COST: 890.00, DDATE: '2026-08-29', BARANCHNAME: '00001 - Main Branch', REASON: 'Sediment residue filter drain cleaning' },
    { id: 3, SER: 'WST-2026-087', COST: 420.00, DDATE: '2026-08-27', BARANCHNAME: '00001 - Main Branch', REASON: 'Cap leak on 500ml sample tins' },
    { id: 4, SER: 'WST-2026-086', COST: 310.00, DDATE: '2026-08-24', BARANCHNAME: '00001 - Main Branch', REASON: 'Pallet drop during forklift staging' },
    { id: 5, SER: 'WST-2026-085', COST: 680.00, DDATE: '2026-08-21', BARANCHNAME: '00001 - Main Branch', REASON: 'Olive pressing calibration waste' },
  ];

  // 4. Variance Dialog Records (Last 10 Transactions)
  const varianceList: VarianceRecord[] = [
    { SER: 1, PRODUCT: 'Extra Virgin Olive Oil 500ml Glass', VARIANCE: -4, LOCATION: 'Choueifat Main Facility', ADATE: '2026-09-01', BARANCHNAME: '00001 - Main Branch' },
    { SER: 2, PRODUCT: 'Virgin Olive Oil 1L Tin', VARIANCE: +2, LOCATION: 'Choueifat Main Facility', ADATE: '2026-08-31', BARANCHNAME: '00001 - Main Branch' },
    { SER: 3, PRODUCT: 'Extra Virgin Olive Oil 16L Bulk Tin', VARIANCE: -1, LOCATION: 'Choueifat Main Facility', ADATE: '2026-08-28', BARANCHNAME: '00001 - Main Branch' },
    { SER: 4, PRODUCT: 'Traditional Castile Soap Bar 150g', VARIANCE: +12, LOCATION: 'Choueifat Main Facility', ADATE: '2026-08-25', BARANCHNAME: '00001 - Main Branch' },
    { SER: 5, PRODUCT: 'Organic Cured Green Olives 1kg Jar', VARIANCE: -3, LOCATION: 'Choueifat Main Facility', ADATE: '2026-08-22', BARANCHNAME: '00001 - Main Branch' },
  ];

  // 5. Stock Categories Breakdown
  const stockCategories: StockRecord[] = [
    { CATEGORYNAME: 'Extra Virgin Olive Oil (EVOO)', AMOUNT: 184500.00, QTY: 4280 },
    { CATEGORYNAME: 'Virgin Olive Oil (VOO)', AMOUNT: 96200.00, QTY: 2950 },
    { CATEGORYNAME: 'Pomace & Refined Olive Oil', AMOUNT: 38400.00, QTY: 1400 },
    { CATEGORYNAME: 'Table Olives & Pickled Specialties', AMOUNT: 42800.00, QTY: 3120 },
    { CATEGORYNAME: 'Pure Olive Oil Soaps & Cosmetics', AMOUNT: 28900.00, QTY: 5600 },
    { CATEGORYNAME: 'Packaging Materials & Glass Bottles', AMOUNT: 22100.00, QTY: 18500 },
  ];

  // Stock Movements Transaction Matrix (Category vs Sales, Purchase, Wastage, Variance)
  const transactionsCategoryData = [
    { category: 'Extra Virgin Olive Oil', sales: 118400, purchase: 85200, wastage: 1840, variance: -420 },
    { category: 'Virgin Olive Oil', sales: 64200, purchase: 42100, wastage: 960, variance: +150 },
    { category: 'Pomace & Refined Oil', sales: 24800, purchase: 16800, wastage: 540, variance: -80 },
    { category: 'Table Olives & Pickles', sales: 22100, purchase: 11400, wastage: 810, variance: +40 },
    { category: 'Soaps & Olive Cosmetics', sales: 14200, purchase: 6200, wastage: 320, variance: +120 },
    { category: 'Packaging & Empty Glass', sales: 4800, purchase: 2500, wastage: 350, variance: -30 },
  ];

  // Purchase by Category Data
  const purchaseCategoryData = [
    { category: 'Raw Olives (Koura & South)', allBranches: 68400, b1: 45000, b2: 15400, b3: 5200, b4: 2800 },
    { category: 'Glass Bottles & Closures', allBranches: 38200, b1: 24000, b2: 8200, b3: 4100, b4: 1900 },
    { category: 'Tin Containers (5L, 16L)', allBranches: 28900, b1: 18500, b2: 6400, b3: 2800, b4: 1200 },
    { category: 'Organic Herbs & Sea Salt', allBranches: 16200, b1: 10200, b2: 3600, b3: 1600, b4: 800 },
    { category: 'Cosmetic Lye & Essential Oils', allBranches: 12500, b1: 8500, b2: 2600, b3: 1000, b4: 400 },
  ];

  // Purchase by Supplier Data
  const purchaseSupplierData = [
    { supplier: 'Koura Olive Growers Syndicate', amount: 45000 },
    { supplier: 'Akkar Organic Farmers Guild', amount: 32500 },
    { supplier: 'Lebanon Glassworks S.A.L', amount: 24000 },
    { supplier: 'Hasbaya Olive Tree Farms', amount: 22000 },
    { supplier: 'Italian Stainless Caps & Filters Co.', amount: 18500 },
    { supplier: 'Marjeyoun Agricultural Supply', amount: 12200 },
    { supplier: 'Mediterranean Label Printing Press', amount: 10000 },
  ];

  // Wastage by Category Data
  const wastageCategoryData = [
    { category: 'Finished Bottled Goods (Glass breakage)', amount: 2150 },
    { category: 'Pressing Filtration Residue', amount: 1420 },
    { category: 'Cap & Seal Calibration Leakage', amount: 780 },
    { category: 'Transit Conveyor Scuffs', amount: 470 },
  ];

  // Wastage by Supplier Data
  const wastageSupplierData = [
    { supplier: 'Lebanon Glassworks S.A.L', amount: 1850 },
    { supplier: 'Mediterranean Label Printing Press', amount: 1240 },
    { supplier: 'Italian Stainless Caps & Filters Co.', amount: 980 },
    { supplier: 'Direct Pressing Calibration', amount: 750 },
  ];

  // Wastage by Type Data
  const wastageTypeData = [
    { type: 'Glass / Fragile Breakage', amount: 2450 },
    { type: 'Quality Rejection & Sediment', amount: 1350 },
    { type: 'Expired Quality Assurance Samples', amount: 640 },
    { type: 'Handling & Warehouse Scratches', amount: 380 },
  ];

  // Production by Division Data
  const productionDivisionData = [
    { division: 'Mechanical Pressing Line A (Cold Press)', allBranches: 124000, b1: 88000, b2: 36000, b3: 0, b4: 0 },
    { division: 'Centrifugal Extraction Mill B', allBranches: 94500, b1: 68000, b2: 26500, b3: 0, b4: 0 },
    { division: 'Automatic Bottling & Nitrogen Purge', allBranches: 82000, b1: 58000, b2: 24000, b3: 0, b4: 0 },
    { division: 'Soap Saponification & Curing Chambers', allBranches: 34000, b1: 22000, b2: 12000, b3: 0, b4: 0 },
    { division: 'Table Olive Brining & Fermentation', allBranches: 48000, b1: 31000, b2: 17000, b3: 0, b4: 0 },
  ];

  // Adjustment by Category Data
  const adjustmentCategoryData = [
    { category: 'Extra Virgin Olive Oil', amount: -420 },
    { category: 'Virgin Olive Oil', amount: +150 },
    { category: 'Pomace & Refined Oil', amount: -80 },
    { category: 'Table Olives & Pickles', amount: +40 },
    { category: 'Soaps & Cosmetics', amount: +120 },
  ];

  // Comparative Matrix Data: Branches x Categories with percentages
  const comparativeCategories = [
    'Extra Virgin Olive Oil',
    'Virgin Olive Oil',
    'Pomace & Refined',
    'Table Olives',
    'Soaps & Cosmetics',
    'Packaging & Glass'
  ];

  const comparativeRows = [
    {
      branch: '00001 - Main Branch',
      vals: [112000, 58000, 24000, 26000, 18000, 15000],
      total: 253000
    }
  ];

  const comparativeTotals = [
    comparativeRows.reduce((a, r) => a + r.vals[0], 0),
    comparativeRows.reduce((a, r) => a + r.vals[1], 0),
    comparativeRows.reduce((a, r) => a + r.vals[2], 0),
    comparativeRows.reduce((a, r) => a + r.vals[3], 0),
    comparativeRows.reduce((a, r) => a + r.vals[4], 0),
    comparativeRows.reduce((a, r) => a + r.vals[5], 0),
  ];
  const comparativeGrandTotal = comparativeRows.reduce((a, r) => a + r.total, 0);

  // Purchases Comparative Matrix by Category
  const purchaseComparativeRows = [
    {
      branch: '00001 - Main Branch',
      vals: [45000, 24000, 18500, 10200, 8500, 18400],
      total: 124600
    }
  ];

  const purchaseComparativeTotals = [
    purchaseComparativeRows.reduce((a, r) => a + r.vals[0], 0),
    purchaseComparativeRows.reduce((a, r) => a + r.vals[1], 0),
    purchaseComparativeRows.reduce((a, r) => a + r.vals[2], 0),
    purchaseComparativeRows.reduce((a, r) => a + r.vals[3], 0),
    purchaseComparativeRows.reduce((a, r) => a + r.vals[4], 0),
    purchaseComparativeRows.reduce((a, r) => a + r.vals[5], 0),
  ];
  const purchaseComparativeGrandTotal = purchaseComparativeRows.reduce((a, r) => a + r.total, 0);

  // Dynamic Months List based on selected Year & Month
  const allMonthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const activeMonthsList = useMemo(() => {
    if (selectedMonth === '0') return allMonthsList;
    const mIdx = parseInt(selectedMonth, 10) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      return [allMonthsList[mIdx]];
    }
    return allMonthsList;
  }, [selectedMonth]);

  // Purchases by Month Matrix Data
  const purchaseMonthRows = [
    {
      branch: '00001 - Main Branch',
      vals: [9200, 11400, 10800, 8900, 9600, 10500, 11200, 12400, 14200, 10800, 8600, 7000]
    }
  ];

  // Lost Goods by Month Matrix Data
  const wastageMonthRows = [
    {
      branch: '00001 - Main Branch',
      vals: [180, 210, 195, 160, 175, 230, 240, 280, 310, 220, 190, 150]
    }
  ];

  // Real Cost of Goods Sold (COGS) Extended Data (Matching Omega Real Cost Matrix)
  const cogsData = [
    { category: 'Extra Virgin Olive Oil', beginning: 198000, purchase: 45000, ending: 184500, cogs: 58500, netSales: 118400, grossProfit: 59900 },
    { category: 'Virgin Olive Oil', beginning: 104000, purchase: 32500, ending: 96200, cogs: 40300, netSales: 64200, grossProfit: 23900 },
    { category: 'Pomace & Refined Oil', beginning: 42000, purchase: 11000, ending: 38400, cogs: 14600, netSales: 24800, grossProfit: 10200 },
    { category: 'Table Olives & Pickles', beginning: 46000, purchase: 14500, ending: 42800, cogs: 17700, netSales: 22100, grossProfit: 4400 },
    { category: 'Pure Olive Oil Soaps & Cosmetics', beginning: 31000, purchase: 8200, ending: 28900, cogs: 10300, netSales: 14200, grossProfit: 3900 },
    { category: 'Packaging & Glass Materials', beginning: 24500, purchase: 18400, ending: 22100, cogs: 20800, netSales: 4800, grossProfit: -16000 },
  ];

  // Theoretical / Ideal Profit by Category Data (Matching Omega Ideal Profit Matrix)
  const idealProfitData = [
    { category: 'Extra Virgin Olive Oil', sales: 118400, cost: 58500 },
    { category: 'Virgin Olive Oil', sales: 64200, cost: 40300 },
    { category: 'Pomace & Refined Oil', sales: 24800, cost: 14600 },
    { category: 'Table Olives & Pickles', sales: 22100, cost: 17700 },
    { category: 'Pure Olive Oil Soaps & Cosmetics', sales: 14200, cost: 10300 },
    { category: 'Packaging & Glass Materials', sales: 4800, cost: 20800 },
  ];

  const totalIdealSales = idealProfitData.reduce((a, b) => a + b.sales, 0);
  const totalIdealCost = idealProfitData.reduce((a, b) => a + b.cost, 0);

  // Expired Items in Stock Tab
  const expiredItems = [
    { branch: '00001 - Main Branch', location: 'Choueifat Main Facility', product: 'Traditional Cured Black Olives 500g', qty: 24.00, expiry: '2026-08-25' },
    { branch: '00001 - Main Branch', location: 'Choueifat Main Facility', product: 'Olive Blossom Infused Hand Balm 50ml', qty: 12.00, expiry: '2026-08-28' },
    { branch: '00001 - Main Branch', location: 'Choueifat Main Facility', product: 'Extra Virgin Early Harvest 250ml', qty: 18.00, expiry: '2026-09-15' },
    { branch: '00001 - Main Branch', location: 'Choueifat Main Facility', product: 'Castile Liquid Soap 1L Refill', qty: 8.00, expiry: '2026-09-20' },
  ];

  // Out of Stock Items Data
  const outOfStockBranches = [
    {
      id: 'branch-1',
      branchId: '00001',
      branchName: '00001 - Main Branch',
      items: [
        { name: 'Organic Green Olive Paste with Thyme 200g', qty: 0.00 },
        { name: 'Cold Pressed Sesame & Olive Blended Oil 750ml', qty: 0.00 },
        { name: 'Handcrafted Laurel & Olive Oil Shaving Bar', qty: 0.00 },
        { name: 'Extra Virgin Ceramic Artisan Cruet 500ml', qty: 0.00 },
        { name: 'Cracked Green Olives with Wild Lemon 1kg', qty: 0.00 },
        { name: 'Olive Leaf Herbal Infusion Tea 100g', qty: 0.00 },
      ]
    }
  ];

  // Below Minimum Stock Level Items Data
  const belowMinStockItems = [
    { branch: '00001 - Main Branch', location: 'Choueifat Main Facility', product: 'Extra Virgin Olive Oil 500ml Glass', minQty: 500, qtyOH: 120 },
    { branch: '00001 - Main Branch', location: 'Choueifat Main Facility', product: 'Dark Green Marasca Glass Bottles 500ml', minQty: 2500, qtyOH: 840 },
    { branch: '00001 - Main Branch', location: 'Choueifat Main Facility', product: 'Virgin Olive Oil 1L Tin', minQty: 200, qtyOH: 45 },
    { branch: '00001 - Main Branch', location: 'Choueifat Main Facility', product: 'Table Olives Stuffed with Almond 500g', minQty: 150, qtyOH: 28 },
    { branch: '00001 - Main Branch', location: 'Choueifat Main Facility', product: 'Castile Soap Unscented 150g Bar', minQty: 300, qtyOH: 75 },
  ];

  // Quantity Not Received Records (Matching Omega getInventoryQtyNotReceived)
  const pendingProductRequests = [
    { reqNo: 'PR-2026-042', reqDate: '2026-09-02', branch: '00001 - Main Branch', item: 'Extra Virgin Olive Oil 500ml Glass', qty: 120 },
    { reqNo: 'PR-2026-045', reqDate: '2026-09-03', branch: '00001 - Main Branch', item: 'Dark Green Marasca Glass Bottles 500ml', qty: 500 },
    { reqNo: 'PR-2026-048', reqDate: '2026-09-04', branch: '00001 - Main Branch', item: 'Table Olives Stuffed with Almond 500g', qty: 200 },
  ];

  const pendingTransfers = [
    { reqNo: 'TR-2026-018', reqDate: '2026-09-01', fromBranch: '00001 - Main Branch', toBranch: '00001 - Main Branch', item: 'Extra Virgin Olive Oil 16L Bulk Tin', qty: 45 },
    { reqNo: 'TR-2026-021', reqDate: '2026-09-03', fromBranch: '00001 - Main Branch', toBranch: '00001 - Main Branch', item: 'Pure Castile Liquid Soap 1L Refill', qty: 30 },
  ];

  const totalQtyNotReceivedCount = pendingProductRequests.length + pendingTransfers.length;

  // Filtered lists for modals based on current branch
  const filteredSalesList = useMemo(() => {
    if (selectedBranch === 'ALL' || selectedBranch === '0') return salesList;
    const code = currentBranchData.code;
    const match = salesList.filter(s => s.BARANCHNAME.includes(code));
    return match.length > 0 ? match : salesList;
  }, [selectedBranch, currentBranchData]);

  const filteredPurchaseList = useMemo(() => {
    if (selectedBranch === 'ALL' || selectedBranch === '0') return purchaseList;
    const code = currentBranchData.code;
    const match = purchaseList.filter(p => p.BARANCHNAME.includes(code));
    return match.length > 0 ? match : purchaseList;
  }, [selectedBranch, currentBranchData]);

  const filteredWastageList = useMemo(() => {
    if (selectedBranch === 'ALL' || selectedBranch === '0') return wastageList;
    const code = currentBranchData.code;
    const match = wastageList.filter(w => w.BARANCHNAME.includes(code));
    return match.length > 0 ? match : wastageList;
  }, [selectedBranch, currentBranchData]);

  const filteredVarianceList = useMemo(() => {
    if (selectedBranch === 'ALL' || selectedBranch === '0') return varianceList;
    const code = currentBranchData.code;
    const match = varianceList.filter(v => v.BARANCHNAME.includes(code));
    return match.length > 0 ? match : varianceList;
  }, [selectedBranch, currentBranchData]);

  const filteredExpiredItems = useMemo(() => {
    if (selectedBranch === 'ALL' || selectedBranch === '0') return expiredItems;
    const code = currentBranchData.code;
    const match = expiredItems.filter(i => i.branch.includes(code));
    return match.length > 0 ? match : expiredItems;
  }, [selectedBranch, currentBranchData]);

  const filteredBelowMinItems = useMemo(() => {
    if (selectedBranch === 'ALL' || selectedBranch === '0') return belowMinStockItems;
    const code = currentBranchData.code;
    const match = belowMinStockItems.filter(i => i.branch.includes(code));
    return match.length > 0 ? match : belowMinStockItems;
  }, [selectedBranch, currentBranchData]);

  const handleRefresh = () => {
    setRecalculating(true);
    setRecalcToast(`Recalculating operations balances for ${currentBranchData.name}...`);
    setTimeout(() => {
      setRecalculating(false);
      setRecalcToast(`✓ Balances recalculated successfully for ${currentBranchData.name}`);
      setTimeout(() => setRecalcToast(null), 3500);
    }, 600);
  };

  const handleExportPdf = () => {
    setExportingPdf(true);
    setTimeout(() => {
      setExportingPdf(false);
      window.print();
    }, 600);
  };

  const handleSyncSales = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setActiveActionModal(null);
      setRecalcToast('✓ Sales sync completed successfully.');
      setTimeout(() => setRecalcToast(null), 3000);
    }, 800);
  };

  const handleEndOfMonth = () => {
    setIsEndingMonth(true);
    setTimeout(() => {
      setIsEndingMonth(false);
      setActiveActionModal(null);
      setRecalcToast('✓ End of Month routine executed successfully.');
      setTimeout(() => setRecalcToast(null), 3000);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#edf3f9] text-[#0f172a] font-sans pb-16 inventory-dashboard-page">
      <style jsx global>{`
        /* Authentic Vanguard Operation Center / Inventory Dashboard CSS & Measurements */
        .inventory-dashboard-page {
          --id-bg: #edf3f9;
          --id-surface: #ffffff;
          --id-surface-soft: #f8fafc;
          --id-surface-muted: #e2e8f0;
          --id-border: #cbd5e1;
          --id-text: #0f172a;
          --id-muted: #64748b;
        }

        /* Topbar exact Vanguard measurements */
        .inventory-dashboard-topbar {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          padding: 18px 20px;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
        }

        .inventory-dashboard-topbar-title {
          flex: 0 0 auto;
          min-width: 0;
        }

        .inventory-dashboard-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: space-between;
        }

        .inventory-dashboard-topbar-title .page-title {
          margin: 0;
          color: #111827;
          font-size: 22px;
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.02em;
        }

        .inventory-dashboard-topbar-controls {
          flex: 1 1 auto;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 10px;
          flex-wrap: wrap;
        }

        .inventory-dashboard-filter-group {
          flex: 1 1 auto;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .inventory-dashboard-filter {
          min-width: 0;
        }

        .inventory-dashboard-filter select {
          width: 100%;
          min-height: 38px;
          height: 38px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #0f172a;
          font-size: 13px;
          font-weight: 600;
          padding: 0 32px 0 12px;
          outline: none;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 14px;
        }

        .inventory-dashboard-filter select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        .branch-filter {
          flex: 0 0 260px;
        }
        .currency-filter {
          flex: 0 0 150px;
        }
        .year-filter {
          flex: 0 0 110px;
        }
        .month-filter {
          flex: 0 0 150px;
        }

        .inventory-dashboard-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .inventory-dashboard-export-pdf-btn {
          min-height: 38px;
          height: 38px;
          padding: 0 14px;
          background: #111827;
          border-color: #111827;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .inventory-dashboard-export-pdf-btn:hover {
          background: #1f2937;
          border-color: #1f2937;
        }

        .inventoryDash_btn {
          min-height: 38px;
          height: 38px;
          width: 38px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .inventoryDash_btn:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        .inventory-action-icon-btn {
          min-height: 38px;
          height: 38px;
          width: 38px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: #0f172a;
          border: 1px solid #0f172a;
          color: #ffffff;
          transition: all 0.15s ease;
        }
        .inventory-action-icon-btn:hover {
          background-color: #1e293b;
        }

        /* The 5 Signature Metric Boxes exact CSS */
        .inventory-dashboard-metrics .dashboard-child {
          position: relative;
          border-radius: 18px;
          border: 1px solid var(--id-border);
          overflow: hidden;
          min-height: 92px;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .inventory-dashboard-metrics .dashboard-child:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
        }

        .inventory-dashboard-metrics .dashboard-body {
          align-items: center;
          display: flex;
          justify-content: center;
          min-height: 92px;
          padding: 24px 12px 14px;
          position: relative;
        }

        .inventory-dashboard-metrics .inventory-metric-main {
          max-width: 100%;
          padding: 0;
          text-align: center;
          width: 100%;
        }

        .inventory-dashboard-metrics .inventory-metric-title {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
        }

        .inventory-dashboard-metrics .inventory-metric-main .body {
          font-size: 18px;
          font-weight: 800;
          line-height: 1.25;
          margin-top: 6px;
          color: #0f172a;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .inventory-dashboard-metrics .metric-left-icon {
          align-items: center;
          display: inline-flex;
          font-size: 18px;
          justify-content: center;
          left: 16px;
          position: absolute;
          top: 14px;
        }

        .inventory-dashboard-metrics .metric-info-icon {
          align-items: center;
          cursor: pointer;
          display: inline-flex;
          font-size: 16px;
          justify-content: center;
          position: absolute;
          right: 16px;
          top: 14px;
          transition: transform 0.15s ease;
        }
        .inventory-dashboard-metrics .metric-info-icon:hover {
          transform: scale(1.25);
        }

        /* 9 Pill Tabs exact Vanguard replication */
        .inventory-dashboard-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          padding: 0;
          margin: 0;
          align-items: center;
        }

        .inventory-tab-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #1e293b;
          border-radius: 999px;
          padding: 0 16px;
          font-weight: 700;
          font-size: 12.5px;
          box-shadow: 0 2px 5px rgba(15, 23, 42, 0.04);
          transition: all 0.15s ease;
          cursor: pointer;
          text-decoration: none !important;
        }
        .inventory-tab-pill:hover {
          border-color: #94a3b8;
          background: #f8fafc;
          transform: translateY(-1px);
        }
        .inventory-tab-pill.active {
          background: #2563eb !important;
          color: #ffffff !important;
          border-color: transparent !important;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3) !important;
        }

        .inventory-tab-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.08);
          font-size: 12px;
        }
        .inventory-tab-pill.active .inventory-tab-icon {
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }

        /* Dense Vanguard Charcoal Tables */
        .vanguard-table {
          width: 100%;
          border-collapse: collapse;
        }
        .vanguard-table th {
          background-color: #3e3e3e;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          padding: 8px 12px;
          border: 1px solid #525252;
          text-align: left;
        }
        .vanguard-table td {
          font-size: 12px;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
        }

        .inventory-dashboard-card-header {
          background: #e2e8f0;
          color: #0f172a;
          border-bottom: 1px solid #cbd5e1;
          min-height: 40px;
          height: 40px;
          padding: 0 16px !important;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 40px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
        }

        .inventory-cost-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #2563eb;
          color: #ffffff;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: background 0.15s ease;
        }
        .inventory-cost-action:hover {
          background: #1d4ed8;
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. TOPBAR CONTROLS & FILTERS MATCHING EXACT VANGUARD MEASUREMENTS            */}
      {/* ========================================================================= */}
      <div className="inventory-dashboard-topbar">
        {/* Title & Mobile Actions */}
        <div className="inventory-dashboard-topbar-title">
          <div className="inventory-dashboard-title-row">
            <h1 className="page-title">Operation Overview</h1>
            <div className="flex items-center gap-1.5 lg:hidden">
              <Link
                href="/backoffice/dashboard"
                target="_blank"
                className="w-8 h-8 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-xs"
                title="Sales Dashboard"
              >
                <TrendingUp className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-8 h-8 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-xs cursor-pointer"
                title="Menu"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Controls & Exact-Width Filters */}
        <div className="inventory-dashboard-topbar-controls">
          <div className="inventory-dashboard-filter-group">
            {/* Branch Filter (flex: 0 0 260px) */}
            <div className="inventory-dashboard-filter branch-filter">
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  const bName = e.target.value === 'ALL' || e.target.value === '0' ? 'All Branches (Consolidated Fleet)' : getBranchData(e.target.value).name;
                  setRecalcToast(`Switched view to ${bName}`);
                  setTimeout(() => setRecalcToast(null), 2500);
                }}
                title="Branch Filter"
              >
                {allBranchesList.length > 1 && (
                  <option value="ALL">All Branches (Consolidated Fleet)</option>
                )}
                {allBranchesList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.arabicName})
                  </option>
                ))}
              </select>
            </div>

            {/* Currency Filter (flex: 0 0 150px) */}
            <div className="inventory-dashboard-filter currency-filter">
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                title="Currency Filter"
              >
                <option value="USD">USD ($)</option>
                <option value="LBP">LBP (ل.ل)</option>
              </select>
            </div>

            {/* Year Filter (flex: 0 0 110px) */}
            <div className="inventory-dashboard-filter year-filter">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                title="Year Filter"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>

            {/* Month Filter (flex: 0 0 150px) */}
            <div className="inventory-dashboard-filter month-filter">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                title="Month Filter"
              >
                <option value="0">All Months</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
          </div>

          {/* Actions & Export Toolbar */}
          <div className="inventory-dashboard-actions relative">
            {/* Quantity Not Received Trigger Badge */}
            <button
              type="button"
              onClick={() => setShowQtyNotReceived(true)}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Quantity Not Received: Pending POs & Requests"
            >
              <Package className="w-3.5 h-3.5" />
              <span>{totalQtyNotReceivedCount}</span>
            </button>

            {/* Actions Menu Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActionsDropdownOpen(!actionsDropdownOpen)}
                className="btn inventoryDash_btn"
                title="Dashboard Actions & Operations"
              >
                <Menu className="w-4 h-4 text-slate-700" />
              </button>

              {actionsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-300 rounded-xl shadow-xl z-50 py-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setActionsDropdownOpen(false);
                      setActiveActionModal('sync');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 text-slate-800 font-semibold cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                    <span>Sync Inventory Sales</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionsDropdownOpen(false);
                      setActiveActionModal('reorder');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 text-slate-800 font-semibold cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-600" />
                    <span>Reorder Suggestions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionsDropdownOpen(false);
                      setActiveActionModal('checklist');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 text-slate-800 font-semibold cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Stock Deduction Checklist</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionsDropdownOpen(false);
                      setActiveActionModal('endOfMonth');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 text-slate-800 font-semibold cursor-pointer border-t border-slate-100"
                  >
                    <Calendar className="w-3.5 h-3.5 text-rose-600" />
                    <span>End of Month Closing</span>
                  </button>
                </div>
              )}
            </div>

            {/* Export PDF Button */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="btn inventory-dashboard-export-pdf-btn cursor-pointer"
            >
              <span>{exportingPdf ? 'Preparing PDF...' : 'Export PDF'}</span>
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              className="btn inventoryDash_btn"
              title="Refresh Inventory Dashboard Data"
            >
              <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            {/* Inventory Report Button */}
            <Link
              href="/backoffice/operations?section=reports"
              className="btn inventory-action-icon-btn"
              title="Inventory Reports"
            >
              <BarChart3 className="w-4 h-4 text-white" />
            </Link>

            {/* Sales Report Button */}
            <Link
              href="/backoffice/reportview"
              className="btn inventory-action-icon-btn"
              title="Sales Reports"
            >
              <TrendingUp className="w-4 h-4 text-white" />
            </Link>

            {/* POS Touch Terminal Button */}
            <Link
              href="/pos"
              target="_blank"
              className="btn inventory-action-icon-btn bg-emerald-700 hover:bg-emerald-800"
              title="POS Touch Terminal"
            >
              <CreditCard className="w-4 h-4 text-white" />
            </Link>

          </div>
        </div>
      </div>

      {/* Recalculation Toast Feedback */}
      {recalcToast && (
        <div className="px-4 lg:px-6 pt-3">
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
            <span>{recalcToast}</span>
            <button onClick={() => setRecalcToast(null)} className="text-blue-500 hover:text-blue-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. THE 5 VANGUARD SIGNATURE METRIC BOXES WITH (i) MARK CLICKABLE TABLES      */}
      {/* ========================================================================= */}
      <div className="px-4 lg:px-6 pt-5 inventory-dashboard-metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          
          {/* BOX 1: SALES (#d7e0d8) */}
          <div className="dashboard-child" style={{ backgroundColor: '#d7e0d8' }}>
            <div className="dashboard-body">
              <span className="metric-left-icon" style={{ color: '#6f7d68' }}>
                <TrendingUp className="w-4 h-4" />
              </span>
              <button
                type="button"
                onClick={() => setActiveModal('sales')}
                className="metric-info-icon"
                style={{ color: '#6f7d68' }}
                title="View Sales Last 10 Transactions"
              >
                <Info className="w-4 h-4" />
              </button>
              <div className="inventory-metric-main">
                <div className="title inventory-metric-title">Sales</div>
                <div className="body">{formatCurrency(currentBranchData.operations.sales)}</div>
              </div>
            </div>
          </div>

          {/* BOX 2: PURCHASE (#fbd09c) */}
          <div className="dashboard-child" style={{ backgroundColor: '#fbd09c' }}>
            <div className="dashboard-body">
              <span className="metric-left-icon" style={{ color: '#e49f4b' }}>
                <ShoppingCart className="w-4 h-4" />
              </span>
              <button
                type="button"
                onClick={() => setActiveModal('purchase')}
                className="metric-info-icon"
                style={{ color: '#e49f4b' }}
                title="View Purchases Last 10 Transactions"
              >
                <Info className="w-4 h-4" />
              </button>
              <div className="inventory-metric-main">
                <div className="title inventory-metric-title">Purchase</div>
                <div className="body">{formatCurrency(currentBranchData.operations.purchase)}</div>
              </div>
            </div>
          </div>

          {/* BOX 3: LOST GOODS / WASTAGE (#f59a6f) */}
          <div className="dashboard-child" style={{ backgroundColor: '#f59a6f' }}>
            <div className="dashboard-body">
              <span className="metric-left-icon" style={{ color: '#d45214' }}>
                <Trash2 className="w-4 h-4" />
              </span>
              <button
                type="button"
                onClick={() => setActiveModal('wastage')}
                className="metric-info-icon"
                style={{ color: '#d45214' }}
                title="View Wastage Last 10 Transactions"
              >
                <Info className="w-4 h-4" />
              </button>
              <div className="inventory-metric-main">
                <div className="title inventory-metric-title">Lost Goods</div>
                <div className="body">{formatCurrency(currentBranchData.operations.lostGoods)}</div>
              </div>
            </div>
          </div>

          {/* BOX 4: VARIANCE (#efb982) */}
          <div className="dashboard-child" style={{ backgroundColor: '#efb982' }}>
            <div className="dashboard-body">
              <span className="metric-left-icon" style={{ color: '#cc8034' }}>
                <Sliders className="w-4 h-4" />
              </span>
              <button
                type="button"
                onClick={() => setActiveModal('variance')}
                className="metric-info-icon"
                style={{ color: '#cc8034' }}
                title="View Variance Last 10 Transactions"
              >
                <Info className="w-4 h-4" />
              </button>
              <div className="inventory-metric-main">
                <div className="title inventory-metric-title">Variance</div>
                <div className="body">{formatCurrency(currentBranchData.operations.variance)}</div>
              </div>
            </div>
          </div>

          {/* BOX 5: CURRENT STOCK VALUE (#cceac8) */}
          <div className="dashboard-child" style={{ backgroundColor: '#cceac8' }}>
            <div className="dashboard-body">
              <span className="metric-left-icon" style={{ color: '#82bd7a' }}>
                <Archive className="w-4 h-4" />
              </span>
              <button
                type="button"
                onClick={() => setActiveModal('stock')}
                className="metric-info-icon"
                style={{ color: '#82bd7a' }}
                title="View Stock Category Breakdown"
              >
                <Info className="w-4 h-4" />
              </button>
              <div className="inventory-metric-main">
                <div className="title inventory-metric-title">Current Stock Value</div>
                <div className="body">{formatCurrency(currentBranchData.operations.stockValue)}</div>
              </div>
            </div>
          </div>

          {/* BOX 6: AUDIT MONITOR (#dbeafe) */}
          <div className="dashboard-child" style={{ backgroundColor: '#dbeafe' }}>
            <div className="dashboard-body">
              <span className="metric-left-icon" style={{ color: '#3b82f6' }}>
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <button
                type="button"
                onClick={() => setActiveModal('expiry')}
                className="metric-info-icon"
                style={{ color: '#3b82f6' }}
                title="Audit Alerts & Expiry Status"
              >
                <Info className="w-4 h-4" />
              </button>
              <div className="inventory-metric-main">
                <div className="title inventory-metric-title">Fleet Branches</div>
                <div className="body">{allBranchesList.length} Sites</div>
              </div>
            </div>
          </div>

        </div>
      </div>



      {/* ========================================================================= */}
      {/* 3. NINE AUTHENTIC PILL NAVIGATION TABS (EXACT VANGUARD & OMEGA REPLICATION) */}
      {/* ========================================================================= */}
      <div className="px-4 lg:px-6 mt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="inventory-dashboard-tabs">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`inventory-tab-pill ${activeTab === 'general' ? 'active' : ''}`}
            >
              <span className="inventory-tab-icon"><Layers className="w-3 h-3" /></span>
              <span>Stock Movements</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('comparative')}
              className={`inventory-tab-pill ${activeTab === 'comparative' ? 'active' : ''}`}
            >
              <span className="inventory-tab-icon"><BarChart3 className="w-3 h-3" /></span>
              <span>Comparative</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cost')}
              className={`inventory-tab-pill ${activeTab === 'cost' ? 'active' : ''}`}
            >
              <span className="inventory-tab-icon"><DollarSign className="w-3 h-3" /></span>
              <span>Cost</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stock')}
              className={`inventory-tab-pill ${activeTab === 'stock' ? 'active' : ''}`}
            >
              <span className="inventory-tab-icon"><Archive className="w-3 h-3" /></span>
              <span>Stock</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('product_insights')}
              className={`inventory-tab-pill ${activeTab === 'product_insights' ? 'active' : ''}`}
            >
              <span className="inventory-tab-icon"><Package className="w-3 h-3" /></span>
              <span>Product Insights</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('purchases_dash')}
              className={`inventory-tab-pill ${activeTab === 'purchases_dash' ? 'active' : ''}`}
            >
              <span className="inventory-tab-icon"><ShoppingCart className="w-3 h-3" /></span>
              <span>Purchase Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sales_dash')}
              className={`inventory-tab-pill ${activeTab === 'sales_dash' ? 'active' : ''}`}
            >
              <span className="inventory-tab-icon"><TrendingUp className="w-3 h-3" /></span>
              <span>Sales Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sales_team')}
              className={`inventory-tab-pill ${activeTab === 'sales_team' ? 'active' : ''}`}
            >
              <span className="inventory-tab-icon"><Users className="w-3 h-3" /></span>
              <span>Sales Team Performance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('customer_insights')}
              className={`inventory-tab-pill ${activeTab === 'customer_insights' ? 'active' : ''}`}
            >
              <span className="inventory-tab-icon"><UserCheck className="w-3 h-3" /></span>
              <span>Customer Insight</span>
            </button>
          </div>

          {/* Action on right of tabs when Cost is active */}
          {activeTab === 'cost' && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={recalculating}
              className="inventory-cost-action self-start md:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
              <span>Recalculate Cost</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TAB CONTENTS & INTERACTIVE MATRICES                                    */}
      {/* ========================================================================= */}
      <div className="px-4 lg:px-6 mt-4">
        
        {/* ======================================================================= */}
        {/* TAB 1: STOCK MOVEMENTS (#general)                                       */}
        {/* ======================================================================= */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            
            {/* ACCORDION 1: TRANSACTIONS */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <div 
                onClick={() => toggleAccordion('transactions')}
                className="inventory-dashboard-card-header flex items-center justify-between cursor-pointer select-none"
              >
                <span>Stock Movements</span>
                {openAccordion['transactions'] ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
              </div>

              {openAccordion['transactions'] && (
                <div className="p-0 overflow-x-auto">
                  <table className="w-full vanguard-table">
                    <thead>
                      <tr>
                        <th>Inventory Category</th>
                        <th className="text-right">Sales</th>
                        <th className="text-right">Purchase</th>
                        <th className="text-right">Lost Goods</th>
                        <th className="text-right">Variance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactionsCategoryData.map((row, idx) => (
                        <tr key={row.category} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          <td className="font-semibold text-slate-900">{row.category}</td>
                          <td className="font-mono text-right text-emerald-700 font-medium">{formatCurrency(row.sales)}</td>
                          <td className="font-mono text-right text-amber-700 font-medium">{formatCurrency(row.purchase)}</td>
                          <td className="font-mono text-right text-rose-700 font-medium">{formatCurrency(row.wastage)}</td>
                          <td className={`font-mono text-right font-medium ${row.variance < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                            {formatCurrency(row.variance)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                        <td className="text-slate-900">Total Movement Matrix</td>
                        <td className="font-mono text-right text-emerald-800">
                          {formatCurrency(transactionsCategoryData.reduce((a, b) => a + b.sales, 0))}
                        </td>
                        <td className="font-mono text-right text-amber-800">
                          {formatCurrency(transactionsCategoryData.reduce((a, b) => a + b.purchase, 0))}
                        </td>
                        <td className="font-mono text-right text-rose-800">
                          {formatCurrency(transactionsCategoryData.reduce((a, b) => a + b.wastage, 0))}
                        </td>
                        <td className="font-mono text-right text-slate-900">
                          {formatCurrency(transactionsCategoryData.reduce((a, b) => a + b.variance, 0))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ACCORDION 2: PURCHASE BY CATEGORY & SUPPLIER */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <div 
                onClick={() => toggleAccordion('purchase')}
                className="inventory-dashboard-card-header flex items-center justify-between cursor-pointer select-none"
              >
                <span>Purchase by Category & Supplier</span>
                {openAccordion['purchase'] ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
              </div>

              {openAccordion['purchase'] && (
                <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Category Breakdown Table with Dynamic Headers */}
                  <div className="overflow-x-auto">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Purchase by Category</h4>
                    <table className="w-full vanguard-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th className="text-right">All Branches</th>
                          {selectedBranch === 'ALL' && allBranchesList.length > 1 ? (
                            <>
                              <th className="text-right">Main Branch (00001)</th>
                            </>
                          ) : (
                            <th className="text-right bg-blue-900 text-white font-black">{currentBranchData.name} ({currentBranchData.code})</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {purchaseCategoryData.map((row, idx) => (
                          <tr key={row.category} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="font-medium text-slate-800">{row.category}</td>
                            <td className="font-mono text-right text-slate-900 font-bold">{formatCurrency(row.allBranches)}</td>
                            {selectedBranch === 'ALL' && allBranchesList.length > 1 ? (
                              <td className="font-mono text-right text-slate-600">{formatCurrency(row.b1)}</td>
                            ) : (
                              <td className="font-mono text-right font-black text-blue-900 bg-blue-50/50">
                                {formatCurrency(row.allBranches)}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Supplier Breakdown Table */}
                  <div className="overflow-x-auto">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Purchase by Supplier</h4>
                    <table className="w-full vanguard-table">
                      <thead>
                        <tr>
                          <th>Supplier Name</th>
                          <th className="text-right">Total Invoiced Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchaseSupplierData.map((s, idx) => (
                          <tr key={s.supplier} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="font-medium text-slate-800">{s.supplier}</td>
                            <td className="font-mono text-right text-amber-800 font-bold">{formatCurrency(s.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 3: LOST GOODS / WASTAGE BY REASON & SUPPLIER */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <div 
                onClick={() => toggleAccordion('wastage')}
                className="inventory-dashboard-card-header flex items-center justify-between cursor-pointer select-none"
              >
                <span>Lost Goods by Category, Supplier & Type</span>
                {openAccordion['wastage'] ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
              </div>

              {openAccordion['wastage'] && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Wastage by Category */}
                  <div className="overflow-x-auto">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">By Category</h4>
                    <table className="w-full vanguard-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th className="text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wastageCategoryData.map((w, idx) => (
                          <tr key={w.category} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="font-medium text-slate-800">{w.category}</td>
                            <td className="font-mono text-right text-rose-700 font-bold">{formatCurrency(w.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Wastage by Supplier */}
                  <div className="overflow-x-auto">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">By Supplier</h4>
                    <table className="w-full vanguard-table">
                      <thead>
                        <tr>
                          <th>Supplier</th>
                          <th className="text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wastageSupplierData.map((w, idx) => (
                          <tr key={w.supplier} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="font-medium text-slate-800">{w.supplier}</td>
                            <td className="font-mono text-right text-rose-700 font-bold">{formatCurrency(w.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Wastage by Type */}
                  <div className="overflow-x-auto">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">By Wastage Type</h4>
                    <table className="w-full vanguard-table">
                      <thead>
                        <tr>
                          <th>Wastage Type</th>
                          <th className="text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wastageTypeData.map((w, idx) => (
                          <tr key={w.type} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="font-medium text-slate-800">{w.type}</td>
                            <td className="font-mono text-right text-rose-700 font-bold">{formatCurrency(w.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 4: PRODUCTION BY DIVISION */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <div 
                onClick={() => toggleAccordion('production')}
                className="inventory-dashboard-card-header flex items-center justify-between cursor-pointer select-none"
              >
                <span>Production by Division</span>
                {openAccordion['production'] ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
              </div>

              {openAccordion['production'] && (
                <div className="p-0 overflow-x-auto">
                  <table className="w-full vanguard-table">
                    <thead>
                      <tr>
                        <th>Division Name</th>
                        <th className="text-right">Consolidated (All Branches)</th>
                        {selectedBranch === 'ALL' && allBranchesList.length > 1 ? (
                          <>
                            <th className="text-right">Main Branch (00001)</th>
                          </>
                        ) : (
                          <th className="text-right bg-blue-900 text-white font-black">{currentBranchData.name} ({currentBranchData.code})</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {productionDivisionData.map((row, idx) => (
                        <tr key={row.division} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          <td className="font-medium text-slate-900">{row.division}</td>
                          <td className="font-mono text-right text-emerald-800 font-bold">{formatCurrency(row.allBranches)}</td>
                          {selectedBranch === 'ALL' && allBranchesList.length > 1 ? (
                            <td className="font-mono text-right text-slate-700">{formatCurrency(row.b1)}</td>
                          ) : (
                            <td className="font-mono text-right font-black text-blue-900 bg-blue-50/50">
                              {formatCurrency(row.allBranches)}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ACCORDION 5: STOCK ADJUSTMENTS BY CATEGORY */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <div 
                onClick={() => toggleAccordion('adjustment')}
                className="inventory-dashboard-card-header flex items-center justify-between cursor-pointer select-none"
              >
                <span>Stock Adjustments by Category</span>
                {openAccordion['adjustment'] ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
              </div>

              {openAccordion['adjustment'] && (
                <div className="p-0 overflow-x-auto">
                  <table className="w-full vanguard-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th className="text-right">Total Net Adjustment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adjustmentCategoryData.map((row, idx) => (
                        <tr key={row.category} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          <td className="font-medium text-slate-900">{row.category}</td>
                          <td className={`font-mono text-right font-bold ${row.amount < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                            {row.amount > 0 ? `+${row.amount} Units` : `${row.amount} Units`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 2: COMPARATIVE MATRIX (SALES, PURCHASES & MONTHLY TRENDS)            */}
        {/* ======================================================================= */}
        {activeTab === 'comparative' && (
          <div className="space-y-4">
            
            {/* COMPARATIVE CARD 1: SALES BY CATEGORY */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <div
                onClick={() => toggleComparativeAccordion('salesCat')}
                className="p-3.5 bg-[#3e3e3e] text-white font-bold text-xs flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <span>Current Stock Value by Branch & Categories (Sales Comparative Matrix)</span>
                  <span className="text-[11px] text-slate-300 font-mono">Real-time valuation across all sites</span>
                </div>
                {openComparativeAccordion['salesCat'] ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
              </div>

              {openComparativeAccordion['salesCat'] && (
                <div className="overflow-x-auto">
                  <table className="w-full vanguard-table">
                    <thead>
                      <tr>
                        <th className="min-w-[240px]">Branch</th>
                        {comparativeCategories.map(cat => (
                          <th key={cat} className="text-right">{cat}</th>
                        ))}
                        <th className="text-right font-black bg-[#2d2d2d]">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Top All Branches Row matching authentic Vanguard & Omega */}
                      <tr className="bg-slate-200/90 font-black border-b-2 border-slate-300">
                        <td className="font-bold text-slate-900">All Branches</td>
                        {comparativeTotals.map((tot, i) => {
                          const pct = Math.round((tot / comparativeGrandTotal) * 100);
                          return (
                            <td key={i} className="font-mono text-right text-slate-900">
                              <div>{formatCurrency(tot)}</div>
                              <span className="text-[10px] text-slate-500 font-normal">({pct}%)</span>
                            </td>
                          );
                        })}
                        <td className="font-mono text-right text-emerald-950 bg-emerald-100/90 text-sm">
                          {formatCurrency(comparativeGrandTotal)}
                        </td>
                      </tr>

                      {/* Individual Branch Rows */}
                      {comparativeRows.map((r, idx) => (
                        <tr key={r.branch} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          <td className="font-semibold text-slate-900">{r.branch}</td>
                          {r.vals.map((v, i) => {
                            const pct = Math.round((v / r.total) * 100);
                            return (
                              <td key={i} className="font-mono text-right text-slate-700">
                                <div>{formatCurrency(v)}</div>
                                <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                              </td>
                            );
                          })}
                          <td className="font-mono font-black text-right text-blue-800 bg-blue-50/50">
                            {formatCurrency(r.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* COMPARATIVE CARD 2: PURCHASES BY CATEGORY */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <div
                onClick={() => toggleComparativeAccordion('purchaseCat')}
                className="p-3.5 bg-[#3e3e3e] text-white font-bold text-xs flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <span>Purchases by Branch & Categories (Purchases Comparative Matrix)</span>
                  <span className="text-[11px] text-slate-300 font-mono">Fiscal Invoicing Breakdown</span>
                </div>
                {openComparativeAccordion['purchaseCat'] ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
              </div>

              {openComparativeAccordion['purchaseCat'] && (
                <div className="overflow-x-auto">
                  <table className="w-full vanguard-table">
                    <thead>
                      <tr>
                        <th className="min-w-[240px]">Branch</th>
                        {comparativeCategories.map(cat => (
                          <th key={cat} className="text-right">{cat}</th>
                        ))}
                        <th className="text-right font-black bg-[#2d2d2d]">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-slate-200/90 font-black border-b-2 border-slate-300">
                        <td className="font-bold text-slate-900">All Branches</td>
                        {purchaseComparativeTotals.map((tot, i) => {
                          const pct = Math.round((tot / purchaseComparativeGrandTotal) * 100);
                          return (
                            <td key={i} className="font-mono text-right text-slate-900">
                              <div>{formatCurrency(tot)}</div>
                              <span className="text-[10px] text-slate-500 font-normal">({pct}%)</span>
                            </td>
                          );
                        })}
                        <td className="font-mono text-right text-amber-950 bg-amber-100/90 text-sm">
                          {formatCurrency(purchaseComparativeGrandTotal)}
                        </td>
                      </tr>

                      {purchaseComparativeRows.map((r, idx) => (
                        <tr key={r.branch} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          <td className="font-semibold text-slate-900">{r.branch}</td>
                          {r.vals.map((v, i) => {
                            const pct = Math.round((v / r.total) * 100);
                            return (
                              <td key={i} className="font-mono text-right text-slate-700">
                                <div>{formatCurrency(v)}</div>
                                <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                              </td>
                            );
                          })}
                          <td className="font-mono font-black text-right text-amber-800 bg-amber-50/50">
                            {formatCurrency(r.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* COMPARATIVE CARD 3: PURCHASES BY MONTH */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <div
                onClick={() => toggleComparativeAccordion('purchaseMonth')}
                className="p-3.5 bg-[#3e3e3e] text-white font-bold text-xs flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <span>Purchases by Month ({selectedYear} Fiscal Year)</span>
                  <span className="text-[11px] text-slate-300 font-mono">Monthly Procurement Trend</span>
                </div>
                {openComparativeAccordion['purchaseMonth'] ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
              </div>

              {openComparativeAccordion['purchaseMonth'] && (
                <div className="overflow-x-auto">
                  <table className="w-full vanguard-table">
                    <thead>
                      <tr>
                        <th className="min-w-[240px]">Branch</th>
                        {activeMonthsList.map(month => (
                          <th key={month} className="text-right">{month}</th>
                        ))}
                        <th className="text-right font-black bg-[#2d2d2d]">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-slate-200/90 font-black border-b-2 border-slate-300">
                        <td className="font-bold text-slate-900">All Branches</td>
                        {activeMonthsList.map((_, mIdx) => {
                          const realIdx = selectedMonth === '0' ? mIdx : parseInt(selectedMonth, 10) - 1;
                          const monthTot = purchaseMonthRows.reduce((sum, r) => sum + r.vals[realIdx], 0);
                          return (
                            <td key={mIdx} className="font-mono text-right text-slate-900">
                              {formatCurrency(monthTot)}
                            </td>
                          );
                        })}
                        <td className="font-mono text-right text-amber-950 bg-amber-100/90 text-sm">
                          {formatCurrency(
                            purchaseMonthRows.reduce((sum, r) => {
                              if (selectedMonth === '0') return sum + r.vals.reduce((a, b) => a + b, 0);
                              return sum + r.vals[parseInt(selectedMonth, 10) - 1];
                            }, 0)
                          )}
                        </td>
                      </tr>

                      {purchaseMonthRows.map((r, idx) => {
                        const rowTot = selectedMonth === '0' ? r.vals.reduce((a, b) => a + b, 0) : r.vals[parseInt(selectedMonth, 10) - 1];
                        return (
                          <tr key={r.branch} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="font-semibold text-slate-900">{r.branch}</td>
                            {activeMonthsList.map((_, mIdx) => {
                              const realIdx = selectedMonth === '0' ? mIdx : parseInt(selectedMonth, 10) - 1;
                              const val = r.vals[realIdx];
                              return (
                                <td key={mIdx} className="font-mono text-right text-slate-700">
                                  {formatCurrency(val)}
                                </td>
                              );
                            })}
                            <td className="font-mono font-black text-right text-amber-800 bg-amber-50/50">
                              {formatCurrency(rowTot)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* COMPARATIVE CARD 4: LOST GOODS BY MONTH */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <div
                onClick={() => toggleComparativeAccordion('wastageMonth')}
                className="p-3.5 bg-[#3e3e3e] text-white font-bold text-xs flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <span>Lost Goods by Month ({selectedYear} Fiscal Year)</span>
                  <span className="text-[11px] text-slate-300 font-mono">Monthly Wastage & Shrinkage Trend</span>
                </div>
                {openComparativeAccordion['wastageMonth'] ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
              </div>

              {openComparativeAccordion['wastageMonth'] && (
                <div className="overflow-x-auto">
                  <table className="w-full vanguard-table">
                    <thead>
                      <tr>
                        <th className="min-w-[240px]">Branch</th>
                        {activeMonthsList.map(month => (
                          <th key={month} className="text-right">{month}</th>
                        ))}
                        <th className="text-right font-black bg-[#2d2d2d]">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-slate-200/90 font-black border-b-2 border-slate-300">
                        <td className="font-bold text-slate-900">All Branches</td>
                        {activeMonthsList.map((_, mIdx) => {
                          const realIdx = selectedMonth === '0' ? mIdx : parseInt(selectedMonth, 10) - 1;
                          const monthTot = wastageMonthRows.reduce((sum, r) => sum + r.vals[realIdx], 0);
                          return (
                            <td key={mIdx} className="font-mono text-right text-slate-900">
                              {formatCurrency(monthTot)}
                            </td>
                          );
                        })}
                        <td className="font-mono text-right text-rose-950 bg-rose-100/90 text-sm">
                          {formatCurrency(
                            wastageMonthRows.reduce((sum, r) => {
                              if (selectedMonth === '0') return sum + r.vals.reduce((a, b) => a + b, 0);
                              return sum + r.vals[parseInt(selectedMonth, 10) - 1];
                            }, 0)
                          )}
                        </td>
                      </tr>

                      {wastageMonthRows.map((r, idx) => {
                        const rowTot = selectedMonth === '0' ? r.vals.reduce((a, b) => a + b, 0) : r.vals[parseInt(selectedMonth, 10) - 1];
                        return (
                          <tr key={r.branch} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="font-semibold text-slate-900">{r.branch}</td>
                            {activeMonthsList.map((_, mIdx) => {
                              const realIdx = selectedMonth === '0' ? mIdx : parseInt(selectedMonth, 10) - 1;
                              const val = r.vals[realIdx];
                              return (
                                <td key={mIdx} className="font-mono text-right text-slate-700">
                                  {formatCurrency(val)}
                                </td>
                              );
                            })}
                            <td className="font-mono font-black text-right text-rose-800 bg-rose-50/50">
                              {formatCurrency(rowTot)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 3: COST OF GOODS (COGS & THEORETICAL PROFIT)                         */}
        {/* ======================================================================= */}
        {activeTab === 'cost' && (
          <div className="space-y-4">
            
            {/* COST CARD 1: REAL COST OF GOODS SOLD */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <div 
                onClick={() => toggleCostAccordion('realCost')}
                className="p-3.5 bg-[#3e3e3e] text-white font-bold text-xs flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <span>Real Cost Of Goods Matrix</span>
                  <span className="text-[11px] text-slate-300 font-mono">Period: Year {selectedYear} {selectedMonth !== '0' ? `- Month ${selectedMonth}` : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRefresh();
                    }}
                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
                    <span>Recalculate Cost</span>
                  </button>
                  {openCostAccordion['realCost'] ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
                </div>
              </div>

              {openCostAccordion['realCost'] && (
                <div className="overflow-x-auto">
                  <table className="w-full vanguard-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th className="text-right">
                          Beginning Stock <span title="Value of stock at beginning of period"><Info className="w-3 h-3 inline text-amber-400 ml-1 cursor-pointer" /></span>
                        </th>
                        <th className="text-right">
                          Purchases <span title="Total purchases within this period"><Info className="w-3 h-3 inline text-amber-400 ml-1 cursor-pointer" /></span>
                        </th>
                        <th className="text-right">
                          Ending Stock <span title="Value of stock at end of period based on last cost"><Info className="w-3 h-3 inline text-amber-400 ml-1 cursor-pointer" /></span>
                        </th>
                        <th className="text-right bg-[#2d2d2d]">
                          Consumption / COGS <span title="Consumption / COGS = Beginning Stock + Purchases - Ending Stock"><Info className="w-3 h-3 inline text-amber-400 ml-1 cursor-pointer" /></span>
                        </th>
                        <th className="text-right">
                          Cost% <span title="Cost% = (Consumption / COGS) * 100 / Net Sales"><Info className="w-3 h-3 inline text-amber-400 ml-1 cursor-pointer" /></span>
                        </th>
                        <th className="text-right">Net Sales</th>
                        <th className="text-right">
                          Gross Profit <span title="Gross Profit = Net Sales - Consumption / COGS"><Info className="w-3 h-3 inline text-amber-400 ml-1 cursor-pointer" /></span>
                        </th>
                        <th className="text-right">
                          Gross Profit% <span title="Gross Profit% = (Gross Profit * 100) / Net Sales"><Info className="w-3 h-3 inline text-amber-400 ml-1 cursor-pointer" /></span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cogsData.map((row, idx) => {
                        const costPct = row.netSales === 0 ? 0 : Math.round((row.cogs * 100) / row.netSales);
                        const grossProfitPct = row.netSales === 0 ? 0 : Math.round((row.grossProfit * 100) / row.netSales);
                        return (
                          <tr key={row.category} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="font-semibold text-slate-900">{row.category}</td>
                            <td className="font-mono text-right text-slate-700">{formatCurrency(row.beginning)}</td>
                            <td className="font-mono text-right text-emerald-700">+{formatCurrency(row.purchase)}</td>
                            <td className="font-mono text-right text-slate-700">-{formatCurrency(row.ending)}</td>
                            <td className="font-mono font-black text-right text-blue-900 bg-blue-50/70">{formatCurrency(row.cogs)}</td>
                            <td className="font-mono text-right font-bold text-slate-800">{costPct}%</td>
                            <td className="font-mono text-right text-emerald-800 font-bold">{formatCurrency(row.netSales)}</td>
                            <td className={`font-mono text-right font-bold ${row.grossProfit < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                              {formatCurrency(row.grossProfit)}
                            </td>
                            <td className={`font-mono text-right font-bold ${grossProfitPct < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                              {grossProfitPct}%
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-200/90 font-black border-t-2 border-slate-300">
                        <td className="text-slate-900">Total Consolidated COGS</td>
                        <td className="font-mono text-right text-slate-900">
                          {formatCurrency(cogsData.reduce((a, b) => a + b.beginning, 0))}
                        </td>
                        <td className="font-mono text-right text-emerald-800">
                          +{formatCurrency(cogsData.reduce((a, b) => a + b.purchase, 0))}
                        </td>
                        <td className="font-mono text-right text-slate-900">
                          -{formatCurrency(cogsData.reduce((a, b) => a + b.ending, 0))}
                        </td>
                        <td className="font-mono text-right text-blue-950 bg-blue-100 text-sm">
                          {formatCurrency(cogsData.reduce((a, b) => a + b.cogs, 0))}
                        </td>
                        <td className="font-mono text-right text-slate-900">
                          {Math.round((cogsData.reduce((a, b) => a + b.cogs, 0) * 100) / cogsData.reduce((a, b) => a + b.netSales, 0))}%
                        </td>
                        <td className="font-mono text-right text-emerald-950">
                          {formatCurrency(cogsData.reduce((a, b) => a + b.netSales, 0))}
                        </td>
                        <td className="font-mono text-right text-emerald-950">
                          {formatCurrency(cogsData.reduce((a, b) => a + b.grossProfit, 0))}
                        </td>
                        <td className="font-mono text-right text-emerald-950">
                          {Math.round((cogsData.reduce((a, b) => a + b.grossProfit, 0) * 100) / cogsData.reduce((a, b) => a + b.netSales, 0))}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* COST CARD 2: THEORETICAL / IDEAL PROFIT BY CATEGORY */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <div 
                onClick={() => toggleCostAccordion('idealProfit')}
                className="p-3.5 bg-[#3e3e3e] text-white font-bold text-xs flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <span>Ideal Profit by Category</span>
                  <span className="text-[11px] text-slate-300 font-mono">Theoretical Margin Analysis</span>
                </div>
                {openCostAccordion['idealProfit'] ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
              </div>

              {openCostAccordion['idealProfit'] && (
                <div className="overflow-x-auto">
                  <table className="w-full vanguard-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th className="text-right">Sales</th>
                        <th className="text-right">Cost</th>
                        <th className="text-right">
                          Profit% <span title="Profit% = (Sales - Cost) * 100 / Sales"><Info className="w-3 h-3 inline text-amber-400 ml-1 cursor-pointer" /></span>
                        </th>
                        <th className="text-right">
                          Cost% <span title="Cost% = Cost * 100 / Sales"><Info className="w-3 h-3 inline text-amber-400 ml-1 cursor-pointer" /></span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-slate-200/90 font-black border-b-2 border-slate-300">
                        <td className="text-slate-900">Total Theoretical</td>
                        <td className="font-mono text-right text-slate-900">{formatCurrency(totalIdealSales)}</td>
                        <td className="font-mono text-right text-slate-900">{formatCurrency(totalIdealCost)}</td>
                        <td className="font-mono text-right text-emerald-800">
                          {totalIdealSales === 0 ? 0 : ((totalIdealSales - totalIdealCost) * 100 / totalIdealSales).toFixed(2)}%
                        </td>
                        <td className="font-mono text-right text-slate-900">
                          {totalIdealSales === 0 ? 100 : (totalIdealCost * 100 / totalIdealSales).toFixed(2)}%
                        </td>
                      </tr>

                      {idealProfitData.map((item, idx) => {
                        const profitPct = item.sales === 0 ? 0 : ((item.sales - item.cost) * 100 / item.sales).toFixed(2);
                        const costPct = item.sales === 0 ? 100 : (item.cost * 100 / item.sales).toFixed(2);
                        return (
                          <tr key={item.category} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="font-semibold text-slate-900">{item.category}</td>
                            <td className="font-mono text-right text-slate-800">{formatCurrency(item.sales)}</td>
                            <td className="font-mono text-right text-slate-800">{formatCurrency(item.cost)}</td>
                            <td className={`font-mono text-right font-bold ${Number(profitPct) < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                              {profitPct}%
                            </td>
                            <td className="font-mono text-right text-slate-700">{costPct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 4: STOCK LEVEL, EXPIRED & OUT OF STOCK                              */}
        {/* ======================================================================= */}
        {activeTab === 'stock' && (
          <div className="space-y-4">
            
            {/* ACCORDION 1: EXPIRED ITEMS */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <div 
                onClick={() => toggleStockAccordion('expired')}
                className="inventory-dashboard-card-header flex items-center justify-between cursor-pointer select-none bg-red-100 text-red-950 border-b border-red-200"
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-red-700" />
                  <span>Expired Items</span>
                </div>
                {openStockAccordion['expired'] ? <ChevronUp className="w-4 h-4 text-red-800" /> : <ChevronDown className="w-4 h-4 text-red-800" />}
              </div>

              {openStockAccordion['expired'] && (
                <div className="p-0 overflow-x-auto">
                  <table className="w-full vanguard-table">
                    <thead>
                      <tr>
                        {selectedBranch === 'ALL' && <th>Branch</th>}
                        <th>Location</th>
                        <th>Product</th>
                        <th className="text-right">Qty on Hand</th>
                        <th>Expiry Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpiredItems.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          {selectedBranch === 'ALL' && <td className="font-semibold text-slate-800">{item.branch}</td>}
                          <td className="text-slate-600">{item.location}</td>
                          <td className="font-bold text-slate-900">{item.product}</td>
                          <td className="font-mono text-right font-bold text-red-700">{item.qty.toFixed(2)}</td>
                          <td className="font-mono text-slate-700 font-semibold">{item.expiry}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ACCORDION 2: OUT OF STOCK */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <div 
                onClick={() => toggleStockAccordion('outofstock')}
                className="inventory-dashboard-card-header flex items-center justify-between cursor-pointer select-none"
              >
                <span>Out of Stock</span>
                {openStockAccordion['outofstock'] ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
              </div>

              {openStockAccordion['outofstock'] && (
                <div className="p-4 space-y-3">
                  {/* Branch filter for out of stock when All Branches is active */}
                  {selectedBranch === 'ALL' && (
                    <div className="flex items-center gap-2 text-xs">
                      <label htmlFor="outOfStockFilter" className="font-bold text-slate-700">Filter Branch:</label>
                      <select
                        id="outOfStockFilter"
                        value={outOfStockBranchFilter}
                        onChange={(e) => setOutOfStockBranchFilter(e.target.value)}
                        className="border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold text-slate-800"
                      >
                        {allBranchesList.length > 1 && <option value="0">All Branches</option>}
                        {allBranchesList.map(b => (
                          <option key={b.code} value={b.code}>{b.code} - {b.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Out of Stock Grouped Branches */}
                  <div className="space-y-2">
                    {outOfStockBranches
                      .filter(b => selectedBranch !== 'ALL' ? b.branchName.includes(currentBranchData.code) : (outOfStockBranchFilter === '0' || b.branchId === outOfStockBranchFilter))
                      .map((branch) => {
                        const isExpanded = expandedOutOfStockBranches[branch.id];
                        return (
                          <div key={branch.id} className="border border-slate-200 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setExpandedOutOfStockBranches(prev => ({ ...prev, [branch.id]: !prev[branch.id] }))}
                              className="w-full flex items-center justify-between px-3 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition cursor-pointer"
                            >
                              <span>{branch.branchName}</span>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-mono">{branch.items.length} Items</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-600" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-600" />}
                              </div>
                            </button>
                            {isExpanded && (
                              <table className="w-full vanguard-table">
                                <thead>
                                  <tr>
                                    <th>Product Description</th>
                                    <th className="text-right">Qty on Hand</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {branch.items.map((it, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                                      <td className="font-semibold text-slate-900">{it.name}</td>
                                      <td className="font-mono text-right font-black text-red-700">{it.qty.toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 3: ITEMS BELOW MIN. STOCK LEVEL */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <div 
                onClick={() => toggleStockAccordion('belowmin')}
                className="inventory-dashboard-card-header flex items-center justify-between cursor-pointer select-none"
              >
                <span>Items Below Min. Stock Level</span>
                {openStockAccordion['belowmin'] ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
              </div>

              {openStockAccordion['belowmin'] && (
                <div className="p-0 overflow-x-auto">
                  <table className="w-full vanguard-table">
                    <thead>
                      <tr>
                        {selectedBranch === 'ALL' && <th>Branch</th>}
                        <th>Location</th>
                        <th>Product</th>
                        <th className="text-right">Min Qty</th>
                        <th className="text-right">Qty on Hand</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBelowMinItems.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          {selectedBranch === 'ALL' && <td className="font-semibold text-slate-800">{item.branch}</td>}
                          <td className="text-slate-600">{item.location}</td>
                          <td className="font-bold text-slate-900">{item.product}</td>
                          <td className="font-mono text-right text-slate-600">{item.minQty}</td>
                          <td className="font-mono text-right font-bold text-amber-700">{item.qtyOH}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ACCORDION 4: STOCK BREAKDOWN BY CATEGORY */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <div 
                onClick={() => toggleStockAccordion('categoryStock')}
                className="inventory-dashboard-card-header flex items-center justify-between cursor-pointer select-none"
              >
                <span>Stock on Hand Breakdown by Product Family</span>
                {openStockAccordion['categoryStock'] ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
              </div>

              {openStockAccordion['categoryStock'] && (
                <div>
                  <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showNegatives}
                        onChange={(e) => setShowNegatives(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <span>Show Negative Values</span>
                    </label>
                    <span className="text-xs text-slate-500 font-mono">6 Categories Audited</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full vanguard-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th className="text-right">Available Qty</th>
                          <th className="text-right">Valuation Amount ({selectedCurrency})</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockCategories.map((sc, idx) => (
                          <tr key={sc.CATEGORYNAME} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="font-semibold text-slate-900">{sc.CATEGORYNAME}</td>
                            <td className="font-mono text-right text-slate-700">{sc.QTY.toLocaleString()} Units</td>
                            <td className="font-mono font-black text-right text-emerald-800">{formatCurrency(sc.AMOUNT)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 5: PRODUCT INSIGHTS */}
        {activeTab === 'product_insights' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <ProductInsightsView />
          </div>
        )}

        {/* TAB 6: PURCHASES DASHBOARD */}
        {activeTab === 'purchases_dash' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6">
            <PurchasesView />
          </div>
        )}

        {/* TAB 7: SALES DASHBOARD */}
        {activeTab === 'sales_dash' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <SalesDashboard />
          </div>
        )}

        {/* TAB 8: SALES TEAM PERFORMANCE */}
        {activeTab === 'sales_team' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6">
            <SalesTeamPerformanceView />
          </div>
        )}

        {/* TAB 9: CUSTOMER INSIGHTS */}
        {activeTab === 'customer_insights' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <CustomerInsightsView hideBreadcrumbs={true} />
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 5. MODAL DIALOGS FOR THE 5 BOXES ("i" MARK TABLES)                        */}
      {/* ========================================================================= */}

      {/* DIALOG 1: SALES (Last 10 Transactions) */}
      {activeModal === 'sales' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-xl max-w-4xl w-full p-5 text-slate-800 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Sales <small className="text-slate-500 font-normal">({filteredSalesList.length} Transactions)</small>
                </h3>
                <span className="ml-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {currentBranchData.name}
                </span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 overflow-y-auto flex-1">
              <table className="w-full vanguard-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Company</th>
                    <th className="text-right">Total</th>
                    <th>Date</th>
                    <th>Branch Name</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalesList.map((s, idx) => (
                    <tr key={s.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="font-mono font-bold text-blue-700">{s.REFERENCE}</td>
                      <td className="font-bold text-slate-900">{s.CUSTOMER}</td>
                      <td className="text-slate-600">{s.COMPANY}</td>
                      <td className="font-mono font-black text-right text-emerald-800">{formatCurrency(s.TOTAL)}</td>
                      <td className="font-mono text-slate-600">{s.DATE}</td>
                      <td className="text-slate-700 text-xs">{s.BARANCHNAME}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded bg-[#195a96] hover:bg-[#134472] text-xs font-bold text-white transition cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG 2: PURCHASE (Last 10 Transactions) */}
      {activeModal === 'purchase' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-xl max-w-4xl w-full p-5 text-slate-800 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Purchase <small className="text-slate-500 font-normal">({filteredPurchaseList.length} Transactions)</small>
                </h3>
                <span className="ml-2 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {currentBranchData.name}
                </span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 overflow-y-auto flex-1">
              <table className="w-full vanguard-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Supplier Name</th>
                    <th className="text-right">Total</th>
                    <th>Date</th>
                    <th>Branch Name</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchaseList.map((p, idx) => (
                    <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="font-mono font-bold text-amber-700">{p.INVOICENUMBER}</td>
                      <td className="font-bold text-slate-900">{p.SUPPLIERNAME}</td>
                      <td className="font-mono font-black text-right text-slate-900">{formatCurrency(p.SUBTOTAL)}</td>
                      <td className="font-mono text-slate-600">{p.PURCHASEDATE}</td>
                      <td className="text-slate-700 text-xs">{p.BARANCHNAME}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded bg-[#195a96] hover:bg-[#134472] text-xs font-bold text-white transition cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG 3: LOST GOODS / WASTAGE (Last 10 Transactions) */}
      {activeModal === 'wastage' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-xl max-w-4xl w-full p-5 text-slate-800 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Lost Goods / Wastage <small className="text-slate-500 font-normal">({filteredWastageList.length} Transactions)</small>
                </h3>
                <span className="ml-2 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                  {currentBranchData.name}
                </span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 overflow-y-auto flex-1">
              <table className="w-full vanguard-table">
                <thead>
                  <tr>
                    <th>Wastage #</th>
                    <th className="text-right">Cost</th>
                    <th>Reason</th>
                    <th>Date</th>
                    <th>Branch Name</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWastageList.map((w, idx) => (
                    <tr key={w.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="font-mono font-bold text-red-700">{w.SER}</td>
                      <td className="font-mono font-black text-right text-red-700">{formatCurrency(w.COST)}</td>
                      <td className="text-slate-800 font-medium">{w.REASON}</td>
                      <td className="font-mono text-slate-600">{w.DDATE}</td>
                      <td className="text-slate-700 text-xs">{w.BARANCHNAME}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded bg-[#195a96] hover:bg-[#134472] text-xs font-bold text-white transition cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG 4: VARIANCE (Last 10 Transactions) */}
      {activeModal === 'variance' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-xl max-w-4xl w-full p-5 text-slate-800 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Variance Adjustments <small className="text-slate-500 font-normal">({filteredVarianceList.length} Transactions)</small>
                </h3>
                <span className="ml-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {currentBranchData.name}
                </span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 overflow-y-auto flex-1">
              <table className="w-full vanguard-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item Description</th>
                    <th className="text-right">Variance Units</th>
                    <th>Warehouse Location</th>
                    <th>Date</th>
                    <th>Branch Name</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVarianceList.map((v) => (
                    <tr key={v.SER} className={v.SER % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="font-mono font-bold text-blue-700">ADJ-{v.SER}</td>
                      <td className="font-bold text-slate-900">{v.PRODUCT}</td>
                      <td className={`font-mono font-black text-right ${v.VARIANCE < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {v.VARIANCE > 0 ? `+${v.VARIANCE}` : v.VARIANCE}
                      </td>
                      <td className="text-slate-600">{v.LOCATION}</td>
                      <td className="font-mono text-slate-600">{v.ADATE}</td>
                      <td className="text-slate-700 text-xs">{v.BARANCHNAME}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded bg-[#195a96] hover:bg-[#134472] text-xs font-bold text-white transition cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG 5: STOCK VALUE & CATEGORIES */}
      {activeModal === 'stock' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-xl max-w-3xl w-full p-5 text-slate-800 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Stock Valuation by Category</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-2 flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showNegatives}
                  onChange={(e) => setShowNegatives(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span>Show Negative Values</span>
              </label>
              <span className="text-slate-500 font-mono">Total Categories: {stockCategories.length}</span>
            </div>

            <div className="mt-1 overflow-y-auto flex-1">
              <table className="w-full vanguard-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th className="text-right">Available Qty</th>
                    <th className="text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {stockCategories.map((c, idx) => (
                    <tr key={c.CATEGORYNAME} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="font-bold text-slate-900">{c.CATEGORYNAME}</td>
                      <td className="font-mono text-right text-slate-700">{c.QTY.toLocaleString()}</td>
                      <td className="font-mono font-black text-right text-emerald-800">{formatCurrency(c.AMOUNT)}</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50 font-black border-t-2 border-emerald-300">
                    <td className="text-emerald-950 font-bold">Consolidated Stock Value</td>
                    <td className="font-mono text-right text-emerald-950">
                      {stockCategories.reduce((a, b) => a + b.QTY, 0).toLocaleString()}
                    </td>
                    <td className="font-mono text-right text-emerald-900 text-sm">
                      {formatCurrency(stockCategories.reduce((a, b) => a + b.AMOUNT, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded bg-[#195a96] hover:bg-[#134472] text-xs font-bold text-white transition cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG 6: EXPIRY AUDIT MODAL */}
      {activeModal === 'expiry' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-xl max-w-4xl w-full p-5 text-slate-800 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-base text-slate-900">Expired & Expiring Items Audit</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 overflow-y-auto flex-1">
              <table className="w-full vanguard-table">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Storage Location</th>
                    <th>Product</th>
                    <th className="text-right">Qty on Hand</th>
                    <th>Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {expiredItems.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="font-semibold text-slate-800">{item.branch}</td>
                      <td className="text-slate-600">{item.location}</td>
                      <td className="font-bold text-slate-900">{item.product}</td>
                      <td className="font-mono text-right font-bold text-red-700">{item.qty.toFixed(2)}</td>
                      <td className="font-mono text-slate-700">{item.expiry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded bg-[#195a96] hover:bg-[#134472] text-xs font-bold text-white transition cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. QUANTITY NOT RECEIVED SLIDE-OUT DRAWER / MODAL                         */}
      {/* ========================================================================= */}
      {showQtyNotReceived && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-2xl max-w-3xl w-full p-5 text-slate-800 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Quantity Not Received <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono font-bold">{totalQtyNotReceivedCount} Pending</span>
                </h3>
              </div>
              <button onClick={() => setShowQtyNotReceived(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs: Product Requests vs Transfers */}
            <div className="flex items-center gap-2 mt-3 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setQtyNotReceivedTab('requests')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${qtyNotReceivedTab === 'requests' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Product Requests ({pendingProductRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setQtyNotReceivedTab('transfers')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${qtyNotReceivedTab === 'transfers' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Transfers / Requisitions ({pendingTransfers.length})
              </button>
            </div>

            <div className="mt-3 overflow-y-auto flex-1">
              {qtyNotReceivedTab === 'requests' ? (
                <table className="w-full vanguard-table">
                  <thead>
                    <tr>
                      <th>Req. #</th>
                      <th>Request Date</th>
                      <th>Requesting Branch</th>
                      <th>Item Description</th>
                      <th className="text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingProductRequests.map((r, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                        <td className="font-mono font-bold text-blue-700">{r.reqNo}</td>
                        <td className="font-mono text-slate-600">{r.reqDate}</td>
                        <td className="text-slate-800 font-semibold">{r.branch}</td>
                        <td className="text-slate-900">{r.item}</td>
                        <td className="font-mono text-right font-black text-amber-700">{r.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full vanguard-table">
                  <thead>
                    <tr>
                      <th>Transfer #</th>
                      <th>Date</th>
                      <th>From Branch</th>
                      <th>To Branch</th>
                      <th>Item Description</th>
                      <th className="text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTransfers.map((t, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                        <td className="font-mono font-bold text-purple-700">{t.reqNo}</td>
                        <td className="font-mono text-slate-600">{t.reqDate}</td>
                        <td className="text-slate-700 text-xs">{t.fromBranch}</td>
                        <td className="text-slate-800 font-semibold text-xs">{t.toBranch}</td>
                        <td className="text-slate-900">{t.item}</td>
                        <td className="font-mono text-right font-black text-purple-700">{t.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowQtyNotReceived(false)}
                className="px-4 py-1.5 rounded bg-[#195a96] hover:bg-[#134472] text-xs font-bold text-white transition cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. ACTIONS DROPDOWN MODALS                                               */}
      {/* ========================================================================= */}

      {/* MODAL 1: SYNC INVENTORY SALES */}
      {activeActionModal === 'sync' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-xl max-w-md w-full p-5 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Sync Inventory Sales</h3>
              </div>
              <button onClick={() => setActiveActionModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="my-4 space-y-3 text-xs">
              <p className="text-slate-600">
                Synchronize POS cash register transactions and sales receipts with inventory cost ledger for selected branch:
              </p>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Branch:</label>
                <select
                  value={syncBranch}
                  onChange={(e) => setSyncBranch(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800"
                >
                  <option value="ALL">All Branches (Consolidated)</option>
                  {allBranchesList.map(b => (
                    <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                className="px-3.5 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSyncSales}
                disabled={isSyncing}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REORDER SUGGESTIONS */}
      {activeActionModal === 'reorder' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-xl max-w-2xl w-full p-5 text-slate-800 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">Reorder Suggestions Report</h3>
              </div>
              <button onClick={() => setActiveActionModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-3 overflow-y-auto flex-1">
              <table className="w-full vanguard-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Current Qty</th>
                    <th>Reorder Point</th>
                    <th>Suggested Reorder</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-bold text-slate-900">Dark Green Marasca Glass Bottles 500ml</td>
                    <td className="font-mono text-red-700 font-bold">840</td>
                    <td className="font-mono text-slate-600">2,500</td>
                    <td className="font-mono text-emerald-700 font-black">+2,000 Pcs</td>
                  </tr>
                  <tr>
                    <td className="font-bold text-slate-900">Extra Virgin Olive Oil 500ml Glass</td>
                    <td className="font-mono text-amber-700 font-bold">120</td>
                    <td className="font-mono text-slate-600">500</td>
                    <td className="font-mono text-emerald-700 font-black">+400 Bottles</td>
                  </tr>
                  <tr>
                    <td className="font-bold text-slate-900">Pure Castile Soap Unscented 150g</td>
                    <td className="font-mono text-amber-700 font-bold">75</td>
                    <td className="font-mono text-slate-600">300</td>
                    <td className="font-mono text-emerald-700 font-black">+250 Bars</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                className="px-3.5 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Suggestions</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: STOCK DEDUCTION CHECKLIST */}
      {activeActionModal === 'checklist' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-xl max-w-md w-full p-5 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Stock Deduction Checklist</h3>
              </div>
              <button onClick={() => setActiveActionModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="my-4 space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900 font-semibold">
                <span>Bill of Materials (BOM) Production Recipes</span>
                <span className="text-xs bg-emerald-200 px-2 py-0.5 rounded-full font-bold">✓ Verified</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900 font-semibold">
                <span>Daily Sales Invoices Posting Status</span>
                <span className="text-xs bg-emerald-200 px-2 py-0.5 rounded-full font-bold">✓ Complete</span>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between text-blue-900 font-semibold">
                <span>Inter-branch In-Transit Requisitions</span>
                <span className="text-xs bg-blue-200 px-2 py-0.5 rounded-full font-bold">2 In-Transit</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-slate-800 font-semibold">
                <span>Physical Variance Adjustments Signoff</span>
                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full font-bold">0 Pending</span>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                className="px-4 py-1.5 rounded bg-[#195a96] hover:bg-[#134472] text-xs font-bold text-white transition cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: END OF MONTH CLOSING */}
      {activeActionModal === 'endOfMonth' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-300 rounded-xl max-w-lg w-full p-5 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-slate-900">End Of Month Closing Routine</h3>
              </div>
              <button onClick={() => setActiveActionModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 text-xs space-y-3">
              <p className="text-slate-600">
                Ensure all operational vouchers for Month <strong>{selectedMonth} ({selectedYear})</strong> are fully posted before final lock:
              </p>

              <table className="w-full vanguard-table">
                <thead>
                  <tr>
                    <th>Module</th>
                    <th className="text-right">Unposted Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-bold text-slate-800">Purchases Ledger</td>
                    <td className="font-mono text-right font-bold text-emerald-700">0</td>
                  </tr>
                  <tr>
                    <td className="font-bold text-slate-800">Sales Invoices</td>
                    <td className="font-mono text-right font-bold text-emerald-700">0</td>
                  </tr>
                  <tr>
                    <td className="font-bold text-slate-800">Product Requests</td>
                    <td className="font-mono text-right font-bold text-emerald-700">0</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveActionModal(null);
                  setRecalcToast('Fiscal month reopened for corrections.');
                  setTimeout(() => setRecalcToast(null), 3000);
                }}
                className="px-3 py-1.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs transition cursor-pointer"
              >
                Reopen Month
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveActionModal(null)}
                  className="px-3.5 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEndOfMonth}
                  disabled={isEndingMonth}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isEndingMonth ? 'Processing...' : 'End Of Month'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AuthenticVanguardOperationsDashboard() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500 font-mono">
          Loading Vanguard Operations Dashboard...
        </div>
      }
    >
      <OperationsDashboardContent />
    </Suspense>
  );
}
