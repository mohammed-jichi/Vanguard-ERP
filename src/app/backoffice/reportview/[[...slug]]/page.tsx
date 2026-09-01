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

  // Rolling EOD Generator
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

  // Invoice Criteria Multi-Filter
  const invoiceCriteriaList = [
    'Show refund',
    'Show zero invoices',
    'Show discount',
    'Show top 10 invoices by amount',
    'Show zero tax',
  ];
  const [selectedInvoiceCriteria, setSelectedInvoiceCriteria] = useState<string[]>([]);
  const [invoicesCriteriaDropdownOpen, setInvoicesCriteriaDropdownOpen] = useState(false);

  const toggleInvoiceCriteria = (crit: string) => {
    if (selectedInvoiceCriteria.includes(crit)) {
      setSelectedInvoiceCriteria(selectedInvoiceCriteria.filter((c) => c !== crit));
    } else {
      setSelectedInvoiceCriteria([...selectedInvoiceCriteria, crit]);
    }
  };

  // Departments Multi-Filter
  const departmentsList = [
    { code: 'LOCAL', label: 'Local' },
    { code: 'INTERNATIONAL', label: 'International' },
    { code: 'ONLINE', label: 'Online' },
  ];
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(['ALL']);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);

  const toggleDepartmentSelection = (code: string) => {
    if (code === 'ALL') {
      setSelectedDepartments(['ALL']);
    } else {
      let updated = selectedDepartments.filter((d) => d !== 'ALL');
      if (updated.includes(code)) {
        updated = updated.filter((d) => d !== code);
        if (updated.length === 0) updated = ['ALL'];
      } else {
        updated.push(code);
      }
      setSelectedDepartments(updated);
    }
  };

  const getDepartmentsDisplayLabel = () => {
    if (selectedDepartments.includes('ALL') || selectedDepartments.length === 0) {
      return 'Show all departments';
    }
    if (selectedDepartments.length === 1) {
      const found = departmentsList.find((d) => d.code === selectedDepartments[0]);
      return found ? found.label : selectedDepartments[0];
    }
    return `${selectedDepartments.length} Departments Selected`;
  };

  // Invoice Number Range Filter
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
        return { chip: todayStr, fromDate: todayStr, toDate: todayStr, header: `${todayStr} (Today)` };
      case 'YESTERDAY':
        return { chip: yesterdayStr, fromDate: yesterdayStr, toDate: yesterdayStr, header: `${yesterdayStr} (Yesterday)` };
      case 'THIS_MONTH':
        return {
          chip: thisMonthChip,
          fromDate: `01-${monthNames[currentMonthIdx]}-${currentYear}`,
          toDate: `${pad(daysInThisMonth)}-${monthNames[currentMonthIdx]}-${currentYear}`,
          header: `From Date: 01-${monthNames[currentMonthIdx]}-${currentYear} To Date: ${pad(daysInThisMonth)}-${monthNames[currentMonthIdx]}-${currentYear}`,
        };
      case 'LAST_MONTH':
        return {
          chip: lastMonthChip,
          fromDate: `01-${monthNames[lastMonthDate.getMonth()]}-${lastMonthDate.getFullYear()}`,
          toDate: `${pad(daysInLastMonth)}-${monthNames[lastMonthDate.getMonth()]}-${lastMonthDate.getFullYear()}`,
          header: `From Date: 01-${monthNames[lastMonthDate.getMonth()]}-${lastMonthDate.getFullYear()} To Date: ${pad(daysInLastMonth)}-${monthNames[lastMonthDate.getMonth()]}-${lastMonthDate.getFullYear()}`,
        };
      case 'Q1':
        return { chip: `Q1, ${currentYear}`, fromDate: `01-Jan-${currentYear}`, toDate: `31-Mar-${currentYear}`, header: `From Date: 01-Jan-${currentYear} To Date: 31-Mar-${currentYear}` };
      case 'Q2':
        return { chip: `Q2, ${currentYear}`, fromDate: `01-Apr-${currentYear}`, toDate: `30-Jun-${currentYear}`, header: `From Date: 01-Apr-${currentYear} To Date: 30-Jun-${currentYear}` };
      case 'Q3':
        return { chip: `Q3, ${currentYear}`, fromDate: `01-Jul-${currentYear}`, toDate: `30-Sep-${currentYear}`, header: `From Date: 01-Jul-${currentYear} To Date: 30-Sep-${currentYear}` };
      case 'Q4':
        return { chip: `Q4, ${currentYear}`, fromDate: `01-Oct-${currentYear}`, toDate: `31-Dec-${currentYear}`, header: `From Date: 01-Oct-${currentYear} To Date: 31-Dec-${currentYear}` };
      case 'THIS_YEAR':
        return { chip: `Year ${currentYear}`, fromDate: `01-Jan-${currentYear}`, toDate: todayStr, header: `From Date: 01-Jan-${currentYear} To Date: ${todayStr}` };
      case 'LAST_YEAR':
        return { chip: `Year ${currentYear - 1}`, fromDate: `01-Jan-${currentYear - 1}`, toDate: `31-Dec-${currentYear - 1}`, header: `From Date: 01-Jan-${currentYear - 1} To Date: 31-Dec-${currentYear - 1}` };
      case 'DATE_RANGE':
        return { chip: `${fromDate} ➔ ${toDate}`, fromDate: fromDate, toDate: toDate, header: `From Date: ${fromDate} To Date: ${toDate}` };
      case 'EOD_DATE':
        return { chip: eodDate, fromDate: eodDate, toDate: eodDate, header: `EOD Date: ${eodDate}` };
      default:
        return { chip: thisMonthChip, fromDate: '01-Sep-2026', toDate: '30-Sep-2026', header: thisMonthChip };
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
      {/* 2. DYNAMIC CONTEXT-AWARE FILTER RIBBON                              */}
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
               ['Duplicate Invoices', 'Transactions by date', 'Transactions by employees by payment', 'Transactions by date by payments', 'Transactions by customers', 'Transactions by customers by groups', 'Transactions by customers details', 'Transactions by workstation', 'Transactions by salesman', 'Transactions By Source'].includes(transactionSubType))) && (
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

            {/* E. ALL PAYMENT TYPES */}
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

            {/* F. MULTI-SELECT INVOICES CRITERIA "FILTERS" (EXCLUSIVE TO Transactions by date) */}
            {activeReport.code === 'REP_IC_003' && transactionSubType === 'Transactions by date' && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setInvoicesCriteriaDropdownOpen(!invoicesCriteriaDropdownOpen)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-xs text-slate-800 flex items-center justify-between gap-1.5 min-w-[120px]"
                >
                  <span>{selectedInvoiceCriteria.length === 0 ? 'Filters' : `Filters (${selectedInvoiceCriteria.length})`}</span>
                  <span className="text-[9px] text-slate-500">▼</span>
                </button>

                {invoicesCriteriaDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-64 bg-white border border-slate-300 rounded-xl shadow-xl py-1 text-xs text-slate-800 z-50 animate-fadeIn">
                    <div className="px-3 py-1 border-b border-slate-100 font-bold text-[10.5px] text-slate-400 uppercase">
                      Invoice Multi-Criteria Filters
                    </div>
                    <div className="py-1">
                      {invoiceCriteriaList.map((crit) => (
                        <label key={crit} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer text-slate-700 font-medium">
                          <input
                            type="checkbox"
                            checked={selectedInvoiceCriteria.includes(crit)}
                            onChange={() => toggleInvoiceCriteria(crit)}
                            className="accent-[#1e3a2b] w-3.5 h-3.5"
                          />
                          <span>{crit}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* G. MULTI-SELECT DEPARTMENTS */}
            {activeReport.code === 'REP_IC_003' && ['Transactions by date', 'Transactions By Source'].includes(transactionSubType) && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDeptDropdownOpen(!deptDropdownOpen)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-xs text-slate-800 flex items-center justify-between gap-1.5 min-w-[140px]"
                >
                  <span>{getDepartmentsDisplayLabel()}</span>
                  <span className="text-[9px] text-slate-500">▼</span>
                </button>

                {deptDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-56 bg-white border border-slate-300 rounded-xl shadow-xl py-1 text-xs text-slate-800 z-50 animate-fadeIn">
                    <div className="px-3 py-1 border-b border-slate-100 font-bold text-[10.5px] text-slate-400 uppercase">
                      Select Department(s)
                    </div>
                    <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 cursor-pointer font-bold border-b border-slate-100">
                      <input
                        type="checkbox"
                        checked={selectedDepartments.includes('ALL')}
                        onChange={() => toggleDepartmentSelection('ALL')}
                        className="accent-[#1e3a2b]"
                      />
                      <span>Show all departments</span>
                    </label>
                    <div className="py-1">
                      {departmentsList.map((d) => (
                        <label key={d.code} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={selectedDepartments.includes(d.code)}
                            onChange={() => toggleDepartmentSelection(d.code)}
                            className="accent-[#1e3a2b]"
                          />
                          <span>{d.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* H. CUSTOMER SEARCH & VAT NUMBER */}
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

            {/* I. SERVERS SELECTOR & GROUPED BY SERVER */}
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

            {/* J. DYNAMIC CHECKBOX FLAGS */}
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
                setPaymentTypeFilter('ALL');
                setSelectedInvoiceCriteria([]);
                setSelectedDepartments(['ALL']);
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
                  <button type="button" onClick={() => { alert('Exporting as Excel'); setExportDropdownOpen(false); }} className="w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center gap-2"><span>📊</span> <div><div className="font-bold">Export as Excel (.xlsx / .csv)</div></div></button>
                  <button type="button" onClick={() => { alert('Exporting as CSV'); setExportDropdownOpen(false); }} className="w-full text-left px-3.5 py-2 hover:bg-slate-100 flex items-center gap-2"><span>📑</span> <div><div className="font-bold">Export as CSV (.csv)</div></div></button>
                </div>
              )}
            </div>

            <button type="button" onClick={() => setSettingsModalOpen(true)} className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300" title="Settings">⚙️</button>
          </div>

        </div>

      </div>

      {/* 3. WORKSPACE: 93-REPORTS TREE + AUTHENTIC ISOLATED A4 PRINT CONTAINER */}
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
            
            {/* =============================================================== */}
            {/* REPORT 1: SUMMARY OF VOIDS (REP_IC_001)                          */}
            {/* =============================================================== */}
            {activeReport.code === 'REP_IC_001' && (
              <div className="space-y-4">
                <div className="text-center font-bold text-base text-slate-900">Summary of voids</div>
                <div className="text-right text-[10.5px] font-mono text-slate-700 -mt-3">Prepared By: Mohammed Jichi</div>

                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>01-Sep-26</span>
                  <span>{dynamicPeriodInfo.header}</span>
                  <span>Page 1 of 1</span>
                </div>

                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-black font-bold text-black leading-tight">
                      <th className="py-1.5 px-1 normal-case w-[14%]">Date</th>
                      <th className="py-1.5 px-1 normal-case w-[14%]">Order Date</th>
                      <th className="py-1.5 px-1 normal-case w-[12%]">Server</th>
                      <th className="py-1.5 px-1 normal-case w-[10%]">Invoice</th>
                      <th className="py-1.5 px-1 normal-case w-[26%]">Description</th>
                      <th className="py-1.5 px-1 normal-case w-[6%] text-center">QTY</th>
                      <th className="py-1.5 px-1 normal-case w-[10%] text-right">Value</th>
                      <th className="py-1.5 px-1 normal-case w-[8%]">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr>
                      <td colSpan={8} className="py-1.5 px-1 font-bold underline text-slate-900 bg-slate-50/50">
                        Branch: Southern Olive Oil Products S.A.R.L - Choueifat
                      </td>
                    </tr>
                    <tr className="align-top leading-normal">
                      <td className="py-1 px-1 font-mono text-[10px]">22-Aug-2026 5:31 PM</td>
                      <td className="py-1 px-1 font-mono text-[10px]">22-Aug-2026 5:31 PM</td>
                      <td className="py-1 px-1">Hiba Aloulou</td>
                      <td className="py-1 px-1 font-mono font-bold">103225</td>
                      <td className="py-1 px-1 font-bold">عرض العطاء جديد - زيت زيتون 17.5L</td>
                      <td className="py-1 px-1 text-center font-mono">1.00</td>
                      <td className="py-1 px-1 text-right font-mono font-bold">9,000,000.00</td>
                      <td className="py-1 px-1 text-[10px]">تعداد خاطئ</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* =============================================================== */}
            {/* REPORT 2: DETAILS & SUMMARY OF REFUNDS (REP_IC_002)              */}
            {/* =============================================================== */}
            {activeReport.code === 'REP_IC_002' && (
              <div className="space-y-6">
                <div className="text-center font-bold text-base text-slate-900">Details of refunds</div>
                
                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>01-Sep-26</span>
                  <span>{dynamicPeriodInfo.header}</span>
                  <span>Page 1 of 3</span>
                </div>

                {/* Discrete Invoice Block 1 */}
                <div className="space-y-2 border-b border-slate-200 pb-4">
                  <div className="flex justify-between items-start text-[11px] font-mono">
                    <div className="space-y-0.5">
                      <div><strong className="underline">Branch Name:</strong> Southern Olive Oil Products - Choueifat</div>
                      <div><strong>EOD Date:</strong> 11-08-2026</div>
                      <div><strong>Invoice Number:</strong> 103098</div>
                    </div>
                    <div><strong>Customer:</strong> null null</div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between font-bold border-b border-slate-300 pb-1 text-xs">
                      <span>QTY Description</span>
                      <span>Total Price</span>
                    </div>
                    <div className="flex justify-between py-1 text-xs font-mono font-bold text-red-700">
                      <span>-0.90 كزبرة ناعم كيلو</span>
                      <span>-630,000.00</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <div className="w-56 text-[11px] font-mono space-y-0.5">
                      <div className="flex justify-between"><span>Sub Total:</span> <strong className="text-red-700">-630,000.00</strong></div>
                      <div className="flex justify-between text-slate-500"><span>Discount:</span> <span>0.00</span></div>
                      <div className="flex justify-between text-slate-500"><span>Tax:</span> <span>0.00</span></div>
                      <div className="flex justify-between text-slate-500"><span>Service:</span> <span>0.00</span></div>
                      <div className="flex justify-between border-t border-black pt-0.5 font-bold"><span>Grand Total:</span> <strong className="text-red-700">-630,000.00</strong></div>
                    </div>
                  </div>
                </div>

                {/* Final Closing Footer */}
                <div className="pt-6 border-t-2 border-black flex justify-between items-end">
                  <div className="text-[10.5px] font-mono text-slate-600">
                    <div>Printed: 01-Sep-26</div>
                    <div>{dynamicPeriodInfo.header}</div>
                  </div>
                  <div className="w-64 text-xs font-mono space-y-1 bg-slate-50 p-2.5 rounded border border-slate-200">
                    <div className="flex justify-between"><span>Consolidated Sub Total:</span> <strong className="text-red-700">-990,000.00 LBP</strong></div>
                    <div className="flex justify-between border-t border-black pt-1 font-bold text-sm"><span>Grand Total Refunds:</span> <strong className="text-red-700">-990,000.00 LBP</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* REPORT 4: METER REPORT (REP_IC_004)                              */}
            {/* =============================================================== */}
            {activeReport.code === 'REP_IC_004' && (
              <div className="space-y-4">
                <div className="text-center font-bold text-base text-slate-900">Meter Report</div>

                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>01-Sep-2026</span>
                  <span>{dynamicPeriodInfo.header}</span>
                  <span>Page 1 of 1</span>
                </div>

                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-black font-bold text-black leading-tight">
                      <th className="py-1.5 px-1 normal-case w-[28%]">Branch Name</th>
                      <th className="py-1.5 px-1 normal-case w-[28%]">Date</th>
                      <th className="py-1.5 px-1 normal-case w-[22%]">By Employee</th>
                      <th className="py-1.5 px-1 normal-case w-[22%]">To Employee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
                    <tr><td colSpan={4} className="py-1 font-bold underline bg-slate-50">Branch: Southern Olive Oil Products</td></tr>
                    <tr><td colSpan={4} className="py-1 font-bold text-slate-700 pl-2">EOD Date: 17-Dec-2025</td></tr>
                    <tr>
                      <td className="py-0.5 px-1">Choueifat Facility</td>
                      <td className="py-0.5 px-1 font-mono">17-12-2025 00.00.00</td>
                      <td className="py-0.5 px-1">Mahdi</td>
                      <td className="py-0.5 px-1 font-semibold">Server Mahdi</td>
                    </tr>
                    <tr><td colSpan={4} className="py-1 font-bold text-slate-700 pl-2 pt-2">EOD Date: 18-Dec-2025</td></tr>
                    <tr>
                      <td className="py-0.5 px-1">Choueifat Facility</td>
                      <td className="py-0.5 px-1 font-mono">18-12-2025 00.00.00</td>
                      <td className="py-0.5 px-1">Mahdi</td>
                      <td className="py-0.5 px-1 font-semibold">Main Reading</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* =============================================================== */}
            {/* REPORT 5: NO SALE REPORT (REP_IC_005)                            */}
            {/* =============================================================== */}
            {activeReport.code === 'REP_IC_005' && (
              <div className="space-y-4">
                <div className="text-center font-bold text-base text-slate-900">No Sale Report</div>

                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>01-Sep-26</span>
                  <span>{dynamicPeriodInfo.header}</span>
                  <span>Page 1 of 1</span>
                </div>

                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-black font-bold text-black leading-tight">
                      <th className="py-1.5 px-1 normal-case w-[40%]">Employee Name</th>
                      <th className="py-1.5 px-1 normal-case w-[35%]">Date</th>
                      <th className="py-1.5 px-1 normal-case w-[25%] text-right">Workstation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
                    <tr><td colSpan={3} className="py-1 font-bold underline bg-slate-50">Branch Name: Southern Olive Oil Products</td></tr>
                    <tr><td colSpan={3} className="py-1 font-bold text-slate-700 pl-4">EOD Date: 01-Jan-26</td></tr>
                    <tr>
                      <td className="py-1 px-1 font-semibold">Ricky</td>
                      <td className="py-1 px-1 font-mono">01/01/2026 6.23 PM</td>
                      <td className="py-1 px-1 text-right font-mono font-bold">1</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1 font-semibold">Cashier R</td>
                      <td className="py-1 px-1 font-mono">01/01/2026 4.00 PM</td>
                      <td className="py-1 px-1 text-right font-mono font-bold">1</td>
                    </tr>
                    <tr><td colSpan={3} className="py-1 font-bold text-slate-700 pl-4 pt-2">EOD Date: 24-Feb-26</td></tr>
                    <tr>
                      <td className="py-1 px-1 font-semibold">Cashier N2</td>
                      <td className="py-1 px-1 font-mono">24/02/2026 1.15 PM</td>
                      <td className="py-1 px-1 text-right font-mono font-bold">1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* =============================================================== */}
            {/* REPORT 6: TRANSACTIONS ON HOLD (REP_IC_006)                      */}
            {/* =============================================================== */}
            {activeReport.code === 'REP_IC_006' && (
              <div className="space-y-4">
                <div className="text-center font-bold text-base text-slate-900">History of Transactions on Hold</div>

                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>01-Sep-26</span>
                  <span>{dynamicPeriodInfo.header}</span>
                  <span>Page 1 of 2</span>
                </div>

                <div className="border-b border-slate-300 pb-2 text-[11px] font-mono space-y-1">
                  <div><strong>Workstation :</strong> 1 Showroom 1</div>
                  <div className="font-bold pt-1">14 December 2025</div>
                  <div className="flex gap-6 text-slate-700">
                    <span><strong>Employee ID :</strong> 2</span>
                    <span><strong>Employee Name:</strong> Cashier R</span>
                  </div>
                </div>

                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-black font-bold text-black leading-tight">
                      <th className="py-1.5 px-1 normal-case w-[24%]">Date</th>
                      <th className="py-1.5 px-1 normal-case w-[40%]">Qty Description</th>
                      <th className="py-1.5 px-1 normal-case w-[18%] text-right">Unit Price</th>
                      <th className="py-1.5 px-1 normal-case w-[18%] text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[10.5px] font-mono">
                    <tr>
                      <td className="py-1 px-1">14/12/2025 13.39.32</td>
                      <td className="py-1 px-1 font-bold">1.0 حليب تاترا 400 غ</td>
                      <td className="py-1 px-1 text-right">340000.0</td>
                      <td className="py-1 px-1 text-right font-bold">340000.0</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1">14/12/2025 13.39.32</td>
                      <td className="py-1 px-1 font-bold">1.0 أرز مصري عريض</td>
                      <td className="py-1 px-1 text-right">120000.0</td>
                      <td className="py-1 px-1 text-right font-bold">120000.0</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1">14/12/2025 13.39.32</td>
                      <td className="py-1 px-1 font-bold text-red-700">-1.0 حمص فحل مكسيكي</td>
                      <td className="py-1 px-1 text-right">200000.0</td>
                      <td className="py-1 px-1 text-right font-bold text-red-700">-200000.0</td>
                    </tr>
                  </tbody>
                </table>

                <div className="border-t border-black pt-2 flex justify-end font-mono font-bold text-xs">
                  <span>Amount : 1,435,000.0 LBP</span>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* REPORT 7: USER LOG REPORT (REP_IC_007)                           */}
            {/* =============================================================== */}
            {activeReport.code === 'REP_IC_007' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start text-xs font-bold">
                  <span>Southern Olive Oil Products</span>
                  <span className="text-base">User Log Report</span>
                  <span></span>
                </div>

                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>01-Sep-2026</span>
                  <span>{dynamicPeriodInfo.header}</span>
                  <span>Page 1 of 29</span>
                </div>

                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-black font-bold text-black leading-tight">
                      <th className="py-1.5 px-1 normal-case w-[18%]">User</th>
                      <th className="py-1.5 px-1 normal-case w-[16%]">Date</th>
                      <th className="py-1.5 px-1 normal-case w-[16%]">Module</th>
                      <th className="py-1.5 px-1 normal-case w-[28%]">Action</th>
                      <th className="py-1.5 px-1 normal-case w-[12%]">Computer Name</th>
                      <th className="py-1.5 px-1 normal-case w-[10%] text-right">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
                    <tr><td colSpan={6} className="py-1 font-bold underline bg-slate-50">Branch : Southern Olive Oil Products</td></tr>
                    <tr><td colSpan={6} className="py-1 font-bold text-slate-800 pl-2">Module : Adjustment</td></tr>
                    <tr>
                      <td className="py-0.5 px-1 font-bold">Mohammed Jichi</td>
                      <td className="py-0.5 px-1 font-mono">01-Aug-2026</td>
                      <td className="py-0.5 px-1">Adjustment</td>
                      <td className="py-0.5 px-1 text-emerald-800 font-bold">Save & Post</td>
                      <td className="py-0.5 px-1 font-mono">POS-DESK-01</td>
                      <td className="py-0.5 px-1 text-right font-mono font-bold">41</td>
                    </tr>
                    <tr><td colSpan={6} className="py-1 font-bold text-slate-800 pl-2 pt-2">Module : Inventory Ing</td></tr>
                    <tr>
                      <td className="py-0.5 px-1 font-bold">Mohammed Jichi</td>
                      <td className="py-0.5 px-1 font-mono">22-Aug-2026</td>
                      <td className="py-0.5 px-1">Inventory Ing</td>
                      <td className="py-0.5 px-1">UPDATE Fixed Offer</td>
                      <td className="py-0.5 px-1 font-mono">POS-DESK-01</td>
                      <td className="py-0.5 px-1 text-right font-mono font-bold">40</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* =============================================================== */}
            {/* REPORT 8: DISCOUNT SUMMARY (REP_IC_008)                          */}
            {/* =============================================================== */}
            {activeReport.code === 'REP_IC_008' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start text-xs font-bold">
                  <span className="text-blue-800">Southern Olive Oil Products</span>
                  <span className="text-base text-slate-900">Discount Summary</span>
                  <span></span>
                </div>

                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>01-Sep-2026</span>
                  <span>{dynamicPeriodInfo.header}</span>
                  <span>Page 1 of 1</span>
                </div>

                <div className="max-w-md">
                  <table className="w-full table-fixed text-left border border-black border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-black font-bold bg-slate-100">
                        <th className="py-1.5 px-2 border-r border-black w-[55%]"></th>
                        <th className="py-1.5 px-2 text-right font-bold w-[45%]">Total Discount</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-xs divide-y divide-black">
                      <tr>
                        <td className="py-1.5 px-2 border-r border-black font-bold font-sans">Southern Olive Oil Products</td>
                        <td className="py-1.5 px-2 text-right font-bold">104,813,558.18</td>
                      </tr>
                      <tr className="bg-blue-100/70 font-bold">
                        <td className="py-1.5 px-2 border-r border-black font-sans">Total</td>
                        <td className="py-1.5 px-2 text-right">104,813,558.18</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* REPORT 3 / FALLBACK: GENERAL MATRIX VIEW                         */}
            {/* =============================================================== */}
            {activeReport.code === 'REP_IC_003' && (
              <div className="space-y-4">
                <div className="text-center font-bold text-base text-slate-900">{transactionSubType}</div>

                <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 text-slate-800">
                  <span>01-Sep-2026</span>
                  <span>{dynamicPeriodInfo.header}</span>
                  <span>Page 1 of 1</span>
                </div>

                <table className="w-full table-fixed text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-black bg-slate-100 font-bold text-black leading-tight">
                      <th className="py-1.5 px-1 normal-case w-[15%]">Invoice #</th>
                      <th className="py-1.5 px-1 normal-case w-[15%]">Date</th>
                      <th className="py-1.5 px-1 normal-case w-[28%]">Customer / Account</th>
                      <th className="py-1.5 px-1 normal-case w-[18%]">Payment Method</th>
                      <th className="py-1.5 px-1 normal-case w-[12%] text-center">Items Qty</th>
                      <th className="py-1.5 px-1 normal-case w-[12%] text-right">Total ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
                    <tr>
                      <td className="py-1.5 px-1 font-mono font-bold">INV-103120</td>
                      <td className="py-1.5 px-1 font-mono">01-Sep-2026</td>
                      <td className="py-1.5 px-1 font-bold">Al-Baraka Supermarket S.A.R.L</td>
                      <td className="py-1.5 px-1 font-semibold">Cash USD</td>
                      <td className="py-1.5 px-1 text-center font-mono">12</td>
                      <td className="py-1.5 px-1 text-right font-mono font-bold text-[#1e3a2b]">$1,400.00</td>
                    </tr>
                  </tbody>
                </table>
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

      {/* 4. SETTINGS MODAL */}
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

      {/* 5. CUSTOM CATEGORY SUB-MODAL */}
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
