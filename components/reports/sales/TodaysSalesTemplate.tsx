import React, { useMemo } from 'react';
import UnifiedPrintableReportSheet from '../UnifiedPrintableReportSheet';
import { resolveActiveCurrencyFromFilters, matchesSalesmanFilter } from '@/lib/reportFilterEngine';
import { convertCurrency, formatCurrencyAmount } from '@/lib/currencyEngine';
import { useLivePostedInvoices, aggregateToday } from '@/lib/liveSalesReportsData';

interface TodaysSalesTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
  reportTitle?: string;
  branch?: string;
  filterValues?: Record<string, any>;
}

export const TodaysSalesTemplate: React.FC<TodaysSalesTemplateProps> = ({
  hideToolbar = true,
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  reportTitle = 'Reading / X-Report',
  branch = 'Southern Olive and Oil Products - Main',
  filterValues = {},
}) => {
  const isPaymentSummary = reportTitle.toLowerCase().includes('payment');
  const isEmployeeSummary = reportTitle.toLowerCase().includes('employee');

  const reportCode = isEmployeeSummary
    ? 'REP_SALES_003'
    : isPaymentSummary
    ? 'REP_SALES_004'
    : 'REP_S_00187';

  const activeCurrency = useMemo(() => {
    return resolveActiveCurrencyFromFilters(filterValues, 'USD');
  }, [filterValues]);

  const secondaryCurrency = activeCurrency === 'LBP' ? 'USD' : 'LBP';

  // Live figures: today's POSTED invoices only (all zero when nothing has been posted today).
  const { invoices: liveInvoices } = useLivePostedInvoices();
  const stats = useMemo(() => aggregateToday(liveInvoices), [liveInvoices]);

  const paymentTotal = stats.byPayment.reduce((s, p) => s + p.amountUsd, 0);
  const cashLike = stats.byPayment.filter((p) => /cash/i.test(p.method)).reduce((s, p) => s + p.amountUsd, 0);
  const digitalLike = stats.byPayment
    .filter((p) => /whish|omt|card|visa|master|online|digital|wallet/i.test(p.method))
    .reduce((s, p) => s + p.amountUsd, 0);
  const receivable = stats.byPayment.filter((p) => /account|credit|unpaid/i.test(p.method)).reduce((s, p) => s + p.amountUsd, 0);

  const statsBreakdown = [
    { metric: 'Gross Sales Revenue', rawUsd: stats.grossUsd, notes: `${stats.invoiceCount} Posted Sales Invoices` },
    { metric: 'Discounts Given', rawUsd: -stats.discountUsd, notes: 'From posted invoices' },
    { metric: 'Refunds / Returns', rawUsd: -stats.refundsUsd, notes: `${stats.refundCount} Return Tickets` },
    { metric: 'Net Sales Revenue', rawUsd: stats.netUsd, notes: 'Gross - discounts - refunds' },
    { metric: 'VAT Collected', rawUsd: stats.taxUsd, notes: 'Tax recorded on posted invoices' },
    { metric: 'Cash Receipts', rawUsd: cashLike, notes: 'Cash payment methods' },
    { metric: 'Card / Digital Receipts', rawUsd: digitalLike, notes: 'Non-cash electronic methods' },
    { metric: 'Credit / Accounts Receivable', rawUsd: receivable, notes: 'Unpaid or on-account balance' },
  ];

  const employeeData = stats.byEmployee.map((e) => ({
    empId: '-',
    name: e.name,
    invoices: e.invoices,
    rawTotalUSD: e.grossUsd,
    rawNetUSD: e.netUsd,
  }));

  const paymentData = stats.byPayment.map((p) => ({
    method: p.method,
    code: p.method.toUpperCase(),
    txCount: p.txCount,
    rawAmountUSD: p.amountUsd,
    pct: paymentTotal > 0 ? `${((p.amountUsd / paymentTotal) * 100).toFixed(1)}%` : '0.0%',
  }));

  const filteredEmployees = useMemo(() => {
    return employeeData.filter((emp) => {
      if (filterValues.salesman && filterValues.salesman !== 'ALL') {
        if (!matchesSalesmanFilter(emp.name, filterValues.salesman) && !matchesSalesmanFilter(emp.empId, filterValues.salesman)) {
          return false;
        }
      }
      if (filterValues.serverCashier && filterValues.serverCashier !== 'ALL') {
        const sc = String(filterValues.serverCashier).toLowerCase();
        if (!emp.name.toLowerCase().includes(sc) && !emp.empId.toLowerCase().includes(sc)) return false;
      }
      return true;
    });
  }, [stats, filterValues.salesman, filterValues.serverCashier]);

  const filteredPayments = useMemo(() => {
    return paymentData.filter((pm) => {
      const pType = filterValues.paymentType || filterValues.paymentMode || filterValues.tender;
      if (pType && pType !== 'ALL') {
        const pt = String(pType).toLowerCase();
        if (!pm.method.toLowerCase().includes(pt) && !pm.code.toLowerCase().includes(pt)) {
          return false;
        }
      }
      if (filterValues.currency && filterValues.currency !== 'ALL') {
        const cur = String(filterValues.currency).toLowerCase();
        if (pm.method.toLowerCase().includes('usd') && cur !== 'usd') return false;
        if (pm.method.toLowerCase().includes('lbp') && cur !== 'lbp') return false;
      }
      return true;
    });
  }, [stats, filterValues.paymentType, filterValues.paymentMode, filterValues.tender, filterValues.currency]);

  const branchDisplay = branch || 'Facility: Choueifat Main Plant';

  return (
    <UnifiedPrintableReportSheet
      reportTitle={reportTitle}
      reportCode={reportCode}
      executionDate={executionDate}
      periodText={dynamicPeriodText || 'Operating Date: Today (Current Shift)'}
      pageInfo="Page 1 of 1"
      branchInfo={branchDisplay}
      hideToolbar={hideToolbar}
    >
      {/* Render based on specific sub-report or standard statistics */}
      {isEmployeeSummary ? (
        <table className="w-full table-fixed text-left border-collapse text-[11px]">
          <thead>
            <tr className="border-b-2 border-slate-900 font-bold text-black leading-tight bg-slate-50">
              <th className="py-2 px-2 normal-case w-[15%] font-sans">emp id</th>
              <th className="py-2 px-2 normal-case w-[35%] font-sans">employee name</th>
              <th className="py-2 px-2 normal-case w-[15%] font-sans text-center">invoices</th>
              <th className="py-2 px-2 normal-case w-[15%] font-sans text-right">gross sales ({activeCurrency})</th>
              <th className="py-2 px-2 normal-case w-[20%] font-sans text-right pr-2">net sales ({activeCurrency})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 font-medium italic">
                  No employee sales records matching active filters
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp, idx) => {
                const convertedGross = convertCurrency(emp.rawTotalUSD, 'USD', activeCurrency);
                const convertedNet = convertCurrency(emp.rawNetUSD, 'USD', activeCurrency);
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-2 font-mono">{emp.empId}</td>
                    <td className="py-2 px-2 font-bold text-slate-900 font-sans">{emp.name}</td>
                    <td className="py-2 px-2 text-center font-mono">{emp.invoices}</td>
                    <td className="py-2 px-2 text-right font-mono">{formatCurrencyAmount(convertedGross, activeCurrency, true)}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-emerald-800 pr-2">
                      {formatCurrencyAmount(convertedNet, activeCurrency, true)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      ) : isPaymentSummary ? (
        <table className="w-full table-fixed text-left border-collapse text-[11px]">
          <thead>
            <tr className="border-b-2 border-slate-900 font-bold text-black leading-tight bg-slate-50">
              <th className="py-2 px-2 normal-case w-[35%] font-sans">payment method</th>
              <th className="py-2 px-2 normal-case w-[15%] font-sans text-center">tx count</th>
              <th className="py-2 px-2 normal-case w-[20%] font-sans text-right">amount ({activeCurrency})</th>
              <th className="py-2 px-2 normal-case w-[20%] font-sans text-right">amount ({secondaryCurrency})</th>
              <th className="py-2 px-2 normal-case w-[10%] font-sans text-right pr-2">share %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 font-medium italic">
                  No payment tender records matching active filters
                </td>
              </tr>
            ) : (
              filteredPayments.map((pm, idx) => {
                const convertedPrimary = convertCurrency(pm.rawAmountUSD, 'USD', activeCurrency);
                const convertedSecondary = convertCurrency(pm.rawAmountUSD, 'USD', secondaryCurrency);
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-2 font-bold text-slate-900 font-sans">{pm.method}</td>
                    <td className="py-2 px-2 text-center font-mono">{pm.txCount}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold">{formatCurrencyAmount(convertedPrimary, activeCurrency, true)}</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-600">{formatCurrencyAmount(convertedSecondary, secondaryCurrency, true)}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-blue-700 pr-2">{pm.pct}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      ) : (
        <table className="w-full table-fixed text-left border-collapse text-[11px]">
          <thead>
            <tr className="border-b-2 border-slate-900 font-bold text-black leading-tight bg-slate-50">
              <th className="py-2 px-3 normal-case w-[40%] font-sans">performance metric</th>
              <th className="py-2 px-2 normal-case w-[20%] font-sans text-right">amount ({activeCurrency})</th>
              <th className="py-2 px-2 normal-case w-[20%] font-sans text-right">amount ({secondaryCurrency})</th>
              <th className="py-2 px-3 normal-case w-[20%] font-sans">audit notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
            {statsBreakdown.map((row, idx) => {
              const convertedPrimary = convertCurrency(row.rawUsd, 'USD', activeCurrency);
              const convertedSecondary = convertCurrency(row.rawUsd, 'USD', secondaryCurrency);
              const isNeg = row.rawUsd < 0;
              return (
                <tr key={idx} className={`hover:bg-slate-50 ${row.metric.includes('Net Sales') ? 'bg-blue-50/50 font-bold' : ''}`}>
                  <td className="py-2 px-3 text-slate-900 font-sans">{row.metric}</td>
                  <td className={`py-2 px-2 text-right font-mono font-bold ${isNeg ? 'text-red-700' : 'text-slate-900'}`}>
                    {formatCurrencyAmount(convertedPrimary, activeCurrency, true)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-slate-600">
                    {formatCurrencyAmount(convertedSecondary, secondaryCurrency, true)}
                  </td>
                  <td className="py-2 px-3 text-slate-500 font-sans">{row.notes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div className="border-t-2 border-slate-900 mt-4 pt-2 flex justify-between items-center text-xs font-mono font-bold text-slate-800">
        <span>Status: Live posted invoices (today)</span>
        <span>Invoices: {stats.invoiceCount}</span>
      </div>
    </UnifiedPrintableReportSheet>
  );
};

