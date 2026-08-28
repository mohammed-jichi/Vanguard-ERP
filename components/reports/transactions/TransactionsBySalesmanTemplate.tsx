import React, { useState } from 'react';

export const TransactionsBySalesmanTemplate = () => {
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
    <div className="w-full flex flex-col items-center">
      {/* Filters (Transactions by Salesman layout) */}
      <div className="filters-container w-full max-w-[1400px] bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-4 print:hidden">
        <div className="flex justify-between items-start gap-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 max-w-[700px]">
            <select 
              className="w-full lg:col-span-2 border border-slate-400 rounded p-1.5 text-[13px] !text-black !font-bold !opacity-100 !bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm cursor-pointer"
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
            <select className="w-full border border-slate-400 rounded p-1.5 text-[13px] !text-black !font-bold !opacity-100 !bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm cursor-pointer"><option>All Branches</option></select>
          </div>
          <div className="flex flex-col gap-2 min-w-[150px]">
            <button className="px-4 py-2 bg-[#475569] text-white rounded text-[13px] font-bold hover:bg-slate-700 w-full transition-colors cursor-pointer">Filter Report</button>
            <button className="px-4 py-2 bg-[#5e3b3b] text-white rounded text-[13px] font-bold hover:bg-red-900 w-full transition-colors cursor-pointer">Reset Filters</button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1400px] bg-white font-sans text-black mt-2">
        <div className="report-wrapper transition-transform duration-200 origin-top">
          <div className="text-blue-700 font-bold text-[12px] mb-2">Southern Olive Oil S.A.R.L</div>
          <div className="text-center font-bold text-[12px] mb-4">Transactions by Salesman</div>
          <div className="flex justify-between items-center text-[11px] font-bold w-full">
            <div>28-Aug-2026</div>
            <div>From Date: 01-Aug-2026 To Date: 28-Aug-2026</div>
            <div>Page {currentPage} of {totalPages}</div>
          </div>

          <div className="w-full mt-1 overflow-x-auto print:overflow-visible pb-4">
            <table className="w-full min-w-[800px] border-collapse border-t border-b border-black text-[11px] whitespace-nowrap">
              <thead>
                <tr className="font-bold text-black border-b border-black">
                  <th className="py-1 px-1 text-left">Invoice #</th>
                  <th className="py-1 px-1 text-left">Date</th>
                  <th className="py-1 px-1 text-right">Amount</th>
                  <th className="py-1 px-1 text-right">Discount</th>
                  <th className="py-1 px-1 text-right">Tax</th>
                  <th className="py-1 px-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-bold">
                  <td colSpan={6} className="py-1 px-1">Branch: Southern Olive Oil S.A.R.L</td>
                </tr>
                <tr className="font-bold">
                  <td colSpan={6} className="py-1 px-1 pl-4">Salesman: Nour Yazbeck</td>
                </tr>
                {reportData.map((row, idx) => (
                  <tr key={idx} className="font-normal hover:bg-slate-50">
                    <td className="py-1 px-1">{row.invoice}</td>
                    <td className="py-1 px-1">{row.date}</td>
                    <td className="py-1 px-1 text-right">{row.amount}</td>
                    <td className="py-1 px-1 text-right">{row.discount}</td>
                    <td className="py-1 px-1 text-right">{row.tax}</td>
                    <td className="py-1 px-1 text-right">{row.total}</td>
                  </tr>
                ))}
                <tr className="font-bold border-t border-black">
                  <td colSpan={2} className="py-1 px-1 text-right">Salesman Total:</td>
                  <td className="py-1 px-1 text-right">12,285,000.00</td>
                  <td className="py-1 px-1 text-right">900,000.00</td>
                  <td className="py-1 px-1 text-right">0.00</td>
                  <td className="py-1 px-1 text-right">11,385,000.00</td>
                </tr>
                <tr className="font-bold border-t border-black">
                  <td colSpan={2} className="py-1 px-1 text-right">Branch Total:</td>
                  <td className="py-1 px-1 text-right">12,285,000.00</td>
                  <td className="py-1 px-1 text-right">900,000.00</td>
                  <td className="py-1 px-1 text-right">0.00</td>
                  <td className="py-1 px-1 text-right">11,385,000.00</td>
                </tr>
                <tr className="font-bold border-t border-double border-black">
                  <td colSpan={2} className="py-1 px-1 text-right">Grand Total:</td>
                  <td className="py-1 px-1 text-right">12,285,000.00</td>
                  <td className="py-1 px-1 text-right">900,000.00</td>
                  <td className="py-1 px-1 text-right">0.00</td>
                  <td className="py-1 px-1 text-right">11,385,000.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="report-footer flex justify-between items-center text-[10px] font-bold w-full mt-12 border-t border-black pt-1">
            <div className="text-black">REP_S_00247</div>
            <div className="text-black text-center flex-1">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
            <div className="text-right">
              <a href="https://www.vanguarderp.com" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline cursor-pointer">www.vanguarderp.com</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
