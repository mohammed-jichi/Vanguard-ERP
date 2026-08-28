import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Printer, Download } from 'lucide-react';

export const CreditSalesTemplate = () => {
  // Controls table visibility
  const [isFiltered, setIsFiltered] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleFilter = () => setIsFiltered(true);
  const handleReset = () => setIsFiltered(false);

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* SINGLE COMPACT FILTER & ACTION BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-center bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-4 gap-3 print:hidden w-full max-w-[1400px]">
        {/* Left side: Filters (Inputs + Filter/Reset Buttons) */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <select className="border border-slate-400 rounded p-1.5 text-[13px] !text-black !font-bold !opacity-100 !bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm cursor-pointer">
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
            defaultValue="2025" 
            className="border border-slate-400 rounded p-1.5 text-[13px] !text-black !font-bold !opacity-100 !bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm w-24" 
          />
          <select className="border border-slate-400 rounded p-1.5 text-[13px] !text-black !font-bold !opacity-100 !bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm cursor-pointer">
            <option>Zeit w zaytoun ljanoub</option>
            <option>All Branches</option>
          </select>

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
        </div>
      </div>

      {/* REPORT BODY */}
      <div className="w-full max-w-[1400px] bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8 font-sans text-black overflow-auto min-h-[500px]">
        <div className="report-wrapper transition-transform duration-200 origin-top" style={{ transform: `scale(${zoomLevel})` }}>
          
          <div className="text-blue-700 font-bold text-[12px] mb-6">Zeit w zaytoun ljanoub</div>
          
          {!isFiltered ? (
            <div className="w-full py-16 mt-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 print:hidden">
               <p className="text-slate-500 font-bold text-[14px]">Please select your filters and click "Filter" to view credit sales.</p>
            </div>
          ) : (
            <>
              <div className="text-center font-bold text-[12px] mb-4">Credit Sales</div>
              
              <div className="flex justify-between items-end text-[11px] font-bold w-full border-b border-black pb-1 mb-1">
                <div>28-Aug-26</div>
                <div className="text-center flex-1">From Date: 01-Jan-2025 To Date: 31-Dec-2025</div>
                <div>Page 1 of 1</div>
              </div>

              <div className="w-full overflow-x-auto print:overflow-visible pb-4">
                <table className="w-full min-w-[800px] border-collapse text-[11px] whitespace-nowrap">
                  <thead>
                    <tr className="font-bold text-black border-b border-black">
                      <th className="py-1 px-1 text-left">Client Name</th>
                      <th className="py-1 px-1 text-left">Code</th>
                      <th className="py-1 px-1 text-left">Check</th>
                      <th className="py-1 px-1 text-center">Date</th>
                      <th className="py-1 px-1 text-right">Amount</th>
                      <th className="py-1 px-1 text-left pl-4">Payment Terms</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="font-bold">
                      <td colSpan={6} className="py-1 px-1 underline">Branch: Zeit w zaytoun ljanoub</td>
                    </tr>
                    <tr className="font-bold">
                      <td colSpan={6} className="py-1 px-1">GENERAL</td>
                    </tr>
                    <tr className="font-bold">
                      <td colSpan={6} className="py-1 px-1">GENERAL</td>
                    </tr>
                    <tr className="font-bold">
                      <td colSpan={6} className="py-1 px-1">Payment Type: CREDIT</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1">Jichi Mohammed</td>
                      <td className="py-1 px-1"></td>
                      <td className="py-1 px-1">100105</td>
                      <td className="py-1 px-1 text-center">01-Jan-26</td>
                      <td className="py-1 px-1 text-right">1,580,000.00</td>
                      <td className="py-1 px-1 pl-4"></td>
                    </tr>
                    
                    {/* Totals */}
                    <tr className="font-bold">
                      <td colSpan={4} className="py-1 px-1 text-right">Total By Payment Type:</td>
                      <td className="py-1 px-1 text-right">1,580,000.00</td>
                      <td></td>
                    </tr>
                    <tr className="font-bold">
                      <td colSpan={4} className="py-1 px-1 text-right">Total By Branch:</td>
                      <td className="py-1 px-1 text-right">1,580,000.00</td>
                      <td></td>
                    </tr>
                    <tr className="font-bold">
                      <td colSpan={4} className="py-1 px-1 text-right underline">Grand Total:</td>
                      <td className="py-1 px-1 text-right">1,580,000.00</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* STANDARDIZED FOOTER */}
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
