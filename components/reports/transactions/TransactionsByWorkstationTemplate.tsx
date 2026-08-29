import React, { useState } from 'react';

export const TransactionsByWorkstationTemplate = () => {
  const [uiRealDate, setUiRealDate] = useState(false);
  const [activeRealDate, setActiveRealDate] = useState(false);

  const handleFilter = () => setActiveRealDate(uiRealDate);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="filters-container w-full max-w-[1400px] bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-4 print:hidden">
        <div className="flex justify-between items-start gap-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 max-w-[700px]">
            <select 
              className="w-full lg:col-span-2 border border-slate-400 rounded p-1.5 text-[13px] !text-black !font-bold !opacity-100 !bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm cursor-pointer"
              defaultValue="Transactions by Workstation"
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
            <select className="w-full border border-slate-400 rounded p-1.5 text-[13px] !text-black !font-bold !opacity-100 !bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm cursor-pointer"><option>Southern Olive Oil Products S.A.R.L</option></select>
            <select className="w-full border border-slate-400 rounded p-1.5 text-[13px] !text-black !font-bold !opacity-100 !bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm cursor-pointer"><option>All Invoices</option></select>
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

      {/* Background wrapper to center the paper on screen */}
      <div className="w-full font-sans text-black overflow-x-auto print:overflow-visible bg-slate-100 py-6 flex justify-center">
        {/* The A4 Paper Simulator (794px width) */}
        <div 
          className="report-wrapper transition-transform duration-200 origin-top bg-white p-8 shadow-lg border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 w-[794px] min-h-[1123px]" 
        >
          <div className="text-blue-700 font-bold text-[12px] mb-2">Southern Olive Oil Products S.A.R.L</div>
          <div className="text-center font-bold text-[12px] mb-4">Transactions by Workstation</div>
          <div className="w-full mt-1 overflow-x-auto print:overflow-visible pb-4">
            <table className="w-full border-collapse border-t border-b border-black text-[11px] whitespace-nowrap">
               {/* Empty table as per image */}
            </table>
          </div>
          <div className="w-full mt-12 border-t border-black pt-2 flex justify-between items-center text-[10px] font-bold text-black">
            <div className="text-left w-1/3">REP_S_00247</div>
            <div className="text-center w-1/3">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
            <div className="text-right w-1/3 text-blue-600">www.vanguarderp.com</div>
          </div>
        </div>
      </div>
    </div>
  );
};
