import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Printer, Download } from 'lucide-react';

export const OmnichannelPaymentsReportTemplate = () => {
  const [isFiltered, setIsFiltered] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleFilter = () => setIsFiltered(true);
  const handleReset = () => setIsFiltered(false);

  // Comprehensive mock data integrating POS, Social Media Pages, WhatsApp Reps, and Payment Gateways
  const reportData = [
    { 
      methodType: 'ONLINE GATEWAYS (LANDING PAGE DIRECT)', 
      rows: [
        { date: '28-Aug-26', invoice: '103125', client: 'Online Client 1', source: 'Facebook (Main Page)', channel: 'Landing Page Checkout', provider: 'Tap Payments', auth: 'ONL-9911', amount: '850,000.00' },
        { date: '28-Aug-26', invoice: '103126', client: 'Online Client 2', source: 'TikTok Ads (Promo)', channel: 'Landing Page Checkout', provider: 'Paymob / NetCommerce', auth: 'ONL-9912', amount: '450,000.00' }
      ], 
      total: '1,300,000.00' 
    },
    { 
      methodType: 'WHATSAPP ORDERS (REPS)', 
      rows: [
        { date: '28-Aug-26', invoice: '103127', client: 'Online Client 3', source: 'Instagram (Rep 1 Page)', channel: 'WhatsApp (70-111222)', provider: 'Whish Money (Link)', auth: 'WH-554', amount: '1,500,000.00' },
        { date: '28-Aug-26', invoice: '103128', client: 'Online Client 4', source: 'Facebook (Rep 2 Page)', channel: 'WhatsApp (71-333444)', provider: 'Supersonic', auth: 'SUP-AWB-11', amount: '700,000.00' }
      ], 
      total: '2,200,000.00' 
    },
    { 
      methodType: 'PHYSICAL BRANCH (POS)', 
      rows: [
        { date: '28-Aug-26', invoice: '102001', client: 'Jichi Mohammed', source: 'Walk-in', channel: 'POS Terminal 1', provider: 'Audi Bank (VISA)', auth: 'V-88392', amount: '500,000.00' },
        { date: '28-Aug-26', invoice: '102110', client: 'Yehya Kassem', source: 'Walk-in', channel: 'POS Terminal 2', provider: 'OMT (MasterCard)', auth: 'M-55412', amount: '1,200,000.00' }
      ], 
      total: '1,700,000.00' 
    }
  ];
  
  const grandTotal = '5,200,000.00';

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* SINGLE COMPACT FILTER & ACTION BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-center bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-4 gap-3 print:hidden w-full max-w-[1400px]">
        {/* Left side: Filters (Inputs + Filter/Reset Buttons) */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
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
            defaultValue="Aug 2026" 
            className="border border-slate-300 rounded p-1.5 text-xs text-slate-900 font-medium bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-24 shadow-2xs" 
          />
          <select className="border border-slate-300 rounded p-1.5 text-xs text-slate-900 font-medium bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs">
            <option>All Traffic Sources</option>
            <option>Facebook Ads</option>
            <option>Instagram</option>
            <option>TikTok</option>
            <option>Direct Walk-in</option>
          </select>
          <select className="border border-slate-300 rounded p-1.5 text-xs text-slate-900 font-medium bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs">
            <option>All Sales Channels</option>
            <option>Landing Page Checkout</option>
            <option>WhatsApp (All Reps)</option>
            <option>WhatsApp - Rep 1 (70-111222)</option>
            <option>WhatsApp - Rep 2 (71-333444)</option>
          </select>
          <select className="border border-slate-300 rounded p-1.5 text-xs text-slate-900 font-medium bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs">
            <option>All Payment Providers & Couriers</option>
            <option>Online: Tap Payments / Paymob</option>
            <option>Fintech: Whish Money / OMT / BOB Finance</option>
            <option>COD: Supersonic (Primary)</option>
            <option>COD: Wakilni / Aramex / LibanPost</option>
            <option>POS: Visa / Mastercard</option>
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
          
          <div className="text-blue-700 font-bold text-[12px] mb-6">Omnichannel Retail & E-Commerce</div>
          
          {!isFiltered ? (
            <div className="w-full py-16 mt-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 print:hidden">
               <p className="text-slate-500 font-bold text-[14px]">Please select your filters and click "Filter" to view omnichannel sales.</p>
            </div>
          ) : (
            <>
              <div className="text-center font-bold text-[12px] mb-4">Omnichannel Payments & Sales Source Report</div>
              
              <div className="flex justify-between items-end text-[11px] font-bold w-full border-b border-black pb-1 mb-1">
                <div>28-Aug-2026</div>
                <div className="text-center flex-1">From Date: 01-Aug-2026 To Date: 31-Aug-2026</div>
                <div>Page 1 of 1</div>
              </div>

              <div className="w-full overflow-x-auto print:overflow-visible pb-4">
                <table className="w-full min-w-[1100px] border-collapse text-[11px] whitespace-nowrap">
                  <thead>
                    <tr className="font-bold text-black border-b border-black">
                      <th className="py-1 px-1 text-left">Date</th>
                      <th className="py-1 px-1 text-left">Invoice #</th>
                      <th className="py-1 px-1 text-left">Client Name</th>
                      <th className="py-1 px-1 text-left">Traffic Source</th>
                      <th className="py-1 px-1 text-left">Sales Channel</th>
                      <th className="py-1 px-1 text-left">Bank/Provider/Courier</th>
                      <th className="py-1 px-1 text-left">Auth/AWB Code</th>
                      <th className="py-1 px-1 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="font-bold">
                      <td colSpan={8} className="py-1 px-1 underline">Consolidated Omnichannel View</td>
                    </tr>
                    
                    {reportData.map((group, gIdx) => (
                      <React.Fragment key={gIdx}>
                        <tr className="font-bold">
                          <td colSpan={8} className="py-1 px-1 pt-3 text-blue-800">Category: {group.methodType}</td>
                        </tr>
                        {group.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            <td className="py-1 px-1">{row.date}</td>
                            <td className="py-1 px-1">{row.invoice}</td>
                            <td className="py-1 px-1">{row.client}</td>
                            <td className="py-1 px-1 text-purple-700 font-medium">{row.source}</td>
                            <td className="py-1 px-1 text-emerald-700 font-medium">{row.channel}</td>
                            <td className="py-1 px-1">{row.provider}</td>
                            <td className="py-1 px-1">{row.auth}</td>
                            <td className="py-1 px-1 text-right font-medium">{row.amount}</td>
                          </tr>
                        ))}
                        <tr className="font-bold border-t border-slate-300">
                          <td colSpan={7} className="py-1 px-1 text-right">Total {group.methodType}:</td>
                          <td className="py-1 px-1 text-right">{group.total}</td>
                        </tr>
                      </React.Fragment>
                    ))}

                    {/* Grand Totals */}
                    <tr className="font-bold border-t-2 border-black mt-2">
                      <td colSpan={7} className="py-1 px-1 pt-2 text-right">Total Collected:</td>
                      <td className="py-1 px-1 pt-2 text-right">{grandTotal}</td>
                    </tr>
                    <tr className="font-bold">
                      <td colSpan={7} className="py-1 px-1 text-right underline">Grand Total:</td>
                      <td className="py-1 px-1 text-right">{grandTotal}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="report-footer flex justify-between items-center text-[10px] font-bold w-full mt-12 border-t border-black pt-1">
            <div className="text-black">REP_S_00250</div>
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
