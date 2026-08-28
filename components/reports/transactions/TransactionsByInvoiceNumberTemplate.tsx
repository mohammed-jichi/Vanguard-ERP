import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Printer, Download, Settings } from 'lucide-react';

export const TransactionsByInvoiceNumberTemplate = () => {
  const [uiShowZeroTax, setUiShowZeroTax] = useState(false);
  const [activeShowZeroTax, setActiveShowZeroTax] = useState(false);
  
  // Controls table visibility
  const [isFiltered, setIsFiltered] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleFilter = () => {
    setActiveShowZeroTax(uiShowZeroTax);
    setIsFiltered(true); // Shows the table
  };

  const handleReset = () => {
    setUiShowZeroTax(false);
    setActiveShowZeroTax(false);
    setIsFiltered(false); // Hides the table
  };

  // Sample data (Standard Invoice Data)
  const reportData = [
    { invoice: '103070', date: '28-Aug-2026', time: '10:00', order: '1', cust: '', amount: '5,000,000.00', discount: '0.00', taxPay: 'CASH', total: '5,000,000.00', print: '1' },
    { invoice: '103071', date: '28-Aug-2026', time: '11:30', order: '2', cust: '', amount: '12,000,000.00', discount: '500,000.00', taxPay: 'CASH', total: '11,500,000.00', print: '1' }
  ];

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* 1. FILTERS BLOCK - ALWAYS VISIBLE */}
      <div className="filters-container w-full max-w-[1400px] bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-4 print:hidden">
        <div className="flex justify-between items-start gap-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[1000px]">
            
            {/* Column 1 */}
            <div className="flex flex-col gap-3">
              <select 
                className="w-full border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 bg-white font-medium" 
                defaultValue="Transactions by Invoice Number"
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
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-700">To Invoice Number</label>
                <input type="text" defaultValue="103080" className="w-full border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 bg-white" />
              </div>
              <label className="flex items-center gap-2 text-[12px] font-bold text-slate-800 cursor-pointer mt-1">
                <input type="checkbox" checked={uiShowZeroTax} onChange={(e) => setUiShowZeroTax(e.target.checked)} className="rounded border-slate-300 w-3.5 h-3.5 accent-[#195a96]" />
                Show Zero Tax
              </label>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-700">Branch</label>
                <select className="w-full border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 bg-white font-medium">
                  <option>All Branches</option>
                  <option>Southern Olive Oil S.A.R.L</option>
                </select>
              </div>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-3">
               <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-700">From Invoice Number</label>
                <input type="text" defaultValue="103070" className="w-full border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 bg-white" />
              </div>
            </div>

          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-2 min-w-[150px]">
            <button onClick={handleFilter} className="px-4 py-2 bg-[#475569] text-white rounded text-[13px] font-bold hover:bg-slate-700 w-full transition-colors cursor-pointer">Filter Report</button>
            <button onClick={handleReset} className="px-4 py-2 bg-[#5e3b3b] text-white rounded text-[13px] font-bold hover:bg-red-900 w-full transition-colors cursor-pointer">Reset Filters</button>
          </div>
        </div>
      </div>

      {/* 2. REPORT BODY - CONDITIONAL */}
      <div className="w-full max-w-[1400px] bg-white font-sans text-black mt-2">
        
        <div className="flex justify-end items-center gap-2 mb-4 print:hidden">
          <button onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.5))} className="bg-[#2e7d32] hover:bg-[#236327] text-white p-1.5 rounded transition-colors cursor-pointer" title="Zoom In">
            <ZoomIn size={16} />
          </button>
          <button onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))} className="bg-[#2e7d32] hover:bg-[#236327] text-white p-1.5 rounded transition-colors cursor-pointer" title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <button onClick={() => window.print()} className="bg-[#475569] hover:bg-[#334155] text-white px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5">
            <Printer size={15} /> Print Report
          </button>
          <button className="bg-[#475569] hover:bg-[#334155] text-white px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5">
            <Download size={15} /> Export Report
          </button>
          <button onClick={() => (window as any).setIsSettingsOpen && (window as any).setIsSettingsOpen(true)} className="p-1.5 bg-slate-600 text-white rounded hover:bg-slate-700 text-xs ml-2 cursor-pointer" title="Settings">
            <Settings size={15} />
          </button>
        </div>

        <div className="report-wrapper transition-transform duration-200 origin-top" style={{ transform: `scale(${zoomLevel})` }}>
          
          <div className="text-blue-700 font-bold text-[12px] mb-2">Southern Olive Oil S.A.R.L</div>
          <div className="text-center font-bold text-[12px] mb-4">Transactions by Invoice Number</div>
          
          {!isFiltered ? (
            <div className="w-full py-16 mt-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 print:hidden">
               <p className="text-slate-500 font-bold text-[14px]">Please select your invoice range and click "Filter Report" to view data.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center text-[11px] font-bold w-full">
                <div>28-Aug-2026</div>
                <div>From Invoice: 103070 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; To Invoice: 103080</div>
                <div>Page 1 of 1</div>
              </div>

              <div className="w-full mt-1 overflow-x-auto print:overflow-visible pb-4">
                <table className="w-full min-w-[800px] border-collapse border-t border-b border-black text-[11px] whitespace-nowrap">
                  <thead>
                    <tr className="font-bold text-black border-b border-black">
                      <th className="py-1 px-1 text-left">Invoice #</th>
                      <th className="py-1 px-1 text-left">Date</th>
                      <th className="py-1 px-1 text-left">Time</th>
                      <th className="py-1 px-1 text-left">Order #</th>
                      <th className="py-1 px-1 text-left">Cust. #</th>
                      <th className="py-1 px-1 text-right">Amount</th>
                      <th className="py-1 px-1 text-right">Discount</th>
                      <th className="py-1 px-1 text-left pl-2">Tax Payment</th>
                      <th className="py-1 px-1 text-right">Total</th>
                      <th className="py-1 px-1 text-right">Print #</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="font-bold">
                      <td colSpan={10} className="py-1 px-1">Branch: Southern Olive Oil S.A.R.L</td>
                    </tr>
                    {reportData.map((row, idx) => (
                      <tr key={idx} className="font-normal hover:bg-slate-50">
                        <td className="py-1 px-1">{row.invoice}</td>
                        <td className="py-1 px-1">{row.date}</td>
                        <td className="py-1 px-1">{row.time}</td>
                        <td className="py-1 px-1">{row.order}</td>
                        <td className="py-1 px-1">{row.cust}</td>
                        <td className="py-1 px-1 text-right">{row.amount}</td>
                        <td className="py-1 px-1 text-right">{row.discount}</td>
                        <td className="py-1 px-1 text-left pl-2">{row.taxPay}</td>
                        <td className="py-1 px-1 text-right">{row.total}</td>
                        <td className="py-1 px-1 text-right">{row.print}</td>
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
