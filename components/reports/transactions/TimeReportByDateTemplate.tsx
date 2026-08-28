import React, { useState } from 'react';

export const TimeReportByDateTemplate = () => {
  const [isFiltered, setIsFiltered] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Mock Data mimicking the provided Omega report
  const rows = [
    { time: '10.57.50 AM', v1: '0.00', v2: '0.00', sub: '1,260,000.00', grand: '1,260,000.00' },
    { time: '11.42.15 AM', v1: '0.00', v2: '0.00', sub: '1,620,000.00', grand: '1,620,000.00' },
    { time: '11.45.25 AM', v1: '0.00', v2: '0.00', sub: '90,000.00', grand: '90,000.00' },
    { time: '11.50.43 AM', v1: '0.00', v2: '0.00', sub: '8,100,000.00', grand: '8,100,000.00' },
    { time: '12.08.17 PM', v1: '0.00', v2: '0.00', sub: '315,000.00', grand: '315,000.00' },
    { time: '12.09.26 PM', v1: '0.00', v2: '0.00', sub: '990,000.00', grand: '990,000.00' },
    { time: '12.21.33 PM', v1: '0.00', v2: '0.00', sub: '12,600,000.00', grand: '12,600,000.00' },
    { time: '12.45.25 PM', v1: '0.00', v2: '0.00', sub: '630,000.00', grand: '630,000.00' },
  ];

  return (
    <div className="w-full flex flex-col items-center bg-white min-h-screen">
      
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
        .matrix-total-cell {
          background-color: #dbeafe !important;
          font-weight: bold !important;
        }
        .matrix-grand-total {
          background-color: #0056b3 !important;
          color: #ffffff !important;
          font-weight: bold !important;
        }
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />

      {/* COMPACT FILTER & ACTION TOOLBAR */}
      <div className="w-full max-w-[1400px] flex flex-col xl:flex-row justify-between items-start xl:items-center bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6 gap-4 print:hidden shadow-sm mt-2">
        
        <div className="flex flex-wrap items-center gap-3 flex-1 w-full">
          <select className="force-black border border-slate-400 rounded p-1.5 focus:outline-none focus:border-blue-600 shadow-sm text-[13px] min-w-[120px]">
            <option>This Month</option>
            <option>Today</option>
            <option>Yesterday</option>
            <option>Date Range</option>
          </select>

          <input type="text" defaultValue="Aug, 2026" className="force-black border border-slate-400 rounded p-1.5 focus:outline-none focus:border-blue-600 shadow-sm text-[13px] w-[100px] text-center" />

          <select className="force-black border border-slate-400 rounded p-1.5 focus:outline-none focus:border-blue-600 shadow-sm text-[13px] min-w-[260px]">
            <option>Southern Olive Oil Products S.A.R.L</option>
            <option>Beirut Warehouse</option>
          </select>

          <div className="flex items-center gap-2 whitespace-nowrap ml-2">
            <button onClick={() => setIsFiltered(true)} className="px-4 py-1.5 bg-[#475569] text-white rounded font-bold hover:bg-slate-700 transition-colors shadow-sm text-[13px]">Filter</button>
            <button onClick={() => setIsFiltered(false)} className="px-4 py-1.5 bg-[#5e3b3b] text-white rounded font-bold hover:bg-red-900 transition-colors shadow-sm text-[13px]">Reset</button>
          </div>
        </div>

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
      <div className="w-full max-w-[1400px] font-sans text-black overflow-x-auto print:overflow-visible">
        <div className="report-wrapper transition-transform duration-200 origin-top w-full min-w-[1000px]" style={{ transform: `scale(${zoomLevel})` }}>
          
          {!isFiltered ? (
            <div className="w-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 print:hidden mt-4">
               <div className="text-[40px] mb-3 opacity-40">📅</div>
               <p className="text-slate-600 font-bold text-[15px]">Please select your filters and click "Filter" to view the Time report by date.</p>
            </div>
          ) : (
            <div className="bg-white p-4">
              
              {/* Report Header */}
              <div className="text-center mb-2">
                <h3 className="font-bold text-[14px] text-black">Time report (By date)</h3>
                <div className="flex justify-between items-end text-[12px] font-bold w-full mt-4 border-b-2 border-black pb-1">
                  <div className="w-[150px] text-left">28-Aug-2026</div>
                  <div className="flex-1 text-center">From Date: 01-Aug-2026 To Date: 29-Aug-2026</div>
                  <div className="w-[150px] text-right">Page 1 of 1</div>
                </div>
                {/* Statistical Disclaimer */}
                <div className="text-left font-bold text-[11px] mt-1 mb-4 leading-tight">
                  This report will show the transactions done by date and not by EOD date, so the Total shown is not the total sales of<br/>
                  the day. use this report for statistics reasons only.
                </div>
              </div>

              <table className="w-full border-collapse text-[11px] border border-black">
                <thead>
                  {/* HEADER ROW 1: Branch Name & Grand Total Header */}
                  <tr>
                    <th className="border border-black p-1 bg-white min-w-[120px]"></th>
                    <th colSpan={3} className="border border-black p-1.5 text-left font-bold bg-white">
                      Southern Olive Oil Products S.A.R.L
                    </th>
                    <th rowSpan={2} className="border border-black p-1.5 text-center matrix-grand-total align-bottom">
                      Total
                    </th>
                  </tr>
                  {/* HEADER ROW 2: Dates & Subtotal Header */}
                  <tr>
                    <th className="border border-black p-1 bg-white"></th>
                    <th className="border border-black p-1.5 text-center font-bold bg-white">27-Aug-2026</th>
                    <th className="border border-black p-1.5 text-center font-bold bg-white">28-Aug-2026</th>
                    <th className="border border-black p-1.5 text-center font-bold matrix-total-cell">Total</th>
                  </tr>
                </thead>
                <tbody>
                  
                  {/* TOP TOTAL ROW */}
                  <tr>
                    <td className="border border-black p-1.5 text-center font-bold matrix-total-cell">
                      Total
                    </td>
                    <td className="border border-black p-1 text-right matrix-total-cell">64,695,000.00</td>
                    <td className="border border-black p-1 text-right matrix-total-cell">60,001,200.00</td>
                    <td className="border border-black p-1 text-right matrix-total-cell">1,697,717,800.00</td>
                    <td className="border border-black p-1 text-right matrix-grand-total">1,697,717,800.00</td>
                  </tr>

                  {/* DATA ROWS */}
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="border border-black p-1.5 font-bold text-center whitespace-nowrap bg-white">
                        {row.time}
                      </td>
                      <td className="border border-black p-1 text-right whitespace-nowrap bg-white">{row.v1}</td>
                      <td className="border border-black p-1 text-right whitespace-nowrap bg-white">{row.v2}</td>
                      <td className="border border-black p-1 text-right whitespace-nowrap matrix-total-cell">{row.sub}</td>
                      <td className="border border-black p-1 text-right whitespace-nowrap matrix-grand-total">{row.grand}</td>
                    </tr>
                  ))}
                  
                </tbody>
              </table>
              
              {/* VANGUARD PRINT FOOTER */}
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
