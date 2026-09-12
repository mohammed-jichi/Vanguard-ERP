// Vanguard ERP - Multi-Branch Master Registry & Reactive Data Engine
// Supports dynamic recalculation and aggregation across all ERP Dashboards

export interface BranchInfo {
  code: string;
  id: string;
  name: string; // شو
  nameAr: string;
  arabicName: string;
  facilityType: string; // طبيعة الفرع والنشاط
  facilityTypeAr: string;
  type: string;
  location: string; // وين (المدينة والمنطقة)
  locationAr: string;
  city: string;
  address: string;
  governorate: string;
  manager: string; // مين (اسم المدير المباشر)
  managerTitle: string;
  role: string;
  managerPhone: string;
  phone: string;
  managerEmail: string;
  email: string;
  operatingHours: string;
  status: 'active' | 'operational' | 'maintenance';
  statusLabel: string;
  sharePercent: number; // حصة الفرع من إجمالي المبيعات
  targetAttainment: number;

  // Financial / Sales KPIs (in LBP, converted to USD via 89,500)
  todayNetSales: number;
  todayReceipts: number;
  todayDiscounts: number;
  todayRefunds: number;
  grossSales: number;
  discount: number;
  tax: number;
  netSales: number;
  mtdSales: number;
  lymSales: number;
  ytdSales: number;
  lytmSales: number;
  customerAged: number;
  mtdReceipts: number;
  paidIn: number;
  paidOut: number;
  voids: number;
  refunds: number;
  avgInvoice: number;
  avgByCust: number;
  custCount: number;
  invCount: number;

  // Highlights
  bestMonth: string;
  bestMonthVal: string;
  softestMonth: string;
  softestMonthVal: string;
  topCategoryName: string;
  topCategoryShare: string;
  topCategoryAmount: string;
  topDivisionName: string;
  topDivisionShare: string;
  topDivisionAmount: string;

  // Monthly Revenue (12 months in LBP)
  monthlyBarData: Array<{ month: string; val: number; label: string; pct: string }>;

  // Slices & Breakdowns
  categoryData: Array<{ label: string; name: string; amount: number; color: string; pct: number }>;
  categorySalesData: Array<{ label: string; name: string; amount: number; color: string; pct: number }>;
  divisionData: Array<{ label: string; name: string; amount: number; color: string; pct: number }>;
  divisionSalesData: Array<{ label: string; name: string; amount: number; color: string; pct: number }>;
  groupData: Array<{ label: string; name: string; amount: number; color: string; pct: number }>;
  groupSalesData: Array<{ label: string; name: string; amount: number; color: string; pct: number }>;
  departmentData: Array<{ label: string; name: string; amount: number; color: string; pct: number }>;
  departmentSalesData: Array<{ label: string; name: string; amount: number; color: string; pct: number }>;
  discountSummaryData: Array<{ name: string; amount: number; color: string; pct: number }>;
  voidSummaryData: Array<{ reason: string; amount: number; count: number; color: string; pct: number }>;
  userSummaryData: Array<{ user: string; amount: number; color: string; pct: number }>;
  paymentSummaryData: Array<{ method: string; amount: number; color: string; pct: number }>;

  // Customers
  topCustomers: Array<{ name: string; orders: number; value: string; rawValue: number }>;

  // Operations / Inventory Metrics (in USD base)
  stockValueUsd: number;
  purchaseValueUsd: number;
  wastageValueUsd: number;
  varianceValueUsd: number;
  stockCategories: Array<{ category: string; amountUsd: number; qty: number }>;

  // Nested convenience accessors
  operations: {
    sales: number;
    purchase: number;
    lostGoods: number;
    variance: number;
    stockValue: number;
  };
  metrics: {
    todaySales: number;
    todayNetSales: number;
    todayReceipts: number;
    todayDiscounts: number;
    todayRefunds: number;
    grossSales: number;
    discount: number;
    tax: number;
    netSales: number;
    netSalesSummary: number;
    mtdSales: number;
    mtdRevenue: number;
    lymSales: number;
    ytdSales: number;
    ytdRevenue: number;
    customerAged: number;
    mtdReceipts: number;
    paidIn: number;
    paidOut: number;
    voids: number;
    refunds: number;
    avgInvoice: number;
    avgTicket: number;
    avgByCust: number;
    custCount: number;
    invCount: number;
    invoicesCount: number;
  };
}

const RAW_ERP_BRANCHES: Record<string, any> = {
  '00001': {
    code: '00001',
    id: '00001',
    name: 'Main Branch',
    arabicName: 'الفرع الرئيسي',
    facilityType: 'Central Operations & Main Facility',
    facilityTypeAr: 'المقر والفرع الرئيسي والعمليات المركزية',
    location: 'Choueifat Main Facility',
    locationAr: 'منشأة الشويفات الرئيسية',
    address: 'Choueifat Main Facility, Lebanon',
    governorate: 'Headquarters',
    manager: 'General Management',
    managerTitle: 'Operations Director',
    managerPhone: '+961 1 000 000',
    managerEmail: 'operations@vanguard-erp.com',
    operatingHours: 'Regular Hours',
    status: 'operational',
    statusLabel: 'Active & Operational',
    sharePercent: 100.0,

    todayNetSales: 21500000,
    todayReceipts: 21500000,
    todayDiscounts: 0,
    todayRefunds: 0,
    grossSales: 605000000,
    discount: 20000000,
    tax: 0,
    netSales: 585000000,
    mtdSales: 585000000,
    lymSales: 490000000,
    ytdSales: 5350000000,
    lytmSales: 4800000000,
    customerAged: -47000000,
    mtdReceipts: 585000000,
    paidIn: 2500000,
    paidOut: -18000000,
    voids: 0,
    refunds: 0,
    avgInvoice: 12187500,
    avgByCust: 12187500,
    custCount: 48,
    invCount: 48,

    bestMonth: 'January',
    bestMonthVal: '1.4 B LL',
    softestMonth: 'May',
    softestMonthVal: '86.7 M LL',
    topCategoryName: 'Retail Olive Oil',
    topCategoryShare: '42.4%',
    topCategoryAmount: '248.0 M LL',
    topDivisionName: 'Promotions & Bulk',
    topDivisionShare: '39.8%',
    topDivisionAmount: '232.8 M LL',

    monthlyBarData: [
      { month: 'January', val: 1397219593, label: '1.4B', pct: '+100.0%' },
      { month: 'February', val: 945493174, label: '945M', pct: '+100.0%' },
      { month: 'March', val: 149734710, label: '150M', pct: '+100.0%' },
      { month: 'April', val: 291532297, label: '292M', pct: '+100.0%' },
      { month: 'May', val: 86665522, label: '87M', pct: '+100.0%' },
      { month: 'June', val: 298280587, label: '298M', pct: '+100.0%' },
      { month: 'July', val: 802940092, label: '803M', pct: '+100.0%' },
      { month: 'August', val: 838671750, label: '839M', pct: '+100.0%' },
      { month: 'September', val: 585000000, label: '585M', pct: '+100.0%' },
      { month: 'October', val: 0, label: '0', pct: '0.0%' },
      { month: 'November', val: 0, label: '0', pct: '0.0%' },
      { month: 'December', val: 0, label: '0', pct: '0.0%' },
    ],

    categoryData: [
      { label: 'Raw Materials', name: 'Raw Materials', amount: 0, color: '#2e7d32', pct: 0.00 },
      { label: 'Wholesale', name: 'Wholesale', amount: 104039000, color: '#1976d2', pct: 17.79 },
      { label: 'Promotions', name: 'Promotions', amount: 232842500, color: '#f59e0b', pct: 39.80 },
      { label: 'Retail', name: 'Retail', amount: 248118500, color: '#d32f2f', pct: 42.41 },
    ],
    divisionData: [
      { label: 'Plastic', name: 'Plastic', amount: 0, color: '#2e7d32', pct: 0 },
      { label: 'Promotions', name: 'Promotions', amount: 232842500, color: '#f59e0b', pct: 39.80 },
      { label: 'Kg Retail', name: 'Kg Retail', amount: 9704850, color: '#7c3aed', pct: 1.66 },
      { label: 'Jams Wholesale', name: 'Jams Wholesale', amount: 75559500, color: '#b45309', pct: 12.91 },
      { label: 'Jams Retail', name: 'Jams Retail', amount: 978750, color: '#991b1b', pct: 0.17 },
      { label: 'Jar', name: 'Jar', amount: 14811750, color: '#1976d2', pct: 2.53 },
      { label: 'Local Mooneh Retail', name: 'Local Mooneh Retail', amount: 11582750, color: '#84cc16', pct: 1.98 },
    ],
    groupData: [
      { label: 'Jar 509', name: 'Jar 509', amount: 9722250, color: '#2e7d32', pct: 1.66 },
      { label: 'Khoudeir Olive Oil Retail', name: 'Khoudeir Olive Oil Retail', amount: 40716000, color: '#7c3aed', pct: 6.96 },
      { label: 'Virgin Olive Oil', name: 'Virgin Olive Oil Retail', amount: 170159000, color: '#0f766e', pct: 29.09 },
      { label: 'Bottles B', name: 'Bottles B', amount: 0, color: '#ec4899', pct: 0.00 },
      { label: 'Jar 507', name: 'Jar 507', amount: 0, color: '#1e3a8a', pct: 0.00 },
    ],
    departmentData: [
      { label: 'MAIN DEPARTMENT', name: 'MAIN DEPARTMENT', amount: 397800000, color: '#1976d2', pct: 68.0 },
      { label: 'Showroom', name: 'Showroom', amount: 128700000, color: '#0f766e', pct: 22.0 },
      { label: 'Direct Delivery', name: 'Direct Delivery', amount: 58500000, color: '#b45309', pct: 10.0 },
    ],
    discountSummaryData: [
      { name: 'AMOUNT DISCOUNT', amount: 13000000, color: '#1e3a8a', pct: 65.0 },
      { name: 'PERCENTAGE DISCOUNT', amount: 7000000, color: '#4c1d95', pct: 35.0 },
    ],
    voidSummaryData: [
      { reason: 'Price Correction', amount: 540000, count: 3, color: '#854d0e', pct: 50.0 },
      { reason: 'Customer Cancellation', amount: 324000, count: 2, color: '#4c1d95', pct: 30.0 },
      { reason: 'Cashier Error', amount: 216000, count: 1, color: '#475569', pct: 20.0 },
    ],
    userSummaryData: [
      { user: 'Hiba Aloulou (Head Cashier)', amount: 175500000, color: '#4c1d95', pct: 30.0 },
      { user: 'Mahdi (Showroom Rep)', amount: 146250000, color: '#1e3a8a', pct: 25.0 },
      { user: 'Cashier N2 (Factory Desk)', amount: 134550000, color: '#0f766e', pct: 23.0 },
      { user: 'Nour Yazbeck (Customer Service)', amount: 128700000, color: '#475569', pct: 22.0 },
    ],
    paymentSummaryData: [
      { method: 'CASH LBP', amount: 409500000, color: '#0f766e', pct: 70.0 },
      { method: 'CASH USD', amount: 146250000, color: '#1e3a8a', pct: 25.0 },
      { method: 'Credit Card', amount: 29250000, color: '#4c1d95', pct: 5.0 },
    ],
    topCustomers: [
      { name: 'مطعم وريزورت شمس الجنوب (VIP Wholesale)', orders: 24, value: 'LBP 195,000,000', rawValue: 195000000 },
      { name: 'شركة البركة للمواد الغذائية والكونسروة', orders: 12, value: 'LBP 140,000,000', rawValue: 140000000 },
      { name: 'مؤسسة الجنوب لتجارة الزيت والتموين', orders: 9, value: 'LBP 95,000,000', rawValue: 95000000 },
      { name: 'سوبرماركت الهناء - فرع بيروت الكبرى', orders: 8, value: 'LBP 78,000,000', rawValue: 78000000 },
      { name: 'مكسرات ومونة أبو حمزه (بيروت)', orders: 6, value: 'LBP 42,000,000', rawValue: 42000000 },
    ],

    stockValueUsd: 184500,
    purchaseValueUsd: 88200,
    wastageValueUsd: 1850,
    varianceValueUsd: -420,
    stockCategories: [
      { category: 'Extra Virgin Olive Oil (EVOO Bulk)', amountUsd: 84000, qty: 1950 },
      { category: 'Virgin Olive Oil (VOO Bottled)', amountUsd: 46500, qty: 1420 },
      { category: 'Pomace & Refined Olive Oil', amountUsd: 18000, qty: 650 },
      { category: 'Table Olives & Pickled Specialties', amountUsd: 19500, qty: 1400 },
      { category: 'Pure Olive Soaps & Cosmetics', amountUsd: 16500, qty: 3200 },
    ]
  },
};

// COMPREHENSIVE MAIN BRANCH CONSOLIDATED PROFILE
const RAW_ALL_BRANCHES_CONSOLIDATED: any = {
  code: '00001',
  id: '00001',
  name: 'Main Branch',
  arabicName: 'الفرع الرئيسي',
  facilityType: 'Central Operations & Main Facility',
  facilityTypeAr: 'المقر والفرع الرئيسي والعمليات المركزية',
  location: 'Choueifat Main Facility',
  locationAr: 'منشأة الشويفات الرئيسية',
  address: 'Choueifat Main Facility, Lebanon',
  governorate: 'Headquarters',
  manager: 'General Operations',
  managerTitle: 'Operations Director',
  managerPhone: '+961 1 000 000',
  managerEmail: 'operations@vanguard-erp.com',
  operatingHours: 'Regular Hours',
  status: 'operational',
  statusLabel: 'Active & Operational',
  sharePercent: 100.0,

  todayNetSales: 46100000,
  todayReceipts: 46100000,
  todayDiscounts: 0,
  todayRefunds: 0,
  grossSales: 1345518000,
  discount: 45000000,
  tax: 0,
  netSales: 1300000000,
  mtdSales: 1300000000,
  lymSales: 1095000000,
  ytdSales: 11895000000,
  lytmSales: 10480000000,
  customerAged: -104500000,
  mtdReceipts: 1300000000,
  paidIn: 5250000,
  paidOut: -40200000,
  voids: 0,
  refunds: 0,
  avgInvoice: 9027777,
  avgByCust: 9027777,
  custCount: 144,
  invCount: 144,

  bestMonth: 'January',
  bestMonthVal: '3.1 B LL',
  softestMonth: 'May',
  softestMonthVal: '192.6 M LL',
  topCategoryName: 'Retail Olive Oil',
  topCategoryShare: '42.4%',
  topCategoryAmount: '551.3 M LL',
  topDivisionName: 'Promotions & Retail Chains',
  topDivisionShare: '39.8%',
  topDivisionAmount: '517.4 M LL',

  monthlyBarData: [
    { month: 'January', val: 3104932430, label: '3.1B', pct: '+100.0%' },
    { month: 'February', val: 2101095942, label: '2.1B', pct: '+100.0%' },
    { month: 'March', val: 332743800, label: '333M', pct: '+100.0%' },
    { month: 'April', val: 647849550, label: '648M', pct: '+100.0%' },
    { month: 'May', val: 192590050, label: '193M', pct: '+100.0%' },
    { month: 'June', val: 662845750, label: '663M', pct: '+100.0%' },
    { month: 'July', val: 1784311315, label: '1.8B', pct: '+100.0%' },
    { month: 'August', val: 1863715000, label: '1.9B', pct: '+100.0%' },
    { month: 'September', val: 1300000000, label: '1.3B', pct: '+100.0%' },
    { month: 'October', val: 0, label: '0', pct: '0.0%' },
    { month: 'November', val: 0, label: '0', pct: '0.0%' },
    { month: 'December', val: 0, label: '0', pct: '0.0%' },
  ],

  categoryData: [
    { label: 'Raw Materials', name: 'Raw Materials', amount: 0, color: '#2e7d32', pct: 0.00 },
    { label: 'Wholesale', name: 'Wholesale', amount: 231264000, color: '#1976d2', pct: 17.79 },
    { label: 'Promotions', name: 'Promotions', amount: 517400000, color: '#f59e0b', pct: 39.80 },
    { label: 'Retail', name: 'Retail', amount: 551336000, color: '#d32f2f', pct: 42.41 },
  ],
  divisionData: [
    { label: 'Plastic', name: 'Plastic', amount: 0, color: '#2e7d32', pct: 0 },
    { label: 'Promotions', name: 'Promotions', amount: 517400000, color: '#f59e0b', pct: 39.80 },
    { label: 'Kg Retail', name: 'Kg Retail', amount: 21580000, color: '#7c3aed', pct: 1.66 },
    { label: 'Jams Wholesale', name: 'Jams Wholesale', amount: 167830000, color: '#b45309', pct: 12.91 },
    { label: 'Jams Retail', name: 'Jams Retail', amount: 2210000, color: '#991b1b', pct: 0.17 },
    { label: 'Jar', name: 'Jar', amount: 32890000, color: '#1976d2', pct: 2.53 },
    { label: 'Local Mooneh Retail', name: 'Local Mooneh Retail', amount: 25740000, color: '#84cc16', pct: 1.98 },
  ],
  groupData: [
    { label: 'Jar 509', name: 'Jar 509', amount: 21580000, color: '#2e7d32', pct: 1.66 },
    { label: 'Khoudeir Olive Oil Retail', name: 'Khoudeir Olive Oil Retail', amount: 90480000, color: '#7c3aed', pct: 6.96 },
    { label: 'Virgin Olive Oil', name: 'Virgin Olive Oil Retail', amount: 378170000, color: '#0f766e', pct: 29.09 },
    { label: 'Bottles B', name: 'Bottles B', amount: 0, color: '#ec4899', pct: 0.00 },
    { label: 'Jar 507', name: 'Jar 507', amount: 0, color: '#1e3a8a', pct: 0.00 },
  ],
  departmentData: [
    { label: 'MAIN DEPARTMENT', name: 'MAIN DEPARTMENT', amount: 884000000, color: '#1976d2', pct: 68.0 },
    { label: 'Showroom & Retail Hubs', name: 'Showroom & Retail Hubs', amount: 286000000, color: '#0f766e', pct: 22.0 },
    { label: 'Direct Fleets Delivery', name: 'Direct Fleets Delivery', amount: 130000000, color: '#b45309', pct: 10.0 },
  ],
  discountSummaryData: [
    { name: 'AMOUNT DISCOUNT', amount: 29250000, color: '#1e3a8a', pct: 65.0 },
    { name: 'PERCENTAGE DISCOUNT', amount: 15750000, color: '#4c1d95', pct: 35.0 },
  ],
  voidSummaryData: [
    { reason: 'Price Correction', amount: 1200000, count: 6, color: '#854d0e', pct: 50.0 },
    { reason: 'Customer Cancellation', amount: 720000, count: 4, color: '#4c1d95', pct: 30.0 },
    { reason: 'Cashier Error', amount: 480000, count: 2, color: '#475569', pct: 20.0 },
  ],
  userSummaryData: [
    { user: 'Hiba Aloulou (Choueifat)', amount: 390000000, color: '#4c1d95', pct: 30.0 },
    { user: 'Ziad Al-Amin (Beirut Lead)', amount: 325000000, color: '#1e3a8a', pct: 25.0 },
    { user: 'Salim Kassir (Saida Lead)', amount: 299000000, color: '#0f766e', pct: 23.0 },
    { user: 'Karim Daher (Tyre HORECA)', amount: 286000000, color: '#475569', pct: 22.0 },
  ],
  paymentSummaryData: [
    { method: 'CASH LBP', amount: 910000000, color: '#0f766e', pct: 70.0 },
    { method: 'CASH USD', amount: 325000000, color: '#1e3a8a', pct: 25.0 },
    { method: 'Credit Card', amount: 65000000, color: '#4c1d95', pct: 5.0 },
  ],
  topCustomers: [
    { name: 'مطعم وريزورت شمس الجنوب (VIP Wholesale)', orders: 42, value: 'LBP 1,450,000,000', rawValue: 1450000000 },
    { name: 'سوبرماركت الهناء - فروع بيروت وجبل لبنان', orders: 38, value: 'LBP 1,120,000,000', rawValue: 1120000000 },
    { name: 'شركة البركة للمواد الغذائية والتوزيع', orders: 29, value: 'LBP 980,000,000', rawValue: 980000000 },
    { name: 'مؤسسة الجنوب لتجارة الزيت والتموين', orders: 24, value: 'LBP 850,000,000', rawValue: 850000000 },
    { name: 'فندق واستراحة صور الدولية (HORECA)', orders: 18, value: 'LBP 540,000,000', rawValue: 540000000 },
    { name: 'محل الزهراء للمواد التموينية (بيروت)', orders: 15, value: 'LBP 490,000,000', rawValue: 490000000 },
  ],

  stockValueUsd: 432100,
  purchaseValueUsd: 180700,
  wastageValueUsd: 3920,
  varianceValueUsd: -1150,
  stockCategories: [
    { category: 'Extra Virgin Olive Oil (EVOO Bulk & Tanks)', amountUsd: 184500, qty: 4280 },
    { category: 'Virgin Olive Oil (VOO Bottled & Tins)', amountUsd: 96200, qty: 2950 },
    { category: 'Pomace & Refined Olive Oil', amountUsd: 38400, qty: 1400 },
    { category: 'Table Olives & Pickled Specialties', amountUsd: 42800, qty: 3120 },
    { category: 'Pure Olive Oil Soaps & Cosmetics', amountUsd: 28900, qty: 5600 },
    { category: 'Packaging Materials & Glass Bottles', amountUsd: 41300, qty: 18500 },
  ]
};

function enrichBranch(b: any): BranchInfo {
  const operations = {
    sales: Math.round(b.netSales / 89500),
    purchase: b.purchaseValueUsd,
    lostGoods: b.wastageValueUsd,
    variance: b.varianceValueUsd,
    stockValue: b.stockValueUsd,
  };
  const metrics = {
    todaySales: b.todayNetSales,
    todayNetSales: b.todayNetSales,
    todayReceipts: b.todayReceipts,
    todayDiscounts: b.todayDiscounts,
    todayRefunds: b.todayRefunds,
    grossSales: b.grossSales,
    discount: b.discount,
    tax: b.tax,
    netSales: b.netSales,
    netSalesSummary: b.netSales,
    mtdSales: b.mtdSales,
    mtdRevenue: b.mtdSales,
    lymSales: b.lymSales,
    ytdSales: b.ytdSales,
    ytdRevenue: b.ytdSales,
    customerAged: b.customerAged,
    mtdReceipts: b.mtdReceipts,
    paidIn: b.paidIn,
    paidOut: b.paidOut,
    voids: b.voids,
    refunds: b.refunds,
    avgInvoice: b.avgInvoice,
    avgTicket: b.avgInvoice,
    avgByCust: b.avgByCust,
    custCount: b.custCount,
    invCount: b.invCount,
    invoicesCount: b.invCount,
  };

  return {
    ...b,
    nameAr: b.arabicName,
    type: b.facilityType,
    city: b.location,
    role: b.managerTitle,
    phone: b.managerPhone,
    email: b.managerEmail,
    targetAttainment: b.targetAttainment || (b.id === '00001' ? 94.2 : b.id === '00002' ? 88.5 : b.id === '00003' ? 82.1 : b.id === '00004' ? 79.4 : b.id === '00005' ? 86.7 : b.id === '00006' ? 74.3 : 84.5),
    categorySalesData: b.categoryData,
    divisionSalesData: b.divisionData,
    groupSalesData: b.groupData,
    departmentSalesData: b.departmentData,
    operations,
    metrics,
  };
}

export const ERP_BRANCHES: Record<string, BranchInfo> = Object.fromEntries(
  Object.entries(RAW_ERP_BRANCHES).map(([k, v]) => [k, enrichBranch(v)])
);

export const ALL_BRANCHES_CONSOLIDATED: BranchInfo = enrichBranch(RAW_ALL_BRANCHES_CONSOLIDATED);

// Helper function to resolve branch data by any ID or Code
export function getBranchData(branchKey?: string): BranchInfo {
  const main = ERP_BRANCHES['00001'] || ALL_BRANCHES_CONSOLIDATED;
  if (!branchKey || branchKey === 'ALL' || branchKey === 'All Branches' || branchKey === '0') {
    return ALL_BRANCHES_CONSOLIDATED;
  }
  const cleanKey = branchKey.trim();
  if (ERP_BRANCHES[cleanKey]) return ERP_BRANCHES[cleanKey];

  return main;
}

export function getAllBranchesList(): BranchInfo[] {
  return Object.values(ERP_BRANCHES);
}
