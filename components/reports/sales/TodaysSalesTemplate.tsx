import React, { useMemo } from 'react';
import UnifiedPrintableReportSheet from '../UnifiedPrintableReportSheet';
import { resolveActiveCurrencyFromFilters, matchesSalesmanFilter } from '@/lib/reportFilterEngine';
import { convertCurrency, formatCurrencyAmount } from '@/lib/currencyEngine';

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
  branch = 'Main Branch (Choueifat Main Facility)',
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

  const statsBreakdown = [
    { metric: 'Gross Sales Revenue', rawUsd: 4850.00, notes: '42 Total Sales Invoices' },
    { metric: 'Discounts Given', rawUsd: -140.00, notes: 'Manager & Promotional' },
    { metric: 'Refunds / Returns', rawUsd: -65.00, notes: '2 Return Tickets' },
    { metric: 'Net Sales Revenue', rawUsd: 4645.00, notes: 'Taxable & Exempt Net' },
    { metric: 'VAT Collected (11%)', rawUsd: 312.40, notes: 'Lebanese MOF Standard' },
    { metric: 'Cash in Drawer (USD)', rawUsd: 2450.00, notes: 'Physical Cash Verified' },
    { metric: 'Whish / OMT Digital', rawUsd: 1240.00, notes: 'Settled to Bank Vault' },
    { metric: 'Credit / Accounts Receivable', rawUsd: 955.00, notes: 'Wholesale B2B Clients' },
  ];

  const employeeData = [
    { empId: 'EMP-01', name: 'Ahmad Ali Kassem', invoices: 18, rawTotalUSD: 2150.00, rawNetUSD: 2150.00 },
    { empId: 'EMP-02', name: 'Hiba Aloulou', invoices: 14, rawTotalUSD: 1640.00, rawNetUSD: 1600.00 },
    { empId: 'EMP-03', name: 'Hussein Mahdi', invoices: 10, rawTotalUSD: 1060.00, rawNetUSD: 1035.00 },
  ];

  const paymentData = [
    { method: 'Cash (USD)', code: 'CASH', txCount: 22, rawAmountUSD: 2450.00, pct: '52.7%' },
    { method: 'Cash (LBP)', code: 'CASH', txCount: 8, rawAmountUSD: 650.00, pct: '14.0%' },
    { method: 'Whish Money / OMT Pay', code: 'WHISH', txCount: 7, rawAmountUSD: 590.00, pct: '12.7%' },
    { method: 'Credit Account (B2B Invoice)', code: 'STORE CREDIT', txCount: 5, rawAmountUSD: 955.00, pct: '20.6%' },
  ];

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
  }, [filterValues.salesman, filterValues.serverCashier]);

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
  }, [filterValues.paymentType, filterValues.paymentMode, filterValues.tender, filterValues.currency]);

  const branchDisplay = branch ? (branch.startsWith('Branch:') ? branch : `Branch: ${branch}`) : 'Branch: Main Branch (Zeit w zaytoun ljanoub)';

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
        <span>Status: Live Registered Registers</span>
        <span>Shift Supervisor: M. Harb</span>
      </div>
    </UnifiedPrintableReportSheet>
  );
};

