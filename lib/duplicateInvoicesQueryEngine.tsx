// lib/duplicateInvoicesQueryEngine.ts

import React from 'react';
import {
  SubReportMode,
  ReportConfig,
  ReportColumn as SchemaColumn,
  DUPLICATE_INVOICES_REGISTRY,
  normalizeSubReportMode,
  getDuplicateInvoiceConfig,
} from '@/types/duplicate-invoices';
import { ReportColumn as MasterDocColumn, GrandTotal } from '@/types/reports';
import { getPaymentMethodTextClass } from '@/components/reports/reportContrastTokens';
import {
  convertCurrency,
  formatCurrencyAmount,
  extractCurrencyFromFilter,
  getExchangeRateForDisplay,
  SUPPORTED_CURRENCIES,
} from '@/lib/currencyEngine';
import {
  SALESMAN_MAPPINGS,
  matchesSalesmanFilter,
} from '@/lib/reportFilterEngine';
import { matchesEmployeeFilter } from '@/lib/salesmanEmployeeEngine';
import { matchesTenderFilter } from '@/lib/tenderPaymentEngine';
import { matchesCustomerFilter } from '@/lib/customerDirectoryEngine';
import { getDefaultInitialDateRange } from '@/lib/dateRangeEngine';

export { SALESMAN_MAPPINGS, matchesSalesmanFilter, matchesEmployeeFilter, matchesTenderFilter, matchesCustomerFilter };

export interface GeneratedQuery {
  mode: SubReportMode;
  reportTitle: string;
  omegaReportCode?: string;
  sql: string;
  whereClause: string;
  groupByClause: string;
  orderByClause: string;
  parameters: Record<string, any>;
  description: string;
}

/**
 * 1. AUTOMATIC SQL QUERY GENERATOR BASED ON DUPLICATE_INVOICES_REGISTRY SCHEMA
 */
export function generateDuplicateInvoiceQuery(
  modeOrTitle: string,
  filterValues: Record<string, any> = {}
): GeneratedQuery {
  const config = getDuplicateInvoiceConfig(modeOrTitle);
  const mode = config.id;
  const whereConditions: string[] = [];
  const params: Record<string, any> = {};

  // Resolve standard active filters
  const defaultDates = getDefaultInitialDateRange('This Month');
  const fromDate = filterValues.fromDate || defaultDates.fromDate;
  const toDate = filterValues.toDate || defaultDates.toDate;
  const branch = filterValues.branch || 'ALL';

  // 1. Period / Date filtering
  if (config.activeFilters.period) {
    whereConditions.push(`si.sale_date BETWEEN '${fromDate}' AND '${toDate}'`);
    params.fromDate = fromDate;
    params.toDate = toDate;
  }

  // 2. Branch filtering
  if (config.activeFilters.branch && branch !== 'ALL') {
    whereConditions.push(`si.branch_id = '${branch}'`);
    params.branch = branch;
  }

  // 3. Invoice Type filtering
  if (config.activeFilters.invoiceType && filterValues.invoiceType && filterValues.invoiceType !== 'ALL') {
    whereConditions.push(`si.invoice_type = '${filterValues.invoiceType}'`);
    params.invoiceType = filterValues.invoiceType;
  }

  // 4. Payment Type filtering
  if (config.activeFilters.paymentType && filterValues.paymentType && filterValues.paymentType !== 'ALL') {
    whereConditions.push(`si.payment_method = '${filterValues.paymentType}'`);
    params.paymentType = filterValues.paymentType;
  }

  // 5. Department filtering
  if (config.activeFilters.departmentSelect && filterValues.departmentChannel && filterValues.departmentChannel !== 'ALL') {
    whereConditions.push(`si.department_code = '${filterValues.departmentChannel}'`);
    params.departmentChannel = filterValues.departmentChannel;
  }

  // 6. Salesman filtering
  if (config.activeFilters.salesmanSelector && filterValues.salesman && filterValues.salesman !== 'ALL') {
    whereConditions.push(`si.salesman_id = '${filterValues.salesman}'`);
    params.salesman = filterValues.salesman;
  }

  // 7. Server / Cashier selector
  if (config.activeFilters.serverSelector && filterValues.serverCashier && filterValues.serverCashier !== 'ALL') {
    whereConditions.push(`si.cashier_user_id = '${filterValues.serverCashier}'`);
    params.serverCashier = filterValues.serverCashier;
  }

  // 8. Customer search / account
  if (config.activeFilters.customerSearch && filterValues.customerSearch) {
    const s = String(filterValues.customerSearch).replace(/'/g, "''");
    whereConditions.push(`(c.customer_name ILIKE '%${s}%' OR c.account_number ILIKE '%${s}%')`);
    params.customerSearch = filterValues.customerSearch;
  }

  // 9. Invoice range
  if (config.activeFilters.invoiceRange) {
    if (filterValues.fromInvoiceNo) {
      whereConditions.push(`si.invoice_number >= '${filterValues.fromInvoiceNo}'`);
      params.fromInvoiceNo = filterValues.fromInvoiceNo;
    }
    if (filterValues.toInvoiceNo) {
      whereConditions.push(`si.invoice_number <= '${filterValues.toInvoiceNo}'`);
      params.toInvoiceNo = filterValues.toInvoiceNo;
    }
  }

  // 10. VAT selector
  if (config.activeFilters.vatSelector && filterValues.vatStatus && filterValues.vatStatus !== 'ALL') {
    if (filterValues.vatStatus === 'WITH_VAT') {
      whereConditions.push(`si.tax_amount > 0`);
    } else if (filterValues.vatStatus === 'WITHOUT_VAT') {
      whereConditions.push(`(si.tax_amount IS NULL OR si.tax_amount = 0)`);
    }
    params.vatStatus = filterValues.vatStatus;
  }

  // 11. Audit Filters
  if (config.activeFilters.auditFilters && filterValues.auditFlags && filterValues.auditFlags !== 'ALL') {
    if (filterValues.auditFlags === 'SHOW_REFUND') {
      whereConditions.push(`si.is_refund = TRUE`);
    } else if (filterValues.auditFlags === 'SHOW_ZERO') {
      whereConditions.push(`si.total_amount = 0`);
    } else if (filterValues.auditFlags === 'SHOW_DISCOUNT') {
      whereConditions.push(`si.discount_amount > 0`);
    } else if (filterValues.auditFlags === 'SHOW_ZERO_TAX') {
      whereConditions.push(`(si.tax_amount IS NULL OR si.tax_amount = 0)`);
    }
    params.auditFlags = filterValues.auditFlags;
  }

  // Checkbox conditions
  if (config.checkboxes.showZeroTax && filterValues.showZeroTax) {
    whereConditions.push(`(si.tax_amount IS NULL OR si.tax_amount = 0)`);
  }
  if (mode === 'duplicate_invoices') {
    whereConditions.push(`si.print_count >= 2`); // In authentic Omega, duplicate invoices are those reprinted >= 2 times
  }

  // Construct SELECT, FROM, GROUP BY, ORDER BY
  let selectClause = '';
  let fromClause = 'FROM sales_invoices si';
  let joinClause = `
  LEFT JOIN customers c ON si.customer_id = c.id
  LEFT JOIN employees e ON si.salesman_id = e.id OR si.cashier_user_id = e.id
  LEFT JOIN pos_workstations pw ON si.workstation_id = pw.id
  LEFT JOIN customer_groups cg ON c.group_id = cg.id`;

  let groupByClause = '';
  let orderByClause = 'ORDER BY si.sale_date DESC, si.invoice_number DESC';

  switch (mode) {
    case 'transactions_by_salesman':
      selectClause = `
  si.invoice_number,
  si.sale_date AS date,
  c.customer_name AS customer,
  si.subtotal_amount AS amount,
  si.discount_amount AS discount,
  si.tax_amount AS tax,
  si.total_amount AS total_price`;
      orderByClause = 'ORDER BY e.employee_name ASC, si.sale_date DESC';
      break;

    case 'transactions_by_date':
      selectClause = `
  si.sale_date AS date,
  si.sale_time AS time,
  si.invoice_number,
  c.account_number AS cust_id,
  c.customer_name,
  si.order_number,
  si.print_count,
  si.subtotal_amount AS subtotal,
  si.discount_amount AS discount,
  si.tax_amount AS tax,
  si.payment_method AS pay_type,
  si.total_amount AS total,
  si.settlement_currency AS currency,
  si.exchange_rate AS rate`;
      break;

    case 'transactions_by_employees_by_payment':
      selectClause = `
  si.invoice_number,
  si.sale_date AS date,
  si.sale_time AS time,
  e.employee_name,
  si.payment_method AS pay_type,
  si.subtotal_amount AS amount,
  si.total_amount AS total`;
      orderByClause = 'ORDER BY e.employee_name ASC, si.payment_method ASC, si.sale_date DESC';
      break;

    case 'transactions_by_customers_by_employee':
      selectClause = `
  si.invoice_number,
  si.sale_date AS date,
  c.customer_name,
  c.account_number AS cust_id,
  e.employee_name,
  si.subtotal_amount AS amount,
  si.discount_amount AS discount,
  si.tax_amount AS tax,
  si.total_amount AS total`;
      orderByClause = 'ORDER BY c.customer_name ASC, e.employee_name ASC, si.sale_date DESC';
      break;

    case 'transactions_by_invoice_number':
      selectClause = `
  si.invoice_number,
  si.sale_date AS date,
  si.sale_time AS time,
  c.customer_name,
  si.order_number,
  si.subtotal_amount AS subtotal,
  si.discount_amount AS discount,
  si.tax_amount AS tax,
  si.payment_method AS pay_type,
  si.total_amount AS total`;
      orderByClause = 'ORDER BY si.invoice_number ASC';
      break;

    case 'duplicate_invoices':
      selectClause = `
  si.invoice_number,
  si.sale_date AS date,
  si.sale_time AS time,
  si.order_number,
  si.customer_headcount AS cust_count,
  si.subtotal_amount AS amount,
  si.discount_amount AS discount,
  si.tax_amount AS tax,
  si.payment_method AS pay_type,
  si.total_amount AS total,
  si.print_count`;
      break;

    case 'transactions_by_date_by_payments':
      selectClause = `
  si.invoice_number,
  si.sale_date AS date,
  si.sale_time AS time,
  si.order_number,
  si.total_amount AS total,
  si.print_count`;
      orderByClause = 'ORDER BY si.sale_date DESC, si.payment_method ASC';
      break;

    case 'transactions_by_customers':
      selectClause = `
  si.invoice_number,
  si.sale_date AS date,
  si.sale_time AS time,
  si.order_number,
  si.print_count,
  si.subtotal_amount AS subtotal,
  si.discount_amount AS discount,
  si.tax_amount AS tax,
  si.payment_method AS pay_type,
  si.total_amount AS total`;
      orderByClause = 'ORDER BY c.customer_name ASC, si.sale_date DESC';
      break;

    case 'transactions_by_customers_by_groups':
      selectClause = `
  c.customer_name,
  SUM(si.total_amount) AS total_amount`;
      groupByClause = 'GROUP BY si.branch_id, cg.group_name, c.customer_name';
      orderByClause = 'ORDER BY total_amount DESC';
      break;

    case 'transactions_by_customers_details':
      selectClause = `
  si.invoice_number,
  si.sale_date AS date,
  si.sale_time AS time,
  si.order_number,
  e.employee_name,
  si.discount_amount AS discount,
  si.tax_amount AS tax,
  si.total_amount AS total,
  COALESCE(STRING_AGG(ii.item_name, ', '), 'Olive Oil Standard Batch') AS items`;
      joinClause += '\n  LEFT JOIN invoice_items ii ON si.id = ii.invoice_id';
      groupByClause = 'GROUP BY si.id, si.invoice_number, si.sale_date, si.sale_time, si.order_number, e.employee_name, si.discount_amount, si.tax_amount, si.total_amount';
      break;

    case 'transactions_by_workstation':
      selectClause = `
  si.invoice_number,
  si.sale_date AS date,
  si.sale_time AS time,
  si.order_number,
  si.customer_headcount AS cust_count,
  si.subtotal_amount AS amount,
  si.discount_amount AS discount,
  si.tax_amount AS tax,
  si.payment_method AS pay_type,
  si.total_amount AS total,
  si.print_count`;
      orderByClause = 'ORDER BY pw.workstation_name ASC, si.sale_date DESC';
      break;

    case 'transactions_by_employees':
      selectClause = `
  si.invoice_number,
  si.sale_date AS date,
  si.sale_time AS time,
  c.account_number AS customer_id,
  c.customer_name,
  si.subtotal_amount AS amount,
  si.discount_amount AS discount,
  si.tax_amount AS tax,
  si.total_amount AS total,
  si.print_count`;
      orderByClause = 'ORDER BY e.employee_name ASC, si.sale_date DESC';
      break;

    case 'transactions_by_source':
      selectClause = `
  si.invoice_number,
  si.sale_date AS date,
  si.sale_time AS time,
  c.customer_name,
  si.order_number,
  si.subtotal_amount AS subtotal,
  si.discount_amount AS discount,
  si.tax_amount AS tax,
  si.payment_method AS pay_type,
  si.total_amount AS total,
  si.print_count`;
      orderByClause = 'ORDER BY si.source_channel ASC, si.sale_date DESC';
      break;
  }

  const whereText = whereConditions.length > 0
    ? `WHERE ${whereConditions.join('\n  AND ')}`
    : '';

  const sql = `SELECT ${selectClause.trim()}
${fromClause} ${joinClause}
${whereText}
${groupByClause}
${orderByClause};`.replace(/\n\s*\n/g, '\n');

  return {
    mode,
    reportTitle: config.title,
    omegaReportCode: config.omegaReportCode,
    sql,
    whereClause: whereText,
    groupByClause,
    orderByClause,
    parameters: params,
    description: `Dynamic authentic query generated for ${config.title} (${config.omegaReportCode || 'REP_S_00188'})`,
  };
}

/**
 * 2. AUTOMATIC TABLE COLUMNS GENERATOR FOR MasterReportDocument
 */
export function buildTableColumnsFromSchema(
  config: ReportConfig,
  showRate: boolean = false,
  targetCurrency?: string,
  filterValues?: Record<string, any>
): MasterDocColumn<any>[] {
  const activeCols: SchemaColumn[] = [...config.standardColumns];

  if (showRate && config.dynamicColumns?.onShowRate) {
    activeCols.push(...config.dynamicColumns.onShowRate);
  }

  // 1. Salesman dimensional column injection
  const hasSalesmanOrEmpCol = activeCols.some(c => c.key === 'salesman' || c.label.toLowerCase().includes('salesman') || c.key === 'employee_name');
  const isSalesmanFilterActive = filterValues?.salesman && filterValues.salesman !== 'ALL';
  if (!hasSalesmanOrEmpCol && (isSalesmanFilterActive || config.id === 'transactions_by_salesman')) {
    const custIdx = activeCols.findIndex(c => c.key.includes('customer') || c.key.includes('cust'));
    const colDef: SchemaColumn = { key: 'salesman', label: 'Salesman / Rep' };
    if (custIdx !== -1) {
      activeCols.splice(custIdx + 1, 0, colDef);
    } else {
      activeCols.splice(2, 0, colDef);
    }
  }

  // 1b. Mode-specific columns for Transactions by Employees by Payment
  if (config.id === 'transactions_by_employees_by_payment' || config.title.toLowerCase().includes('by employees by payment') || config.title.toLowerCase().includes('by employee by payment')) {
    const hasEmpCol = activeCols.some(c => c.key === 'employee_name' || c.key === 'employee');
    if (!hasEmpCol) {
      activeCols.splice(3, 0, { key: 'employee_name', label: 'Employee / Cashier Name' });
    } else {
      const col = activeCols.find(c => c.key === 'employee_name' || c.key === 'employee');
      if (col) col.label = 'Employee / Cashier Name';
    }
    const hasPayCol = activeCols.some(c => c.key === 'pay_type' || c.key === 'payment_method' || c.key === 'payment_type');
    if (!hasPayCol) {
      const empIdx = activeCols.findIndex(c => c.key === 'employee_name' || c.key === 'employee');
      activeCols.splice(empIdx !== -1 ? empIdx + 1 : 4, 0, { key: 'pay_type', label: 'Payment Type' });
    } else {
      const col = activeCols.find(c => c.key === 'pay_type' || c.key === 'payment_method' || c.key === 'payment_type');
      if (col) col.label = 'Payment Type';
    }
  }

  // 1c. Mode-specific columns for Transactions by Customers by Employee
  if (config.id === 'transactions_by_customers_by_employee' || config.title.toLowerCase().includes('by customers by employee') || config.title.toLowerCase().includes('by customer by employee') || config.title.toLowerCase().includes('customers & serving employee')) {
    const hasCustCol = activeCols.some(c => c.key === 'customer_name' || c.key === 'customer');
    if (!hasCustCol) {
      activeCols.splice(2, 0, { key: 'customer_name', label: 'Customer Name & ID' });
    } else {
      const col = activeCols.find(c => c.key === 'customer_name' || c.key === 'customer');
      if (col) col.label = 'Customer Name & ID';
    }
    const hasEmpCol = activeCols.some(c => c.key === 'employee_name' || c.key === 'employee');
    if (!hasEmpCol) {
      const custIdx = activeCols.findIndex(c => c.key === 'customer_name' || c.key === 'customer');
      activeCols.splice(custIdx !== -1 ? custIdx + 1 : 3, 0, { key: 'employee_name', label: 'Employee Name' });
    } else {
      const col = activeCols.find(c => c.key === 'employee_name' || c.key === 'employee');
      if (col) col.label = 'Employee Name';
    }
    // Remove raw cust_count column if present
    const custCountIdx = activeCols.findIndex(c => c.key === 'cust_count' || c.label === 'Cust#');
    if (custCountIdx !== -1) {
      activeCols.splice(custCountIdx, 1);
    }
  }

  // 2. Tender / Payment Method dimensional column injection
  const isModeStrict = config.id === 'transactions_by_customers_by_employee' || config.id === 'transactions_by_employees_by_payment';
  const hasPayCol = activeCols.some(c => c.key === 'pay_type' || c.key === 'payment_method' || c.key === 'payment_type');
  const isPayFilterActive = (filterValues?.paymentType && filterValues.paymentType !== 'ALL') || (filterValues?.paymentMode && filterValues.paymentMode !== 'ALL');
  if (!hasPayCol && isPayFilterActive && !isModeStrict) {
    activeCols.push({ key: 'pay_type', label: 'Tender' });
  }

  // 3. Void / Refund Reason dimensional column injection
  const hasVoidReasonCol = activeCols.some(c => c.key === 'void_reason' || c.key === 'reason');
  const isRefundOrVoidActive = filterValues?.auditFlags === 'SHOW_REFUND' || Boolean(filterValues?.voidReason);
  if (!hasVoidReasonCol && isRefundOrVoidActive) {
    activeCols.push({ key: 'void_reason', label: 'Void Reason' });
  }

  return activeCols.map((col): MasterDocColumn<any> => {
    const isNum = col.isCurrency;
    const align = col.align || (isNum ? 'right' : 'left');

    let dynamicLabel = col.label;
    if (targetCurrency && col.isCurrency) {
      if (/\((LBP|USD|EUR|GBP|L\.L\.|\$)\)/i.test(col.label)) {
        dynamicLabel = col.label.replace(/\((LBP|USD|EUR|GBP|L\.L\.|\$)\)/i, `(${targetCurrency})`);
      }
    }

    return {
      key: col.key,
      label: dynamicLabel,
      align,
      isMonospace: isNum || col.key.includes('date') || col.key.includes('time') || col.key.includes('invoice') || col.key.includes('rate'),
      render: (row: any) => {
        const rawVal = row[col.key];

        // 1. Explicit Tender / Payment Type custom badge
        if (col.key === 'pay_type' || col.key === 'payment_type' || col.key === 'payment_method') {
          const str = String(rawVal || 'CASH').toUpperCase();
          return <span className={getPaymentMethodTextClass(str)}>{str}</span>;
        }

        // 2. Invoice number prefix
        if (col.key === 'invoice_number' && rawVal) {
          const isNeg = col.colorCondition === 'negative_red' && String(rawVal).startsWith('-');
          return (
            <span className={`font-mono font-bold ${isNeg ? 'text-rose-600' : 'text-slate-900'}`}>
              #{rawVal}
            </span>
          );
        }

        // 3. Dynamic Currency Column
        if (col.key === 'currency') {
          const curr = String(rawVal || 'LBP').toUpperCase();
          const colorClass =
            curr === 'USD'
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : curr === 'EUR'
              ? 'text-blue-700 bg-blue-50 border-blue-200'
              : curr === 'GBP'
              ? 'text-purple-700 bg-purple-50 border-purple-200'
              : 'text-slate-700 bg-slate-50 border-slate-200';
          return (
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-bold border ${colorClass}`}>
              {curr}
            </span>
          );
        }

        // 4. Rate Column
        if (col.key === 'rate') {
          const num = typeof rawVal === 'number' ? rawVal : parseFloat(String(rawVal).replace(/,/g, '')) || 89500;
          return <span className="font-mono text-slate-700 tabular-nums">{num.toLocaleString()}</span>;
        }

        // 4b. Employee / Cashier Column
        if (col.key === 'employee_name' || col.key === 'employee') {
          return (
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shrink-0"></span>
              {rawVal || 'Staff'}
            </span>
          );
        }

        // 4c. Customer Column
        if (col.key === 'customer_name' || col.key === 'customer') {
          const custId = row.custId || row.cust_id || row.customer_id;
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900">{rawVal || 'Walk-in Customer'}</span>
              {custId && <span className="text-[10px] font-mono text-slate-500 font-normal">{custId}</span>}
            </div>
          );
        }

        // 5. Salesman Column
        if (col.key === 'salesman') {
          return <span className="font-semibold text-slate-900">{rawVal || 'Staff'}</span>;
        }

        // 6. Void / Refund Reason Column
        if (col.key === 'void_reason' || col.key === 'reason') {
          return (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
              {rawVal || 'Customer Return'}
            </span>
          );
        }

        // 7. Currency / Numeric format
        if (isNum && rawVal !== undefined && rawVal !== null) {
          const num = typeof rawVal === 'number' ? rawVal : parseFloat(String(rawVal).replace(/,/g, '')) || 0;
          const formatted = formatCurrencyAmount(num, row.currency, false);
          const isNegative = num < 0;

          return (
            <span
              className={`font-mono tabular-nums ${
                isNegative && col.colorCondition === 'negative_red'
                  ? 'text-rose-600 font-bold'
                  : 'text-slate-800'
              }`}
            >
              {formatted}
            </span>
          );
        }

        // Default text
        return <span className="text-slate-800">{rawVal ?? '-'}</span>;
      },
    };
  });
}

/**
 * 3. MOCK / RAW INVOICE DATA ADAPTER TO GENERATE AUTHENTIC RECORDS ACCORDING TO SCHEMA
 */
export interface MasterMockTransaction {
  invoiceNo: string;
  date: string;
  time: string;
  customerName: string;
  custId: string;
  salesman: string;
  employee: string;
  employee_name?: string;
  server: string;
  branch: string;
  channel: 'Local' | 'Online' | 'International';
  department: string;
  departmentChannel: string;
  workstation: string;
  customerGroup: string;
  table: string;
  orderNo: string;
  printCount: number;
  custCount: number;
  invoice_type: 'POS' | 'Inventory' | 'Training';
  invoiceType: 'POS' | 'Inventory' | 'Training';
  payment_method: string;
  paymentType: string;
  payType: string;
  itemsCount: number;
  items: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  rate: number;
  subtotalLbp: number;
  discountLbp: number;
  taxLbp: number;
  totalLbp: number;
  totalUsd: number;
  service?: number;
  isRefund?: boolean;
  void_reason?: string;
}

export function parseDateToIso(dateStr: string): string {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const months: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const day = parts[0].padStart(2, '0');
    const month = months[parts[1].toLowerCase()] || '08';
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

export function matchesPaymentFilter(recordPay: any, filterPay: any, recordCurrency?: string): boolean {
  if (!filterPay || filterPay === 'ALL') return true;
  const r = String(recordPay || '').toUpperCase().trim();
  const f = String(filterPay || '').toUpperCase().trim();
  if (r === f) return true;

  // Extract explicit currency from filter if any (USD, LBP, EUR, GBP, etc.)
  const filterCurr = extractCurrencyFromFilter(f);
  const recCurr = recordCurrency ? String(recordCurrency).toUpperCase().trim() : extractCurrencyFromFilter(r);

  // If filter specifies a currency (e.g. CASH_USD, CARD_EUR, or USD), ensure record currency matches
  if (filterCurr && recCurr && filterCurr !== recCurr) {
    return false;
  }

  // Cash tender
  if (f.includes('CASH')) {
    return r.includes('CASH');
  }

  // Card tender
  if (f.includes('CARD') || f.includes('CREDIT_CARD')) {
    return r.includes('CARD') || r.includes('VISA') || r.includes('MASTERCARD');
  }

  // Credit on Account / Customer Ledger Credit
  if (f === 'CREDIT_ACCOUNT' || f === 'CREDIT ON ACCOUNT' || f === 'ON ACC' || f === 'ON_ACC' || f === 'CREDIT') {
    return r.includes('ACC') || r.includes('CREDIT') || r.includes('ACCOUNT');
  }

  // Mixed / Split Tender
  if (f === 'SPLIT' || f === 'MIXED' || f === 'SPLIT TENDER' || f === 'MIXED / SPLIT TENDER') {
    return r.includes('SPLIT') || r.includes('MIXED');
  }

  // Whish Money / E-Wallets
  if (f === 'WHISH' || f === 'WISH' || f === 'E_WALLET' || f === 'E-WALLET' || f === 'WHISH MONEY / E-WALLETS' || f === 'WHISH PAY / WALLETS') {
    return r.includes('WHISH') || r.includes('WALLET');
  }

  // Pure Currency filter (e.g. 'USD', 'EUR', 'GBP', 'LBP')
  if (filterCurr && f === filterCurr) {
    return recCurr === filterCurr;
  }

  return r.includes(f) || f.includes(r);
}

export function matchesChannelFilter(recordChan: any, filterChan: any): boolean {
  if (!filterChan || filterChan === 'ALL') return true;
  const r = String(recordChan || '').toUpperCase();
  const f = String(filterChan || '').toUpperCase();
  if (r === f) return true;
  return r.includes(f) || f.includes(r);
}

export function matchesInvoiceTypeFilter(recordType: any, filterType: any): boolean {
  if (!filterType || filterType === 'ALL') return true;
  const r = String(recordType || '').toUpperCase();
  const f = String(filterType || '').toUpperCase();
  if (r === f) return true;
  return r.includes(f) || f.includes(r);
}

export const DEFAULT_MOCK_TRANSACTIONS: MasterMockTransaction[] = [];

/**
 * 3. RAW INVOICE DATA ADAPTER TO GENERATE AUTHENTIC RECORDS ACCORDING TO SCHEMA
 */
export function generateDataForDuplicateInvoiceReport(
  config: ReportConfig,
  filters: Record<string, any> = {},
  invoices?: any[]
): any[] {
  const mode = config.id;

  // Base raw records (Default to empty array if no live records provided)
  const baseInvoices = (invoices && invoices.length > 0)
    ? invoices
    : [];

  // Apply in-memory WHERE filter rules across all dimensions
  const filtered = baseInvoices.filter((inv) => {
    // 1. Date Range Filtering
    if (filters.fromDate || filters.toDate) {
      const invIso = parseDateToIso(inv.date);
      if (filters.fromDate && invIso < filters.fromDate) return false;
      if (filters.toDate && invIso > filters.toDate) return false;
    }

    // 2. Branch Filtering
    if (filters.branch && filters.branch !== 'ALL') {
      const b = String(inv.branch || '').toLowerCase();
      const targetB = String(filters.branch).toLowerCase();
      if (!b.includes(targetB) && !targetB.includes(b)) return false;
    }

    // 3. Payment Method Filtering
    const filterPayment = filters.paymentType || filters.paymentMode;
    if (filterPayment && filterPayment !== 'ALL') {
      const recPay = inv.payment_method || inv.paymentType || inv.payType;
      if (!matchesTenderFilter(recPay, filterPayment, inv.currency)) return false;
    }

    // 4. Channel / Department Filtering
    const filterChannel = filters.departmentChannel || filters.channel;
    if (filterChannel && filterChannel !== 'ALL') {
      const recChan = inv.channel || inv.department || inv.departmentChannel;
      if (!matchesChannelFilter(recChan, filterChannel)) return false;
    }

    // 5. Invoice Type Filtering
    const filterInvType = filters.invoiceType || filters.invoice_type;
    if (filterInvType && filterInvType !== 'ALL') {
      const recType = inv.invoice_type || inv.invoiceType;
      if (!matchesInvoiceTypeFilter(recType, filterInvType)) return false;
    }

    // 6. Employee / Salesman Filtering
    const filterEmp = filters.employee || filters.salesman;
    if (filterEmp && filterEmp !== 'ALL') {
      const recEmp = inv.employee || inv.employee_name || inv.salesman || inv.server;
      if (!matchesEmployeeFilter(recEmp, filterEmp)) return false;
    }

    // 7. Server / Cashier Filtering
    if (filters.serverCashier && filters.serverCashier !== 'ALL') {
      const recCashier = inv.server || inv.employee || inv.employee_name;
      if (!matchesEmployeeFilter(recCashier, filters.serverCashier)) return false;
    }

    // 7b. Workstation Filtering
    if (filters.workstation && filters.workstation !== 'ALL') {
      const targetWs = String(filters.workstation).toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      const rowWs = String(inv.workstation || inv.table_number || inv.table || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      if (rowWs && !rowWs.includes(targetWs) && !targetWs.includes(rowWs)) return false;
    }

    // 8. Invoice Number Range
    if (filters.fromInvoiceNo || filters.toInvoiceNo) {
      const invNum = parseInt(String(inv.invoiceNo || '').replace(/\D/g, ''), 10);
      if (filters.fromInvoiceNo && invNum < parseInt(filters.fromInvoiceNo, 10)) return false;
      if (filters.toInvoiceNo && invNum > parseInt(filters.toInvoiceNo, 10)) return false;
    }

    // 9. Customer Filtering
    const filterCust = filters.customer || filters.customerSearch || filters.customerAccount;
    if (filterCust && filterCust !== 'ALL' && String(filterCust).trim() !== '') {
      if (!matchesCustomerFilter(inv.customerName || inv.customer, filterCust, inv.custId || inv.customer_id)) {
        return false;
      }
    }

    // 10. Audit Flags
    if (filters.auditFlags && filters.auditFlags !== 'ALL') {
      if (filters.auditFlags === 'SHOW_REFUND') {
        if (!inv.isRefund && !String(inv.invoiceNo || '').startsWith('-')) return false;
      } else if (filters.auditFlags === 'SHOW_ZERO') {
        const tot = inv.total ?? inv.totalLbp ?? 0;
        if (tot !== 0) return false;
      } else if (filters.auditFlags === 'SHOW_DISCOUNT') {
        const disc = inv.discount ?? inv.discountLbp ?? 0;
        if (disc <= 0) return false;
      } else if (filters.auditFlags === 'SHOW_ZERO_TAX') {
        const tx = inv.tax ?? inv.taxLbp ?? 0;
        if (tx > 0) return false;
      }
    }

    // 11. Zero Tax Checkbox
    if (filters.showZeroTax) {
      const tx = inv.tax ?? inv.taxLbp ?? 0;
      if (tx > 0) return false;
    }

    return true;
  });

  // Grouping aggregation for `transactions_by_customers_by_groups`
  if (mode === 'transactions_by_customers_by_groups') {
    const filterCurrency = extractCurrencyFromFilter(filters.paymentType || filters.paymentMode || filters.currency);
    const targetCurr = filterCurrency || filters.currency || 'USD';
    const groupedMap = new Map<string, { totalAmt: number; currency: string }>();

    filtered.forEach((inv) => {
      const custName = inv.customerName || inv.customer || 'Walk-in Customer';
      const invCurr = inv.currency || 'LBP';
      const rawSubtotal = inv.subtotal ?? (inv.currency === 'LBP' ? inv.subtotalLbp : undefined) ?? inv.amount ?? 0;
      const rawDiscount = inv.discount ?? (inv.currency === 'LBP' ? inv.discountLbp : undefined) ?? 0;
      const rawTax = inv.tax ?? (inv.currency === 'LBP' ? inv.taxLbp : undefined) ?? 0;
      const rawTotal = inv.total ?? (rawSubtotal - rawDiscount + rawTax);
      const convertedTot = convertCurrency(rawTotal, invCurr, targetCurr);

      const existing = groupedMap.get(custName) || { totalAmt: 0, currency: targetCurr };
      groupedMap.set(custName, {
        totalAmt: existing.totalAmt + convertedTot,
        currency: targetCurr,
      });
    });

    return Array.from(groupedMap.entries()).map(([custName, item]) => ({
      customer_name: custName,
      total_amount: item.totalAmt,
      total_price: item.totalAmt,
      total: item.totalAmt,
      currency: item.currency,
    }));
  }

  // Format record rows to match each report's specific standardColumns keys
  // Evaluates dynamic multi-currency context and explicit tender badges
  return filtered.map((inv) => {
    // 1. Determine active currency context dynamically
    const filterCurrency = extractCurrencyFromFilter(filters.paymentType || filters.paymentMode || filters.currency);
    const activeCurrency = filterCurrency || inv.currency || 'LBP';
    const rateVal = getExchangeRateForDisplay(activeCurrency);
    const currVal = activeCurrency;

    // 2. Dynamic conversion via convertCurrency
    const invCurr = inv.currency || 'LBP';
    const rawSubtotal = inv.subtotal ?? (inv.currency === 'LBP' ? inv.subtotalLbp : undefined) ?? inv.amount ?? 0;
    const rawDiscount = inv.discount ?? (inv.currency === 'LBP' ? inv.discountLbp : undefined) ?? 0;
    const rawTax = inv.tax ?? (inv.currency === 'LBP' ? inv.taxLbp : undefined) ?? 0;
    const rawTotal = inv.total ?? (rawSubtotal - rawDiscount + rawTax);

    const subtotalVal = convertCurrency(rawSubtotal, invCurr, activeCurrency);
    const discountVal = convertCurrency(rawDiscount, invCurr, activeCurrency);
    const taxVal = convertCurrency(rawTax, invCurr, activeCurrency);
    const totalVal = convertCurrency(rawTotal, invCurr, activeCurrency);

    // 3. Resolve explicit tender string for clear audit visibility
    let payVal = String(inv.payment_method || inv.paymentType || inv.payType || 'CASH').toUpperCase();
    if (payVal === 'CASH' || payVal === 'CASH_LBP' || payVal === 'CASH_USD' || payVal.startsWith('CASH')) {
      payVal = `CASH (${currVal})`;
    } else if (payVal === 'CARD' || payVal === 'CARD_LBP' || payVal === 'CARD_USD' || payVal.startsWith('CARD') || payVal === 'CREDIT_CARD') {
      payVal = `CARD (${currVal})`;
    } else if (payVal === 'CREDIT' || payVal === 'CREDIT_ACCOUNT' || payVal === 'CREDIT ON ACCOUNT') {
      payVal = 'ON ACC';
    } else if (payVal === 'SPLIT' || payVal === 'MIXED') {
      payVal = 'SPLIT';
    } else if (payVal === 'WHISH' || payVal === 'WHISH MONEY' || payVal === 'E_WALLET') {
      payVal = 'WHISH';
    }

    return {
      invoice_number: inv.invoiceNo || inv.invoice_number,
      invoiceNo: inv.invoiceNo,
      date: inv.date,
      time: inv.time || '12:00',
      customer: inv.customerName || inv.customer || 'Standard Client',
      customer_name: inv.customerName || inv.customer || 'Standard Client',
      customer_id: inv.custId || inv.customer_id || 'CUST-001',
      cust_id: inv.custId || inv.customer_id || 'CUST-001',
      order_number: inv.orderNo || inv.order_number || '1',
      print_count: inv.printCount ?? inv.print_count ?? 1,
      cust_count: inv.custCount ?? inv.cust_count ?? 1,
      table_number: inv.table || inv.table_number || '-',
      channel: inv.channel || inv.department || 'Local',
      invoice_type: inv.invoice_type || inv.invoiceType || 'POS',
      service: inv.service ?? 0,
      items: inv.items || 'Standard Olive Oil Batch',
      employee_name: inv.employee || inv.employee_name || inv.salesman || 'Staff',
      salesman: inv.salesman || inv.employee || 'Staff',
      amount: subtotalVal,
      subtotal: subtotalVal,
      discount: discountVal,
      tax: taxVal,
      pay_type: payVal,
      payment_method: payVal,
      total: totalVal,
      total_price: totalVal,
      total_amount: totalVal,
      currency: currVal,
      rate: rateVal,
      void_reason: inv.void_reason || (inv.isRefund || String(inv.invoiceNo || '').startsWith('-') ? 'Customer Return' : '-'),
    };
  });
}

function parseNumericValue(val: any): number {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.-]+/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function extractRowCurrency(row: any, fallbackCurrency: string = 'USD'): string {
  if (!row) return fallbackCurrency;
  if (row.currency && typeof row.currency === 'string') {
    const code = row.currency.toUpperCase().trim();
    if (SUPPORTED_CURRENCIES[code]) return code;
  }
  if (row.curr && typeof row.curr === 'string') {
    const code = row.curr.toUpperCase().trim();
    if (SUPPORTED_CURRENCIES[code]) return code;
  }
  const tender = row.payment_method || row.paymentType || row.pay_type || row.payType;
  if (tender && typeof tender === 'string') {
    const extracted = extractCurrencyFromFilter(tender);
    if (extracted && SUPPORTED_CURRENCIES[extracted]) return extracted;
  }
  return fallbackCurrency;
}

export function extractRowTotalPrice(row: any, primaryTotalKey?: string): number {
  if (!row) return 0;

  if (primaryTotalKey && row[primaryTotalKey] !== undefined && row[primaryTotalKey] !== null && row[primaryTotalKey] !== '') {
    return parseNumericValue(row[primaryTotalKey]);
  }
  if (row.total_price !== undefined && row.total_price !== null && row.total_price !== '') {
    return parseNumericValue(row.total_price);
  }
  if (row.total !== undefined && row.total !== null && row.total !== '') {
    return parseNumericValue(row.total);
  }
  if (row.total_amount !== undefined && row.total_amount !== null && row.total_amount !== '') {
    return parseNumericValue(row.total_amount);
  }
  if (row.grandTotal !== undefined && row.grandTotal !== null && row.grandTotal !== '') {
    return parseNumericValue(row.grandTotal);
  }
  if (row.grand_total !== undefined && row.grand_total !== null && row.grand_total !== '') {
    return parseNumericValue(row.grand_total);
  }
  if (row.amount !== undefined && row.amount !== null && row.amount !== '') {
    const amt = parseNumericValue(row.amount);
    const disc = parseNumericValue(row.discount ?? row.discountLbp ?? 0);
    const tx = parseNumericValue(row.tax ?? row.taxLbp ?? 0);
    return (amt - disc) + tx;
  }
  return 0;
}

/**
 * 4. GRAND TOTAL / KPI CALCULATOR & UNIVERSAL MULTI-CURRENCY AGGREGATION ENGINE
 *
 * Implements Dynamic Currency Normalization & True Total Price Accumulation:
 * 1. Identifies the report target currency (defaulting to USD or active currency filter).
 * 2. Accumulates final post-discount post-tax row totals (`total_price`), avoiding pre-tax `amount`.
 * 3. Converts all heterogeneous row totals to the target currency using central exchange rates (89,500 LBP/USD, 0.92 EUR/USD).
 * 4. Renders a multi-currency breakdown (Total LBP, Total USD, Total EUR) alongside the converted consolidated Grand Total.
 */
export function calculateGrandTotalFromSchema(
  config: ReportConfig,
  rows: any[],
  targetCurrency?: string
): GrandTotal | undefined {
  if (!config || !config.hasKpiFooter || !rows || rows.length === 0) {
    return undefined;
  }

  // 1. Identify selected / target currency of the report (default to USD or active currency filter)
  const resolvedTargetCurrency = (targetCurrency || 'USD').toUpperCase().trim();

  // 2. Candidate keys for final row total, strictly prioritizing post-discount, post-tax fields.
  // We intentionally EXCLUDE pre-tax 'amount' from candidate keys to prevent summing subtotals.
  const priorityTotalKeys = ['total_price', 'total', 'total_amount', 'grand_total', 'grandTotal'];
  const matchedTotalCol = config.standardColumns.find((c) => priorityTotalKeys.includes(c.key));
  const primaryTotalKey = matchedTotalCol ? matchedTotalCol.key : undefined;

  // 3. Multi-currency aggregation
  const multiCurrencyTotals: Record<string, number> = {};
  let consolidatedConvertedSum = 0;

  for (const row of rows) {
    if (!row) continue;

    const rowCurrency = extractRowCurrency(row, resolvedTargetCurrency);
    const rowTotal = extractRowTotalPrice(row, primaryTotalKey);

    // Accumulate raw total per native currency
    multiCurrencyTotals[rowCurrency] = (multiCurrencyTotals[rowCurrency] || 0) + rowTotal;

    // Convert row total to target currency using central exchange rates
    const convertedRowTotal = convertCurrency(rowTotal, rowCurrency, resolvedTargetCurrency);
    consolidatedConvertedSum += convertedRowTotal;
  }

  // 4. Build Multi-Currency Breakdown Text
  const currenciesPresent = Object.keys(multiCurrencyTotals);
  const activeCurrencyEntries = Object.entries(multiCurrencyTotals).filter(
    ([_, val]) => Math.abs(val) > 0.0001
  );

  const breakdownText =
    activeCurrencyEntries.length > 0
      ? activeCurrencyEntries
          .map(([curr, val]) => `${curr}: ${formatCurrencyAmount(val, curr, true)}`)
          .join('  |  ')
      : undefined;

  // 5. Build Converted Subtext (Exchange Rate Reference)
  const isMultiCurrency =
    currenciesPresent.length > 1 ||
    (currenciesPresent.length === 1 && currenciesPresent[0] !== resolvedTargetCurrency);

  let convertedSubtext: string | undefined = undefined;
  if (isMultiCurrency) {
    const rateInfo: string[] = [];
    if (multiCurrencyTotals['LBP'] && resolvedTargetCurrency !== 'LBP') {
      rateInfo.push('89,500 LBP/USD');
    }
    if (multiCurrencyTotals['EUR'] && resolvedTargetCurrency !== 'EUR') {
      rateInfo.push('0.92 EUR/USD');
    }
    if (multiCurrencyTotals['GBP'] && resolvedTargetCurrency !== 'GBP') {
      rateInfo.push('0.78 GBP/USD');
    }
    const rateStr = rateInfo.length > 0 ? ` @ ${rateInfo.join(', ')}` : '';
    convertedSubtext = `Normalized to ${resolvedTargetCurrency}${rateStr}`;
  }

  // 6. Formatted consolidated value in target currency
  const formattedConsolidatedValue = formatCurrencyAmount(
    consolidatedConvertedSum,
    resolvedTargetCurrency,
    true
  );

  return {
    label: `Consolidated Grand Total (${config.title})`,
    value: formattedConsolidatedValue,
    isNegative: consolidatedConvertedSum < 0,
    breakdownText,
    convertedSubtext,
    multiCurrencyTotals,
    normalizedAmount: consolidatedConvertedSum,
    targetCurrency: resolvedTargetCurrency,
  };
}

