import React, { useState } from 'react';
import UnifiedPrintableReportSheet from '../UnifiedPrintableReportSheet';

interface TransactionsBySalesmanTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
  showRate?: boolean;
  groupByDate?: boolean;
}

export const TransactionsBySalesmanTemplate: React.FC<TransactionsBySalesmanTemplateProps> = ({
  hideToolbar = true,
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  showRate = false,
  groupByDate = true,
}) => {
  const [currentPage] = useState(1);
  const [totalPages] = useState(9);

  const reportData = [
    { invoice: '102971', date: '01-Aug-26 10:57 AM', amount: '1,260,000.00', discount: '0.00', tax: '0.00', total: '1,260,000.00' },
    { invoice: '102972', date: '01-Aug-26 11:42 AM', amount: '1,620,000.00', discount: '0.00', tax: '0.00', total: '1,620,000.00' },
    { invoice: '102973', date: '01-Aug-26 11:45 AM', amount: '90,000.00', discount: '0.00', tax: '0.00', total: '90,000.00' },
    { invoice: '102974', date: '01-Aug-26 11:50 AM', amount: '9,000,000.00', discount: '900,000.00', tax: '0.00', total: '8,100,000.00' },
    { invoice: '102975', date: '01-Aug-26 12:08 PM', amount: '315,000.00', discount: '0.00', tax: '0.00', total: '315,000.00' },
  ];

  return (
    <div className="w-full flex flex-col items-center bg-white min-h-screen">
      
      {/* Force high-contrast text rendering */}
      <style dangerouslySetInnerHTML={{__html: `
        .force-black {
          color: #000000 !important;
          background-color: #ffffff !important;
          opacity: 1 !important;
          -webkit-text-fill-color: #000000 !important; 
          font-weight: 700 !important;
        }
        .force-black option {
          color: #000000 !important;
          background-color: #ffffff !important;
        }
      `}} />

      {/* Filters (Transactions by Salesman layout) */}
      {!hideToolbar && (
      <div className="filters-container w-full max-w-[1400px] bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-4 print:hidden">
        <div className="flex justify-between items-start gap-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 max-w-[700px]">
            <select 
              className="force-black w-full lg:col-span-2 border border-slate-400 rounded p-1.5 text-[13px] focus:outline-none focus:border-blue-600 shadow-sm cursor-pointer"
              defaultValue="Transactions by Salesman"
              onChange={(e) => {
                 if ((window as any).setSelectedReport) {
                   (window as any).setSelectedReport(e.target.value);
                 }
              }}
            >
              <option>Transactions by Salesman</option>
              <option>Transactions by Date</option>
              <option>Transactions by Employees by Payment</option>
              <option>Transactions by Customers by Employee</option>
              <option>Transactions by Invoice Number</option>
              <option>Duplicate Invoices</option>
              <option>Transactions by Date by Payments</option>
              <option>Transactions by Customers</option>
              <option>Transactions by Customers by Groups</option>
              <option>Transactions by Customers details</option>
              <option>Transactions by Workstation</option>
              <option>Transactions by Employees</option>
              <option>Transactions By Source</option>
            </select>
            <select className="force-black w-full border border-slate-400 rounded p-1.5 text-[13px] focus:outline-none focus:border-blue-600 shadow-sm cursor-pointer">
              <option>Today</option>
              <option>Yesterday</option>
              <option>This Month</option>
              <option>Last Month</option>
              <option>First Quarter</option>
              <option>Second Quarter</option>
              <option>Third Quarter</option>
              <option>Fourth Quarter</option>
              <option>This Year</option>
              <option>Last Year</option>
              <option>Date Range</option>
              <option>EOD Date</option>
            </select>
            <input 
              type="text" 
              defaultValue="Aug, 2026" 
              className="force-black w-full border border-slate-400 rounded p-1.5 text-[13px] focus:outline-none focus:border-blue-600 shadow-sm text-center" 
            />
            <select className="force-black w-full border border-slate-400 rounded p-1.5 text-[13px] focus:outline-none focus:border-blue-600 shadow-sm cursor-pointer"><option>Main Branch (الفرع الرئيسي)</option></select>
          </div>
          <div className="flex flex-col gap-2 min-w-[150px]">
            <button className="px-4 py-2 bg-[#475569] text-white rounded text-[13px] font-bold hover:bg-slate-700 w-full transition-colors cursor-pointer">Filter Report</button>
            <button className="px-4 py-2 bg-[#5e3b3b] text-white rounded text-[13px] font-bold hover:bg-red-900 w-full transition-colors cursor-pointer">Reset Filters</button>
          </div>
        </div>
      </div>
      )}

      {/* Unified Standard Document Sheet */}
      <UnifiedPrintableReportSheet
        reportTitle="Transactions by Salesman"
        reportCode="REP_S_00247"
        executionDate={executionDate}
        periodText={dynamicPeriodText || "From Date: 01-Aug-2026 To Date: 31-Aug-2026"}
        pageInfo={`Page ${currentPage} of ${totalPages}`}
        branchInfo="Branch: Main Branch (Zeit w zaytoun ljanoub)"
        hideToolbar={hideToolbar}
      >
        <table className="w-full border-collapse text-[11px] whitespace-nowrap table-fixed">
          <thead>
            <tr className="font-bold text-black border-b-2 border-slate-900 bg-slate-50">
              <th className="py-2 px-1 text-left font-sans w-[15%]">Invoice #</th>
              {groupByDate && <th className="py-2 px-1 text-left font-sans w-[20%]">Date</th>}
              <th className="py-2 px-1 text-right font-sans w-[15%]">Amount</th>
              <th className="py-2 px-1 text-right font-sans w-[15%]">Discount</th>
              <th className="py-2 px-1 text-right font-sans w-[15%]">Tax</th>
              <th className="py-2 px-1 text-right font-sans w-[20%]">Total</th>
              {showRate && <th className="py-2 px-1 text-center font-sans">Cur</th>}
              {showRate && <th className="py-2 px-1 text-right font-sans">Rate</th>}
              {showRate && <th className="py-2 px-1 text-right font-sans">Total ($)</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
            <tr className="font-bold bg-slate-100/60">
              <td colSpan={6 + (showRate ? 3 : 0) + (groupByDate ? 0 : -1)} className="py-1 px-1 font-sans">
                Branch: Main Branch (الفرع الرئيسي)
              </td>
            </tr>
            <tr className="font-bold bg-slate-50">
              <td colSpan={6 + (showRate ? 3 : 0) + (groupByDate ? 0 : -1)} className="py-1 px-1 pl-4 font-sans text-blue-800">
                Salesman: Nour Yazbeck
              </td>
            </tr>
            {reportData.map((row, idx) => (
              <tr key={idx} className="font-normal hover:bg-slate-50">
                <td className="py-1 px-1 font-mono text-slate-800">{row.invoice}</td>
                {groupByDate && <td className="py-1 px-1 font-mono text-slate-600">{row.date}</td>}
                <td className="py-1 px-1 text-right font-mono">{row.amount}</td>
                <td className="py-1 px-1 text-right font-mono text-slate-500">{row.discount}</td>
                <td className="py-1 px-1 text-right font-mono text-slate-500">{row.tax}</td>
                <td className="py-1 px-1 text-right font-mono font-bold text-slate-900">{row.total}</td>
                {showRate && <td className="py-1 px-1 text-center font-bold text-slate-700 font-mono">LBP</td>}
                {showRate && <td className="py-1 px-1 text-right font-mono text-slate-700">89,500.00</td>}
                {showRate && (
                  <td className="py-1 px-1 text-right font-mono text-slate-700 font-bold">
                    ${(parseFloat(row.total.replace(/,/g, '')) / 89500).toFixed(2)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold border-t-2 border-slate-900 bg-slate-50 text-[11px]">
              <td colSpan={groupByDate ? 2 : 1} className="py-1 px-1 text-right font-sans">Salesman Total:</td>
              <td className="py-1 px-1 text-right font-mono">12,285,000.00</td>
              <td className="py-1 px-1 text-right font-mono">900,000.00</td>
              <td className="py-1 px-1 text-right font-mono">0.00</td>
              <td className="py-1 px-1 text-right font-mono text-emerald-800">11,385,000.00</td>
              {showRate && (
                <>
                  <td className="py-1 px-1 text-center font-bold">LBP</td>
                  <td className="py-1 px-1 text-right font-mono">89,500</td>
                  <td className="py-1 px-1 text-right font-mono font-bold text-emerald-800">$127.21</td>
                </>
              )}
            </tr>
            <tr className="font-bold border-t border-slate-300 bg-slate-100 text-[11px]">
              <td colSpan={groupByDate ? 2 : 1} className="py-1.5 px-1 text-right font-sans">Branch Total:</td>
              <td className="py-1.5 px-1 text-right font-mono">12,285,000.00</td>
              <td className="py-1.5 px-1 text-right font-mono">900,000.00</td>
              <td className="py-1.5 px-1 text-right font-mono">0.00</td>
              <td className="py-1.5 px-1 text-right font-mono text-emerald-800">11,385,000.00</td>
              {showRate && (
                <>
                  <td className="py-1.5 px-1 text-center font-bold">LBP</td>
                  <td className="py-1.5 px-1 text-right font-mono">89,500</td>
                  <td className="py-1.5 px-1 text-right font-mono font-bold text-emerald-800">$127.21</td>
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </UnifiedPrintableReportSheet>
    </div>
  );
};
