'use client';

import React, { useState, useMemo } from 'react';
import ReportPageLayout, {
  ReportHeader,
  ExportButtons,
  ReportFilters,
  ReportSelectFilter,
  ReportMetricCards,
  ReportTableWrapper,
  MetricCardItem,
  DynamicReportFilterRenderer,
} from '@/components/reports/ReportPageLayout';
import {
  SALES_CONTROL_OMEGA_TREE,
  ALL_SALES_CONTROL_REPORTS,
  getSalesReportMeta,
} from '@/components/reports/salesControlReportsTree';
import { TransactionsByDateMasterDocument } from '@/components/reports/transactions/TransactionsByDateMasterDocument';
import { CreditSalesTemplate } from '@/components/reports/transactions/CreditSalesTemplate';
import { CreditCardReportTemplate } from '@/components/reports/transactions/CreditCardReportTemplate';
import { SummaryOfSalesByItemsTemplate } from '@/components/reports/sales/SummaryOfSalesByItemsTemplate';
import { SummaryOfVoidsTemplate } from '@/components/reports/sales/SummaryOfVoidsTemplate';
import { SummaryOfRefundsTemplate } from '@/components/reports/sales/SummaryOfRefundsTemplate';
import { MeterReportTemplate } from '@/components/reports/sales/MeterReportTemplate';
import { TodaysSalesTemplate } from '@/components/reports/sales/TodaysSalesTemplate';
import { CustomerListStandardTemplate } from '@/components/reports/sales/CustomerListStandardTemplate';
import { ElectronicJournalTemplate } from '@/components/reports/transactions/ElectronicJournalTemplate';
import { CustomerSalesReportMasterDocument } from '@/components/reports/sales/CustomerSalesReportMasterDocument';
import { TimeAndAttendanceMasterDocument } from '@/components/reports/hr/TimeAndAttendanceMasterDocument';
import { UniversalReportTableResolver } from '@/components/reports/UniversalReportTableResolver';
import { resolveSchemaForReport, getDomainKpiMetrics } from '@/lib/reportSchemaResolverEngine';
import { SharedReportViewer, isSharedReport } from '@/components/reports/registry';
import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import { getPaymentMethodTextClass } from '@/components/reports/reportContrastTokens';
import {
  convertCurrency,
  formatCurrencyAmount,
  extractCurrencyFromFilter,
} from '@/lib/currencyEngine';
import {
  DEFAULT_MOCK_TRANSACTIONS,
  MasterMockTransaction,
  matchesPaymentFilter,
  matchesChannelFilter,
  matchesInvoiceTypeFilter,
  matchesSalesmanFilter,
  matchesEmployeeFilter,
  matchesCustomerFilter,
  parseDateToIso,
} from '@/lib/duplicateInvoicesQueryEngine';
import {
  getDefaultInitialDateRange,
  resolveDateRangeFromPreset,
} from '@/lib/dateRangeEngine';

// Initial Sales Invoices populated with comprehensive mock dataset
const INITIAL_SALES_INVOICES: MasterMockTransaction[] = DEFAULT_MOCK_TRANSACTIONS;

export default function MasterReportViewPage() {
  // 1. Navigation & Selection State (Defaulting to Transactions by Date)
  const [selectedReport, setSelectedReport] = useState<string>('Transactions by Date');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Resolved metadata for active report sheet
  const activeMeta = useMemo(() => getSalesReportMeta(selectedReport), [selectedReport]);

  // Synchronize recent reports in localStorage when selected and isolate filter state
  const handleSelectReport = (reportName: string) => {
    setSelectedReport(reportName);
    setSearchQuery('');
    setPaymentFilter('ALL');
    setSalesFilterValues({});
    setCurrentPage(1);
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('vanguard_recent_reports_sales');
        const prev = stored ? JSON.parse(stored) : [];
        if (Array.isArray(prev)) {
          const updated = [reportName, ...prev.filter((r: string) => r !== reportName)].slice(0, 5);
          localStorage.setItem('vanguard_recent_reports_sales', JSON.stringify(updated));
        }
      }
    } catch (err) {
      console.warn('[handleSelectReport] localStorage sync error:', err);
    }
  };

  // 2. Filter States
  const initialDateRange = getDefaultInitialDateRange('This Month');
  const [period, setPeriod] = useState<string>(initialDateRange.preset);
  const [fromDate, setFromDate] = useState<string>(initialDateRange.fromDate);
  const [toDate, setToDate] = useState<string>(initialDateRange.toDate);
  const [branch, setBranch] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [salesFilterValues, setSalesFilterValues] = useState<Record<string, any>>({});

  // 3. Table Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filtered Sales Invoices for Fallback Master Table & Report Views
  const filteredInvoices = useMemo(() => {
    return INITIAL_SALES_INVOICES.filter((inv) => {
      // 1. Search Query
      const matchesSearch =
        searchQuery === '' ||
        inv.invoiceNo.includes(searchQuery) ||
        inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.branch.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Branch
      const matchesBranch =
        branch === 'ALL' ||
        inv.branch === branch ||
        inv.branch.toLowerCase().includes(branch.toLowerCase()) ||
        branch.toLowerCase().includes(inv.branch.toLowerCase());

      // 3. Payment Method (from paymentFilter or salesFilterValues)
      const activePay = salesFilterValues.paymentType || salesFilterValues.paymentMode || paymentFilter;
      const matchesPayment = matchesPaymentFilter(inv.payment_method || inv.paymentType, activePay, inv.currency);

      // 4. Channel / Department
      const activeChannel = salesFilterValues.departmentChannel || salesFilterValues.channel;
      const matchesChannel = matchesChannelFilter(inv.channel || inv.department, activeChannel);

      // 5. Invoice Type
      const activeInvType = salesFilterValues.invoiceType || salesFilterValues.invoice_type;
      const matchesInvoiceType = matchesInvoiceTypeFilter(inv.invoice_type || inv.invoiceType, activeInvType);

      // 6. Date Range
      const invIso = parseDateToIso(inv.date);
      const matchesFromDate = !fromDate || invIso >= fromDate;
      const matchesToDate = !toDate || invIso <= toDate;

      // 7. Audit Flags
      let matchesAudit = true;
      const flag = salesFilterValues.auditFlags;
      if (flag && flag !== 'ALL') {
        if (flag === 'SHOW_REFUND') matchesAudit = Boolean(inv.isRefund) || inv.invoiceNo.startsWith('-');
        else if (flag === 'SHOW_ZERO') matchesAudit = (inv.total ?? inv.totalLbp) === 0;
        else if (flag === 'SHOW_DISCOUNT') matchesAudit = (inv.discount ?? inv.discountLbp) > 0;
        else if (flag === 'SHOW_ZERO_TAX') matchesAudit = (inv.tax ?? inv.taxLbp) === 0;
      }

      // 8. Workstation Filter
      const activeWs = salesFilterValues.workstation;
      const matchesWs =
        !activeWs ||
        activeWs === 'ALL' ||
        String(inv.workstation || '').toLowerCase().includes(String(activeWs).toLowerCase()) ||
        String(activeWs).toLowerCase().includes(String(inv.workstation || '').toLowerCase());

      // 9. Cashier / Server Filter
      const activeCashier = salesFilterValues.serverCashier || salesFilterValues.cashier;
      const matchesCashier =
        !activeCashier ||
        activeCashier === 'ALL' ||
        String(inv.server || inv.employee || '').toLowerCase().includes(String(activeCashier).toLowerCase()) ||
        String(activeCashier).toLowerCase().includes(String(inv.server || inv.employee || '').toLowerCase());

      // 9b. Employee Filter
      const activeEmployee = salesFilterValues.employee;
      const matchesEmployee =
        !activeEmployee ||
        activeEmployee === 'ALL' ||
        matchesEmployeeFilter(inv.employee || inv.employee_name || inv.salesman || inv.server, activeEmployee);

      // 9c. Customer Filter
      const activeCustomer = salesFilterValues.customer || salesFilterValues.customerSearch;
      const matchesCustomer =
        !activeCustomer ||
        activeCustomer === 'ALL' ||
        matchesCustomerFilter(inv.customerName, activeCustomer, inv.custId);

      // 10. Salesman Filter
      const activeSalesman = salesFilterValues.salesman;
      const matchesSalesman = matchesSalesmanFilter(
        inv.salesman || inv.employee || inv.server,
        activeSalesman
      );

      // 11. Currency Filter
      const activeCurr = salesFilterValues.currency;
      const matchesCurrency =
        !activeCurr ||
        activeCurr === 'ALL' ||
        String(inv.currency || '').toUpperCase() === String(activeCurr).toUpperCase();

      return (
        matchesSearch &&
        matchesBranch &&
        matchesPayment &&
        matchesChannel &&
        matchesInvoiceType &&
        matchesFromDate &&
        matchesToDate &&
        matchesAudit &&
        matchesWs &&
        matchesCashier &&
        matchesEmployee &&
        matchesCustomer &&
        matchesSalesman &&
        matchesCurrency
      );
    });
  }, [searchQuery, branch, paymentFilter, salesFilterValues, fromDate, toDate]);

  // Paginated Slice
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(startIndex, startIndex + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;

  // Active currency context (e.g. from paymentType, paymentMode, or direct currency filter)
  const activePayFilter = salesFilterValues.paymentType || salesFilterValues.paymentMode || paymentFilter;
  const activeCurrency = extractCurrencyFromFilter(activePayFilter) || salesFilterValues.currency || 'USD';

  // Multi-Currency KPI Metrics Calculation
  const totalSalesTarget = filteredInvoices.reduce((acc, i) => {
    const rawAmt = i.total ?? 0;
    const fromCurr = i.currency || 'LBP';
    return acc + convertCurrency(rawAmt, fromCurr, activeCurrency);
  }, 0);

  const totalSalesSecondary = filteredInvoices.reduce((acc, i) => {
    const rawAmt = i.total ?? 0;
    const fromCurr = i.currency || 'LBP';
    const secondaryCurr = activeCurrency === 'LBP' ? 'USD' : 'LBP';
    return acc + convertCurrency(rawAmt, fromCurr, secondaryCurr);
  }, 0);

  const totalDiscountsTarget = filteredInvoices.reduce((acc, i) => {
    const rawAmt = i.discount ?? 0;
    const fromCurr = i.currency || 'LBP';
    return acc + convertCurrency(rawAmt, fromCurr, activeCurrency);
  }, 0);

  const avgCheckTarget = filteredInvoices.length > 0 ? totalSalesTarget / filteredInvoices.length : 0;

  const resolvedState = useMemo(() => {
    return resolveSchemaForReport(
      selectedReport,
      activeMeta.code,
      'sales',
      undefined,
      {
        branch,
        fromDate,
        toDate,
        searchQuery,
        paymentMode: paymentFilter,
        ...salesFilterValues,
      }
    );
  }, [selectedReport, activeMeta.code, branch, fromDate, toDate, searchQuery, paymentFilter, salesFilterValues]);

  const salesKpiMetrics: MetricCardItem[] = useMemo(() => {
    // If the active report is an explicit schema (audit, no sale, hold, tax, payment, discount, meter, etc.)
    // or belongs to a non-sales domain, dynamically generate domain-specific KPI cards!
    if (resolvedState.isExplicitSchema || resolvedState.domain !== 'sales') {
      return getDomainKpiMetrics(resolvedState.schema, resolvedState.rows, activeCurrency);
    }

    // Default live sales transactions list metrics:
    return [
      {
        title: 'Gross Invoiced Sales',
        value: formatCurrencyAmount(totalSalesTarget, activeCurrency, true),
        subtext: formatCurrencyAmount(totalSalesSecondary, activeCurrency === 'LBP' ? 'USD' : 'LBP', true),
        icon: <DollarSign className="w-5 h-5" />,
        change: { value: '+8.4%', trend: 'up' },
      },
      {
        title: 'Total Invoices Count',
        value: filteredInvoices.length,
        subtext: 'Reconciled branch sales',
        icon: <ShoppingCart className="w-5 h-5" />,
        change: { value: 'Active ledger', trend: 'neutral' },
      },
      {
        title: 'Average Ticket Value',
        value: formatCurrencyAmount(avgCheckTarget, activeCurrency, true),
        subtext: 'Per customer transaction',
        icon: <TrendingUp className="w-5 h-5" />,
        change: { value: '+3.1%', trend: 'up' },
      },
      {
        title: 'Discounts & Voids',
        value: formatCurrencyAmount(totalDiscountsTarget, activeCurrency, true),
        subtext: 'Total concessions granted',
        icon: <AlertTriangle className="w-5 h-5" />,
        change: { value: '1.4% Rate', trend: 'down' },
      },
    ];
  }, [
    resolvedState,
    activeCurrency,
    totalSalesTarget,
    totalSalesSecondary,
    filteredInvoices.length,
    avgCheckTarget,
    totalDiscountsTarget,
  ]);

  return (
    <ReportPageLayout
      moduleTitle="Sales Control"
      moduleKey="sales"
      storageKeyOverride="vanguard_recent_reports_sales"
      categories={SALES_CONTROL_OMEGA_TREE}
      selectedReport={selectedReport}
      onSelectReport={handleSelectReport}
      // 1. Standardized Header
      header={
        <ReportHeader
          title={activeMeta.name}
          subtitle={`Sales Control module transactional reports, audits, and VAT ledger for ${period}.`}
          reportCode={activeMeta.code}
          badgeText="Verified Master Ledger"
          badgeVariant="primary"
          breadcrumbs={[
            { label: 'Home', href: '/backoffice' },
            { label: '1. Sales Control', href: '/sales-control/reports' },
            { label: activeMeta.category },
            ...(activeMeta.subGroup ? [{ label: activeMeta.subGroup }] : []),
            { label: activeMeta.name },
          ]}
          actions={
            <ExportButtons
              onExportPdf={() => window.print()}
              onPrint={() => window.print()}
              onExportExcel={() => alert(`Exporting ${activeMeta.name} to Excel (.xlsx)...`)}
              onExportCsv={() => alert(`Exporting ${activeMeta.name} to CSV...`)}
            />
          }
        />
      }
      // 2. Standardized KPI Metrics
      metrics={<ReportMetricCards metrics={salesKpiMetrics} />}
      // 3. Dynamic Filter Engine
      filters={
        <DynamicReportFilterRenderer
          activeReportKey={selectedReport}
          module="sales"
          values={{
            period,
            fromDate,
            toDate,
            branch,
            paymentMode: paymentFilter,
            searchQuery,
            ...salesFilterValues,
          }}
          onValuesChange={(newVals) => {
            if (newVals.period !== undefined) setPeriod(newVals.period);
            if (newVals.fromDate !== undefined) setFromDate(newVals.fromDate);
            if (newVals.toDate !== undefined) setToDate(newVals.toDate);
            if (newVals.branch !== undefined) setBranch(newVals.branch);
            if (newVals.paymentMode !== undefined) setPaymentFilter(newVals.paymentMode);
            if (newVals.paymentType !== undefined) setPaymentFilter(newVals.paymentType);
            if (newVals.searchQuery !== undefined) setSearchQuery(newVals.searchQuery);
            setSalesFilterValues(newVals);
          }}
          onApplyFilters={(vals) => alert(`Filters applied for: ${activeMeta.name}`)}
          onResetFilters={() => {
            const defRange = getDefaultInitialDateRange('This Month');
            setSearchQuery('');
            setBranch('ALL');
            setPaymentFilter('ALL');
            setPeriod(defRange.preset);
            setFromDate(defRange.fromDate);
            setToDate(defRange.toDate);
            setSalesFilterValues({});
          }}
        />
      }
      // 4. Standardized Data Table Area / Specific Report Template Canvas
      table={
        <>
          {/* Shared Reports across Sales & Accounting / Operations */}
          {isSharedReport(selectedReport) && (
            <SharedReportViewer
              reportName={selectedReport}
              moduleContext="sales"
              dateRangeText={`Period: ${fromDate} to ${toDate}`}
              searchQuery={searchQuery}
            />
          )}

          {/* Dynamic Switcher across Sales Control Specific Templates */}
          {!isSharedReport(selectedReport) && (selectedReport.startsWith('Transactions by') ||
            selectedReport.includes('Duplicate Invoices') ||
            selectedReport.includes('Cashier Shift') ||
            selectedReport.includes('Void and Refund')) && (
            <TransactionsByDateMasterDocument
              dynamicPeriodText={`Period: ${fromDate} to ${toDate}`}
              executionDate="06-Sep-2026"
              showRate={salesFilterValues.showRate !== undefined ? Boolean(salesFilterValues.showRate) : true}
              groupByDate={salesFilterValues.groupByDate !== undefined ? Boolean(salesFilterValues.groupByDate) : true}
              branch={branch === 'ALL' ? 'Main Branch (Choueifat Main Facility)' : branch}
              invoices={filteredInvoices}
              reportTitle={activeMeta.name || selectedReport}
              code={activeMeta.code}
              primaryMode={selectedReport.includes('Duplicate Invoices') ? 'Duplicate Invoices' : (selectedReport.startsWith('Transactions by') ? selectedReport : (salesFilterValues.primaryMode || undefined))}
              filterValues={{
                ...salesFilterValues,
                branch,
                fromDate,
                toDate,
                paymentMode: salesFilterValues.paymentMode || paymentFilter,
                paymentType: salesFilterValues.paymentType || paymentFilter,
              }}
            />
          )}

          {selectedReport === 'Credit Sales' && (
            <CreditSalesTemplate
              hideToolbar={true}
              dynamicPeriodText={`Period: ${fromDate} to ${toDate}`}
              executionDate="06-Sep-2026"
              showRate={salesFilterValues.showRate !== undefined ? Boolean(salesFilterValues.showRate) : false}
              groupByDate={salesFilterValues.groupByDate !== undefined ? Boolean(salesFilterValues.groupByDate) : true}
              filterValues={{
                ...salesFilterValues,
                branch,
                fromDate,
                toDate,
                paymentMode: salesFilterValues.paymentMode || paymentFilter,
                paymentType: salesFilterValues.paymentType || paymentFilter,
              }}
            />
          )}

          {(selectedReport === 'Credit Card Report' || selectedReport.toLowerCase().includes('credit card')) && (
            <CreditCardReportTemplate
              hideToolbar={true}
              dynamicPeriodText={`Period: ${fromDate} to ${toDate}`}
              executionDate="06-Sep-2026"
            />
          )}

          {(selectedReport.toLowerCase() === 'summary of sales by items' ||
            selectedReport === 'Summary of Sales By Items' ||
            selectedReport === 'Sales by Items') && (
            <SummaryOfSalesByItemsTemplate
              hideToolbar={true}
              dynamicPeriodText={`Fiscal Cycle: ${fromDate} to ${toDate}`}
              executionDate="29-Aug-2026"
              branch={branch === 'ALL' ? 'Main Branch (Choueifat Main Facility)' : branch}
              filterValues={{
                ...salesFilterValues,
                branch,
                fromDate,
                toDate,
                currency: activeCurrency,
              }}
            />
          )}

          {(selectedReport.toLowerCase() === 'summary of voids') && (
            <SummaryOfVoidsTemplate
              hideToolbar={true}
              dynamicPeriodText={`Audit Window: ${fromDate} to ${toDate}`}
              executionDate="06-Sep-2026"
              fromDate={fromDate}
              toDate={toDate}
              branch={branch === 'ALL' ? 'Main Branch (Choueifat Main Facility)' : branch}
              filterValues={{
                ...salesFilterValues,
                branch,
                fromDate,
                toDate,
                currency: activeCurrency,
              }}
            />
          )}

          {(selectedReport.toLowerCase() === 'summary of refunds' ||
            selectedReport.toLowerCase() === 'details of refunds' ||
            selectedReport.toLowerCase() === 'details of refund') && (
            <SummaryOfRefundsTemplate
              hideToolbar={true}
              dynamicPeriodText={`Reimbursement Window: ${fromDate} to ${toDate}`}
              executionDate="06-Sep-2026"
              fromDate={fromDate}
              toDate={toDate}
              reportTitle={activeMeta.name}
              branch={branch === 'ALL' ? 'Main Branch (Choueifat Main Facility)' : branch}
              filterValues={{
                ...salesFilterValues,
                branch,
                fromDate,
                toDate,
                currency: activeCurrency,
              }}
            />
          )}

          {/* Meter & Shift Reading Register (REP_S_00189) */}
          {(selectedReport === 'Meter Report' ||
            selectedReport === 'Meter / Shift Reading Report' ||
            selectedReport.toLowerCase().includes('meter') ||
            activeMeta.code === 'REP_S_00189') && (
            <MeterReportTemplate
              hideToolbar={false}
              dynamicPeriodText={`Audit Window: ${fromDate} to ${toDate}`}
              executionDate="06-Sep-2026"
              branch={branch === 'ALL' ? 'Main Branch (Choueifat Main Facility)' : branch}
              fromDate={fromDate}
              toDate={toDate}
              reportTitle={activeMeta.name}
              code={activeMeta.code}
              filterValues={{
                ...salesFilterValues,
                branch,
                fromDate,
                toDate,
                workstation: salesFilterValues.workstation || 'ALL',
                shiftBatch: salesFilterValues.shiftBatch || 'ALL',
                currency: activeCurrency,
              }}
            />
          )}

          {!selectedReport.toLowerCase().includes('meter') &&
            activeMeta.code !== 'REP_S_00189' &&
            (selectedReport.startsWith("Today's") ||
              selectedReport.toLowerCase().includes('reading') ||
              selectedReport.toLowerCase().includes('older') ||
              selectedReport.toLowerCase().includes('shift') ||
              selectedReport.toLowerCase().includes('settlement log') ||
              selectedReport === 'Transactions History') && (
            <TodaysSalesTemplate
              hideToolbar={true}
              dynamicPeriodText={selectedReport.includes('Today') || selectedReport.includes('/ X') ? `Shift Date: Today (Current Shift)` : `Audit Window: ${fromDate} to ${toDate}`}
              executionDate="06-Sep-2026"
              reportTitle={activeMeta.name}
              filterValues={{
                ...salesFilterValues,
                branch,
                fromDate,
                toDate,
                currency: activeCurrency,
              }}
            />
          )}

          {(selectedReport === 'Customer List Standard' ||
            selectedReport === 'Not Active Customers' ||
            selectedReport === 'New Customers' ||
            selectedReport === 'Black List Customers' ||
            selectedReport === 'Blacklist Customers') && (
            <CustomerListStandardTemplate
              hideToolbar={true}
              dynamicPeriodText="Grouping: Wholesales / Clients / Key Accounts"
              executionDate="06-Sep-2026"
              reportTitle={activeMeta.name}
              branch={branch === 'ALL' ? 'Main Branch (Choueifat Main Facility)' : branch}
              filterValues={salesFilterValues}
            />
          )}

          {/* Time & Attendance Module Reports */}
          {(selectedReport.toLowerCase().includes('attendance') ||
            selectedReport.toLowerCase().includes('labor cost') ||
            selectedReport.toLowerCase().includes('scheduling')) && (
            <TimeAndAttendanceMasterDocument
              reportKey={selectedReport}
              reportTitle={activeMeta.name}
              code={activeMeta.code}
              dynamicPeriodText={`Attendance Window: ${fromDate} to ${toDate}`}
              executionDate="06-Sep-2026"
              branch={branch === 'ALL' ? 'Main Branch (Choueifat Main Facility)' : branch}
              filterValues={salesFilterValues}
            />
          )}

          {selectedReport === 'Electronic Journal' && (
            <ElectronicJournalTemplate
              hideToolbar={true}
              dynamicPeriodText={`Journal Cycle: ${fromDate} to ${toDate}`}
              executionDate="06-Sep-2026"
            />
          )}

          {/* Customer Sales Reports - Accounting Canvas */}
          {(selectedReport === 'Top N Customers by Amount' ||
            selectedReport === 'Sales by Customers' ||
            selectedReport === 'Customer in Detail' ||
            selectedReport === 'Sales by customer In Detail' ||
            selectedReport.toLowerCase().includes('zone') ||
            selectedReport.toLowerCase().includes('delivery') ||
            selectedReport.toLowerCase().includes('driver')) && (
            <CustomerSalesReportMasterDocument
              reportKey={selectedReport}
              reportTitle={activeMeta.name}
              code={activeMeta.code}
              dynamicPeriodText={`Audit Window: ${fromDate} to ${toDate}`}
              executionDate="06-Sep-2026"
              branch={branch === 'ALL' ? 'Main Branch (Choueifat Main Facility)' : branch}
              filterValues={salesFilterValues}
            />
          )}

          {/* Fallback Standard Master Transactions Data Table with built-in pagination */}
          {!isSharedReport(selectedReport) &&
            !selectedReport.startsWith('Transactions by') &&
            !selectedReport.includes('Duplicate Invoices') &&
            !selectedReport.includes('Cashier Shift') &&
            !selectedReport.includes('Void and Refund') &&
            selectedReport !== 'Credit Sales' &&
            selectedReport !== 'Credit Card Report' &&
            !selectedReport.toLowerCase().includes('credit card') &&
            selectedReport.toLowerCase() !== 'summary of sales by items' &&
            selectedReport !== 'Sales by Items' &&
            selectedReport.toLowerCase() !== 'summary of voids' &&
            selectedReport.toLowerCase() !== 'summary of refunds' &&
            selectedReport.toLowerCase() !== 'details of refunds' &&
            selectedReport.toLowerCase() !== 'details of refund' &&
            !selectedReport.startsWith("Today's") &&
            !selectedReport.toLowerCase().includes('reading') &&
            !selectedReport.toLowerCase().includes('older') &&
            !selectedReport.toLowerCase().includes('shift') &&
            !selectedReport.toLowerCase().includes('settlement log') &&
            selectedReport !== 'Transactions History' &&
            selectedReport !== 'Customer List Standard' &&
            selectedReport !== 'Not Active Customers' &&
            selectedReport !== 'New Customers' &&
            selectedReport !== 'Black List Customers' &&
            selectedReport !== 'Blacklist Customers' &&
            !selectedReport.toLowerCase().includes('attendance') &&
            !selectedReport.toLowerCase().includes('labor cost') &&
            !selectedReport.toLowerCase().includes('scheduling') &&
            selectedReport !== 'Electronic Journal' &&
            selectedReport !== 'Top N Customers by Amount' &&
            selectedReport !== 'Sales by Customers' &&
            selectedReport !== 'Customer in Detail' &&
            selectedReport !== 'Sales by customer In Detail' &&
            !selectedReport.toLowerCase().includes('zone') &&
            !selectedReport.toLowerCase().includes('delivery') &&
            !selectedReport.toLowerCase().includes('driver') &&
            !selectedReport.toLowerCase().includes('meter') &&
            activeMeta.code !== 'REP_S_00189' && (
              <UniversalReportTableResolver
                reportName={selectedReport}
                reportCode={activeMeta.code}
                moduleContext="sales"
                filterValues={{
                  ...salesFilterValues,
                  branch,
                  fromDate,
                  toDate,
                  paymentMode: paymentFilter,
                  searchQuery,
                }}
                dynamicPeriodText={`Audit Window: ${fromDate} to ${toDate}`}
                executionDate="06-Sep-2026"
                branch={branch === 'ALL' ? 'Main Branch (Choueifat Main Facility)' : branch}
                activeCurrency={activeCurrency}
                hideToolbar={false}
              />
            )}
        </>
      }
    />
  );
}
