import React, { useState } from 'react';

export const TimeReportByDateTemplate = () => {
  const [isFiltered, setIsFiltered] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filterPeriod, setFilterPeriod] = useState('This Month');

  // ==========================================
  // 1. DATA GENERATION
  // ==========================================
  const allDates = Array.from({length: 28}, (_, i) => `${(i+1).toString().padStart(2, '0')}-Aug-2026`);
  const times = ['0:0', '10:12', '10:21', '10:24', '10:30', '10:36', '10:42', '10:51', '10:57', '11:0'];

  const allColumns = [...allDates, 'Total'];

  // ==========================================
  // 2. CHUNKING ALGORITHM (Max 7 columns per table)
  // ==========================================
  const chunkedColumns = [];
  for (let i = 0; i < allColumns.length; i += 7) {
    chunkedColumns.push(allColumns.slice(i, i + 7));
  }

  const getVal = () => "0.00";
  const getDailyTotal = () => "7,499,523.81";
  const getMatrixGrandTotal = () => "248,400,000.00";
  const getGrandTotalSum = () => "5,082,987.43";

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
          
          <select 
            className="force-black border border-slate-400 rounded p-1.5 text-[13px] min-w-[140px]"
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
          >
            <option value="This Month">This Month</option>
            <option value="Date Range">Date Range</option>
            <option value="EOD Date">EOD Date</option>
          </select>

          {filterPeriod === 'Date Range' ? (
            <div className="flex items-center gap-2">
              <input type="date" defaultValue="2026-08-01" className="force-black border border-slate-400 rounded p-1.5 text-[13px]" />
              <input type="date" defaultValue="2026-08-29" className="force-black border border-slate-400 rounded p-1.5 text-[13px]" />
            </div>
          ) : filterPeriod === 'EOD Date' ? (
            <input type="date" defaultValue="2026-08-28" className="force-black border border-slate-400 rounded p-1.5 text-[13px]" />
          ) : (
            <input type="text" defaultValue="Aug, 2026" className="force-black border border-slate-400 rounded p-1.5 text-[13px] w-[100px] text-center" />
          )}

          <select className="force-black border border-slate-400 rounded p-1.5 text-[13px] min-w-[200px]">
            <option>Southern Olive Oil Products S.A.R.L</option>
          </select>

          <div className="flex items-center gap-2 ml-2">
             <span className="font-bold text-[13px] text-slate-800">Option Time</span>
             <input type="text" defaultValue="1" className="force-black border border-slate-400 rounded p-1.5 text-[13px] w-[60px] text-center" />
          </div>
          
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
               <div className="text-[40px] mb-3 opacity-40">📊</div>
               <p className="text-slate-600 font-bold text-[15px]">Please select your filters and click "Filter" to view the Time report by date.</p>
            </div>
          ) : (
            <div className="bg-white p-4">
              
              <div className="w-full relative mb-2">
                <div className="text-blue-700 font-bold text-[12px] absolute top-0 left-0">Southern Olive Oil Products S.A.R.L</div>
                <h3 className="font-bold text-[14px] text-black text-center">Time report (By date)</h3>
                
                <div className="flex justify-between items-end text-[11px] font-bold w-full mt-6 border-b border-black pb-1">
                  <div className="w-[150px] text-left">28-Aug-2026</div>
                  <div className="flex-1 flex justify-center gap-16">
                     <span>From Date: 01-Aug-2026</span>
                     <span>To Date: 29-Aug-2026</span>
                  </div>
                  <div className="w-[150px] text-right">Page 1 of 29</div>
                </div>
                <div className="text-left font-bold text-[11px] mt-1 mb-6 leading-tight">
                  This report will show the transactions done by date and not by EOD date, so the Total shown is not the total sales of<br/>
                  the day. use this report for statistics reasons only.
                </div>
              </div>

              {/* 3. STANDARD CHUNKED MATRICES */}
              {chunkedColumns.map((chunk, chunkIdx) => (
                <div key={chunkIdx} className="mb-10 page-break-inside-avoid">
                  <table className="w-full border-collapse text-[11px] border border-black">
                    <thead>
                      <tr>
                        <th rowSpan={2} className="border border-black p-1 bg-white min-w-[120px]"></th>
                        <th colSpan={chunk.length} className="border border-black p-1.5 text-left font-bold bg-white">
                          Southern Olive Oil Products S.A.R.L
                        </th>
                      </tr>
                      <tr>
                        {chunk.map((col, i) => (
                          <th key={i} className={`border border-black p-1.5 text-center font-bold ${col === 'Total' ? 'matrix-total-cell' : 'bg-white'}`}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black p-1.5 text-center font-bold matrix-total-cell">Total</td>
                        {chunk.map((col, i) => (
                          <td key={`total-${i}`} className="border border-black p-1 text-right font-bold matrix-total-cell">
                            {getDailyTotal()}
                          </td>
                        ))}
                      </tr>
                      {times.map(time => (
                        <tr key={time}>
                          <td className="border border-black p-1.5 text-center font-bold bg-white">{time}</td>
                          {chunk.map((col, i) => (
                            <td key={`${time}-${i}`} className={`border border-black p-1 text-right ${col === 'Total' ? 'matrix-total-cell font-bold' : 'bg-white'}`}>
                              {col === 'Total' ? '12,600,000.00' : getVal()}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              {/* 4. THE STANDALONE GRAND TOTAL TABLE (Deep Blue) */}
              <div className="mb-10 page-break-inside-avoid">
                <table className="border-collapse text-[11px] border border-black" style={{ width: '250px' }}>
                  <thead>
                    <tr>
                      <th className="border border-black p-1 bg-white min-w-[120px]"></th>
                      <th className="border border-black p-1.5 text-right matrix-grand-total">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-1.5 text-center font-bold matrix-total-cell">Total</td>
                      <td className="border border-black p-1 text-right font-bold matrix-grand-total">{getGrandTotalSum()}</td>
                    </tr>
                    {times.map(time => (
                      <tr key={`grand-${time}`}>
                        <td className="border border-black p-1.5 text-center font-bold bg-white">{time}</td>
                        <td className="border border-black p-1 text-right font-bold matrix-grand-total">{getMatrixGrandTotal()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="w-full mt-12 border-t border-black pt-2 flex justify-between items-center text-[10px] font-bold text-black">
                <div className="text-left w-1/3">REP_TR_00312</div>
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
