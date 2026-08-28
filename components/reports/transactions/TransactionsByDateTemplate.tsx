import React, { useState } from 'react';

export const TransactionsByDateTemplate = () => {
  // UI States (Drafts - do not affect report yet)
  const [uiShowRate, setUiShowRate] = useState(false);
  const [uiGroupByDate, setUiGroupByDate] = useState(true);
  
  // Active States (Applied to table after click)
  const [activeShowRate, setActiveShowRate] = useState(false);
  const [activeGroupByDate, setActiveGroupByDate] = useState(false);
  
  // Core Visibility State (Hides table until filtered)
  const [isFiltered, setIsFiltered] = useState(false);
  
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const handleFilter = () => {
    setActiveShowRate(uiShowRate);
    setActiveGroupByDate(uiGroupByDate);
    setIsFiltered(true); // <--- Triggers table rendering
  };

  const handleReset = () => {
    setUiShowRate(false);
    setUiGroupByDate(false);
    setActiveShowRate(false);
    setActiveGroupByDate(false);
    setIsFiltered(false); // <--- Hides table again
  };

  // Sample data
  const reportData = [
    { date: '01-Aug-2026', time: '10:57', invoice: '102971', custId: '', customer: '', order: '2', print: '', subTotal: '1,260,000.00', discount: '0.00', tax: '0.00', payType: 'CASH', total: '1,260,000.00', currency: 'LBP', rate: '90,000.00' },
    { date: '01-Aug-2026', time: '11:42', invoice: '102972', custId: '', customer: '', order: '2', print: '', subTotal: '1,620,000.00', discount: '0.00', tax: '0.00', payType: 'CASH', total: '1,620,000.00', currency: 'LBP', rate: '90,000.00' },
    { date: '01-Aug-2026', time: '11:45', invoice: '102973', custId: '', customer: '', order: '1', print: '', subTotal: '90,000.00', discount: '0.00', tax: '0.00', payType: 'CASH', total: '90,000.00', currency: 'LBP', rate: '90,000.00' },
    { date: '01-Aug-2026', time: '11:50', invoice: '102974', custId: '', customer: '', order: '2', print: '', subTotal: '9,000,000.00', discount: '900,000.00', tax: '0.00', payType: 'CASH', total: '8,100,000.00', currency: 'LBP', rate: '90,000.00' }
  ];

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* EXACT CUSTOM FILTERS SECTION */}
      <div className="filters-container w-full max-w-[1400px] bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-4 print:hidden">
        <div className="flex justify-between items-start gap-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
            
            <div className="lg:col-span-1">
              <select 
                className="w-full border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 bg-white" 
                defaultValue="Transactions by Date"
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
            </div>
            <div className="lg:col-span-1"></div>
            <div className="lg:col-span-1"></div>

            <div className="lg:col-span-1">
              <select className="w-full border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 bg-white">
                <option>This Month</option>
                <option>Today</option>
                <option>Yesterday</option>
                <option>Last Month</option>
                <option>1st Quarter</option>
                <option>2nd Quarter</option>
                <option>3rd Quarter</option>
                <option>4th Quarter</option>
                <option>This Year</option>
                <option>Last Year</option>
                <option>Date Range</option>
                <option>EOD Date</option>
              </select>
            </div>
            <div className="lg:col-span-1">
              <input type="text" defaultValue="Aug, 2026" className="w-full border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 bg-white" />
            </div>
            <div className="lg:col-span-1 flex flex-col justify-end">
              <label className="text-[11px] font-bold text-slate-700 mb-1">Select Department</label>
              <select className="w-full border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 bg-white">
                <option>Show All</option>
                <option>Local</option>
                <option>International</option>
                <option>Online</option>
              </select>
            </div>

            <div className="lg:col-span-1">
              <select className="w-full border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 bg-white">
                <option>Southern Olive Oil S.A.R.L</option>
                <option>All Branches</option>
              </select>
            </div>
            <div className="lg:col-span-1">
              <select className="w-full border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 bg-white">
                <option>All Invoices</option>
                <option>Inventory Invoices</option>
                <option>POS Invoices</option>
                <option>Training Invoices</option>
              </select>
            </div>
            <div className="lg:col-span-1 flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-[12px] font-bold text-slate-800 cursor-pointer">
                <input type="checkbox" checked={uiShowRate} onChange={(e) => setUiShowRate(e.target.checked)} className="rounded border-slate-300 w-3.5 h-3.5 accent-[#195a96]" />
                Show Rate
              </label>
              <label className="flex items-center gap-2 text-[12px] font-bold text-slate-800 cursor-pointer">
                <input type="checkbox" checked={uiGroupByDate} onChange={(e) => setUiGroupByDate(e.target.checked)} className="rounded border-slate-300 w-3.5 h-3.5 accent-[#195a96]" />
                Group By Date
              </label>
            </div>

            <div className="lg:col-span-1">
              <select className="w-full border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 bg-white">
                <option>All Payment Types</option>
                <option>CASH</option>
                <option>CREDIT</option>
                <option>CASH USD</option>
                <option>CREDIT CARD</option>
                <option>CREDIT CARD USD</option>
              </select>
            </div>
            <div className="lg:col-span-1">
              <select className="w-full border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 bg-white">
                <option>Show Top 10 Invoices By Amount</option>
                <option>Filters</option>
                <option>Show Refund</option>
                <option>Show Zero Invoices</option>
                <option>Show Discount</option>
                <option>Show Zero Tax</option>
              </select>
            </div>

          </div>

          <div className="flex flex-col gap-2 min-w-[150px]">
            <button onClick={handleFilter} className="px-4 py-2 bg-[#475569] text-white rounded text-[13px] font-bold hover:bg-slate-700 w-full transition-colors cursor-pointer">Filter Report</button>
            <button onClick={handleReset} className="px-4 py-2 bg-[#5e3b3b] text-white rounded text-[13px] font-bold hover:bg-red-900 w-full transition-colors cursor-pointer">Reset Filters</button>
          </div>

        </div>
      </div>

      {/* REPORT CONTAINER */}
      <div className="w-full max-w-[1400px] bg-white font-sans text-black mt-2">
        <div className="report-wrapper transition-transform duration-200 origin-top" style={{ transform: `scale(${zoomLevel})` }}>
          
          <div className="text-blue-700 font-bold text-[12px] mb-2">
            Southern Olive Oil S.A.R.L
          </div>
          
          <div className="text-center font-bold text-[12px] mb-4">
            Transactions by Date
          </div>
          
          {/* Conditional Rendering: Show message if NOT filtered, show table if FILTERED */}
          {!isFiltered ? (
            <div className="w-full py-16 mt-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 print:hidden">
               <div className="text-[40px] mb-2 opacity-30">📊</div>
               <p className="text-slate-500 font-bold text-[14px]">Please select your filters and click "Filter Report" to view data.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center text-[11px] font-bold w-full">
                <div>28-Aug-2026</div>
                <div>From Date: 01-Aug-2026 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; To Date: 28-Aug-2026</div>
                <div>Page {currentPage} of 14</div>
              </div>

              <div className="w-full mt-1 overflow-x-auto print:overflow-visible pb-4">
                <table className="w-full min-w-[1000px] border-collapse border-t border-b border-black text-[11px] whitespace-nowrap">
                  <thead>
                    <tr className="font-bold text-black border-b border-black uppercase">
                      <th className="py-1 px-1 text-left">Date</th>
                      <th className="py-1 px-1 text-left">Time</th>
                      <th className="py-1 px-1 text-left">Invoice #</th>
                      <th className="py-1 px-1 text-left">Cust_ID</th>
                      <th className="py-1 px-1 text-left">Customer Name</th>
                      <th className="py-1 px-1 text-right">Order #</th>
                      <th className="py-1 px-1 text-right">Print#</th>
                      <th className="py-1 px-1 text-right">SubTotal</th>
                      <th className="py-1 px-1 text-right">Discount</th>
                      <th className="py-1 px-1 text-right">Tax</th>
                      <th className="py-1 px-1 text-left pl-2">Pay Type</th>
                      <th className="py-1 px-1 text-right">Total</th>
                      {activeShowRate && <th className="py-1 px-1 text-center">Currency</th>}
                      {activeShowRate && <th className="py-1 px-1 text-right">Rate</th>}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="font-bold">
                      <td colSpan={activeShowRate ? 14 : 12} className="py-1 px-1">Branch : Southern Olive Oil S.A.R.L</td>
                    </tr>
                    {reportData.map((row, idx) => (
                      <tr key={idx} className="font-normal hover:bg-slate-50">
                        <td className="py-1 px-1">{row.date}</td>
                        <td className="py-1 px-1">{row.time}</td>
                        <td className="py-1 px-1">{row.invoice}</td>
                        <td className="py-1 px-1">{row.custId}</td>
                        <td className="py-1 px-1">{row.customer}</td>
                        <td className="py-1 px-1 text-right">{row.order}</td>
                        <td className="py-1 px-1 text-right">{row.print}</td>
                        <td className="py-1 px-1 text-right">{row.subTotal}</td>
                        <td className="py-1 px-1 text-right">{row.discount}</td>
                        <td className="py-1 px-1 text-right">{row.tax}</td>
                        <td className="py-1 px-1 text-left pl-2">{row.payType}</td>
                        <td className="py-1 px-1 text-right">{row.total}</td>
                        {activeShowRate && <td className="py-1 px-1 text-center">{row.currency}</td>}
                        {activeShowRate && <td className="py-1 px-1 text-right">{row.rate}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

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
