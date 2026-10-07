/**
 * ============================================================================
 * VANGUARD ERP - UNIVERSAL REPORT SCHEMA REGISTRY
 * ============================================================================
 * Single Source of Truth for Dynamic Report Definitions across all modules:
 * Accounting, HR, POS, Pressing Mill, Supersonic Fleet, Social Media Hub, Inventory.
 */

export interface ReportColumnConfig {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  format?: 'currency' | 'date' | 'badge' | 'text';
}

export interface ReportDefinition {
  id: string;
  title: string;
  endpoint: string;
  columns: ReportColumnConfig[];
  defaultOrientation?: 'portrait' | 'landscape';
}

export const UNIVERSAL_REPORT_REGISTRY: Record<string, ReportDefinition> = {
  // ==========================================================================
  // 1. ACCOUNTING & FINANCIALS
  // ==========================================================================
  'REP_S_00210': {
    id: 'REP_S_00210',
    title: 'Tax Declaration & VAT Summary',
    endpoint: '/api/accounting/tax',
    defaultOrientation: 'portrait',
    columns: [
      { key: 'category', label: 'Tax Category', align: 'left', format: 'text' },
      { key: 'taxableBaseUsd', label: 'Taxable Base ($)', align: 'right', format: 'currency' },
      { key: 'taxableBaseLbp', label: 'Taxable Base (LBP)', align: 'right', format: 'currency' },
      { key: 'vatRate', label: 'VAT Rate', align: 'center', format: 'badge' },
      { key: 'vatAmountUsd', label: 'VAT Amount ($)', align: 'right', format: 'currency' },
      { key: 'vatAmountLbp', label: 'VAT Amount (LBP)', align: 'right', format: 'currency' },
    ],
  },
  'REP_S_00211': {
    id: 'REP_S_00211',
    title: 'Tax Summary Comparative Analysis',
    endpoint: '/api/accounting/tax?comparative=true',
    defaultOrientation: 'landscape',
    columns: [
      { key: 'category', label: 'Tax Category', align: 'left', format: 'text' },
      { key: 'currentTaxableBaseUsd', label: 'Current Base ($)', align: 'right', format: 'currency' },
      { key: 'currentVatUsd', label: 'Current VAT ($)', align: 'right', format: 'currency' },
      { key: 'priorTaxableBaseUsd', label: 'Prior Base ($)', align: 'right', format: 'currency' },
      { key: 'priorVatUsd', label: 'Prior VAT ($)', align: 'right', format: 'currency' },
      { key: 'varianceUsd', label: 'Variance ($)', align: 'right', format: 'currency' },
      { key: 'variancePct', label: 'Growth %', align: 'center', format: 'badge' },
    ],
  },
  'REP_ACC_001': {
    id: 'REP_ACC_001',
    title: 'Trial Balance Ledger',
    endpoint: '/api/accounting/ledger?type=trial_balance',
    defaultOrientation: 'landscape',
    columns: [
      { key: 'accountCode', label: 'Account Code', align: 'left', format: 'text' },
      { key: 'accountName', label: 'Account Name', align: 'left', format: 'text' },
      { key: 'openingDebit', label: 'Opening Debit ($)', align: 'right', format: 'currency' },
      { key: 'openingCredit', label: 'Opening Credit ($)', align: 'right', format: 'currency' },
      { key: 'periodDebit', label: 'Period Debit ($)', align: 'right', format: 'currency' },
      { key: 'periodCredit', label: 'Period Credit ($)', align: 'right', format: 'currency' },
      { key: 'endingDebit', label: 'Ending Debit ($)', align: 'right', format: 'currency' },
      { key: 'endingCredit', label: 'Ending Credit ($)', align: 'right', format: 'currency' },
    ],
  },
  'REP_ACC_002': {
    id: 'REP_ACC_002',
    title: 'General Ledger Account Statement',
    endpoint: '/api/accounting/ledger',
    defaultOrientation: 'portrait',
    columns: [
      { key: 'date', label: 'Date', align: 'left', format: 'date' },
      { key: 'voucherNo', label: 'Voucher #', align: 'left', format: 'text' },
      { key: 'description', label: 'Description', align: 'left', format: 'text' },
      { key: 'debit', label: 'Debit ($)', align: 'right', format: 'currency' },
      { key: 'credit', label: 'Credit ($)', align: 'right', format: 'currency' },
      { key: 'balance', label: 'Balance ($)', align: 'right', format: 'currency' },
    ],
  },
  'REP_ACC_003': {
    id: 'REP_ACC_003',
    title: 'Balance Sheet Summary',
    endpoint: '/api/accounting/ledger?type=balance_sheet',
    defaultOrientation: 'portrait',
    columns: [
      { key: 'classification', label: 'Balance Sheet Section', align: 'left', format: 'text' },
      { key: 'accountName', label: 'Account Name', align: 'left', format: 'text' },
      { key: 'amountUsd', label: 'Amount ($)', align: 'right', format: 'currency' },
      { key: 'amountLbp', label: 'Amount (LBP)', align: 'right', format: 'currency' },
    ],
  },
  'REP_ACC_004': {
    id: 'REP_ACC_004',
    title: 'Profit & Loss Statement (Income Statement)',
    endpoint: '/api/accounting/ledger?type=pnl',
    defaultOrientation: 'portrait',
    columns: [
      { key: 'category', label: 'Financial Category', align: 'left', format: 'text' },
      { key: 'revenueExpense', label: 'Account Line', align: 'left', format: 'text' },
      { key: 'amountUsd', label: 'Amount ($)', align: 'right', format: 'currency' },
      { key: 'pctOfTotal', label: '% of Revenue', align: 'center', format: 'badge' },
    ],
  },
  'REP_ACC_005': {
    id: 'REP_ACC_005',
    title: 'Aged Customer Receivables Summary',
    endpoint: '/api/accounting/ledger?type=ar_aging',
    defaultOrientation: 'landscape',
    columns: [
      { key: 'customerCode', label: 'Cust #', align: 'left', format: 'text' },
      { key: 'customerName', label: 'Customer Name', align: 'left', format: 'text' },
      { key: 'currentDue', label: 'Current 0-30 ($)', align: 'right', format: 'currency' },
      { key: 'days3060', label: '31-60 Days ($)', align: 'right', format: 'currency' },
      { key: 'days6090', label: '61-90 Days ($)', align: 'right', format: 'currency' },
      { key: 'over90', label: '90+ Days ($)', align: 'right', format: 'currency' },
      { key: 'totalBalance', label: 'Total Balance ($)', align: 'right', format: 'currency' },
    ],
  },

  // ==========================================================================
  // 2. HUMAN RESOURCES & PAYROLL
  // ==========================================================================
  'REP_S_00301': {
    id: 'REP_S_00301',
    title: 'Employee Attendance & Shift Roster',
    endpoint: '/api/hr/attendance',
    defaultOrientation: 'landscape',
    columns: [
      { key: 'empId', label: 'Emp ID', align: 'left', format: 'text' },
      { key: 'employeeName', label: 'Employee Name', align: 'left', format: 'text' },
      { key: 'department', label: 'Department', align: 'left', format: 'text' },
      { key: 'shiftName', label: 'Shift Window', align: 'left', format: 'text' },
      { key: 'clockIn', label: 'Clock In', align: 'center', format: 'text' },
      { key: 'clockOut', label: 'Clock Out', align: 'center', format: 'text' },
      { key: 'workedHours', label: 'Hours', align: 'right', format: 'text' },
      { key: 'overtimeHours', label: 'OT (hrs)', align: 'right', format: 'text' },
      { key: 'status', label: 'Shift Status', align: 'center', format: 'badge' },
    ],
  },
  'REP_S_00302': {
    id: 'REP_S_00302',
    title: 'Biometric Time & Attendance Punch Ledger',
    endpoint: '/api/hr/attendance?type=punches',
    defaultOrientation: 'portrait',
    columns: [
      { key: 'punchId', label: 'Punch ID', align: 'left', format: 'text' },
      { key: 'empName', label: 'Staff Name', align: 'left', format: 'text' },
      { key: 'terminal', label: 'Terminal / Reader', align: 'left', format: 'text' },
      { key: 'punchTime', label: 'Timestamp', align: 'center', format: 'text' },
      { key: 'eventType', label: 'Event', align: 'center', format: 'badge' },
      { key: 'verificationStatus', label: 'Verification', align: 'center', format: 'badge' },
    ],
  },
  'REP_S_00303': {
    id: 'REP_S_00303',
    title: 'Labor Cost & Revenue Allocation',
    endpoint: '/api/hr/employees?type=labor_cost',
    defaultOrientation: 'portrait',
    columns: [
      { key: 'costCenter', label: 'Cost Center', align: 'left', format: 'text' },
      { key: 'department', label: 'Department Name', align: 'left', format: 'text' },
      { key: 'headcount', label: 'Staff Count', align: 'center', format: 'text' },
      { key: 'baseSalariesUsd', label: 'Base Salaries ($)', align: 'right', format: 'currency' },
      { key: 'overtimeUsd', label: 'Overtime ($)', align: 'right', format: 'currency' },
      { key: 'totalLaborCostUsd', label: 'Total Cost ($)', align: 'right', format: 'currency' },
      { key: 'costRatio', label: '% of Labor', align: 'center', format: 'badge' },
    ],
  },
  'REP_HR_001': {
    id: 'REP_HR_001',
    title: 'Monthly Payroll Reconciliation',
    endpoint: '/api/hr/employees?type=payroll',
    defaultOrientation: 'landscape',
    columns: [
      { key: 'empCode', label: 'Emp #', align: 'left', format: 'text' },
      { key: 'fullName', label: 'Full Name', align: 'left', format: 'text' },
      { key: 'department', label: 'Department', align: 'left', format: 'text' },
      { key: 'baseSalary', label: 'Base Salary ($)', align: 'right', format: 'currency' },
      { key: 'allowances', label: 'Allowances ($)', align: 'right', format: 'currency' },
      { key: 'deductions', label: 'Deductions ($)', align: 'right', format: 'currency' },
      { key: 'netPayableUsd', label: 'Net Payable ($)', align: 'right', format: 'currency' },
      { key: 'disbursementStatus', label: 'Status', align: 'center', format: 'badge' },
    ],
  },
  'REP_HR_004': {
    id: 'REP_HR_004',
    title: 'Employee Headcount & Department Roster',
    endpoint: '/api/hr/employees',
    defaultOrientation: 'portrait',
    columns: [
      { key: 'code', label: 'Emp ID', align: 'left', format: 'text' },
      { key: 'name', label: 'Employee Name', align: 'left', format: 'text' },
      { key: 'jobTitle', label: 'Job Title', align: 'left', format: 'text' },
      { key: 'department', label: 'Department', align: 'left', format: 'text' },
      { key: 'hireDate', label: 'Hire Date', align: 'center', format: 'date' },
      { key: 'employmentStatus', label: 'Status', align: 'center', format: 'badge' },
    ],
  },

  // ==========================================================================
  // 3. SALES & POS CONTROL
  // ==========================================================================
  'REP_S_00189': {
    id: 'REP_S_00189',
    title: 'Meter Reading & Daily Z-Report',
    endpoint: '/api/pos/transactions?type=z_report',
    defaultOrientation: 'portrait',
    columns: [
      { key: 'registerNo', label: 'Register', align: 'left', format: 'text' },
      { key: 'cashier', label: 'Cashier', align: 'left', format: 'text' },
      { key: 'shiftStart', label: 'Shift Open', align: 'center', format: 'text' },
      { key: 'shiftEnd', label: 'Shift Close', align: 'center', format: 'text' },
      { key: 'grossSalesUsd', label: 'Gross Sales ($)', align: 'right', format: 'currency' },
      { key: 'netSalesUsd', label: 'Net Sales ($)', align: 'right', format: 'currency' },
      { key: 'cashCollectedUsd', label: 'Cash ($)', align: 'right', format: 'currency' },
      { key: 'overShortUsd', label: 'Discrepancy ($)', align: 'right', format: 'currency' },
    ],
  },
  'REP_S_00190': {
    id: 'REP_S_00190',
    title: 'No Sale Drawer Open Audit Log',
    endpoint: '/api/pos/transactions?type=no_sale',
    defaultOrientation: 'portrait',
    columns: [
      { key: 'timestamp', label: 'Event Time', align: 'left', format: 'text' },
      { key: 'workstation', label: 'Workstation', align: 'left', format: 'text' },
      { key: 'cashier', label: 'Cashier Name', align: 'left', format: 'text' },
      { key: 'reason', label: 'Reason Code', align: 'left', format: 'text' },
      { key: 'authorizedBy', label: 'Manager Sign-off', align: 'left', format: 'text' },
    ],
  },
  'REP_S_00191': {
    id: 'REP_S_00191',
    title: 'On Hold Transactions Log',
    endpoint: '/api/pos/transactions?type=on_hold',
    defaultOrientation: 'portrait',
    columns: [
      { key: 'holdId', label: 'Hold Reference', align: 'left', format: 'text' },
      { key: 'createdAt', label: 'Held At', align: 'center', format: 'text' },
      { key: 'customer', label: 'Customer', align: 'left', format: 'text' },
      { key: 'itemCount', label: 'Items', align: 'center', format: 'text' },
      { key: 'holdValueUsd', label: 'Hold Value ($)', align: 'right', format: 'currency' },
      { key: 'status', label: 'Status', align: 'center', format: 'badge' },
    ],
  },
  'REP_S_00192': {
    id: 'REP_S_00192',
    title: 'Cashier Shift Audit Log',
    endpoint: '/api/pos/transactions?type=shifts',
    defaultOrientation: 'portrait',
    columns: [
      { key: 'shiftId', label: 'Shift #', align: 'left', format: 'text' },
      { key: 'cashierName', label: 'Staff Name', align: 'left', format: 'text' },
      { key: 'openingCashUsd', label: 'Float ($)', align: 'right', format: 'currency' },
      { key: 'closingCashUsd', label: 'Counted ($)', align: 'right', format: 'currency' },
      { key: 'varianceUsd', label: 'Variance ($)', align: 'right', format: 'currency' },
      { key: 'shiftStatus', label: 'Audit Status', align: 'center', format: 'badge' },
    ],
  },
  'REP_S_00193': {
    id: 'REP_S_00193',
    title: 'Summary of Discounts',
    endpoint: '/api/pos/transactions?type=discounts',
    defaultOrientation: 'portrait',
    columns: [
      { key: 'discountCode', label: 'Discount Type', align: 'left', format: 'text' },
      { key: 'orderCount', label: 'Orders Applied', align: 'center', format: 'text' },
      { key: 'totalDiscountUsd', label: 'Total Discount ($)', align: 'right', format: 'currency' },
      { key: 'totalDiscountLbp', label: 'Total Discount (LBP)', align: 'right', format: 'currency' },
      { key: 'avgDiscountPct', label: 'Avg Discount %', align: 'center', format: 'badge' },
    ],
  },
  'REP_S_00215': {
    id: 'REP_S_00215',
    title: 'Summary of Voids & Cancellations',
    endpoint: '/api/pos/transactions?type=voids',
    defaultOrientation: 'landscape',
    columns: [
      { key: 'voidDate', label: 'Void Date', align: 'left', format: 'date' },
      { key: 'invoiceNo', label: 'Original Invoice', align: 'left', format: 'text' },
      { key: 'itemName', label: 'Item Description', align: 'left', format: 'text' },
      { key: 'qty', label: 'Qty', align: 'center', format: 'text' },
      { key: 'valueUsd', label: 'Value ($)', align: 'right', format: 'currency' },
      { key: 'reason', label: 'Void Reason', align: 'left', format: 'text' },
      { key: 'authorizedBy', label: 'Authorized By', align: 'left', format: 'text' },
    ],
  },
  'REP_S_00216': {
    id: 'REP_S_00216',
    title: 'Summary of Returns & Refunds',
    endpoint: '/api/pos/transactions?type=refunds',
    defaultOrientation: 'landscape',
    columns: [
      { key: 'refundDate', label: 'Date', align: 'left', format: 'date' },
      { key: 'refundVoucher', label: 'Refund Voucher', align: 'left', format: 'text' },
      { key: 'originalInvoice', label: 'Original Invoice', align: 'left', format: 'text' },
      { key: 'customer', label: 'Customer', align: 'left', format: 'text' },
      { key: 'refundAmountUsd', label: 'Refund ($)', align: 'right', format: 'currency' },
      { key: 'refundAmountLbp', label: 'Refund (LBP)', align: 'right', format: 'currency' },
      { key: 'method', label: 'Refund Tender', align: 'center', format: 'badge' },
    ],
  },
  'REP_S_00217': {
    id: 'REP_S_00217',
    title: 'Duplicate Invoices Audit Register',
    endpoint: '/api/pos/transactions?type=duplicate_audit',
    defaultOrientation: 'landscape',
    columns: [
      { key: 'invoiceNumber', label: 'Invoice #', align: 'left', format: 'text' },
      { key: 'countInstances', label: 'Occurrences', align: 'center', format: 'badge' },
      { key: 'customerName', label: 'Customer Name', align: 'left', format: 'text' },
      { key: 'amountUsd', label: 'Total Value ($)', align: 'right', format: 'currency' },
      { key: 'issueDate', label: 'First Issue Date', align: 'center', format: 'date' },
      { key: 'auditRecommendation', label: 'Audit Flag', align: 'left', format: 'text' },
    ],
  },
  'REP_S_00220': {
    id: 'REP_S_00220',
    title: 'Summary of Payments by Tender Mode',
    endpoint: '/api/pos/transactions?type=payments_summary',
    defaultOrientation: 'portrait',
    columns: [
      { key: 'tenderMode', label: 'Payment Method', align: 'left', format: 'text' },
      { key: 'transactionCount', label: 'Tx Count', align: 'center', format: 'text' },
      { key: 'amountUsd', label: 'Collected ($)', align: 'right', format: 'currency' },
      { key: 'amountLbp', label: 'Collected (LBP)', align: 'right', format: 'currency' },
      { key: 'sharePercent', label: 'Share %', align: 'center', format: 'badge' },
    ],
  },
  'REP_S_00221': {
    id: 'REP_S_00221',
    title: 'Payment Collection by Department',
    endpoint: '/api/pos/transactions?type=dept_payments',
    defaultOrientation: 'portrait',
    columns: [
      { key: 'departmentName', label: 'Operational Department', align: 'left', format: 'text' },
      { key: 'cashUsd', label: 'Cash ($)', align: 'right', format: 'currency' },
      { key: 'cardUsd', label: 'Card / POS ($)', align: 'right', format: 'currency' },
      { key: 'creditUsd', label: 'On Account ($)', align: 'right', format: 'currency' },
      { key: 'totalCollectedUsd', label: 'Total ($)', align: 'right', format: 'currency' },
    ],
  },
  'REP_S_00280': {
    id: 'REP_S_00280',
    title: 'Top N Customers by Amount',
    endpoint: '/api/reports/engine?reportKey=TOP_N_CUSTOMERS',
    defaultOrientation: 'landscape',
    columns: [
      { key: 'rank', label: 'Rank', align: 'center', format: 'text' },
      { key: 'code', label: 'Customer Code', align: 'left', format: 'text' },
      { key: 'name', label: 'Customer Name', align: 'left', format: 'text' },
      { key: 'category', label: 'Channel / Category', align: 'left', format: 'text' },
      { key: 'invoices', label: 'Orders', align: 'center', format: 'text' },
      { key: 'avgTicket', label: 'Avg Ticket ($)', align: 'right', format: 'currency' },
      { key: 'totalUsd', label: 'Total Revenue ($)', align: 'right', format: 'currency' },
    ],
  },
  'REP_S_00281': {
    id: 'REP_S_00281',
    title: 'Customer Sales in Detail',
    endpoint: '/api/reports/engine?reportKey=CUSTOMER_IN_DETAIL',
    defaultOrientation: 'landscape',
    columns: [
      { key: 'invoiceNo', label: 'Invoice #', align: 'left', format: 'text' },
      { key: 'date', label: 'Date', align: 'left', format: 'date' },
      { key: 'items', label: 'Items Summary', align: 'left', format: 'text' },
      { key: 'payment', label: 'Tender', align: 'center', format: 'badge' },
      { key: 'subtotal', label: 'Subtotal ($)', align: 'right', format: 'currency' },
      { key: 'returns', label: 'Returns ($)', align: 'right', format: 'currency' },
      { key: 'totalUsd', label: 'Net Invoiced ($)', align: 'right', format: 'currency' },
    ],
  },
  'REP_S_00282': {
    id: 'REP_S_00282',
    title: 'Sales by Geographic Zone',
    endpoint: '/api/reports/engine?reportKey=SALES_BY_ZONE',
    defaultOrientation: 'portrait',
    columns: [
      { key: 'zone', label: 'Geographic Zone', align: 'left', format: 'text' },
      { key: 'route', label: 'Distribution Trunk', align: 'left', format: 'text' },
      { key: 'accounts', label: 'Active Outlets', align: 'center', format: 'text' },
      { key: 'deliveries', label: 'Deliveries', align: 'center', format: 'text' },
      { key: 'totalUsd', label: 'Revenue ($)', align: 'right', format: 'currency' },
    ],
  },
  'REP_S_00283': {
    id: 'REP_S_00283',
    title: 'Delivery Sales Summary',
    endpoint: '/api/reports/engine?reportKey=DELIVERY_SALES_SUMMARY',
    defaultOrientation: 'landscape',
    columns: [
      { key: 'dispatchId', label: 'Dispatch #', align: 'left', format: 'text' },
      { key: 'dateTime', label: 'Date & Time', align: 'left', format: 'text' },
      { key: 'customer', label: 'Customer Name', align: 'left', format: 'text' },
      { key: 'zone', label: 'Zone', align: 'left', format: 'text' },
      { key: 'courier', label: 'Driver / Van', align: 'left', format: 'text' },
      { key: 'status', label: 'Delivery Status', align: 'center', format: 'badge' },
      { key: 'totalUsd', label: 'Order Value ($)', align: 'right', format: 'currency' },
    ],
  },
  'REP_S_00284': {
    id: 'REP_S_00284',
    title: "Driver's History & Reconciliation Ledger",
    endpoint: '/api/reports/engine?reportKey=DRIVERS_HISTORY',
    defaultOrientation: 'landscape',
    columns: [
      { key: 'batchNo', label: 'Batch #', align: 'left', format: 'text' },
      { key: 'dateTime', label: 'Run Date', align: 'left', format: 'date' },
      { key: 'driver', label: 'Driver Name', align: 'left', format: 'text' },
      { key: 'vehicle', label: 'Assigned Vehicle', align: 'left', format: 'text' },
      { key: 'drops', label: 'Completed Drops', align: 'center', format: 'text' },
      { key: 'cashLbp', label: 'Cash Collected (LBP)', align: 'right', format: 'currency' },
      { key: 'audit', label: 'Settlement Status', align: 'center', format: 'badge' },
    ],
  },
  'REP_S_00285': {
    id: 'REP_S_00285',
    title: 'Sales by Customers Enterprise Ledger',
    endpoint: '/api/reports/engine?reportKey=SALES_BY_CUSTOMERS',
    defaultOrientation: 'landscape',
    columns: [
      { key: 'code', label: 'Customer #', align: 'left', format: 'text' },
      { key: 'name', label: 'Customer Name', align: 'left', format: 'text' },
      { key: 'tier', label: 'Account Tier', align: 'center', format: 'badge' },
      { key: 'terms', label: 'Payment Terms', align: 'center', format: 'text' },
      { key: 'creditLimit', label: 'Credit Limit ($)', align: 'right', format: 'currency' },
      { key: 'arBalance', label: 'Current AR ($)', align: 'right', format: 'currency' },
      { key: 'totalUsd', label: 'Annual Sales ($)', align: 'right', format: 'currency' },
    ],
  },
  'REP_IC_008': {
    id: 'REP_IC_008',
    title: 'Under Cost Sales & Margin Violation Audit',
    endpoint: '/api/control/under-cost',
    defaultOrientation: 'landscape',
    columns: [
      { key: 'invoiceNumber', label: 'Invoice #', align: 'left', format: 'text' },
      { key: 'itemCode', label: 'Item Code', align: 'left', format: 'text' },
      { key: 'itemName', label: 'Item Description', align: 'left', format: 'text' },
      { key: 'unitPriceUsd', label: 'Sale Price ($)', align: 'right', format: 'currency' },
      { key: 'unitCostUsd', label: 'Unit Cost ($)', align: 'right', format: 'currency' },
      { key: 'marginLossUsd', label: 'Margin Deficit ($)', align: 'right', format: 'currency' },
      { key: 'cashier', label: 'Cashier / Rep', align: 'left', format: 'text' },
      { key: 'approvedBy', label: 'Override Authorization', align: 'left', format: 'text' },
    ],
  },

  // ==========================================================================
  // 4. INVENTORY & WAREHOUSE CONTROL
  // ==========================================================================
  'REP_INV_001': {
    id: 'REP_INV_001',
    title: 'Inventory Stock Valuation & Status',
    endpoint: '/api/inventory/valuations',
    defaultOrientation: 'landscape',
    columns: [
      { key: 'itemCode', label: 'Item Code', align: 'left', format: 'text' },
      { key: 'itemName', label: 'Description', align: 'left', format: 'text' },
      { key: 'warehouse', label: 'Warehouse', align: 'left', format: 'text' },
      { key: 'quantityOnHand', label: 'Stock On Hand', align: 'center', format: 'text' },
      { key: 'unitCostUsd', label: 'Unit Cost ($)', align: 'right', format: 'currency' },
      { key: 'totalValuationUsd', label: 'Total Value ($)', align: 'right', format: 'currency' },
      { key: 'totalValuationLbp', label: 'Total Value (LBP)', align: 'right', format: 'currency' },
    ],
  },
  'REP_INV_002': {
    id: 'REP_INV_002',
    title: 'Warehouse Balance by Location',
    endpoint: '/api/inventory/stocks',
    defaultOrientation: 'portrait',
    columns: [
      { key: 'warehouseName', label: 'Warehouse / Silo', align: 'left', format: 'text' },
      { key: 'category', label: 'Category', align: 'left', format: 'text' },
      { key: 'itemCount', label: 'SKU Count', align: 'center', format: 'text' },
      { key: 'totalUnits', label: 'Total Units', align: 'center', format: 'text' },
      { key: 'warehouseCapacityUsed', label: 'Capacity Utilization', align: 'center', format: 'badge' },
    ],
  },
  'REP_INV_003': {
    id: 'REP_INV_003',
    title: 'Stock Reorder Alerts & Shortages',
    endpoint: '/api/inventory/stocks?filter=reorder',
    defaultOrientation: 'portrait',
    columns: [
      { key: 'code', label: 'Item Code', align: 'left', format: 'text' },
      { key: 'name', label: 'Item Description', align: 'left', format: 'text' },
      { key: 'currentStock', label: 'Current Stock', align: 'center', format: 'text' },
      { key: 'reorderPoint', label: 'Reorder Level', align: 'center', format: 'text' },
      { key: 'suggestedOrder', label: 'Suggested Order', align: 'center', format: 'badge' },
    ],
  },
  'REP_INV_004': {
    id: 'REP_INV_004',
    title: 'Inventory Adjustment Ledger',
    endpoint: '/api/inventory/adjustments',
    defaultOrientation: 'landscape',
    columns: [
      { key: 'adjNumber', label: 'Adjustment #', align: 'left', format: 'text' },
      { key: 'date', label: 'Date', align: 'left', format: 'date' },
      { key: 'itemCode', label: 'Item Code', align: 'left', format: 'text' },
      { key: 'varianceQty', label: 'Qty Variance', align: 'center', format: 'text' },
      { key: 'varianceCostUsd', label: 'Cost Impact ($)', align: 'right', format: 'currency' },
      { key: 'reason', label: 'Reason Description', align: 'left', format: 'text' },
      { key: 'managerApproval', label: 'Manager Sign-off', align: 'center', format: 'badge' },
    ],
  },

  // ==========================================================================
  // 5. PRESSING MILL & AGRICULTURAL INTAKE
  // ==========================================================================
  'REP_MILL_001': {
    id: 'REP_MILL_001',
    title: 'Olive Intake & Weighbridge Log',
    endpoint: '/api/pressing/weighbridge',
    defaultOrientation: 'landscape',
    columns: [
      { key: 'ticketNo', label: 'Ticket #', align: 'left', format: 'text' },
      { key: 'farmerName', label: 'Farmer / Grower', align: 'left', format: 'text' },
      { key: 'grossKg', label: 'Gross (kg)', align: 'right', format: 'text' },
      { key: 'tareKg', label: 'Tare (kg)', align: 'right', format: 'text' },
      { key: 'netKg', label: 'Net Olives (kg)', align: 'right', format: 'text' },
      { key: 'variety', label: 'Olive Cultivar', align: 'center', format: 'text' },
      { key: 'qualityGrade', label: 'Acid / Grade', align: 'center', format: 'badge' },
      { key: 'intakeDate', label: 'Intake Date', align: 'center', format: 'date' },
    ],
  },
  'REP_MILL_002': {
    id: 'REP_MILL_002',
    title: 'Pressing Batches & Extraction Yield',
    endpoint: '/api/pressing/batches',
    defaultOrientation: 'landscape',
    columns: [
      { key: 'batchNo', label: 'Batch #', align: 'left', format: 'text' },
      { key: 'pressLine', label: 'Press Line / Decanter', align: 'left', format: 'text' },
      { key: 'olivesProcessedKg', label: 'Olives Milled (kg)', align: 'right', format: 'text' },
      { key: 'oilExtractedKg', label: 'Oil Yield (kg)', align: 'right', format: 'text' },
      { key: 'yieldPercentage', label: 'Yield %', align: 'center', format: 'badge' },
      { key: 'acidityLevel', label: 'Acidity %', align: 'center', format: 'badge' },
      { key: 'destinationTank', label: 'Stored In Tank', align: 'center', format: 'text' },
    ],
  },
  'REP_MILL_003': {
    id: 'REP_MILL_003',
    title: 'Storage Tank Levels & Oil Quality',
    endpoint: '/api/pressing/tanks',
    defaultOrientation: 'portrait',
    columns: [
      { key: 'tankCode', label: 'Tank ID', align: 'left', format: 'text' },
      { key: 'capacityLiters', label: 'Capacity (L)', align: 'right', format: 'text' },
      { key: 'currentLiters', label: 'Current Level (L)', align: 'right', format: 'text' },
      { key: 'oilGrade', label: 'Oil Classification', align: 'left', format: 'text' },
      { key: 'fillPercentage', label: 'Capacity %', align: 'center', format: 'badge' },
      { key: 'sanitizationStatus', label: 'Tank Status', align: 'center', format: 'badge' },
    ],
  },

  // ==========================================================================
  // 6. SUPERSONIC FLEET & 3PL LOGISTICS
  // ==========================================================================
  'REP_FLEET_001': {
    id: 'REP_FLEET_001',
    title: 'Fleet Dispatch & Delivery Trip Ledger',
    endpoint: '/api/supersonic/dispatch',
    defaultOrientation: 'landscape',
    columns: [
      { key: 'dispatchNo', label: 'Trip #', align: 'left', format: 'text' },
      { key: 'driverName', label: 'Driver', align: 'left', format: 'text' },
      { key: 'vehiclePlate', label: 'Vehicle', align: 'left', format: 'text' },
      { key: 'destinationZone', label: 'Corridor / Zone', align: 'left', format: 'text' },
      { key: 'stopsCount', label: 'Stops', align: 'center', format: 'text' },
      { key: 'totalCodUsd', label: 'COD Total ($)', align: 'right', format: 'currency' },
      { key: 'tripStatus', label: 'Trip Status', align: 'center', format: 'badge' },
    ],
  },

  // ==========================================================================
  // 7. SOCIAL MEDIA HUB & MULTI-CHANNEL CRM
  // ==========================================================================
  'REP_SOC_001': {
    id: 'REP_SOC_001',
    title: 'Social Channel Order Attribution',
    endpoint: '/api/social/stats',
    defaultOrientation: 'portrait',
    columns: [
      { key: 'platform', label: 'Channel / Platform', align: 'left', format: 'text' },
      { key: 'inboundLeads', label: 'Inbound Chats', align: 'center', format: 'text' },
      { key: 'convertedOrders', label: 'Orders Closed', align: 'center', format: 'text' },
      { key: 'conversionRate', label: 'Conversion %', align: 'center', format: 'badge' },
      { key: 'revenueUsd', label: 'Revenue ($)', align: 'right', format: 'currency' },
    ],
  },
  'REP_SOC_002': {
    id: 'REP_SOC_002',
    title: 'Marketing Campaign Spend & ROI',
    endpoint: '/api/social/campaigns',
    defaultOrientation: 'landscape',
    columns: [
      { key: 'campaignName', label: 'Campaign Title', align: 'left', format: 'text' },
      { key: 'platform', label: 'Platform', align: 'left', format: 'text' },
      { key: 'adSpendUsd', label: 'Ad Spend ($)', align: 'right', format: 'currency' },
      { key: 'leadsGenerated', label: 'Leads', align: 'center', format: 'text' },
      { key: 'ordersGenerated', label: 'Orders', align: 'center', format: 'text' },
      { key: 'revenueGeneratedUsd', label: 'Revenue ($)', align: 'right', format: 'currency' },
      { key: 'roas', label: 'ROAS Multiple', align: 'center', format: 'badge' },
    ],
  },
};

/**
 * Resolves a report definition by ID, code, or title
 */
export function getReportDefinition(reportIdOrTitle: string): ReportDefinition | null {
  if (!reportIdOrTitle) return null;
  const clean = reportIdOrTitle.trim();
  const upper = clean.toUpperCase();
  const lower = clean.toLowerCase();

  // 1. Direct key match
  if (UNIVERSAL_REPORT_REGISTRY[upper]) return UNIVERSAL_REPORT_REGISTRY[upper];
  if (UNIVERSAL_REPORT_REGISTRY[clean]) return UNIVERSAL_REPORT_REGISTRY[clean];

  // 2. Exact match by id or title
  for (const def of Object.values(UNIVERSAL_REPORT_REGISTRY)) {
    if (def.id.toUpperCase() === upper || def.title.toLowerCase() === lower) {
      return def;
    }
  }

  // 3. Search by partial or canonical slug
  for (const def of Object.values(UNIVERSAL_REPORT_REGISTRY)) {
    if (
      lower.includes(def.id.toLowerCase()) ||
      lower.includes(def.title.toLowerCase()) ||
      def.title.toLowerCase().includes(lower)
    ) {
      return def;
    }
  }

  return null;
}

/**
 * Returns all registered report definitions
 */
export function getAllReportDefinitions(): ReportDefinition[] {
  return Object.values(UNIVERSAL_REPORT_REGISTRY);
}
