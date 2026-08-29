import React, { useState } from 'react';

export const ElectronicJournalTemplate = () => {
  const [isFiltered, setIsFiltered] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Fully English Mock Data
  const journalData = [
    { time: '08:00:12 AM', eventType: 'SYSTEM', operator: 'Mohammed', terminal: 'POS-01', ref: 'SYS-IN', details: 'Operator Login Successful', amount: '-' },
    { time: '08:05:00 AM', eventType: 'CASH MANAGEMENT', operator: 'Mohammed', terminal: 'POS-01', ref: 'FLOAT', details: 'Starting Cash Float Declared: 5,000,000 LBP', amount: '5,000,000' },
    { time: '09:15:33 AM', eventType: 'SALE', operator: 'Mohammed', terminal: 'POS-01', ref: 'INV-104420', details: '1x Extra Virgin Olive Oil 1000ml @ 990,000 | 2x Oak Charcoal @ 450,000', amount: '1,890,000' },
    { time: '09:16:01 AM', eventType: 'PAYMENT', operator: 'Mohammed', terminal: 'POS-01', ref: 'INV-104420', details: 'Tendered: CASH | Change: 110,000', amount: '2,000,000' },
    { time: '10:30:14 AM', eventType: 'SALE', operator: 'Mohammed', terminal: 'POS-01', ref: 'INV-104421', details: '3x Stuffed Vine Leaves with Labneh @ 350,000', amount: '1,050,000' },
    { time: '10:32:45 AM', eventType: 'VOID ITEM', operator: 'Mohammed', terminal: 'POS-01', ref: 'INV-104421', details: 'ITEM VOID: 1x Stuffed Vine Leaves with Labneh (Customer Changed Mind)', amount: '(350,000)' },
    { time: '10:35:10 AM', eventType: 'PAYMENT', operator: 'Mohammed', terminal: 'POS-01', ref: 'INV-104421', details: 'Tendered: VISA (Tap Payments) | Auth: 88412', amount: '700,000' },
    { time: '11:45:00 AM', eventType: 'NO SALE', operator: 'Mohammed', terminal: 'POS-01', ref: 'NS-01', details: 'Cash Drawer Opened manually', amount: '-' },
    { time: '12:20:15 PM', eventType: 'DISPATCH RECEIPT', operator: 'Mohammed', terminal: 'POS-01', ref: 'SUP-AWB-109', details: 'COD Received from Supersonic Driver (Ali)', amount: '4,500,000' },
    { time: '02:00:00 PM', eventType: 'SYSTEM', operator: 'Mohammed', terminal: 'POS-01', ref: 'SYS-OUT', details: 'Operator Logout', amount: '-' },
  ];

  return (
    <div className="w-full flex flex-col items-center bg-white min-h-screen">
      
      {/* ☢️ CSS Override for absolute visibility */}
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

      {/* COMPACT FILTER & ACTION TOOLBAR */}
      <div className="w-full max-w-[1400px] flex flex-col xl:flex-row justify-between items-start xl:items-center bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6 gap-4 print:hidden shadow-sm mt-2">
        
        {/* LEFT SIDE: FILTERS */}
        <div className="flex flex-wrap items-center gap-2 flex-1 w-full">
          
          <select className="force-black border border-slate-400 rounded p-1.5 focus:outline-none focus:border-blue-600 shadow-sm text-[13px] flex-grow sm:flex-grow-0 min-w-[240px]">
            <option>Branch: Southern Olive Oil Products S.A.R.L</option>
            <option>Branch: Beirut Warehouse</option>
          </select>

          <select className="force-black border border-slate-400 rounded p-1.5 focus:outline-none focus:border-blue-600 shadow-sm text-[13px] flex-grow sm:flex-grow-0 min-w-[120px]">
            <option>Jul 28, 2026</option>
            <option>Today</option>
            <option>Yesterday</option>
            <option>This Month</option>
            <option>Date Range</option>
          </select>

          <select className="force-black border border-slate-400 rounded p-1.5 focus:outline-none focus:border-blue-600 shadow-sm text-[13px] flex-grow sm:flex-grow-0 min-w-[150px]">
            <option>All Event Types</option>
            <option>Sales & Payments</option>
            <option>Voids & Refunds</option>
            <option>System Events</option>
            <option>Cash Drawer Activity</option>
          </select>

          {/* Grouped Filter/Reset Buttons */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <button onClick={() => setIsFiltered(true)} className="px-4 py-1.5 bg-[#475569] text-white rounded font-bold hover:bg-slate-700 transition-colors shadow-sm text-[13px]">Filter</button>
            <button onClick={() => setIsFiltered(false)} className="px-4 py-1.5 bg-[#5e3b3b] text-white rounded font-bold hover:bg-red-900 transition-colors shadow-sm text-[13px]">Reset</button>
          </div>
        </div>

        {/* RIGHT SIDE: ACTION BUTTONS */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setZoomLevel(p => Math.min(p + 0.1, 1.5))} className="p-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 shadow-sm" title="Zoom In">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
          </button>
          <button onClick={() => setZoomLevel(p => Math.max(p - 0.1, 0.5))} className="p-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 shadow-sm" title="Zoom Out">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
          </button>
          <button onClick={() => window.print()} className="px-4 py-1.5 bg-slate-700 text-white rounded text-[13px] font-bold flex items-center gap-2 shadow-sm hover:bg-slate-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print
          </button>
          <button className="px-4 py-1.5 bg-slate-700 text-white rounded text-[13px] font-bold flex items-center gap-2 shadow-sm hover:bg-slate-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export
          </button>
        </div>
      </div>

      {/* REPORT BODY */}
      {/* Background wrapper to center the paper on screen */}
      <div className="w-full font-sans text-black overflow-x-auto print:overflow-visible bg-slate-100 print:bg-white py-6 print:py-0 flex justify-center">
        {!isFiltered ? (
          <div className="w-full max-w-[794px] py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg bg-white shadow-sm print:hidden">
             <div className="text-[40px] mb-3 opacity-40">🧾</div>
             <p className="text-slate-600 font-bold text-[15px]">Please select your filters and click "Filter" to view the Electronic Journal.</p>
          </div>
        ) : (
          /* The A4 Paper Simulator (794px width) */
          <div 
            className="report-wrapper transition-transform duration-200 origin-top bg-white p-8 shadow-lg border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 w-[794px] min-h-[1123px]" 
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Report Header */}
            <div className="text-center mb-6 border-b-2 border-black pb-4">
              <h2 className="font-bold text-[18px] uppercase tracking-wider">Southern Olive Oil Products S.A.R.L</h2>
              <h3 className="font-bold text-[14px] text-slate-700 mt-1">Terminal Electronic Journal</h3>
              <div className="flex justify-between items-end text-[12px] font-bold w-full mt-4">
                <div>Printed: 28-Aug-2026</div>
                <div>Report Date: 28-Jul-2026</div>
                <div>Page 1 of 1</div>
              </div>
            </div>

            {/* Journal Table */}
            <table className="w-full border-collapse text-[11.5px]">
              <thead>
                <tr className="bg-slate-100 border-y border-black font-bold">
                  <th className="py-2 px-2 text-left w-[100px]">Time</th>
                  <th className="py-2 px-2 text-left w-[130px]">Event Type</th>
                  <th className="py-2 px-2 text-left w-[100px]">Operator</th>
                  <th className="py-2 px-2 text-left w-[80px]">Term</th>
                  <th className="py-2 px-2 text-left w-[120px]">Reference</th>
                  <th className="py-2 px-2 text-left">Event Details</th>
                  <th className="py-2 px-2 text-right w-[100px]">Amount</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[11px]"> 
                {journalData.map((log, index) => (
                  <tr key={index} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-2 px-2 whitespace-nowrap text-slate-600">{log.time}</td>
                    <td className={`py-2 px-2 font-bold whitespace-nowrap 
                      ${log.eventType === 'VOID ITEM' ? 'text-red-600' : 
                        log.eventType === 'SALE' ? 'text-green-700' : 
                        log.eventType === 'SYSTEM' ? 'text-blue-600' : 'text-slate-800'}`}>
                      {log.eventType}
                    </td>
                    <td className="py-2 px-2 whitespace-nowrap">{log.operator}</td>
                    <td className="py-2 px-2 whitespace-nowrap">{log.terminal}</td>
                    <td className="py-2 px-2 whitespace-nowrap font-bold text-slate-700">{log.ref}</td>
                    <td className="py-2 px-2 leading-relaxed tracking-tight text-slate-800">{log.details}</td>
                    <td className="py-2 px-2 text-right font-bold whitespace-nowrap">{log.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* FINANCIAL SUMMARY FOOTER */}
            <div className="w-full mt-6 border-t-2 border-black pt-4 flex flex-col items-end text-[12px]">
              <div className="w-[350px] bg-slate-50 p-3 rounded border border-slate-200">
                <h4 className="font-bold text-center mb-2 border-b border-slate-300 pb-1">Terminal Session Summary</h4>
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-slate-600">Gross Sales:</span>
                  <span>2,940,000</span>
                </div>
                <div className="flex justify-between mb-1 text-red-600">
                  <span className="font-bold">Total Voids:</span>
                  <span>(350,000)</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-slate-600">Net Sales:</span>
                  <span className="font-bold">2,590,000</span>
                </div>
                <div className="flex justify-between mb-1 mt-2">
                  <span className="font-bold text-slate-600">POS Payments Collected:</span>
                  <span>2,700,000</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-slate-600">Dispatch COD Received:</span>
                  <span>4,500,000</span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-black font-bold text-[13px]">
                  <span>Expected Drawer Cash:</span>
                  <span>12,200,000</span>
                </div>
              </div>
            </div>
            
            {/* Document Reference Footer */}
            <div className="w-full mt-12 border-t border-black pt-2 flex justify-between items-center text-[10px] font-bold text-black">
              <div className="text-left w-1/3">REP_EJ_00455</div>
              <div className="text-center w-1/3">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
              <div className="text-right w-1/3 text-blue-600">www.vanguarderp.com</div>
            </div>
          </div>
        )}
      </div>

      {/* CENTERED GLOBAL FOOTER (Hidden on print) */}
      <div className="w-full mt-auto py-8 flex flex-wrap justify-center items-center gap-3 text-[11px] font-bold text-slate-600 print:hidden">
        <span>© 2026 Vanguard ERP All rights reserved.</span>
        <span className="hidden sm:inline opacity-40">|</span>
        <a href="#" className="hover:text-blue-700 transition-colors">Privacy Policy</a>
        <span className="hidden sm:inline opacity-40">|</span>
        <a href="#" className="hover:text-blue-700 transition-colors">Terms and Conditions</a>
        <span className="hidden sm:inline opacity-40">|</span>
        <a href="#" className="hover:text-blue-700 transition-colors">Support</a>
        <span className="hidden sm:inline opacity-40">|</span>
        <a href="#" className="hover:text-blue-700 transition-colors">Feedback</a>
      </div>

    </div>
  );
};
