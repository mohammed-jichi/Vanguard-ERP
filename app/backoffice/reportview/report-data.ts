// ============================================================================
// COMPLETE 93-REPORT CATALOG & DYNAMIC TEMPORAL ENGINE
// SOUTHERN OLIVE OIL PRODUCTS S.A.R.L (TENANT: 00001)
// ============================================================================

export interface ReportItem {
  code: string;
  title: string;
}

export interface SubCategory {
  id: string;
  title: string;
  reports: ReportItem[];
}

export interface MasterCategory {
  id: string;
  title: string;
  icon: string;
  reports?: ReportItem[];
  subCategories?: SubCategory[];
}

export const branchesList = [
  { id: '001', code: 'BR_001', name: '001 - Choueifat Main Facility', region: 'Mount Lebanon' },
  { id: '002', code: 'BR_002', name: '002 - Beirut Distribution Hub', region: 'Beirut' },
  { id: '003', code: 'BR_003', name: '003 - Saida Southern Center', region: 'South Lebanon' },
  { id: '004', code: 'BR_004', name: '004 - Zahle Bekaa Branch', region: 'Bekaa' },
  { id: '005', code: 'BR_005', name: '005 - Tripoli North Depot', region: 'North Lebanon' },
  { id: '006', code: 'BR_006', name: '006 - Nabatieh Center', region: 'South Lebanon' },
];

export function getEodDateOptions() {
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
}

export function getDynamicPeriodInfo(periodPreset: string, fromDate: string, toDate: string, eodDate: string) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
      return { chip: todayStr, fromDate: todayStr, toDate: todayStr, header: `From Date: ${todayStr} To Date: ${todayStr}` };
    case 'YESTERDAY':
      return { chip: yesterdayStr, fromDate: yesterdayStr, toDate: yesterdayStr, header: `From Date: ${yesterdayStr} To Date: ${yesterdayStr}` };
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
      return { chip: thisMonthChip, fromDate: '01-Aug-2026', toDate: '31-Aug-2026', header: `From Date: 01-Aug-2026 To Date: 31-Aug-2026` };
  }
}

export const masterCatalog: MasterCategory[] = [
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

export function getAllFlattenedReports() {
  const list: { code: string; title: string; category: string }[] = [];
  masterCatalog.forEach((c) => {
    if (c.reports) c.reports.forEach((r) => list.push({ ...r, category: c.title }));
    if (c.subCategories) {
      c.subCategories.forEach((s) => s.reports.forEach((sr) => list.push({ ...sr, category: `${c.title} - ${s.title}` })));
    }
  });
  return list;
}
