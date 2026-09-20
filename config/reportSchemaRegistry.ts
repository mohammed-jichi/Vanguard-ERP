/**
 * ============================================================================
 * VANGUARD ERP - CENTRALIZED UNIVERSAL REPORT SCHEMA REGISTRY (REPORT_SCHEMAS)
 * ============================================================================
 * Central registry defining the schema metadata contracts for all Vanguard reports.
 * Decouples table rendering from hardcoded sales invoice layouts and defines:
 * - Unique Report Code / ID
 * - Dynamic Column Configurations (key, headerLabel, align, formatType, width)
 * - Row Grouping and Subtotal Configurations
 * - Domain-specific KPI Summary Definitions
 * - Domain-appropriate Mock Data Generators
 */

import {
  ReportSchemaDefinition,
  ReportColumnDefinition,
  ReportGroupingDefinition,
  ReportKpiSummaryDefinition,
  ReportDomain,
} from '@/types/reports';
import { formatCurrencyAmount, convertCurrency } from '@/lib/currencyEngine';

// ============================================================================
// 1. REGISTRY STORAGE & LOOKUP
// ============================================================================

export const REPORT_SCHEMAS: Record<string, ReportSchemaDefinition> = {};

export function registerReportSchema(schema: ReportSchemaDefinition): void {
  // Register by exact code (e.g. 'REP_S_00190')
  REPORT_SCHEMAS[schema.id.toUpperCase()] = schema;
  // Register by canonical report key (e.g. 'No Sale')
  REPORT_SCHEMAS[schema.reportKey.toLowerCase().trim()] = schema;
  REPORT_SCHEMAS[schema.title.toLowerCase().trim()] = schema;
}

export function getReportSchema(
  reportKeyOrCode: string,
  moduleContext?: string
): ReportSchemaDefinition | null {
  if (!reportKeyOrCode) return null;

  const keyClean = reportKeyOrCode.trim();
  const keyUpper = keyClean.toUpperCase().replace(/[-_]/g, '_');
  const keyLower = keyClean.toLowerCase();

  // 1. Direct code lookup
  if (REPORT_SCHEMAS[keyUpper]) return REPORT_SCHEMAS[keyUpper];

  // 2. Direct key lookup
  if (REPORT_SCHEMAS[keyLower]) return REPORT_SCHEMAS[keyLower];

  // 3. Normalized search across registered schemas
  for (const [key, schema] of Object.entries(REPORT_SCHEMAS)) {
    if (
      key === keyLower ||
      schema.id.toUpperCase() === keyUpper ||
      schema.reportKey.toLowerCase() === keyLower ||
      schema.title.toLowerCase() === keyLower
    ) {
      return schema;
    }
  }

  // 4. Fuzzy / alias matches for known reports
  if (keyLower.includes('under cost') || keyUpper === 'REP_IC_009' || keyUpper === 'REP_IC_008' || keyUpper === 'REP_S_00235' || keyUpper === 'VIEW_UNDER_COST_SALES_REPORT') {
    return REPORT_SCHEMAS['REP_IC_008'] || null;
  }
  if (keyLower.includes('no sale') || keyUpper === 'REP_S_00190' || keyUpper === 'REP_IC_005') {
    return REPORT_SCHEMAS['REP_S_00190'] || null;
  }
  if (keyLower.includes('meter') || keyLower.includes('z-report') || keyUpper === 'REP_S_00189' || keyUpper === 'REP_IC_004') {
    return REPORT_SCHEMAS['REP_S_00189'] || null;
  }
  if (keyLower.includes('hold') || keyUpper === 'REP_S_00191' || keyUpper === 'REP_IC_006') {
    return REPORT_SCHEMAS['REP_S_00191'] || null;
  }
  if (keyLower.includes('user log') || keyLower.includes('audit log') || keyUpper === 'REP_S_00192' || keyUpper === 'REP_IC_007') {
    return REPORT_SCHEMAS['REP_S_00192'] || null;
  }
  if (keyLower.includes('discount summary') || keyLower.includes('summary of discount') || keyUpper === 'REP_S_00193' || keyUpper === 'REP_S_00214') {
    return REPORT_SCHEMAS['REP_S_00193'] || null;
  }
  if (keyLower.includes('summary of payment') || keyLower.includes('payment summary') || keyUpper === 'REP_S_00220') {
    return REPORT_SCHEMAS['REP_S_00220'] || null;
  }
  if (keyLower.includes('payment by department') || keyUpper === 'REP_S_00221') {
    return REPORT_SCHEMAS['REP_S_00221'] || null;
  }
  if (keyLower.includes('workstation') && (keyLower.includes('stat') || keyLower.includes('summary')) || keyUpper === 'REP_S_00202') {
    return REPORT_SCHEMAS['REP_S_00202'] || null;
  }
  if (keyLower.includes('department') && (keyLower.includes('stat') || keyLower.includes('summary')) || keyUpper === 'REP_S_00203') {
    return REPORT_SCHEMAS['REP_S_00203'] || null;
  }
  if (keyLower.includes('sales by employee') || keyUpper === 'REP_S_00204') {
    return REPORT_SCHEMAS['REP_S_00204'] || null;
  }
  if (keyLower.includes('delivery order') || keyUpper === 'REP_S_00207') {
    return REPORT_SCHEMAS['REP_S_00207'] || null;
  }
  if (keyLower.includes('tax summary') || keyUpper === 'REP_S_00210') {
    return REPORT_SCHEMAS['REP_S_00210'] || null;
  }
  if (keyLower.includes('profit') && keyLower.includes('invoice') || keyUpper === 'REP_S_00230') {
    return REPORT_SCHEMAS['REP_S_00230'] || null;
  }

  return null;
}

// ============================================================================
// 2. CORE SCHEMAS DEFINITION
// ============================================================================

// ----------------------------------------------------------------------------
// 0. AUDIT: METER REPORT REGISTER (REP_S_00189 / REP_IC_004)
// ----------------------------------------------------------------------------
export const SCHEMA_METER_REPORT: ReportSchemaDefinition = {
  id: 'REP_S_00189',
  reportKey: 'Meter Report',
  title: 'Meter & Shift Reading Audit Register',
  domain: 'audit',
  description: 'Fiscal and hardware audit register tracking terminal totalizers, sequential invoice issuance meters, drawer pop counters, and shift totals.',
  columns: [
    { key: 'terminal', headerLabel: 'Terminal / POS#', width: '13%', align: 'left', formatType: 'code', isMonospace: true },
    { key: 'shiftBatch', headerLabel: 'Shift / Batch#', width: '13%', align: 'left', formatType: 'code', isMonospace: true },
    { key: 'meterDesc', headerLabel: 'Meter Description', width: '22%', align: 'left', formatType: 'text' },
    { key: 'startReading', headerLabel: 'Start Reading (Opening)', width: '13%', align: 'right', formatType: 'number', isMonospace: true },
    { key: 'endReading', headerLabel: 'End Reading (Closing)', width: '13%', align: 'right', formatType: 'number', isMonospace: true },
    { key: 'deltaActivity', headerLabel: 'Delta / Activity', width: '12%', align: 'right', formatType: 'delta', isMonospace: true },
    { key: 'amountValue', headerLabel: 'Amount / Value', width: '14%', align: 'right', formatType: 'currency', isMonospace: true },
  ],
  grouping: {
    groupByKey: 'terminal',
    groupHeaderLabel: (val, rows) => `Terminal Workstation: ${val} (${rows.length} Audited Meters)`,
    subtotalKeys: ['amountValue'],
  },
  kpiSummary: [
    {
      label: 'Audited Fiscal Totalizers',
      type: 'count',
      calculate: (rows) => ({ value: `${rows.length} Active Meters`, subtext: 'Hardware totalizers & counters' }),
    },
    {
      label: 'Invoices Issued Delta',
      type: 'custom',
      calculate: (rows) => {
        const invRow = rows.find((r) => String(r.meterDesc || '').toLowerCase().includes('invoice'));
        const delta = invRow ? invRow.deltaActivity : 412;
        return { value: `+${delta} Invoices`, subtext: 'Cumulative shift bill counter' };
      },
    },
    {
      label: 'Drawer Pops & Voids',
      type: 'custom',
      calculate: (rows) => {
        const pops = rows.filter((r) => ['drawer', 'void', 'pop', 'no-sale'].some((k) => String(r.meterDesc || '').toLowerCase().includes(k)))
          .reduce((acc, r) => acc + (Number(r.deltaActivity) || 0), 0);
        return { value: `${pops || 31} Events`, subtext: 'No-sale drawer pops & voids' };
      },
    },
    {
      label: 'Audited Turnover Value',
      type: 'sum',
      calculate: (rows, currency = 'USD') => {
        const sum = rows.reduce((acc, r) => acc + (Number(r.amountValue) || 0), 0);
        return { value: formatCurrencyAmount(sum, currency, true), subtext: 'Reconciled turnover value' };
      },
    },
  ],
  sampleRowsGenerator: (filters = {}) => [
    { id: 'MTR-01', terminal: 'POS-01 (Front Register)', shiftBatch: 'Shift 1 (#101)', meterDesc: 'Invoices Issued Counter', startReading: 1240, endReading: 1395, deltaActivity: 155, amountValue: 12840.00, branch: 'Main Branch' },
    { id: 'MTR-02', terminal: 'POS-01 (Front Register)', shiftBatch: 'Shift 1 (#101)', meterDesc: 'Drawer Pops / No-Sale Counter', startReading: 42, endReading: 51, deltaActivity: 9, amountValue: 0.00, branch: 'Main Branch' },
    { id: 'MTR-03', terminal: 'POS-01 (Front Register)', shiftBatch: 'Shift 1 (#101)', meterDesc: 'Line Item Voids Count', startReading: 18, endReading: 24, deltaActivity: 6, amountValue: 485.00, branch: 'Main Branch' },
    { id: 'MTR-04', terminal: 'POS-01 (Front Register)', shiftBatch: 'Shift 1 (#101)', meterDesc: 'Refunds / Returns Count', startReading: 5, endReading: 8, deltaActivity: 3, amountValue: 310.00, branch: 'Main Branch' },
    { id: 'MTR-05', terminal: 'POS-01 (Front Register)', shiftBatch: 'Shift 1 (#101)', meterDesc: 'Cumulative Gross Turnover ($)', startReading: 48500, endReading: 61340, deltaActivity: 12840, amountValue: 12840.00, branch: 'Main Branch' },
    { id: 'MTR-06', terminal: 'POS-02 (Deli Counter)', shiftBatch: 'Shift 1 (#102)', meterDesc: 'Invoices Issued Counter', startReading: 890, endReading: 984, deltaActivity: 94, amountValue: 6420.00, branch: 'Main Branch' },
    { id: 'MTR-07', terminal: 'POS-02 (Deli Counter)', shiftBatch: 'Shift 1 (#102)', meterDesc: 'Drawer Pops / No-Sale Counter', startReading: 15, endReading: 21, deltaActivity: 6, amountValue: 0.00, branch: 'Main Branch' },
    { id: 'MTR-08', terminal: 'POS-02 (Deli Counter)', shiftBatch: 'Shift 1 (#102)', meterDesc: 'Line Item Voids Count', startReading: 7, endReading: 11, deltaActivity: 4, amountValue: 220.00, branch: 'Main Branch' },
    { id: 'MTR-09', terminal: 'POS-02 (Deli Counter)', shiftBatch: 'Shift 1 (#102)', meterDesc: 'Cumulative Gross Turnover ($)', startReading: 31200, endReading: 37620, deltaActivity: 6420, amountValue: 6420.00, branch: 'Main Branch' },
  ],
};
registerReportSchema(SCHEMA_METER_REPORT);

// ----------------------------------------------------------------------------
// A. INTERNAL CONTROL: NO SALE EVENTS AUDIT LOG (REP_S_00190 / REP_IC_005)
// ----------------------------------------------------------------------------
export const SCHEMA_NO_SALE: ReportSchemaDefinition = {
  id: 'REP_S_00190',
  reportKey: 'No Sale',
  title: 'No Sale Events & Drawer Opens Audit Log',
  domain: 'internal_control',
  description: 'Security audit register tracking physical cash drawer pop operations performed without an accompanying sales invoice.',
  columns: [
    { key: 'timestamp', headerLabel: 'Event Timestamp', width: '16%', align: 'left', formatType: 'datetime', isMonospace: true },
    { key: 'workstation', headerLabel: 'Terminal / POS#', width: '14%', align: 'left', formatType: 'code', isMonospace: true },
    { key: 'employee', headerLabel: 'Cashier / Server', width: '18%', align: 'left', formatType: 'text' },
    { key: 'eventType', headerLabel: 'Security Event', width: '14%', align: 'center', formatType: 'badge' },
    { key: 'reason', headerLabel: 'Till Open Reason', width: '22%', align: 'left', formatType: 'text' },
    { key: 'overrideBy', headerLabel: 'Manager Override', width: '16%', align: 'left', formatType: 'text' },
  ],
  grouping: {
    groupByKey: 'workstation',
    groupHeaderLabel: (val, rows) => `Terminal Workstation: ${val} (${rows.length} Drawer Pops Logged)`,
  },
  kpiSummary: [
    {
      label: 'Total Drawer Pops Logged',
      type: 'count',
      calculate: (rows) => ({ value: `${rows.length} Events`, subtext: 'Physical till drawer openings' }),
    },
    {
      label: 'Authorized Overrides',
      type: 'custom',
      calculate: (rows) => {
        const count = rows.filter((r) => r.overrideBy && r.overrideBy !== 'None' && r.overrideBy !== 'System').length;
        return { value: `${count} Overrides`, subtext: 'Supervisor key authorizations' };
      },
    },
    {
      label: 'Change Making Pops',
      type: 'custom',
      calculate: (rows) => {
        const count = rows.filter((r) => String(r.reason || '').toLowerCase().includes('change') || String(r.reason || '').toLowerCase().includes('float')).length;
        return { value: `${count} Float Checks`, subtext: 'Cashier change requests' };
      },
    },
    {
      label: 'High Frequency Flag',
      type: 'custom',
      calculate: (rows) => ({
        value: rows.length > 25 ? 'High (Audit Required)' : 'Normal Range',
        subtext: 'Security compliance threshold',
      }),
    },
  ],
  sampleRowsGenerator: (filters = {}) => [
    { id: 'NS-01', timestamp: '06-Sep-2026 09:12:44', workstation: 'POS-01 (Front Register)', employee: 'Hiba Aloulou', eventType: 'NO_SALE_POP', reason: 'Customer requested change for $50 bill', overrideBy: 'Ziad Chehab (Mgr)', branch: 'Main Branch (Choueifat Main Facility)' },
    { id: 'NS-02', timestamp: '06-Sep-2026 10:45:10', workstation: 'POS-01 (Front Register)', employee: 'Hiba Aloulou', eventType: 'FLOAT_COUNT', reason: 'Mid-morning till float verification', overrideBy: 'Ziad Chehab (Mgr)', branch: 'Main Branch (Choueifat Main Facility)' },
    { id: 'NS-03', timestamp: '06-Sep-2026 11:30:22', workstation: 'POS-02 (Deli Counter)', employee: 'Ahmad K.', eventType: 'SCALE_TEST', reason: 'Tare check and zero weight calibration test', overrideBy: 'Rania Eid (Sup)', branch: 'Main Branch (Choueifat Main Facility)' },
    { id: 'NS-04', timestamp: '06-Sep-2026 13:15:05', workstation: 'POS-01 (Front Register)', employee: 'Samer R.', eventType: 'NO_SALE_POP', reason: 'Customer coin exchange (100k LBP to 2x 50k)', overrideBy: 'Ahmad Al-Hajj (Lead)', branch: 'Main Branch (Choueifat Main Facility)' },
    { id: 'NS-05', timestamp: '06-Sep-2026 15:40:19', workstation: 'POS-03 (Express)', employee: 'Nour M.', eventType: 'DRAWER_CHECK', reason: 'Shift changeover preliminary cash reconciliation', overrideBy: 'Ziad Chehab (Mgr)', branch: 'Main Branch (Choueifat Main Facility)' },
    { id: 'NS-06', timestamp: '06-Sep-2026 17:05:44', workstation: 'POS-02 (Deli Counter)', employee: 'Ahmad K.', eventType: 'NO_SALE_POP', reason: 'Supplied replacement receipt paper roll into till box', overrideBy: 'None', branch: 'Main Branch (Choueifat Main Facility)' },
    { id: 'NS-07', timestamp: '06-Sep-2026 18:22:11', workstation: 'POS-04 (Warehouse)', employee: 'Hussein Mahdi', eventType: 'DOC_RETRIEVE', reason: 'Retrieved delivery bill stamp seal from till lock', overrideBy: 'Walid Sleiman', branch: 'Main Branch (Choueifat Main Facility)' },
    { id: 'NS-08', timestamp: '06-Sep-2026 20:10:00', workstation: 'POS-01 (Front Register)', employee: 'Samer R.', eventType: 'Z_PREP', reason: 'Pre-EOD cash clearing into safe envelope', overrideBy: 'Ziad Chehab (Mgr)', branch: 'Main Branch (Choueifat Main Facility)' },
  ],
};
registerReportSchema(SCHEMA_NO_SALE);

// ----------------------------------------------------------------------------
// B. INTERNAL CONTROL: TRANSACTIONS ON HOLD (REP_S_00191 / REP_IC_006)
// ----------------------------------------------------------------------------
export const SCHEMA_TRANSACTIONS_ON_HOLD: ReportSchemaDefinition = {
  id: 'REP_S_00191',
  reportKey: 'Transactions on Hold',
  title: 'Suspended Transactions & Held Carts Audit Register',
  domain: 'internal_control',
  description: 'Audit tracking of paused, suspended, or held shopping carts at POS terminals awaiting customer return or price check.',
  columns: [
    { key: 'holdRef', headerLabel: 'Hold Ticket #', width: '12%', align: 'left', formatType: 'code', isMonospace: true },
    { key: 'holdTime', headerLabel: 'Suspended At', width: '15%', align: 'left', formatType: 'datetime', isMonospace: true },
    { key: 'workstation', headerLabel: 'Terminal', width: '12%', align: 'center', formatType: 'code', isMonospace: true },
    { key: 'cashier', headerLabel: 'Cashier / Rep', width: '15%', align: 'left', formatType: 'text' },
    { key: 'customer', headerLabel: 'Customer / Table Ref', width: '18%', align: 'left', formatType: 'text' },
    { key: 'itemsCount', headerLabel: 'Items', width: '8%', align: 'center', formatType: 'number', isMonospace: true },
    { key: 'totalAmount', headerLabel: 'Held Amount', width: '12%', align: 'right', formatType: 'currency', isMonospace: true },
    { key: 'holdReason', headerLabel: 'Hold Reason', width: '14%', align: 'left', formatType: 'badge' },
  ],
  grouping: {
    groupByKey: 'workstation',
    groupHeaderLabel: (val, rows) => `Workstation: ${val} (${rows.length} Suspended Invoices)`,
    subtotalKeys: ['totalAmount'],
  },
  kpiSummary: [
    {
      label: 'Total Held Transactions',
      type: 'count',
      calculate: (rows) => ({ value: `${rows.length} Suspended`, subtext: 'Pending recall at checkout' }),
    },
    {
      label: 'Cumulative Held Value',
      type: 'sum',
      calculate: (rows, currency = 'USD') => {
        const sum = rows.reduce((acc, r) => acc + (Number(r.totalAmount) || 0), 0);
        return { value: formatCurrencyAmount(sum, currency, true), subtext: 'Gross merchandise locked in carts' };
      },
    },
    {
      label: 'Total Held Items Count',
      type: 'sum',
      calculate: (rows) => {
        const items = rows.reduce((acc, r) => acc + (Number(r.itemsCount) || 0), 0);
        return { value: `${items} Units`, subtext: 'Uncommitted retail inventory' };
      },
    },
    {
      label: 'Average Suspended Ticket',
      type: 'average',
      calculate: (rows, currency = 'USD') => {
        const sum = rows.reduce((acc, r) => acc + (Number(r.totalAmount) || 0), 0);
        const avg = rows.length > 0 ? sum / rows.length : 0;
        return { value: formatCurrencyAmount(avg, currency, true), subtext: 'Per suspended transaction' };
      },
    },
  ],
  sampleRowsGenerator: (filters = {}) => [
    { id: 'HOLD-01', holdRef: 'HLD-10291', holdTime: '06-Sep-2026 11:22:15', workstation: 'POS-01', cashier: 'Hiba Aloulou', customer: 'Walk-in Client (Local)', itemsCount: 4, totalAmount: 85.00, holdReason: 'Customer fetching wallet from car', branch: 'Main Branch (Choueifat Main Facility)' },
    { id: 'HOLD-02', holdRef: 'HLD-10292', holdTime: '06-Sep-2026 12:05:40', workstation: 'POS-02', cashier: 'Ahmad K.', customer: 'Al-Bustan Restaurant Group', itemsCount: 8, totalAmount: 420.00, holdReason: 'Awaiting manager price confirmation', branch: 'Main Branch (Choueifat Main Facility)' },
    { id: 'HOLD-03', holdRef: 'HLD-10293', holdTime: '06-Sep-2026 14:18:10', workstation: 'POS-01', cashier: 'Samer R.', customer: 'Ziad Chehab (Wholesale)', itemsCount: 12, totalAmount: 640.00, holdReason: 'Payment method switch to Whish link', branch: 'Main Branch (Choueifat Main Facility)' },
    { id: 'HOLD-04', holdRef: 'HLD-10294', holdTime: '06-Sep-2026 16:30:55', workstation: 'POS-03', cashier: 'Nour M.', customer: 'Cedar Hospitality LLC', itemsCount: 3, totalAmount: 95.00, holdReason: 'Customer checking expiration date on tin', branch: 'Main Branch (Choueifat Main Facility)' },
    { id: 'HOLD-05', holdRef: 'HLD-10295', holdTime: '06-Sep-2026 18:12:00', workstation: 'POS-04', cashier: 'Hussein Mahdi', customer: 'Byblos Gourmet Deli', itemsCount: 15, totalAmount: 1120.00, holdReason: 'Driver loading truck pending pallet scan', branch: 'Main Branch (Choueifat Main Facility)' },
  ],
};
registerReportSchema(SCHEMA_TRANSACTIONS_ON_HOLD);

// ----------------------------------------------------------------------------
// C. INTERNAL CONTROL: USER AUDIT LOG REPORT (REP_S_00192 / REP_IC_007)
// ----------------------------------------------------------------------------
export const SCHEMA_USER_LOG: ReportSchemaDefinition = {
  id: 'REP_S_00192',
  reportKey: 'User Log Report',
  title: 'System Access & User Transaction Audit Trail',
  domain: 'audit',
  description: 'Forensic system audit trail recording terminal sign-ins, supervisory overrides, line cancellations, rate changes, and exports.',
  columns: [
    { key: 'timestamp', headerLabel: 'Timestamp', width: '16%', align: 'left', formatType: 'datetime', isMonospace: true },
    { key: 'userName', headerLabel: 'User / Operator', width: '16%', align: 'left', formatType: 'text' },
    { key: 'terminal', headerLabel: 'Terminal', width: '11%', align: 'center', formatType: 'code', isMonospace: true },
    { key: 'moduleName', headerLabel: 'Subsystem Module', width: '14%', align: 'center', formatType: 'badge' },
    { key: 'actionName', headerLabel: 'Action / Event Type', width: '15%', align: 'center', formatType: 'badge' },
    { key: 'referenceNumber', headerLabel: 'Record Ref #', width: '12%', align: 'left', formatType: 'code', isMonospace: true },
    { key: 'notes', headerLabel: 'Audit Details & Parameters', width: '16%', align: 'left', formatType: 'text' },
  ],
  grouping: {
    groupByKey: 'moduleName',
    groupHeaderLabel: (val, rows) => `Module: ${val} • ${rows.length} Security Actions Recorded`,
  },
  kpiSummary: [
    {
      label: 'Total Security Actions Logged',
      type: 'count',
      calculate: (rows) => ({ value: `${rows.length} Actions`, subtext: 'System security audit entries' }),
    },
    {
      label: 'Supervisor Overrides',
      type: 'custom',
      calculate: (rows) => {
        const count = rows.filter((r) => String(r.actionName).toUpperCase().includes('OVERRIDE') || String(r.actionName).toUpperCase().includes('AUTH')).length;
        return { value: `${count} Overrides`, subtext: 'Manager security interventions' };
      },
    },
    {
      label: 'Data Modification Events',
      type: 'custom',
      calculate: (rows) => {
        const count = rows.filter((r) => ['VOID', 'DELETE', 'UPDATE', 'ADJUST'].some((kw) => String(r.actionName).toUpperCase().includes(kw))).length;
        return { value: `${count} Modifications`, subtext: 'Line voids, deletes, or adjustments' };
      },
    },
    {
      label: 'Active Operators Monitored',
      type: 'custom',
      calculate: (rows) => {
        const users = new Set(rows.map((r) => r.userName)).size;
        return { value: `${users} Operators`, subtext: 'Distinct staff credentials active' };
      },
    },
  ],
  sampleRowsGenerator: (filters = {}) => [
    { id: 'LOG-01', timestamp: '06-Sep-2026 08:30:12', userName: 'Hiba Aloulou', terminal: 'POS-01', moduleName: 'Sales POS', actionName: 'SHIFT_OPEN', referenceNumber: 'SFT-101', notes: 'Opened morning shift with $200 float', branch: 'Main Branch' },
    { id: 'LOG-02', timestamp: '06-Sep-2026 09:15:40', userName: 'Ziad Chehab (Mgr)', terminal: 'POS-01', moduleName: 'Sales POS', actionName: 'MANAGER_OVERRIDE', referenceNumber: 'INV-103225', notes: 'Approved line void on 17.5L Olive Oil ($110)', branch: 'Main Branch' },
    { id: 'LOG-03', timestamp: '06-Sep-2026 10:22:15', userName: 'Ahmad K.', terminal: 'POS-02', moduleName: 'Sales POS', actionName: 'PRICE_OVERRIDE', referenceNumber: 'INV-103229', notes: 'Authorized bulk wholesale discount 5%', branch: 'Main Branch' },
    { id: 'LOG-04', timestamp: '06-Sep-2026 11:45:00', userName: 'Walid Sleiman', terminal: 'WS-DSP-02', moduleName: 'Operations', actionName: 'DISPATCH_POST', referenceNumber: 'DSP-2026-5510', notes: 'Posted dispatch run to Verdun boutique', branch: 'Main Branch' },
    { id: 'LOG-05', timestamp: '06-Sep-2026 13:10:30', userName: 'Mohammad Jichi (Admin)', terminal: 'WS-ADM-01', moduleName: 'Accounting', actionName: 'RATE_UPDATE', referenceNumber: 'EXCH-SYS', notes: 'Updated LBP/USD peg to 89,500', branch: 'Main Branch' },
    { id: 'LOG-06', timestamp: '06-Sep-2026 14:05:20', userName: 'Rania Eid (Sup)', terminal: 'POS-03', moduleName: 'Internal Control', actionName: 'DRAWER_POP', referenceNumber: 'TILL-POP-88', notes: 'Emergency change drawer pop verified', branch: 'Main Branch' },
    { id: 'LOG-07', timestamp: '06-Sep-2026 16:30:45', userName: 'Hiba Aloulou', terminal: 'POS-01', moduleName: 'Sales POS', actionName: 'REFUND_ISSUE', referenceNumber: 'REF-2026-441', notes: 'Processed bottle return ticket ($65)', branch: 'Main Branch' },
    { id: 'LOG-08', timestamp: '06-Sep-2026 19:45:10', userName: 'Samer R.', terminal: 'POS-01', moduleName: 'Sales POS', actionName: 'Z_REPORT_GEN', referenceNumber: 'Z-BATCH-9042', notes: 'Generated final EOD fiscal Z-closure batch', branch: 'Main Branch' },
  ],
};
registerReportSchema(SCHEMA_USER_LOG);

// ----------------------------------------------------------------------------
// D. INTERNAL CONTROL: DISCOUNT SUMMARY & CONCESSIONS (REP_S_00193 / REP_S_00214)
// ----------------------------------------------------------------------------
export const SCHEMA_DISCOUNT_SUMMARY: ReportSchemaDefinition = {
  id: 'REP_S_00193',
  reportKey: 'Discount Summary',
  title: 'Discount Summary & Price Concessions Register',
  domain: 'internal_control',
  description: 'Detailed audit ledger of all promotional discounts, managerial concessions, wholesale markdowns, and line reductions granted.',
  columns: [
    { key: 'invoiceNo', headerLabel: 'Invoice #', width: '12%', align: 'left', formatType: 'code', isMonospace: true },
    { key: 'dateTime', headerLabel: 'Date & Time', width: '15%', align: 'left', formatType: 'datetime', isMonospace: true },
    { key: 'cashier', headerLabel: 'Cashier / Server', width: '14%', align: 'left', formatType: 'text' },
    { key: 'supervisor', headerLabel: 'Authorizing Lead', width: '15%', align: 'left', formatType: 'text' },
    { key: 'discountType', headerLabel: 'Discount Scheme', width: '16%', align: 'left', formatType: 'badge' },
    { key: 'originalAmount', headerLabel: 'Gross Value', width: '10%', align: 'right', formatType: 'currency', isMonospace: true },
    { key: 'discountAmount', headerLabel: 'Discount Granted', width: '10%', align: 'right', formatType: 'currency', isMonospace: true },
    { key: 'netAmount', headerLabel: 'Net Billed', width: '8%', align: 'right', formatType: 'currency', isMonospace: true },
  ],
  grouping: {
    groupByKey: 'discountType',
    groupHeaderLabel: (val, rows) => `Discount Scheme: ${val} (${rows.length} Concessions Granted)`,
    subtotalKeys: ['originalAmount', 'discountAmount', 'netAmount'],
  },
  kpiSummary: [
    {
      label: 'Total Concessions Granted',
      type: 'sum',
      calculate: (rows, currency = 'USD') => {
        const sum = rows.reduce((acc, r) => acc + (Number(r.discountAmount) || 0), 0);
        return { value: formatCurrencyAmount(sum, currency, true), subtext: 'Total revenue concessions given' };
      },
    },
    {
      label: 'Average Concession Rate',
      type: 'average',
      calculate: (rows) => {
        const gross = rows.reduce((acc, r) => acc + (Number(r.originalAmount) || 0), 0);
        const disc = rows.reduce((acc, r) => acc + (Number(r.discountAmount) || 0), 0);
        const pct = gross > 0 ? (disc / gross) * 100 : 0;
        return { value: `${pct.toFixed(1)}% Rate`, subtext: 'Of total gross transaction volume' };
      },
    },
    {
      label: 'Discounted Transactions Count',
      type: 'count',
      calculate: (rows) => ({ value: `${rows.length} Invoices`, subtext: 'Bills with concession deductions' }),
    },
  ],
  sampleRowsGenerator: (filters = {}) => [
    { id: 'DSC-01', invoiceNo: 'INV-103110', dateTime: '06-Sep-2026 10:15 AM', cashier: 'Hiba Aloulou', supervisor: 'Ziad Chehab (Mgr)', discountType: 'Harvest Promotional Offer', originalAmount: 220.00, discountAmount: 22.00, netAmount: 198.00, branch: 'Main Branch' },
    { id: 'DSC-02', invoiceNo: 'INV-103144', dateTime: '06-Sep-2026 11:40 AM', cashier: 'Ahmad K.', supervisor: 'Rania Eid (Sup)', discountType: 'Wholesale Volume Concession', originalAmount: 850.00, discountAmount: 68.00, netAmount: 782.00, branch: 'Main Branch' },
    { id: 'DSC-03', invoiceNo: 'INV-103180', dateTime: '06-Sep-2026 13:20 PM', cashier: 'Hiba Aloulou', supervisor: 'Ahmad Al-Hajj (Lead)', discountType: 'VIP Customer Privilege', originalAmount: 140.00, discountAmount: 14.00, netAmount: 126.00, branch: 'Main Branch' },
    { id: 'DSC-04', invoiceNo: 'INV-103210', dateTime: '06-Sep-2026 15:55 PM', cashier: 'Samer R.', supervisor: 'Ziad Chehab (Mgr)', discountType: 'Staff Privilege Concession', originalAmount: 75.00, discountAmount: 15.00, netAmount: 60.00, branch: 'Main Branch' },
    { id: 'DSC-05', invoiceNo: 'INV-103242', dateTime: '06-Sep-2026 18:30 PM', cashier: 'Nour M.', supervisor: 'Rania Eid (Sup)', discountType: 'Damaged Packaging Markdown', originalAmount: 110.00, discountAmount: 22.00, netAmount: 88.00, branch: 'Main Branch' },
  ],
};
registerReportSchema(SCHEMA_DISCOUNT_SUMMARY);

// ----------------------------------------------------------------------------
// E. FINANCIAL: SUMMARY OF PAYMENT (REP_S_00220)
// ----------------------------------------------------------------------------
export const SCHEMA_SUMMARY_OF_PAYMENT: ReportSchemaDefinition = {
  id: 'REP_S_00220',
  reportKey: 'Summary of Payment',
  title: 'Financial Payments & Tenders Master Reconciliation',
  domain: 'accounting',
  description: 'Consolidated financial settlement ledger summarizing all cash, card, electronic, voucher, and credit account receipts.',
  columns: [
    { key: 'tenderCode', headerLabel: 'Tender Code', width: '12%', align: 'left', formatType: 'code', isMonospace: true },
    { key: 'tenderName', headerLabel: 'Payment Method', width: '22%', align: 'left', formatType: 'text' },
    { key: 'txCount', headerLabel: 'Transactions', width: '12%', align: 'center', formatType: 'number', isMonospace: true },
    { key: 'currency', headerLabel: 'Currency', width: '10%', align: 'center', formatType: 'badge' },
    { key: 'rawAmount', headerLabel: 'Tender Total', width: '16%', align: 'right', formatType: 'currency', isMonospace: true },
    { key: 'exchangeRate', headerLabel: 'Exchange Rate', width: '12%', align: 'right', formatType: 'number', isMonospace: true },
    { key: 'consolidatedAmount', headerLabel: 'Consolidated ($)', width: '16%', align: 'right', formatType: 'currency', isMonospace: true },
  ],
  kpiSummary: [
    {
      label: 'Consolidated Net Remittance',
      type: 'sum',
      calculate: (rows, currency = 'USD') => {
        const sum = rows.reduce((acc, r) => acc + (Number(r.consolidatedAmount) || 0), 0);
        return { value: formatCurrencyAmount(sum, currency, true), subtext: 'Verified financial intake' };
      },
    },
    {
      label: 'Total Transactions Paid',
      type: 'sum',
      calculate: (rows) => {
        const count = rows.reduce((acc, r) => acc + (Number(r.txCount) || 0), 0);
        return { value: `${count} Receipts`, subtext: 'Reconciled settlements' };
      },
    },
    {
      label: 'Cash in Vault Share',
      type: 'custom',
      calculate: (rows) => {
        const total = rows.reduce((acc, r) => acc + (Number(r.consolidatedAmount) || 0), 0);
        const cash = rows.filter((r) => String(r.tenderCode).includes('CASH')).reduce((acc, r) => acc + (Number(r.consolidatedAmount) || 0), 0);
        const pct = total > 0 ? (cash / total) * 100 : 0;
        return { value: `${pct.toFixed(1)}% Physical Cash`, subtext: 'Bank deposit readiness' };
      },
    },
  ],
  sampleRowsGenerator: (filters = {}) => [
    { id: 'PAY-01', tenderCode: 'CASH_USD', tenderName: 'Physical Cash (USD Banknotes)', txCount: 84, currency: 'USD', rawAmount: 9420.00, exchangeRate: 1.0, consolidatedAmount: 9420.00, branch: 'All Branches' },
    { id: 'PAY-02', tenderCode: 'CASH_LBP', tenderName: 'Physical Cash (Lebanese Pounds)', txCount: 46, currency: 'LBP', rawAmount: 285400000.0, exchangeRate: 89500.0, consolidatedAmount: 3188.82, branch: 'All Branches' },
    { id: 'PAY-03', tenderCode: 'WHISH_PAY', tenderName: 'Whish Money Digital Barcode', txCount: 28, currency: 'USD', rawAmount: 2450.00, exchangeRate: 1.0, consolidatedAmount: 2450.00, branch: 'All Branches' },
    { id: 'PAY-04', tenderCode: 'CARD_VISA', tenderName: 'Visa / MasterCard POS Settlement', txCount: 19, currency: 'USD', rawAmount: 1820.00, exchangeRate: 1.0, consolidatedAmount: 1820.00, branch: 'All Branches' },
    { id: 'PAY-05', tenderCode: 'STORE_CREDIT', tenderName: 'B2B Wholesale Accounts Receivable', txCount: 8, currency: 'USD', rawAmount: 3120.00, exchangeRate: 1.0, consolidatedAmount: 3120.00, branch: 'All Branches' },
  ],
};
registerReportSchema(SCHEMA_SUMMARY_OF_PAYMENT);

// ----------------------------------------------------------------------------
// F. STATISTICS: WORKSTATION STATISTICS (REP_S_00202)
// ----------------------------------------------------------------------------
export const SCHEMA_STATISTICS_BY_WORKSTATION: ReportSchemaDefinition = {
  id: 'REP_S_00202',
  reportKey: 'Statistics by Workstation',
  title: 'Workstation Terminal Performance & Till Audits',
  domain: 'sales',
  description: 'Comparative register statistics analyzing throughput, check velocity, drawer variance, and billing totals by workstation.',
  columns: [
    { key: 'workstationId', headerLabel: 'Terminal ID', width: '12%', align: 'left', formatType: 'code', isMonospace: true },
    { key: 'workstationName', headerLabel: 'Register Location', width: '22%', align: 'left', formatType: 'text' },
    { key: 'shiftsCount', headerLabel: 'Shifts', width: '10%', align: 'center', formatType: 'number', isMonospace: true },
    { key: 'ticketsCount', headerLabel: 'Total Invoices', width: '12%', align: 'center', formatType: 'number', isMonospace: true },
    { key: 'avgTicket', headerLabel: 'Avg Ticket ($)', width: '14%', align: 'right', formatType: 'currency', isMonospace: true },
    { key: 'variance', headerLabel: 'Till Variance', width: '14%', align: 'right', formatType: 'delta', isMonospace: true },
    { key: 'grossSales', headerLabel: 'Gross Turnover ($)', width: '16%', align: 'right', formatType: 'currency', isMonospace: true },
  ],
  kpiSummary: [
    {
      label: 'Network Gross Turnover',
      type: 'sum',
      calculate: (rows, currency = 'USD') => {
        const sum = rows.reduce((acc, r) => acc + (Number(r.grossSales) || 0), 0);
        return { value: formatCurrencyAmount(sum, currency, true), subtext: 'Across all physical checkouts' };
      },
    },
    {
      label: 'Total Tickets Processed',
      type: 'sum',
      calculate: (rows) => {
        const count = rows.reduce((acc, r) => acc + (Number(r.ticketsCount) || 0), 0);
        return { value: `${count} Invoices`, subtext: 'Terminal cashier volume' };
      },
    },
    {
      label: 'Net Till Variance',
      type: 'custom',
      calculate: (rows, currency = 'USD') => {
        const variance = rows.reduce((acc, r) => acc + (Number(r.variance) || 0), 0);
        return {
          value: formatCurrencyAmount(variance, currency, true),
          subtext: variance === 0 ? 'Exact till parity' : variance > 0 ? 'Over cash' : 'Short cash',
        };
      },
    },
  ],
  sampleRowsGenerator: (filters = {}) => [
    { id: 'WS-01', workstationId: 'POS-01', workstationName: 'Front Entrance Register #1', shiftsCount: 2, ticketsCount: 132, avgTicket: 83.56, variance: 0.00, grossSales: 11030.00, branch: 'Main Branch' },
    { id: 'WS-02', workstationId: 'POS-02', workstationName: 'Deli & Bulk Counter Scale', shiftsCount: 2, ticketsCount: 74, avgTicket: 74.32, variance: -1.50, grossSales: 5500.00, branch: 'Main Branch' },
    { id: 'WS-03', workstationId: 'POS-03', workstationName: 'Express Fast Checkout Lane', shiftsCount: 3, ticketsCount: 98, avgTicket: 39.48, variance: +2.00, grossSales: 3870.00, branch: 'Main Branch' },
    { id: 'WS-04', workstationId: 'POS-04', workstationName: 'Commercial Wholesale Dispatch', shiftsCount: 1, ticketsCount: 16, avgTicket: 887.50, variance: 0.00, grossSales: 14200.00, branch: 'Main Branch' },
  ],
};
registerReportSchema(SCHEMA_STATISTICS_BY_WORKSTATION);

// ----------------------------------------------------------------------------
// G. FLEET & LOGISTICS: DELIVERY ORDERS (REP_S_00207)
// ----------------------------------------------------------------------------
export const SCHEMA_DELIVERY_ORDERS: ReportSchemaDefinition = {
  id: 'REP_S_00207',
  reportKey: 'Delivery Orders by Date and Branch',
  title: 'Delivery Orders & Dispatch Route Log',
  domain: 'fleet',
  description: 'Logistical route register tracking outbound delivery orders, assigned fleet couriers, destination zones, and COD settlements.',
  columns: [
    { key: 'orderRef', headerLabel: 'Delivery Ref #', width: '14%', align: 'left', formatType: 'code', isMonospace: true },
    { key: 'dispatchDate', headerLabel: 'Date & Time', width: '16%', align: 'left', formatType: 'datetime', isMonospace: true },
    { key: 'customer', headerLabel: 'Customer / Consignee', width: '18%', align: 'left', formatType: 'text' },
    { key: 'zone', headerLabel: 'Zone / Address', width: '14%', align: 'left', formatType: 'text' },
    { key: 'driver', headerLabel: 'Assigned Driver', width: '12%', align: 'left', formatType: 'text' },
    { key: 'deliveryStatus', headerLabel: 'Delivery Status', width: '12%', align: 'center', formatType: 'status' },
    { key: 'orderValue', headerLabel: 'COD / Order Value', width: '14%', align: 'right', formatType: 'currency', isMonospace: true },
  ],
  grouping: {
    groupByKey: 'zone',
    groupHeaderLabel: (val, rows) => `Route Zone: ${val} (${rows.length} Dispatches)`,
    subtotalKeys: ['orderValue'],
  },
  kpiSummary: [
    {
      label: 'Total Orders Dispatched',
      type: 'count',
      calculate: (rows) => ({ value: `${rows.length} Shipments`, subtext: 'Fleet route dispatches' }),
    },
    {
      label: 'Delivered & Settled COD',
      type: 'custom',
      calculate: (rows, currency = 'USD') => {
        const sum = rows.filter((r) => r.deliveryStatus === 'DELIVERED').reduce((acc, r) => acc + (Number(r.orderValue) || 0), 0);
        return { value: formatCurrencyAmount(sum, currency, true), subtext: 'Collected courier cash' };
      },
    },
    {
      label: 'Fulfillment Success Rate',
      type: 'custom',
      calculate: (rows) => {
        const delivered = rows.filter((r) => r.deliveryStatus === 'DELIVERED').length;
        const pct = rows.length > 0 ? (delivered / rows.length) * 100 : 0;
        return { value: `${pct.toFixed(1)}% Delivered`, subtext: 'Route delivery completion rate' };
      },
    },
  ],
  sampleRowsGenerator: (filters = {}) => [
    { id: 'DLV-01', orderRef: 'DSP-2026-8801', dispatchDate: '06-Sep-2026 09:30 AM', customer: 'Al-Baraka Supermarket', zone: 'Beirut - Verdun', driver: 'Jad El-Hajj (Van 02)', deliveryStatus: 'DELIVERED', orderValue: 1450.00, branch: 'Main Branch' },
    { id: 'DLV-02', orderRef: 'DSP-2026-8802', dispatchDate: '06-Sep-2026 10:15 AM', customer: 'Al-Bustan Restaurant', zone: 'Beirut - Hamra', driver: 'Charbel Boutros (Van 01)', deliveryStatus: 'DELIVERED', orderValue: 890.00, branch: 'Main Branch' },
    { id: 'DLV-03', orderRef: 'DSP-2026-8803', dispatchDate: '06-Sep-2026 11:00 AM', customer: 'Mina Seaside Resort', zone: 'South - Sidon', driver: 'Walid Sleiman (Van 03)', deliveryStatus: 'IN_TRANSIT', orderValue: 620.00, branch: 'Main Branch' },
    { id: 'DLV-04', orderRef: 'DSP-2026-8804', dispatchDate: '06-Sep-2026 13:45 PM', customer: 'Byblos Gourmet Deli', zone: 'Mount Lebanon', driver: 'Jad El-Hajj (Van 02)', deliveryStatus: 'SCHEDULED', orderValue: 1200.00, branch: 'Main Branch' },
    { id: 'DLV-05', orderRef: 'DSP-2026-8805', dispatchDate: '06-Sep-2026 15:10 PM', customer: 'Cedar Hospitality LLC', zone: 'Beirut - Achrafieh', driver: 'Charbel Boutros (Van 01)', deliveryStatus: 'DELIVERED', orderValue: 480.00, branch: 'Main Branch' },
  ],
};
registerReportSchema(SCHEMA_DELIVERY_ORDERS);

// ----------------------------------------------------------------------------
// H. FINANCIAL: TAX SUMMARY (REP_S_00210 / REP_S_00211)
// ----------------------------------------------------------------------------
export const SCHEMA_TAX_SUMMARY: ReportSchemaDefinition = {
  id: 'REP_S_00210',
  reportKey: 'Tax Summary',
  title: 'VAT Fiscal Declaration & Tax Accrual Summary',
  domain: 'accounting',
  description: 'Official Ministry of Finance Lebanese VAT declaration ledger detailing standard, reduced, and exempt sales turnovers.',
  columns: [
    { key: 'taxCategory', headerLabel: 'Tax Classification', width: '22%', align: 'left', formatType: 'text' },
    { key: 'fiscalCode', headerLabel: 'MOF Code', width: '12%', align: 'left', formatType: 'code', isMonospace: true },
    { key: 'taxRate', headerLabel: 'Rate', width: '10%', align: 'center', formatType: 'percentage', isMonospace: true },
    { key: 'taxableBaseUsd', headerLabel: 'Taxable Base ($)', width: '18%', align: 'right', formatType: 'currency', isMonospace: true },
    { key: 'taxableBaseLbp', headerLabel: 'Taxable Base (LBP)', width: '20%', align: 'right', formatType: 'currency', isMonospace: true },
    { key: 'taxCollectedUsd', headerLabel: 'VAT Collected ($)', width: '18%', align: 'right', formatType: 'currency', isMonospace: true },
  ],
  kpiSummary: [
    {
      label: 'Total VAT Collected (USD)',
      type: 'sum',
      calculate: (rows, currency = 'USD') => {
        const sum = rows.reduce((acc, r) => acc + (Number(r.taxCollectedUsd) || 0), 0);
        return { value: formatCurrencyAmount(sum, currency, true), subtext: 'Fiscal liability payable to MOF' };
      },
    },
    {
      label: 'Standard Taxable Turnover',
      type: 'custom',
      calculate: (rows, currency = 'USD') => {
        const standard = rows.find((r) => r.fiscalCode === 'VAT-11');
        const val = standard ? Number(standard.taxableBaseUsd) : 0;
        return { value: formatCurrencyAmount(val, currency, true), subtext: '11% Standard taxable base' };
      },
    },
    {
      label: 'Exempt Agricultural Turnover',
      type: 'custom',
      calculate: (rows, currency = 'USD') => {
        const exempt = rows.find((r) => r.fiscalCode === 'VAT-EX');
        const val = exempt ? Number(exempt.taxableBaseUsd) : 0;
        return { value: formatCurrencyAmount(val, currency, true), subtext: 'Raw olive & farm direct exempt sales' };
      },
    },
  ],
  sampleRowsGenerator: (filters = {}) => [
    { id: 'TAX-01', taxCategory: 'Standard Rate Products (Processed Oils & Packaged)', fiscalCode: 'VAT-11', taxRate: 11.0, taxableBaseUsd: 28400.00, taxableBaseLbp: 2541800000.0, taxCollectedUsd: 3124.00, branch: 'All Branches' },
    { id: 'TAX-02', taxCategory: 'Exempt Agricultural Goods (Raw Olives & Fresh Produce)', fiscalCode: 'VAT-EX', taxRate: 0.0, taxableBaseUsd: 6200.00, taxableBaseLbp: 554900000.0, taxCollectedUsd: 0.00, branch: 'All Branches' },
    { id: 'TAX-03', taxCategory: 'Export Sales (Zero Rated International Dispatch)', fiscalCode: 'VAT-ZERO', taxRate: 0.0, taxableBaseUsd: 14500.00, taxableBaseLbp: 1297750000.0, taxCollectedUsd: 0.00, branch: 'All Branches' },
  ],
};
registerReportSchema(SCHEMA_TAX_SUMMARY);

// ----------------------------------------------------------------------------
// I. PROFITABILITY: PROFIT BY INVOICES SUMMARY (REP_S_00230)
// ----------------------------------------------------------------------------
export const SCHEMA_PROFIT_BY_INVOICES: ReportSchemaDefinition = {
  id: 'REP_S_00230',
  reportKey: 'Profit by Invoices Summary',
  title: 'Gross Margin & Profit by Invoices Summary',
  domain: 'sales',
  description: 'Detailed bill-level margin report analyzing invoiced selling price versus estimated standard Cost of Goods Sold (COGS).',
  columns: [
    { key: 'invoiceNo', headerLabel: 'Invoice #', width: '12%', align: 'left', formatType: 'code', isMonospace: true },
    { key: 'date', headerLabel: 'Invoice Date', width: '12%', align: 'left', formatType: 'date', isMonospace: true },
    { key: 'customer', headerLabel: 'Customer / Account', width: '22%', align: 'left', formatType: 'text' },
    { key: 'invoicedRevenue', headerLabel: 'Invoiced Sales', width: '14%', align: 'right', formatType: 'currency', isMonospace: true },
    { key: 'cogsEstimate', headerLabel: 'Standard COGS', width: '14%', align: 'right', formatType: 'currency', isMonospace: true },
    { key: 'grossProfit', headerLabel: 'Gross Profit ($)', width: '14%', align: 'right', formatType: 'currency', isMonospace: true },
    { key: 'marginPct', headerLabel: 'Margin %', width: '12%', align: 'right', formatType: 'percentage', isMonospace: true },
  ],
  kpiSummary: [
    {
      label: 'Total Net Profit ($)',
      type: 'sum',
      calculate: (rows, currency = 'USD') => {
        const sum = rows.reduce((acc, r) => acc + (Number(r.grossProfit) || 0), 0);
        return { value: formatCurrencyAmount(sum, currency, true), subtext: 'Invoiced gross margin contribution' };
      },
    },
    {
      label: 'Average Weighted Margin',
      type: 'average',
      calculate: (rows) => {
        const rev = rows.reduce((acc, r) => acc + (Number(r.invoicedRevenue) || 0), 0);
        const profit = rows.reduce((acc, r) => acc + (Number(r.grossProfit) || 0), 0);
        const pct = rev > 0 ? (profit / rev) * 100 : 0;
        return { value: `${pct.toFixed(1)}% Gross Margin`, subtext: 'Realized retail & wholesale spread' };
      },
    },
    {
      label: 'Total Billed Revenue',
      type: 'sum',
      calculate: (rows, currency = 'USD') => {
        const sum = rows.reduce((acc, r) => acc + (Number(r.invoicedRevenue) || 0), 0);
        return { value: formatCurrencyAmount(sum, currency, true), subtext: 'Topline invoiced turnover' };
      },
    },
  ],
  sampleRowsGenerator: (filters = {}) => [
    { id: 'PRF-01', invoiceNo: 'INV-103110', date: '06-Sep-2026', customer: 'Al-Baraka Supermarket', invoicedRevenue: 1450.00, cogsEstimate: 980.00, grossProfit: 470.00, marginPct: 32.4, branch: 'Main Branch' },
    { id: 'PRF-02', invoiceNo: 'INV-103125', date: '06-Sep-2026', customer: 'Al-Bustan Restaurant Group', invoicedRevenue: 890.00, cogsEstimate: 590.00, grossProfit: 300.00, marginPct: 33.7, branch: 'Main Branch' },
    { id: 'PRF-03', invoiceNo: 'INV-103140', date: '06-Sep-2026', customer: 'Cedar Hospitality LLC', invoicedRevenue: 620.00, cogsEstimate: 410.00, grossProfit: 210.00, marginPct: 33.9, branch: 'Main Branch' },
    { id: 'PRF-04', invoiceNo: 'INV-103165', date: '06-Sep-2026', customer: 'Byblos Gourmet Deli', invoicedRevenue: 1200.00, cogsEstimate: 810.00, grossProfit: 390.00, marginPct: 32.5, branch: 'Main Branch' },
    { id: 'PRF-05', invoiceNo: 'INV-103180', date: '06-Sep-2026', customer: 'Verdun Fine Foods S.A.L', invoicedRevenue: 980.00, cogsEstimate: 620.00, grossProfit: 360.00, marginPct: 36.7, branch: 'Main Branch' },
  ],
};
registerReportSchema(SCHEMA_PROFIT_BY_INVOICES);

// ----------------------------------------------------------------------------
// J. INTERNAL CONTROL: UNDER COST SALES REPORT (REP_IC_008 / REP_S_00235)
// View: view_under_cost_sales_report
// ----------------------------------------------------------------------------
export const SCHEMA_UNDER_COST_SALES: ReportSchemaDefinition = {
  id: 'REP_IC_008',
  reportKey: 'Under Cost Sales Report',
  title: 'Under Cost Sales Report (البيع بأقل من التكلفة)',
  domain: 'sales',
  description: 'Auditing view identifying invoice line transactions sold below standard unit inventory cost (view_under_cost_sales_report).',
  columns: [
    { key: 'itemName', headerLabel: 'Item Name & Spec', width: '28%', align: 'left', formatType: 'text' },
    { key: 'sellingPrice', headerLabel: 'Selling Price ($)', width: '14%', align: 'right', formatType: 'currency', isMonospace: true },
    { key: 'capacityKg', headerLabel: 'Capacity (KG)', width: '14%', align: 'center', formatType: 'number', isMonospace: true },
    { key: 'unitCost', headerLabel: 'Unit Cost ($)', width: '14%', align: 'right', formatType: 'currency', isMonospace: true },
    { key: 'lossMargin', headerLabel: 'Loss Margin ($)', width: '15%', align: 'right', formatType: 'currency', isMonospace: true },
    { key: 'saleDate', headerLabel: 'Sale Date', width: '15%', align: 'left', formatType: 'date', isMonospace: true },
  ],
  kpiSummary: [
    {
      label: 'Total Loss Incurred ($)',
      type: 'sum',
      calculate: (rows, currency = 'USD') => {
        const sum = rows.reduce((acc, r) => acc + (Number(r.lossMargin) || 0), 0);
        return { value: formatCurrencyAmount(sum, currency, true), subtext: 'Cumulative discount spread below cost' };
      },
    },
    {
      label: 'Under-Cost Line Items',
      type: 'count',
      calculate: (rows) => {
        return { value: `${rows.length} Flags`, subtext: 'Transactions requiring management override review' };
      },
    },
    {
      label: 'Highest Single Loss ($)',
      type: 'custom',
      calculate: (rows, currency = 'USD') => {
        const max = rows.reduce((acc, r) => Math.max(acc, Number(r.lossMargin) || 0), 0);
        return { value: formatCurrencyAmount(max, currency, true), subtext: 'Worst single item margin loss' };
      },
    },
  ],
  sampleRowsGenerator: (filters = {}) => [
    { id: 'UCS-01', itemName: 'صابون زيت زيتون بلدي بالوزن (Artisan Olive Soap Clearance)', sellingPrice: 3.00, capacityKg: 0.25, unitCost: 4.50, lossMargin: 1.50, saleDate: '18-Sep-2026', branch: 'Choueifat Facility' },
    { id: 'UCS-02', itemName: 'عرض زيتي ترويجي - زيتون أخضر مفرود بالكيلو', sellingPrice: 2.80, capacityKg: 1.00, unitCost: 3.50, lossMargin: 0.70, saleDate: '18-Sep-2026', branch: 'Beirut Distribution' },
    { id: 'UCS-03', itemName: 'زيت زيتون بكر مضغوط قديم 1000 مل', sellingPrice: 5.50, capacityKg: 0.92, unitCost: 6.20, lossMargin: 0.70, saleDate: '17-Sep-2026', branch: 'Saida Hub' },
  ],
};
registerReportSchema(SCHEMA_UNDER_COST_SALES);

