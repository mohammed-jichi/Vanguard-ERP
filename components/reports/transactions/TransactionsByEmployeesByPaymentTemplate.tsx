import React, { useState } from 'react';

export const TransactionsByEmployeesByPaymentTemplate = () => {
  const [uiRealDate, setUiRealDate] = useState(false);
  const [activeRealDate, setActiveRealDate] = useState(false);

  const handleFilter = () => setActiveRealDate(uiRealDate);

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Filters Container */}
      <div className="filters-container w-full max-w-[1400px] bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-4 print:hidden">
        <div className="flex justify-between items-start gap-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 max-w-[700px]">
            
            {/* FULL 13-ITEM DROPDOWN */}
            <select 
              className="w-full lg:col-span-2 border border-slate-400 rounded p-1.5 text-[13px] !text-black !font-bold !opacity-100 !bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm cursor-pointer" 
              defaultValue="Transactions by Employees by Payment"
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
            
            <input type="text" defaultValue="Aug, 2026" className="w-full border border-slate-400 rounded p-1.5 text-[13px] !text-black !font-bold !opacity-100 !bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm" />
            
            <select className="w-full border border-slate-400 rounded p-1.5 text-[13px] !text-black !font-bold !opacity-100 !bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm cursor-pointer">
              <option>All Branches</option>
            </select>
            
            <select className="w-full border border-slate-400 rounded p-1.5 text-[13px] !text-black !font-bold !opacity-100 !bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm cursor-pointer">
              <option>All Invoices</option>
              <option>Inventory Invoices</option>
              <option>POS Invoices</option>
              <option>Training Invoices</option>
            </select>

            <div className="flex items-center gap-2 mt-2">
              <label className="flex items-center gap-2 text-[12px] font-bold text-slate-800 cursor-pointer">
                <input type="checkbox" checked={uiRealDate} onChange={(e) => setUiRealDate(e.target.checked)} className="rounded border-slate-300 w-3.5 h-3.5 accent-[#195a96]" />
                Real Date
              </label>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 min-w-[150px]">
            <button onClick={handleFilter} className="px-4 py-2 bg-[#475569] text-white rounded text-[13px] font-bold hover:bg-slate-700 w-full transition-colors cursor-pointer">Filter Report</button>
            <button className="px-4 py-2 bg-[#5e3b3b] text-white rounded text-[13px] font-bold hover:bg-red-900 w-full transition-colors cursor-pointer">Reset Filters</button>
          </div>
        </div>
      </div>

      {/* Report Body */}
      <div className="w-full max-w-[1400px] bg-white font-sans text-black mt-2">
        <div className="report-wrapper transition-transform duration-200 origin-top">
          <div className="text-blue-700 font-bold text-[12px] mb-2">Southern Olive Oil S.A.R.L</div>
          <div className="text-center font-bold text-[12px] mb-4">Transactions by Employees by Payment</div>
          <div className="flex justify-between items-center text-[11px] font-bold w-full">
            <div>28-Aug-2026</div>
            <div>From Date: 01-Aug-2026 To Date: 28-Aug-2026</div>
            <div>Page 1 of 14</div>
          </div>
          
          <div className="w-full mt-1 overflow-x-auto print:overflow-visible pb-4">
            <table className="w-full min-w-[800px] border-collapse border-t border-b border-black text-[11px] whitespace-nowrap">
              <thead>
                <tr className="font-bold text-black border-b border-black">
                  <th className="py-1 px-1 text-left">Invoice#</th>
                  <th className="py-1 px-1 text-left">Date</th>
                  <th className="py-1 px-1 text-left">Time</th>
                  <th className="py-1 px-1 text-left">Table#</th>
                  <th className="py-1 px-1 text-right">Amount</th>
                  {activeRealDate && <th className="py-1 px-1 text-left pl-2">Real Date</th>}
                </tr>
              </thead>
              <tbody>
                <tr className="font-bold"><td colSpan={activeRealDate ? 6 : 5} className="py-1 px-1">Branch: Southern Olive Oil S.A.R.L</td></tr>
              </tbody>
            </table>
          </div>
          
          <div className="report-footer flex justify-between items-center text-[10px] font-bold w-full mt-12 border-t border-black pt-1">
            <div className="text-black">REP_S_00247</div>
            <div className="text-black text-center flex-1">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
            <div className="text-right"><a href="https://www.vanguarderp.com" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline cursor-pointer">www.vanguarderp.com</a></div>
          </div>
        </div>
      </div>
    </div>
  );
};
