import React, { useState } from 'react';

export const SalesDetailsForOneSalesItemTemplate = () => {
  const [isFiltered, setIsFiltered] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filterPeriod, setFilterPeriod] = useState('This Month');
  const [branch, setBranch] = useState('Southern Olive Oil Products S.A.R.L');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ code: string; desc: string } | null>(null);

  // Lists
  const datePeriods = ["Today", "Yesterday", "This Month", "Last Month", "Date Range", "EOD Date"];
  
  const searchInventoryItems = [
    { code: "EVOO17.5L16KGR", desc: "تنكة زيت زيتون خضير بلدي 17.5 ليتر (16 كيلو)" },
    { code: "EVOO17.5L16KGWS", desc: "تنكة زيت زيتون خضير بلدي 17.5 ليتر (16 كيلو) جملة" },
    { code: "VOO17.5L16KGR", desc: "تنكة زيت زيتون فرجن بلدي 17.5 ليتر(16 كيلو)" },
    { code: "VOO17.5L16KGWS", desc: "تنكة زيت زيتون فرجن بلدي 17.5 ليتر(16 كيلو) جملة" },
    { code: "EVOO8.75L8KG", desc: "نصف تنكة زيت زيتون خضير بلدي 8.5 ليتر (8 كيلو)" },
    { code: "VOO8.75L8KGWS", desc: "نصف تنكة زيت زيتون فرجن بلدي 8.75 ليتر (8 كيلو)" }
  ];

  const handleSelectItem = (item: { code: string; desc: string }) => {
    setSelectedItem(item);
    setIsModalOpen(false);
  };

  const getDateDisplay = () => {
    switch (filterPeriod) {
      case 'Today': return '29-Aug-2026';
      case 'Yesterday': return '28-Aug-2026';
      case 'This Month': return 'Aug, 2026';
      case 'Last Month': return 'Jul, 2026';
      default: return 'Aug, 2026';
    }
  };

  // Exact 2-page filtered matrix based on images (fbd4e2, fbd8c0)
  const pagesData = [
    {
        page: 1,
        dates: [
            {
                date: "01-Aug-2026",
                rows: [
                    { inv: "102977", dt: "01-Aug-2026", ord: "", srv: "Hiba Aloulou", menu: "MAIN\nDEPARTME\nNT", qty: "1.00", bal: "1.0", tot: "12,600,000.00", ws: "1.0", cust: "null null" }
                ],
                tQty: "1.00", tTot: "12,600,000.00"
            },
            {
                date: "03-Aug-2026",
                rows: [
                    { inv: "103003", dt: "03-Aug-2026", ord: "", srv: "Hiba Aloulou", menu: "MAIN\nDEPARTME\nNT", qty: "1.00", bal: "1.0", tot: "12,600,000.00", ws: "1.0", cust: "null null" },
                    { inv: "103003", dt: "03-Aug-2026", ord: "", srv: "Hiba Aloulou", menu: "MAIN\nDEPARTME\nNT", qty: "1.00", bal: "1.0", tot: "12,600,000.00", ws: "1.0", cust: "null null" }
                ],
                tQty: "2.00", tTot: "25,200,000.00"
            },
            {
                date: "04-Aug-2026",
                rows: [
                    { inv: "103011", dt: "04-Aug-2026", ord: "", srv: "Hiba Aloulou", menu: "MAIN\nDEPARTME\nNT", qty: "1.00", bal: "1.0", tot: "12,600,000.00", ws: "1.0", cust: "null null" }
                ],
                tQty: "1.00", tTot: "12,600,000.00"
            },
            {
                date: "14-Aug-2026",
                rows: [
                    { inv: "103129", dt: "14-Aug-2026", ord: "", srv: "Hiba Aloulou", menu: "MAIN\nDEPARTME\nNT", qty: "1.00", bal: "1.0", tot: "12,600,000.00", ws: "1.0", cust: "null null" }
                ],
                tQty: "1.00", tTot: "12,600,000.00"
            },
            {
                date: "17-Aug-2026",
                rows: [
                    { inv: "103158", dt: "17-Aug-2026", ord: "", srv: "Hiba Aloulou", menu: "MAIN\nDEPARTME\nNT", qty: "1.00", bal: "1.0", tot: "12,600,000.00", ws: "1.0", cust: "null null" }
                ],
                tQty: "1.00", tTot: "12,600,000.00"
            }
        ]
    },
    {
        page: 2,
        dates: [
            {
                date: "18-Aug-2026",
                rows: [
                    { inv: "103172", dt: "18-Aug-2026", ord: "", srv: "Hiba Aloulou", menu: "MAIN\nDEPARTME\nNT", qty: "1.00", bal: "1.0", tot: "12,600,000.00", ws: "1.0", cust: "null null" }
                ],
                tQty: "1.00", tTot: "12,600,000.00"
            },
            {
                date: "21-Aug-2026",
                rows: [
                    { inv: "103201", dt: "21-Aug-2026", ord: "", srv: "Hiba Aloulou", menu: "MAIN\nDEPARTME\nNT", qty: "1.00", bal: "1.0", tot: "12,600,000.00", ws: "1.0", cust: "null null" },
                    { inv: "103210", dt: "21-Aug-2026", ord: "", srv: "Hiba Aloulou", menu: "MAIN\nDEPARTME\nNT", qty: "1.00", bal: "1.0", tot: "12,600,000.00", ws: "1.0", cust: "null null" }
                ],
                tQty: "2.00", tTot: "25,200,000.00"
            }
        ],
        itemTotalQty: "9.00",
        itemTotalAmt: "113,400,000.00",
        branchTotalQty: "9.00",
        branchTotalAmt: "113,400,000.00"
    }
  ];

  return (
    <div className="w-full flex flex-col items-center bg-white min-h-screen relative">
      
      {/* Search Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center print:hidden">
          <div className="bg-white rounded-lg shadow-2xl w-[600px] flex flex-col">
            <div className="flex justify-between items-center p-3 border-b bg-slate-50 rounded-t-lg">
              <h3 className="text-slate-600 font-bold text-[15px]">Search Inventory Item</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black font-bold text-lg">×</button>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <span className="absolute left-3 top-2 text-slate-400">🔍</span>
                <input type="text" defaultValue="تك" className="w-full border border-slate-300 rounded p-1.5 pl-9 text-[13px] force-black" />
              </div>
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="py-2 text-slate-600 font-bold w-1/3">Code</th>
                    <th className="py-2 text-slate-600 font-bold">Description</th>
                    <th className="py-2 text-slate-600 font-bold w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {searchInventoryItems.map((itm, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-blue-50 cursor-pointer" onClick={() => handleSelectItem(itm)}>
                      <td className="py-2">{itm.code}</td>
                      <td className="py-2 font-bold">{itm.desc}</td>
                      <td className="py-2 text-right">
                        <button className="text-blue-500 hover:text-blue-700 text-lg font-bold">➔</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-center mt-4">
                <div className="flex gap-1">
                  <button className="px-3 py-1 border border-slate-200 text-slate-400 bg-slate-50 text-[12px]">«</button>
                  <button className="px-3 py-1 border border-slate-200 text-blue-500 bg-white font-bold text-[12px]">1</button>
                  <button className="px-3 py-1 border border-slate-200 text-slate-400 bg-slate-50 text-[12px]">»</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
              {datePeriods.map((dp, i) => <option key={i} value={dp}>{dp}</option>)}
            </select>
            
            {filterPeriod === 'Date Range' ? (
              <div className="flex items-center gap-2">
                <input type="date" defaultValue="2026-08-28" className="force-black border border-slate-400 rounded p-1.5 text-[13px] w-[200px]" />
                <input type="date" defaultValue="2026-08-28" className="force-black border border-slate-400 rounded p-1.5 text-[13px] w-[200px]" />
              </div>
            ) : filterPeriod === 'EOD Date' ? (
              <select className="force-black border border-slate-400 rounded p-1.5 text-[13px] min-w-[250px]">
                <option>28-Aug-2026</option>
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
                className="force-black border border-slate-400 rounded p-1.5 text-[13px] w-[200px]"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              >
                <option value="All Branches">All Branches</option>
                <option value="Southern Olive Oil Products S.A.R.L">Southern Olive Oil Products S.A.R.L</option>
              </select>
            </div>
            
            <div className="flex flex-col flex-1 max-w-[400px]">
              <span className="text-[11px] font-bold text-slate-500 mb-0.5">Item</span>
              <div className="flex border border-slate-400 rounded overflow-hidden bg-white cursor-pointer" onClick={() => setIsModalOpen(true)}>
                <div className="px-3 py-1.5 bg-slate-100 border-r border-slate-300 text-slate-600 font-bold flex items-center justify-center">🔍</div>
                <input 
                  type="text" 
                  readOnly 
                  placeholder={selectedItem ? "" : "Search Item... (Leave empty for All)"} 
                  value={selectedItem ? selectedItem.desc : ''}
                  className="w-full p-1.5 text-[13px] force-black outline-none cursor-pointer" 
                />
                {selectedItem && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }} 
                    className="px-2 text-slate-400 hover:text-red-500 font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-auto mt-auto">
              <button onClick={() => {setIsFiltered(false); setSelectedItem(null);}} className="px-10 py-1.5 bg-[#5e3b3b] text-white rounded font-bold hover:bg-red-900 text-[13px]">Reset Filters</button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1400px] flex justify-between items-center mb-2 print:hidden">
        <h2 className="font-bold text-[16px]">Sales details for one sales item</h2>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setZoomLevel(p => Math.min(p + 0.1, 1.5))} className="p-2 bg-emerald-700 text-white rounded" title="Zoom In">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
          </button>
          <button onClick={() => setZoomLevel(p => Math.max(p - 0.1, 0.5))} className="p-2 bg-emerald-700 text-white rounded" title="Zoom Out">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
          </button>
          <button onClick={() => window.print()} className="px-4 py-1.5 bg-slate-700 text-white rounded text-[13px] font-bold flex items-center gap-2">
            Print Report
          </button>
          <button className="px-4 py-1.5 bg-slate-700 text-white rounded text-[13px] font-bold flex items-center gap-2">
            Export Report
          </button>
        </div>
      </div>

      {/* Only check if filtered, ignore selectedItem requirement */}
      {!isFiltered ? (
        <div className="w-full max-w-[1400px] py-20 flex flex-col items-center border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 print:hidden mt-4">
           <div className="text-[40px] mb-3 opacity-40">📊</div>
           <p className="text-slate-600 font-bold text-[15px]">Select filters and click "Filter Report" to view.</p>
        </div>
      ) : (
        <div className="w-full font-sans text-black bg-slate-100 print:bg-white py-6 print:py-0 flex flex-col items-center gap-8 print:gap-0">
          
          {pagesData.map((pageData, pageIndex) => (
            <div 
              key={pageIndex} 
              className="report-wrapper relative flex flex-col bg-white p-8 shadow-lg border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 w-[794px] min-h-[1123px] page-break-after-always" 
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
            >
              
              <div className="w-full text-center mb-4 relative">
                <div className="text-blue-700 font-bold text-[12px] text-left absolute top-0 left-0">Southern Olive Oil Products S.A.R.L</div>
                <h3 className="font-bold text-[14px]">Sales details for one sales item</h3>
              </div>

              {/* Page Header */}
              <div className="flex justify-between items-end text-[11px] font-bold w-full mb-1 mt-4">
                <div className="w-[100px] text-left">29-Aug-26</div>
                <div className="flex-1 text-center flex justify-center gap-8">
                  <span>From Date: 01-Aug-2026</span>
                  <span>To Date: 29-Aug-2026</span>
                  <span>Sales Item Id: {selectedItem ? "3" : "ALL"}</span>
                </div>
                <div className="w-[100px] text-right">Page {pageData.page} of 2</div>
              </div>

              {/* Table */}
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-y-2 border-black">
                    <th className="py-1 px-1 normal-case font-bold w-[75px]">Invoice Number</th>
                    <th className="py-1 px-1 normal-case font-bold w-[75px]">Date & Time</th>
                    <th className="py-1 px-1 normal-case font-bold w-[50px]">Order #</th>
                    <th className="py-1 px-1 normal-case font-bold w-[100px]">Server Name</th>
                    <th className="py-1 px-1 normal-case font-bold w-[100px]">Menu</th>
                    <th className="py-1 px-1 normal-case font-bold text-right w-[60px]">Quantity</th>
                    <th className="py-1 px-1 normal-case font-bold text-right w-[50px]">Balance</th>
                    <th className="py-1 px-1 normal-case font-bold text-right w-[90px]">Total Price</th>
                    <th className="py-1 px-1 normal-case font-bold text-center w-[70px]">Work Station</th>
                    <th className="py-1 px-1 normal-case font-bold text-left">Customer Name</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  
                  {/* Branch header on page 1 */}
                  {pageIndex === 0 && (
                    <>
                      <tr>
                        <td colSpan={10} className="font-bold py-1 px-1">Branch: Southern Olive Oil Products S.A.R.L</td>
                      </tr>
                      {/* CONDITIONAL ITEM NAME HEADER: Only show if an item is explicitly selected */}
                      {selectedItem && (
                        <tr>
                          <td colSpan={10} className="font-bold py-2 px-1 text-center">{selectedItem.desc}</td>
                        </tr>
                      )}
                    </>
                  )}

                  {pageData.dates.map((grp, dIdx) => (
                    <React.Fragment key={dIdx}>
                      <tr>
                        <td className="font-bold py-1 px-1">EOD DATE</td>
                        <td className="font-bold py-1 px-1">{grp.date}</td>
                        <td colSpan={8}></td>
                      </tr>
                      {grp.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="leading-none align-top">
                          <td className="py-[2px] px-1">{row.inv}</td>
                          <td className="py-[2px] px-1">{row.dt}</td>
                          <td className="py-[2px] px-1">{row.ord}</td>
                          <td className="py-[2px] px-1">{row.srv}</td>
                          <td className="py-[2px] px-1 whitespace-pre-wrap leading-tight">{row.menu}</td>
                          <td className="py-[2px] px-1 text-right">{row.qty}</td>
                          <td className="py-[2px] px-1 text-right">{row.bal}</td>
                          <td className="py-[2px] px-1 text-right">{row.tot}</td>
                          <td className="py-[2px] px-1 text-center">{row.ws}</td>
                          <td className="py-[2px] px-1 text-left">{row.cust}</td>
                        </tr>
                      ))}
                      <tr className="font-bold">
                        <td colSpan={4}></td>
                        <td className="py-1 px-1 whitespace-nowrap">Total by date</td>
                        <td className="py-1 px-1 text-right">{grp.tQty}</td>
                        <td></td>
                        <td className="py-1 px-1 text-right">{grp.tTot}</td>
                        <td colSpan={2}></td>
                      </tr>
                    </React.Fragment>
                  ))}

                  {/* Show Item Total only if a specific item is selected */}
                  {pageData.itemTotalQty && selectedItem && (
                    <tr className="font-bold">
                      <td colSpan={4}></td>
                      <td className="py-1 px-1 whitespace-nowrap">Total by sales item</td>
                      <td className="py-1 px-1 text-right">{pageData.itemTotalQty}</td>
                      <td></td>
                      <td className="py-1 px-1 text-right">{pageData.itemTotalAmt}</td>
                      <td colSpan={2}></td>
                    </tr>
                  )}
                  {pageData.branchTotalQty && (
                    <tr className="font-bold">
                      <td colSpan={4}></td>
                      <td className="py-1 px-1 whitespace-nowrap">Total by Branch</td>
                      <td className="py-1 px-1 text-right">{pageData.branchTotalQty}</td>
                      <td></td>
                      <td className="py-1 px-1 text-right">{pageData.branchTotalAmt}</td>
                      <td colSpan={2}></td>
                    </tr>
                  )}

                </tbody>
              </table>

              {/* Footer */}
              <div className="mt-auto w-full border-t-2 border-double border-black pt-2 pb-4 flex justify-between items-center text-[10px] font-bold text-black">
                <div className="text-left w-1/3">REP_S_00444</div>
                <div className="text-center w-1/3">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                <div className="text-right w-1/3 text-blue-700">www.vanguarderp.com</div>
              </div>
            </div>
          ))}
          
        </div>
      )}
    </div>
  );
};
