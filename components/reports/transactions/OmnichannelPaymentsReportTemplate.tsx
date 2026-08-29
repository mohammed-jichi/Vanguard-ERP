import React, { useState } from 'react';

export const OmnichannelPaymentsReportTemplate = () => {
  const [isFiltered, setIsFiltered] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const reportData = [
    { 
      methodType: 'ONLINE GATEWAYS (LANDING PAGE DIRECT)', 
      rows: [
        { date: '28-Aug-26', invoice: '103125', client: 'Online Client 1', source: 'Facebook (Main Page)', channel: 'Landing Page Checkout', provider: 'Tap Payments', auth: 'ONL-9911', amount: '850,000.00' },
      ], 
      total: '850,000.00' 
    },
    { 
      methodType: 'CASH ON DELIVERY (COD)', 
      rows: [
        { date: '28-Aug-26', invoice: '103128', client: 'Online Client 4', source: 'Instagram (Rep 2 Page)', channel: 'WhatsApp (71-333444)', provider: 'Supersonic (Primary)', auth: 'SUP-AWB-11', amount: '700,000.00' }
      ], 
      total: '700,000.00' 
    }
  ];
  
  const grandTotal = '1,550,000.00';

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
        
        {/* LEFT SIDE: FILTERS (Flex wrap with proper spacing) */}
        <div className="flex flex-wrap items-center gap-2 flex-1 w-full">
          
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
          
          <input type="text" defaultValue="Aug 2026" className="force-black border border-slate-400 rounded p-1.5 focus:outline-none focus:border-blue-600 shadow-sm text-[13px] w-[90px] text-center" />
          
          <select className="force-black border border-slate-400 rounded p-1.5 focus:outline-none focus:border-blue-600 shadow-sm text-[13px] flex-grow sm:flex-grow-0">
            <option>All Traffic Sources</option>
            <option>Facebook Ads</option>
            <option>Instagram</option>
            <option>TikTok</option>
          </select>

          <select className="force-black border border-slate-400 rounded p-1.5 focus:outline-none focus:border-blue-600 shadow-sm text-[13px] flex-grow sm:flex-grow-0">
            <option>All Sales Channels</option>
            <option>Landing Page Checkout</option>
            <option>WhatsApp (All Reps)</option>
          </select>

          <select className="force-black border border-slate-400 rounded p-1.5 focus:outline-none focus:border-blue-600 shadow-sm text-[13px] flex-grow sm:flex-grow-0">
            <option>All Payment Providers & Couriers</option>
            <option>COD: Supersonic (Primary)</option>
            <option>Online: Tap Payments / Paymob</option>
            <option>Fintech: Whish Money / OMT</option>
            <option>POS: Visa / Mastercard</option>
          </select>

          {/* Grouped Buttons */}
          <div className="flex items-center gap-2">
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

      {/* 2. REPORT BODY */}
      {/* Background wrapper to center the paper on screen */}
      <div className="w-full font-sans text-black overflow-x-auto print:overflow-visible bg-slate-100 py-6 flex justify-center">
        {!isFiltered ? (
          <div className="w-full max-w-[794px] py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg bg-white shadow-sm print:hidden">
             <div className="text-[40px] mb-3 opacity-40">📊</div>
             <p className="text-slate-600 font-bold text-[15px]">Please select your filters and click "Filter" to view the report.</p>
          </div>
        ) : (
          /* The A4 Paper Simulator (794px width) */
          <div 
            className="report-wrapper transition-transform duration-200 origin-top bg-white p-8 shadow-lg border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 w-[794px] min-h-[1123px]" 
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <div className="text-left font-bold text-[15px] mb-6">Omnichannel Payments & Sales Source Report</div>
            
            <div className="flex justify-between items-end text-[12px] font-bold w-full border-b-2 border-black pb-2 mb-2">
              <div>Date: 28-Aug-2026</div>
              <div className="text-center flex-1">From Date: 01-Aug-2026 To Date: 31-Aug-2026</div>
              <div>Page 1 of 1</div>
            </div>

            <table className="w-full border-collapse text-[11px] whitespace-nowrap mt-4">
              <thead>
                <tr className="font-bold text-black border-b border-black">
                  <th className="py-2 px-1 text-left">Date</th>
                  <th className="py-2 px-1 text-left">Invoice #</th>
                  <th className="py-2 px-1 text-left">Client Name</th>
                  <th className="py-2 px-1 text-left">Traffic Source</th>
                  <th className="py-2 px-1 text-left">Sales Channel</th>
                  <th className="py-2 px-1 text-left">Bank/Provider/Courier</th>
                  <th className="py-2 px-1 text-left">Auth/AWB Code</th>
                  <th className="py-2 px-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-bold">
                  <td colSpan={8} className="py-2 px-1 underline text-blue-900">Consolidated Omnichannel View</td>
                </tr>
                
                {reportData.map((group, gIdx) => (
                  <React.Fragment key={gIdx}>
                    <tr className="font-bold">
                      <td colSpan={8} className="py-2 px-1 pt-4 text-blue-800 border-b border-slate-200">Category: {group.methodType}</td>
                    </tr>
                    {group.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 border-b border-slate-100">
                        <td className="py-1.5 px-1">{row.date}</td>
                        <td className="py-1.5 px-1">{row.invoice}</td>
                        <td className="py-1.5 px-1">{row.client}</td>
                        <td className="py-1.5 px-1 text-purple-700 font-medium">{row.source}</td>
                        <td className="py-1.5 px-1 text-emerald-700 font-medium">{row.channel}</td>
                        <td className="py-1.5 px-1">{row.provider}</td>
                        <td className="py-1.5 px-1 text-slate-500">{row.auth}</td>
                        <td className="py-1.5 px-1 text-right font-bold">{row.amount}</td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td colSpan={7} className="py-2 px-1 text-right">Total {group.methodType}:</td>
                      <td className="py-2 px-1 text-right text-blue-900">{group.total}</td>
                    </tr>
                  </React.Fragment>
                ))}

                <tr className="font-bold border-t-2 border-black mt-4">
                  <td colSpan={7} className="py-3 px-1 text-right uppercase">Grand Total:</td>
                  <td className="py-3 px-1 text-right text-[13px]">{grandTotal}</td>
                </tr>
              </tbody>
            </table>
            
            <div className="w-full mt-12 border-t border-black pt-2 flex justify-between items-center text-[10px] font-bold text-black">
              <div className="text-left w-1/3">REP_S_00250</div>
              <div className="text-center w-1/3">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
              <div className="text-right w-1/3 text-blue-600">www.vanguarderp.com</div>
            </div>
          </div>
        )}
      </div>

      {/* 3. CENTERED GLOBAL FOOTER */}
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