// types/duplicate-invoices.ts

export type SubReportMode =
  | 'transactions_by_salesman'
  | 'transactions_by_date'
  | 'transactions_by_employees_by_payment'
  | 'transactions_by_customers_by_employee'
  | 'transactions_by_invoice_number'
  | 'duplicate_invoices'
  | 'transactions_by_date_by_payments'
  | 'transactions_by_customers'
  | 'transactions_by_customers_by_groups'
  | 'transactions_by_customers_details'
  | 'transactions_by_workstation'
  | 'transactions_by_employees'
  | 'transactions_by_source';

export interface ReportColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  isCurrency?: boolean;
  colorCondition?: 'negative_red';
}

export interface ReportConfig {
  id: SubReportMode;
  title: string;
  omegaReportCode?: string;
  groupBy: string[];
  activeFilters: {
    period?: boolean;
    branch: boolean;
    invoiceType?: boolean;
    paymentType?: boolean;
    departmentSelect?: boolean;
    salesmanSelector?: boolean;
    serverSelector?: boolean;
    customerSearch?: boolean;
    invoiceRange?: boolean;
    vatSelector?: boolean;
    auditFilters?: boolean;
  };
  checkboxes: {
    showRate?: boolean;
    groupDate?: boolean;
    realDate?: boolean;
    summary?: boolean;
    groupedByServer?: boolean;
    showZeroTax?: boolean;
  };
  standardColumns: ReportColumn[];
  dynamicColumns?: {
    onShowRate?: ReportColumn[];
  };
  hasKpiFooter: boolean;
}

export const DUPLICATE_INVOICES_REGISTRY: Record<SubReportMode, ReportConfig> = {
  transactions_by_salesman: {
    id: 'transactions_by_salesman',
    title: 'Transactions by Salesman',
    groupBy: ['branch', 'employee'],
    activeFilters: { period: true, branch: true, salesmanSelector: true },
    checkboxes: {},
    standardColumns: [
      { key: 'invoice_number', label: 'Invoice Number', colorCondition: 'negative_red' },
      { key: 'date', label: 'Date' },
      { key: 'customer', label: 'Customer' },
      { key: 'amount', label: 'Amount', align: 'right', isCurrency: true, colorCondition: 'negative_red' },
      { key: 'discount', label: 'Discount', align: 'right', isCurrency: true },
      { key: 'tax', label: 'Tax', align: 'right', isCurrency: true },
      { key: 'total_price', label: 'Total Price', align: 'right', isCurrency: true, colorCondition: 'negative_red' },
    ],
    hasKpiFooter: true,
  },

  transactions_by_date: {
    id: 'transactions_by_date',
    title: 'Transactions by Date',
    groupBy: ['branch', 'date'],
    activeFilters: {
      period: true,
      branch: true,
      invoiceType: true,
      paymentType: true,
      auditFilters: true, // Show Refund, Zero Invoices, Discount, Top 10, Zero Tax
      departmentSelect: true,
    },
    checkboxes: { showRate: true, groupDate: true },
    standardColumns: [
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'invoice_number', label: 'Invoice #', colorCondition: 'negative_red' },
      { key: 'cust_id', label: 'Cust_ID' },
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'order_number', label: 'Order #' },
      { key: 'print_count', label: 'Print#' },
      { key: 'subtotal', label: 'SubTotal', align: 'right', isCurrency: true, colorCondition: 'negative_red' },
      { key: 'discount', label: 'Discount', align: 'right', isCurrency: true },
      { key: 'tax', label: 'Tax', align: 'right', isCurrency: true },
      { key: 'pay_type', label: 'Pay Type' },
      { key: 'total', label: 'Total', align: 'right', isCurrency: true, colorCondition: 'negative_red' },
    ],
    dynamicColumns: {
      onShowRate: [
        { key: 'currency', label: 'Currency', align: 'center' },
        { key: 'rate', label: 'Rate', align: 'right', isCurrency: true },
      ],
    },
    hasKpiFooter: true,
  },

  transactions_by_employees_by_payment: {
    id: 'transactions_by_employees_by_payment',
    title: 'Transactions by Employees by Payment',
    groupBy: ['branch', 'sale_date', 'employee_name', 'payment_type'],
    activeFilters: { period: true, branch: true, invoiceType: true },
    checkboxes: { realDate: true },
    standardColumns: [
      { key: 'invoice_number', label: 'Invoice#', colorCondition: 'negative_red' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'table_number', label: 'Table#' },
      { key: 'amount', label: 'Amount', align: 'right', isCurrency: true, colorCondition: 'negative_red' },
    ],
    hasKpiFooter: false,
  },

  transactions_by_customers_by_employee: {
    id: 'transactions_by_customers_by_employee',
    title: 'Transactions by Customers by Employee',
    omegaReportCode: 'REP_S_00427',
    groupBy: ['branch', 'sale_date', 'employee_name', 'customer_name'],
    activeFilters: { period: true, branch: true },
    checkboxes: {},
    standardColumns: [
      { key: 'invoice_number', label: 'Invoice#', colorCondition: 'negative_red' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'table_number', label: 'Table#' },
      { key: 'cust_count', label: 'Cust#' },
      { key: 'amount', label: 'Amount', align: 'right', isCurrency: true, colorCondition: 'negative_red' },
      { key: 'discount', label: 'Discount', align: 'right', isCurrency: true },
      { key: 'service', label: 'Service', align: 'right', isCurrency: true },
      { key: 'tax', label: 'Tax', align: 'right', isCurrency: true },
      { key: 'pay_type', label: 'Pay type' },
      { key: 'total', label: 'Total', align: 'right', isCurrency: true, colorCondition: 'negative_red' },
      { key: 'print_count', label: 'Print#' },
    ],
    hasKpiFooter: true,
  },

  transactions_by_invoice_number: {
    id: 'transactions_by_invoice_number',
    title: 'Transactions by Invoice Number',
    groupBy: ['branch'],
    activeFilters: { branch: true, invoiceRange: true },
    checkboxes: { showZeroTax: true },
    standardColumns: [
      { key: 'invoice_number', label: 'Invoice #' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'order_number', label: 'Order #' },
      { key: 'subtotal', label: 'SubTotal', align: 'right', isCurrency: true },
      { key: 'discount', label: 'Discount', align: 'right', isCurrency: true },
      { key: 'tax', label: 'Tax', align: 'right', isCurrency: true },
      { key: 'pay_type', label: 'Pay Type' },
      { key: 'total', label: 'Total', align: 'right', isCurrency: true },
    ],
    hasKpiFooter: true,
  },

  duplicate_invoices: {
    id: 'duplicate_invoices',
    title: 'Duplicate Invoices',
    groupBy: ['branch', 'sale_date'],
    activeFilters: { period: true, branch: true, invoiceType: true },
    checkboxes: { showRate: true },
    standardColumns: [
      { key: 'invoice_number', label: 'Invoice #' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'order_number', label: 'Order #' },
      { key: 'cust_count', label: 'Cust. #' },
      { key: 'amount', label: 'Amount', align: 'right', isCurrency: true },
      { key: 'discount', label: 'Discount', align: 'right', isCurrency: true },
      { key: 'tax', label: 'Tax', align: 'right', isCurrency: true },
      { key: 'pay_type', label: 'Pay Type' },
      { key: 'total', label: 'Total', align: 'right', isCurrency: true },
      { key: 'print_count', label: 'TotalPrint#' },
    ],
    dynamicColumns: {
      onShowRate: [{ key: 'rate', label: 'Rate', align: 'right', isCurrency: true }],
    },
    hasKpiFooter: true,
  },

  transactions_by_date_by_payments: {
    id: 'transactions_by_date_by_payments',
    title: 'Transactions by Date by Payments',
    groupBy: ['branch', 'sale_date', 'payment_type'],
    activeFilters: { period: true, branch: true, invoiceType: true, paymentType: true },
    checkboxes: { summary: true },
    standardColumns: [
      { key: 'invoice_number', label: 'Invoice #' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'order_number', label: 'Order #' },
      { key: 'total', label: 'Total', align: 'right', isCurrency: true, colorCondition: 'negative_red' },
      { key: 'print_count', label: 'Print #' },
    ],
    hasKpiFooter: false,
  },

  transactions_by_customers: {
    id: 'transactions_by_customers',
    title: 'Transactions by Customers',
    omegaReportCode: 'REP_S_00130',
    groupBy: ['branch', 'customer_name', 'sale_date'],
    activeFilters: { period: true, branch: true, invoiceType: true, customerSearch: true, vatSelector: true },
    checkboxes: {},
    standardColumns: [
      { key: 'invoice_number', label: 'Invoice #', colorCondition: 'negative_red' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'order_number', label: 'Order #' },
      { key: 'print_count', label: 'Print #' },
      { key: 'subtotal', label: 'Subtotal', align: 'right', isCurrency: true, colorCondition: 'negative_red' },
      { key: 'discount', label: 'Discount', align: 'right', isCurrency: true },
      { key: 'tax', label: 'Tax', align: 'right', isCurrency: true },
      { key: 'pay_type', label: 'PayType' },
      { key: 'total', label: 'Total', align: 'right', isCurrency: true, colorCondition: 'negative_red' },
    ],
    hasKpiFooter: true,
  },

  transactions_by_customers_by_groups: {
    id: 'transactions_by_customers_by_groups',
    title: 'Transactions by Customers by Groups',
    groupBy: ['branch', 'group_name'],
    activeFilters: { period: true, branch: true, invoiceType: true },
    checkboxes: {},
    standardColumns: [
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'total_amount', label: 'Total Amount', align: 'right', isCurrency: true },
    ],
    hasKpiFooter: false,
  },

  transactions_by_customers_details: {
    id: 'transactions_by_customers_details',
    title: 'Transactions by Customers details',
    omegaReportCode: 'REP_S_00130_D',
    groupBy: ['branch', 'customer_name', 'sale_date'],
    activeFilters: { period: true, branch: true, invoiceType: true, customerSearch: true },
    checkboxes: { summary: true },
    standardColumns: [
      { key: 'invoice_number', label: 'Invoice' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'order_number', label: 'Order #' },
      { key: 'employee_name', label: 'Emplyee Name' },
      { key: 'discount', label: 'Disc', align: 'right', isCurrency: true },
      { key: 'tax', label: 'Tax', align: 'right', isCurrency: true },
      { key: 'total', label: 'Total', align: 'right', isCurrency: true },
      { key: 'items', label: 'Item Name', align: 'left' },
    ],
    hasKpiFooter: true,
  },

  transactions_by_workstation: {
    id: 'transactions_by_workstation',
    title: 'Transactions by Workstation',
    omegaReportCode: 'REP_S_00246',
    groupBy: ['branch', 'sale_date', 'workstation_id'],
    activeFilters: { period: true, branch: true, invoiceType: true },
    checkboxes: { realDate: true },
    standardColumns: [
      { key: 'invoice_number', label: 'Invoice#', colorCondition: 'negative_red' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'order_number', label: 'Order #' },
      { key: 'cust_count', label: 'Cust #' },
      { key: 'amount', label: 'Amount', align: 'right', isCurrency: true, colorCondition: 'negative_red' },
      { key: 'discount', label: 'Disc', align: 'right', isCurrency: true },
      { key: 'tax', label: 'Tax', align: 'right', isCurrency: true },
      { key: 'pay_type', label: 'Pay Type' },
      { key: 'total', label: 'Total', align: 'right', isCurrency: true, colorCondition: 'negative_red' },
      { key: 'print_count', label: 'Print#' },
    ],
    hasKpiFooter: true,
  },

  transactions_by_employees: {
    id: 'transactions_by_employees',
    title: 'Transactions by Employees',
    groupBy: ['branch', 'server_name'],
    activeFilters: { period: true, branch: true, serverSelector: true },
    checkboxes: { groupedByServer: true, realDate: true },
    standardColumns: [
      { key: 'invoice_number', label: 'Invoice#', colorCondition: 'negative_red' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'customer_id', label: 'Customer ID' },
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'amount', label: 'Amount', align: 'right', isCurrency: true, colorCondition: 'negative_red' },
      { key: 'discount', label: 'Disc.', align: 'right', isCurrency: true },
      { key: 'tax', label: 'Tax', align: 'right', isCurrency: true },
      { key: 'total', label: 'Total', align: 'right', isCurrency: true, colorCondition: 'negative_red' },
      { key: 'print_count', label: 'Print#' },
    ],
    hasKpiFooter: true,
  },

  transactions_by_source: {
    id: 'transactions_by_source',
    title: 'Transactions By Source',
    groupBy: ['branch', 'source_name'],
    activeFilters: {
      period: true,
      branch: true,
      invoiceType: true,
      paymentType: true,
      departmentSelect: true,
    },
    checkboxes: { groupDate: true },
    standardColumns: [
      { key: 'invoice_number', label: 'Invoice #' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'order_number', label: 'Order #' },
      { key: 'subtotal', label: 'Subtotal', align: 'right', isCurrency: true },
      { key: 'discount', label: 'Discount', align: 'right', isCurrency: true },
      { key: 'tax', label: 'Tax', align: 'right', isCurrency: true },
      { key: 'pay_type', label: 'Pay Type' },
      { key: 'total', label: 'Total', align: 'right', isCurrency: true },
      { key: 'print_count', label: 'Print #' },
    ],
    hasKpiFooter: true,
  },
};

/**
 * Normalizes any string representation (slug, id, title) to SubReportMode
 */
export function normalizeSubReportMode(input?: string): SubReportMode {
  if (!input) return 'duplicate_invoices';
  const clean = input.trim().toLowerCase().replace(/[\s-]+/g, '_');
  
  if (clean in DUPLICATE_INVOICES_REGISTRY) {
    return clean as SubReportMode;
  }

  // Lookup by title
  const found = Object.values(DUPLICATE_INVOICES_REGISTRY).find(
    (cfg) => cfg.title.toLowerCase() === input.trim().toLowerCase()
  );
  if (found) {
    return found.id;
  }

  return 'duplicate_invoices';
}

/**
 * Retrieve report configuration by mode ID or title
 */
export function getDuplicateInvoiceConfig(modeOrTitle?: string): ReportConfig {
  const modeKey = normalizeSubReportMode(modeOrTitle);
  return DUPLICATE_INVOICES_REGISTRY[modeKey];
}
