import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Printer, Download, Settings } from 'lucide-react';

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
  const [currentPage] = useState(1);

  const handleFilter = () => {
    setActiveShowRate(uiShowRate);
    setActiveGroupByDate(uiGroupByDate);
    setIsFiltered(true);
  };

  const handleReset = () => {
    setUiShowRate(false);
    setUiGroupByDate(false);
    setActiveShowRate(false);
    setActiveGroupByDate(false);
    setIsFiltered(false);
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
      
      {/* SINGLE COMPACT FILTER & ACTION BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-center bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-4 gap-3 print:hidden w-full max-w-[1400px]">
        {/* Left side: Filters (Inputs + Filter/Reset Buttons) */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <select 
            className="border border-slate-300 rounded p-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 bg-white font-medium shadow-2xs" 
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

          <select className="border border-slate-300 rounded p-1.5 text-xs text-slate-900 font-medium bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs">
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
            className="border border-slate-300 rounded p-1.5 text-xs text-slate-900 font-medium bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-24 shadow-2xs" 
          />

          <select className="border border-slate-300 rounded p-1.5 text-xs text-slate-900 font-medium bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs">
            <option>Southern Olive Oil S.A.R.L</option>
            <option>All Branches</option>
          </select>

          <select className="border border-slate-300 rounded p-1.5 text-xs text-slate-900 font-medium bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs">
            <option>All Invoices</option>
            <option>Inventory Invoices</option>
            <option>POS Invoices</option>
            <option>Training Invoices</option>
          </select>

          <label className="flex items-center gap-1 text-xs font-bold text-slate-700 cursor-pointer select-none">
            <input type="checkbox" checked={uiShowRate} onChange={(e) => setUiShowRate(e.target.checked)} className="rounded border-slate-300 w-3.5 h-3.5 accent-[#195a96]" />
            <span>Rate</span>
          </label>
          
          <label className="flex items-center gap-1 text-xs font-bold text-slate-700 cursor-pointer select-none">
            <input type="checkbox" checked={uiGroupByDate} onChange={(e) => setUiGroupByDate(e.target.checked)} className="rounded border-slate-300 w-3.5 h-3.5 accent-[#195a96]" />
            <span>Group By Date</span>
          </label>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={handleFilter} 
              className="px-3 py-1.5 bg-[#475569] text-white rounded text-xs font-bold hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Filter
            </button>
            <button 
              onClick={handleReset} 
              className="px-3 py-1.5 bg-[#5e3b3b] text-white rounded text-xs font-bold hover:bg-red-900 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Right side: Action Toolbar */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button 
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.5))} 
            className="bg-[#2e7d32] hover:bg-[#236327] text-white p-1.5 rounded transition-colors cursor-pointer" 
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
          <button 
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))} 
            className="bg-[#2e7d32] hover:bg-[#236327] text-white p-1.5 rounded transition-colors cursor-pointer" 
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <button 
            onClick={() => window.print()} 
            className="bg-[#475569] hover:bg-[#334155] text-white px-2.5 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Printer size={14} /> Print
          </button>
          <button 
            className="bg-[#475569] hover:bg-[#334155] text-white px-2.5 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Download size={14} /> Export
          </button>
          <button 
            onClick={() => (window as any).setIsSettingsOpen && (window as any).setIsSettingsOpen(true)} 
            className="p-1.5 bg-slate-600 text-white rounded hover:bg-slate-700 text-xs cursor-pointer" 
            title="Settings"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* REPORT CONTAINER */}
      <div className="w-full max-w-[1400px] bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8 font-sans text-black overflow-auto min-h-[500px]">
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
               <p className="text-slate-500 font-bold text-[14px]">Please select your filters and click "Filter" to view data.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center text-[11px] font-bold w-full">
                <div>28-Aug-2026</div>
                <div>From Date: 01-Aug-2026 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; To Date: 28-Aug-2026</div>
                <div>Page {currentPage} of 14</div>
              </div>

              {/* Table */}
              <div className="w-full mt-1 overflow-x-auto print:overflow-visible pb-4">
                <table className="w-full min-w-[1000px] border-collapse border-t border-b border-black text-[11px] whitespace-nowrap">
                  <thead>
                    <tr className="font-bold text-black border-b border-black">
                      <th className="py-1 px-1 text-left">Date</th>
                      <th className="py-1 px-1 text-left">Time</th>
                      <th className="py-1 px-1 text-left">Invoice #</th>
                      <th className="py-1 px-1 text-left">Cust. #</th>
                      <th className="py-1 px-1 text-left">Customer Name</th>
                      <th className="py-1 px-1 text-left">Order #</th>
                      <th className="py-1 px-1 text-left">Print #</th>
                      <th className="py-1 px-1 text-right">Sub Total</th>
                      <th className="py-1 px-1 text-right">Discount</th>
                      <th className="py-1 px-1 text-right">Tax</th>
                      <th className="py-1 px-1 text-left pl-2">Payment Type</th>
                      <th className="py-1 px-1 text-right">Total</th>
                      {activeShowRate && <th className="py-1 px-1 text-center">Cur</th>}
                      {activeShowRate && <th className="py-1 px-1 text-right">Rate</th>}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="font-bold">
                      <td colSpan={14} className="py-1 px-1">Branch: Southern Olive Oil S.A.R.L</td>
                    </tr>
                    {activeGroupByDate && (
                      <tr className="font-bold">
                        <td colSpan={14} className="py-1 px-1 pl-4 underline">Date: 01-Aug-26</td>
                      </tr>
                    )}
                    {reportData.map((row, idx) => (
                      <tr key={idx} className="font-normal hover:bg-slate-50">
                        <td className="py-1 px-1">{row.date}</td>
                        <td className="py-1 px-1">{row.time}</td>
                        <td className="py-1 px-1">{row.invoice}</td>
                        <td className="py-1 px-1">{row.custId}</td>
                        <td className="py-1 px-1">{row.customer}</td>
                        <td className="py-1 px-1">{row.order}</td>
                        <td className="py-1 px-1">{row.print}</td>
                        <td className="py-1 px-1 text-right">{row.subTotal}</td>
                        <td className="py-1 px-1 text-right">{row.discount}</td>
                        <td className="py-1 px-1 text-right">{row.tax}</td>
                        <td className="py-1 px-1 text-left pl-2">{row.payType}</td>
                        <td className="py-1 px-1 text-right font-medium">{row.total}</td>
                        {activeShowRate && <td className="py-1 px-1 text-center">{row.currency}</td>}
                        {activeShowRate && <td className="py-1 px-1 text-right">{row.rate}</td>}
                      </tr>
                    ))}
                    
                    {/* Subtotals & Totals */}
                    {activeGroupByDate && (
                      <tr className="font-bold border-t border-slate-300">
                        <td colSpan={7} className="py-1 px-1 text-right">Total for 01-Aug-26:</td>
                        <td className="py-1 px-1 text-right">12,285,000.00</td>
                        <td className="py-1 px-1 text-right">900,000.00</td>
                        <td className="py-1 px-1 text-right">0.00</td>
                        <td></td>
                        <td className="py-1 px-1 text-right">11,385,000.00</td>
                        {activeShowRate && <td colSpan={2}></td>}
                      </tr>
                    )}
                    <tr className="font-bold border-t border-black">
                      <td colSpan={7} className="py-1 px-1 text-right">Branch Total:</td>
                      <td className="py-1 px-1 text-right">12,285,000.00</td>
                      <td className="py-1 px-1 text-right">900,000.00</td>
                      <td className="py-1 px-1 text-right">0.00</td>
                      <td></td>
                      <td className="py-1 px-1 text-right">11,385,000.00</td>
                      {activeShowRate && <td colSpan={2}></td>}
                    </tr>
                    <tr className="font-bold border-t border-double border-black">
                      <td colSpan={7} className="py-1 px-1 text-right">Grand Total:</td>
                      <td className="py-1 px-1 text-right">12,285,000.00</td>
                      <td className="py-1 px-1 text-right">900,000.00</td>
                      <td className="py-1 px-1 text-right">0.00</td>
                      <td></td>
                      <td className="py-1 px-1 text-right">11,385,000.00</td>
                      {activeShowRate && <td colSpan={2}></td>}
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Standard Vanguard Footer */}
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
