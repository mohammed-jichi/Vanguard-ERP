'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

export default function MasterReportViewPage() {
  const [showCatalog, setShowCatalog] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  
  // Settings & Custom Category Modal States
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [customCategoryModalOpen, setCustomCategoryModalOpen] = useState(false);
  const [defaultDateSelection, setDefaultDateSelection] = useState('THIS_MONTH');
  const [settingsSearch, setSettingsSearch] = useState('');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategorySearch, setCustomCategorySearch] = useState('');
  const [customCategorySelectedReports, setCustomCategorySelectedReports] = useState<string[]>([]);
  
  // Multi-Level Toolbar Selection
  const [selectedToolbarCats, setSelectedToolbarCats] = useState<string[]>(['internal_control', 'financial', 'product_sales']);
  const [selectedToolbarSubCats, setSelectedToolbarSubCats] = useState<string[]>([]);
  const [selectedToolbarReports, setSelectedToolbarReports] = useState<string[]>([]);
  const [expandedSettingsCats, setExpandedSettingsCats] = useState<string[]>([]);

  const toggleSettingsCatExpand = (id: string) => {
    setExpandedSettingsCats((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    );
  };

  const toggleToolbarCatCheck = (id: string) => {
    if (selectedToolbarCats.includes(id)) {
      setSelectedToolbarCats(selectedToolbarCats.filter((k) => k !== id));
    } else {
      setSelectedToolbarCats([...selectedToolbarCats, id]);
    }
  };

  const toggleToolbarSubCatCheck = (id: string) => {
    if (selectedToolbarSubCats.includes(id)) {
      setSelectedToolbarSubCats(selectedToolbarSubCats.filter((k) => k !== id));
    } else {
      setSelectedToolbarSubCats([...selectedToolbarSubCats, id]);
    }
  };

  const toggleToolbarReportCheck = (code: string) => {
    if (selectedToolbarReports.includes(code)) {
      setSelectedToolbarReports(selectedToolbarReports.filter((c) => c !== code));
    } else {
      setSelectedToolbarReports([...selectedToolbarReports, code]);
    }
  };

  const toggleCustomCategoryReport = (code: string) => {
    if (customCategorySelectedReports.includes(code)) {
      setCustomCategorySelectedReports(customCategorySelectedReports.filter((c) => c !== code));
    } else {
      setCustomCategorySelectedReports([...customCategorySelectedReports, code]);
    }
  };

  // Multi-Select Branches Engine
  const branchesList = [
    { id: '001', code: 'BR_001', name: '001 - Choueifat Main Facility', region: 'Mount Lebanon' },
    { id: '002', code: 'BR_002', name: '002 - Beirut Distribution Hub', region: 'Beirut' },
    { id: '003', code: 'BR_003', name: '003 - Saida Southern Center', region: 'South Lebanon' },
    { id: '004', code: 'BR_004', name: '004 - Zahle Bekaa Branch', region: 'Bekaa' },
    { id: '005', code: 'BR_005', name: '005 - Tripoli North Depot', region: 'North Lebanon' },
    { id: '006', code: 'BR_006', name: '006 - Nabatieh Center', region: 'South Lebanon' },
  ];

  const [selectedBranches, setSelectedBranches] = useState<string[]>(['ALL']);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);

  const toggleBranchSelection = (code: string) => {
    if (code === 'ALL') {
      setSelectedBranches(['ALL']);
    } else {
      let updated = selectedBranches.filter((b) => b !== 'ALL');
      if (updated.includes(code)) {
        updated = updated.filter((b) => b !== code);
        if (updated.length === 0) updated = ['ALL'];
      } else {
        updated.push(code);
      }
      setSelectedBranches(updated);
    }
  };

  const getBranchesDisplayLabel = () => {
    if (selectedBranches.includes('ALL') || selectedBranches.length === 0) {
      return `All Branches (${branchesList.length})`;
    }
    if (selectedBranches.length === 1) {
      const found = branchesList.find((b) => b.code === selectedBranches[0]);
      return found ? found.name : selectedBranches[0];
    }
    return `${selectedBranches.length} Branches Selected`;
  };

  // Real-time Rolling EOD Generator
  const eodDateOptions = useMemo(() => {
    const startDate = new Date('2025-12-10');
    const today = new Date();
    const dates: { value: string; label: string }[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const current = new Date(today);
    while (current >= startDate) {
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const dd = String(current.getDate()).padStart(2, '0');
      const isoValue = `${yyyy}-${mm}-${dd}`;
      const formattedLabel = `${dd}-${monthNames[current.getMonth()]}-${yyyy} (EOD Closeout)`;

      dates.push({ value: isoValue, label: formattedLabel });
      current.setDate(current.getDate() - 1);
    }
    return dates;
  }, []);

  // Filter States
  const [periodPreset, setPeriodPreset] = useState<string>('THIS_MONTH');
  const [fromDate, setFromDate] = useState('2026-08-30');
  const [toDate, setToDate] = useState('2026-08-30');
  const [eodDate, setEodDate] = useState(eodDateOptions[0]?.value || '2026-08-31');
  const [zoomLevel, setZoomLevel] = useState(100);

  // Invoices & Mode Specific Filters
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState('ALL');
  const [invoiceTypeDropdownOpen, setInvoiceTypeDropdownOpen] = useState(false);
  const [invoiceTypeSearch, setInvoiceTypeSearch] = useState('');
  
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('ALL');
  const [realDateFilter, setRealDateFilter] = useState(false);
  const [showRateFilter, setShowRateFilter] = useState(false);
  const [groupByDateFilter, setGroupByDateFilter] = useState(false);
  const [showSummaryFilter, setShowSummaryFilter] = useState(false);
  const [showZeroTaxFilter, setShowZeroTaxFilter] = useState(false);

  // Invoice Number Range Filter (From / To)
  const [fromInvoiceNum, setFromInvoiceNum] = useState('');
  const [toInvoiceNum, setToInvoiceNum] = useState('');

  // Customer Search & VAT Engine
  const [customerSearchInput, setCustomerSearchInput] = useState('');
  const [vatNumberFilter, setVatNumberFilter] = useState('ALL');

  // Server / Employees Filter
  const [serverFilter, setServerFilter] = useState('ALL');
  const [groupedByServer, setGroupedByServer] = useState(false);

  const serverOptions = [
    'Cashier N2',
    'Cashier NK',
    'Cashier NR',
    'Hiba Aloulou',
    'Hussein Mahdi',
    'Nour Yazbek',
    'Ricky',
  ];

  // 13 Duplicate Invoices Sub-Types
  const transactionReportSubTypes = [
    'Duplicate Invoices',
    'Transactions by salesman',
    'Transactions by date',
    'Transactions by employees by payment',
    'Transactions by customers by employee',
    'Transactions by invoice number',
    'Transactions by date by payments',
    'Transactions by customers',
    'Transactions by customers by groups',
    'Transactions by customers details',
    'Transactions by workstation',
    'Transactions by employees',
    'Transactions By Source',
  ];

  const [transactionSubType, setTransactionSubType] = useState('Duplicate Invoices');

  // Active Report State (Default: Summary of voids)
  const [activeReport, setActiveReport] = useState({
    code: 'REP_IC_001',
    title: 'Summary of voids',
    category: 'Internal Control',
  });

  // Determines if the current report uses 12-Period or 6-Period selector
  const is12PeriodReport = useMemo(() => {
    if (activeReport.code === 'REP_IC_001' || activeReport.code === 'REP_IC_002' || activeReport.code === 'REP_IC_007') {
      return false;
    }
    if (activeReport.code === 'REP_IC_003' && transactionSubType === 'Transactions By Source') {
      return false;
    }
    return true;
  }, [activeReport, transactionSubType]);

  const invoiceTypeOptions = [
    { code: 'ALL', label: 'All Invoices' },
    { code: 'INVENTORY', label: 'Inventory Invoices' },
    { code: 'POS', label: 'POS Invoices' },
    { code: 'TRAINING', label: 'Training Invoices' },
  ];

  const filteredInvoiceTypeOptions = invoiceTypeOptions.filter((opt) =>
    opt.label.toLowerCase().includes(invoiceTypeSearch.toLowerCase())
  );

  const getSelectedInvoiceTypeLabel = () => {
    const found = invoiceTypeOptions.find((o) => o.code === invoiceTypeFilter);
    return found ? found.label : 'All Invoices';
  };

  // Programmatic Dynamic Date Engine
  const dynamicPeriodInfo = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIdx = now.getMonth();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const pad = (n: number) => String(n).padStart(2, '0');
    const formatDate = (d: Date) => `${pad(d.getDate())}-${monthNames[d.getMonth()]}-${d.getFullYear()}`;

    const todayStr = formatDate(now);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    const thisMonthChip = `${monthNames[currentMonthIdx]}, ${currentYear}`;
    const lastMonthDate = new Date(currentYear, currentMonthIdx - 1, 1);
    const lastMonthChip = `${monthNames[lastMonthDate.getMonth()]}, ${lastMonthDate.getFullYear()}`;

    const daysInThisMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
    const daysInLastMonth = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + 1, 0).getDate();

    switch (periodPreset) {
      case 'TODAY':
        return { chip: todayStr, header: `${todayStr} (Today)` };
      case 'YESTERDAY':
        return { chip: yesterdayStr, header: `${yesterdayStr} (Yesterday)` };
      case 'THIS_MONTH':
        return {
          chip: thisMonthChip,
          header: `${fullMonthNames[currentMonthIdx]} ${currentYear} (01-${monthNames[currentMonthIdx]}-${currentYear} to ${pad(daysInThisMonth)}-${monthNames[currentMonthIdx]}-${currentYear})`,
        };
      case 'LAST_MONTH':
        return {
          chip: lastMonthChip,
          header: `${fullMonthNames[lastMonthDate.getMonth()]} ${lastMonthDate.getFullYear()} (01-${monthNames[lastMonthDate.getMonth()]}-${lastMonthDate.getFullYear()} to ${pad(daysInLastMonth)}-${monthNames[lastMonthDate.getMonth()]}-${lastMonthDate.getFullYear()})`,
        };
      case 'Q1':
        return { chip: `Q1, ${currentYear}`, header: `First Quarter (01-Jan-${currentYear} to 31-Mar-${currentYear})` };
      case 'Q2':
        return { chip: `Q2, ${currentYear}`, header: `Second Quarter (01-Apr-${currentYear} to 30-Jun-${currentYear})` };
      case 'Q3':
        return { chip: `Q3, ${currentYear}`, header: `Third Quarter (01-Jul-${currentYear} to 30-Sep-${currentYear})` };
      case 'Q4':
        return { chip: `Q4, ${currentYear}`, header: `Fourth Quarter (01-Oct-${currentYear} to 31-Dec-${currentYear})` };
      case 'THIS_YEAR':
        return { chip: `Year ${currentYear}`, header: `Year to Date (01-Jan-${currentYear} to ${todayStr})` };
      case 'LAST_YEAR':
        return { chip: `Year ${currentYear - 1}`, header: `Full Year ${currentYear - 1} (01-Jan-${currentYear - 1} to 31-Dec-${currentYear - 1})` };
      case 'DATE_RANGE':
        return { chip: `${fromDate} ➔ ${toDate}`, header: `Date Range: ${fromDate} to ${toDate}` };
      case 'EOD_DATE':
        return { chip: eodDate, header: `EOD Closeout Date: ${eodDate}` };
      default:
        return { chip: thisMonthChip, header: thisMonthChip };
    }
  }, [periodPreset, fromDate, toDate, eodDate]);

  // Accordions
  const [expandedCats, setExpandedCats] = useState<string[]>([
    'internal_control',
    'financial',
    'product_sales',
    'customer_sales',
    'todays_history',
    'time_attendance',
    'lists',
  ]);
  const [expandedSubCats, setExpandedSubCats] = useState<string[]>([
    'fin_stats',
    'tax_reports',
    'discount_reports',
    'payments',
    'internal_control_fin',
    'profit_summary',
    'comparative',
    'transaction_summary',
    'time_sales_analysis',
    'prod_sales_sub',
    'comparative_by_branch',
    'top_performers_prod',
    'voids_and_refunds_prod',
    'top_performers_cust',
    'cust_delivery',
    'todays_sales_sub',
    'history_sub',
  ]);

  const toggleCat = (id: string) => {
    setExpandedCats((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    );
  };

  const toggleSubCat = (id: string) => {
    setExpandedSubCats((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    );
  };

  // 100% Verified 93-Report Hierarchy
  const masterCatalog = [
    {
      id: 'internal_control',
      title: '1. Internal Control',
      icon: '🛡️',
      reports: [
        { code: 'REP_IC_001', title: 'Summary of voids' },
        { code: 'REP_IC_002', title: 'Summary of refunds' },
        { code: 'REP_IC_003', title: 'Duplicate invoices' },
        { code: 'REP_IC_004', title: 'Meter reports' },
        { code: 'REP_IC_005', title: 'No sale' },
        { code: 'REP_IC_006', title: 'Transactions on hold' },
        { code: 'REP_IC_007', title: 'User log report' },
        { code: 'REP_IC_008', title: 'Discount summary' },
      ],
    },
    {
      id: 'financial',
      title: '2. Financial Reports',
      icon: '💵',
      subCategories: [
        {
          id: 'fin_stats',
          title: 'Statistics',
          reports: [
            { code: 'REP_F_101', title: 'Sales Summary' },
            { code: 'REP_F_102', title: 'Statistics by Workstation' },
            { code: 'REP_F_103', title: 'Statistics by Department' },
            { code: 'REP_F_104', title: 'Summary of Sales by Employee' },
            { code: 'REP_F_105', title: 'Sales by Employee by Category' },
            { code: 'REP_F_106', title: 'Sales by Supplier' },
            { code: 'REP_F_107', title: 'Delivery Orders by Date and Branch' },
          ],
        },
        {
          id: 'tax_reports',
          title: 'Tax Reports',
          reports: [
            { code: 'REP_F_201', title: 'Tax Summary' },
            { code: 'REP_F_202', title: 'Tax Summary Comparative' },
          ],
        },
        {
          id: 'discount_reports',
          title: 'Discount Reports',
          reports: [
            { code: 'REP_F_301', title: 'Summary of Discount by Divisions' },
            { code: 'REP_F_302', title: 'Discount By Category by Department' },
            { code: 'REP_F_303', title: 'Summary of Discount' },
            { code: 'REP_F_304', title: 'Discount By Description by Employee' },
            { code: 'REP_F_305', title: 'Summary of Discount By Items Amount' },
            { code: 'REP_F_306', title: 'Discount Summary' },
          ],
        },
        {
          id: 'payments',
          title: 'Payments',
          reports: [
            { code: 'REP_F_401', title: 'Summary of Payment' },
            { code: 'REP_F_402', title: 'Summary of Payment by Department' },
            { code: 'REP_F_403', title: 'Summary of payment by workstation' },
            { code: 'REP_F_404', title: 'Summary of Payment by Employee' },
            { code: 'REP_F_405', title: 'Advanced Payment History' },
            { code: 'REP_F_406', title: 'Paid In/Out' },
            { code: 'REP_F_407', title: 'Customer Payments' },
            { code: 'REP_F_408', title: 'List of Layaway Sales' },
            { code: 'REP_F_409', title: 'Layaway History' },
            { code: 'REP_F_410', title: 'List of Pending Invoices with Advance Payment' },
          ],
        },
        {
          id: 'internal_control_fin',
          title: 'Internal Control',
          reports: [
            { code: 'REP_F_501', title: 'Meter Report' },
            { code: 'REP_F_502', title: 'No Sale' },
            { code: 'REP_F_503', title: 'Transactions on Hold' },
            { code: 'REP_F_504', title: 'User Log Report' },
          ],
        },
        {
          id: 'profit_summary',
          title: 'Profit Summary',
          reports: [
            { code: 'REP_F_601', title: 'Profit by Invoices Summary' },
            { code: 'REP_F_602', title: 'Profit by item summary' },
            { code: 'REP_F_603', title: 'Profit by category summary' },
            { code: 'REP_F_604', title: 'Profit by category by department' },
            { code: 'REP_F_605', title: 'Profit By Invoices' },
          ],
        },
        {
          id: 'comparative',
          title: 'Comparative',
          reports: [
            { code: 'REP_F_701', title: 'Sales summary by day' },
            { code: 'REP_F_702', title: 'Daily Sales' },
            { code: 'REP_F_703', title: 'Comparative Yearly Sales' },
            { code: 'REP_F_704', title: 'Comparative Monthly Sales' },
            { code: 'REP_F_705', title: 'Comparative Monthly Sales by Employee' },
          ],
        },
        {
          id: 'transaction_summary',
          title: 'Transaction Summary',
          reports: [
            { code: 'REP_F_801', title: 'Transactions by Date' },
            { code: 'REP_F_802', title: 'Credit Sales' },
            { code: 'REP_F_803', title: 'Credit Card Report' },
            { code: 'REP_F_804', title: 'Electronic Journal' },
          ],
        },
        {
          id: 'time_sales_analysis',
          title: 'Time sales analysis',
          reports: [
            { code: 'REP_F_901', title: 'Timer Report Group by transaction count' },
            { code: 'REP_F_902', title: 'Time report by date' },
            { code: 'REP_F_903', title: 'Time report - Average Check' },
            { code: 'REP_F_904', title: 'Time report By EOD date' },
            { code: 'REP_F_905', title: 'Transaction Report by Time' },
          ],
        },
      ],
    },
    {
      id: 'product_sales',
      title: '3. Product Sales',
      icon: '📦',
      subCategories: [
        {
          id: 'prod_sales_sub',
          title: 'Product Sales',
          reports: [
            { code: 'REP_P_101', title: 'Summary of Sales By Items' },
            { code: 'REP_S_00191', title: 'Sales by Items' },
            { code: 'REP_P_102', title: 'Sales details for one sales item' },
            { code: 'REP_P_103', title: 'Sales By Customer By Items' },
            { code: 'REP_P_104', title: 'Daily Sales By Items' },
            { code: 'REP_P_105', title: 'Sales By Categories' },
            { code: 'REP_P_106', title: 'Sales By Divisions' },
            { code: 'REP_P_107', title: 'Sales Items by Transaction' },
            { code: 'REP_P_108', title: 'Not Sold Items' },
            { code: 'REP_P_109', title: 'Sold Serial Numbers' },
          ],
        },
        {
          id: 'comparative_by_branch',
          title: 'Comparative By Branch',
          reports: [
            { code: 'REP_P_201', title: 'Sales By Category' },
            { code: 'REP_P_202', title: 'Sales By Division' },
            { code: 'REP_P_203', title: 'Sales By Groups' },
            { code: 'REP_P_204', title: 'Sales By Items' },
          ],
        },
        {
          id: 'top_performers_prod',
          title: 'Top Performers',
          reports: [
            { code: 'REP_P_301', title: 'Top N sold by Quantity' },
            { code: 'REP_P_302', title: 'Top N sold by Amount' },
          ],
        },
        {
          id: 'voids_and_refunds_prod',
          title: 'Voids & Refunds',
          reports: [
            { code: 'REP_P_401', title: 'Summary of voids' },
            { code: 'REP_P_402', title: 'Summary of refunds' },
            { code: 'REP_P_403', title: 'Details of refunds' },
          ],
        },
      ],
    },
    {
      id: 'customer_sales',
      title: '4. Customer Sales',
      icon: '👥',
      subCategories: [
        {
          id: 'top_performers_cust',
          title: 'Top Performers',
          reports: [{ code: 'REP_C_101', title: 'Top N Customers by Amount' }],
        },
        {
          id: 'cust_delivery',
          title: 'Customers & Delivery',
          reports: [
            { code: 'REP_C_201', title: 'Sales by customer In Detail' },
            { code: 'REP_C_202', title: 'Sales by zone' },
            { code: 'REP_C_203', title: 'Delivery Sales Summary' },
            { code: 'REP_C_204', title: 'Drivers History' },
          ],
        },
      ],
    },
    {
      id: 'todays_history',
      title: "5. Today's & History",
      icon: '📅',
      subCategories: [
        {
          id: 'todays_sales_sub',
          title: "Today's Sales",
          reports: [
            { code: 'REP_TH_101', title: "Today's Statistics" },
            { code: 'REP_TH_102', title: "Today's Summary of payment" },
            { code: 'REP_TH_103', title: "Today's summary by Employee" },
            { code: 'REP_TH_104', title: "Today's Transactions" },
          ],
        },
        {
          id: 'history_sub',
          title: 'History',
          reports: [
            { code: 'REP_TH_201', title: 'Preview Older Sales' },
            { code: 'REP_TH_202', title: 'Main Reading History' },
          ],
        },
      ],
    },
    {
      id: 'time_attendance',
      title: '6. Time & Attendance',
      icon: '⏱️',
      reports: [
        { code: 'REP_TA_001', title: 'Employee attendance' },
        { code: 'REP_TA_002', title: 'Time and attendance' },
        { code: 'REP_TA_003', title: 'Labor cost' },
      ],
    },
    {
      id: 'lists',
      title: '7. Lists',
      icon: '📋',
      reports: [
        { code: 'REP_L_001', title: 'Customer list standard' },
        { code: 'REP_L_002', title: 'Not active customers' },
        { code: 'REP_L_003', title: 'New customers' },
        { code: 'REP_L_004', title: 'Blacklist customers' },
      ],
    },
  ];

  // Flattened reports list
  const allFlattenedReports = useMemo(() => {
    const list: { code: string; title: string; category: string }[] = [];
    masterCatalog.forEach((c) => {
      if (c.reports) {
        c.reports.forEach((r) => list.push({ ...r, category: c.title }));
      }
      if (c.subCategories) {
        c.subCategories.forEach((s) => {
          s.reports.forEach((sr) => list.push({ ...sr, category: `${c.title} - ${s.title}` }));
        });
      }
    });
    return list;
  }, [masterCatalog]);

  // Sample Datasets
  const customerListRows = [
    { code: 'CUST-01', name: 'Al-Baraka Supermarket S.A.R.L', region: 'Mount Lebanon', city: 'Choueifat Main Highway', phone: '03112233', rep: 'Ahmad Ali Kassem', creditLimit: 5000.0, balance: 1400.0 },
    { code: 'CUST-02', name: 'Al-Nour Food Establishment', region: 'Beirut', city: 'Hamra (Makdessi Street)', phone: '01778899', rep: 'Hiba Aloulou', creditLimit: 3500.0, balance: 890.0 },
    { code: 'CUST-03', name: 'Al-Kheir Olive Center', region: 'South Lebanon', city: 'Saida (Riad El Solh)', phone: '07722334', rep: 'Hussein Mahdi', creditLimit: 7000.0, balance: 3000.0 },
    { code: 'CUST-04', name: 'Byblos Green Grocers', region: 'Mount Lebanon', city: 'Jbeil Main Road', phone: '09540112', rep: 'Ahmad Ali Kassem', creditLimit: 4000.0, balance: 1700.0 },
    { code: 'CUST-05', name: 'Bekaa Traditional Trading', region: 'Bekaa', city: 'Zahle Boulevard', phone: '08812345', rep: 'Hussein Mahdi', creditLimit: 6500.0, balance: 0.0 },
  ];

  const voidRows = [
    { date: '22-Aug-2026 5:31 PM', orderDate: '22-Aug-2026 5:31 PM', server: 'Hiba Aloulou', invoice: '103225', description: 'عرض العطاء جديد - زيت زيتون بكر ممتاز 17.5 لتر', qty: 1.0, valueLbp: 9000000.0, reason: 'تعداد خاطئ' },
    { date: '13-Aug-2026 6:58 PM', orderDate: '13-Aug-2026 6:58 PM', server: 'Hiba Aloulou', invoice: '103125', description: 'ألفية زيت زيتون خضير بلدي 1000 مل', qty: 1.0, valueLbp: 990000.0, reason: 'تعداد خاطئ' },
    { date: '13-Aug-2026 6:58 PM', orderDate: '13-Aug-2026 6:58 PM', server: 'Hiba Aloulou', invoice: '103125', description: 'حبوب اللقاح البلدية 360غ', qty: 1.0, valueLbp: 900000.0, reason: 'تعداد خاطئ' },
  ];

  const genericSalesRows = [
    { ref: 'INV-0891', date: '28-Aug-2026', client: 'Al-Baraka Supermarket', item: '17.5L Olive Oil Tin', qty: 12, totalUsd: 1400.0, rep: 'Ahmad Ali' },
    { ref: 'INV-0892', date: '28-Aug-2026', client: 'Al-Nour Food Est.', item: 'Pomegranate Molasses Box', qty: 24, totalUsd: 890.0, rep: 'Hiba Aloulou' },
    { ref: 'INV-0893', date: '29-Aug-2026', client: 'Al-Kheir Olive Center', item: 'Extra Virgin Glass 1L', qty: 50, totalUsd: 3000.0, rep: 'Hussein Mahdi' },
  ];

  // Real Client-Side Export Handlers
  const triggerCSVExport = () => {
    let csvContent = '\uFEFF';
    csvContent += `Company: Southern Olive Oil Products S.A.R.L\n`;
    csvContent += `Report: ${activeReport.code === 'REP_IC_003' ? transactionSubType : activeReport.title}\n`;
    csvContent += `Period: ${dynamicPeriodInfo.header}\n`;
    csvContent += `Branch: ${getBranchesDisplayLabel()}\n\n`;

    if (activeReport.code === 'REP_IC_001') {
      csvContent += `Date,Order Date,Server,Invoice,Description,Qty,Value (LBP),Reason\n`;
      voidRows.forEach((r) => {
        csvContent += `"${r.date}","${r.orderDate}","${r.server}","${r.invoice}","${r.description.replace(/"/g, '""')}",${r.qty},${r.valueLbp},"${r.reason}"\n`;
      });
    } else if (activeReport.code.startsWith('REP_L_')) {
      csvContent += `Code,Customer Name,Region,Phone,Assigned Rep,Balance ($)\n`;
      customerListRows.forEach((c) => {
        csvContent += `"${c.code}","${c.name.replace(/"/g, '""')}","${c.region}","${c.phone}","${c.rep}",${c.balance}\n`;
      });
    } else {
      csvContent += `Ref #,Date,Client / Account,Item Details,Qty,Total ($)\n`;
      genericSalesRows.forEach((s) => {
        csvContent += `"${s.ref}","${s.date}","${s.client.replace(/"/g, '""')}","${s.item.replace(/"/g, '""')}",${s.qty},${s.totalUsd}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Vanguard_${activeReport.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportDropdownOpen(false);
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-80px)] select-none text-left font-sans print:h-auto print:overflow-visible">
      
      {/* INLINE BULLETPROOF CSS PRINT ISOLATION */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm !important;
          }
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            visibility: hidden !important;
          }
          body * {
            visibility: hidden !important;
          }
          header, aside, nav, button, input, select, .print-hidden, [class*="print:hidden"] {
            display: none !important;
            visibility: hidden !important;
          }
          #isolated-a4-print-sheet, #isolated-a4-print-sheet * {
            visibility: visible !important;
          }
          #isolated-a4-print-sheet {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            min-height: 100vh !important;
            margin: 0 !important;
            padding: 12mm 15mm !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            display: block !important;
            z-index: 999999 !important;
          }
        }
      `}} />

      {/* 1. TOP SUB-HEADER BAR */}
      <div className="h-11 bg-white border-b border-slate-200 px-4 flex items-center justify-between print:hidden shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCatalog(!showCatalog)}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <span>{showCatalog ? '◀ Hide Catalog' : '▶ Show Report Categories'}</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Active Report:</span>
            <span className="font-bold text-[#1e3a2b] bg-[#eef3ee] px-2.5 py-0.5 rounded border border-[#1e3a2b]/30">
              {activeReport.code === 'REP_IC_003' ? transactionSubType : activeReport.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono hidden md:inline">Southern Olive Oil Products S.A.R.L</span>
          <button
            type="button"
            onClick={() => alert('Report view closed')}
            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 text-xs font-medium"
          >
            Close Report
          </button>
          <Link
            href="/backoffice/dashboard"
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors flex items-center gap-1"
          >
            <span>🔄 Return to Hub</span>
          </Link>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. EXACT USER-DICTATED FILTER RIBBON                                */}
      {/* =================================================================== */}
      <div className="bg-white border-b border-slate-200 p-2.5 px-4 flex flex-col gap-2.5 print:hidden shrink-0 shadow-2xs">
        
        {/* DUPLICATE INVOICES EXCLUSIVE: TOP 13-MODE SELECTOR BAR */}
        {activeReport.code === 'REP_IC_003' && (
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Transaction Mode:</span>
              <select
                value={transactionSubType}
                onChange={(e) => setTransactionSubType(e.target.value)}
                className="px-3 py-1 bg-[#f8faf8] border border-[#1e3a2b]/40 rounded-lg font-bold text-xs text-[#1e3a2b] focus:outline-none min-w-[280px] shadow-2xs"
              >
                {transactionReportSubTypes.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* MAIN CONTROLS ROW */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          
          <div className="flex flex-wrap items-center gap-2">
            
            {/* A. PERIOD DROPDOWN (ONLY WHERE DICTATED) */}
            {transactionSubType !== 'Transactions by invoice number' && (
              <>
                <select
                  value={periodPreset}
                  onChange={(e) => setPeriodPreset(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-xs text-slate-800 focus:outline-none"
                >
                  <option value="TODAY">Today</option>
                  <option value="YESTERDAY">Yesterday</option>
                  <option value="THIS_MONTH">This Month</option>
                  <option value="LAST_MONTH">Last Month</option>
                  
                  {is12PeriodReport && (
                    <>
                      <option value="Q1">First Quarter (Q1)</option>
                      <option value="Q2">Second Quarter (Q2)</option>
                      <option value="Q3">Third Quarter (Q3)</option>
                      <option value="Q4">Fourth Quarter (Q4)</option>
                      <option value="THIS_YEAR">This Year</option>
                      <option value="LAST_YEAR">Last Year</option>
                    </>
                  )}

                  <option value="DATE_RANGE">Date Range</option>
                  <option value="EOD_DATE">EOD Date</option>
                </select>

                {/* DYNAMIC AUTO-CALCULATED DATE DISPLAY CHIP */}
                {periodPreset !== 'DATE_RANGE' && periodPreset !== 'EOD_DATE' && (
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={dynamicPeriodInfo.chip}
                    className="px-2.5 py-1.5 bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-700 cursor-not-allowed text-center min-w-[100px]"
                    title="Real-time Dynamic Computed Date"
                  />
                )}

                {periodPreset === 'DATE_RANGE' && (
                  <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded border border-slate-300">
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-1.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono" />
                    <span className="text-slate-400 font-bold">➔</span>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-1.5 py-1 bg-white border border-slate-300 rounded text-xs font-mono" />
                  </div>
                )}

                {periodPreset === 'EOD_DATE' && (
                  <select value={eodDate} onChange={(e) => setEodDate(e.target.value)} className="px-2 py-1.5 bg-white border border-slate-300 rounded font-mono text-xs max-w-[220px]">
                    {eodDateOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              </>
            )}

            {/* B. MULTI-SELECT BRANCHES DROPDOWN (PRESENT IN ALL REPORTS) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-xs text-slate-800 flex items-center gap-1.5 focus:outline-none hover:border-[#1e3a2b]"
              >
                <span>{getBranchesDisplayLabel()}</span>
                <span className="text-[9px] text-slate-500">▼</span>
              </button>

              {branchDropdownOpen && (
                <div className="absolute left-0 mt-1 w-64 bg-white border border-slate-300 rounded-xl shadow-xl py-1.5 text-xs text-slate-800 z-50 animate-fadeIn">
                  <div className="px-3 py-1 border-b border-slate-100 font-bold text-[10.5px] text-slate-400 uppercase">
                    Select Operating Branches
                  </div>
                  <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 cursor-pointer font-bold border-b border-slate-100">
                    <input
                      type="checkbox"
                      checked={selectedBranches.includes('ALL')}
                      onChange={() => toggleBranchSelection('ALL')}
                      className="accent-[#1e3a2b]"
                    />
                    <span>All Operating Branches ({branchesList.length})</span>
                  </label>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar py-1">
                    {branchesList.map((b) => (
                      <label key={b.id} className="flex items-center gap-2 px-3 py-1 hover:bg-slate-50 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={selectedBranches.includes(b.code)}
                          onChange={() => toggleBranchSelection(b.code)}
                          className="accent-[#1e3a2b]"
                        />
                        <span>{b.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* C. INVOICE NUMBER RANGE (ONLY FOR Transactions by invoice number) */}
            {activeReport.code === 'REP_IC_003' && transactionSubType === 'Transactions by invoice number' && (
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-300">
                <span className="text-slate-500 font-semibold text-xs">From #:</span>
                <input
                  type="text"
                  value={fromInvoiceNum}
                  onChange={(e) => setFromInvoiceNum(e.target.value)}
                  placeholder="e.g. 103100"
                  className="w-20 px-2 py-0.5 bg-white border border-slate-300 rounded font-mono text-xs"
                />
                <span className="text-slate-500 font-semibold text-xs">To #:</span>
                <input
                  type="text"
                  value={toInvoiceNum}
                  onChange={(e) => setToInvoiceNum(e.target.value)}
                  placeholder="e.g. 103250"
                  className="w-20 px-2 py-0.5 bg-white border border-slate-300 rounded font-mono text-xs"
                />
              </div>
            )}

            {/* D. INVOICES TYPE FILTER (ONLY FOR Summary of refunds & specific transaction modes) */}
            {(activeReport.code === 'REP_IC_002' || 
              (activeReport.code === 'REP_IC_003' && 
               ['Duplicate Invoices', 'Transactions by employees by payment', 'Transactions by date by payments', 'Transactions by customers', 'Transactions by customers by groups', 'Transactions by customers details', 'Transactions by workstation', 'Transactions by salesman', 'Transactions By Source'].includes(transactionSubType))) && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setInvoiceTypeDropdownOpen(!invoiceTypeDropdownOpen)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-xs text-slate-800 flex items-center justify-between gap-2 min-w-[130px]"
                >
                  <span>{getSelectedInvoiceTypeLabel()}</span>
                  <span className="text-[9px] text-slate-500">▼</span>
                </button>

                {invoiceTypeDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-52 bg-white border border-slate-300 rounded-xl shadow-xl py-1 text-xs text-slate-800 z-50">
                    <div className="p-1.5 border-b border-slate-100">
                      <input
                        type="text"
                        value={invoiceTypeSearch}
                        onChange={(e) => setInvoiceTypeSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs"
                        autoFocus
                      />
                    </div>
                    {filteredInvoiceTypeOptions.map((opt) => (
                      <button
                        key={opt.code}
                        type="button"
                        onClick={() => { setInvoiceTypeFilter(opt.code); setInvoiceTypeDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between ${invoiceTypeFilter === opt.code ? 'bg-[#edf2ee] text-[#1e3a2b] font-bold' : ''}`}
                      >
                        <span>{opt.label}</span>
                        {invoiceTypeFilter === opt.code && <span className="text-[#1e3a2b]">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* E. ALL PAYMENT TYPES (ONLY FOR Transactions by date, Transactions by date by payments, Transactions By Source) */}
            {activeReport.code === 'REP_IC_003' && ['Transactions by date', 'Transactions by date by payments', 'Transactions By Source'].includes(transactionSubType) && (
              <select
                value={paymentTypeFilter}
                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-xs text-slate-800 focus:outline-none"
              >
                <option value="ALL">All Payment Types</option>
                <option value="CASH">Cash</option>
                <option value="CREDIT">Credit</option>
                <option value="CASH_USD">Cash USD</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="CREDIT_CARD_USD">Credit Card USD</option>
              </select>
            )}

            {/* F. CUSTOMER SEARCH & VAT NUMBER (ONLY FOR Transactions by customers / details) */}
            {activeReport.code === 'REP_IC_003' && ['Transactions by customers', 'Transactions by customers details'].includes(transactionSubType) && (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customerSearchInput}
                  onChange={(e) => setCustomerSearchInput(e.target.value)}
                  placeholder="Search Customers..."
                  className="w-36 px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs placeholder-slate-400 focus:outline-none focus:border-[#1e3a2b]"
                />

                {transactionSubType === 'Transactions by customers' && (
                  <select
                    value={vatNumberFilter}
                    onChange={(e) => setVatNumberFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="ALL">All VAT Status</option>
                    <option value="WITH_VAT">With VATNB</option>
                    <option value="WITHOUT_VAT">Without VATNB</option>
                  </select>
                )}
              </div>
            )}

            {/* G. SERVERS SELECTOR & GROUPED BY SERVER (ONLY FOR Transactions by employees) */}
            {activeReport.code === 'REP_IC_003' && transactionSubType === 'Transactions by employees' && (
              <div className="flex items-center gap-1.5">
                <select
                  value={serverFilter}
                  onChange={(e) => setServerFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-xs text-slate-800 focus:outline-none"
                >
                  <option value="ALL">All Servers</option>
                  {serverOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={groupedByServer}
                    onChange={(e) => setGroupedByServer(e.target.checked)}
                    className="accent-[#1e3a2b] w-3.5 h-3.5"
                  />
                  <span>Grouped by server</span>
                </label>
              </div>
            )}

            {/* H. DYNAMIC CHECKBOX FLAGS (ONLY WHERE USER EXPLICITLY DICTATED) */}
            {/* Real Date */}
            {activeReport.code === 'REP_IC_003' && ['Transactions by employees by payment', 'Transactions by workstation', 'Transactions by employees'].includes(transactionSubType) && (
              <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800">
                <input type="checkbox" checked={realDateFilter} onChange={(e) => setRealDateFilter(e.target.checked)} className="accent-[#1e3a2b] w-3.5 h-3.5" />
                <span>Real Date</span>
              </label>
            )}

            {/* Show Rate */}
            {activeReport.code === 'REP_IC_003' && ['Duplicate Invoices', 'Transactions by date'].includes(transactionSubType) && (
              <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800">
                <input type="checkbox" checked={showRateFilter} onChange={(e) => setShowRateFilter(e.target.checked)} className="accent-[#1e3a2b] w-3.5 h-3.5" />
                <span>Show rate</span>
              </label>
            )}

            {/* Group by date */}
            {activeReport.code === 'REP_IC_003' && ['Transactions by date', 'Transactions By Source'].includes(transactionSubType) && (
              <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800">
                <input type="checkbox" checked={groupByDateFilter} onChange={(e) => setGroupByDateFilter(e.target.checked)} className="accent-[#1e3a2b] w-3.5 h-3.5" />
                <span>Group by date</span>
              </label>
            )}

            {/* Summary */}
            {activeReport.code === 'REP_IC_003' && ['Transactions by date by payments', 'Transactions by customers details'].includes(transactionSubType) && (
              <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800">
                <input type="checkbox" checked={showSummaryFilter} onChange={(e) => setShowSummaryFilter(e.target.checked)} className="accent-[#1e3a2b] w-3.5 h-3.5" />
                <span>Summary</span>
              </label>
            )}

            {/* Show Zero Tax */}
            {activeReport.code === 'REP_IC_003' && transactionSubType === 'Transactions by invoice number' && (
              <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800">
                <input type="checkbox" checked={showZeroTaxFilter} onChange={(e) => setShowZeroTaxFilter(e.target.checked)} className="accent-[#1e3a2b] w-3.5 h-3.5" />
                <span>Show zero tax</span>
              </label>
            )}

            {/* ACTION BUTTONS */}
            <button
              type="button"
              onClick={() => alert(`Filter Applied: ${activeReport.title}`)}
              className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded text-xs transition-colors shadow-2xs"
            >
              Filter
            </button>
            
            <button
              type="button"
              onClick={() => {
                setPeriodPreset('THIS_MONTH');
                setSelectedBranches(['ALL']);
                setInvoiceTypeFilter('ALL');
                setRealDateFilter(false);
                setShowRateFilter(false);
                setGroupByDateFilter(false);
                setShowSummaryFilter(false);
                setCustomerSearchInput('');
              }}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Right Tools: Zoom + Print + Export + Settings */}
          <div className="flex items-center gap-1.5 relative">
            <button type="button" onClick={() => setZoomLevel(Math.max(75, zoomLevel - 10))} className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold" title="Zoom Out">🔍−</button>
            <button type="button" onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))} className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold" title="Zoom In">🔍+</button>
            <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded text-xs transition-colors flex items-center gap-1.5 shadow-2xs"><span>🖨️ Print</span></button>
            
            <div className="relative">
              <button type="button" onClick={() => setExportDropdownOpen(!exportDropdownOpen)} className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded text-xs border border-slate-300 flex items-center gap-1.5 shadow-2xs">
                <span>📥 Export</span>
                <span className="text-[9px] text-slate-500">▼</span>
              </button>
              {exportDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-300 rounded-xl shadow-xl py-1.5 text-xs text-slate-800 z-50">
                  <button type="button" onClick={() => { window.print(); setExportDropdownOpen(false); }} className="w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center gap-2"><span>📄</span> <div><div className="font-bold">Export as PDF (.pdf)</div></div></button>
                  <button type="button" onClick={triggerCSVExport} className="w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center gap-2"><span>📊</span> <div><div className="font-bold">Export as Excel (.xlsx / .csv)</div></div></button>
                  <button type="button" onClick={triggerCSVExport} className="w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center gap-2"><span>📑</span> <div><div className="font-bold">Export as CSV (.csv)</div></div></button>
                </div>
              )}
            </div>

            <button type="button" onClick={() => setSettingsModalOpen(true)} className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300" title="Settings">⚙️</button>
          </div>

        </div>

      </div>

      {/* 3. WORKSPACE: 93-REPORTS TREE + ISOLATED A4 PRINT CONTAINER */}
      <div className="flex-1 flex overflow-hidden p-4 bg-[#f3f5f8] print:p-0 print:m-0 print:bg-white print:overflow-visible">
        
        {/* Left 93-Reports Tree */}
        {showCatalog && (
          <aside className="w-[300px] bg-[#eef3ee] border-r border-slate-300 print:hidden overflow-y-auto p-2.5 space-y-2 shrink-0 mr-4 shadow-2xs custom-scrollbar rounded-xl">
            <div className="bg-white p-1 rounded-lg border border-slate-300 shadow-2xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search all reports..."
                className="w-full px-2.5 py-1 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>

            {masterCatalog.map((cat) => (
              <div key={cat.id} className="border border-slate-300/80 rounded-xl overflow-hidden bg-white shadow-2xs">
                <div
                  onClick={() => toggleCat(cat.id)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200/80 cursor-pointer font-bold text-slate-900 text-[11px] flex items-center justify-between border-b border-slate-200 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <span>{cat.icon}</span> <span>{cat.title}</span>
                  </span>
                  <span className="text-[9px] text-[#1e3a2b] font-bold">{expandedCats.includes(cat.id) ? '▲' : '▼'}</span>
                </div>

                {expandedCats.includes(cat.id) && (
                  <div className="p-1 space-y-1 bg-white">
                    {cat.reports && cat.reports
                      .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((r) => (
                        <button
                          key={r.code}
                          type="button"
                          onClick={() => {
                            setActiveReport({ ...r, category: cat.title });
                            if (r.code === 'REP_IC_003') setTransactionSubType('Duplicate Invoices');
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg truncate block text-xs transition-all ${
                            activeReport.code === r.code
                              ? 'bg-[#1e3a2b] text-white font-bold shadow-xs'
                              : 'hover:bg-slate-100 text-slate-700 font-medium'
                          }`}
                        >
                          <span>{r.title}</span>
                        </button>
                      ))}

                    {cat.subCategories && cat.subCategories.map((sub) => (
                      <div key={sub.id} className="border border-slate-200 rounded-lg bg-slate-50/60">
                        <div
                          onClick={() => toggleSubCat(sub.id)}
                          className="px-2.5 py-1 font-bold text-slate-800 hover:text-[#1e3a2b] cursor-pointer flex items-center justify-between text-[10.5px]"
                        >
                          <span>📁 {sub.title}</span>
                          <span className="text-[8px] text-[#1e3a2b] font-bold">{expandedSubCats.includes(sub.id) ? '−' : '+'}</span>
                        </div>

                        {expandedSubCats.includes(sub.id) && (
                          <div className="pl-2 pr-1 py-0.5 space-y-0.5 border-t border-slate-200/80 bg-white">
                            {sub.reports
                              .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
                              .map((r) => (
                                <button
                                  key={r.code}
                                  type="button"
                                  onClick={() => {
                                    setActiveReport({ ...r, category: `${cat.title} - ${sub.title}` });
                                    setTransactionSubType(r.title);
                                  }}
                                  className={`w-full text-left px-2.5 py-1 rounded truncate block text-xs transition-all ${
                                    activeReport.code === r.code
                                      ? 'bg-[#1e3a2b] text-white font-bold shadow-xs'
                                      : 'hover:bg-slate-100 text-slate-700 font-medium'
                                  }`}
                                >
                                  <span>{r.title}</span>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </aside>
        )}

        {/* Right Canvas: ISOLATED PURE A4 PRINT CONTAINER */}
        <main className="flex-1 overflow-y-auto custom-scrollbar flex justify-center print:overflow-visible print:p-0 print:m-0">
          
          <div
            id="isolated-a4-print-sheet"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-[794px] min-h-[1123px] page-break-after-always relative bg-white p-8 text-black font-sans border border-slate-300 shadow-md print:border-none print:shadow-none print:m-0 print:p-6 print:transform-none transition-transform duration-200 select-none"
          >
            {/* Header */}
            <div className="border-b-2 border-black pb-2 mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-sm font-bold text-slate-900 uppercase">Southern Olive Oil Products S.A.R.L</h1>
                  <h2 className="text-base font-bold mt-0.5 text-slate-900">{activeReport.code === 'REP_IC_003' ? transactionSubType : activeReport.title}</h2>
                </div>
                <div className="text-right text-[10.5px] font-mono text-slate-700 space-y-0.5">
                  <div>Prepared By: Mohammed</div>
                  <div>Report Code: {activeReport.code}</div>
                  <div>Page 1 of 1</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10.5px] font-mono mt-2 pt-1 border-t border-slate-300 text-slate-700">
                <div>Period: {dynamicPeriodInfo.header}</div>
                <div>Branch: {getBranchesDisplayLabel()}</div>
              </div>
            </div>

            {/* VIEW A: LISTS / CUSTOMERS */}
            {(activeReport.code.startsWith('REP_L_') || activeReport.category.includes('Lists')) && (
              <div>
                <table className="w-full table-fixed text-left border-collapse text-[11px] mt-3">
                  <thead>
                    <tr className="border-b border-black bg-slate-100 font-bold text-black leading-tight">
                      <th className="py-1 px-1 normal-case w-[12%]">code</th>
                      <th className="py-1 px-1 normal-case w-[28%]">customer / store name</th>
                      <th className="py-1 px-1 normal-case w-[14%]">region</th>
                      <th className="py-1 px-1 normal-case w-[16%]">phone</th>
                      <th className="py-1 px-1 normal-case w-[15%]">assigned rep</th>
                      <th className="py-1 px-1 normal-case w-[15%] text-right">balance ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {customerListRows.map((cust) => (
                      <tr key={cust.code} className="hover:bg-slate-50 leading-normal">
                        <td className="py-1.5 px-1 font-mono font-bold">{cust.code}</td>
                        <td className="py-1.5 px-1 font-bold text-slate-900">{cust.name}</td>
                        <td className="py-1.5 px-1 text-slate-700">{cust.region}</td>
                        <td className="py-1.5 px-1 font-mono text-slate-700">{cust.phone}</td>
                        <td className="py-1.5 px-1 text-slate-800">{cust.rep.split(' ')[0]}</td>
                        <td className="py-1.5 px-1 text-right font-mono font-bold text-[#1e3a2b]">
                          ${cust.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t-2 border-black mt-4 pt-2 text-[11px] font-mono flex justify-between items-center font-bold">
                  <span>Total Customers: {customerListRows.length} Active Partners</span>
                  <span>Total Balance: ${customerListRows.reduce((s, c) => s + c.balance, 0).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* VIEW B: VOIDS & INTERNAL CONTROL */}
            {activeReport.code === 'REP_IC_001' && (
              <div>
                <table className="w-full table-fixed text-left border-collapse text-[11px] mt-3">
                  <thead>
                    <tr className="border-b border-black bg-slate-100 font-bold text-black leading-tight">
                      <th className="py-1.5 px-1 normal-case w-[15%]">date</th>
                      <th className="py-1.5 px-1 normal-case w-[15%]">order date</th>
                      <th className="py-1.5 px-1 normal-case w-[12%]">server</th>
                      <th className="py-1.5 px-1 normal-case w-[8%] text-center">invoice</th>
                      <th className="py-1.5 px-1 normal-case w-[28%]">description</th>
                      <th className="py-1.5 px-1 normal-case w-[6%] text-center">qty</th>
                      <th className="py-1.5 px-1 normal-case w-[12%] text-right">value (LBP)</th>
                      <th className="py-1.5 px-1 normal-case w-[12%]">reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {voidRows.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 leading-normal align-top">
                        <td className="py-2 px-1 font-mono text-[10px] text-slate-700">{item.date}</td>
                        <td className="py-2 px-1 font-mono text-[10px] text-slate-700">{item.orderDate}</td>
                        <td className="py-2 px-1 font-semibold text-slate-800">{item.server}</td>
                        <td className="py-2 px-1 font-mono font-bold text-center">{item.invoice}</td>
                        <td className="py-2 px-1 font-bold text-slate-900 leading-snug whitespace-normal break-words">
                          {item.description}
                        </td>
                        <td className="py-2 px-1 text-center font-mono font-bold">{item.qty.toFixed(2)}</td>
                        <td className="py-2 px-1 text-right font-mono font-bold">{item.valueLbp.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2 px-1 text-slate-700 text-[10.5px] leading-tight font-medium">{item.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t-2 border-black mt-4 pt-2 text-[11px] font-mono flex justify-end">
                  <div className="w-[300px] space-y-1">
                    <div className="flex justify-between font-bold border-b border-slate-200 pb-0.5">
                      <span>Total Voids:</span> <span>3 events</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#1e3a2b]">
                      <span>Total Value:</span> <span>10,890,000.00 LBP</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW C: SALES & OTHER MATRIX */}
            {activeReport.code !== 'REP_IC_001' && !activeReport.code.startsWith('REP_L_') && (
              <div>
                <table className="w-full table-fixed text-left border-collapse text-[11px] mt-3">
                  <thead>
                    <tr className="border-b border-black bg-slate-100 font-bold text-black leading-tight">
                      <th className="py-1 px-1 normal-case w-[14%]">ref #</th>
                      <th className="py-1 px-1 normal-case w-[14%]">date</th>
                      <th className="py-1 px-1 normal-case w-[24%]">client / account</th>
                      <th className="py-1 px-1 normal-case w-[26%]">item details</th>
                      <th className="py-1 px-1 normal-case w-[8%] text-center">qty</th>
                      <th className="py-1 px-1 normal-case w-[14%] text-right">total ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {genericSalesRows.map((s, i) => (
                      <tr key={i} className="hover:bg-slate-50 leading-normal">
                        <td className="py-1.5 px-1 font-mono font-bold">{s.ref}</td>
                        <td className="py-1.5 px-1 font-mono text-[10px]">{s.date}</td>
                        <td className="py-1.5 px-1 font-bold text-slate-900">{s.client}</td>
                        <td className="py-1.5 px-1 text-slate-800">{s.item}</td>
                        <td className="py-1.5 px-1 text-center font-mono">{s.qty}</td>
                        <td className="py-1.5 px-1 text-right font-mono font-bold text-[#1e3a2b]">${s.totalUsd.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t-2 border-black mt-4 pt-2 text-[11px] font-mono flex justify-between items-center font-bold">
                  <span>Report Mode: {activeReport.code === 'REP_IC_003' ? transactionSubType : activeReport.title}</span>
                  <span>Total Revenue: ${genericSalesRows.reduce((s, r) => s + r.totalUsd, 0).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="absolute bottom-6 left-8 right-8 border-t border-black pt-2 flex justify-between items-center text-[10px] text-slate-600 font-mono">
              <span>Printed from Vanguard ERP System</span>
              <span>Southern Olive Oil Products S.A.R.L - Confidential</span>
              <span>Page 1 of 1</span>
            </div>

          </div>

        </main>

      </div>

      {/* =================================================================== */}
      {/* 4. SETTINGS MODAL                                                   */}
      {/* =================================================================== */}
      {settingsModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 print:hidden animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-[#f8faf8]">
              <h2 className="text-base font-bold text-slate-900">Settings</h2>
              <button type="button" onClick={() => setSettingsModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 rounded">✕</button>
            </div>
            <div className="p-5 overflow-y-auto custom-scrollbar space-y-5 text-xs text-slate-800">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs">Default Date Range Selection</label>
                  <button type="button" onClick={() => alert(`Default Date Range Saved as ${defaultDateSelection}`)} className="px-3.5 py-1 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-lg text-xs shadow-2xs">Save</button>
                </div>
                <select value={defaultDateSelection} onChange={(e) => setDefaultDateSelection(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold text-xs text-slate-800 focus:outline-none">
                  <option value="THIS_MONTH">This Month</option>
                  <option value="EOD_DATE">EOD Date</option>
                  <option value="TODAY">Today</option>
                </select>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">Toolbar Categories</h3>
                    <p className="text-[10.5px] text-slate-500">You can include up to 8 categories in the toolbar</p>
                  </div>
                  <button type="button" onClick={() => setCustomCategoryModalOpen(true)} className="px-3 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-lg text-xs shadow-2xs">Custom Category</button>
                </div>

                <div className="bg-white p-1.5 rounded-lg border border-slate-300 flex items-center gap-1.5">
                  <span className="text-slate-400">🔍</span>
                  <input type="text" value={settingsSearch} onChange={(e) => setSettingsSearch(e.target.value)} placeholder="Search categories and reports..." className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none" />
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold">
                      <input type="checkbox" checked={selectedToolbarCats.includes('recently_viewed')} onChange={() => toggleToolbarCatCheck('recently_viewed')} className="accent-[#1e3a2b] w-3.5 h-3.5" />
                      <span>Recently Viewed</span>
                    </label>
                  </div>

                  {masterCatalog.map((c) => (
                    <div key={c.id} className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                      <div className="p-2 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                        <label className="flex items-center gap-2 cursor-pointer font-semibold">
                          <input type="checkbox" checked={selectedToolbarCats.includes(c.id)} onChange={() => toggleToolbarCatCheck(c.id)} className="accent-[#1e3a2b] w-3.5 h-3.5" />
                          <span>{c.title.replace(/^\d+\.\s*/, '')}</span>
                        </label>
                        <button type="button" onClick={() => toggleSettingsCatExpand(c.id)} className="px-2 py-0.5 rounded border border-slate-200 text-[10px] text-slate-600 hover:bg-slate-100 font-bold">{expandedSettingsCats.includes(c.id) ? '»' : '«'}</button>
                      </div>

                      {expandedSettingsCats.includes(c.id) && (
                        <div className="p-2 border-t border-slate-100 bg-slate-50/80 space-y-1.5 text-[11px]">
                          {c.reports && c.reports.map((r) => (
                            <label key={r.code} className="flex items-center gap-2 pl-4 py-1 hover:bg-white rounded cursor-pointer font-medium text-slate-700">
                              <input type="checkbox" checked={selectedToolbarReports.includes(r.code)} onChange={() => toggleToolbarReportCheck(r.code)} className="accent-[#1e3a2b] w-3 h-3" />
                              <span>{r.title}</span>
                            </label>
                          ))}
                          {c.subCategories && c.subCategories.map((s) => (
                            <div key={s.id} className="border border-slate-200/80 rounded-lg p-1.5 bg-white space-y-1">
                              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                                <input type="checkbox" checked={selectedToolbarSubCats.includes(s.id)} onChange={() => toggleToolbarSubCatCheck(s.id)} className="accent-[#1e3a2b] w-3.5 h-3.5" />
                                <span>📁 {s.title}</span>
                              </label>
                              <div className="pl-5 space-y-0.5 border-t border-slate-100 pt-1">
                                {s.reports.map((sr) => (
                                  <label key={sr.code} className="flex items-center gap-2 py-0.5 hover:bg-slate-50 rounded cursor-pointer text-slate-600 font-medium">
                                    <input type="checkbox" checked={selectedToolbarReports.includes(sr.code)} onChange={() => toggleToolbarReportCheck(sr.code)} className="accent-[#1e3a2b] w-3 h-3" />
                                    <span>{sr.title}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 bg-[#f8faf8] flex justify-end">
              <button type="button" onClick={() => setSettingsModalOpen(false)} className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. CUSTOM CATEGORY SUB-MODAL (TOP-LEVEL Z-INDEX: Z-100)             */}
      {/* =================================================================== */}
      {customCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 print:hidden animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-[#f8faf8]">
              <h2 className="text-base font-bold text-slate-900">Custom Category</h2>
              <button type="button" onClick={() => setCustomCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 rounded">✕</button>
            </div>
            <div className="p-5 space-y-4 text-xs text-slate-800">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Category Name</label>
                <div className="flex items-center gap-2">
                  <input type="text" value={customCategoryName} onChange={(e) => setCustomCategoryName(e.target.value)} placeholder="e.g. Daily Operations Summary" className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#1e3a2b]" />
                  <button type="button" onClick={() => { if (!customCategoryName.trim()) { alert('Please enter a Category Name'); return; } alert(`Custom Category "${customCategoryName}" saved!`); setCustomCategoryModalOpen(false); }} className="px-4 py-2 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-lg text-xs shadow-2xs">Save</button>
                </div>
              </div>

              <div>
                <div className="bg-white p-1.5 rounded-lg border border-slate-300 flex items-center gap-1.5">
                  <span className="text-slate-400">🔍</span>
                  <input type="text" value={customCategorySearch} onChange={(e) => setCustomCategorySearch(e.target.value)} placeholder="Search Report..." className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none" />
                </div>
                <div className="mt-2 max-h-52 overflow-y-auto custom-scrollbar border border-slate-200 rounded-lg p-2 space-y-1 bg-slate-50">
                  {allFlattenedReports.filter((r) => r.title.toLowerCase().includes(customCategorySearch.toLowerCase())).slice(0, 30).map((r) => (
                    <label key={r.code} className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer text-slate-700 bg-white/60 border border-slate-100">
                      <input type="checkbox" checked={customCategorySelectedReports.includes(r.code)} onChange={() => toggleCustomCategoryReport(r.code)} className="accent-[#1e3a2b] w-3.5 h-3.5" />
                      <span className="font-semibold text-slate-900">{r.title}</span>
                      <span className="text-[9px] text-slate-400 ml-auto truncate max-w-[100px]">{r.category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 bg-[#f8faf8] flex justify-end">
              <button type="button" onClick={() => setCustomCategoryModalOpen(false)} className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
