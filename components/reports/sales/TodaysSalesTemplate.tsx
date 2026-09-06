'use client';

import React from 'react';

interface TodaysSalesTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
  reportTitle?: string;
}

export const TodaysSalesTemplate: React.FC<TodaysSalesTemplateProps> = ({
  hideToolbar = true,
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  reportTitle = "Today's Statistics",
}) => {
  const isPaymentSummary = reportTitle.toLowerCase().includes('payment');
  const isEmployeeSummary = reportTitle.toLowerCase().includes('employee');
  const isTransactions = reportTitle.toLowerCase().includes('transaction');

  const statsBreakdown = [
    { metric: 'Gross Sales Revenue', valueUSD: '$4,850.00', valueLBP: '434,075,000 LBP', notes: '42 Total Sales Invoices' },
    { metric: 'Discounts Given', valueUSD: '-$140.00', valueLBP: '-12,530,000 LBP', notes: 'Manager & Promotional' },
    { metric: 'Refunds / Returns', valueUSD: '-$65.00', valueLBP: '-5,817,500 LBP', notes: '2 Return Tickets' },
    { metric: 'Net Sales Revenue', valueUSD: '$4,645.00', valueLBP: '415,727,500 LBP', notes: 'Taxable & Exempt Net' },
    { metric: 'VAT Collected (11%)', valueUSD: '$312.40', valueLBP: '27,959,800 LBP', notes: 'Lebanese MOF Standard' },
    { metric: 'Cash in Drawer (USD)', valueUSD: '$2,450.00', valueLBP: '219,275,000 LBP', notes: 'Physical Cash Verified' },
    { metric: 'Whish / OMT Digital', valueUSD: '$1,240.00', valueLBP: '110,980,000 LBP', notes: 'Settled to Bank Vault' },
    { metric: 'Credit / Accounts Receivable', valueUSD: '$955.00', valueLBP: '85,472,500 LBP', notes: 'Wholesale B2B Clients' },
  ];

  const employeeData = [
    { empId: 'EMP-01', name: 'Ahmad Ali Kassem', invoices: 18, totalUSD: '$2,150.00', returns: '$0.00', netUSD: '$2,150.00' },
    { empId: 'EMP-02', name: 'Hiba Aloulou', invoices: 14, totalUSD: '$1,640.00', returns: '-$40.00', netUSD: '$1,600.00' },
    { empId: 'EMP-03', name: 'Hussein Mahdi', invoices: 10, totalUSD: '$1,060.00', returns: '-$25.00', netUSD: '$1,035.00' },
  ];

  const paymentData = [
    { method: 'Cash (USD)', txCount: 22, amountUSD: '$2,450.00', amountLBP: '219,275,000 LBP', pct: '52.7%' },
    { method: 'Cash (LBP)', txCount: 8, amountUSD: '$650.00', amountLBP: '58,175,000 LBP', pct: '14.0%' },
    { method: 'Whish Money / OMT Pay', txCount: 7, amountUSD: '$590.00', amountLBP: '52,805,000 LBP', pct: '12.7%' },
    { method: 'Credit Account (B2B Invoice)', txCount: 5, amountUSD: '$955.00', amountLBP: '85,472,500 LBP', pct: '20.6%' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto font-sans text-slate-800">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-blue-700 font-bold text-[14px]">
          Southern Olive Oil Products S.A.R.L
        </div>
        <div className="text-right text-[11px] font-mono text-slate-500">
          Daily Sales Control
        </div>
      </div>

      <div className="text-center font-bold text-[16px] text-slate-900 mb-2">
        {reportTitle}
      </div>

      <div className="flex justify-between items-center text-[11px] font-mono border-b border-black pb-1 mb-4 text-slate-800">
        <span>Operating Date: Today (Current Shift)</span>
        <span>Branch: Choueifat Main Facility & Showroom</span>
        <span>Page 1 of 1</span>
      </div>

      {/* Render based on specific sub-report or standard statistics */}
      {isEmployeeSummary ? (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
          <table className="w-full table-fixed text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-black font-bold text-black leading-tight bg-slate-100">
                <th className="py-2 px-2 normal-case w-[15%]">emp id</th>
                <th className="py-2 px-2 normal-case w-[35%]">employee name</th>
                <th className="py-2 px-2 normal-case w-[15%] text-center">invoices</th>
                <th className="py-2 px-2 normal-case w-[15%] text-right">gross sales ($)</th>
                <th className="py-2 px-2 normal-case w-[20%] text-right pr-2">net sales ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
              {employeeData.map((emp, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-mono">{emp.empId}</td>
                  <td className="py-2 px-2 font-bold text-slate-900">{emp.name}</td>
                  <td className="py-2 px-2 text-center font-mono">{emp.invoices}</td>
                  <td className="py-2 px-2 text-right font-mono">{emp.totalUSD}</td>
                  <td className="py-2 px-2 text-right font-mono font-bold text-emerald-800 pr-2">
                    {emp.netUSD}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : isPaymentSummary ? (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
          <table className="w-full table-fixed text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-black font-bold text-black leading-tight bg-slate-100">
                <th className="py-2 px-2 normal-case w-[35%]">payment method</th>
                <th className="py-2 px-2 normal-case w-[15%] text-center">tx count</th>
                <th className="py-2 px-2 normal-case w-[20%] text-right">amount ($)</th>
                <th className="py-2 px-2 normal-case w-[20%] text-right">amount (LBP)</th>
                <th className="py-2 px-2 normal-case w-[10%] text-right pr-2">share %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
              {paymentData.map((pm, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-bold text-slate-900">{pm.method}</td>
                  <td className="py-2 px-2 text-center font-mono">{pm.txCount}</td>
                  <td className="py-2 px-2 text-right font-mono font-bold">{pm.amountUSD}</td>
                  <td className="py-2 px-2 text-right font-mono text-slate-600">{pm.amountLBP}</td>
                  <td className="py-2 px-2 text-right font-mono font-bold text-blue-700 pr-2">{pm.pct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
          <table className="w-full table-fixed text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-black font-bold text-black leading-tight bg-slate-100">
                <th className="py-2 px-3 normal-case w-[40%]">performance metric</th>
                <th className="py-2 px-2 normal-case w-[20%] text-right">amount ($)</th>
                <th className="py-2 px-2 normal-case w-[20%] text-right">amount (LBP)</th>
                <th className="py-2 px-3 normal-case w-[20%]">audit notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
              {statsBreakdown.map((row, idx) => (
                <tr key={idx} className={`hover:bg-slate-50 ${row.metric.includes('Net Sales') ? 'bg-blue-50/50 font-bold' : ''}`}>
                  <td className="py-2 px-3 text-slate-900">{row.metric}</td>
                  <td className={`py-2 px-2 text-right font-mono font-bold ${row.valueUSD.startsWith('-') ? 'text-red-700' : 'text-slate-900'}`}>
                    {row.valueUSD}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-slate-600">{row.valueLBP}</td>
                  <td className="py-2 px-3 text-slate-500 font-sans">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t-2 border-black mt-4 pt-2 flex justify-between items-center text-xs font-mono font-bold text-slate-700">
        <span>Status: Live Registered Registers</span>
        <span>Shift Supervisor: M. Harb</span>
      </div>
    </div>
  );
};
