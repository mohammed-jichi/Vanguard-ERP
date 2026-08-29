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
    setIsFiltered(true);
  };

  const handleReset = () => {
    setUiShowZeroTax(false);
    setActiveShowZeroTax(false);
    setIsFiltered(false);
  };

  // Sample data (Standard Invoice Data)
  const reportData = [
    { invoice: '103070', date: '28-Aug-2026', time: '10:00', order: '1', cust: '', amount: '5,000,000.00', discount: '0.00', taxPay: 'CASH', total: '5,000,000.00', print: '1' },
    { invoice: '103071', date: '28-Aug-2026', time: '11:30', order: '2', cust: '', amount: '12,000,000.00', discount: '500,000.00', taxPay: 'CASH', total: '11,500,000.00', print: '1' }
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
          
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-700">From:</span>
            <input 
              type="text" 
              defaultValue="103070" 
              className="force-black border border-slate-400 rounded p-1.5 focus:outline-none focus:border-blue-600 shadow-sm text-[13px] w-20 text-center" 
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-700">To:</span>
            <input 
              type="text" 
              defaultValue="103080" 
              className="force-black border border-slate-400 rounded p-1.5 focus:outline-none focus:border-blue-600 shadow-sm text-[13px] w-20 text-center" 
            />
          </div>

          <select className="force-black border border-slate-400 rounded p-1.5 focus:outline-none focus:border-blue-600 shadow-sm text-[13px] flex-grow sm:flex-grow-0">
            <option>All Branches</option>
            <option>Southern Olive Oil Products S.A.R.L</option>
          </select>

          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={uiShowZeroTax} 
              onChange={(e) => setUiShowZeroTax(e.target.checked)} 
              className="rounded border-slate-300 w-3.5 h-3.5 accent-[#195a96]" 
            />
            <span>Show 0 Tax</span>
          </label>

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

      {/* REPORT BODY */}
      {/* Background wrapper to center the paper on screen */}
      <div className="w-full font-sans text-black overflow-x-auto print:overflow-visible bg-slate-100 print:bg-white py-6 print:py-0 flex justify-center">
        {!isFiltered ? (
          <div className="w-full max-w-[794px] py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg bg-white shadow-sm print:hidden">
             <p className="text-slate-500 font-bold text-[14px]">Please select your invoice range and click "Filter" to view data.</p>
          </div>
        ) : (
          /* The A4 Paper Simulator (794px width) */
          <div 
            className="report-wrapper transition-transform duration-200 origin-top bg-white p-8 shadow-lg border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 w-[794px] min-h-[1123px]" 
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <div className="text-blue-700 font-bold text-[12px] mb-2">Southern Olive Oil Products S.A.R.L</div>
            <div className="text-center font-bold text-[12px] mb-4">Transactions by Invoice Number</div>
            
            <div className="flex justify-between items-center text-[11px] font-bold w-full">
              <div>28-Aug-2026</div>
              <div>From Invoice: 103070 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; To Invoice: 103080</div>
              <div>Page 1 of 1</div>
            </div>

            <div className="w-full mt-1 overflow-x-auto print:overflow-visible pb-4">
              <table className="w-full border-collapse border-t border-b border-black text-[11px] whitespace-nowrap">
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
                    <td colSpan={10} className="py-1 px-1">Branch: Southern Olive Oil Products S.A.R.L</td>
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
