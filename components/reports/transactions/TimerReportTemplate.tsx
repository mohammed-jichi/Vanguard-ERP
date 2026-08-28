import React, { useState } from 'react';

export const TimerReportTemplate = () => {
  const [isFiltered, setIsFiltered] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Clean data structure
  const columns = ['8/26/26', '8/27/26', '8/28/26', 'Total'];
  
  const rows = [
    { time: '11.07.49 AM', vals: ['0.00', '1.00', '0.00', '1.00'] },
    { time: '11.58.59 AM', vals: ['0.00', '1.00', '0.00', '1.00'] },
    { time: '12.07.38 PM', vals: ['0.00', '1.00', '0.00', '1.00'] },
    { time: '3.27.28 PM', vals: ['0.00', '1.00', '0.00', '1.00'] },
    { time: '5.09.05 PM', vals: ['0.00', '1.00', '0.00', '1.00'] },
    { time: '5.19.33 PM', vals: ['0.00', '0.00', '1.00', '1.00'] },
    { time: '5.58.56 PM', vals: ['0.00', '0.00', '1.00', '1.00'] },
  ];

  const subTotals = ['18.00', '8.00', '16.00', '334.00'];

  return (
    <div className="w-full flex flex-col items-center bg-white min-h-screen">
      
      <style dangerouslySetInnerHTML={{__html: `
        .force-black { color: #000000 !important; background-color: #ffffff !important; opacity: 1 !important; -webkit-text-fill-color: #000000 !important; font-weight: 700 !important; }
        .force-black option { color: #000000 !important; background-color: #ffffff !important; }
        .matrix-total-cell { background-color: #dbeafe !important; font-weight: bold !important; color: #000000 !important; }
        .matrix-grand-total { background-color: #0056b3 !important; color: #ffffff !important; font-weight: bold !important; }
        @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
      `}} />

      {/* FILTER TOOLBAR */}
      <div className="w-full max-w-[1400px] flex flex-col xl:flex-row justify-between items-start xl:items-center bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6 gap-4 print:hidden shadow-sm mt-2">
        <div className="flex flex-wrap items-center gap-3 flex-1 w-full">
          <select className="force-black border border-slate-400 rounded p-1.5 text-[13px] min-w-[140px]">
            <option>This Month</option>
            <option>Date Range</option>
            <option>Today</option>
          </select>
          <input type="text" defaultValue="Aug, 2026" className="force-black border border-slate-400 rounded p-1.5 text-[13px] w-[100px] text-center" />
          <select className="force-black border border-slate-400 rounded p-1.5 text-[13px] min-w-[260px]">
            <option>Southern Olive Oil Products S.A.R.L</option>
          </select>
          <label className="flex items-center gap-1.5 text-[13px] font-bold text-slate-800 cursor-pointer ml-2">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-400" />
            Real Date
          </label>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => setIsFiltered(true)} className="px-4 py-1.5 bg-[#475569] text-white rounded font-bold hover:bg-slate-700 text-[13px]">Filter</button>
            <button onClick={() => setIsFiltered(false)} className="px-4 py-1.5 bg-[#5e3b3b] text-white rounded font-bold hover:bg-red-900 text-[13px]">Reset</button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setZoomLevel(p => Math.min(p + 0.1, 1.5))} className="p-2 bg-emerald-700 text-white rounded" title="Zoom In">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
          </button>
          <button onClick={() => setZoomLevel(p => Math.max(p - 0.1, 0.5))} className="p-2 bg-emerald-700 text-white rounded" title="Zoom Out">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
          </button>
          <button onClick={() => window.print()} className="px-4 py-1.5 bg-slate-700 text-white rounded text-[13px] font-bold flex items-center gap-2 hover:bg-slate-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print
          </button>
        </div>
      </div>

      <div className="w-full max-w-[1400px] font-sans text-black overflow-x-auto print:overflow-visible">
        <div className="report-wrapper transition-transform duration-200 origin-top w-full min-w-[1000px]" style={{ transform: `scale(${zoomLevel})` }}>
          
          {!isFiltered ? (
            <div className="w-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 print:hidden mt-4">
               <div className="text-[40px] mb-3 opacity-40">⏱️</div>
               <p className="text-slate-600 font-bold text-[15px]">Please select your filters and click "Filter" to view the Timer Report.</p>
            </div>
          ) : (
            <div className="bg-white p-4">
              
              <div className="w-full relative mb-6">
                <div className="text-blue-700 font-bold text-[12px] absolute top-0 left-0">Southern Olive Oil Products S.A.R.L</div>
                <h3 className="font-bold text-[14px] text-black text-center mt-4">Timer Report Group by transaction count</h3>
                
                <div className="flex justify-between items-end text-[11px] font-bold w-full mt-2 border-b-2 border-black pb-1">
                  <div className="w-[150px] text-left">28-Aug-26</div>
                  <div className="flex-1 flex justify-center gap-16">
                     <span>From Date: 01-Aug-2026</span>
                     <span>To Date: 29-Aug-2026</span>
                  </div>
                  <div className="w-[150px] text-right">Page 1 of 1</div>
                </div>
              </div>

              {/* EXACT TABLE LOGIC IMPLEMENTATION */}
              <table className="w-full border-collapse text-[11px] border border-black">
                <thead>
                  <tr>
                    <th className="border border-black p-1 bg-white w-[150px]"></th>
                    <th className="border border-black p-1 bg-white w-[100px]"></th>
                    {columns.map((col, idx) => (
                      <th key={idx} className={`border border-black p-1.5 text-right font-bold ${col === 'Total' ? 'matrix-total-cell' : 'bg-white'}`}>
                        {col === 'Total' ? 'Total' : `${col} 12:00 AM`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  
                  {/* DATA ROWS */}
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {rIdx === 0 && (
                        <td rowSpan={rows.length} className="border border-black p-2 font-bold text-center align-middle bg-white w-[150px]">
                          Southern Olive Oil Products S.A.R.L
                        </td>
                      )}
                      
                      <td className="border border-black p-1.5 font-bold text-center whitespace-nowrap bg-white">
                        {row.time}
                      </td>

                      {row.vals.map((val, vIdx) => {
                        const isTotalColumn = vIdx === row.vals.length - 1;
                        return (
                          <td key={vIdx} className={`border border-black p-1 text-right whitespace-nowrap ${isTotalColumn ? 'matrix-total-cell font-bold' : 'bg-white'}`}>
                            <div className="leading-tight">{val}</div>
                            <div className="leading-tight">{val}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* BOTTOM TOTAL ROWS LOGIC */}
                  
                  {/* 1. Light Blue Subtotal (Cell 1 is EMPTY, Cell 2 is 'Total') */}
                  <tr>
                    <td className="border border-black p-1.5 matrix-total-cell"></td>
                    <td className="border border-black p-1.5 font-bold text-center matrix-total-cell">Total</td>
                    {subTotals.map((val, vIdx) => (
                      <td key={vIdx} className="border border-black p-1 text-right font-bold matrix-total-cell">
                        <div className="leading-tight">{val}</div>
                        <div className="leading-tight">{val}</div>
                      </td>
                    ))}
                  </tr>

                  {/* 2. Deep Blue Grand Total (Cell 1 and 2 are MERGED colSpan=2) */}
                  <tr>
                    <td colSpan={2} className="border border-black p-1.5 font-bold text-center matrix-grand-total">Total</td>
                    {subTotals.map((val, vIdx) => (
                      <td key={vIdx} className="border border-black p-1 text-right font-bold matrix-grand-total">
                        <div className="leading-tight">{val}</div>
                        <div className="leading-tight">{val}</div>
                      </td>
                    ))}
                  </tr>

                </tbody>
              </table>
              
              <div className="w-full mt-12 border-t border-black pt-2 flex justify-between items-center text-[10px] font-bold text-black">
                <div className="text-left w-1/3">REP_S_00200</div>
                <div className="text-center w-1/3">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                <div className="text-right w-1/3 text-blue-600">www.vanguarderp.com</div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
