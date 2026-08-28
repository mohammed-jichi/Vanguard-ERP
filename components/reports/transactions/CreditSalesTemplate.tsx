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
      
      {/* FILTERS BLOCK - Independent and self-contained */}
      <div className="filters-container w-full max-w-[1400px] bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-4 print:hidden">
        <div className="mb-4">
          <h3 className="text-[14px] font-bold text-slate-800">Filters</h3>
          <p className="text-[12px] text-slate-500">Credit Sales</p>
        </div>
        <div className="flex justify-between items-start gap-6">
          <div className="flex-1 max-w-[650px] flex flex-col gap-3">
            
            {/* Row 1: Period & Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <select className="w-full border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 bg-white font-medium">
                  <option>Last Year</option>
                  <option>This Year</option>
                  <option>This Month</option>
                </select>
              </div>
              <div>
                <input type="text" defaultValue="2025" className="w-full border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 bg-white font-medium" />
              </div>
            </div>

            {/* Row 2: Branch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <select className="w-full border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 bg-white font-medium">
                  <option>Zeit w zaytoun ljanoub</option>
                  <option>All Branches</option>
                </select>
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

      {/* REPORT BODY */}
      <div className="w-full max-w-[1400px] bg-white font-sans text-black mt-2">
        
        {/* Toolbar */}
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
        </div>

        <div className="report-wrapper transition-transform duration-200 origin-top" style={{ transform: `scale(${zoomLevel})` }}>
          
          <div className="text-blue-700 font-bold text-[12px] mb-6">Zeit w zaytoun ljanoub</div>
          
          {!isFiltered ? (
            <div className="w-full py-16 mt-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 print:hidden">
               <p className="text-slate-500 font-bold text-[14px]">Please select your filters and click "Filter Report" to view credit sales.</p>
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
