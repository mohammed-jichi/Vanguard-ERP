import React, { useState } from 'react';

export const SummaryOfSalesByItemsTemplate = () => {
  const [isFiltered, setIsFiltered] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filterPeriod, setFilterPeriod] = useState('This Month');
  const [branch, setBranch] = useState('All Branches');

  // Dynamic Date Display Logic
  const getDateDisplay = () => {
    switch (filterPeriod) {
      case 'Today': return '29-Aug-2026';
      case 'Yesterday': return '28-Aug-2026';
      case 'This Month': return 'Aug, 2026';
      case 'Last Month': return 'Jul, 2026';
      case 'First Quarter': return 'Jan, Feb, Mar 2026';
      case 'Second Quarter': return 'Apr, May, Jun 2026';
      case 'Third Quarter': return 'Jul, Aug, Sep 2026';
      case 'Fourth Quarter': return 'Oct, Nov, Dec 2026';
      case 'This Year': return '2026';
      case 'Last Year': return '2025';
      default: return '';
    }
  };

  // Pagination Data Simulation (Exact Match from Scans)
  const pages = [
    {
      page: 1,
      items: [
        { code: 'Fixed Offer', desc: 'Fixed Offer', bar: '', id: '1289.0', qty: '24.00', price: '1.035E7', total: '248,400,000.00' },
        { code: 'RICEBM1KG', desc: 'أرز بسمتي Manas', bar: '', id: '1062.0', qty: '3.50', price: '150000.0', total: '525,000.00' },
        { code: 'P Blue Gallon 10', desc: 'P Blue Gallon 10 Liters', bar: '', id: '1260.0', qty: '24.00', price: '0.0', total: '0.00' },
        { code: 'P Blue Gallon 10', desc: 'P Blue Gallon 10 Liters', bar: '', id: '1260.0', qty: '23.00', price: '0.0', total: '0.00' },
        { code: 'P Blue Gallon 20', desc: 'P Blue Gallon 20 Liters', bar: '', id: '1259.0', qty: '46.00', price: '0.0', total: '0.00' },
        { code: 'P Blue Gallon 20', desc: 'P Blue Gallon 20 Liters', bar: '', id: '1259.0', qty: '47.00', price: '0.0', total: '0.00' },
        { code: 'أرز امريكي', desc: 'أرز امريكي', bar: '', id: '661.0', qty: '2.00', price: '90000.0', total: '180,000.00' },
        { code: 'أرز بسمتي البستان', desc: 'أرز بسمتي البستان 720غ', bar: '', id: '720.0', qty: '1.00', price: '120000.0', total: '120,000.00' },
        { code: 'اكليل الجبل كيلو', desc: 'اكليل الجبل كيلو', bar: '', id: '486.0', qty: '0.20', price: '800000.0', total: '160,000.00' },
        { code: 'EVOO1000MLDE', desc: 'تنكة زيت زيتون حصير بلدي 1000 مل', bar: '', id: '1017.0', qty: '5.00', price: '990000.0', total: '4,950,000.00' },
      ]
    },
    { page: 2, items: Array(10).fill({ code: 'VOO17.5L16KGR', desc: 'تنكة زيت زيتون فرجن بلدي 17.5 ليتر (16 كيلو)', bar: '', id: '11.0', qty: '45.00', price: '9000000.0', total: '18,000,000.00' }) },
    { page: 3, items: Array(10).fill({ code: 'عرض العطاء جديد', desc: 'عرض العطاء جديد', bar: '', id: '793.0', qty: '32.00', price: '9000000.0', total: '288,000,000.00' }) },
    {
      page: 4,
      items: [
        { code: 'SEP1000GJAR510', desc: 'مرطبان مكدوس 1000غ', bar: '', id: '24.0', qty: '1.00', price: '450000.0', total: '450,000.00' },
        { code: 'SEP650GJAR509', desc: 'مرطبان مكدوس 650غ', bar: '', id: '23.0', qty: '2.00', price: '270000.0', total: '540,000.00' },
        { code: 'FVL350GJAR509', desc: 'مرطبان ورق عنب فرنسي 350غ', bar: '', id: '33.0', qty: '2.00', price: '190000.0', total: '380,000.00' },
        { code: 'ملوخية 200 غرام', desc: 'ملوخية 200 غرام', bar: '', id: '590.0', qty: '2.00', price: '240000.0', total: '480,000.00' },
        { code: 'نعنع يابس كيلو', desc: 'نعنع يابس كيلو', bar: '', id: '393.0', qty: '1.01', price: '450000.0', total: '454,500.00' },
      ]
    }
  ];

  return (
    <div className="w-full flex flex-col items-center bg-white min-h-screen">
      
      <style dangerouslySetInnerHTML={{__html: `
        .force-black { color: #000000 !important; background-color: #ffffff !important; font-weight: 700 !important; }
        @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
      `}} />

      {/* FILTERS */}
      <div className="w-full max-w-[1400px] bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6 print:hidden shadow-sm mt-2">
        <div className="flex flex-col gap-3">
          {/* Row 1 */}
          <div className="flex flex-wrap items-center gap-3 w-full">
            <select 
              className="force-black border border-slate-400 rounded p-1.5 text-[13px] min-w-[200px]"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="First Quarter">First Quarter</option>
              <option value="Second Quarter">Second Quarter</option>
              <option value="Third Quarter">Third Quarter</option>
              <option value="Fourth Quarter">Fourth Quarter</option>
              <option value="This Year">This Year</option>
              <option value="Last Year">Last Year</option>
              <option value="Date Range">Date Range</option>
              <option value="EOD Date">EOD Date</option>
              <option value="Dates">Dates</option>
            </select>

            {filterPeriod === 'Date Range' ? (
              <div className="flex items-center gap-2">
                <input type="date" className="force-black border border-slate-400 rounded p-1.5 text-[13px]" />
                <input type="date" className="force-black border border-slate-400 rounded p-1.5 text-[13px]" />
              </div>
            ) : filterPeriod === 'EOD Date' ? (
              <select className="force-black border border-slate-400 rounded p-1.5 text-[13px] min-w-[250px]">
                <option>Aug 28 2026 to Dec 10 2025</option>
              </select>
            ) : (
              <input type="text" value={getDateDisplay()} readOnly className="force-black border border-slate-400 rounded p-1.5 text-[13px] w-[250px]" />
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button onClick={() => setIsFiltered(true)} className="px-10 py-1.5 bg-[#475569] text-white rounded font-bold hover:bg-slate-700 text-[13px]">Filter Report</button>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap items-center gap-3 w-full">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-500 mb-0.5">Branch</span>
              <select 
                className="force-black border border-slate-400 rounded p-1.5 text-[13px] min-w-[200px]"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              >
                <option value="All Branches">All Branches</option>
                <option value="Zeit w zaytoun ljanoub">Zeit w zaytoun ljanoub</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 ml-auto mt-auto">
              <button onClick={() => setIsFiltered(false)} className="px-10 py-1.5 bg-[#5e3b3b] text-white rounded font-bold hover:bg-red-900 text-[13px]">Reset Filters</button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1400px] flex justify-between items-center mb-2 print:hidden">
        <h2 className="font-bold text-[16px]">Summary Of Sales By Items</h2>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setZoomLevel(p => Math.min(p + 0.1, 1.5))} className="p-2 bg-emerald-700 text-white rounded" title="Zoom In">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
          </button>
          <button onClick={() => setZoomLevel(p => Math.max(p - 0.1, 0.5))} className="p-2 bg-emerald-700 text-white rounded" title="Zoom Out">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
          </button>
          <button onClick={() => window.print()} className="px-4 py-1.5 bg-slate-700 text-white rounded text-[13px] font-bold flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print Report
          </button>
          <button className="px-4 py-1.5 bg-slate-700 text-white rounded text-[13px] font-bold flex items-center gap-2">
            Export Report
          </button>
        </div>
      </div>

      {!isFiltered ? (
        <div className="w-full max-w-[1400px] py-20 flex flex-col items-center border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 print:hidden mt-4">
           <div className="text-[40px] mb-3 opacity-40">📊</div>
           <p className="text-slate-600 font-bold text-[15px]">Select filters and click "Filter Report" to view.</p>
        </div>
      ) : (
        <div className="w-full font-sans text-black bg-slate-100 print:bg-white py-6 print:py-0 flex flex-col items-center gap-8 print:gap-0">
          
          {pages.map((pageData) => (
            <div 
              key={pageData.page} 
              className="report-wrapper relative flex flex-col bg-white p-8 shadow-lg border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 w-[794px] min-h-[1123px] page-break-after-always" 
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
            >
              
              {/* Report Title */}
              {pageData.page === 1 && (
                <div className="w-full text-center mb-4">
                  <div className="text-blue-700 font-bold text-[12px] text-left absolute top-8 left-8">Zeit w zaytoun ljanoub</div>
                  <h3 className="font-bold text-[14px]">Summary Of Sales By Items</h3>
                </div>
              )}

              {/* Page Header */}
              <div className="flex justify-between items-end text-[11px] font-bold w-full border-b-2 border-black pb-1 mb-2 mt-4">
                <div className="w-[150px] text-left">29-Aug-2026</div>
                <div className="flex-1 text-center">Year: 2026 - Month: 8</div>
                <div className="w-[150px] text-right">Page {pageData.page} of 4</div>
              </div>

              {/* Table */}
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="py-1">Product code</th>
                    <th>Description</th>
                    <th>Barcode</th>
                    <th>Product ID</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.page === 1 && (
                    <tr>
                      <td colSpan={7} className="font-bold py-1 pt-2">Branch: Zeit w zaytoun ljanoub</td>
                    </tr>
                  )}
                  {pageData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-0.5">{item.code}</td>
                      <td>{item.desc}</td>
                      <td>{item.bar}</td>
                      <td>{item.id}</td>
                      <td className="text-right">{item.qty}</td>
                      <td className="text-right">{item.price}</td>
                      <td className="text-right">{item.total}</td>
                    </tr>
                  ))}
                  
                  {/* Footer Totals */}
                  {pageData.page === 4 && (
                    <tr className="font-bold">
                      <td colSpan={4} className="text-center pt-4">Total By Branch:</td>
                      <td className="text-right pt-4">528.94</td>
                      <td className="pt-4"></td>
                      <td className="text-right pt-4">1,564,432,050.00</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Absolute Bottom Page Footer */}
              {pageData.page === 4 && (
                <div className="mt-auto w-full border-t border-black pt-2 pb-4 flex justify-between items-center text-[10px] font-bold text-black">
                  <div className="text-left w-1/3">RET_S_00184</div>
                  <div className="text-center w-1/3">Copyright © 2026 Omega Software, Inc. All Rights Reserved.</div>
                  <div className="text-right w-1/3 text-blue-700">www.omegapos.com</div>
                </div>
              )}
            </div>
          ))}
          
        </div>
      )}
    </div>
  );
};
