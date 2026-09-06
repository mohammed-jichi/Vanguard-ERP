'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  ArrowRight
} from 'lucide-react';
import { useTenant } from '@/lib/TenantContext';

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

export default function AuthenticOmegaOperationsDashboard() {
  const { currentTenant } = useTenant();

  // Filters matching Omega toolbar exact specs
  const [selectedBranch, setSelectedBranch] = useState<string>('0');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('9');
  const [showNegatives, setShowNegatives] = useState<boolean>(false);
  const [recalculating, setRecalculating] = useState<boolean>(false);
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);

  // Active Tab: general (Stock Movements), comparative, cost, stock
  const [activeTab, setActiveTab] = useState<string>('general');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [expiryWarningDismissed, setExpiryWarningDismissed] = useState<boolean>(false);

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
    { id: 1, REFERENCE: 'INV-4000035', CUSTOMER: 'Abou Hamza', COMPANY: 'Abou Hamza Nuts & Oils', TOTAL: 23940000 / 89500, DATE: '2026-09-04', BARANCHNAME: '00001 - Southern Olive Oil Products S.A.R.L' },
    { id: 2, REFERENCE: 'INV-4000036', CUSTOMER: 'George Haddad', COMPANY: 'Beirut Gourmet House', TOTAL: 18450000 / 89500, DATE: '2026-09-04', BARANCHNAME: '00001 - Southern Olive Oil Products S.A.R.L' },
    { id: 3, REFERENCE: 'INV-4000037', CUSTOMER: 'Fadi Mroueh', COMPANY: 'Nabatieh Southern Hub', TOTAL: 34100000 / 89500, DATE: '2026-09-03', BARANCHNAME: '00002 - Nabatieh Southern Hub' },
    { id: 4, REFERENCE: 'INV-4000038', CUSTOMER: 'Salim Kassir', COMPANY: 'Saida Wholesalers', TOTAL: 12500000 / 89500, DATE: '2026-09-03', BARANCHNAME: '00003 - Saida Distribution Depot' },
    { id: 5, REFERENCE: 'INV-4000039', CUSTOMER: 'Karim Daher', COMPANY: 'Tyre Hospitality Stores', TOTAL: 9800000 / 89500, DATE: '2026-09-02', BARANCHNAME: '00004 - Tyre Coastal Center' },
    { id: 6, REFERENCE: 'INV-4000040', CUSTOMER: 'Ziad Al-Amin', COMPANY: 'Al-Amin Superstores', TOTAL: 41200000 / 89500, DATE: '2026-09-02', BARANCHNAME: '00001 - Southern Olive Oil Products S.A.R.L' },
    { id: 7, REFERENCE: 'INV-4000041', CUSTOMER: 'Hassan Srour', COMPANY: 'Choueifat Depot Direct', TOTAL: 15600000 / 89500, DATE: '2026-09-01', BARANCHNAME: '00001 - Southern Olive Oil Products S.A.R.L' },
    { id: 8, REFERENCE: 'INV-4000042', CUSTOMER: 'Nabil Khoury', COMPANY: 'Khoury Food & Oils', TOTAL: 27800000 / 89500, DATE: '2026-08-31', BARANCHNAME: '00002 - Nabatieh Southern Hub' },
    { id: 9, REFERENCE: 'INV-4000043', CUSTOMER: 'Samir Bazzi', COMPANY: 'Bint Jbeil Retailers', TOTAL: 8900000 / 89500, DATE: '2026-08-30', BARANCHNAME: '00002 - Nabatieh Southern Hub' },
    { id: 10, REFERENCE: 'INV-4000044', CUSTOMER: 'Ahmad Chehab', COMPANY: 'Saida Wholesalers', TOTAL: 38200000 / 89500, DATE: '2026-08-29', BARANCHNAME: '00003 - Saida Distribution Depot' },
  ];

  // 2. Purchase Dialog Records (Last 10 Transactions)
  const purchaseList: PurchaseRecord[] = [
    { id: 1, INVOICENUMBER: 'PO-9821', SUPPLIERNAME: 'Koura Olive Growers Syndicate', SUBTOTAL: 45000.00, PURCHASEDATE: '2026-09-04', BARANCHNAME: '00001 - Southern Olive Oil Products S.A.R.L' },
    { id: 2, INVOICENUMBER: 'PO-9822', SUPPLIERNAME: 'Akkar Organic Farmers Guild', SUBTOTAL: 32500.00, PURCHASEDATE: '2026-09-03', BARANCHNAME: '00001 - Southern Olive Oil Products S.A.R.L' },
    { id: 3, INVOICENUMBER: 'PO-9823', SUPPLIERNAME: 'Lebanon Glassworks S.A.L', SUBTOTAL: 18400.00, PURCHASEDATE: '2026-09-02', BARANCHNAME: '00001 - Southern Olive Oil Products S.A.R.L' },
    { id: 4, INVOICENUMBER: 'PO-9824', SUPPLIERNAME: 'Italian Stainless Caps & Filters Co.', SUBTOTAL: 8900.00, PURCHASEDATE: '2026-08-30', BARANCHNAME: '00001 - Southern Olive Oil Products S.A.R.L' },
    { id: 5, INVOICENUMBER: 'PO-9825', SUPPLIERNAME: 'Hasbaya Olive Tree Farms', SUBTOTAL: 27600.00, PURCHASEDATE: '2026-08-28', BARANCHNAME: '00002 - Nabatieh Southern Hub' },
    { id: 6, INVOICENUMBER: 'PO-9826', SUPPLIERNAME: 'Marjeyoun Agricultural Supply', SUBTOTAL: 14200.00, PURCHASEDATE: '2026-08-26', BARANCHNAME: '00002 - Nabatieh Southern Hub' },
    { id: 7, INVOICENUMBER: 'PO-9827', SUPPLIERNAME: 'Mediterranean Label Printing Press', SUBTOTAL: 6500.00, PURCHASEDATE: '2026-08-24', BARANCHNAME: '00003 - Saida Distribution Depot' },
    { id: 8, INVOICENUMBER: 'PO-9828', SUPPLIERNAME: 'Tyre Bio-Agronomy Co.', SUBTOTAL: 11200.00, PURCHASEDATE: '2026-08-20', BARANCHNAME: '00004 - Tyre Coastal Center' },
  ];

  // 3. Wastage Dialog Records (Last 10 Transactions)
  const wastageList: WastageRecord[] = [
    { id: 1, SER: 'WST-2026-089', COST: 1250.00, DDATE: '2026-09-02', BARANCHNAME: '00001 - Southern Olive Oil Products S.A.R.L', REASON: 'Glass Bottle Breakage during conveyor boxing' },
    { id: 2, SER: 'WST-2026-088', COST: 890.00, DDATE: '2026-08-29', BARANCHNAME: '00001 - Southern Olive Oil Products S.A.R.L', REASON: 'Sediment residue filter drain cleaning' },
    { id: 3, SER: 'WST-2026-087', COST: 420.00, DDATE: '2026-08-27', BARANCHNAME: '00002 - Nabatieh Southern Hub', REASON: 'Cap leak on 500ml sample tins' },
    { id: 4, SER: 'WST-2026-086', COST: 310.00, DDATE: '2026-08-24', BARANCHNAME: '00003 - Saida Distribution Depot', REASON: 'Pallet drop during forklift staging' },
    { id: 5, SER: 'WST-2026-085', COST: 680.00, DDATE: '2026-08-21', BARANCHNAME: '00001 - Southern Olive Oil Products S.A.R.L', REASON: 'Olive pressing calibration waste' },
  ];

  // 4. Variance Dialog Records (Last 10 Transactions)
  const varianceList: VarianceRecord[] = [
    { SER: 1, PRODUCT: 'Extra Virgin Olive Oil 500ml Glass', VARIANCE: -4, LOCATION: 'Finished Goods Bay A', ADATE: '2026-09-01', BARANCHNAME: '00001 - Southern Olive Oil Products S.A.R.L' },
    { SER: 2, PRODUCT: 'Virgin Olive Oil 1L Tin', VARIANCE: +2, LOCATION: 'Finished Goods Bay B', ADATE: '2026-08-31', BARANCHNAME: '00001 - Southern Olive Oil Products S.A.R.L' },
    { SER: 3, PRODUCT: 'Extra Virgin Olive Oil 16L Bulk Tin', VARIANCE: -1, LOCATION: 'Bulk Storage Bay 3', ADATE: '2026-08-28', BARANCHNAME: '00002 - Nabatieh Southern Hub' },
    { SER: 4, PRODUCT: 'Traditional Castile Soap Bar 150g', VARIANCE: +12, LOCATION: 'Cosmetics Shelf C', ADATE: '2026-08-25', BARANCHNAME: '00003 - Saida Distribution Depot' },
    { SER: 5, PRODUCT: 'Organic Cured Green Olives 1kg Jar', VARIANCE: -3, LOCATION: 'Pickling Cellar 1', ADATE: '2026-08-22', BARANCHNAME: '00004 - Tyre Coastal Center' },
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
      branch: '00001 - Southern Olive Oil Products S.A.R.L',
      vals: [112000, 58000, 24000, 26000, 18000, 15000],
      total: 253000
    },
    {
      branch: '00002 - Nabatieh Southern Hub',
      vals: [38000, 21000, 8000, 9500, 6200, 4200],
      total: 86900
    },
    {
      branch: '00003 - Saida Distribution Depot',
      vals: [21500, 11200, 4200, 4800, 3100, 2100],
      total: 46900
    },
    {
      branch: '00004 - Tyre Coastal Center',
      vals: [13000, 6000, 2200, 2500, 1600, 800],
      total: 26100
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

  // Real Cost of Goods Sold (COGS) Data
  const cogsData = [
    { category: 'Extra Virgin Olive Oil', beginning: 198000, purchase: 45000, ending: 184500, cogs: 58500 },
    { category: 'Virgin Olive Oil', beginning: 104000, purchase: 32500, ending: 96200, cogs: 40300 },
    { category: 'Pomace & Refined Oil', beginning: 42000, purchase: 11000, ending: 38400, cogs: 14600 },
    { category: 'Table Olives & Pickles', beginning: 46000, purchase: 14500, ending: 42800, cogs: 17700 },
    { category: 'Pure Olive Oil Soaps & Cosmetics', beginning: 31000, purchase: 8200, ending: 28900, cogs: 10300 },
    { category: 'Packaging & Glass Materials', beginning: 24500, purchase: 18400, ending: 22100, cogs: 20800 },
  ];

  // Expired Items in Stock Tab
  const expiredItems = [
    { branch: '00001 - Southern Olive Oil Products S.A.R.L', location: 'Finished Goods Bay B', product: 'Traditional Cured Black Olives 500g', qty: 24.00, expiry: '2026-08-25' },
    { branch: '00002 - Nabatieh Southern Hub', location: 'Retail Display Shelf 4', product: 'Olive Blossom Infused Hand Balm 50ml', qty: 12.00, expiry: '2026-08-28' },
    { branch: '00001 - Southern Olive Oil Products S.A.R.L', location: 'Sample Staging Area', product: 'Extra Virgin Early Harvest 250ml', qty: 18.00, expiry: '2026-09-15' },
    { branch: '00003 - Saida Distribution Depot', location: 'Vault Rack 2', product: 'Castile Liquid Soap 1L Refill', qty: 8.00, expiry: '2026-09-20' },
  ];

  // Out of Stock Items Data
  const outOfStockBranches = [
    {
      id: 'branch-1',
      branchId: '1',
      branchName: '00001 - Southern Olive Oil Products S.A.R.L',
      items: [
        { name: 'Organic Green Olive Paste with Thyme 200g', qty: 0.00 },
        { name: 'Cold Pressed Sesame & Olive Blended Oil 750ml', qty: 0.00 },
        { name: 'Handcrafted Laurel & Olive Oil Shaving Bar', qty: 0.00 },
      ]
    },
    {
      id: 'branch-2',
      branchId: '2',
      branchName: '00002 - Nabatieh Southern Hub',
      items: [
        { name: 'Extra Virgin Ceramic Artisan Cruet 500ml', qty: 0.00 },
        { name: 'Cracked Green Olives with Wild Lemon 1kg', qty: 0.00 },
      ]
    },
    {
      id: 'branch-3',
      branchId: '3',
      branchName: '00003 - Saida Distribution Depot',
      items: [
        { name: 'Olive Leaf Herbal Infusion Tea 100g', qty: 0.00 },
      ]
    }
  ];

  // Below Minimum Stock Level Items Data
  const belowMinStockItems = [
    { branch: '00001 - Southern Olive Oil Products S.A.R.L', location: 'Finished Goods Bay A', product: 'Extra Virgin Olive Oil 500ml Glass', minQty: 500, qtyOH: 120 },
    { branch: '00001 - Southern Olive Oil Products S.A.R.L', location: 'Packaging Rack 1', product: 'Dark Green Marasca Glass Bottles 500ml', minQty: 2500, qtyOH: 840 },
    { branch: '00002 - Nabatieh Southern Hub', location: 'Retail Staging 2', product: 'Virgin Olive Oil 1L Tin', minQty: 200, qtyOH: 45 },
    { branch: '00003 - Saida Distribution Depot', location: 'Bay C', product: 'Table Olives Stuffed with Almond 500g', minQty: 150, qtyOH: 28 },
    { branch: '00004 - Tyre Coastal Center', location: 'Shelf 1', product: 'Castile Soap Unscented 150g Bar', minQty: 300, qtyOH: 75 },
  ];

  const handleRefresh = () => {
    setRecalculating(true);
    setTimeout(() => {
      setRecalculating(false);
    }, 600);
  };

  const handleExportPdf = () => {
    setExportingPdf(true);
    setTimeout(() => {
      setExportingPdf(false);
      window.print();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#edf3f9] text-[#0f172a] font-sans pb-16 inventory-dashboard-page">
      <style jsx global>{`
        /* Authentic Omega Operation Center / Inventory Dashboard CSS & Measurements */
        .inventory-dashboard-page {
          --id-bg: #edf3f9;
          --id-surface: #ffffff;
          --id-surface-soft: #f8fafc;
          --id-surface-muted: #e2e8f0;
          --id-border: #cbd5e1;
          --id-text: #0f172a;
          --id-muted: #64748b;
        }

        /* Topbar exact Omega measurements */
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
          margin: 0;
        }

        /* Filter exact widths direct from Omega CSS */
        .inventory-dashboard-filter.branch-filter {
          flex: 0 0 260px;
        }
        .inventory-dashboard-filter.currency-filter {
          flex: 0 0 150px;
        }
        .inventory-dashboard-filter.year-filter {
          flex: 0 0 110px;
        }
        .inventory-dashboard-filter.month-filter {
          flex: 0 0 150px;
        }

        .inventory-dashboard-filter select {
          width: 100%;
          min-height: 38px;
          height: 38px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.3;
          border: 1px solid #cbd5e1;
          padding: 0 12px;
          background-color: #ffffff;
          color: #1e293b;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          outline: none;
        }
        .inventory-dashboard-filter select:focus {
          border-color: #2563eb;
          ring: 2px solid rgba(37, 99, 235, 0.2);
        }

        .inventory-dashboard-actions {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          margin-left: auto;
          white-space: nowrap;
        }

        .inventory-dashboard-actions .btn {
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.15s ease;
        }

        .inventory-dashboard-export-pdf-btn {
          background-color: #0f172a;
          color: #ffffff;
          padding: 0 14px;
          border: 1px solid #0f172a;
        }
        .inventory-dashboard-export-pdf-btn:hover {
          background-color: #1e293b;
        }

        .inventoryDash_btn {
          min-width: 38px;
          width: 38px;
          padding: 0 6px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
          cursor: pointer;
        }
        .inventoryDash_btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .inventory-action-icon-btn {
          min-width: 38px;
          width: 38px;
          height: 38px;
          padding: 0;
          background-color: #0f172a;
          color: #ffffff;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
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

        /* 9 Pill Tabs exact Omega replication */
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

        /* Dense Omega Charcoal Tables */
        .omega-table {
          width: 100%;
          border-collapse: collapse;
        }
        .omega-table th {
          background-color: #3e3e3e;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          padding: 8px 12px;
          border: 1px solid #525252;
          text-align: left;
        }
        .omega-table td {
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
      {/* 1. TOPBAR CONTROLS & FILTERS MATCHING EXACT OMEGA MEASUREMENTS            */}
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
                className="w-8 h-8 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-xs"
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
                onChange={(e) => setSelectedBranch(e.target.value)}
                title="Branch Filter"
              >
                <option value="0">All Branches</option>
                <option value="1">00001 - Southern Olive Oil Products S.A.R.L</option>
                <option value="2">00002 - Nabatieh Southern Hub</option>
                <option value="3">00003 - Saida Distribution Depot</option>
                <option value="4">00004 - Tyre Coastal Center</option>
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
          <div className="inventory-dashboard-actions">
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
              href="/backoffice/operations?tab=catalog"
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

            {/* Quick Links Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="btn inventory-action-icon-btn bg-blue-600 hover:bg-blue-700"
                title="Actions & Navigation Hub"
              >
                <Menu className="w-4 h-4 text-white" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-xs font-medium">
                  <Link
                    href="/product-insights"
                    target="_blank"
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Box className="w-4 h-4 text-indigo-600" />
                    <span>Product Insights</span>
                  </Link>
                  <Link
                    href="/inventory?tab=purchases"
                    target="_blank"
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <ShoppingCart className="w-4 h-4 text-amber-600" />
                    <span>Purchase Dashboard</span>
                  </Link>
                  <Link
                    href="/backoffice/dashboard"
                    target="_blank"
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Sales Dashboard</span>
                  </Link>
                  <Link
                    href="/sales-manager-dashboard"
                    target="_blank"
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Sales Team Performance</span>
                  </Link>
                  <Link
                    href="/customer-insights"
                    target="_blank"
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <PieChart className="w-4 h-4 text-violet-600" />
                    <span>Customer Insights</span>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE 5 OMEGA SIGNATURE METRIC BOXES WITH (i) MARK CLICKABLE TABLES      */}
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
                <div className="body">{formatCurrency(248500)}</div>
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
                <div className="body">{formatCurrency(164200)}</div>
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
                <div className="body">{formatCurrency(4820)}</div>
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
                <div className="body">{formatCurrency(-1150)}</div>
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
                <div className="body">{formatCurrency(412900)}</div>
              </div>
            </div>
          </div>

          {/* BOX 6: EXPIRY ALERT (#dc2626) */}
          {!expiryWarningDismissed ? (
            <div 
              onClick={() => setActiveModal('expiry')}
              className="dashboard-child cursor-pointer relative" 
              style={{ backgroundColor: '#dc2626', borderColor: '#991b1b' }}
              title="Click to view Expired & Expiring Items"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpiryWarningDismissed(true);
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-xs font-bold z-10 transition"
                title="Dismiss warning"
              >
                ×
              </button>
              <div className="dashboard-body text-white">
                <span className="metric-left-icon text-white">
                  <Bell className="w-4 h-4 animate-bounce" />
                </span>
                <div className="inventory-metric-main">
                  <div className="title inventory-metric-title text-white">Expiry Alert!</div>
                  <div className="body text-white text-xs font-semibold mt-1">
                    Expired items or expiring soon (4 Items)
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => setExpiryWarningDismissed(false)}
              className="dashboard-child cursor-pointer flex items-center justify-center p-3 bg-slate-200 border-dashed border-slate-400 text-slate-600 text-xs font-bold hover:bg-slate-300 transition"
              title="Show Expiry Alert"
            >
              <Bell className="w-4 h-4 mr-1.5 text-red-600" />
              <span>Show Expiry Alert</span>
            </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. NINE AUTHENTIC PILL NAVIGATION TABS (EXACT OMEGA REPLICATION)          */}
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

            <Link
              href="/product-insights"
              target="_blank"
              className="inventory-tab-pill"
            >
              <span className="inventory-tab-icon"><Box className="w-3 h-3" /></span>
              <span>Product Insights ↗</span>
            </Link>

            <Link
              href="/inventory?tab=purchases"
              target="_blank"
              className="inventory-tab-pill"
            >
              <span className="inventory-tab-icon"><ShoppingCart className="w-3 h-3" /></span>
              <span>Purchase Dashboard ↗</span>
            </Link>

            <Link
              href="/backoffice/dashboard"
              target="_blank"
              className="inventory-tab-pill"
            >
              <span className="inventory-tab-icon"><TrendingUp className="w-3 h-3" /></span>
              <span>Sales Dashboard ↗</span>
            </Link>

            <Link
              href="/sales-manager-dashboard"
              target="_blank"
              className="inventory-tab-pill"
            >
              <span className="inventory-tab-icon"><Users className="w-3 h-3" /></span>
              <span>Sales Team Performance ↗</span>
            </Link>

            <Link
              href="/customer-insights"
              target="_blank"
              className="inventory-tab-pill"
            >
              <span className="inventory-tab-icon"><PieChart className="w-3 h-3" /></span>
              <span>Customer Insights ↗</span>
            </Link>
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
                <span>Transactions</span>
                {openAccordion['transactions'] ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
              </div>

              {openAccordion['transactions'] && (
                <div className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Left: Category vs Sales/Purchase/Wastage/Variance Table */}
                    <div className="lg:col-span-6 overflow-x-auto">
                      <table className="w-full omega-table">
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
                              <td className="font-mono text-right text-emerald-700 font-bold">{formatCurrency(row.sales)}</td>
                              <td className="font-mono text-right text-amber-700 font-bold">{formatCurrency(row.purchase)}</td>
                              <td className="font-mono text-right text-red-700 font-bold">{formatCurrency(row.wastage)}</td>
                              <td className={`font-mono text-right font-bold ${row.variance < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                                {formatCurrency(row.variance)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Right: Comparative Chart Canvas */}
                    <div className="lg:col-span-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="text-xs font-bold text-slate-700 mb-3 flex items-center justify-between">
                        <span>Transactions Outflow vs Inflow (Period 2026)</span>
                        <span className="text-[11px] font-mono text-slate-500">Sales vs Purchase vs Wastage</span>
                      </div>
                      <div className="h-56 flex items-end gap-3 pt-6 pb-2 px-2 overflow-x-auto">
                        {transactionsCategoryData.map((t) => {
                          const maxVal = 130000;
                          const salesH = (t.sales / maxVal) * 160;
                          const purchaseH = (t.purchase / maxVal) * 160;
                          const wastageH = Math.max(4, (t.wastage / 3000) * 40);

                          return (
                            <div key={t.category} className="flex-1 flex flex-col items-center gap-1 min-w-[55px]">
                              <div className="flex items-end gap-1 h-[170px]">
                                <div 
                                  style={{ height: `${salesH}px`, backgroundColor: '#337718' }} 
                                  className="w-3.5 rounded-t-sm shadow-xs"
                                  title={`Sales: $${t.sales.toLocaleString()}`}
                                />
                                <div 
                                  style={{ height: `${purchaseH}px`, backgroundColor: '#e49f4b' }} 
                                  className="w-3.5 rounded-t-sm shadow-xs"
                                  title={`Purchase: $${t.purchase.toLocaleString()}`}
                                />
                                <div 
                                  style={{ height: `${wastageH}px`, backgroundColor: '#dc2626' }} 
                                  className="w-1.5 rounded-t-xs shadow-xs"
                                  title={`Wastage: $${t.wastage.toLocaleString()}`}
                                />
                              </div>
                              <span className="text-[10px] font-semibold text-slate-600 mt-1 text-center truncate max-w-[60px]" title={t.category}>
                                {t.category.split(' ')[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-center gap-6 mt-3 text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#337718' }} />
                          <span className="text-slate-700 text-[11px]">Sales</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#e49f4b' }} />
                          <span className="text-slate-700 text-[11px]">Purchase</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#dc2626' }} />
                          <span className="text-slate-700 text-[11px]">Lost Goods</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 2: PURCHASE (Purchase by Category & Purchase by Supplier) */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <div 
                onClick={() => toggleAccordion('purchase')}
                className="inventory-dashboard-card-header flex items-center justify-between cursor-pointer select-none"
              >
                <span>Purchase</span>
                {openAccordion['purchase'] ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
              </div>

              {openAccordion['purchase'] && (
                <div className="p-4 space-y-6">
                  {/* Purchase by Category */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Purchase by Category</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full omega-table">
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th className="text-right">All Branches</th>
                            <th className="text-right">Main Plant (00001)</th>
                            <th className="text-right">Nabatieh Hub (00002)</th>
                            <th className="text-right">Saida Depot (00003)</th>
                            <th className="text-right">Tyre Center (00004)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchaseCategoryData.map((row, idx) => (
                            <tr key={row.category} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                              <td className="font-semibold text-slate-900">{row.category}</td>
                              <td className="font-mono text-right font-black text-amber-800 bg-amber-50/40">{formatCurrency(row.allBranches)}</td>
                              <td className="font-mono text-right text-slate-700">{formatCurrency(row.b1)}</td>
                              <td className="font-mono text-right text-slate-700">{formatCurrency(row.b2)}</td>
                              <td className="font-mono text-right text-slate-700">{formatCurrency(row.b3)}</td>
                              <td className="font-mono text-right text-slate-700">{formatCurrency(row.b4)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Purchase by Supplier */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Purchase by Supplier</h4>
                    <div className="overflow-x-auto max-h-[260px]">
                      <table className="w-full omega-table">
                        <thead>
                          <tr>
                            <th>Supplier Name</th>
                            <th className="text-right">Total Invoiced Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchaseSupplierData.map((row, idx) => (
                            <tr key={row.supplier} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                              <td className="font-semibold text-slate-900">{row.supplier}</td>
                              <td className="font-mono text-right font-bold text-slate-900">{formatCurrency(row.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 3: LOST GOODS / WASTAGE */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <div 
                onClick={() => toggleAccordion('wastage')}
                className="inventory-dashboard-card-header flex items-center justify-between cursor-pointer select-none"
              >
                <span>Lost Goods / Wastage</span>
                {openAccordion['wastage'] ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
              </div>

              {openAccordion['wastage'] && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* By Category */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Lost Goods by Category</h4>
                    <table className="w-full omega-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th className="text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wastageCategoryData.map((row, idx) => (
                          <tr key={row.category} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="font-medium text-slate-800">{row.category}</td>
                            <td className="font-mono text-right font-bold text-red-700">{formatCurrency(row.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* By Supplier */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Lost Goods by Supplier</h4>
                    <table className="w-full omega-table">
                      <thead>
                        <tr>
                          <th>Supplier</th>
                          <th className="text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wastageSupplierData.map((row, idx) => (
                          <tr key={row.supplier} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="font-medium text-slate-800">{row.supplier}</td>
                            <td className="font-mono text-right font-bold text-red-700">{formatCurrency(row.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* By Type */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Lost Goods by Type</h4>
                    <table className="w-full omega-table">
                      <thead>
                        <tr>
                          <th>Wastage Type</th>
                          <th className="text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wastageTypeData.map((row, idx) => (
                          <tr key={row.type} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="font-medium text-slate-800">{row.type}</td>
                            <td className="font-mono text-right font-bold text-red-700">{formatCurrency(row.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 4: PRODUCTION / ITEMS ASSEMBLY */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <div 
                onClick={() => toggleAccordion('production')}
                className="inventory-dashboard-card-header flex items-center justify-between cursor-pointer select-none"
              >
                <span>Production / Items Assembly</span>
                {openAccordion['production'] ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
              </div>

              {openAccordion['production'] && (
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full omega-table">
                      <thead>
                        <tr>
                          <th>Division Name</th>
                          <th className="text-right">Consolidated (All Branches)</th>
                          <th className="text-right">Main Plant (00001)</th>
                          <th className="text-right">Nabatieh Hub (00002)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productionDivisionData.map((row, idx) => (
                          <tr key={row.division} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="font-semibold text-slate-900">{row.division}</td>
                            <td className="font-mono text-right font-black text-emerald-800 bg-emerald-50/40">{formatCurrency(row.allBranches)}</td>
                            <td className="font-mono text-right text-slate-700">{formatCurrency(row.b1)}</td>
                            <td className="font-mono text-right text-slate-700">{formatCurrency(row.b2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 5: ADJUSTMENT */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <div 
                onClick={() => toggleAccordion('adjustment')}
                className="inventory-dashboard-card-header flex items-center justify-between cursor-pointer select-none"
              >
                <span>Adjustment</span>
                {openAccordion['adjustment'] ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
              </div>

              {openAccordion['adjustment'] && (
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full omega-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th className="text-right">Total Net Adjustment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adjustmentCategoryData.map((row, idx) => (
                          <tr key={row.category} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="font-semibold text-slate-900">{row.category}</td>
                            <td className={`font-mono text-right font-bold ${row.amount < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                              {formatCurrency(row.amount)}
                            </td>
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

        {/* ======================================================================= */}
        {/* TAB 2: COMPARATIVE MATRIX                                               */}
        {/* ======================================================================= */}
        {activeTab === 'comparative' && (
          <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3.5 bg-[#3e3e3e] text-white font-bold text-xs flex items-center justify-between">
              <span>Current Stock Value by Branch & Categories (Comparative Matrix)</span>
              <span className="text-[11px] text-slate-300 font-mono">Real-time valuation across all sites</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full omega-table">
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
                  {/* Top All Branches Row matching authentic Omega */}
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
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 3: COST OF GOODS (COGS)                                             */}
        {/* ======================================================================= */}
        {activeTab === 'cost' && (
          <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3.5 bg-[#3e3e3e] text-white font-bold text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Real Cost Of Goods Matrix</span>
                <span className="text-[11px] text-slate-300 font-mono">Period: Year {selectedYear}</span>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
                <span>Recalculate Cost</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full omega-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th className="text-right">
                      Beginning Stock <span title="Value of stock at the beginning of the month"><Info className="w-3 h-3 inline text-amber-400 ml-1 cursor-pointer" /></span>
                    </th>
                    <th className="text-right">
                      Purchases <span title="Total purchases within this month"><Info className="w-3 h-3 inline text-amber-400 ml-1 cursor-pointer" /></span>
                    </th>
                    <th className="text-right">
                      Ending Stock <span title="Value of stock at the end of the month based on last cost"><Info className="w-3 h-3 inline text-amber-400 ml-1 cursor-pointer" /></span>
                    </th>
                    <th className="text-right bg-[#2d2d2d]">
                      Consumption / COGS <span title="Consumption / COGS = Beginning Stock + Purchases - Ending Stock"><Info className="w-3 h-3 inline text-amber-400 ml-1 cursor-pointer" /></span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cogsData.map((row, idx) => (
                    <tr key={row.category} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="font-semibold text-slate-900">{row.category}</td>
                      <td className="font-mono text-right text-slate-700">{formatCurrency(row.beginning)}</td>
                      <td className="font-mono text-right text-emerald-700">+{formatCurrency(row.purchase)}</td>
                      <td className="font-mono text-right text-slate-700">-{formatCurrency(row.ending)}</td>
                      <td className="font-mono font-black text-right text-blue-900 bg-blue-50/70">{formatCurrency(row.cogs)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-200/90 font-black border-t-2 border-slate-300">
                    <td className="text-slate-900">Total Consumption / COGS</td>
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
                  </tr>
                </tbody>
              </table>
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
                  <table className="w-full omega-table">
                    <thead>
                      <tr>
                        <th>Branch</th>
                        <th>Location</th>
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
                  {/* Branch filter for out of stock */}
                  <div className="flex items-center gap-2 text-xs">
                    <label htmlFor="outOfStockFilter" className="font-bold text-slate-700">Filter Branch:</label>
                    <select
                      id="outOfStockFilter"
                      value={outOfStockBranchFilter}
                      onChange={(e) => setOutOfStockBranchFilter(e.target.value)}
                      className="border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold text-slate-800"
                    >
                      <option value="0">All Branches</option>
                      <option value="1">00001 - Southern Olive Oil Products S.A.R.L</option>
                      <option value="2">00002 - Nabatieh Southern Hub</option>
                      <option value="3">00003 - Saida Distribution Depot</option>
                    </select>
                  </div>

                  {/* Out of Stock Grouped Branches */}
                  <div className="space-y-2">
                    {outOfStockBranches
                      .filter(b => outOfStockBranchFilter === '0' || b.branchId === outOfStockBranchFilter)
                      .map((branch) => {
                        const isExpanded = expandedOutOfStockBranches[branch.id];
                        return (
                          <div key={branch.id} className="border border-slate-200 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setExpandedOutOfStockBranches(prev => ({ ...prev, [branch.id]: !prev[branch.id] }))}
                              className="w-full flex items-center justify-between px-3 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition"
                            >
                              <span>{branch.branchName}</span>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-mono">{branch.items.length} Items</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-600" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-600" />}
                              </div>
                            </button>
                            {isExpanded && (
                              <table className="w-full omega-table">
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
                  <table className="w-full omega-table">
                    <thead>
                      <tr>
                        <th>Branch</th>
                        <th>Location</th>
                        <th>Product</th>
                        <th className="text-right">Min Qty</th>
                        <th className="text-right">Qty on Hand</th>
                      </tr>
                    </thead>
                    <tbody>
                      {belowMinStockItems.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          <td className="font-semibold text-slate-800">{item.branch}</td>
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
                    <table className="w-full omega-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th className="text-right">Available Qty</th>
                          <th className="text-right">Valuation Amount</th>
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
                <h3 className="font-bold text-base text-slate-900">Sales <small className="text-slate-500 font-normal">(Last 10 Transactions)</small></h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 overflow-y-auto flex-1">
              <table className="w-full omega-table">
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
                  {salesList.map((s, idx) => (
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
                className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition cursor-pointer"
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
                <h3 className="font-bold text-base text-slate-900">Purchase <small className="text-slate-500 font-normal">(Last 10 Transactions)</small></h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 overflow-y-auto flex-1">
              <table className="w-full omega-table">
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
                  {purchaseList.map((p, idx) => (
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
                className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition cursor-pointer"
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
                <h3 className="font-bold text-base text-slate-900">Lost Goods / Wastage <small className="text-slate-500 font-normal">(Last 10 Transactions)</small></h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 overflow-y-auto flex-1">
              <table className="w-full omega-table">
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
                  {wastageList.map((w, idx) => (
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
                className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition cursor-pointer"
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
                <h3 className="font-bold text-base text-slate-900">Variance Adjustments <small className="text-slate-500 font-normal">(Last 10 Transactions)</small></h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 overflow-y-auto flex-1">
              <table className="w-full omega-table">
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
                  {varianceList.map((v) => (
                    <tr key={v.SER} className={v.SER % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="font-mono font-bold text-blue-700">ADJ-{v.SER}</td>
                      <td className="font-bold text-slate-900">{v.PRODUCT}</td>
                      <td className={`font-mono font-black text-right ${v.VARIANCE < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
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
                className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition cursor-pointer"
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
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
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
              <table className="w-full omega-table">
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
                className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition cursor-pointer"
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
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 overflow-y-auto flex-1">
              <table className="w-full omega-table">
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
                className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
