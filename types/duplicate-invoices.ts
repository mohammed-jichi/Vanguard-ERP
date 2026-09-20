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
    employeeSelector?: boolean;
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
    activeFilters: { period: true, branch: true, salesmanSelector: true, invoiceType: true },
    checkboxes: {},
    standardColumns: [
      { key: 'invoice_number', label: 'Invoice Number', colorCondition: 'negative_red' },
      { key: 'date', label: 'Date' },
      { key: 'customer', label: 'Customer' },
      { key: 'salesman', label: 'Salesman / Rep' },
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
    groupBy: ['branch', 'employee_name', 'payment_type', 'sale_date'],
    activeFilters: { period: true, branch: true, invoiceType: true, employeeSelector: true, paymentType: true },
    checkboxes: { realDate: true, showRate: true },
    standardColumns: [
      { key: 'invoice_number', label: 'Invoice#', colorCondition: 'negative_red' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'employee_name', label: 'Employee / Cashier Name' },
      { key: 'pay_type', label: 'Payment Type' },
      { key: 'amount', label: 'Amount', align: 'right', isCurrency: true, colorCondition: 'negative_red' },
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

  transactions_by_customers_by_employee: {
    id: 'transactions_by_customers_by_employee',
    title: 'Transactions by Customers by Employee',
    omegaReportCode: 'REP_S_00427',
    groupBy: ['branch', 'customer_name', 'employee_name', 'sale_date'],
    activeFilters: { period: true, branch: true, customerSearch: true, employeeSelector: true, invoiceType: true },
    checkboxes: { showRate: true, realDate: true },
    standardColumns: [
      { key: 'invoice_number', label: 'Invoice#', colorCondition: 'negative_red' },
      { key: 'date', label: 'Date' },
      { key: 'customer_name', label: 'Customer Name & ID' },
      { key: 'employee_name', label: 'Employee Name' },
      { key: 'amount', label: 'Amount', align: 'right', isCurrency: true, colorCondition: 'negative_red' },
      { key: 'discount', label: 'Discount', align: 'right', isCurrency: true },
      { key: 'tax', label: 'Tax', align: 'right', isCurrency: true },
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

  transactions_by_invoice_number: {
    id: 'transactions_by_invoice_number',
    title: 'Transactions by Invoice Number',
    groupBy: ['branch'],
    activeFilters: { branch: true, invoiceRange: true, invoiceType: true },
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
    activeFilters: { period: true, branch: true, serverSelector: true, invoiceType: true },
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
  const raw = input.trim();
  const lower = raw.toLowerCase();
  const clean = lower.replace(/[\s-]+/g, '_').replace(/&/g, 'and');
  
  if (clean in DUPLICATE_INVOICES_REGISTRY) {
    return clean as SubReportMode;
  }

  // Explicit mapping for Customers by Employee variations & codes
  if (
    clean === 'transactions_by_customers_by_employee' ||
    clean === 'transactions_by_customer_by_employee' ||
    lower.includes('by customers by employee') ||
    lower.includes('by customer by employee') ||
    lower.includes('customers & serving employee') ||
    lower.includes('customers and serving employee') ||
    raw === 'REP_S_00272' ||
    raw === 'REP_S_00427'
  ) {
    return 'transactions_by_customers_by_employee';
  }

  // Explicit mapping for Employees by Payment variations & codes
  if (
    clean === 'transactions_by_employees_by_payment' ||
    clean === 'transactions_by_employee_by_payment' ||
    lower.includes('by employees by payment') ||
    lower.includes('by employee by payment') ||
    lower.includes('employee & payment tender') ||
    lower.includes('employee and payment tender') ||
    raw === 'REP_S_00250' ||
    raw === 'REP_S_00426'
  ) {
    return 'transactions_by_employees_by_payment';
  }

  // Explicit mapping for Date by Payments
  if (
    clean === 'transactions_by_date_by_payments' ||
    clean === 'transactions_by_date_by_payment' ||
    lower.includes('by date by payment') ||
    raw === 'REP_S_00275'
  ) {
    return 'transactions_by_date_by_payments';
  }

  // Explicit mapping for Customers by Groups
  if (
    clean === 'transactions_by_customers_by_groups' ||
    clean === 'transactions_by_customer_by_groups' ||
    lower.includes('by customers by groups') ||
    raw === 'REP_S_00277'
  ) {
    return 'transactions_by_customers_by_groups';
  }

  // Explicit mapping for Customers details
  if (
    clean === 'transactions_by_customers_details' ||
    clean === 'transactions_by_customer_details' ||
    lower.includes('by customers details') ||
    raw === 'REP_S_00278'
  ) {
    return 'transactions_by_customers_details';
  }

  // Explicit mapping for Transactions by Customers
  if (
    clean === 'transactions_by_customers' ||
    clean === 'transactions_by_customer' ||
    lower === 'transactions by customers' ||
    raw === 'REP_S_00276'
  ) {
    return 'transactions_by_customers';
  }

  // Explicit mapping for Transactions by Salesman
  if (
    clean === 'transactions_by_salesman' ||
    lower.includes('by salesman') ||
    raw === 'REP_S_00249'
  ) {
    return 'transactions_by_salesman';
  }

  // Explicit mapping for Transactions by Date
  if (
    clean === 'transactions_by_date' ||
    lower.includes('by date & time') ||
    (lower.includes('by date') && !lower.includes('payment')) ||
    raw === 'REP_S_00247'
  ) {
    return 'transactions_by_date';
  }

  // Explicit mapping for Transactions by Invoice Number
  if (
    clean === 'transactions_by_invoice_number' ||
    lower.includes('by invoice number') ||
    raw === 'REP_S_00273'
  ) {
    return 'transactions_by_invoice_number';
  }

  // Explicit mapping for Transactions by Workstation
  if (
    clean === 'transactions_by_workstation' ||
    lower.includes('by workstation') ||
    raw === 'REP_S_00279'
  ) {
    return 'transactions_by_workstation';
  }

  // Explicit mapping for Transactions by Employees
  if (
    clean === 'transactions_by_employees' ||
    (lower.includes('by employees') && !lower.includes('payment')) ||
    raw === 'REP_S_00286'
  ) {
    return 'transactions_by_employees';
  }

  // Explicit mapping for Transactions by Source
  if (
    clean === 'transactions_by_source' ||
    lower.includes('by source') ||
    raw === 'REP_S_00287'
  ) {
    return 'transactions_by_source';
  }

  // Lookup by title
  const found = Object.values(DUPLICATE_INVOICES_REGISTRY).find(
    (cfg) => cfg.title.toLowerCase() === lower
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
