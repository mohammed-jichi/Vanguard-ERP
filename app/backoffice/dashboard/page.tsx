'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  Ticket, 
  Clock, 
  RefreshCw, 
  BarChart3, 
  Scale, 
  Boxes, 
  UserCircle2, 
  Truck, 
  Users, 
  Globe, 
  Maximize2, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon,
  Sun,
  Moon,
  ArrowUp,
  ArrowDown,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';

export default function OmegaSalesDashboardPage() {
  // Theme state: dark (Omega default) or light
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Filters
  const [selectedBranch, setSelectedBranch] = useState('0'); // 0 = ALL
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'LBP'>('USD');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('9'); // September
  const [selectedDay, setSelectedDay] = useState('0'); // 0 = All Days
  const [chartType, setChartType] = useState<'line' | 'pie'>('line');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'summary' | 'comparative' | 'customers' | 'today' | 'geographics'>('summary');

  // Loading / Modal states
  const [recalculating, setRecalculating] = useState(false);
  const [eodModalOpen, setEodModalOpen] = useState(false);
  const [enlargedSection, setEnlargedSection] = useState<string | null>(null);

  const usdRate = 89500;

  const branches = [
    { id: '0', code: '000', name: 'All Branches' },
    { id: '1', code: '001', name: '001 - Choueifat Main Facility & Plant' },
    { id: '2', code: '002', name: '002 - Beirut Wholesale Hub' },
    { id: '3', code: '003', name: '003 - Saida Southern Center' },
    { id: '4', code: '004', name: '004 - Zahle Bekaa Branch' },
    { id: '5', code: '005', name: '005 - Tripoli North Depot' },
    { id: '6', code: '006', name: '006 - Nabatieh Center' },
  ];

  const months = [
    { id: '0', name: 'All Months' },
    { id: '1', name: 'January' },
    { id: '2', name: 'February' },
    { id: '3', name: 'March' },
    { id: '4', name: 'April' },
    { id: '5', name: 'May' },
    { id: '6', name: 'June' },
    { id: '7', name: 'July' },
    { id: '8', name: 'August' },
    { id: '9', name: 'September' },
    { id: '10', name: 'October' },
    { id: '11', name: 'November' },
    { id: '12', name: 'December' },
  ];

  const formatAmount = (usdVal: number) => {
    if (selectedCurrency === 'LBP') {
      const lbpVal = Math.round(usdVal * usdRate);
      return `${lbpVal.toLocaleString()} LBP`;
    }
    return `$${usdVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleRecalculate = () => {
    setRecalculating(true);
    setTimeout(() => {
      setRecalculating(false);
    }, 700);
  };

  // Branch EOD Closeout Status
  const branchEodDates = [
    { branch: '001 - Choueifat Main Facility', lastEod: '2026-09-04 23:45', status: 'Closed', cashier: 'Mahdi Jichi' },
    { branch: '002 - Beirut Wholesale Hub', lastEod: '2026-09-04 22:15', status: 'Closed', cashier: 'Hiba Aloulou' },
    { branch: '003 - Saida Southern Center', lastEod: '2026-09-04 21:30', status: 'Closed', cashier: 'Hussein Daik' },
    { branch: '004 - Zahle Bekaa Branch', lastEod: '2026-09-04 20:50', status: 'Closed', cashier: 'Rami Kassem' },
    { branch: '005 - Tripoli North Depot', lastEod: '2026-09-04 21:10', status: 'Closed', cashier: 'Ahmad Taha' },
    { branch: '006 - Nabatieh Center', lastEod: '2026-09-04 22:00', status: 'Closed', cashier: 'Ali Wehbe' },
  ];

  // Highlights Dataset
  const highlights = [
    { id: 1, label: 'Cost of Goods', value: '$168,400.00', trend: 'down', sub: 'Margin: 57.8% ┃ Target: 55%', formula: 'Cost / Realized Net Revenue', color: '#1976d2' },
    { id: 2, label: 'Total Receipts', value: '$382,100.00', trend: 'up', sub: '95.8% Collection ┃ MTD', formula: 'Total Cash + Inflows Received', color: '#2e7d32' },
    { id: 3, label: 'Void / Refund Ratio', value: '0.51%', trend: 'down', sub: 'Voids: $1.2k ┃ Refunds: $850', formula: '(Voids + Refunds) / Gross Sales', color: '#f59e0b' },
    { id: 4, label: 'Average Ticket', value: '$85.40', trend: 'up', sub: 'LY: $76.20 (+12.1%)', formula: 'Net Sales / Total Checks', color: '#0f766e' },
    { id: 5, label: 'Customer Count', value: '1,620', trend: 'up', sub: 'New: 142 ┃ Repeat: 1,478', formula: 'Unique Billed Clients This Month', color: '#7c3aed' },
    { id: 6, label: 'Wholesale / Retail', value: '72% / 28%', trend: 'up', sub: 'Bulk Tins: 64% ┃ Bottled: 36%', formula: 'Wholesale Volume vs Retail Bottling', color: '#64748b' },
  ];

  // Monthly Revenue Matrix (12 months per branch)
  const monthlyRevenueData = [
    {
      branch: '001 - Choueifat Main Facility',
      months: [
        { cur: 84200, ly: 74500, diff: '+13.0%' },
        { cur: 78900, ly: 71200, diff: '+10.8%' },
        { cur: 92400, ly: 81000, diff: '+14.1%' },
        { cur: 88100, ly: 79500, diff: '+10.8%' },
        { cur: 96500, ly: 85200, diff: '+13.3%' },
        { cur: 104200, ly: 92100, diff: '+13.1%' },
        { cur: 112400, ly: 99800, diff: '+12.6%' },
        { cur: 118900, ly: 105200, diff: '+13.0%' },
        { cur: 124500, ly: 109800, diff: '+13.4%' },
        { cur: 0, ly: 98400, diff: '-' },
        { cur: 0, ly: 102100, diff: '-' },
        { cur: 0, ly: 115000, diff: '-' },
      ],
      total: { cur: 900100, ly: 798300, diff: '+12.8%' }
    },
    {
      branch: '002 - Beirut Wholesale Hub',
      months: [
        { cur: 54100, ly: 48200, diff: '+12.2%' },
        { cur: 52000, ly: 46800, diff: '+11.1%' },
        { cur: 58900, ly: 51200, diff: '+15.0%' },
        { cur: 56400, ly: 50100, diff: '+12.6%' },
        { cur: 61200, ly: 54000, diff: '+13.3%' },
        { cur: 67800, ly: 60200, diff: '+12.6%' },
        { cur: 72100, ly: 64100, diff: '+12.5%' },
        { cur: 75400, ly: 67300, diff: '+12.0%' },
        { cur: 79200, ly: 69900, diff: '+13.3%' },
        { cur: 0, ly: 62400, diff: '-' },
        { cur: 0, ly: 65100, diff: '-' },
        { cur: 0, ly: 74200, diff: '-' },
      ],
      total: { cur: 577100, ly: 511800, diff: '+12.8%' }
    },
    {
      branch: '003 - Saida Southern Center',
      months: [
        { cur: 41200, ly: 37100, diff: '+11.1%' },
        { cur: 39500, ly: 35800, diff: '+10.3%' },
        { cur: 44800, ly: 39200, diff: '+14.3%' },
        { cur: 43100, ly: 38400, diff: '+12.2%' },
        { cur: 47200, ly: 41800, diff: '+12.9%' },
        { cur: 51900, ly: 46100, diff: '+12.6%' },
        { cur: 55400, ly: 49200, diff: '+12.6%' },
        { cur: 58200, ly: 51800, diff: '+12.4%' },
        { cur: 61400, ly: 54100, diff: '+13.5%' },
        { cur: 0, ly: 48900, diff: '-' },
        { cur: 0, ly: 50800, diff: '-' },
        { cur: 0, ly: 58100, diff: '-' },
      ],
      total: { cur: 442700, ly: 393500, diff: '+12.5%' }
    },
    {
      branch: '004 - Zahle Bekaa Branch',
      months: [
        { cur: 31200, ly: 28100, diff: '+11.0%' },
        { cur: 29800, ly: 27000, diff: '+10.4%' },
        { cur: 34100, ly: 30100, diff: '+13.3%' },
        { cur: 32900, ly: 29400, diff: '+11.9%' },
        { cur: 36200, ly: 32000, diff: '+13.1%' },
        { cur: 39800, ly: 35100, diff: '+13.4%' },
        { cur: 42400, ly: 37600, diff: '+12.8%' },
        { cur: 44800, ly: 39800, diff: '+12.6%' },
        { cur: 47200, ly: 41500, diff: '+13.7%' },
        { cur: 0, ly: 37800, diff: '-' },
        { cur: 0, ly: 39200, diff: '-' },
        { cur: 0, ly: 45100, diff: '-' },
      ],
      total: { cur: 338400, ly: 300600, diff: '+12.6%' }
    },
    {
      branch: '005 - Tripoli North Depot',
      months: [
        { cur: 33500, ly: 30100, diff: '+11.3%' },
        { cur: 32100, ly: 29000, diff: '+10.7%' },
        { cur: 36800, ly: 32400, diff: '+13.6%' },
        { cur: 35200, ly: 31500, diff: '+11.7%' },
        { cur: 38900, ly: 34500, diff: '+12.8%' },
        { cur: 42700, ly: 37900, diff: '+12.7%' },
        { cur: 45600, ly: 40500, diff: '+12.6%' },
        { cur: 48100, ly: 42800, diff: '+12.4%' },
        { cur: 50850, ly: 44700, diff: '+13.8%' },
        { cur: 0, ly: 40900, diff: '-' },
        { cur: 0, ly: 42500, diff: '-' },
        { cur: 0, ly: 48900, diff: '-' },
      ],
      total: { cur: 363750, ly: 323400, diff: '+12.5%' }
    },
    {
      branch: '006 - Nabatieh Center',
      months: [
        { cur: 23100, ly: 20800, diff: '+11.1%' },
        { cur: 22000, ly: 19900, diff: '+10.6%' },
        { cur: 25400, ly: 22400, diff: '+13.4%' },
        { cur: 24300, ly: 21800, diff: '+11.5%' },
        { cur: 26900, ly: 23900, diff: '+12.6%' },
        { cur: 29600, ly: 26300, diff: '+12.5%' },
        { cur: 31600, ly: 28100, diff: '+12.5%' },
        { cur: 33400, ly: 29700, diff: '+12.5%' },
        { cur: 35500, ly: 31200, diff: '+13.8%' },
        { cur: 0, ly: 28400, diff: '-' },
        { cur: 0, ly: 29500, diff: '-' },
        { cur: 0, ly: 33900, diff: '-' },
      ],
      total: { cur: 251800, ly: 224100, diff: '+12.4%' }
    }
  ];

  // Category Breakdown
  const categoryData = [
    { name: 'Extra Virgin Olive Oil (EVOO)', amount: 224800, pct: '56.4%' },
    { name: 'Virgin Olive Oil', amount: 78500, pct: '19.7%' },
    { name: 'Table Olives & Pickles', amount: 42300, pct: '10.6%' },
    { name: 'Pomegranate Molasses & Vinegar', amount: 31200, pct: '7.8%' },
    { name: 'Olive Pomace Oil & Industrial', amount: 15400, pct: '3.9%' },
    { name: 'Empty Tins, Bottles & Packaging', amount: 6450, pct: '1.6%' },
  ];
  const totalCategoryAmount = 398650;

  // Department / Division
  const departmentData = [
    { name: 'Wholesale Commercial Bulk', amount: 245000, pct: '61.5%' },
    { name: 'Supermarkets & Retail Packaging', amount: 89400, pct: '22.4%' },
    { name: 'Export & International Distribution', amount: 43250, pct: '10.8%' },
    { name: 'Direct Plant & Factory Gate Outlet', amount: 21000, pct: '5.3%' },
  ];

  // Discounts
  const discountData = [
    { name: 'Wholesale Volume Rebate (Tier 1)', amount: 6800, pct: '47.9%' },
    { name: 'Seasonal Harvesting Promotion', amount: 3450, pct: '24.3%' },
    { name: 'Payment Terms & Early Settlement (2%)', amount: 2150, pct: '15.1%' },
    { name: 'Customer Loyalty & Annual Agreement', amount: 1200, pct: '8.5%' },
    { name: 'Damaged Packaging Allowance', amount: 600, pct: '4.2%' },
  ];
  const totalDiscount = 14200;

  // Voids
  const voidData = [
    { name: 'Barcode Scan Mismatch / Incorrect SKU', amount: 480, pct: '40.0%' },
    { name: 'Customer Changed Mind on Quantity', amount: 350, pct: '29.2%' },
    { name: 'Credit Limit Verification Hold', amount: 220, pct: '18.3%' },
    { name: 'Terminal Re-entry / Network Timeout', amount: 150, pct: '12.5%' },
  ];
  const totalVoids = 1200;

  // Payments
  const paymentData = [
    { name: 'Cash USD ($)', amount: 184500, pct: '48.3%' },
    { name: 'Cash LBP (Market 89,500)', amount: 96400, pct: '25.2%' },
    { name: 'Customer Credit Ledger (Net 30)', amount: 64200, pct: '16.8%' },
    { name: 'Whish Money Transfer', amount: 18500, pct: '4.8%' },
    { name: 'Bank Cards (Visa / MC)', amount: 11500, pct: '3.0%' },
    { name: 'Cheques Under Collection', amount: 7000, pct: '1.8%' },
  ];
  const totalPayments = 382100;

  // Users
  const userData = [
    { name: 'Mahdi Jichi (Executive Manager)', amount: 142500, pct: '35.7%' },
    { name: 'Hiba Aloulou (Senior Accountant)', amount: 98400, pct: '24.7%' },
    { name: 'Hussein Daik (Sales Lead - South)', amount: 68900, pct: '17.3%' },
    { name: 'Ahmad Taha (Wholesale Representative)', amount: 51200, pct: '12.8%' },
    { name: 'Rami Kassem (Bekaa Area Officer)', amount: 37650, pct: '9.5%' },
  ];

  // Daily Summary (Comparative Tab)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className={`omega-page-wrapper ${theme === 'dark' ? 'cms-theme-dark' : 'cms-theme-light'}`}>
      <style jsx global>{`
        .omega-page-wrapper {
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          transition: background-color 0.2s;
        }
        .cms-theme-dark {
          background-color: #0f172a;
          color: #e5e7eb;
        }
        .cms-theme-light {
          background-color: #f4f6f9;
          color: #1e293b;
        }

        /* Authentic Omega Branch Dashboard Shell */
        .branch-dashboard-shell {
          --bd-bg: #111827;
          --bd-surface: #1f2937;
          --bd-surface-soft: #111827;
          --bd-surface-muted: #374151;
          --bd-card: #18212f;
          --bd-card-soft: #243244;
          --bd-border: rgba(148, 163, 184, 0.22);
          --bd-text: #f8fafc;
          --bd-text-muted: #cbd5e1;
          --bd-accent: #f8fafc;
          --bd-shadow: 0 18px 42px rgba(2, 6, 23, 0.28);
          --bd-tab: rgba(255, 255, 255, 0.06);
          --bd-tab-active-bg: #f8fafc;
          --bd-tab-active-text: #111827;
          --bd-input-bg: #0f172a;
          --bd-input-text: #f8fafc;
          --bd-input-border: rgba(148, 163, 184, 0.35);
          background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
          color: var(--bd-text);
          border-radius: 12px;
          padding: 18px;
          box-shadow: var(--bd-shadow);
          border: 1px solid var(--bd-border);
        }

        .cms-theme-light .branch-dashboard-shell {
          --bd-bg: #edf3f9;
          --bd-surface: #ffffff;
          --bd-surface-soft: #f3f7fc;
          --bd-surface-muted: #dbe4f0;
          --bd-card: #e7eef8;
          --bd-card-soft: #f8fbff;
          --bd-border: rgba(15, 23, 42, 0.14);
          --bd-text: #0f172a;
          --bd-text-muted: #334155;
          --bd-accent: #0f172a;
          --bd-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
          --bd-tab: #e8eef6;
          --bd-tab-active-bg: #0f172a;
          --bd-tab-active-text: #ffffff;
          --bd-input-bg: #ffffff;
          --bd-input-text: #0f172a;
          --bd-input-border: rgba(100, 116, 139, 0.3);
          background: linear-gradient(180deg, #fcfdff 0%, #eef4fb 100%);
        }

        /* Topbar Controls */
        .dashboard-topbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }
        .page-title-omega {
          font-size: 22px;
          font-weight: 700;
          margin: 0;
          color: var(--bd-text);
          letter-spacing: -0.3px;
        }
        .tenant-subtitle {
          font-size: 11px;
          color: var(--bd-text-muted);
          font-weight: 500;
        }
        .topbar-select {
          background-color: var(--bd-input-bg);
          color: var(--bd-input-text);
          border: 1px solid var(--bd-input-border);
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 13px;
          outline: none;
          min-height: 36px;
        }
        .topbar-btn {
          height: 36px;
          padding: 0 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.15s;
          border: 1px solid var(--bd-border);
          background: var(--bd-surface-muted);
          color: var(--bd-text);
        }
        .topbar-btn:hover {
          background: var(--bd-card-soft);
        }
        .topbar-btn-dark {
          background: #1e293b;
          color: #ffffff;
          border-color: #334155;
        }
        .topbar-btn-dark:hover {
          background: #0f172a;
        }

        /* Omega 4 Metric Cards */
        .omega-metric-card {
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          height: 124px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .omega-card-icon-pane {
          width: 54px;
          flex-shrink: 0;
          background-color: rgba(0, 0, 0, 0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
        }
        .omega-card-content-pane {
          flex: 1;
          padding: 8px 12px;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-size: 12px;
        }
        .omega-metric-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          line-height: 1.25;
        }
        .omega-metric-row .title {
          font-size: 12px;
          opacity: 0.92;
          font-weight: 500;
        }
        .omega-metric-row .body {
          font-size: 12px;
          font-weight: 700;
        }
        .omega-metric-row .body.bold-value {
          font-size: 15px;
          font-weight: 900;
        }
        .omega-two-col-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          line-height: 1.25;
        }
        .omega-two-col-row .cell {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        .omega-two-col-row .cell .title {
          font-size: 11px;
          opacity: 0.9;
        }
        .omega-two-col-row .cell .body {
          font-size: 11.5px;
          font-weight: 700;
        }
        .omega-red-badge {
          color: #dc2626 !important;
          background-color: #f1e5dd !important;
          padding: 1px 4px;
          border-radius: 4px;
          font-weight: 800 !important;
          font-size: 11px !important;
        }

        /* Omega Tabs */
        .omega-nav-tabs {
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid var(--bd-border);
          padding-bottom: 10px;
          margin-bottom: 16px;
          overflow-x: auto;
        }
        .omega-nav-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 16px;
          border-radius: 999px;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--bd-text);
          background: var(--bd-surface);
          border: 1px solid var(--bd-border);
          cursor: pointer;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.15s;
        }
        .omega-nav-link:hover {
          background: var(--bd-card-soft);
        }
        .omega-nav-link.active {
          background: var(--bd-card-soft);
          border-color: #3b82f6;
          color: #60a5fa !important;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.2);
        }
        .omega-chart-mode-btn {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--bd-surface);
          border: 1px solid var(--bd-border);
          color: var(--bd-text);
          cursor: pointer;
        }
        .omega-chart-mode-btn.active {
          background: var(--bd-card-soft);
          border-color: #3b82f6;
          color: #60a5fa;
        }

        /* Omega Section Header Banner */
        .dashboard-branches-country {
          background-color: #3e3e3e !important;
          color: white !important;
          padding: 8px 14px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.5px;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .dashboard-branches-body {
          background: var(--bd-surface);
          border: 1px solid var(--bd-border);
          border-top: none;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
        }

        /* Performance Highlights Grid */
        .performance-highlights-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 10px;
        }
        @media (max-width: 1200px) {
          .performance-highlights-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 768px) {
          .performance-highlights-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        .performance-highlight-card {
          background: var(--bd-card);
          border: 1px solid var(--bd-border);
          border-radius: 6px;
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 74px;
        }
        .performance-highlight-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
          padding-bottom: 3px;
        }
        .performance-highlight-label {
          font-size: 12.5px;
          color: var(--bd-text-muted);
          font-weight: 500;
        }
        .performance-highlight-value {
          font-size: 14px;
          font-weight: 800;
          color: var(--bd-text);
          display: flex;
          align-items: center;
          gap: 4px;
          margin: 4px 0;
        }
        .performance-highlight-sub {
          font-size: 11px;
          color: var(--bd-text-muted);
        }

        /* Authentic Dense Table Styling */
        .omega-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12.5px;
        }
        .omega-table th, .omega-table td {
          padding: 6px 10px;
          border-bottom: 1px solid var(--bd-border);
          white-space: nowrap;
        }
        .omega-table thead tr {
          background-color: #242424;
          color: #ffffff;
        }
        .cms-theme-light .omega-table thead tr {
          background-color: #e2e8f0;
          color: #0f172a;
        }
        .omega-table tbody tr:nth-child(even) {
          background-color: rgba(148, 163, 184, 0.05);
        }
        .omega-table tbody tr:hover {
          background-color: rgba(148, 163, 184, 0.12);
        }
        .omega-table tr.table-total {
          background-color: #000000 !important;
          color: #ffffff !important;
          font-weight: 700;
        }
        .cms-theme-light .omega-table tr.table-total {
          background-color: #334155 !important;
          color: #ffffff !important;
        }
        .sticky-col {
          position: sticky;
          left: 0;
          z-index: 5;
          background: inherit;
        }
      `}</style>

      <div className="max-w-[1700px] mx-auto p-3 sm:p-4">
        {/* Main Branch Dashboard Shell */}
        <div className="branch-dashboard-shell">

          {/* Top Control Toolbar */}
          <div className="dashboard-topbar">
            <div>
              <h1 className="page-title-omega">Sales Dashboard</h1>
              <div className="tenant-subtitle">Southern Olive Oil Products S.A.R.L • Executive Sales Control</div>
            </div>

            <div className="flex-1"></div>

            {/* Branch Selector */}
            <div>
              <select 
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="topbar-select"
                title="Branch"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Currency Selector */}
            <div>
              <select 
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as 'USD' | 'LBP')}
                className="topbar-select"
                title="Currency"
              >
                <option value="USD">USD ($)</option>
                <option value="LBP">LBP (ل.ل 89,500)</option>
              </select>
            </div>

            {/* Year Selector */}
            <div>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="topbar-select"
                title="Year"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>

            {/* Month Selector */}
            <div>
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="topbar-select"
                title="Month"
              >
                {months.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Day Selector */}
            <div>
              <select 
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="topbar-select"
                title="Day"
              >
                <option value="0">All Days</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d.toString()}>{d}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => window.print()}
                className="topbar-btn topbar-btn-dark"
                title="Export PDF"
              >
                Export PDF
              </button>

              <button 
                type="button"
                onClick={() => setEodModalOpen(true)}
                className="topbar-btn"
                title="Branches Last EOD Date"
              >
                <Clock className="w-4 h-4 text-amber-400" />
              </button>

              <button 
                type="button"
                onClick={handleRecalculate}
                className="topbar-btn"
                title="Recalculate Data"
              >
                <RefreshCw className={`w-4 h-4 text-emerald-400 ${recalculating ? 'animate-spin' : ''}`} />
              </button>

              <Link 
                href="/backoffice/reportview"
                className="topbar-btn"
                title="Reports Center"
              >
                <BarChart3 className="w-4 h-4 text-blue-400" />
              </Link>

              <button 
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="topbar-btn"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              </button>
            </div>
          </div>

          {/* THE 4 ICONIC OMEGA METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
            
            {/* Card 1: Sales - Green (#337718) */}
            <div className="omega-metric-card" style={{ backgroundColor: '#337718' }}>
              <div className="omega-card-icon-pane">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="omega-card-content-pane">
                <div className="omega-metric-row">
                  <div className="title">Today&apos;s Net Sales</div>
                  <div className="body bold-value">{formatAmount(18450)}</div>
                </div>
                <div className="omega-metric-row">
                  <div className="title">Today&apos;s Receipts</div>
                  <div className="body">{formatAmount(19200)}</div>
                </div>
                <div className="omega-metric-row">
                  <div className="title">Today&apos;s Discounts</div>
                  <div className="body">{formatAmount(750)}</div>
                </div>
                <div className="omega-metric-row">
                  <div className="title">Today&apos;s Refunds</div>
                  <div className="body">{formatAmount(0)}</div>
                </div>
              </div>
            </div>

            {/* Card 2: Performance - Navy (#003566) */}
            <div className="omega-metric-card" style={{ backgroundColor: '#003566' }}>
              <div className="omega-card-icon-pane">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="omega-card-content-pane">
                <div className="omega-metric-row">
                  <div className="title">Gross Sales</div>
                  <div className="body">{formatAmount(412850)}</div>
                </div>
                <div className="omega-metric-row">
                  <div className="title">Discount</div>
                  <div className="body">{formatAmount(14200)}</div>
                </div>
                <div className="omega-metric-row">
                  <div className="title">Tax (VAT 11%)</div>
                  <div className="body">{formatAmount(43851.50)}</div>
                </div>
                <div className="omega-metric-row">
                  <div className="title">Net Sales</div>
                  <div className="body bold-value">{formatAmount(398650)}</div>
                </div>
              </div>
            </div>

            {/* Card 3: Period - Gold/Brown (#8a6a1f) */}
            <div className="omega-metric-card" style={{ backgroundColor: '#8a6a1f' }}>
              <div className="omega-card-icon-pane">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="omega-card-content-pane">
                <div className="omega-two-col-row">
                  <div className="cell">
                    <span className="title">MTD:</span>
                    <span className="body">{formatAmount(398650)}</span>
                  </div>
                  <div className="cell">
                    <span className="title">LYM:</span>
                    <span className="body">{formatAmount(352400)}</span>
                  </div>
                </div>
                <div className="omega-two-col-row">
                  <div className="cell">
                    <span className="title">YTD:</span>
                    <span className="body">{formatAmount(3145200)}</span>
                  </div>
                  <div className="cell">
                    <span className="title">LYTM:</span>
                    <span className="body">{formatAmount(2810500)}</span>
                  </div>
                </div>
                <div className="omega-metric-row">
                  <div className="title">Customer Aged</div>
                  <div className="body">{formatAmount(84200)}</div>
                </div>
                <div className="omega-metric-row">
                  <div className="title">MTD Receipts</div>
                  <div className="body bold-value">{formatAmount(382100)}</div>
                </div>
              </div>
            </div>

            {/* Card 4: Operations - Brick Red (#852b12) */}
            <div className="omega-metric-card" style={{ backgroundColor: '#852b12' }}>
              <div className="omega-card-icon-pane">
                <Ticket className="w-6 h-6" />
              </div>
              <div className="omega-card-content-pane">
                <div className="omega-two-col-row">
                  <div className="cell">
                    <span className="title">Paid in:</span>
                    <span className="body">{formatAmount(4500)}</span>
                  </div>
                  <div className="cell">
                    <span className="title">Paid out:</span>
                    <span className="body">{formatAmount(2850)}</span>
                  </div>
                </div>
                <div className="omega-two-col-row">
                  <div className="cell">
                    <span className="title">Voids:</span>
                    <span className="body omega-red-badge">-{formatAmount(1200)}</span>
                  </div>
                  <div className="cell">
                    <span className="title">Refunds:</span>
                    <span className="body omega-red-badge">-{formatAmount(850)}</span>
                  </div>
                </div>
                <div className="omega-two-col-row">
                  <div className="cell">
                    <span className="title">Avg Inv:</span>
                    <span className="body">{formatAmount(85.40)}</span>
                  </div>
                  <div className="cell">
                    <span className="title">Avg Cust:</span>
                    <span className="body">{formatAmount(245.80)}</span>
                  </div>
                </div>
                <div className="omega-two-col-row">
                  <div className="cell">
                    <span className="title">Cust Count:</span>
                    <span className="body">1,620</span>
                  </div>
                  <div className="cell">
                    <span className="title">Inv Count:</span>
                    <span className="body">4,668</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* REAL OMEGA NAVIGATION TABS */}
          <div className="omega-nav-tabs">
            <button 
              type="button" 
              onClick={() => setActiveTab('summary')}
              className={`omega-nav-link ${activeTab === 'summary' ? 'active' : ''}`}
            >
              <Scale className="w-4 h-4" /> Summary
            </button>

            <button 
              type="button" 
              onClick={() => setActiveTab('comparative')}
              className={`omega-nav-link ${activeTab === 'comparative' ? 'active' : ''}`}
            >
              <TrendingUp className="w-4 h-4" /> Comparative
            </button>

            <Link 
              href="/product-insights" 
              target="_blank"
              className="omega-nav-link"
            >
              <Boxes className="w-4 h-4" /> Product Insights
            </Link>

            <Link 
              href="/backoffice/customers" 
              target="_blank"
              className="omega-nav-link"
            >
              <UserCircle2 className="w-4 h-4" /> Customer Insights
            </Link>

            <Link 
              href="/backoffice/operations" 
              target="_blank"
              className="omega-nav-link"
            >
              <Truck className="w-4 h-4" /> VTrack
            </Link>

            <button 
              type="button" 
              onClick={() => setActiveTab('customers')}
              className={`omega-nav-link ${activeTab === 'customers' ? 'active' : ''}`}
            >
              <Users className="w-4 h-4" /> Customers
            </button>

            <button 
              type="button" 
              onClick={() => setActiveTab('today')}
              className={`omega-nav-link ${activeTab === 'today' ? 'active' : ''}`}
            >
              <Calendar className="w-4 h-4" /> Today
            </button>

            <button 
              type="button" 
              onClick={() => setActiveTab('geographics')}
              className={`omega-nav-link ${activeTab === 'geographics' ? 'active' : ''}`}
            >
              <Globe className="w-4 h-4" /> Geographics
            </button>

            <div className="flex-1"></div>

            {/* Chart Mode Toggles */}
            <div className="flex items-center gap-1">
              <button 
                type="button"
                onClick={() => setChartType('line')}
                className={`omega-chart-mode-btn ${chartType === 'line' ? 'active' : ''}`}
                title="Line Chart Mode"
              >
                <LineChartIcon className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => setChartType('pie')}
                className={`omega-chart-mode-btn ${chartType === 'pie' ? 'active' : ''}`}
                title="Pie Chart Mode"
              >
                <PieChartIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TAB CONTENT: SUMMARY */}
          {activeTab === 'summary' && (
            <div>
              {/* Performance Highlights Banner & Cards */}
              <div className="mb-4">
                <div className="dashboard-branches-country">
                  <span>Performance Highlights</span>
                  <span className="text-xs font-normal opacity-80">Live Synchronized Metrics</span>
                </div>
                <div className="dashboard-branches-body">
                  <div className="performance-highlights-grid">
                    {highlights.map(h => (
                      <div key={h.id} className="performance-highlight-card" style={{ borderTop: `3px solid ${h.color}` }}>
                        <div className="performance-highlight-top">
                          <span className="performance-highlight-label">{h.label}</span>
                          <span title={h.formula} className="cursor-help"><Info className="w-3.5 h-3.5 text-slate-400" /></span>
                        </div>
                        <div className="performance-highlight-value">
                          <span>{h.value}</span>
                          {h.trend === 'up' && (
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">
                              ▲
                            </span>
                          )}
                          {h.trend === 'down' && (
                            <span className="w-3.5 h-3.5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px]">
                              ▼
                            </span>
                          )}
                        </div>
                        <div className="performance-highlight-sub">{h.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Monthly Revenue Matrix */}
              <div className="mb-4">
                <div className="dashboard-branches-country">
                  <span>Monthly Revenue</span>
                  <div className="flex items-center gap-3">
                    <span className="cursor-pointer text-lg font-bold">⋮</span>
                    <Maximize2 className="w-4 h-4 cursor-pointer" onClick={() => setEnlargedSection(enlargedSection === 'revenue' ? null : 'revenue')} />
                  </div>
                </div>
                <div className="dashboard-branches-body">
                  <div className="overflow-x-auto">
                    <table className="omega-table">
                      <thead>
                        <tr className="table-total">
                          <th className="sticky-col">Branch</th>
                          <th>Jan</th>
                          <th>Feb</th>
                          <th>Mar</th>
                          <th>Apr</th>
                          <th>May</th>
                          <th>Jun</th>
                          <th>Jul</th>
                          <th>Aug</th>
                          <th>Sep</th>
                          <th>Oct</th>
                          <th>Nov</th>
                          <th>Dec</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyRevenueData
                          .filter(b => selectedBranch === '0' || b.branch.startsWith(branches.find(x => x.id === selectedBranch)?.code || ''))
                          .map((row, idx) => (
                          <tr key={idx}>
                            <th className="sticky-col text-left font-semibold">{row.branch}</th>
                            {row.months.map((m, mIdx) => (
                              <td key={mIdx} className="text-right">
                                {m.cur > 0 ? (
                                  <div>
                                    <div className="font-bold flex items-center justify-end gap-1">
                                      {formatAmount(m.cur)}
                                      <span className="text-emerald-500 text-[10px]">▲</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      LY {formatAmount(m.ly)} ({m.diff})
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-500">-</span>
                                )}
                              </td>
                            ))}
                            <td className="text-right font-bold" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                              <div className="text-emerald-400">{formatAmount(row.total.cur)}</div>
                              <div className="text-[10px] text-slate-400">LY {formatAmount(row.total.ly)} ({row.total.diff})</div>
                            </td>
                          </tr>
                        ))}
                        <tr className="table-total">
                          <th className="sticky-col text-left font-extrabold">Grand Total</th>
                          <td>$267,300</td>
                          <td>$254,300</td>
                          <td>$292,600</td>
                          <td>$280,000</td>
                          <td>$306,900</td>
                          <td>$336,000</td>
                          <td>$361,500</td>
                          <td>$380,800</td>
                          <td>$398,650</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td className="text-right text-emerald-400 font-black">$2,878,050</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 2-Column Grid: Sales by Category & Sales by Department */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                
                {/* Sales by Category */}
                <div>
                  <div className="dashboard-branches-country">
                    <span>Sales By Category</span>
                    <span className="cursor-pointer text-lg font-bold">⋮</span>
                  </div>
                  <div className="dashboard-branches-body">
                    <table className="omega-table">
                      <thead>
                        <tr className="table-total">
                          <th className="text-left">All Categories</th>
                          <th className="text-right">{formatAmount(totalCategoryAmount)}</th>
                          <th className="text-right">100%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryData.map((cat, idx) => (
                          <tr key={idx}>
                            <td className="text-left font-medium">{cat.name}</td>
                            <td className="text-right font-bold">{formatAmount(cat.amount)}</td>
                            <td className="text-right text-slate-400">{cat.pct}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sales by Department / Division */}
                <div>
                  <div className="dashboard-branches-country">
                    <span>Sales By Department</span>
                    <span className="cursor-pointer text-lg font-bold">⋮</span>
                  </div>
                  <div className="dashboard-branches-body">
                    <table className="omega-table">
                      <thead>
                        <tr className="table-total">
                          <th className="text-left">All Departments</th>
                          <th className="text-right">{formatAmount(398650)}</th>
                          <th className="text-right">100%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departmentData.map((dept, idx) => (
                          <tr key={idx}>
                            <td className="text-left font-medium">{dept.name}</td>
                            <td className="text-right font-bold">{formatAmount(dept.amount)}</td>
                            <td className="text-right text-slate-400">{dept.pct}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* 2-Column Grid: Discount Summary & Void Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                
                {/* Discount Summary */}
                <div>
                  <div className="dashboard-branches-country">
                    <span>Discount Summary</span>
                    <span className="cursor-pointer text-lg font-bold">⋮</span>
                  </div>
                  <div className="dashboard-branches-body">
                    <table className="omega-table">
                      <thead>
                        <tr className="table-total">
                          <th className="text-left">All Discounts</th>
                          <th className="text-right">{formatAmount(totalDiscount)}</th>
                          <th className="text-right">100%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {discountData.map((disc, idx) => (
                          <tr key={idx}>
                            <td className="text-left font-medium">{disc.name}</td>
                            <td className="text-right font-bold text-amber-400">-{formatAmount(disc.amount)}</td>
                            <td className="text-right text-slate-400">{disc.pct}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Void Summary */}
                <div>
                  <div className="dashboard-branches-country">
                    <span>Void Summary</span>
                    <span className="cursor-pointer text-lg font-bold">⋮</span>
                  </div>
                  <div className="dashboard-branches-body">
                    <table className="omega-table">
                      <thead>
                        <tr className="table-total">
                          <th className="text-left">All Voids</th>
                          <th className="text-right">{formatAmount(totalVoids)}</th>
                          <th className="text-right">100%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {voidData.map((vd, idx) => (
                          <tr key={idx}>
                            <td className="text-left font-medium">{vd.name}</td>
                            <td className="text-right font-bold text-rose-400">-{formatAmount(vd.amount)}</td>
                            <td className="text-right text-slate-400">{vd.pct}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* 2-Column Grid: Payment Summary & User Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                
                {/* Payment Summary */}
                <div>
                  <div className="dashboard-branches-country">
                    <span>Payment Summary</span>
                    <span className="cursor-pointer text-lg font-bold">⋮</span>
                  </div>
                  <div className="dashboard-branches-body">
                    <table className="omega-table">
                      <thead>
                        <tr className="table-total">
                          <th className="text-left">All Payments</th>
                          <th className="text-right">{formatAmount(totalPayments)}</th>
                          <th className="text-right">100%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentData.map((p, idx) => (
                          <tr key={idx}>
                            <td className="text-left font-medium">{p.name}</td>
                            <td className="text-right font-bold">{formatAmount(p.amount)}</td>
                            <td className="text-right text-slate-400">{p.pct}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* User Summary */}
                <div>
                  <div className="dashboard-branches-country">
                    <span>User Summary</span>
                    <span className="cursor-pointer text-lg font-bold">⋮</span>
                  </div>
                  <div className="dashboard-branches-body">
                    <table className="omega-table">
                      <thead>
                        <tr className="table-total">
                          <th className="text-left">All Users</th>
                          <th className="text-right">{formatAmount(398650)}</th>
                          <th className="text-right">100%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userData.map((u, idx) => (
                          <tr key={idx}>
                            <td className="text-left font-medium">{u.name}</td>
                            <td className="text-right font-bold">{formatAmount(u.amount)}</td>
                            <td className="text-right text-slate-400">{u.pct}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Full Width Table: Sales By Employee By Category */}
              <div>
                <div className="dashboard-branches-country">
                  <span>Sales By Employee By Category</span>
                  <span className="cursor-pointer text-lg font-bold">⋮</span>
                </div>
                <div className="dashboard-branches-body">
                  <div className="overflow-x-auto">
                    <table className="omega-table">
                      <thead>
                        <tr className="table-total">
                          <th className="sticky-col text-left">User Name</th>
                          <th className="text-right">EVOO</th>
                          <th className="text-right">Virgin</th>
                          <th className="text-right">Table Olives</th>
                          <th className="text-right">Molasses</th>
                          <th className="text-right">Pomace</th>
                          <th className="text-right">Packaging</th>
                          <th className="text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="sticky-col text-left font-bold">Mahdi Jichi</td>
                          <td className="text-right">{formatAmount(85000)}</td>
                          <td className="text-right">{formatAmount(24000)}</td>
                          <td className="text-right">{formatAmount(14000)}</td>
                          <td className="text-right">{formatAmount(11000)}</td>
                          <td className="text-right">{formatAmount(6000)}</td>
                          <td className="text-right">{formatAmount(2500)}</td>
                          <td className="text-right font-extrabold text-emerald-400">{formatAmount(142500)}</td>
                        </tr>
                        <tr>
                          <td className="sticky-col text-left font-bold">Hiba Aloulou</td>
                          <td className="text-right">{formatAmount(58000)}</td>
                          <td className="text-right">{formatAmount(18000)}</td>
                          <td className="text-right">{formatAmount(10500)}</td>
                          <td className="text-right">{formatAmount(7200)}</td>
                          <td className="text-right">{formatAmount(3500)}</td>
                          <td className="text-right">{formatAmount(1200)}</td>
                          <td className="text-right font-extrabold text-emerald-400">{formatAmount(98400)}</td>
                        </tr>
                        <tr>
                          <td className="sticky-col text-left font-bold">Hussein Daik</td>
                          <td className="text-right">{formatAmount(39000)}</td>
                          <td className="text-right">{formatAmount(14200)}</td>
                          <td className="text-right">{formatAmount(7400)}</td>
                          <td className="text-right">{formatAmount(5100)}</td>
                          <td className="text-right">{formatAmount(2200)}</td>
                          <td className="text-right">{formatAmount(1000)}</td>
                          <td className="text-right font-extrabold text-emerald-400">{formatAmount(68900)}</td>
                        </tr>
                        <tr>
                          <td className="sticky-col text-left font-bold">Ahmad Taha</td>
                          <td className="text-right">{formatAmount(26500)}</td>
                          <td className="text-right">{formatAmount(12100)}</td>
                          <td className="text-right">{formatAmount(5800)}</td>
                          <td className="text-right">{formatAmount(4200)}</td>
                          <td className="text-right">{formatAmount(2000)}</td>
                          <td className="text-right">{formatAmount(600)}</td>
                          <td className="text-right font-extrabold text-emerald-400">{formatAmount(51200)}</td>
                        </tr>
                        <tr>
                          <td className="sticky-col text-left font-bold">Rami Kassem</td>
                          <td className="text-right">{formatAmount(16300)}</td>
                          <td className="text-right">{formatAmount(10200)}</td>
                          <td className="text-right">{formatAmount(4600)}</td>
                          <td className="text-right">{formatAmount(3700)}</td>
                          <td className="text-right">{formatAmount(1700)}</td>
                          <td className="text-right">{formatAmount(1150)}</td>
                          <td className="text-right font-extrabold text-emerald-400">{formatAmount(37650)}</td>
                        </tr>
                        <tr className="table-total">
                          <th className="sticky-col text-left font-black">Total</th>
                          <td className="text-right">{formatAmount(224800)}</td>
                          <td className="text-right">{formatAmount(78500)}</td>
                          <td className="text-right">{formatAmount(42300)}</td>
                          <td className="text-right">{formatAmount(31200)}</td>
                          <td className="text-right">{formatAmount(15400)}</td>
                          <td className="text-right">{formatAmount(6450)}</td>
                          <td className="text-right text-emerald-400 font-black">{formatAmount(398650)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: COMPARATIVE */}
          {activeTab === 'comparative' && (
            <div>
              {/* Daily Summary */}
              <div className="mb-4">
                <div className="dashboard-branches-country">
                  <span>Daily Summary (September 2026)</span>
                  <span className="text-xs font-normal">Day 1 to 30</span>
                </div>
                <div className="dashboard-branches-body">
                  <div className="overflow-x-auto">
                    <table className="omega-table">
                      <thead>
                        <tr className="table-total">
                          <th className="sticky-col text-left">Branch</th>
                          {daysInMonth.map(d => (
                            <th key={d} className="text-center">{d}</th>
                          ))}
                          <th className="text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {branches.filter(b => b.id !== '0').map((branch, bIdx) => (
                          <tr key={bIdx}>
                            <td className="sticky-col text-left font-semibold">{branch.name}</td>
                            {daysInMonth.map(d => {
                              const pseudoVal = Math.round((2800 + (bIdx * 800) + (d * 120)) * 0.9);
                              return (
                                <td key={d} className="text-center text-xs">
                                  {d <= 5 ? formatAmount(pseudoVal) : '-'}
                                </td>
                              );
                            })}
                            <td className="text-right font-bold text-emerald-400">
                              {formatAmount(64000 + (bIdx * 12000))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Monthly Sales By Category YoY Comparison */}
              <div className="mb-4">
                <div className="dashboard-branches-country">
                  <span>Monthly Sales By Category (Year-over-Year)</span>
                </div>
                <div className="dashboard-branches-body">
                  <table className="omega-table">
                    <thead>
                      <tr className="table-total">
                        <th className="text-left">Category</th>
                        <th className="text-right">Current Year (2026)</th>
                        <th className="text-right">Last Year (2025)</th>
                        <th className="text-right">Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryData.map((cat, idx) => {
                        const lyVal = Math.round(cat.amount / 1.13);
                        const diff = cat.amount - lyVal;
                        return (
                          <tr key={idx}>
                            <td className="text-left font-semibold">{cat.name}</td>
                            <td className="text-right font-bold">{formatAmount(cat.amount)}</td>
                            <td className="text-right text-slate-400">{formatAmount(lyVal)}</td>
                            <td className="text-right text-emerald-400 font-bold">+{formatAmount(diff)} (+13.0%)</td>
                          </tr>
                        );
                      })}
                      <tr className="table-total">
                        <th className="text-left">Total</th>
                        <td className="text-right">{formatAmount(398650)}</td>
                        <td className="text-right">{formatAmount(352400)}</td>
                        <td className="text-right text-emerald-400 font-black">+{formatAmount(46250)} (+13.1%)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div>
              <div className="dashboard-branches-country">
                <span>Top Customer Accounts</span>
                <span className="text-xs font-normal">Active Trade Partners</span>
              </div>
              <div className="dashboard-branches-body">
                <table className="omega-table">
                  <thead>
                    <tr className="table-total">
                      <th className="text-left">Customer Name</th>
                      <th className="text-left">Zone / City</th>
                      <th className="text-right">Invoices</th>
                      <th className="text-right">Sales Amount</th>
                      <th className="text-right">Balance Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-left font-bold">Spinneys Lebanon S.A.L</td>
                      <td className="text-left">Beirut & Mount Lebanon</td>
                      <td className="text-right">48</td>
                      <td className="text-right font-bold">{formatAmount(78400)}</td>
                      <td className="text-right text-emerald-400">{formatAmount(12000)}</td>
                    </tr>
                    <tr>
                      <td className="text-left font-bold">Carrefour / Majid Al Futtaim</td>
                      <td className="text-left">City Centre & Mall of Dhayeh</td>
                      <td className="text-right">36</td>
                      <td className="text-right font-bold">{formatAmount(64200)}</td>
                      <td className="text-right text-emerald-400">{formatAmount(8500)}</td>
                    </tr>
                    <tr>
                      <td className="text-left font-bold">Fahd Supermarket Wholesale</td>
                      <td className="text-left">Jounieh & Keserwan</td>
                      <td className="text-right">24</td>
                      <td className="text-right font-bold">{formatAmount(39100)}</td>
                      <td className="text-right text-emerald-400">{formatAmount(4200)}</td>
                    </tr>
                    <tr>
                      <td className="text-left font-bold">Al Makhazen Cooperative</td>
                      <td className="text-left">Beirut Wholesale</td>
                      <td className="text-right">28</td>
                      <td className="text-right font-bold">{formatAmount(32800)}</td>
                      <td className="text-right text-emerald-400">{formatAmount(6100)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB CONTENT: TODAY */}
          {activeTab === 'today' && (
            <div>
              <div className="dashboard-branches-country">
                <span>Today&apos;s Live Register Statistics</span>
                <span className="text-xs font-normal">Real-time Register Sync</span>
              </div>
              <div className="dashboard-branches-body">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-400">Total Transactions Today</div>
                    <div className="text-2xl font-black text-white mt-1">224 Invoices</div>
                    <div className="text-xs text-emerald-400 mt-1">▲ +8.2% vs yesterday</div>
                  </div>
                  <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-400">Average Check Today</div>
                    <div className="text-2xl font-black text-white mt-1">{formatAmount(82.36)}</div>
                    <div className="text-xs text-emerald-400 mt-1">▲ Premium EVOO sales</div>
                  </div>
                  <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-400">Active Open Cash Drawers</div>
                    <div className="text-2xl font-black text-emerald-400 mt-1">6 / 6 Terminals</div>
                    <div className="text-xs text-slate-400 mt-1">All branch registers synchronized</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: GEOGRAPHICS */}
          {activeTab === 'geographics' && (
            <div>
              <div className="dashboard-branches-country">
                <span>Geographical Revenue Distribution (Lebanon)</span>
                <span className="text-xs font-normal">By Administrative Region</span>
              </div>
              <div className="dashboard-branches-body">
                <table className="omega-table">
                  <thead>
                    <tr className="table-total">
                      <th className="text-left">Governorate / Region</th>
                      <th className="text-left">Primary Hub</th>
                      <th className="text-right">MTD Revenue</th>
                      <th className="text-right">Share %</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-left font-bold">Mount Lebanon</td>
                      <td className="text-left">Choueifat Industrial Plant</td>
                      <td className="text-right font-bold">{formatAmount(124500)}</td>
                      <td className="text-right">31.2%</td>
                    </tr>
                    <tr>
                      <td className="text-left font-bold">Beirut Central</td>
                      <td className="text-left">Beirut Wholesale Hub</td>
                      <td className="text-right font-bold">{formatAmount(79200)}</td>
                      <td className="text-right">19.9%</td>
                    </tr>
                    <tr>
                      <td className="text-left font-bold">South Lebanon</td>
                      <td className="text-left">Saida Southern Center</td>
                      <td className="text-right font-bold">{formatAmount(61400)}</td>
                      <td className="text-right">15.4%</td>
                    </tr>
                    <tr>
                      <td className="text-left font-bold">North Lebanon</td>
                      <td className="text-left">Tripoli North Depot</td>
                      <td className="text-right font-bold">{formatAmount(50850)}</td>
                      <td className="text-right">12.8%</td>
                    </tr>
                    <tr>
                      <td className="text-left font-bold">Bekaa Valley</td>
                      <td className="text-left">Zahle Bekaa Branch</td>
                      <td className="text-right font-bold">{formatAmount(47200)}</td>
                      <td className="text-right">11.8%</td>
                    </tr>
                    <tr>
                      <td className="text-left font-bold">Nabatieh</td>
                      <td className="text-left">Nabatieh Center</td>
                      <td className="text-right font-bold">{formatAmount(35500)}</td>
                      <td className="text-right">8.9%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* BRANCHES LAST EOD MODAL */}
      {eodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg">Branches Last EOD Date & Status</h3>
              </div>
              <button onClick={() => setEodModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-800 text-slate-300">
                    <th className="p-2.5">Branch</th>
                    <th className="p-2.5">Last EOD Date/Time</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Supervisor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {branchEodDates.map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50">
                      <td className="p-2.5 font-semibold text-slate-200">{b.branch}</td>
                      <td className="p-2.5 font-mono text-slate-300">{b.lastEod}</td>
                      <td className="p-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> {b.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-400">{b.cashier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setEodModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white border border-slate-700"
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
