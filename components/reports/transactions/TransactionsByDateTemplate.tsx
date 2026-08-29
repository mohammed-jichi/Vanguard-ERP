import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Printer, Download, Settings } from 'lucide-react';

export const TransactionsByDateTemplate = () => {
  // UI States (Drafts - do not affect report yet)
  const [uiShowRate, setUiShowRate] = useState(false);
  const [uiGroupByDate, setUiGroupByDate] = useState(true);
  
  // Active States (Applied to table after click)
  const [activeShowRate, setActiveShowRate] = useState(false);
  const [activeGroupByDate, setActiveGroupByDate] = useState(false);
  
  // Core Visibility State (Auto-rendered by default)
  const [isFiltered, setIsFiltered] = useState(true);
  
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
    <div className="w-full flex flex-col items-center bg-white min-h-screen">
      
      {/* ☢️ القنبلة النووية: هيدا الكود بيجبر المتصفح يكتب بالأسود غصب عن أي كود تاني بالسيستم */}
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

      {/* 1. COMPACT FILTER & ACTION TOOLBAR */}
      <div className="w-full max-w-[1400px] flex flex-col xl:flex-row justify-between items-start xl:items-center bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6 gap-4 print:hidden shadow-sm mt-2">
        {/* Left side: Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1 w-full">
          <select 
            className="force-black border border-slate-400 rounded p-1.5 focus:outline-none focus:border-blue-600 shadow-sm text-[13px] flex-grow sm:flex-grow-0" 
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

          <select className="force-black border border-slate-400 rounded p-1.5 focus:outline-none focus:border-blue-600 shadow-sm text-[13px] flex-grow sm:flex-grow-0">
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
            className="force-black border border-slate-400 rounded p-1.5 focus:outline-none focus:border-blue-600 shadow-sm text-[13px] w-[90px] text-center" 
          />

          <select className="force-black border border-slate-400 rounded p-1.5 focus:outline-none focus:border-blue-600 shadow-sm text-[13px] flex-grow sm:flex-grow-0">
            <option>Southern Olive Oil Products S.A.R.L</option>
            <option>All Branches</option>
          </select>

          <select className="force-black border border-slate-400 rounded p-1.5 focus:outline-none focus:border-blue-600 shadow-sm text-[13px] flex-grow sm:flex-grow-0">
            <option>All Invoices</option>
            <option>Inventory Invoices</option>
            <option>POS Invoices</option>
            <option>Training Invoices</option>
          </select>

          {/* Checkboxes Group */}
          <div className="flex items-center gap-2 shrink-0">
            <label className="flex items-center gap-1 text-xs font-bold text-slate-700 cursor-pointer select-none">
              <input type="checkbox" checked={uiShowRate} onChange={(e) => setUiShowRate(e.target.checked)} className="rounded border-slate-300 w-3.5 h-3.5 accent-[#195a96]" />
              <span>Rate</span>
            </label>
            
            <label className="flex items-center gap-1 text-xs font-bold text-slate-700 cursor-pointer select-none">
              <input type="checkbox" checked={uiGroupByDate} onChange={(e) => setUiGroupByDate(e.target.checked)} className="rounded border-slate-300 w-3.5 h-3.5 accent-[#195a96]" />
              <span>Group By Date</span>
            </label>
          </div>

          {/* Grouped Buttons */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <button 
              onClick={handleFilter} 
              className="px-4 py-1.5 bg-[#475569] text-white rounded font-bold hover:bg-slate-700 transition-colors shadow-sm text-[13px] whitespace-nowrap"
            >
              Filter
            </button>
            <button 
              onClick={handleReset} 
              className="px-4 py-1.5 bg-[#5e3b3b] text-white rounded font-bold hover:bg-red-900 transition-colors shadow-sm text-[13px] whitespace-nowrap"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Right side: Action Toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.5))} 
            className="p-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 shadow-sm" 
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button 
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))} 
            className="p-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 shadow-sm" 
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button 
            onClick={() => window.print()} 
            className="px-4 py-1.5 bg-slate-700 text-white rounded text-[13px] font-bold flex items-center gap-2 shadow-sm hover:bg-slate-800"
          >
            <Printer size={15} /> Print
          </button>
          <button 
            className="px-4 py-1.5 bg-slate-700 text-white rounded text-[13px] font-bold flex items-center gap-2 shadow-sm hover:bg-slate-800"
          >
            <Download size={15} /> Export
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
      {/* Background wrapper to center the paper on screen */}
      <div className="w-full font-sans text-black overflow-x-auto print:overflow-visible bg-slate-100 print:bg-white py-6 print:py-0 flex justify-center">
        {!isFiltered ? (
          <div className="w-full max-w-[794px] py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg bg-white shadow-sm print:hidden">
             <p className="text-slate-500 font-bold text-[14px]">Please select your filters and click "Filter" to view data.</p>
          </div>
        ) : (
          /* The A4 Paper Simulator (794px width) */
          <div 
            className="report-wrapper transition-transform duration-200 origin-top bg-white p-8 shadow-lg border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 w-[794px] min-h-[1123px]" 
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <div className="text-blue-700 font-bold text-[12px] mb-2">
              Southern Olive Oil Products S.A.R.L
            </div>
            
            <div className="text-center font-bold text-[12px] mb-4">
              Transactions by Date
            </div>

            <div className="flex justify-between items-center text-[11px] font-bold w-full">
              <div>28-Aug-2026</div>
              <div>From Date: 01-Aug-2026 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; To Date: 28-Aug-2026</div>
              <div>Page {currentPage} of 14</div>
            </div>

            {/* Table */}
            <div className="w-full mt-1 overflow-x-auto print:overflow-visible pb-4">
              <table className="w-full border-collapse border-t border-b border-black text-[11px] whitespace-nowrap">
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
                    <td colSpan={activeShowRate ? 14 : 12} className="py-1 px-1 underline">Branch: Southern Olive Oil Products S.A.R.L</td>
                  </tr>
                  
                  {reportData.map((row, index) => (
                    <tr key={index}>
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
                      <td className="py-1 px-1 pl-2">{row.payType}</td>
                      <td className="py-1 px-1 text-right font-bold">{row.total}</td>
                      {activeShowRate && <td className="py-1 px-1 text-center font-bold text-slate-700">{row.currency || 'LBP'}</td>}
                      {activeShowRate && <td className="py-1 px-1 text-right font-mono text-slate-700">{row.rate || '89,500'}</td>}
                    </tr>
                  ))}

                  {/* Summary Totals */}
                  <tr className="font-bold border-t border-black">
                    <td colSpan={7} className="py-1 px-1 text-right">Total By Branch:</td>
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

            {/* Standard Vanguard Footer */}
            <div className="w-full mt-12 border-t border-black pt-2 flex justify-between items-center text-[10px] font-bold text-black">
              <div className="text-left w-1/3">REP_S_00247</div>
              <div className="text-center w-1/3">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
              <div className="text-right w-1/3 text-blue-600">www.vanguarderp.com</div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
