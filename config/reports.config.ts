/**
 * ============================================================================
 * VANGUARD ERP - MASTER REPORTS METADATA CONFIGURATION
 * Organization: Southern Olive Oil Products S.A.R.L
 * ============================================================================
 */

export interface ReportColumnConfig {
  key: string;
  header: string;
  widthPct: string; // e.g. '14%', '28%'
  align?: 'left' | 'center' | 'right';
  isMonospace?: boolean;
  isCurrency?: boolean;
}

export interface ReportFilterCapabilities {
  supportsModes?: boolean;
  modesList?: string[];
  enableBranch?: boolean;
  enableRep?: boolean;
  enableCustomer?: boolean;
  enableDivision?: boolean;
  enablePaymentMethod?: boolean;
  enableVoidReason?: boolean;
  checkboxes?: { id: string; label: string; defaultChecked: boolean }[];
}

export interface MasterReportSchema {
  id: string;
  code: string;
  title: string;
  category: string;
  subCategory?: string;
  filters: ReportFilterCapabilities;
  columns: ReportColumnConfig[];
  sampleRowsGenerator: () => any[];
}

export const MASTER_REPORTS_SCHEMAS: Record<string, MasterReportSchema> = {
  // 1. Summary of Voids (Internal Control)
  REP_IC_001: {
    id: 'ic_01',
    code: 'REP_IC_001',
    title: 'Summary of Voids',
    category: 'Internal Control',
    filters: {
      enableBranch: true,
      enableRep: true,
      enableVoidReason: true,
      checkboxes: [
        { id: 'auth_mgr', label: 'Show Authorizing Manager', defaultChecked: true },
        { id: 'high_val', label: 'High Value (> $50 Only)', defaultChecked: false },
      ],
    },
    columns: [
      { key: 'date', header: 'date & time', widthPct: '15%', align: 'left', isMonospace: true },
      { key: 'orderDate', header: 'order date', widthPct: '15%', align: 'left', isMonospace: true },
      { key: 'server', header: 'server', widthPct: '12%', align: 'left' },
      { key: 'invoice', header: 'invoice #', widthPct: '8%', align: 'center', isMonospace: true },
      { key: 'description', header: 'description', widthPct: '26%', align: 'left' },
      { key: 'qty', header: 'qty', widthPct: '6%', align: 'center', isMonospace: true },
      { key: 'value', header: 'value (LBP)', widthPct: '10%', align: 'right', isMonospace: true, isCurrency: true },
      { key: 'reason', header: 'reason', widthPct: '8%', align: 'left' },
    ],
    sampleRowsGenerator: () => [
      { date: '22-Aug-2026 5:31 PM', orderDate: '22-Aug-2026 5:31 PM', server: 'Hiba Aloulou', invoice: '103225', description: 'عرض العطاء جديد - زيت زيتون بكر 17.5L', qty: 1.0, value: 9000000.0, reason: 'تعداد خاطئ' },
      { date: '13-Aug-2026 6:58 PM', orderDate: '13-Aug-2026 6:58 PM', server: 'Hiba Aloulou', invoice: '103125', description: 'ألفية زيت زيتون خضير بلدي 1000 مل', qty: 1.0, value: 990000.0, reason: 'تعداد خاطئ' },
      { date: '13-Aug-2026 6:58 PM', orderDate: '13-Aug-2026 6:58 PM', server: 'Hiba Aloulou', invoice: '103125', description: 'حبوب اللقاح البلدية 360غ', qty: 1.0, value: 900000.0, reason: 'تعداد خاطئ' },
    ],
  },

  // 2. Sales by Invoices (Product Sales / Invoices)
  REP_S_00192: {
    id: 'prod_inv',
    code: 'REP_S_00192',
    title: 'Sales by Invoices',
    category: 'Product Sales',
    filters: {
      supportsModes: true,
      modesList: ['Detailed Invoices', 'Daily Summary', 'Payment Breakdown'],
      enableBranch: true,
      enableRep: true,
      enableCustomer: true,
      enablePaymentMethod: true,
      checkboxes: [{ id: 'show_vat', label: 'Show VAT Breakdown', defaultChecked: true }],
    },
    columns: [
      { key: 'invoice', header: 'invoice #', widthPct: '12%', align: 'left', isMonospace: true },
      { key: 'dateTime', header: 'date & time', widthPct: '16%', align: 'left', isMonospace: true },
      { key: 'branch', header: 'branch', widthPct: '14%', align: 'left' },
      { key: 'customer', header: 'customer / store', widthPct: '22%', align: 'left' },
      { key: 'rep', header: 'rep', widthPct: '10%', align: 'left' },
      { key: 'payment', header: 'payment', widthPct: '8%', align: 'center' },
      { key: 'subtotal', header: 'subtotal ($)', widthPct: '9%', align: 'right', isMonospace: true },
      { key: 'net', header: 'net total ($)', widthPct: '9%', align: 'right', isMonospace: true, isCurrency: true },
    ],
    sampleRowsGenerator: () => [
      { invoice: 'INV-2026-0891', dateTime: '2026-08-28 10:45 AM', branch: 'Choueifat Main', customer: 'Al-Baraka Supermarket S.A.R.L', rep: 'Ahmad', payment: 'WHISH', subtotal: 1450.0, net: 1400.0 },
      { invoice: 'INV-2026-0892', dateTime: '2026-08-28 11:15 AM', branch: 'Beirut Branch', customer: 'Al-Nour Food Establishment', rep: 'Hiba', payment: 'CASH', subtotal: 890.0, net: 890.0 },
      { invoice: 'INV-2026-0893', dateTime: '2026-08-29 02:30 PM', branch: 'Choueifat Main', customer: 'Al-Kheir Olive Center', rep: 'Hussein', payment: 'CREDIT', subtotal: 3100.0, net: 3000.0 },
    ],
  },

  // 3. Tax Summary Report (Financial)
  REP_F_201: {
    id: 'fin_08',
    code: 'REP_F_201',
    title: 'Tax Summary',
    category: 'Financial',
    filters: {
      enableBranch: true,
      checkboxes: [
        { id: 'comp_prev', label: 'Comparative with Previous Period', defaultChecked: true },
        { id: 'exempt_items', label: 'Show Tax-Exempt Items', defaultChecked: false },
      ],
    },
    columns: [
      { key: 'taxCategory', header: 'tax category / rate', widthPct: '25%', align: 'left' },
      { key: 'taxableGross', header: 'taxable gross ($)', widthPct: '20%', align: 'right', isMonospace: true },
      { key: 'exemptGross', header: 'exempt sales ($)', widthPct: '20%', align: 'right', isMonospace: true },
      { key: 'taxAmountUsd', header: 'tax collected ($)', widthPct: '15%', align: 'right', isMonospace: true },
      { key: 'taxAmountLbp', header: 'tax collected (LBP)', widthPct: '20%', align: 'right', isMonospace: true },
    ],
    sampleRowsGenerator: () => [
      { taxCategory: 'Standard Rate (11% VAT)', taxableGross: 14500.0, exemptGross: 0.0, taxAmountUsd: 1595.0, taxAmountLbp: 142752500 },
      { taxCategory: 'Zero Rated / Agricultural Preserves (0%)', taxableGross: 0.0, exemptGross: 32400.0, taxAmountUsd: 0.0, taxAmountLbp: 0 },
    ],
  },
};
