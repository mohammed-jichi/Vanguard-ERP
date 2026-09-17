'use client';

import React, { useMemo } from 'react';
import MasterReportDocument from '@/components/reports/MasterReportDocument';
import { ReportMetadata, ReportColumn, GrandTotal } from '@/types/reports';

export interface CustomerSalesReportMasterDocumentProps {
  reportKey: string;
  reportTitle?: string;
  code?: string;
  dynamicPeriodText?: string;
  executionDate?: string;
  branch?: string;
  filterValues?: Record<string, any>;
}

// ============================================================================
// MOCK DATASETS TAILORED FOR CUSTOMER SALES & LOGISTICS
// ============================================================================

const TOP_CUSTOMERS_DATA = [
  { rank: '1', code: 'CUST-001', name: 'Al-Baraka Supermarket S.A.R.L', category: 'Key Account', invoices: 48, avgTicket: '$412.50', totalLbp: '1,772,100,000.00', totalUsd: '$19,800.00' },
  { rank: '2', code: 'CUST-003', name: 'Cedars Gourmet Retailers (Verdun)', category: 'Wholesale Depot', invoices: 36, avgTicket: '$385.00', totalLbp: '1,240,575,000.00', totalUsd: '$13,860.00' },
  { rank: '3', code: 'CUST-004', name: 'Beirut Olive House Wholesale', category: 'Wholesale Depot', invoices: 28, avgTicket: '$440.00', totalLbp: '1,102,640,000.00', totalUsd: '$12,320.00' },
  { rank: '4', code: 'CUST-005', name: 'Tripoli Food Hub & Market', category: 'Commercial Horeca', invoices: 22, avgTicket: '$390.00', totalLbp: '767,910,000.00', totalUsd: '$8,580.00' },
  { rank: '5', code: 'CUST-002', name: 'Al-Nour Food Establishment', category: 'Wholesale Store', invoices: 19, avgTicket: '$320.00', totalLbp: '544,160,000.00', totalUsd: '$6,080.00' },
  { rank: '6', code: 'CUST-008', name: 'Sidon Central Co-Op', category: 'Key Account', invoices: 16, avgTicket: '$360.00', totalLbp: '515,520,000.00', totalUsd: '$5,760.00' },
  { rank: '7', code: 'CUST-012', name: 'Byblos Table Delicacies', category: 'Retail Outlet', invoices: 14, avgTicket: '$280.00', totalLbp: '350,840,000.00', totalUsd: '$3,920.00' },
  { rank: '8', code: 'CUST-015', name: 'Chouf Mountain Pantry', category: 'Retail Outlet', invoices: 12, avgTicket: '$265.00', totalLbp: '284,610,000.00', totalUsd: '$3,180.00' },
];

const SALES_BY_CUSTOMERS_DATA = [
  { code: 'CUST-001', name: 'Al-Baraka Supermarket S.A.R.L', tier: 'Tier A (Key Enterprise)', terms: 'Net 30 Days', creditLimit: '$25,000.00', arBalance: '$4,200.00', totalLbp: '1,772,100,000.00', totalUsd: '$19,800.00' },
  { code: 'CUST-002', name: 'Al-Nour Food Establishment', tier: 'Tier C (Wholesale)', terms: 'Net 15 Days', creditLimit: '$10,000.00', arBalance: '$1,450.00', totalLbp: '544,160,000.00', totalUsd: '$6,080.00' },
  { code: 'CUST-003', name: 'Cedars Gourmet Retailers', tier: 'Tier A (Key Enterprise)', terms: 'Net 30 Days', creditLimit: '$20,000.00', arBalance: '$3,820.00', totalLbp: '1,240,575,000.00', totalUsd: '$13,860.00' },
  { code: 'CUST-004', name: 'Beirut Olive House Wholesale', tier: 'Tier B (Commercial)', terms: 'Credit / On-Account', creditLimit: '$18,000.00', arBalance: '$5,110.00', totalLbp: '1,102,640,000.00', totalUsd: '$12,320.00' },
  { code: 'CUST-005', name: 'Tripoli Food Hub & Market', tier: 'Tier B (Commercial)', terms: 'Cash On Delivery (COD)', creditLimit: '$5,000.00', arBalance: '$0.00', totalLbp: '767,910,000.00', totalUsd: '$8,580.00' },
  { code: 'CUST-009', name: 'Ziad Al-Rifai Trading Co.', tier: 'Tier C (Wholesale)', terms: 'Net 60 Days', creditLimit: '$15,000.00', arBalance: '$12,450.00', totalLbp: '248,400,000.00', totalUsd: '$2,775.42' },
];

const CUSTOMER_IN_DETAIL_DATA = [
  { invoiceNo: '102971', date: '04-Aug-2026', branch: 'Main Branch', items: '24x Extra Virgin Olive Oil 1000ml (EVOO)', payment: 'CREDIT', subtotal: '$265.50', returns: '$0.00', totalUsd: '$265.50' },
  { invoiceNo: '103044', date: '09-Aug-2026', branch: 'Main Branch', items: '10x Bulk Olive Oil Commercial Tin 17.5L', payment: 'CREDIT', subtotal: '$1,005.60', returns: '$0.00', totalUsd: '$1,005.60' },
  { invoiceNo: '103112', date: '14-Aug-2026', branch: 'Main Branch', items: '40x Jar Stuffed Vine Leaves 500g', payment: 'CREDIT', subtotal: '$156.42', returns: '-$15.60 (Damaged)', totalUsd: '$140.82' },
  { invoiceNo: '103180', date: '21-Aug-2026', branch: 'Choueifat Plant', items: '15x Oak Charcoal 4kg Bags + 10x Molasses', payment: 'CREDIT', subtotal: '$124.80', returns: '$0.00', totalUsd: '$124.80' },
  { invoiceNo: '103255', date: '28-Aug-2026', branch: 'Main Branch', items: '12x Glass Bottle Olive Oil 500ml', payment: 'CASH', subtotal: '$78.00', returns: '$0.00', totalUsd: '$78.00' },
];

const SALES_BY_ZONE_DATA = [
  { zone: 'Beirut Metro (Ras Beirut, Hamra, Verdun)', route: 'Coastal Highway Corridor', accounts: 44, deliveries: 182, units: 1420, revenueLbp: '1,894,000,000.00', totalUsd: '$21,162.00' },
  { zone: 'Greater Beirut (Ashrafieh, Sin El Fil)', route: 'Coastal Highway Corridor', accounts: 38, deliveries: 154, units: 1180, revenueLbp: '1,565,300,000.00', totalUsd: '$17,489.38' },
  { zone: 'Mount Lebanon & Metn', route: 'Mountain Radial Route', accounts: 29, deliveries: 118, units: 910, revenueLbp: '1,210,000,000.00', totalUsd: '$13,519.55' },
  { zone: 'Chouf & Aley Hills', route: 'Mountain Radial Route', accounts: 21, deliveries: 84, units: 640, revenueLbp: '782,500,000.00', totalUsd: '$8,743.02' },
  { zone: 'South Lebanon (Sidon, Tyre Hub)', route: 'Inland Commercial Trunk', accounts: 35, deliveries: 146, units: 1250, revenueLbp: '1,420,000,000.00', totalUsd: '$15,865.92' },
  { zone: 'North Lebanon (Tripoli, Koura)', route: 'Inland Commercial Trunk', accounts: 26, deliveries: 96, units: 820, revenueLbp: '990,000,000.00', totalUsd: '$11,061.45' },
  { zone: 'Bekaa Valley Hub (Zahle, Chtaura)', route: 'Express Direct Dispatch', accounts: 18, deliveries: 68, units: 580, revenueLbp: '695,000,000.00', totalUsd: '$7,765.36' },
];

const DELIVERY_SALES_SUMMARY_DATA = [
  { dispatchId: 'DSP-2026-0811', dateTime: '11-Aug-2026 10:15 AM', customer: 'Al-Baraka Supermarket S.A.R.L', zone: 'Beirut Metro', courier: 'Ali Al-Husseini (Van 01)', status: 'DELIVERED', tender: 'COD', totalUsd: '$840.00' },
  { dispatchId: 'DSP-2026-0814', dateTime: '14-Aug-2026 11:30 AM', customer: 'Cedars Gourmet Retailers', zone: 'Beirut Metro', courier: 'Charbel Mattar (Van 02)', status: 'DELIVERED', tender: 'PREPAID', totalUsd: '$1,260.00' },
  { dispatchId: 'DSP-2026-0818', dateTime: '18-Aug-2026 02:45 PM', customer: 'Tripoli Food Hub', zone: 'North Lebanon', courier: 'Supersonic Fleet Courier', status: 'DELIVERED', tender: 'CARD', totalUsd: '$980.00' },
  { dispatchId: 'DSP-2026-0822', dateTime: '22-Aug-2026 09:00 AM', customer: 'Chouf Mountain Pantry', zone: 'Chouf & Aley', courier: 'Fadi Saade (Van 03)', status: 'DISPATCHED', tender: 'COD', totalUsd: '$450.00' },
  { dispatchId: 'DSP-2026-0825', dateTime: '25-Aug-2026 04:20 PM', customer: 'Sidon Central Co-Op', zone: 'South Lebanon', courier: 'Ali Al-Husseini (Van 01)', status: 'DELIVERED', tender: 'CREDIT', totalUsd: '$1,120.00' },
  { dispatchId: 'DSP-2026-0827', dateTime: '27-Aug-2026 01:10 PM', customer: 'Retail Walk-in Deliveries', zone: 'Greater Beirut', courier: 'Tarek Ziyad (Moto Express)', status: 'DELIVERED', tender: 'COD', totalUsd: '$235.00' },
];

const DRIVERS_HISTORY_DATA = [
  { batchNo: 'BATCH-2026-0811', dateTime: '11-Aug-2026 08:30 AM', driver: 'Ali Al-Husseini', vehicle: 'Regional Van 01', drops: 14, cashLbp: '124,500,000.00', status: 'Delivered & Cash Collected', audit: 'Reconciled & Cleared' },
  { batchNo: 'BATCH-2026-0814', dateTime: '14-Aug-2026 09:00 AM', driver: 'Charbel Mattar', vehicle: 'Regional Van 02', drops: 12, cashLbp: '88,200,000.00', status: 'Delivered & Card Paid', audit: 'Reconciled & Cleared' },
  { batchNo: 'BATCH-2026-0818', dateTime: '18-Aug-2026 08:00 AM', driver: 'Supersonic Courier', vehicle: 'Express Truck 04', drops: 18, cashLbp: '142,800,000.00', status: 'Delivered & Cash Collected', audit: 'Reconciled & Cleared' },
  { batchNo: 'BATCH-2026-0822', dateTime: '22-Aug-2026 10:15 AM', driver: 'Fadi Saade', vehicle: 'Regional Van 03', drops: 9, cashLbp: '45,600,000.00', status: 'Partial Return (Client Refusal)', audit: 'Pending Manager Sign-off' },
  { batchNo: 'BATCH-2026-0825', dateTime: '25-Aug-2026 08:45 AM', driver: 'Ali Al-Husseini', vehicle: 'Regional Van 01', drops: 16, cashLbp: '112,000,000.00', status: 'Delivered & Cash Collected', audit: 'Reconciled & Cleared' },
  { batchNo: 'BATCH-2026-0827', dateTime: '27-Aug-2026 01:30 PM', driver: 'Tarek Ziyad', vehicle: 'Moto Express 01', drops: 8, cashLbp: '32,150,000.00', status: 'Delivered & Cash Collected', audit: 'Reconciled & Cleared' },
];

/**
 * ============================================================================
 * CUSTOMER SALES MASTER REPORT DOCUMENT
 * Implements Vanguard ERP MasterReportDocument Accounting Standard across:
 * 1. Top N Customers by Amount (REP_S_00280)
 * 2. Sales by Customers (REP_S_00285)
 * 3. Customer in Detail (REP_S_00281)
 * 4. Sales by Zone (REP_S_00282)
 * 5. Delivery Sales Summary (REP_S_00283)
 * 6. Driver's History (REP_S_00284)
 * ============================================================================
 */
export const CustomerSalesReportMasterDocument: React.FC<CustomerSalesReportMasterDocumentProps> = ({
  reportKey,
  reportTitle,
  code,
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  branch = 'Main Branch (Choueifat Main Facility)',
  filterValues,
}) => {
  const cleanPeriod = useMemo(() => {
    if (!dynamicPeriodText) return '01-Aug-2026 to 31-Aug-2026';
    return dynamicPeriodText.replace(/^Period:\s*/i, '').replace(/^Date:\s*/i, '');
  }, [dynamicPeriodText]);

  const resolvedCode = code || (
    reportKey === 'Top N Customers by Amount' ? 'REP_S_00280' :
    reportKey === 'Sales by Customers' ? 'REP_S_00285' :
    (reportKey.toLowerCase().includes('customer in detail') || reportKey === 'Sales by customer In Detail') ? 'REP_S_00281' :
    reportKey.toLowerCase().includes('zone') ? 'REP_S_00282' :
    reportKey.toLowerCase().includes('delivery') ? 'REP_S_00283' :
    reportKey.toLowerCase().includes('driver') ? 'REP_S_00284' : 'REP_S_00280'
  );

  const resolvedTitle = reportTitle || reportKey;

  // Dynamic filter summary
  const filterSummary = useMemo(() => {
    if (!filterValues) return undefined;
    const parts: string[] = [];
    if (filterValues.zone && filterValues.zone !== 'ALL') parts.push(`Zone: ${filterValues.zone}`);
    if (filterValues.driver && filterValues.driver !== 'ALL') parts.push(`Driver: ${filterValues.driver}`);
    if (filterValues.deliveryStatus && filterValues.deliveryStatus !== 'ALL') parts.push(`Status: ${filterValues.deliveryStatus}`);
    if (filterValues.customerSearch) parts.push(`Customer: ${filterValues.customerSearch}`);
    if (filterValues.customerCategory && filterValues.customerCategory !== 'ALL') parts.push(`Category: ${filterValues.customerCategory}`);
    return parts.length > 0 ? parts.join(' | ') : undefined;
  }, [filterValues]);

  const meta: ReportMetadata = useMemo(() => ({
    companyName: 'Zeit w zaytoun ljanoub',
    subtitle: 'Southern Olive Oil Products S.A.R.L - Commercial Distribution & Accounts Register',
    reportTitle: resolvedTitle,
    code: resolvedCode,
    dateRange: cleanPeriod,
    generatedDate: executionDate,
    branch: branch.startsWith('Branch:') ? branch : `Branch: ${branch}`,
    filterSummary,
    systemSource: 'Vanguard ERP Customer Accounts & Dispatch Kernel',
    pageNumber: 1,
    totalPages: 1,
  }), [resolvedTitle, resolvedCode, cleanPeriod, executionDate, branch, filterSummary]);

  // 1. TOP N CUSTOMERS BY AMOUNT
  if (reportKey === 'Top N Customers by Amount' || resolvedCode === 'REP_S_00280') {
    const columns: ReportColumn<any>[] = [
      {
        key: 'rank',
        label: 'Rank',
        align: 'center',
        width: '6%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs font-bold text-slate-900">#{row.rank}</span>,
      },
      {
        key: 'code',
        label: 'Customer Code',
        align: 'left',
        width: '12%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs text-slate-700">{row.code}</span>,
      },
      {
        key: 'name',
        label: 'Customer Account Name',
        align: 'left',
        width: '28%',
        render: (row) => <span className="font-sans text-xs text-slate-900 font-medium">{row.name}</span>,
      },
      {
        key: 'category',
        label: 'Account Type',
        align: 'left',
        width: '14%',
        render: (row) => <span className="inline-block px-1.5 py-0.5 rounded text-[10.5px] font-semibold bg-slate-100 text-slate-800 border border-slate-300">{row.category}</span>,
      },
      {
        key: 'invoices',
        label: 'Orders',
        align: 'center',
        width: '8%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs font-bold text-slate-900">{row.invoices}</span>,
      },
      {
        key: 'avgTicket',
        label: 'Avg Ticket',
        align: 'right',
        width: '10%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs text-slate-700">{row.avgTicket}</span>,
      },
      {
        key: 'totalLbp',
        label: 'Turnover (LBP)',
        align: 'right',
        width: '12%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs text-slate-700">{row.totalLbp}</span>,
      },
      {
        key: 'totalUsd',
        label: 'Total Spend ($)',
        align: 'right',
        width: '10%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs font-bold text-emerald-800">{row.totalUsd}</span>,
      },
    ];

    const grandTotal: GrandTotal = {
      label: 'Consolidated Top Accounts Total (8 Key Clients - 187 Orders):',
      value: '$73,500.00 USD (6,588,715,000.00 LBP)',
    };

    return <MasterReportDocument meta={meta} columns={columns} flatRows={TOP_CUSTOMERS_DATA} grandTotal={grandTotal} />;
  }

  // 2. SALES BY CUSTOMERS
  if (reportKey === 'Sales by Customers' || resolvedCode === 'REP_S_00285') {
    const columns: ReportColumn<any>[] = [
      {
        key: 'code',
        label: 'Account #',
        align: 'left',
        width: '10%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs font-bold text-slate-900">{row.code}</span>,
      },
      {
        key: 'name',
        label: 'Commercial Customer Name',
        align: 'left',
        width: '26%',
        render: (row) => <span className="font-sans text-xs text-slate-900 font-medium">{row.name}</span>,
      },
      {
        key: 'tier',
        label: 'Classification',
        align: 'left',
        width: '16%',
        render: (row) => <span className="font-sans text-xs text-slate-700">{row.tier}</span>,
      },
      {
        key: 'terms',
        label: 'Payment Terms',
        align: 'left',
        width: '14%',
        render: (row) => <span className="inline-block px-1.5 py-0.5 rounded text-[10.5px] font-semibold bg-slate-50 text-slate-800 border border-slate-200">{row.terms}</span>,
      },
      {
        key: 'creditLimit',
        label: 'Credit Limit',
        align: 'right',
        width: '11%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs text-slate-600">{row.creditLimit}</span>,
      },
      {
        key: 'arBalance',
        label: 'AR Balance',
        align: 'right',
        width: '11%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs font-bold text-amber-800">{row.arBalance}</span>,
      },
      {
        key: 'totalUsd',
        label: 'Total Sales ($)',
        align: 'right',
        width: '12%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs font-bold text-slate-900">{row.totalUsd}</span>,
      },
    ];

    const grandTotal: GrandTotal = {
      label: 'Consolidated Commercial Clients Total (Total AR Outstanding: $27,030.00):',
      value: '$63,475.42 USD',
    };

    return <MasterReportDocument meta={meta} columns={columns} flatRows={SALES_BY_CUSTOMERS_DATA} grandTotal={grandTotal} />;
  }

  // 3. CUSTOMER IN DETAIL
  if (reportKey.toLowerCase().includes('detail') || resolvedCode === 'REP_S_00281') {
    const columns: ReportColumn<any>[] = [
      {
        key: 'invoiceNo',
        label: 'Invoice #',
        align: 'center',
        width: '12%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs font-bold text-slate-900">#{row.invoiceNo}</span>,
      },
      {
        key: 'date',
        label: 'Date',
        align: 'left',
        width: '12%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs text-slate-600">{row.date}</span>,
      },
      {
        key: 'branch',
        label: 'Fulfillment Branch',
        align: 'left',
        width: '16%',
        render: (row) => <span className="font-sans text-xs text-slate-700">{row.branch}</span>,
      },
      {
        key: 'items',
        label: 'Ordered Line Items',
        align: 'left',
        width: '28%',
        render: (row) => <span className="font-sans text-xs text-slate-900 font-medium">{row.items}</span>,
      },
      {
        key: 'payment',
        label: 'Tender',
        align: 'center',
        width: '10%',
        render: (row) => <span className="font-mono text-xs font-bold text-emerald-800">{row.payment}</span>,
      },
      {
        key: 'returns',
        label: 'Returns / Voids',
        align: 'right',
        width: '11%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs text-rose-700 font-medium">{row.returns}</span>,
      },
      {
        key: 'totalUsd',
        label: 'Net Total ($)',
        align: 'right',
        width: '11%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs font-bold text-slate-900">{row.totalUsd}</span>,
      },
    ];

    const grandTotal: GrandTotal = {
      label: 'Account Billing Subtotal (Al-Baraka Supermarket S.A.R.L - 5 Invoices):',
      value: '$1,614.72 USD',
    };

    return <MasterReportDocument meta={meta} columns={columns} flatRows={CUSTOMER_IN_DETAIL_DATA} grandTotal={grandTotal} />;
  }

  // 4. SALES BY ZONE
  if (reportKey.toLowerCase().includes('zone') || resolvedCode === 'REP_S_00282') {
    const columns: ReportColumn<any>[] = [
      {
        key: 'zone',
        label: 'Delivery Zone / Region',
        align: 'left',
        width: '28%',
        render: (row) => <span className="font-sans text-xs text-slate-900 font-bold">{row.zone}</span>,
      },
      {
        key: 'route',
        label: 'Primary Distribution Route',
        align: 'left',
        width: '20%',
        render: (row) => <span className="font-sans text-xs text-slate-700">{row.route}</span>,
      },
      {
        key: 'accounts',
        label: 'Clients',
        align: 'center',
        width: '8%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs text-slate-800">{row.accounts}</span>,
      },
      {
        key: 'deliveries',
        label: 'Drops',
        align: 'center',
        width: '8%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs font-bold text-slate-900">{row.deliveries}</span>,
      },
      {
        key: 'units',
        label: 'Units',
        align: 'right',
        width: '8%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs text-slate-800">{row.units}</span>,
      },
      {
        key: 'revenueLbp',
        label: 'Revenue (LBP)',
        align: 'right',
        width: '15%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs text-slate-700">{row.revenueLbp}</span>,
      },
      {
        key: 'totalUsd',
        label: 'Zone Total ($)',
        align: 'right',
        width: '13%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs font-bold text-emerald-800">{row.totalUsd}</span>,
      },
    ];

    const grandTotal: GrandTotal = {
      label: 'Consolidated Regional Turnover (7 Delivery Zones - 848 Dispatches):',
      value: '$95,606.68 USD (8,556,800,000.00 LBP)',
    };

    return <MasterReportDocument meta={meta} columns={columns} flatRows={SALES_BY_ZONE_DATA} grandTotal={grandTotal} />;
  }

  // 5. DELIVERY SALES SUMMARY
  if (reportKey.toLowerCase().includes('delivery') || resolvedCode === 'REP_S_00283') {
    const columns: ReportColumn<any>[] = [
      {
        key: 'dispatchId',
        label: 'Dispatch ID',
        align: 'center',
        width: '13%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs font-bold text-slate-900">#{row.dispatchId}</span>,
      },
      {
        key: 'dateTime',
        label: 'Dispatch Date & Time',
        align: 'left',
        width: '15%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs text-slate-600">{row.dateTime}</span>,
      },
      {
        key: 'customer',
        label: 'Destination Customer',
        align: 'left',
        width: '20%',
        render: (row) => <span className="font-sans text-xs text-slate-900 font-medium">{row.customer}</span>,
      },
      {
        key: 'zone',
        label: 'Zone',
        align: 'left',
        width: '13%',
        render: (row) => <span className="font-sans text-xs text-slate-700">{row.zone}</span>,
      },
      {
        key: 'courier',
        label: 'Driver / Courier',
        align: 'left',
        width: '16%',
        render: (row) => <span className="font-sans text-xs text-slate-800 font-medium">{row.courier}</span>,
      },
      {
        key: 'status',
        label: 'Status',
        align: 'center',
        width: '10%',
        render: (row) => (
          <span className={`inline-block px-1.5 py-0.5 rounded text-[10.5px] font-bold ${
            row.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {row.status}
          </span>
        ),
      },
      {
        key: 'totalUsd',
        label: 'Order Value',
        align: 'right',
        width: '13%',
        isMonospace: true,
        render: (row) => <span className="font-mono text-xs font-bold text-slate-900">{row.totalUsd}</span>,
      },
    ];

    const grandTotal: GrandTotal = {
      label: 'Delivered Order Value (6 Regional Dispatches Recorded):',
      value: '$4,895.00 USD',
    };

    return <MasterReportDocument meta={meta} columns={columns} flatRows={DELIVERY_SALES_SUMMARY_DATA} grandTotal={grandTotal} />;
  }

  // 6. DRIVER'S HISTORY
  const columns: ReportColumn<any>[] = [
    {
      key: 'batchNo',
      label: 'Batch Run #',
      align: 'center',
      width: '14%',
      isMonospace: true,
      render: (row) => <span className="font-mono text-xs font-bold text-slate-900">{row.batchNo}</span>,
    },
    {
      key: 'dateTime',
      label: 'Date & Time',
      align: 'left',
      width: '14%',
      isMonospace: true,
      render: (row) => <span className="font-mono text-xs text-slate-600">{row.dateTime}</span>,
    },
    {
      key: 'driver',
      label: 'Assigned Courier',
      align: 'left',
      width: '16%',
      render: (row) => <span className="font-sans text-xs text-slate-900 font-medium">{row.driver}</span>,
    },
    {
      key: 'vehicle',
      label: 'Vehicle / Run',
      align: 'left',
      width: '14%',
      render: (row) => <span className="font-sans text-xs text-slate-700">{row.vehicle}</span>,
    },
    {
      key: 'drops',
      label: 'Drops',
      align: 'center',
      width: '8%',
      isMonospace: true,
      render: (row) => <span className="font-mono text-xs font-bold text-slate-900">{row.drops}</span>,
    },
    {
      key: 'cashLbp',
      label: 'Cash Collected (LBP)',
      align: 'right',
      width: '16%',
      isMonospace: true,
      render: (row) => <span className="font-mono text-xs font-bold text-slate-900">{row.cashLbp}</span>,
    },
    {
      key: 'audit',
      label: 'Settlement Status',
      align: 'center',
      width: '18%',
      render: (row) => (
        <span className={`inline-block px-1.5 py-0.5 rounded text-[10.5px] font-semibold ${
          row.audit.includes('Cleared') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}>
          {row.audit}
        </span>
      ),
    },
  ];

  const grandTotal: GrandTotal = {
    label: 'Total Cash Handover Reconciled (67 Drops Completed):',
    value: '545,250,000.00 LBP ($6,092.17)',
  };

  return <MasterReportDocument meta={meta} columns={columns} flatRows={DRIVERS_HISTORY_DATA} grandTotal={grandTotal} />;
};

export default CustomerSalesReportMasterDocument;
