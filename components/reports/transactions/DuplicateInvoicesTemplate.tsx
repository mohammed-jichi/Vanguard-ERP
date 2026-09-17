import React, { useState } from 'react';
import UnifiedPrintableReportSheet from '../UnifiedPrintableReportSheet';

interface DuplicateInvoicesTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
  showRate?: boolean;
  groupByDate?: boolean;
}

export const DuplicateInvoicesTemplate: React.FC<DuplicateInvoicesTemplateProps> = ({
  hideToolbar = true,
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  showRate = false,
  groupByDate = true,
}) => {
  const [uiShowRate, setUiShowRate] = useState(showRate);
  const [activeShowRate, setActiveShowRate] = useState(showRate);

  const isRateActive = showRate || activeShowRate;
  const isGroupDate = groupByDate;

  const handleFilter = () => setActiveShowRate(uiShowRate);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Filters (Duplicate Invoices layout) */}
      {!hideToolbar && (
      <div className="filters-container w-full max-w-[1400px] bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-4 print:hidden">
        <div className="flex justify-between items-start gap-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 max-w-[700px]">
            <select 
              className="w-full lg:col-span-2 border border-slate-400 rounded p-1.5 text-[13px] !text-black !font-bold !opacity-100 !bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm cursor-pointer"
              defaultValue="Duplicate Invoices"
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
            <select className="w-full border border-slate-400 rounded p-1.5 text-[13px] !text-black !font-bold !opacity-100 !bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm cursor-pointer">
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
              className="w-full border border-slate-300 rounded p-1.5 !text-black !font-bold !bg-white !opacity-100 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              style={{ backgroundColor: '#ffffff', color: '#000000', opacity: 1, fontWeight: 700 }} 
            />
            <select className="w-full border border-slate-400 rounded p-1.5 text-[13px] !text-black !font-bold !opacity-100 !bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm cursor-pointer"><option>Main Branch (الفرع الرئيسي)</option></select>
            <select className="w-full border border-slate-400 rounded p-1.5 text-[13px] !text-black !font-bold !opacity-100 !bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm cursor-pointer"><option>All Invoices</option></select>
            <div className="flex items-center gap-2 mt-2">
              <label className="flex items-center gap-2 text-[12px] font-bold text-slate-800 cursor-pointer">
                <input type="checkbox" checked={uiShowRate} onChange={(e) => setUiShowRate(e.target.checked)} className="rounded border-slate-300 w-3.5 h-3.5 accent-[#195a96]" />
                Show Rate
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-2 min-w-[150px]">
            <button onClick={handleFilter} className="px-4 py-2 bg-[#475569] text-white rounded text-[13px] font-bold hover:bg-slate-700 w-full transition-colors cursor-pointer">Filter Report</button>
            <button className="px-4 py-2 bg-[#5e3b3b] text-white rounded text-[13px] font-bold hover:bg-red-900 w-full transition-colors cursor-pointer">Reset Filters</button>
          </div>
        </div>
      </div>
      )}

      {/* Unified Standard Document Sheet */}
      <UnifiedPrintableReportSheet
        reportTitle="Duplicate Invoices Report"
        reportCode="REP_S_00248"
        executionDate={executionDate}
        periodText={dynamicPeriodText || "From Date: 01-Aug-2026 To Date: 31-Aug-2026"}
        pageInfo="Page 1 of 1"
        branchInfo="Branch: Main Branch (Zeit w zaytoun ljanoub)"
        hideToolbar={hideToolbar}
      >
        <table className="w-full border-collapse border-t border-b border-black text-[11px] whitespace-nowrap">
          <thead>
            <tr className="font-bold text-black border-b border-black">
              <th className="py-1 px-1 text-left font-sans">Invoice #</th>
              {isGroupDate && <th className="py-1 px-1 text-left font-sans">Date</th>}
              <th className="py-1 px-1 text-left font-sans">Cust. #</th>
              <th className="py-1 px-1 text-left font-sans">Customer Name</th>
              <th className="py-1 px-1 text-left font-sans">Order #</th>
              <th className="py-1 px-1 text-left font-sans">Print #</th>
              <th className="py-1 px-1 text-right font-sans">Sub Total</th>
              <th className="py-1 px-1 text-right font-sans">Discount</th>
              <th className="py-1 px-1 text-right font-sans">Tax</th>
              <th className="py-1 px-1 text-right font-sans">Total</th>
              {isRateActive && <th className="py-1 px-1 text-center font-sans">Cur</th>}
              {isRateActive && <th className="py-1 px-1 text-right font-sans">Rate</th>}
              {isRateActive && <th className="py-1 px-1 text-right font-sans">Total ($)</th>}
            </tr>
          </thead>
          <tbody>
            <tr className="font-bold"><td colSpan={10 + (isRateActive ? 3 : 0) + (isGroupDate ? 0 : -1)} className="py-1 px-1 font-sans">Branch: Main Branch</td></tr>
          </tbody>
        </table>
      </UnifiedPrintableReportSheet>
    </div>
  );
};
